import random from "lodash/random";
import difference from "lodash/difference";
import {
  uniqueNamesGenerator,
  adjectives,
  animals,
} from "unique-names-generator";
import {
  BettingBet,
  BettingCall,
  BettingFold,
  BettingRaise,
  Card,
  isBettingBet,
  isBettingCall,
  isBettingFold,
  isBettingRaise,
  Suit,
  TablePosition,
} from "src/types";
import shuffle from "lodash/shuffle";
import { Player, RoundWithHiddenInfo, Session } from "src/db/schema";
import sortBy from "lodash/sortBy";
import isInteger from "lodash/isInteger";

export const DeleteRoomAfterInactivityTimeout = 1000 * 60 * 60 * 24 * 7;

export const getAvailablePort = (
  available: ReadonlyArray<number>,
  used: ReadonlyArray<number>
): number => {
  const intersection = difference(available, used);
  return intersection[random(0, intersection.length - 1)];
};

const genName = () => {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: " ",
    style: "capital",
  });
};

export const generateGuestName = (
  alreadyUsed: ReadonlyArray<string>
): string => {
  let name;
  let protection = 0;
  while (protection < 10 && name != null && !alreadyUsed.includes(name)) {
    name = genName();
    protection++;
  }

  return name ?? genName();
};

const AllCardValues: ReadonlyArray<Card["value"]> = [
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  "J",
  "Q",
  "K",
  "A",
];
const AllCardSuits: ReadonlyArray<Suit> = ["CLUB", "DIAMOND", "HEART", "SPADE"];
const UnshuffledDeck: ReadonlyArray<Card> = AllCardValues.reduce<Array<Card>>(
  (valueAcc, value) => {
    return [
      ...valueAcc,
      ...AllCardSuits.reduce<Array<Card>>(
        (suitAcc, suit) => [...suitAcc, { suit, value }],
        []
      ),
    ];
  },
  []
);

export const generateDeck = (): Array<Card> => shuffle(UnshuffledDeck);

const SeatsToOrder: { readonly [T in TablePosition]: number } = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
  SIX: 6,
  SEVEN: 7,
  EIGHT: 8,
  NINE: 9,
};
export const sortPlayersBySeat = (
  players: ReadonlyArray<Player>
): ReadonlyArray<Player> => {
  return sortBy(
    players.filter(({ tablePosition }) => tablePosition != null),
    ({ tablePosition }) => SeatsToOrder[tablePosition as TablePosition]
  );
};

// - mutates players
// - dealerPlayerId must occur in players and be seated at the table and have chips
// - bigBlind must be a multiple of 2
export const startRound = ({
  players,
  dealerPlayerId,
  bigBlind,
}: {
  players: ReadonlyArray<Player>;
  readonly dealerPlayerId: string;
  readonly bigBlind: number;
}): RoundWithHiddenInfo => {
  let deck: RoundWithHiddenInfo["deck"] = generateDeck();
  const sortedPlayers = sortPlayersBySeat(players).filter(
    ({ chips }) => chips != null && chips > 0
  );
  const hands: RoundWithHiddenInfo["hands"] = new Map(
    sortedPlayers.map(({ secretId }) => [
      secretId,
      {
        // safe cast as long as generateDeck() returns enough cards for every player
        card1: deck.pop() as Card,
        card2: deck.pop() as Card,
      },
    ])
  );

  const dealerIndex = sortedPlayers.findIndex(
    ({ publicId }) => publicId == dealerPlayerId
  );

  const nextIndex = (index: number): number =>
    index == sortedPlayers.length - 1 ? 0 : index + 1;

  const smallBlindPlayer = sortedPlayers[nextIndex(dealerIndex)];
  const bigBlindPlayer = sortedPlayers[nextIndex(nextIndex(dealerIndex))];
  const firstPlayer =
    sortedPlayers[nextIndex(nextIndex(nextIndex(dealerIndex)))];

  const smallBlindRealAmount = Math.min(
    smallBlindPlayer.chips ?? 0,
    bigBlind / 2
  );

  const bigBlindRealAmount = Math.min(bigBlindPlayer.chips ?? 0, bigBlind);

  smallBlindPlayer.chips = (smallBlindPlayer.chips ?? 0) - smallBlindRealAmount;
  bigBlindPlayer.chips = (bigBlindPlayer.chips ?? 0) - bigBlindRealAmount;

  sortedPlayers.forEach((player) => {
    const hand = hands.get(player.secretId);
    if (hand != null) {
      player.hand = hand;
    }
  });

  return {
    deck,
    dealerPlayerId,
    hands,
    foldedPlayers: [],
    pot: smallBlindRealAmount + bigBlindRealAmount,
    currentTurnPlayerId: firstPlayer.publicId,
    roundEnded: false,
    bettingRound: {
      startingPlayerId: bigBlindPlayer.publicId,
      lastRaise: bigBlind, // set to big blind regardless of whether the BB was actually paid
      lastRaiserPlayerId: bigBlindPlayer.publicId,
      potThisRound: 0,
      betsThisRound: new Map(
        sortedPlayers.map(({ publicId }) => {
          const bet = (() => {
            if (publicId == bigBlindPlayer.publicId) {
              return bigBlindRealAmount;
            }
            if (publicId == smallBlindPlayer.publicId) {
              return smallBlindRealAmount;
            }

            return null;
          })();
          return [publicId, bet];
        })
      ),
    },
  };
};

