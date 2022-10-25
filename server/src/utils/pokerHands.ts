/* ♣ ♦ ♥ ♠ */
import {
  differenceWith,
  first,
  flatten,
  groupBy,
  sortBy,
  take,
  takeRight,
} from "lodash";
import { Card, Hand, HandQuality, HandType, Suit } from "src/types";

// ========================
// Notes
// ========================

/*

ORDERING OF CARDS
-----------------
The functions that get a poker hand from n cards return the (max) 5 cards that
make the hand in a special order. The ordering is conducive to comparing
results. The special ordering for each hand type is as follows
- Straight flush: Ordered from highest to smallest (see straight for special
                  A2345 and 10JQKA cases)
- Four of a kind: 4 cards in the set go first, followed by kicker
- Full house: 3 of a kind goes first, followed by pair
- Flush: Ordered from highest to smallest
- Straight: Ordered from highest to smallest. If the straight is A2345, then
            then the "A" is considered to have value 1, so the ordering will be
            5432A. If the straight is 10JQKA, then the "A" is considered to have
            the highest value, so the ordering will be AKQJ10.
- Three of a kind: 3 cards in the set go first, followed by kickers
- Two pair: Highest pair followed by next pair followed by kicker
- Pair: Pair followed by 3 kickers ordered from highest to lowest
- High card: Cards ordered from highest to lowest value
Anytime 2 or more of the same value card appear next to each other (e.g. a 3 of
a kind), they are ordered by suit purely for consistency. The ordering is
arbitrary but fixed, going spades, hearts, diamonds, clubs from highest to
lowest.

UNDEFINED BEHAVIOURS
--------------------
The functions that get a poker hand from n cards assume that all better hands
have already been checked for, and one's behaviour is undefined called with a
hand that is better than what it is checking for.
For example, getThreeOfAKind has undefined behaviour when called with a set of
cards that has a four of a kind in it. It may return 3 cards from the 4 of a 
kind or it may decide there is no 3 of a kind.

*/

// ========================
// Types
// ========================
type Cards2 = readonly [Card, Card];
type Cards3 = readonly [Card, Card, Card];
type Cards4 = readonly [Card, Card, Card, Card];
type Cards5 = readonly [Card, Card, Card, Card, Card];
type Cards6 = readonly [Card, Card, Card, Card, Card, Card];
type Cards7 = readonly [Card, Card, Card, Card, Card, Card, Card];
type FeasibleCards = Cards2 | Cards3 | Cards4 | Cards5 | Cards6 | Cards7;
const isCards2 = (arg: ReadonlyArray<Card>): arg is Cards2 => {
  return arg.length === 2;
};
const isCards3 = (arg: ReadonlyArray<Card>): arg is Cards3 => {
  return arg.length === 3;
};
const isCards4 = (arg: ReadonlyArray<Card>): arg is Cards4 => {
  return arg.length === 4;
};
const isCards5 = (arg: ReadonlyArray<Card>): arg is Cards5 => {
  return arg.length === 5;
};
const isCards6 = (arg: ReadonlyArray<Card>): arg is Cards6 => {
  return arg.length === 6;
};
const isCards7 = (arg: ReadonlyArray<Card>): arg is Cards7 => {
  return arg.length === 7;
};
const isCardsGtEq5 = (
  arg: ReadonlyArray<Card>
): arg is Cards5 | Cards6 | Cards7 => {
  return isCards5(arg) || isCards6(arg) || isCards7(arg);
};
const isCardsGtEq4 = (
  arg: ReadonlyArray<Card>
): arg is Cards4 | Cards5 | Cards6 | Cards7 => {
  return isCardsGtEq5(arg) || isCards4(arg);
};
const isCardsGtEq3 = (
  arg: ReadonlyArray<Card>
): arg is Cards3 | Cards4 | Cards5 | Cards6 | Cards7 => {
  return isCardsGtEq4(arg) || isCards3(arg);
};

// ========================
// Utility
// ========================
const SuitsInOrder: ReadonlyArray<Suit> = ["SPADE", "HEART", "DIAMOND", "CLUB"];
const SuitOrder: { readonly [T in Suit]: number } = {
  SPADE: SuitsInOrder.indexOf("SPADE"),
  HEART: SuitsInOrder.indexOf("HEART"),
  DIAMOND: SuitsInOrder.indexOf("DIAMOND"),
  CLUB: SuitsInOrder.indexOf("CLUB"),
};

