import type { BookEntry, PlannedStory, TestamentId } from "../../types";

/*
 * The books of the Bible for the Journey, in the order and with the sections
 * used by most Protestant English Bibles (66 books). Only books with a unit in
 * the content pack are playable; the rest are shown as coming soon.
 */

export const bookGroups: Record<string, string> = {
  law: "The Law",
  "ot-history": "History",
  wisdom: "Poetry and Wisdom",
  "major-prophets": "Major Prophets",
  "minor-prophets": "Minor Prophets",
  gospels: "The Gospels",
  "nt-history": "History",
  paul: "Letters of Paul",
  general: "General Letters",
  prophecy: "Prophecy",
};

const list = (testament: TestamentId, group: string, entries: [string, string][]): BookEntry[] =>
  entries.map(([id, name]) => ({ id, name, testament, group }));

export const books: BookEntry[] = [
  ...list("ot", "law", [
    ["GEN", "Genesis"],
    ["EXO", "Exodus"],
    ["LEV", "Leviticus"],
    ["NUM", "Numbers"],
    ["DEU", "Deuteronomy"],
  ]),
  ...list("ot", "ot-history", [
    ["JOS", "Joshua"],
    ["JDG", "Judges"],
    ["RUT", "Ruth"],
    ["1SA", "1 Samuel"],
    ["2SA", "2 Samuel"],
    ["1KI", "1 Kings"],
    ["2KI", "2 Kings"],
    ["1CH", "1 Chronicles"],
    ["2CH", "2 Chronicles"],
    ["EZR", "Ezra"],
    ["NEH", "Nehemiah"],
    ["EST", "Esther"],
  ]),
  ...list("ot", "wisdom", [
    ["JOB", "Job"],
    ["PSA", "Psalms"],
    ["PRO", "Proverbs"],
    ["ECC", "Ecclesiastes"],
    ["SNG", "Song of Songs"],
  ]),
  ...list("ot", "major-prophets", [
    ["ISA", "Isaiah"],
    ["JER", "Jeremiah"],
    ["LAM", "Lamentations"],
    ["EZK", "Ezekiel"],
    ["DAN", "Daniel"],
  ]),
  ...list("ot", "minor-prophets", [
    ["HOS", "Hosea"],
    ["JOL", "Joel"],
    ["AMO", "Amos"],
    ["OBA", "Obadiah"],
    ["JON", "Jonah"],
    ["MIC", "Micah"],
    ["NAM", "Nahum"],
    ["HAB", "Habakkuk"],
    ["ZEP", "Zephaniah"],
    ["HAG", "Haggai"],
    ["ZEC", "Zechariah"],
    ["MAL", "Malachi"],
  ]),
  ...list("nt", "gospels", [
    ["MAT", "Matthew"],
    ["MRK", "Mark"],
    ["LUK", "Luke"],
    ["JHN", "John"],
  ]),
  ...list("nt", "nt-history", [["ACT", "Acts"]]),
  ...list("nt", "paul", [
    ["ROM", "Romans"],
    ["1CO", "1 Corinthians"],
    ["2CO", "2 Corinthians"],
    ["GAL", "Galatians"],
    ["EPH", "Ephesians"],
    ["PHP", "Philippians"],
    ["COL", "Colossians"],
    ["1TH", "1 Thessalonians"],
    ["2TH", "2 Thessalonians"],
    ["1TI", "1 Timothy"],
    ["2TI", "2 Timothy"],
    ["TIT", "Titus"],
    ["PHM", "Philemon"],
  ]),
  ...list("nt", "general", [
    ["HEB", "Hebrews"],
    ["JAS", "James"],
    ["1PE", "1 Peter"],
    ["2PE", "2 Peter"],
    ["1JN", "1 John"],
    ["2JN", "2 John"],
    ["3JN", "3 John"],
    ["JUD", "Jude"],
  ]),
  ...list("nt", "prophecy", [["REV", "Revelation"]]),
];

/**
 * The main stories of Genesis after the Creation, announced on the Genesis
 * page as coming soon. Titles and chapter ranges are the standard divisions of
 * the book; no questions exist for them yet.
 */
export const plannedStories: PlannedStory[] = [
  { bookId: "GEN", title: "Cain and Abel", passage: "Genesis 4" },
  { bookId: "GEN", title: "Noah and the Flood", passage: "Genesis 6–9" },
  { bookId: "GEN", title: "The Tower of Babel", passage: "Genesis 11" },
  { bookId: "GEN", title: "Abraham", passage: "Genesis 12–25" },
  { bookId: "GEN", title: "Jacob and Esau", passage: "Genesis 25–36" },
  { bookId: "GEN", title: "Joseph", passage: "Genesis 37–50" },
];
