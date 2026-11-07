import type { Tier } from "../content/types";
import { seededRandom, shuffleChanged } from "../lib/random";

export interface LetterTile {
  /** Unique per tile, so duplicate letters are separate tiles. */
  id: string;
  letter: string;
}

/** Extra letters mixed into the pool: none at Beginner, four at Master. */
export function decoyCount(tier: Tier): number {
  return tier - 1;
}

const ALPHABET = "ABCDEFGHIJKLMNOPRSTUVWY";

export function scrambleLetters(word: string, seed: string, decoys = 0): LetterTile[] {
  const rand = seededRandom(`${seed}:decoys`);
  const extra = Array.from({ length: decoys }, () => ALPHABET[Math.floor(rand() * ALPHABET.length)]);
  const tiles = [...word, ...extra].map((letter, i) => ({ id: `${i}`, letter }));
  // The pool must not open with the answer spelled out in order.
  return shuffleChanged(tiles, seed, (a) => a.map((t) => t.letter).join("").startsWith(word));
}