// 1 is a special case for computation of straights with the "low" ace
const ValueOrder: { readonly [T in Card["value"] | 1]: number } = {
  1: 1,
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

// e.g. [A♦, 4♥, J♦, Q♥, A♣] ==> [A♣, A♦, Q♥, J♦, 4♥]
const sortByValue = (cards: ReadonlyArray<Card>): ReadonlyArray<Card> => {
  return sortBy(
    cards,
    ({ value }) => -ValueOrder[value] * 100,
    ({ suit }) => SuitOrder[suit]
  );
};

// e.g. [A♦, 4♥, J♦, Q♥, A♣] ==> [[A♦, A♣], [Q♥], [J♦], [4♥]]
const chunkByValue = (
  cards: ReadonlyArray<Card>
): ReadonlyArray<ReadonlyArray<Card>> => {
  const grouped = groupBy(cards, "value");
  return sortBy(
    Object.keys(grouped).map((key: string) => sortByValue(grouped[key])),
    (cardGroup) => -ValueOrder[cardGroup[0].value],
    (cardGroup) => SuitOrder[cardGroup[0].suit]
  );
};

// e.g. [A♦, 4♥, J♦, Q♥, A♣] ==> [[A♣], [A♦, J♦], [Q♥], [4♥]]
const chunkBySuit = (
  cards: ReadonlyArray<Card>
): ReadonlyArray<ReadonlyArray<Card>> => {
  const groupedNonStrict = groupBy(cards, "suit");
  const grouped: { readonly [T in Suit]: ReadonlyArray<Card> } = {
    CLUB: sortByValue(groupedNonStrict.CLUB ?? []),
    SPADE: sortByValue(groupedNonStrict.SPADE ?? []),
    DIAMOND: sortByValue(groupedNonStrict.DIAMOND ?? []),
    HEART: sortByValue(groupedNonStrict.HEART ?? []),
  };

  return SuitsInOrder.reduce<ReadonlyArray<ReadonlyArray<Card>>>(
    (acc, suit) => {
      const group = grouped[suit];
      if (group.length === 0) {
        return acc;
      }
      return [...acc, group];
    },
    []
  );
};

const isEqual = (...args: readonly Card[]): boolean => {
  const isEqual2 = (a: Card, b: Card): boolean => {
    return a.suit === b.suit && a.value === b.value;
  };
  return args.reduce<boolean>((acc, card, index) => {
    if (!acc || index === args.length - 1) {
      return acc;
    }

    const next: Card = args[index + 1];
    return isEqual2(card, next);
  }, true);
};

const getExtraCards = ({
  cards,
  amount,
  cardsToExclude = [],
}: {
  readonly cards: ReadonlyArray<Card>;
  readonly amount: number;
  readonly cardsToExclude?: ReadonlyArray<Card>;
}): ReadonlyArray<Card> => {
  const selectables = differenceWith(cards, cardsToExclude, isEqual);
  const sorted = sortByValue(selectables);
  return sorted.slice(0, amount);
};

// ========================
// Best hand in n cards
// ========================
export const getStraightFlush = (
  cards: Cards5 | Cards6 | Cards7
): HandQuality<"STRAIGHT_FLUSH"> | null => {
  const chunked = chunkBySuit(cards);
  const flush = chunked.find((cardGroup) => cardGroup.length >= 5);

  if (flush === undefined || !isCardsGtEq5(flush)) {
    return null;
  }

  const straight = getStraight(flush);

  if (straight === null) {
    return null;
  }

  return {
    type: "STRAIGHT_FLUSH",
    cards: straight.cards,
  };
};

export const getFourOfAKind = (
  cards: Cards4 | Cards5 | Cards6 | Cards7
): HandQuality<"FOUR_OF_A_KIND"> | null => {
  const chunked = chunkByValue(cards);
  const highestFoak = chunked.find((cardGroup) => cardGroup.length === 4);

  if (highestFoak === undefined) {
    return null;
  }

  const rest = getExtraCards({
    cards,
    amount: 1,
    cardsToExclude: highestFoak,
  });

  return {
    type: "FOUR_OF_A_KIND",
    cards: [...highestFoak, ...rest],
  };
};

export const getFullHouse = (
  cards: Cards5 | Cards6 | Cards7
): HandQuality<"FULL_HOUSE"> | null => {
  const chunked = chunkByValue(cards);
  const highestToak = chunked.find((cardGroup) => cardGroup.length === 3);

  if (highestToak === undefined) {
    return null;
  }

  const highestPair = chunked.find(
    (cardGroup) =>
      cardGroup.length === 2 ||
      (cardGroup.length === 3 && cardGroup[0].value !== highestToak[0].value)
  );

  if (highestToak === undefined || highestPair === undefined) {
    return null;
  }

  return {
    type: "FULL_HOUSE",
    cards: [...highestToak, ...highestPair.slice(0, 2)],
  };
};

export const getFlush = (
  cards: Cards5 | Cards6 | Cards7
): HandQuality<"FLUSH"> | null => {
  const chunked = chunkBySuit(cards);
  const flush = chunked.find((cardGroup) => cardGroup.length >= 5);

  if (flush === undefined) {
    return null;
  }

  return {
    type: "FLUSH",
    cards: take(flush, 5),
  };
};

export const getStraight = (
  cards: Cards5 | Cards6 | Cards7
): HandQuality<"STRAIGHT"> | null => {
  const chunked = chunkByValue(cards);
  if (chunked.length < 5) {
    return null;
  }

  const highestSuits: Array<
    Pick<Card, "suit"> & { readonly value: Card["value"] | 1 }
  > = chunked.map((cardGroup) => cardGroup[0]);
  const highestCard = first(highestSuits);
  if (highestCard !== undefined && highestCard.value === "A") {
    // tack a fake "low ace" onto the end
    highestSuits.push({
      suit: highestCard.suit,
      value: 1,
    });
  }

  const possibleLengths = [5, 6, 7, 8];
  for (const length of possibleLengths) {
    const startIndex = length - 5;
    const endIndex = length - 1;
    if (
      highestSuits.length >= length &&
      ValueOrder[highestSuits[startIndex].value] -
        ValueOrder[highestSuits[endIndex].value] ===
        4
    ) {
      return {
        type: "STRAIGHT",
        cards: highestSuits
          .slice(startIndex, endIndex + 1)
          .map(({ suit, value }) => ({
            suit,
            value: value === 1 ? "A" : value,
          })),
      };
    }
  }

  return null;
};

export const getThreeOfAKind = (
  cards: Cards3 | Cards4 | Cards5 | Cards6 | Cards7
): HandQuality<"THREE_OF_A_KIND"> | null => {
  const chunked = chunkByValue(cards);
  const highestToak = chunked.find((cardGroup) => cardGroup.length === 3);

  if (highestToak === undefined) {
    return null;
  }

  const rest = getExtraCards({
    cards,
    amount: 2,
    cardsToExclude: highestToak,
  });

  return {
    type: "THREE_OF_A_KIND",
    cards: [...highestToak, ...rest],
  };
};

export const getTwoPair = (
  cards: Cards4 | Cards5 | Cards6 | Cards7
): HandQuality<"TWO_PAIR"> | null => {
  const chunked = chunkByValue(cards);
  const highestTwoPairs = chunked.reduce<ReadonlyArray<Cards2> | null>(
    (acc, cardGroup) => {
      if (acc !== null && acc.length === 2) {
        return acc;
      }
      if (isCards2(cardGroup)) {
        return acc === null ? [cardGroup] : [acc[0], cardGroup];
      }
      return acc;
    },
    null
  );

  if (highestTwoPairs === null || highestTwoPairs.length !== 2) {
    return null;
  }

  const cardsInPairs: ReadonlyArray<Card> = flatten(highestTwoPairs);
  const rest = getExtraCards({
    cards,
    amount: 1,
    cardsToExclude: cardsInPairs,
  });

  return {
    type: "TWO_PAIR",
    cards: [...cardsInPairs, ...rest],
  };
};

export const getPair = (
  cards: Cards2 | Cards3 | Cards4 | Cards5 | Cards6 | Cards7
): HandQuality<"PAIR"> | null => {
  const chunked = chunkByValue(cards);
  const highestPair = chunked.find((cardGroup) => cardGroup.length === 2);

  if (highestPair === undefined) {
    return null;
  }

  const rest = getExtraCards({ cards, amount: 3, cardsToExclude: highestPair });

  return {
    type: "PAIR",
    cards: [...highestPair, ...rest],
  };
};

export const getHighCard = (
  cards: Cards2 | Cards3 | Cards4 | Cards5 | Cards6 | Cards7
): HandQuality<"HIGH_CARD"> => {
  return {
    type: "HIGH_CARD",
    cards: take(sortByValue(cards), 5),
  };
};

// assumes unique cards
export const getBestHand = (cards: FeasibleCards): HandQuality<HandType> => {
  const straightFlush = isCardsGtEq5(cards) && getStraightFlush(cards);
  if (straightFlush) {
    return straightFlush;
  }

  const fourOfAKind = isCardsGtEq4(cards) && getFourOfAKind(cards);
  if (fourOfAKind) {
    return fourOfAKind;
  }

  const fullHouse = isCardsGtEq5(cards) && getFullHouse(cards);
  if (fullHouse) {
    return fullHouse;
  }

  const flush = isCardsGtEq5(cards) && getFlush(cards);
  if (flush) {
    return flush;
  }

  const straight = isCardsGtEq5(cards) && getStraight(cards);
  if (straight) {
    return straight;
  }

  const threeOfAKind = isCardsGtEq3(cards) && getThreeOfAKind(cards);
  if (threeOfAKind) {
    return threeOfAKind;
  }

  const twoPair = isCardsGtEq4(cards) && getTwoPair(cards);
  if (twoPair) {
    return twoPair;
  }

  const pair = getPair(cards);
  if (pair) {
    return pair;
  }

  return getHighCard(cards);
};

// ========================
// Winner of n hands
// ========================
// returns index of winner TODO
export const winner = (...args: ReadonlyArray<FeasibleCards>): number => {
  return 0;
};
