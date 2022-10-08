import random from "lodash/random";
import difference from "lodash/difference";
import {
  uniqueNamesGenerator,
  adjectives,
  animals,
} from "unique-names-generator";
import { Card, Suit, TablePosition } from "src/types";
import shuffle from "lodash/shuffle";
import { Player } from "src/db/schema";
import sortBy from "lodash/sortBy";

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
