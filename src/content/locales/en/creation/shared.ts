import type { BibleRef } from "../../../types";

export const TOPIC = "creation";

/** Genesis reference helper: g(2, 7) or g(1, 3, 5). */
export const g = (chapter: number, verse: number, verseEnd?: number): BibleRef =>
  verseEnd === undefined ? { book: "GEN", chapter, verse } : { book: "GEN", chapter, verse, verseEnd };
