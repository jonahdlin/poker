import { Card, Suit } from "src/types";
import {
  getStraightFlush,
  getFourOfAKind,
  getFullHouse,
  getFlush,
  getStraight,
  getThreeOfAKind,
  getTwoPair,
  getPair,
  getHighCard,
  getBestHand,
  winners,
  FeasibleCards,
  Cards5,
  Cards2,
  Cards7,
} from "./pokerHands";

const c = (value: Card["value"], suit: Suit): Card => {
  return { value, suit };
};

describe("Poker hand functions", () => {
  describe("Determining best poker hand from 2-7 cards", () => {
    describe("Straight flush", () => {
      test("Straight flush in 7 cards", () => {
        const straightFlush = getStraightFlush([
          c(10, "CLUB"),
          c("J", "DIAMOND"),
          c(4, "CLUB"),
          c("J", "CLUB"),
          c(9, "CLUB"),
          c(7, "CLUB"),
          c(8, "CLUB"),
        ]);

        expect(straightFlush).toMatchObject({
          type: "STRAIGHT_FLUSH",
          cards: [
            c("J", "CLUB"),
            c(10, "CLUB"),
            c(9, "CLUB"),
            c(8, "CLUB"),
            c(7, "CLUB"),
          ],
        });
      });

      test("Royal flush in 7 cards", () => {
        const straightFlush = getStraightFlush([
          c(10, "SPADE"),
          c("J", "DIAMOND"),
          c("A", "SPADE"),
          c(4, "SPADE"),
          c("J", "SPADE"),
          c("Q", "SPADE"),
          c("K", "SPADE"),
        ]);

        expect(straightFlush).toMatchObject({
          type: "STRAIGHT_FLUSH",
          cards: [
            c("A", "SPADE"),
            c("K", "SPADE"),
            c("Q", "SPADE"),
            c("J", "SPADE"),
            c(10, "SPADE"),
          ],
        });
      });

      test("A2345 Straight flush in 7 cards", () => {
        const straightFlush = getStraightFlush([
          c(2, "SPADE"),
          c("A", "DIAMOND"),
          c("A", "SPADE"),
          c(4, "SPADE"),
          c("Q", "HEART"),
          c(5, "SPADE"),
          c(3, "SPADE"),
        ]);

        expect(straightFlush).toMatchObject({
          type: "STRAIGHT_FLUSH",
          cards: [
            c(5, "SPADE"),
            c(4, "SPADE"),
            c(3, "SPADE"),
            c(2, "SPADE"),
            c("A", "SPADE"),
          ],
        });
      });

      test("Straight flush in 6 cards", () => {
        const straightFlush = getStraightFlush([
          c(10, "CLUB"),
          c("J", "DIAMOND"),
          c("J", "CLUB"),
          c(9, "CLUB"),
          c(7, "CLUB"),
          c(8, "CLUB"),
        ]);

        expect(straightFlush).toMatchObject({
          type: "STRAIGHT_FLUSH",
          cards: [
            c("J", "CLUB"),
            c(10, "CLUB"),
            c(9, "CLUB"),
            c(8, "CLUB"),
            c(7, "CLUB"),
          ],
        });
      });

      test("Royal flush in 6 cards", () => {
        const straightFlush = getStraightFlush([
          c(10, "SPADE"),
          c("J", "DIAMOND"),
          c("A", "SPADE"),
          c("J", "SPADE"),
          c("Q", "SPADE"),
          c("K", "SPADE"),
        ]);

        expect(straightFlush).toMatchObject({
          type: "STRAIGHT_FLUSH",
          cards: [
            c("A", "SPADE"),
            c("K", "SPADE"),
            c("Q", "SPADE"),
            c("J", "SPADE"),
            c(10, "SPADE"),
          ],
        });
      });

      test("A2345 Straight flush in 6 cards", () => {
        const straightFlush = getStraightFlush([
          c(2, "SPADE"),
          c("A", "SPADE"),
          c(4, "SPADE"),
          c("Q", "HEART"),
          c(5, "SPADE"),
          c(3, "SPADE"),
        ]);

        expect(straightFlush).toMatchObject({
          type: "STRAIGHT_FLUSH",
          cards: [
            c(5, "SPADE"),
            c(4, "SPADE"),
            c(3, "SPADE"),
            c(2, "SPADE"),
            c("A", "SPADE"),
          ],
        });
      });

      test("Straight flush in 5 cards", () => {
        const straightFlush = getStraightFlush([
          c(10, "CLUB"),
          c("J", "CLUB"),
          c(9, "CLUB"),
          c(7, "CLUB"),
          c(8, "CLUB"),
        ]);

        expect(straightFlush).toMatchObject({
          type: "STRAIGHT_FLUSH",
          cards: [
            c("J", "CLUB"),
            c(10, "CLUB"),
            c(9, "CLUB"),
            c(8, "CLUB"),
            c(7, "CLUB"),
          ],
        });
      });

      test("Royal flush in 5 cards", () => {
        const straightFlush = getStraightFlush([
          c(10, "SPADE"),
          c("A", "SPADE"),
          c("J", "SPADE"),
          c("Q", "SPADE"),
          c("K", "SPADE"),
        ]);

        expect(straightFlush).toMatchObject({
          type: "STRAIGHT_FLUSH",
          cards: [
            c("A", "SPADE"),
            c("K", "SPADE"),
            c("Q", "SPADE"),
            c("J", "SPADE"),
            c(10, "SPADE"),
          ],
        });
      });

      test("A2345 Straight flush in 5 cards", () => {
        const straightFlush = getStraightFlush([
          c(2, "SPADE"),
          c("A", "SPADE"),
          c(4, "SPADE"),
          c(5, "SPADE"),
          c(3, "SPADE"),
        ]);

        expect(straightFlush).toMatchObject({
          type: "STRAIGHT_FLUSH",
          cards: [
            c(5, "SPADE"),
            c(4, "SPADE"),
            c(3, "SPADE"),
            c(2, "SPADE"),
            c("A", "SPADE"),
          ],
        });
      });

      test("No straight flush with flush in 7 cards", () => {
        const straightFlush = getStraightFlush([
          c(2, "SPADE"),
          c("A", "DIAMOND"),
          c("A", "SPADE"),
          c(6, "SPADE"),
          c("Q", "HEART"),
          c(5, "SPADE"),
          c(3, "SPADE"),
        ]);

        expect(straightFlush).toBeNull();
      });

      test("No straight flush with straight in 7 cards", () => {
        const straightFlush = getStraightFlush([
          c(4, "SPADE"),
          c("A", "DIAMOND"),
          c("A", "SPADE"),
          c(6, "SPADE"),
          c(7, "HEART"),
          c(5, "CLUB"),
          c(3, "HEART"),
        ]);

        expect(straightFlush).toBeNull();
      });
    });

    describe("Four of a kind", () => {
      test("Four of a kind in 7 cards", () => {
        const fourOfAKind = getFourOfAKind([
          c(7, "SPADE"),
          c("J", "DIAMOND"),
          c(7, "DIAMOND"),
          c(7, "HEART"),
          c(9, "CLUB"),
          c(7, "CLUB"),
          c(8, "CLUB"),
        ]);

        expect(fourOfAKind).toMatchObject({
          type: "FOUR_OF_A_KIND",
          cards: [
            c(7, "SPADE"),
            c(7, "HEART"),
            c(7, "DIAMOND"),
            c(7, "CLUB"),
            c("J", "DIAMOND"),
          ],
        });
      });

      test("Four of a kind in 6 cards", () => {
        const fourOfAKind = getFourOfAKind([
          c(7, "CLUB"),
          c("Q", "DIAMOND"),
          c("A", "DIAMOND"),
          c("A", "CLUB"),
          c("A", "HEART"),
          c("A", "SPADE"),
        ]);

        expect(fourOfAKind).toMatchObject({
          type: "FOUR_OF_A_KIND",
          cards: [
            c("A", "SPADE"),
            c("A", "HEART"),
            c("A", "DIAMOND"),
            c("A", "CLUB"),
            c("Q", "DIAMOND"),
          ],
        });
      });

      test("Four of a kind in 5 cards", () => {
        const fourOfAKind = getFourOfAKind([
          c(7, "CLUB"),
          c("A", "DIAMOND"),
          c("A", "CLUB"),
          c("A", "HEART"),
          c("A", "SPADE"),
        ]);

        expect(fourOfAKind).toMatchObject({
          type: "FOUR_OF_A_KIND",
          cards: [
            c("A", "SPADE"),
            c("A", "HEART"),
            c("A", "DIAMOND"),
            c("A", "CLUB"),
            c(7, "CLUB"),
          ],
        });
      });

      test("Four of a kind in 4 cards", () => {
        const fourOfAKind = getFourOfAKind([
          c("A", "DIAMOND"),
          c("A", "CLUB"),
          c("A", "HEART"),
          c("A", "SPADE"),
        ]);

        expect(fourOfAKind).toMatchObject({
          type: "FOUR_OF_A_KIND",
          cards: [
            c("A", "SPADE"),
            c("A", "HEART"),
            c("A", "DIAMOND"),
            c("A", "CLUB"),
          ],
        });
      });

      test("No four of a kind in 7 cards", () => {
        const fourOfAKind = getFourOfAKind([
          c("A", "DIAMOND"),
          c("A", "CLUB"),
          c("J", "HEART"),
          c("A", "HEART"),
          c(4, "CLUB"),
          c("K", "SPADE"),
          c("K", "SPADE"),
        ]);

        expect(fourOfAKind).toBeNull();
      });
    });

    describe("Full house", () => {
      test("Full house in 7 cards, 3 of a kind goes first even if value smaller", () => {
        const fullHouse = getFullHouse([
          c(7, "SPADE"),
          c("J", "DIAMOND"),
          c(7, "DIAMOND"),
          c(7, "HEART"),
          c(9, "CLUB"),
          c(8, "HEART"),
          c(8, "CLUB"),
        ]);

        expect(fullHouse).toMatchObject({
          type: "FULL_HOUSE",
          cards: [
            c(7, "SPADE"),
            c(7, "HEART"),
            c(7, "DIAMOND"),
            c(8, "HEART"),
            c(8, "CLUB"),
          ],
        });
      });

      test("Full house in 7 cards, 3 of a kind goes first even if value bigger", () => {
        const fullHouse = getFullHouse([
          c(10, "SPADE"),
          c("J", "DIAMOND"),
          c(10, "DIAMOND"),
          c(10, "HEART"),
          c(9, "CLUB"),
          c(8, "HEART"),
          c(8, "CLUB"),
        ]);

        expect(fullHouse).toMatchObject({
          type: "FULL_HOUSE",
          cards: [
            c(10, "SPADE"),
            c(10, "HEART"),
            c(10, "DIAMOND"),
            c(8, "HEART"),
            c(8, "CLUB"),
          ],
        });
      });

      test("Full house in 7 cards, choose highest 3 of a kind", () => {
        const fullHouse = getFullHouse([
          c(9, "HEART"),
          c("J", "DIAMOND"),
          c(10, "DIAMOND"),
          c(10, "HEART"),
          c(9, "CLUB"),
          c(10, "SPADE"),
          c(9, "CLUB"),
        ]);

        expect(fullHouse).toMatchObject({
          type: "FULL_HOUSE",
          cards: [
            c(10, "SPADE"),
            c(10, "HEART"),
            c(10, "DIAMOND"),
            c(9, "HEART"),
            c(9, "CLUB"),
          ],
        });
      });

      test("Full house in 7 cards, choose highest pair", () => {
        const fullHouse = getFullHouse([
          c("J", "HEART"),
          c("J", "DIAMOND"),
          c(10, "DIAMOND"),
          c(10, "HEART"),
          c(9, "CLUB"),
          c(10, "SPADE"),
          c(9, "CLUB"),
        ]);

        expect(fullHouse).toMatchObject({
          type: "FULL_HOUSE",
          cards: [
            c(10, "SPADE"),
            c(10, "HEART"),
            c(10, "DIAMOND"),
            c("J", "HEART"),
            c("J", "DIAMOND"),
          ],
        });
      });

      test("Full house in 6 cards", () => {
        const fullHouse = getFullHouse([
          c(10, "HEART"),
          c("J", "HEART"),
          c(10, "DIAMOND"),
          c("J", "DIAMOND"),
          c(10, "SPADE"),
          c(9, "CLUB"),
        ]);

        expect(fullHouse).toMatchObject({
          type: "FULL_HOUSE",
          cards: [
            c(10, "SPADE"),
            c(10, "HEART"),
            c(10, "DIAMOND"),
            c("J", "HEART"),
            c("J", "DIAMOND"),
          ],
        });
      });

      test("Full house in 5 cards", () => {
        const fullHouse = getFullHouse([
          c(2, "DIAMOND"),
          c(10, "HEART"),
          c(2, "HEART"),
          c(10, "DIAMOND"),
          c(10, "SPADE"),
        ]);

        expect(fullHouse).toMatchObject({
          type: "FULL_HOUSE",
          cards: [
            c(10, "SPADE"),
            c(10, "HEART"),
            c(10, "DIAMOND"),
            c(2, "HEART"),
            c(2, "DIAMOND"),
          ],
        });
      });

      test("No full house in 7 cards", () => {
        const fullHouse = getFullHouse([
          c("J", "HEART"),
          c("J", "DIAMOND"),
          c(10, "DIAMOND"),
          c("A", "HEART"),
          c(9, "CLUB"),
          c(10, "SPADE"),
          c(9, "CLUB"),
        ]);

        expect(fullHouse).toBeNull();
      });
    });

    describe("Flush", () => {
      test("Flush in 7 cards of same suit, highest 5 are chosen", () => {
        const flush = getFlush([
          c(7, "SPADE"),
          c("J", "SPADE"),
          c(2, "SPADE"),
          c("A", "SPADE"),
          c(4, "SPADE"),
          c(6, "SPADE"),
          c(10, "SPADE"),
        ]);

        expect(flush).toMatchObject({
          type: "FLUSH",
          cards: [
            c("A", "SPADE"),
            c("J", "SPADE"),
            c(10, "SPADE"),
            c(7, "SPADE"),
            c(6, "SPADE"),
          ],
        });
      });

      test("Flush in 7 cards, 5 matching are chosen", () => {
        const flush = getFlush([
          c(9, "CLUB"),
          c("J", "SPADE"),
          c(2, "DIAMOND"),
          c("A", "SPADE"),
          c(4, "SPADE"),
          c(6, "SPADE"),
          c(10, "SPADE"),
        ]);

        expect(flush).toMatchObject({
          type: "FLUSH",
          cards: [
            c("A", "SPADE"),
            c("J", "SPADE"),
            c(10, "SPADE"),
            c(6, "SPADE"),
            c(4, "SPADE"),
          ],
        });
      });

      test("Flush in 6 cards, 5 matching are chosen", () => {
        const flush = getFlush([
          c(9, "CLUB"),
          c("J", "SPADE"),
          c("A", "SPADE"),
          c(4, "SPADE"),
          c(6, "SPADE"),
          c(10, "SPADE"),
        ]);

        expect(flush).toMatchObject({
          type: "FLUSH",
          cards: [
            c("A", "SPADE"),
            c("J", "SPADE"),
            c(10, "SPADE"),
            c(6, "SPADE"),
            c(4, "SPADE"),
          ],
        });
      });

      test("Flush in 5 cards", () => {
        const flush = getFlush([
          c("J", "SPADE"),
          c("A", "SPADE"),
          c(4, "SPADE"),
          c(6, "SPADE"),
          c(10, "SPADE"),
        ]);

        expect(flush).toMatchObject({
          type: "FLUSH",
          cards: [
            c("A", "SPADE"),
            c("J", "SPADE"),
            c(10, "SPADE"),
            c(6, "SPADE"),
            c(4, "SPADE"),
          ],
        });
      });

      test("No flush in 7 cards", () => {
        const flush = getFlush([
          c(7, "SPADE"),
          c("J", "SPADE"),
          c(2, "DIAMOND"),
          c("A", "SPADE"),
          c(4, "SPADE"),
          c(6, "DIAMOND"),
          c(10, "DIAMOND"),
        ]);

        expect(flush).toBeNull();
      });
    });

    describe("Straight", () => {
      test("7 card straight in 7 cards, ace high straight is chosen", () => {
        const straight = getStraight([
          c(8, "CLUB"),
          c("J", "SPADE"),
          c("Q", "DIAMOND"),
          c("A", "SPADE"),
          c(9, "DIAMOND"),
          c("K", "HEART"),
          c(10, "SPADE"),
        ]);

        expect(straight).toMatchObject({
          type: "STRAIGHT",
          cards: [
            c("A", "SPADE"),
            c("K", "HEART"),
            c("Q", "DIAMOND"),
            c("J", "SPADE"),
            c(10, "SPADE"),
          ],
        });
      });

      test("7 card straight with A2345 in 7 cards, 7 high straight is chosen", () => {
        const straight = getStraight([
          c(4, "CLUB"),
          c(7, "SPADE"),
          c(6, "DIAMOND"),
          c("A", "SPADE"),
          c(2, "DIAMOND"),
          c(3, "HEART"),
          c(5, "SPADE"),
        ]);

        expect(straight).toMatchObject({
          type: "STRAIGHT",
          cards: [
            c(7, "SPADE"),
            c(6, "DIAMOND"),
            c(5, "SPADE"),
            c(4, "CLUB"),
            c(3, "HEART"),
          ],
        });
      });

      test("7 card straight in 7 cards, highest straight is chosen", () => {
        const straight = getStraight([
          c(4, "CLUB"),
          c(7, "SPADE"),
          c(6, "DIAMOND"),
          c(9, "SPADE"),
          c(8, "DIAMOND"),
          c(3, "HEART"),
          c(5, "SPADE"),
        ]);

        expect(straight).toMatchObject({
          type: "STRAIGHT",
          cards: [
            c(9, "SPADE"),
            c(8, "DIAMOND"),
            c(7, "SPADE"),
            c(6, "DIAMOND"),
            c(5, "SPADE"),
          ],
        });
      });

      test("6 card straight in 7 cards, highest straight is chosen", () => {
        const straight = getStraight([
          c(4, "CLUB"),
          c(9, "SPADE"),
          c(6, "DIAMOND"),
          c("A", "SPADE"),
          c(2, "DIAMOND"),
          c(3, "HEART"),
          c(5, "SPADE"),
        ]);

        expect(straight).toMatchObject({
          type: "STRAIGHT",
          cards: [
            c(6, "DIAMOND"),
            c(5, "SPADE"),
            c(4, "CLUB"),
            c(3, "HEART"),
            c(2, "DIAMOND"),
          ],
        });
      });

      test("A2345 straight in 7 cards", () => {
        const straight = getStraight([
          c(4, "CLUB"),
          c(9, "SPADE"),
          c("K", "DIAMOND"),
          c("A", "SPADE"),
          c(2, "DIAMOND"),
          c(3, "HEART"),
          c(5, "SPADE"),
        ]);

        expect(straight).toMatchObject({
          type: "STRAIGHT",
          cards: [
            c(5, "SPADE"),
            c(4, "CLUB"),
            c(3, "HEART"),
            c(2, "DIAMOND"),
            c("A", "SPADE"),
          ],
        });
      });

      test("10JQKA straight in 7 cards", () => {
        const straight = getStraight([
          c("J", "CLUB"),
          c(9, "SPADE"),
          c("K", "DIAMOND"),
          c("A", "SPADE"),
          c(2, "DIAMOND"),
          c("Q", "HEART"),
          c(10, "SPADE"),
        ]);

        expect(straight).toMatchObject({
          type: "STRAIGHT",
          cards: [
            c("A", "SPADE"),
            c("K", "DIAMOND"),
            c("Q", "HEART"),
            c("J", "CLUB"),
            c(10, "SPADE"),
          ],
        });
      });

      test("78910J straight in 7 cards", () => {
        const straight = getStraight([
          c("J", "CLUB"),
          c(9, "SPADE"),
          c(7, "DIAMOND"),
          c("A", "SPADE"),
          c(8, "DIAMOND"),
          c("K", "HEART"),
          c(10, "SPADE"),
        ]);

        expect(straight).toMatchObject({
          type: "STRAIGHT",
          cards: [
            c("J", "CLUB"),
            c(10, "SPADE"),
            c(9, "SPADE"),
            c(8, "DIAMOND"),
            c(7, "DIAMOND"),
          ],
        });
      });

      test("6 card straight in 6 cards, ace high straight is chosen", () => {
        const straight = getStraight([
          c("J", "SPADE"),
          c("Q", "DIAMOND"),
          c("A", "SPADE"),
          c(9, "DIAMOND"),
          c("K", "HEART"),
          c(10, "SPADE"),
        ]);

        expect(straight).toMatchObject({
          type: "STRAIGHT",
          cards: [
            c("A", "SPADE"),
            c("K", "HEART"),
            c("Q", "DIAMOND"),
            c("J", "SPADE"),
            c(10, "SPADE"),
          ],
        });
      });

      test("6 card straight with A2345 in 6 cards, 6 high straight is chosen", () => {
        const straight = getStraight([
          c(4, "CLUB"),
          c(6, "DIAMOND"),
          c("A", "SPADE"),
          c(2, "DIAMOND"),
          c(3, "HEART"),
          c(5, "SPADE"),
        ]);

        expect(straight).toMatchObject({
          type: "STRAIGHT",
          cards: [
            c(6, "DIAMOND"),
            c(5, "SPADE"),
            c(4, "CLUB"),
            c(3, "HEART"),
            c(2, "DIAMOND"),
          ],
        });
      });

      test("A2345 straight in 6 cards", () => {
        const straight = getStraight([
          c(4, "CLUB"),
          c("K", "DIAMOND"),
          c("A", "SPADE"),
          c(2, "DIAMOND"),
          c(3, "HEART"),
          c(5, "SPADE"),
        ]);

        expect(straight).toMatchObject({
          type: "STRAIGHT",
          cards: [
            c(5, "SPADE"),
            c(4, "CLUB"),
            c(3, "HEART"),
            c(2, "DIAMOND"),
            c("A", "SPADE"),
          ],
        });
      });

      test("10JQKA straight in 6 cards", () => {
        const straight = getStraight([
          c("J", "CLUB"),
          c("K", "DIAMOND"),
          c("A", "SPADE"),
          c(2, "DIAMOND"),
          c("Q", "HEART"),
          c(10, "SPADE"),
        ]);

        expect(straight).toMatchObject({
          type: "STRAIGHT",
          cards: [
            c("A", "SPADE"),
            c("K", "DIAMOND"),
            c("Q", "HEART"),
            c("J", "CLUB"),
            c(10, "SPADE"),
          ],
        });
      });

      test("78910J straight in 6 cards", () => {
        const straight = getStraight([
          c("J", "CLUB"),
          c(9, "SPADE"),
          c(7, "DIAMOND"),
          c(8, "DIAMOND"),
          c("K", "HEART"),
          c(10, "SPADE"),
        ]);

        expect(straight).toMatchObject({
          type: "STRAIGHT",
          cards: [
            c("J", "CLUB"),
            c(10, "SPADE"),
            c(9, "SPADE"),
            c(8, "DIAMOND"),
            c(7, "DIAMOND"),
          ],
        });
      });

      test("A2345 straight in 5 cards", () => {
        const straight = getStraight([
          c(4, "CLUB"),
          c("A", "SPADE"),
          c(2, "DIAMOND"),
          c(3, "HEART"),
          c(5, "SPADE"),
        ]);

        expect(straight).toMatchObject({
          type: "STRAIGHT",
          cards: [
            c(5, "SPADE"),
            c(4, "CLUB"),
            c(3, "HEART"),
            c(2, "DIAMOND"),
            c("A", "SPADE"),
          ],
        });
      });

      test("10JQKA straight in 5 cards", () => {
        const straight = getStraight([
          c("J", "CLUB"),
          c("K", "DIAMOND"),
          c("A", "SPADE"),
          c("Q", "HEART"),
          c(10, "SPADE"),
        ]);

        expect(straight).toMatchObject({
          type: "STRAIGHT",
          cards: [
            c("A", "SPADE"),
            c("K", "DIAMOND"),
            c("Q", "HEART"),
            c("J", "CLUB"),
            c(10, "SPADE"),
          ],
        });
      });

      test("78910J straight in 5 cards", () => {
        const straight = getStraight([
          c("J", "CLUB"),
          c(9, "SPADE"),
          c(7, "DIAMOND"),
          c(8, "DIAMOND"),
          c(10, "SPADE"),
        ]);

        expect(straight).toMatchObject({
          type: "STRAIGHT",
          cards: [
            c("J", "CLUB"),
            c(10, "SPADE"),
            c(9, "SPADE"),
            c(8, "DIAMOND"),
            c(7, "DIAMOND"),
          ],
        });
      });

      test("No straight in 7 cards", () => {
        const straight = getStraight([
          c(8, "CLUB"),
          c("J", "SPADE"),
          c("Q", "DIAMOND"),
          c("A", "SPADE"),
          c(9, "DIAMOND"),
          c("K", "HEART"),
          c(7, "SPADE"),
        ]);

        expect(straight).toBeNull();
      });

      test("JQKA234 is not a straight", () => {
        const straight = getStraight([
          c(4, "CLUB"),
          c(3, "DIAMOND"),
          c(2, "SPADE"),
          c("J", "SPADE"),
          c("Q", "DIAMOND"),
          c("K", "HEART"),
          c("A", "SPADE"),
        ]);

        expect(straight).toBeNull();
      });
    });

    describe("Three of a kind", () => {
      test("Three of a kind in 7 cards", () => {
        const threeOfAKind = getThreeOfAKind([
          c(7, "SPADE"),
          c("J", "DIAMOND"),
          c(7, "DIAMOND"),
          c(7, "HEART"),
          c(9, "CLUB"),
          c("A", "CLUB"),
          c(8, "CLUB"),
        ]);

        expect(threeOfAKind).toMatchObject({
          type: "THREE_OF_A_KIND",
          cards: [
            c(7, "SPADE"),
            c(7, "HEART"),
            c(7, "DIAMOND"),
            c("A", "CLUB"),
            c("J", "DIAMOND"),
          ],
        });
      });

      test("Three of a kind in 6 cards", () => {
        const threeOfAKind = getThreeOfAKind([
          c(7, "SPADE"),
          c("A", "DIAMOND"),
          c("A", "HEART"),
          c(9, "CLUB"),
          c("A", "CLUB"),
          c(8, "CLUB"),
        ]);

        expect(threeOfAKind).toMatchObject({
          type: "THREE_OF_A_KIND",
          cards: [
            c("A", "HEART"),
            c("A", "DIAMOND"),
            c("A", "CLUB"),
            c(9, "CLUB"),
            c(8, "CLUB"),
          ],
        });
      });

      test("Three of a kind in 5 cards", () => {
        const threeOfAKind = getThreeOfAKind([
          c(2, "SPADE"),
          c(6, "DIAMOND"),
          c(6, "HEART"),
          c(6, "CLUB"),
          c(8, "CLUB"),
        ]);

        expect(threeOfAKind).toMatchObject({
          type: "THREE_OF_A_KIND",
          cards: [
            c(6, "HEART"),
            c(6, "DIAMOND"),
            c(6, "CLUB"),
            c(8, "CLUB"),
            c(2, "SPADE"),
          ],
        });
      });

      test("Three of a kind in 4 cards", () => {
        const threeOfAKind = getThreeOfAKind([
          c(2, "SPADE"),
          c(6, "DIAMOND"),
          c(6, "HEART"),
          c(6, "CLUB"),
        ]);

        expect(threeOfAKind).toMatchObject({
          type: "THREE_OF_A_KIND",
          cards: [c(6, "HEART"), c(6, "DIAMOND"), c(6, "CLUB"), c(2, "SPADE")],
        });
      });

      test("Three of a kind in 3 cards", () => {
        const threeOfAKind = getThreeOfAKind([
          c(6, "SPADE"),
          c(6, "HEART"),
          c(6, "CLUB"),
        ]);

        expect(threeOfAKind).toMatchObject({
          type: "THREE_OF_A_KIND",
          cards: [c(6, "SPADE"), c(6, "HEART"), c(6, "CLUB")],
        });
      });

      test("No three of a kind in 7 cards", () => {
        const threeOfAKind = getThreeOfAKind([
          c(6, "SPADE"),
          c(6, "HEART"),
          c(7, "CLUB"),
          c(7, "SPADE"),
          c("A", "SPADE"),
          c("A", "CLUB"),
          c(2, "CLUB"),
        ]);

        expect(threeOfAKind).toBeNull();
      });
    });

    describe("Two pair", () => {
      test("Three pairs in 7 cards, best 2 are chosen", () => {
        const twoPair = getTwoPair([
          c(7, "SPADE"),
          c(9, "CLUB"),
          c("J", "DIAMOND"),
          c(7, "DIAMOND"),
          c(9, "HEART"),
          c("A", "CLUB"),
          c("A", "SPADE"),
        ]);

        expect(twoPair).toMatchObject({
          type: "TWO_PAIR",
          cards: [
            c("A", "SPADE"),
            c("A", "CLUB"),
            c(9, "HEART"),
            c(9, "CLUB"),
            c("J", "DIAMOND"),
          ],
        });
      });

      test("Three pairs in 7 cards, best 2 are chosen, kicker can be in last pair", () => {
        const twoPair = getTwoPair([
          c(7, "SPADE"),
          c(9, "CLUB"),
          c(2, "DIAMOND"),
          c(7, "DIAMOND"),
          c(9, "HEART"),
          c("A", "CLUB"),
          c("A", "SPADE"),
        ]);

        expect(twoPair).toMatchObject({
          type: "TWO_PAIR",
          cards: [
            c("A", "SPADE"),
            c("A", "CLUB"),
            c(9, "HEART"),
            c(9, "CLUB"),
            c(7, "SPADE"),
          ],
        });
      });

      test("Two pairs in 7 cards, best kicker chosen", () => {
        const twoPair = getTwoPair([
          c(7, "SPADE"),
          c(9, "CLUB"),
          c(2, "DIAMOND"),
          c("A", "CLUB"),
          c(7, "DIAMOND"),
          c(3, "HEART"),
          c("A", "SPADE"),
        ]);

        expect(twoPair).toMatchObject({
          type: "TWO_PAIR",
          cards: [
            c("A", "SPADE"),
            c("A", "CLUB"),
            c(7, "SPADE"),
            c(7, "DIAMOND"),
            c(9, "CLUB"),
          ],
        });
      });

      test("Two pairs in 6 cards, best kicker chosen", () => {
        const twoPair = getTwoPair([
          c(7, "SPADE"),
          c(2, "DIAMOND"),
          c("A", "CLUB"),
          c(7, "DIAMOND"),
          c(3, "HEART"),
          c("A", "SPADE"),
        ]);

        expect(twoPair).toMatchObject({
          type: "TWO_PAIR",
          cards: [
            c("A", "SPADE"),
            c("A", "CLUB"),
            c(7, "SPADE"),
            c(7, "DIAMOND"),
            c(3, "HEART"),
          ],
        });
      });

      test("Two pairs in 5 cards", () => {
        const twoPair = getTwoPair([
          c(7, "SPADE"),
          c(2, "DIAMOND"),
          c("A", "CLUB"),
          c(7, "DIAMOND"),
          c("A", "SPADE"),
        ]);

        expect(twoPair).toMatchObject({
          type: "TWO_PAIR",
          cards: [
            c("A", "SPADE"),
            c("A", "CLUB"),
            c(7, "SPADE"),
            c(7, "DIAMOND"),
            c(2, "DIAMOND"),
          ],
        });
      });

      test("No result when one pair in 5 cards", () => {
        const twoPair = getTwoPair([
          c(7, "SPADE"),
          c(2, "DIAMOND"),
          c("A", "CLUB"),
          c(7, "DIAMOND"),
          c("J", "SPADE"),
        ]);

        expect(twoPair).toBeNull();
      });

      test("No result with just one pair in 7 cards", () => {
        const twoPair = getTwoPair([
          c(10, "SPADE"),
          c(9, "CLUB"),
          c(2, "DIAMOND"),
          c(7, "DIAMOND"),
          c(9, "HEART"),
          c("A", "CLUB"),
          c("J", "SPADE"),
        ]);

        expect(twoPair).toBeNull();
      });

      test("No result when no pairs in 7 cards", () => {
        const twoPair = getTwoPair([
          c(10, "SPADE"),
          c(9, "CLUB"),
          c(2, "DIAMOND"),
          c(7, "DIAMOND"),
          c(2, "HEART"),
          c("A", "CLUB"),
          c("J", "SPADE"),
        ]);

        expect(twoPair).toBeNull();
      });
    });

    describe("Pair", () => {
      test("One pair in 7 cards, best kickers chosen", () => {
        const pair = getPair([
          c(7, "SPADE"),
          c(9, "CLUB"),
          c("J", "DIAMOND"),
          c(7, "DIAMOND"),
          c(3, "HEART"),
          c("Q", "CLUB"),
          c("A", "SPADE"),
        ]);

        expect(pair).toMatchObject({
          type: "PAIR",
          cards: [
            c(7, "SPADE"),
            c(7, "DIAMOND"),
            c("A", "SPADE"),
            c("Q", "CLUB"),
            c("J", "DIAMOND"),
          ],
        });
      });

      test("One pair in 6 cards, best kickers chosen", () => {
        const pair = getPair([
          c(7, "SPADE"),
          c(5, "CLUB"),
          c(7, "DIAMOND"),
          c(3, "HEART"),
          c("Q", "CLUB"),
          c("A", "SPADE"),
        ]);

        expect(pair).toMatchObject({
          type: "PAIR",
          cards: [
            c(7, "SPADE"),
            c(7, "DIAMOND"),
            c("A", "SPADE"),
            c("Q", "CLUB"),
            c(5, "CLUB"),
          ],
        });
      });

      test("One pair in 5 cards", () => {
        const pair = getPair([
          c(5, "CLUB"),
          c("A", "DIAMOND"),
          c(3, "HEART"),
          c("Q", "CLUB"),
          c("A", "SPADE"),
        ]);

        expect(pair).toMatchObject({
          type: "PAIR",
          cards: [
            c("A", "SPADE"),
            c("A", "DIAMOND"),
            c("Q", "CLUB"),
            c(5, "CLUB"),
            c(3, "HEART"),
          ],
        });
      });

      test("One pair in 4 cards", () => {
        const pair = getPair([
          c(5, "CLUB"),
          c(3, "HEART"),
          c("Q", "CLUB"),
          c("Q", "DIAMOND"),
        ]);

        expect(pair).toMatchObject({
          type: "PAIR",
          cards: [
            c("Q", "DIAMOND"),
            c("Q", "CLUB"),
            c(5, "CLUB"),
            c(3, "HEART"),
          ],
        });
      });

      test("One pair in 3 cards", () => {
        const pair = getPair([c(5, "CLUB"), c("Q", "CLUB"), c("Q", "DIAMOND")]);

        expect(pair).toMatchObject({
          type: "PAIR",
          cards: [c("Q", "DIAMOND"), c("Q", "CLUB"), c(5, "CLUB")],
        });
      });

      test("One pair in 2 cards", () => {
        const pair = getPair([c("Q", "CLUB"), c("Q", "DIAMOND")]);

        expect(pair).toMatchObject({
          type: "PAIR",
          cards: [c("Q", "DIAMOND"), c("Q", "CLUB")],
        });
      });

      test("No result when no pairs in 7 cards", () => {
        const pair = getPair([
          c(10, "SPADE"),
          c(9, "CLUB"),
          c(3, "DIAMOND"),
          c(7, "DIAMOND"),
          c(2, "HEART"),
          c("A", "CLUB"),
          c("J", "SPADE"),
        ]);

        expect(pair).toBeNull();
      });
    });

    describe("High card", () => {
      test("7 cards ordered correctly", () => {
        const highCard = getHighCard([
          c(7, "SPADE"),
          c(9, "CLUB"),
          c("J", "DIAMOND"),
          c(2, "DIAMOND"),
          c(3, "HEART"),
          c("Q", "CLUB"),
          c("A", "SPADE"),
        ]);

        expect(highCard).toMatchObject({
          type: "HIGH_CARD",
          cards: [
            c("A", "SPADE"),
            c("Q", "CLUB"),
            c("J", "DIAMOND"),
            c(9, "CLUB"),
            c(7, "SPADE"),
          ],
        });
      });

      test("6 cards ordered correctly", () => {
        const highCard = getHighCard([
          c(7, "SPADE"),
          c(9, "CLUB"),
          c(2, "DIAMOND"),
          c(3, "HEART"),
          c("Q", "CLUB"),
          c("A", "SPADE"),
        ]);

        expect(highCard).toMatchObject({
          type: "HIGH_CARD",
          cards: [
            c("A", "SPADE"),
            c("Q", "CLUB"),
            c(9, "CLUB"),
            c(7, "SPADE"),
            c(3, "HEART"),
          ],
        });
      });

      test("5 cards ordered correctly", () => {
        const highCard = getHighCard([
          c(7, "SPADE"),
          c(9, "CLUB"),
          c(2, "DIAMOND"),
          c(3, "HEART"),
          c("Q", "CLUB"),
        ]);

        expect(highCard).toMatchObject({
          type: "HIGH_CARD",
          cards: [
            c("Q", "CLUB"),
            c(9, "CLUB"),
            c(7, "SPADE"),
            c(3, "HEART"),
            c(2, "DIAMOND"),
          ],
        });
      });

      test("4 cards ordered correctly", () => {
        const highCard = getHighCard([
          c(7, "SPADE"),
          c(9, "CLUB"),
          c(3, "HEART"),
          c("Q", "CLUB"),
        ]);

        expect(highCard).toMatchObject({
          type: "HIGH_CARD",
          cards: [c("Q", "CLUB"), c(9, "CLUB"), c(7, "SPADE"), c(3, "HEART")],
        });
      });

      test("3 cards ordered correctly", () => {
        const highCard = getHighCard([
          c(7, "SPADE"),
          c(3, "HEART"),
          c("Q", "CLUB"),
        ]);

        expect(highCard).toMatchObject({
          type: "HIGH_CARD",
          cards: [c("Q", "CLUB"), c(7, "SPADE"), c(3, "HEART")],
        });
      });

      test("2 cards ordered correctly", () => {
        const highCard = getHighCard([c(7, "SPADE"), c(3, "HEART")]);

        expect(highCard).toMatchObject({
          type: "HIGH_CARD",
          cards: [c(7, "SPADE"), c(3, "HEART")],
        });
      });
    });
  });

  describe("Determining winners from set of poker hands", () => {
    describe("Two hands with a winner", () => {
      test("Straight flush beats four of a kind", () => {
        const communityCards: Cards5 = [
          c(10, "CLUB"),
          c("J", "DIAMOND"),
          c(4, "CLUB"),
          c("J", "CLUB"),
          c(7, "CLUB"),
        ];

        const hand1: Cards7 = [...communityCards, c(9, "CLUB"), c(8, "CLUB")];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [
          ...communityCards,
          c("J", "SPADE"),
          c("J", "HEART"),
        ];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
          ],
          [
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
        ]);
      });

      test("Straight flush beats worse straight flush", () => {
        const communityCards: Cards5 = [
          c(10, "CLUB"),
          c("J", "DIAMOND"),
          c(4, "CLUB"),
          c("J", "CLUB"),
          c("Q", "CLUB"),
        ];

        const hand1: Cards7 = [
          ...communityCards,
          c("A", "CLUB"),
          c("K", "CLUB"),
        ];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [...communityCards, c(9, "CLUB"), c(8, "CLUB")];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
          ],
          [
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
        ]);
      });

      test("Four of a kind beats full house", () => {
        const communityCards: Cards5 = [
          c(10, "CLUB"),
          c(10, "DIAMOND"),
          c(4, "CLUB"),
          c(10, "SPADE"),
          c(4, "DIAMOND"),
        ];

        const hand1: Cards7 = [
          ...communityCards,
          c("A", "CLUB"),
          c("K", "CLUB"),
        ];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [
          ...communityCards,
          c(10, "HEART"),
          c(2, "DIAMOND"),
        ];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
          ],
        ]);
      });

      test("Four of a kind beats four of a kind with worse kicker", () => {
        const communityCards: Cards5 = [
          c(10, "CLUB"),
          c(10, "DIAMOND"),
          c(4, "CLUB"),
          c(10, "SPADE"),
          c(10, "HEART"),
        ];

        const hand1: Cards7 = [
          ...communityCards,
          c("A", "CLUB"),
          c("K", "CLUB"),
        ];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [
          ...communityCards,
          c(3, "HEART"),
          c(2, "DIAMOND"),
        ];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
          ],
          [
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
        ]);
      });

      test("Four of a kind beats lower value four of a kind", () => {
        const communityCards: Cards5 = [
          c(10, "CLUB"),
          c(10, "DIAMOND"),
          c(5, "CLUB"),
          c(10, "SPADE"),
          c(5, "HEART"),
        ];

        const hand1: Cards7 = [
          ...communityCards,
          c(5, "SPADE"),
          c(5, "DIAMOND"),
        ];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [
          ...communityCards,
          c(3, "HEART"),
          c(10, "HEART"),
        ];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
          ],
        ]);
      });

      test("Full house beats flush", () => {
        const communityCards: Cards5 = [
          c(10, "CLUB"),
          c(10, "DIAMOND"),
          c(5, "CLUB"),
          c(6, "CLUB"),
          c("A", "CLUB"),
        ];

        const hand1: Cards7 = [
          ...communityCards,
          c(2, "HEART"),
          c("K", "CLUB"),
        ];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [
          ...communityCards,
          c(6, "SPADE"),
          c(6, "DIAMOND"),
        ];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
          ],
        ]);
      });

      test("Full house beats full house with worse three of a kind", () => {
        const communityCards: Cards5 = [
          c(10, "CLUB"),
          c(10, "DIAMOND"),
          c(5, "CLUB"),
          c(6, "CLUB"),
          c("A", "CLUB"),
        ];

        const hand1: Cards7 = [...communityCards, c(10, "HEART"), c(5, "CLUB")];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [
          ...communityCards,
          c(6, "SPADE"),
          c(6, "DIAMOND"),
        ];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
          ],
          [
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
        ]);
      });

      test("Full house beats full house with same three of a kind but worse pair", () => {
        const communityCards: Cards5 = [
          c(10, "CLUB"),
          c(10, "DIAMOND"),
          c(10, "SPADE"),
          c(6, "CLUB"),
          c("A", "CLUB"),
        ];

        const hand1: Cards7 = [
          ...communityCards,
          c("K", "HEART"),
          c("K", "CLUB"),
        ];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [
          ...communityCards,
          c("A", "SPADE"),
          c(6, "DIAMOND"),
        ];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
          ],
        ]);
      });

      test("Flush beats straight", () => {
        const communityCards: Cards5 = [
          c("J", "SPADE"),
          c(10, "DIAMOND"),
          c(10, "SPADE"),
          c(6, "SPADE"),
          c("Q", "CLUB"),
        ];

        const hand1: Cards7 = [...communityCards, c(3, "SPADE"), c(2, "SPADE")];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [
          ...communityCards,
          c("A", "SPADE"),
          c("K", "DIAMOND"),
        ];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
          ],
          [
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
        ]);
      });

      test("Flush beats worse flush", () => {
        const communityCards: Cards5 = [
          c("J", "SPADE"),
          c(3, "SPADE"),
          c(10, "SPADE"),
          c(6, "SPADE"),
          c("Q", "SPADE"),
        ];

        const hand1: Cards7 = [...communityCards, c(5, "SPADE"), c(2, "HEART")];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [
          ...communityCards,
          c("A", "DIAMOND"),
          c(2, "SPADE"),
        ];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
          ],
          [
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
        ]);
      });

      test("Straight beats three of a kind", () => {
        const communityCards: Cards5 = [
          c("J", "CLUB"),
          c("A", "DIAMOND"),
          c(10, "SPADE"),
          c(6, "DIAMOND"),
          c("Q", "HEART"),
        ];

        const hand1: Cards7 = [
          ...communityCards,
          c("K", "SPADE"),
          c(9, "HEART"),
        ];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [
          ...communityCards,
          c("A", "SPADE"),
          c("A", "HEART"),
        ];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
          ],
          [
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
        ]);
      });

      test("Straight beats worse straight", () => {
        const communityCards: Cards5 = [
          c(5, "CLUB"),
          c("J", "DIAMOND"),
          c(3, "SPADE"),
          c(4, "DIAMOND"),
          c(6, "HEART"),
        ];

        const hand1: Cards7 = [
          ...communityCards,
          c("A", "CLUB"),
          c(2, "HEART"),
        ];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [
          ...communityCards,
          c(7, "SPADE"),
          c("A", "HEART"),
        ];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
          ],
        ]);
      });

      test("Straight 23456 beats straight A2345", () => {
        const communityCards: Cards5 = [
          c(5, "CLUB"),
          c(2, "DIAMOND"),
          c(3, "SPADE"),
          c(4, "DIAMOND"),
          c(9, "HEART"),
        ];

        const hand1: Cards7 = [...communityCards, c(6, "CLUB"), c(2, "HEART")];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [
          ...communityCards,
          c(7, "SPADE"),
          c("A", "HEART"),
        ];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
          ],
          [
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
        ]);
      });

      test("Three of a kind beats two pair", () => {
        const communityCards: Cards5 = [
          c(5, "CLUB"),
          c(2, "DIAMOND"),
          c(5, "SPADE"),
          c(4, "DIAMOND"),
          c(9, "HEART"),
        ];

        const hand1: Cards7 = [
          ...communityCards,
          c(5, "CLUB"),
          c("K", "HEART"),
        ];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [
          ...communityCards,
          c("A", "SPADE"),
          c("A", "HEART"),
        ];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
          ],
          [
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
        ]);
      });

      test("Three of a kind beats worse three of a kind", () => {
        const communityCards: Cards5 = [
          c(5, "CLUB"),
          c(2, "DIAMOND"),
          c("J", "SPADE"),
          c(4, "DIAMOND"),
          c(9, "HEART"),
        ];

        const hand1: Cards7 = [
          ...communityCards,
          c(9, "CLUB"),
          c(9, "DIAMOND"),
        ];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [
          ...communityCards,
          c("J", "CLUB"),
          c("J", "HEART"),
        ];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
          ],
        ]);
      });

      test("Three of a kind beats three of a kind with worse first kicker", () => {
        const communityCards: Cards5 = [
          c(5, "CLUB"),
          c("J", "DIAMOND"),
          c("J", "SPADE"),
          c(4, "DIAMOND"),
          c(9, "HEART"),
        ];

        const hand1: Cards7 = [
          ...communityCards,
          c("J", "HEART"),
          c("A", "HEART"),
        ];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [
          ...communityCards,
          c("J", "CLUB"),
          c(2, "DIAMOND"),
        ];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
          ],
          [
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
        ]);
      });

      test("Three of a kind beats three of a kind with worse second kicker", () => {
        const communityCards: Cards5 = [
          c(5, "CLUB"),
          c("J", "DIAMOND"),
          c("J", "SPADE"),
          c(4, "DIAMOND"),
          c(9, "HEART"),
        ];

        const hand1: Cards7 = [
          ...communityCards,
          c("J", "HEART"),
          c(6, "HEART"),
        ];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [
          ...communityCards,
          c("J", "CLUB"),
          c(2, "DIAMOND"),
        ];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
          ],
          [
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
        ]);
      });

      test("Two pair beats one pair", () => {
        const communityCards: Cards5 = [
          c(5, "CLUB"),
          c("J", "DIAMOND"),
          c("J", "SPADE"),
          c(4, "DIAMOND"),
          c(9, "HEART"),
        ];

        const hand1: Cards7 = [...communityCards, c(2, "HEART"), c(9, "CLUB")];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [
          ...communityCards,
          c("A", "CLUB"),
          c("K", "DIAMOND"),
        ];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
          ],
          [
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
        ]);
      });

      test("Two pair beats two pair with worse first pair", () => {
        const communityCards: Cards5 = [
          c(5, "CLUB"),
          c("J", "DIAMOND"),
          c("A", "SPADE"),
          c(4, "DIAMOND"),
          c(9, "HEART"),
        ];

        const hand1: Cards7 = [
          ...communityCards,
          c("J", "HEART"),
          c(9, "CLUB"),
        ];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [...communityCards, c("A", "CLUB"), c(4, "CLUB")];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
          ],
        ]);
      });

      test("Two pair beats two pair with worse second pair", () => {
        const communityCards: Cards5 = [
          c(5, "CLUB"),
          c("J", "DIAMOND"),
          c("J", "SPADE"),
          c(4, "DIAMOND"),
          c(9, "HEART"),
        ];

        const hand1: Cards7 = [...communityCards, c(2, "HEART"), c(9, "CLUB")];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [
          ...communityCards,
          c("A", "CLUB"),
          c("A", "DIAMOND"),
        ];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
          ],
        ]);
      });

      test("Two pair beats two pair with worse kicker", () => {
        const communityCards: Cards5 = [
          c(5, "CLUB"),
          c("J", "DIAMOND"),
          c("J", "SPADE"),
          c(4, "DIAMOND"),
          c(9, "HEART"),
        ];

        const hand1: Cards7 = [...communityCards, c(2, "HEART"), c(9, "CLUB")];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [
          ...communityCards,
          c("A", "CLUB"),
          c(9, "DIAMOND"),
        ];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
          ],
        ]);
      });

      test("Pair beats high card", () => {
        const communityCards: Cards5 = [
          c(5, "CLUB"),
          c("J", "DIAMOND"),
          c("A", "SPADE"),
          c(4, "DIAMOND"),
          c(9, "HEART"),
        ];

        const hand1: Cards7 = [...communityCards, c(4, "HEART"), c(2, "CLUB")];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [
          ...communityCards,
          c("K", "CLUB"),
          c("Q", "DIAMOND"),
        ];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
          ],
          [
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
        ]);
      });

      test("Pair beats worse pair", () => {
        const communityCards: Cards5 = [
          c(5, "CLUB"),
          c("J", "DIAMOND"),
          c("A", "SPADE"),
          c(4, "DIAMOND"),
          c(9, "HEART"),
        ];

        const hand1: Cards7 = [
          ...communityCards,
          c("A", "HEART"),
          c(2, "CLUB"),
        ];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [
          ...communityCards,
          c("J", "CLUB"),
          c("Q", "DIAMOND"),
        ];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
          ],
          [
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
        ]);
      });

      test("Pair beats same pair with worse first kicker", () => {
        const communityCards: Cards5 = [
          c(5, "CLUB"),
          c("J", "DIAMOND"),
          c("A", "SPADE"),
          c(4, "DIAMOND"),
          c(9, "HEART"),
        ];

        const hand1: Cards7 = [
          ...communityCards,
          c("A", "HEART"),
          c(2, "CLUB"),
        ];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [
          ...communityCards,
          c("Q", "CLUB"),
          c("A", "DIAMOND"),
        ];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
          ],
        ]);
      });

      test("Pair beats same pair with worse second kicker", () => {
        const communityCards: Cards5 = [
          c(5, "CLUB"),
          c("J", "DIAMOND"),
          c("A", "SPADE"),
          c(4, "DIAMOND"),
          c(9, "HEART"),
        ];

        const hand1: Cards7 = [
          ...communityCards,
          c("A", "HEART"),
          c(2, "CLUB"),
        ];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [
          ...communityCards,
          c(10, "CLUB"),
          c("A", "DIAMOND"),
        ];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
          ],
        ]);
      });

      test("Pair beats same pair with worse third kicker", () => {
        const communityCards: Cards5 = [
          c(5, "CLUB"),
          c("J", "DIAMOND"),
          c("A", "SPADE"),
          c(4, "DIAMOND"),
          c(9, "HEART"),
        ];

        const hand1: Cards7 = [
          ...communityCards,
          c("A", "HEART"),
          c(2, "CLUB"),
        ];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [
          ...communityCards,
          c(8, "CLUB"),
          c("A", "DIAMOND"),
        ];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
          ],
        ]);
      });

      test("High card beats worse high card hand", () => {
        const communityCards: Cards5 = [
          c(5, "CLUB"),
          c("J", "DIAMOND"),
          c("A", "SPADE"),
          c(4, "DIAMOND"),
          c(9, "HEART"),
        ];

        const hand1: Cards7 = [...communityCards, c(6, "HEART"), c(2, "CLUB")];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [
          ...communityCards,
          c(8, "CLUB"),
          c("K", "DIAMOND"),
        ];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
          ],
        ]);
      });
    });

    describe("Two hands tied", () => {
      test("Straight flush ties same straight flush", () => {
        const communityCards: Cards5 = [
          c(10, "CLUB"),
          c(9, "CLUB"),
          c(8, "CLUB"),
          c("J", "CLUB"),
          c(7, "CLUB"),
        ];

        const hand1: Cards7 = [...communityCards, c(2, "CLUB"), c(6, "CLUB")];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [...communityCards, c(5, "SPADE"), c(2, "HEART")];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
        ]);
      });

      test("Four of a kind ties same four of a kind", () => {
        const communityCards: Cards5 = [
          c(10, "CLUB"),
          c(10, "SPADE"),
          c(10, "DIAMOND"),
          c(10, "HEART"),
          c(7, "CLUB"),
        ];

        const hand1: Cards7 = [...communityCards, c(2, "CLUB"), c(6, "CLUB")];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [...communityCards, c(5, "SPADE"), c(2, "HEART")];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
        ]);
      });

      test("Full house ties same full house", () => {
        const communityCards: Cards5 = [
          c(10, "CLUB"),
          c(10, "SPADE"),
          c(10, "DIAMOND"),
          c(9, "HEART"),
          c(7, "CLUB"),
        ];

        const hand1: Cards7 = [
          ...communityCards,
          c(7, "DIAMOND"),
          c(6, "CLUB"),
        ];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [...communityCards, c(7, "SPADE"), c(2, "HEART")];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
        ]);
      });

      test("Flush ties same flush", () => {
        const communityCards: Cards5 = [
          c("A", "DIAMOND"),
          c("Q", "DIAMOND"),
          c(10, "DIAMOND"),
          c(9, "DIAMOND"),
          c(7, "DIAMOND"),
        ];

        const hand1: Cards7 = [
          ...communityCards,
          c(2, "DIAMOND"),
          c("A", "CLUB"),
        ];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [
          ...communityCards,
          c(6, "DIAMOND"),
          c(2, "HEART"),
        ];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
        ]);
      });

      test("Straight ties same straight", () => {
        const communityCards: Cards5 = [
          c("A", "DIAMOND"),
          c("Q", "DIAMOND"),
          c(10, "DIAMOND"),
          c(9, "CLUB"),
          c(7, "CLUB"),
        ];

        const hand1: Cards7 = [
          ...communityCards,
          c("K", "DIAMOND"),
          c("J", "CLUB"),
        ];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [
          ...communityCards,
          c("K", "DIAMOND"),
          c("J", "HEART"),
        ];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
        ]);
      });

      test("Three of a kind ties same three of a kind", () => {
        const communityCards: Cards5 = [
          c("A", "DIAMOND"),
          c("Q", "DIAMOND"),
          c(10, "DIAMOND"),
          c(10, "CLUB"),
          c(7, "CLUB"),
        ];

        const hand1: Cards7 = [...communityCards, c(10, "HEART"), c(3, "CLUB")];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [
          ...communityCards,
          c(9, "DIAMOND"),
          c(10, "SPADE"),
        ];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
        ]);
      });

      test("Two pair ties same two pair", () => {
        const communityCards: Cards5 = [
          c("A", "DIAMOND"),
          c("Q", "DIAMOND"),
          c(10, "DIAMOND"),
          c(10, "CLUB"),
          c(7, "CLUB"),
        ];

        const hand1: Cards7 = [
          ...communityCards,
          c("A", "HEART"),
          c(3, "CLUB"),
        ];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [
          ...communityCards,
          c(9, "DIAMOND"),
          c("A", "SPADE"),
        ];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
        ]);
      });

      test("Pair ties same pair", () => {
        const communityCards: Cards5 = [
          c("A", "DIAMOND"),
          c("Q", "DIAMOND"),
          c(10, "DIAMOND"),
          c(4, "CLUB"),
          c(7, "CLUB"),
        ];

        const hand1: Cards7 = [...communityCards, c(4, "HEART"), c(3, "CLUB")];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [
          ...communityCards,
          c(4, "DIAMOND"),
          c(3, "SPADE"),
        ];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
        ]);
      });

      test("High card ties same high card", () => {
        const communityCards: Cards5 = [
          c("A", "DIAMOND"),
          c("Q", "DIAMOND"),
          c(10, "DIAMOND"),
          c(4, "CLUB"),
          c(7, "CLUB"),
        ];

        const hand1: Cards7 = [
          ...communityCards,
          c(2, "HEART"),
          c("J", "CLUB"),
        ];
        const bestHand1 = getBestHand(hand1);

        const hand2: Cards7 = [
          ...communityCards,
          c(2, "DIAMOND"),
          c("J", "SPADE"),
        ];
        const bestHand2 = getBestHand(hand2);

        const result = winners(hand1, hand2);

        expect(result).toMatchObject([
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
        ]);
      });
    });

    describe("More than two hands", () => {
      test("Straight flush vs. flush vs. straight vs. tied pairs vs. high card", () => {
        const communityCards: Cards5 = [
          c(10, "CLUB"),
          c("J", "CLUB"),
          c(4, "CLUB"),
          c("A", "HEART"),
          c(7, "CLUB"),
        ];

        // Ace pair, J, 10, 7 kickers
        const hand1: Cards7 = [
          ...communityCards,
          c("A", "HEART"),
          c(6, "DIAMOND"),
        ];
        const bestHand1 = getBestHand(hand1);

        // straight flush
        const hand2: Cards7 = [...communityCards, c(9, "CLUB"), c(8, "CLUB")];
        const bestHand2 = getBestHand(hand2);

        // K high flush (oof)
        const hand3: Cards7 = [...communityCards, c("K", "CLUB"), c(2, "CLUB")];
        const bestHand3 = getBestHand(hand3);

        // Straight
        const hand4: Cards7 = [
          ...communityCards,
          c("K", "DIAMOND"),
          c("Q", "HEART"),
        ];
        const bestHand4 = getBestHand(hand4);

        // high card
        const hand5: Cards7 = [
          ...communityCards,
          c(2, "DIAMOND"),
          c(9, "HEART"),
        ];
        const bestHand5 = getBestHand(hand5);

        // Ace pair, J, 10, 7 kickers
        const hand6: Cards7 = [
          ...communityCards,
          c("A", "DIAMOND"),
          c(2, "SPADE"),
        ];
        const bestHand6 = getBestHand(hand6);

        const result = winners(hand1, hand2, hand3, hand4, hand5, hand6);

        expect(result).toMatchObject([
          [
            {
              index: 1,
              bestHand: bestHand2,
            },
          ],
          [
            {
              index: 2,
              bestHand: bestHand3,
            },
          ],
          [
            {
              index: 3,
              bestHand: bestHand4,
            },
          ],
          [
            {
              index: 0,
              bestHand: bestHand1,
            },
            {
              index: 5,
              bestHand: bestHand6,
            },
          ],
          [
            {
              index: 4,
              bestHand: bestHand5,
            },
          ],
        ]);
      });
    });
  });
});
