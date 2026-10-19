import { shuffleChanged } from "../lib/random";

export interface LetterTile {
  /** Unique per tile, so duplicate letters are separate tiles. */
  id: string;
  letter: string;
}

export function scrambleLetters(word: string, seed: string): LetterTile[] {
  const tiles = [...word].map((letter, i) => ({ id: `${i}`, letter }));
  return shuffleChanged(tiles, seed, (a, b) => a.map((t) => t.letter).join("") === b.map((t) => t.letter).join(""));
}
