import type { WhoAmIStep } from "../../../types";
import { g, TOPIC } from "./shared";

type W = Omit<WhoAmIStep, "mode" | "topicId">;

/*
 * Who Am I?, by tier. Riddles are spoken by people, places and things of
 * Genesis 1–3. Clues go from hardest to easiest; Master gives only two.
 */
const riddles: W[] = [
  // 1 Beginner
  {
    id: "creation.who.adam",
    tier: 1,
    clues: [
      { text: "I gave names to the livestock, the birds and the animals of the field.", ref: g(2, 20) },
      { text: "God put me in the garden of Eden to cultivate and keep it.", ref: g(2, 15) },
      { text: "I was formed from the dust of the ground, and God breathed the breath of life into me.", ref: g(2, 7) },
    ],
    options: ["Eve", "Adam", "The serpent", "The cherubim"],
    answer: "Adam",
    explanation: "Genesis 2 tells how God formed the man, placed him in Eden and brought the animals to him to be named. In the World English Bible he is called Adam from Genesis 3 onwards.",
    references: [g(2, 7), g(2, 15), g(2, 20)],
  },
  {
    id: "creation.who.eve",
    tier: 1,
    clues: [
      { text: "The serpent spoke to me in the garden about the tree.", ref: g(3, 1, 2) },
      { text: "I was made from a rib that God took from the man.", ref: g(2, 21, 22) },
      { text: "My husband named me because I would be the mother of all the living.", ref: g(3, 20) },
    ],
    options: ["Adam", "The serpent", "Eve", "The cherubim"],
    answer: "Eve",
    explanation: "Eve is made from the man's rib in Genesis 2, speaks with the serpent in Genesis 3, and is named in Genesis 3:20 as the mother of all the living.",
    references: [g(2, 21, 22), g(3, 1, 2), g(3, 20)],
  },
  {
    id: "creation.who.light",
    tier: 1,
    clues: [
      { text: "God saw me and saw that I was good.", ref: g(1, 4) },
      { text: "God divided me from the darkness and called me day.", ref: g(1, 4, 5) },
      { text: "I was the first thing God spoke into being.", ref: g(1, 3) },
    ],
    options: ["The expanse", "Light", "Dry land", "The stars"],
    answer: "Light",
    explanation: "Light is created on the first day by God's word, seen to be good, divided from darkness and named day.",
    references: [g(1, 3, 5)],
  },

  // 2 Explorer
  {
    id: "creation.who.serpent",
    tier: 2,
    clues: [
      { text: "I was more subtle than any animal of the field.", ref: g(3, 1) },
      { text: "I asked the woman whether God had really forbidden every tree of the garden.", ref: g(3, 1) },
      { text: "I was told I would go on my belly and eat dust all the days of my life.", ref: g(3, 14) },
    ],
    options: ["The serpent", "Adam", "Eve", "The cherubim"],
    answer: "The serpent",
    explanation: "The serpent questions God's command in Genesis 3, and God pronounces a curse on it in verse 14.",
    references: [g(3, 1), g(3, 14)],
  },
  {
    id: "creation.who.expanse",
    tier: 2,
    clues: [
      { text: "Waters are above me and waters are under me.", ref: g(1, 7) },
      { text: "I was made on the second day.", ref: g(1, 6, 8) },
      { text: "God called me sky.", ref: g(1, 8) },
    ],
    options: ["The seas", "The expanse", "Dry land", "The great lights"],
    answer: "The expanse",
    explanation: "God made the expanse to divide the waters under it from the waters above it, and called it “sky”.",
    references: [g(1, 6, 8)],
  },
  {
    id: "creation.who.knowledge-tree",
    tier: 2,
    clues: [
      { text: "The woman saw that I was a delight to the eyes.", ref: g(3, 6) },
      { text: "God told the man that in the day he ate from me he would surely die.", ref: g(2, 17) },
      { text: "My name speaks of knowing good and evil.", ref: g(2, 9) },
    ],
    options: ["The tree of life", "A fig tree", "The tree of the knowledge of good and evil", "Every tree of the garden"],
    answer: "The tree of the knowledge of good and evil",
    explanation: "This is the one tree the man is forbidden to eat from (2:17). In Genesis 3:6 the woman sees that it is a delight to the eyes and eats.",
    references: [g(2, 9), g(2, 17), g(3, 6)],
  },

  // 3 Scholar
  {
    id: "creation.who.lesser-light",
    tier: 3,
    clues: [
      { text: "God set me in the expanse of the sky to give light to the earth.", ref: g(1, 17) },
      { text: "I was made on the fourth day.", ref: g(1, 16, 19) },
      { text: "I was made to rule the night.", ref: g(1, 16) },
    ],
    options: ["The greater light", "The lesser light", "The stars", "The expanse"],
    answer: "The lesser light",
    explanation: "Genesis 1:16 makes the greater light to rule the day and the lesser light to rule the night. The first two clues fit all the lights of the fourth day.",
    references: [g(1, 16, 19)],
  },
  {
    id: "creation.who.tree-of-life",
    tier: 3,
    clues: [
      { text: "God made me grow out of the ground in the garden.", ref: g(2, 9) },
      { text: "Eating from me would let a person live forever.", ref: g(3, 22) },
      { text: "Cherubim and a flaming sword guard the way to me.", ref: g(3, 24) },
    ],
    options: ["The tree of the knowledge of good and evil", "The tree of life", "A fig tree", "The garden of Eden"],
    answer: "The tree of life",
    explanation: "The tree of life is named in Genesis 2:9. Genesis 3:22–24 explains that it would let the man live forever, and so the way to it is guarded.",
    references: [g(2, 9), g(3, 22, 24)],
  },
  {
    id: "creation.who.mist",
    tier: 3,
    clues: [
      { text: "I watered the whole surface of the ground.", ref: g(2, 6) },
      { text: "I appear before God had caused it to rain.", ref: g(2, 5, 6) },
      { text: "I went up from the earth.", ref: g(2, 6) },
    ],
    options: ["The river of Eden", "Rain", "A mist", "The waters above the expanse"],
    answer: "A mist",
    explanation: "Genesis 2:5–6: there was no rain yet, but a mist went up from the earth and watered the ground. The river of Eden waters the garden later, in verse 10.",
    references: [g(2, 5, 6), g(2, 10)],
  },

  // 4 Expert
  {
    id: "creation.who.pishon",
    tier: 4,
    clues: [
      { text: "I am one of the four rivers parted from the river of Eden.", ref: g(2, 10) },
      { text: "Bdellium and onyx stone are found in the land I flow through.", ref: g(2, 12) },
      { text: "I am named first, and I flow through the whole land of Havilah.", ref: g(2, 11) },
    ],
    options: ["Gihon", "Pishon", "Hiddekel", "Euphrates"],
    answer: "Pishon",
    explanation: "Pishon is the first river named. It flows through Havilah, the land of good gold, bdellium and onyx.",
    references: [g(2, 10, 12)],
  },
  {
    id: "creation.who.gihon",
    tier: 4,
    clues: [
      { text: "I am one of the four rivers parted from the river of Eden.", ref: g(2, 10) },
      { text: "I am the second river named.", ref: g(2, 13) },
      { text: "I flow through the whole land of Cush.", ref: g(2, 13) },
    ],
    options: ["Pishon", "Euphrates", "Gihon", "Hiddekel"],
    answer: "Gihon",
    explanation: "Genesis 2:13: the name of the second river is Gihon, which flows through the whole land of Cush.",
    references: [g(2, 10), g(2, 13)],
  },
  {
    id: "creation.who.havilah",
    tier: 4,
    clues: [
      { text: "There is gold in me, and it is good.", ref: g(2, 11, 12) },
      { text: "Bdellium and onyx stone are also found in me.", ref: g(2, 12) },
      { text: "The river Pishon flows through all of me.", ref: g(2, 11) },
    ],
    options: ["Cush", "Havilah", "Assyria", "Eden"],
    answer: "Havilah",
    explanation: "Havilah is the land of the first river, Pishon, known for its good gold, bdellium and onyx stone.",
    references: [g(2, 11, 12)],
  },

  // 5 Master
  {
    id: "creation.who.hiddekel",
    tier: 5,
    clues: [
      { text: "I am the third river named.", ref: g(2, 14) },
      { text: "I flow in front of Assyria.", ref: g(2, 14) },
    ],
    options: ["Gihon", "Euphrates", "Pishon", "Hiddekel"],
    answer: "Hiddekel",
    explanation: "Genesis 2:14 names the third river Hiddekel, flowing in front of Assyria. Many English translations call it the Tigris.",
    references: [g(2, 14)],
  },
  {
    id: "creation.who.cherubim",
    tier: 5,
    clues: [
      { text: "We were placed at the east of the garden of Eden.", ref: g(3, 24) },
      { text: "A flaming sword was placed with us to guard the way.", ref: g(3, 24) },
    ],
    options: ["The flaming sword", "The cherubim", "The serpent", "The great lights"],
    answer: "The cherubim",
    explanation: "Genesis 3:24 places both cherubim and a flaming sword east of Eden. Only the cherubim have a flaming sword placed with them.",
    references: [g(3, 24)],
  },
  {
    id: "creation.who.ground",
    tier: 5,
    clues: [
      { text: "The man was taken out of me.", ref: g(3, 19) },
      { text: "I was cursed for the man's sake and will yield thorns and thistles.", ref: g(3, 17, 18) },
    ],
    options: ["The serpent", "The garden of Eden", "The ground", "The tree of the knowledge of good and evil"],
    answer: "The ground",
    explanation: "God tells Adam the ground is cursed for his sake and will yield thorns and thistles; he was taken out of it and will return to it.",
    references: [g(3, 17, 19)],
  },
];

export const whoAmISteps: WhoAmIStep[] = riddles.map((r) => ({ ...r, mode: "who-am-i", topicId: TOPIC }));