// mutates session
export const handleGameInput = ({
  session,
  publicPlayerId,
  secretPlayerId,
  input,
}: {
  session: Session;
  readonly publicPlayerId: string; // of player who did the input
  readonly secretPlayerId: string; // of player who did the input
  readonly input: BettingCall | BettingRaise | BettingBet | BettingFold;
}) => {
  if (
    session.round == null ||
    session.round.currentTurnPlayerId != publicPlayerId ||
    session.round.bettingRound == "SHOWING_SUMMARY"
  ) {
    return;
  }

  const {
    round,
    round: { bettingRound },
    bigBlind,
  } = session;

  const sortedPlayersInRound = sortPlayersBySeat(session.players).filter(
    ({ publicId }) => !round.foldedPlayers.includes(publicId)
  );

  const currentPlayerInRoundIndex = sortedPlayersInRound.findIndex(
    ({ publicId, secretId }) =>
      publicId == publicPlayerId && secretId == secretPlayerId
  );
  const currentPlayerInRound =
    currentPlayerInRoundIndex == -1
      ? undefined
      : sortedPlayersInRound[currentPlayerInRoundIndex];

  if (
    currentPlayerInRound == null ||
    currentPlayerInRound.chips == null ||
    sortedPlayersInRound.length < 2
  ) {
    return;
  }

  const nextPlayer =
    currentPlayerInRoundIndex == sortedPlayersInRound.length - 1
      ? sortedPlayersInRound[0]
      : sortedPlayersInRound[currentPlayerInRoundIndex + 1];

  const beginNextPhase = () => {
    const newSortedPlayersInRound = sortPlayersBySeat(session.players).filter(
      ({ publicId }) => !round.foldedPlayers.includes(publicId)
    );

    // everybody folded
    if (newSortedPlayersInRound.length == 1) {
      round.roundEnded = true;
      round.winner = newSortedPlayersInRound[0].publicId;
      newSortedPlayersInRound[0].chips =
        (newSortedPlayersInRound[0].chips ?? 0) + round.pot;
      return;
    }

    // finds first non-folded player starting from left of dealer
    const getNextStartingPlayer = (): Player => {
      const allSeatedPlayers = sortPlayersBySeat(session.players);
      const next = (player: Player): Player => {
        const index = allSeatedPlayers.findIndex(
          ({ publicId }) => publicId == player.publicId
        );
        const nextIndex = index == allSeatedPlayers.length - 1 ? 0 : index + 1;
        return allSeatedPlayers[nextIndex];
      };

      // assume dealer is still seated, safe since forfeiting your seat only occurs when you
      // leave the game or run out of chips, neither of which happen mid round
      const dealer = allSeatedPlayers.find(
        ({ publicId }) => publicId == round.dealerPlayerId
      ) as Player;

      let protection = 0;
      let starter = next(dealer);
      while (
        protection <= allSeatedPlayers.length + 1 &&
        !newSortedPlayersInRound.some(
          ({ publicId }) => publicId == starter.publicId
        )
      ) {
        starter = next(starter);
        protection++;
      }

      return starter;
    };

    const resetBetting = () => {
      const starter = getNextStartingPlayer();
      const unfoldedSeatedPlayers = sortPlayersBySeat(session.players).filter(
        ({ publicId }) => !round.foldedPlayers.includes(publicId)
      );
      round.bettingRound = {
        startingPlayerId: starter.publicId,
        potThisRound: 0,
        betsThisRound: new Map(
          unfoldedSeatedPlayers.map(({ publicId }) => [publicId, null])
        ),
      };
      round.currentTurnPlayerId = starter.publicId;
    };

    // finished preflop, deal the flop
    if (round.flop == null) {
      // safe to cast since the deck should have enough cards for the round
      round.flop = [
        round.deck.pop() as Card,
        round.deck.pop() as Card,
        round.deck.pop() as Card,
      ];
      resetBetting();
      return;
    }

    // finished flop, deal the turn
    if (round.turn == null) {
      round.turn = round.deck.pop();
      resetBetting();
      return;
    }

    // finished turn, deal the river
    if (round.river == null) {
      round.river = round.deck.pop();
      resetBetting();
      return;
    }

    // all betting rounds done, finish the round
    // TODO: Actually decide winner
    round.roundEnded = true;
    round.winner = newSortedPlayersInRound[0].publicId;
    round.bettingRound = "SHOWING_SUMMARY";
    newSortedPlayersInRound[0].chips =
      (newSortedPlayersInRound[0].chips ?? 0) + round.pot;
  };

  if (isBettingFold(input)) {
    round.foldedPlayers.push(publicPlayerId);
    const newSortedPlayersInRound = sortPlayersBySeat(session.players).filter(
      ({ publicId }) => !round.foldedPlayers.includes(publicId)
    );
    if (
      (bettingRound.lastRaiserPlayerId != null &&
        nextPlayer.publicId == bettingRound.lastRaiserPlayerId) ||
      (bettingRound.lastRaiserPlayerId == null &&
        nextPlayer.publicId == bettingRound.startingPlayerId) ||
      newSortedPlayersInRound.length == 1
    ) {
      beginNextPhase();
    } else {
      round.currentTurnPlayerId = nextPlayer.publicId;
    }
    return;
  }

  if (isBettingCall(input)) {
    // cannot call if no bet has been made
    if (bettingRound.currentBet == null || bettingRound.currentBet == 0) {
      return;
    }

    // cannot call if you have no chips
    if (currentPlayerInRound.chips == 0) {
      return;
    }

    const betThisRound = bettingRound.betsThisRound.get(
      currentPlayerInRound.publicId
    );

    // not existing in bettingRound.betsThisRound means the game things you've
    // folded before this betting round
    // Note: having this value be null is OK, just means you haven't bet yet this
    // betting round
    if (betThisRound === undefined) {
      return;
    }

    const targetAmount = bettingRound.currentBet;
    const realAmount = Math.min(targetAmount, currentPlayerInRound.chips);

    bettingRound.betsThisRound.set(
      currentPlayerInRound.publicId,
      (betThisRound ?? 0) + realAmount
    );
    currentPlayerInRound.chips -= realAmount;
    round.pot += realAmount;

    if (nextPlayer.publicId == bettingRound.lastRaiserPlayerId) {
      beginNextPhase();
    } else {
      round.currentTurnPlayerId = nextPlayer.publicId;
    }
    return;
  }

  if (isBettingBet(input)) {
    // cannot bet decimal amounts
    if (!isInteger(input.amount)) {
      return;
    }

    // cannot check (bet of 0) or bet if there has already been a nonzero bet,
    // in that case you can only call or raise
    if (bettingRound.currentBet != null && bettingRound.currentBet > 0) {
      return;
    }

    // cannot bet more chips than you have
    if (currentPlayerInRound.chips < input.amount) {
      return;
    }

    const betThisRound = bettingRound.betsThisRound.get(
      currentPlayerInRound.publicId
    );

    // not existing in bettingRound.betsThisRound means the game things you've
    // folded before this betting round
    // Note: having this value be null is OK, just means you haven't bet yet this
    // betting round
    if (betThisRound === undefined) {
      return;
    }

    // checking case
    if (input.amount == 0) {
      // checks all around
      if (nextPlayer.publicId == bettingRound.startingPlayerId) {
        beginNextPhase();
        return;
      }

      round.currentTurnPlayerId = nextPlayer.publicId;
      return;
    }

    // if not a check, must bet at least big blind
    if (input.amount < bigBlind) {
      return;
    }

    currentPlayerInRound.chips -= input.amount;
    round.pot += input.amount;
    bettingRound.betsThisRound.set(
      currentPlayerInRound.publicId,
      (betThisRound ?? 0) + input.amount
    );
    bettingRound.lastRaise = input.amount;
    bettingRound.lastRaiserPlayerId = publicPlayerId;
    round.currentTurnPlayerId = nextPlayer.publicId;

    return;
  }

  if (isBettingRaise(input)) {
    // cannot raise decimal amounts
    if (!isInteger(input.amount)) {
      return;
    }

    // cannot raise if a bet has not been placed
    // in that case you can only check or bet
    if (
      bettingRound.currentBet == null ||
      bettingRound.currentBet == 0 ||
      bettingRound.lastRaise == null
    ) {
      return;
    }

    // cannot raise more chips than you have
    if (currentPlayerInRound.chips < input.amount) {
      return;
    }

    // cannot raise less than last raise unless it's an all in
    if (
      input.amount != currentPlayerInRound.chips &&
      input.amount < bettingRound.lastRaise
    ) {
      return;
    }

    const betThisRound = bettingRound.betsThisRound.get(
      currentPlayerInRound.publicId
    );

    // not existing in bettingRound.betsThisRound means the game things you've
    // folded before this betting round
    // Note: having this value be null is OK, just means you haven't bet yet this
    // betting round
    if (betThisRound === undefined) {
      return;
    }

    currentPlayerInRound.chips -= input.amount;
    round.pot += input.amount;
    bettingRound.betsThisRound.set(
      currentPlayerInRound.publicId,
      (betThisRound ?? 0) + input.amount
    );
    bettingRound.lastRaise = input.amount;
    bettingRound.lastRaiserPlayerId = publicPlayerId;
    round.currentTurnPlayerId = nextPlayer.publicId;

    return;
  }
};
