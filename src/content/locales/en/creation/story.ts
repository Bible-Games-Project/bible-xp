import type { StoryOrderStep } from "../../../types";
import { g, TOPIC } from "./shared";

type S = Omit<StoryOrderStep, "mode" | "topicId">;

/*
 * Put the Story in Order, by tier. Events are listed in the order the text
 * narrates them; this is narrative order, not a claim about science.
 */
const stories: S[] = [
  // 1 Beginner
  {
    id: "creation.order.week",
    tier: 1,
    prompt: "Put these moments of the creation week in order.",
    events: [
      { id: "light", label: "Light, divided from the darkness", ref: g(1, 3, 5) },
      { id: "land", label: "Dry land, plants and trees", ref: g(1, 9, 13) },
      { id: "sea", label: "Sea creatures and birds", ref: g(1, 20, 23) },
      { id: "rest", label: "God rests from all his work", ref: g(2, 2, 3) },
    ],
    explanation: "Light on the first day, land and plants on the third, sea creatures and birds on the fifth, and rest on the seventh.",
    references: [g(1, 3, 23), g(2, 2, 3)],
  },
  {
    id: "creation.order.big-picture",
    tier: 1,
    prompt: "Put these events of Genesis 2–3 in order.",
    events: [
      { id: "formed", label: "The man is formed from dust", ref: g(2, 7) },
      { id: "woman", label: "The woman is made from a rib", ref: g(2, 21, 22) },
      { id: "eat", label: "The woman and the man eat the fruit", ref: g(3, 6) },
      { id: "out", label: "They are sent out of the garden", ref: g(3, 23, 24) },
    ],
    explanation: "Genesis 2 tells of the man and the woman being made; Genesis 3 tells of the fruit being eaten and the man being sent out of Eden.",
    references: [g(2, 7), g(2, 21, 22), g(3, 6), g(3, 23, 24)],
  },

  // 2 Explorer
  {
    id: "creation.order.days",
    tier: 2,
    prompt: "Put the six days of Genesis 1 in the order the text tells them.",
    events: [
      { id: "d1", label: "Light, divided from the darkness", ref: g(1, 3, 5) },
      { id: "d2", label: "The expanse dividing the waters", ref: g(1, 6, 8) },
      { id: "d3", label: "Dry land, plants and trees", ref: g(1, 9, 13) },
      { id: "d4", label: "The great lights and the stars", ref: g(1, 14, 19) },
      { id: "d5", label: "Sea creatures and birds", ref: g(1, 20, 23) },
      { id: "d6", label: "Land animals and humankind", ref: g(1, 24, 31) },
    ],
    explanation:
      "This is the order of the six days as Genesis 1 narrates them, each closing with “There was evening and there was morning”. It follows the story's text and is not presented as a scientific timeline.",
    references: [g(1, 3, 31)],
  },
  {
    id: "creation.order.fall",
    tier: 2,
    prompt: "Put the events of Genesis 3:1–9 in order.",
    events: [
      { id: "question", label: "The serpent questions the woman", ref: g(3, 1) },
      { id: "eat", label: "The woman eats and gives to her husband", ref: g(3, 6) },
      { id: "fig", label: "They sew fig leaves together", ref: g(3, 7) },
      { id: "hide", label: "They hide among the trees", ref: g(3, 8) },
      { id: "call", label: "God calls to the man: Where are you?", ref: g(3, 9) },
    ],
    explanation: "Genesis 3:1–9 moves from the serpent's question to the eating, the opened eyes and fig leaves, the hiding, and God's call.",
    references: [g(3, 1, 9)],
  },

  // 3 Scholar
  {
    id: "creation.order.genesis2",
    tier: 3,
    prompt: "Put these events of Genesis 2 in the order the chapter tells them.",
    events: [
      { id: "form", label: "God forms the man from dust", ref: g(2, 7) },
      { id: "plant", label: "God plants a garden eastward in Eden", ref: g(2, 8) },
      { id: "river", label: "A river parts into four rivers", ref: g(2, 10) },
      { id: "command", label: "God commands the man about the tree", ref: g(2, 16, 17) },
      { id: "animals", label: "The animals are brought to be named", ref: g(2, 19, 20) },
      { id: "woman", label: "God makes the woman from a rib", ref: g(2, 21, 22) },
    ],
    explanation: "Genesis 2 forms the man, plants the garden, describes its rivers, gives the command, brings the animals, and then makes the woman.",
    references: [g(2, 7, 22)],
  },
  {
    id: "creation.order.judgment",
    tier: 3,
    prompt: "Put the end of Genesis 3 in order.",
    events: [
      { id: "serpent", label: "God speaks to the serpent", ref: g(3, 14, 15) },
      { id: "woman", label: "God speaks to the woman", ref: g(3, 16) },
      { id: "adam", label: "God speaks to Adam", ref: g(3, 17, 19) },
      { id: "eve", label: "The man names his wife Eve", ref: g(3, 20) },
      { id: "skins", label: "God makes garments of skins", ref: g(3, 21) },
      { id: "cherubim", label: "Cherubim are placed east of Eden", ref: g(3, 24) },
    ],
    explanation: "God addresses the serpent, then the woman, then Adam. The man names Eve, God clothes them, and the chapter ends with the guarded way to the tree of life.",
    references: [g(3, 14, 24)],
  },

  // 4 Expert
  {
    id: "creation.order.rivers",
    tier: 4,
    prompt: "Put the four rivers in the order Genesis 2 names them.",
    events: [
      { id: "pishon", label: "Pishon", ref: g(2, 11) },
      { id: "gihon", label: "Gihon", ref: g(2, 13) },
      { id: "hiddekel", label: "Hiddekel", ref: g(2, 14) },
      { id: "euphrates", label: "Euphrates", ref: g(2, 14) },
    ],
    explanation: "Genesis 2:11–14 names them first to fourth: Pishon, Gihon, Hiddekel and the Euphrates.",
    references: [g(2, 11, 14)],
  },
  {
    id: "creation.order.dialogue",
    tier: 4,
    prompt: "Put the conversation of Genesis 3:9–13 in order.",
    events: [
      { id: "where", label: "God asks the man where he is", ref: g(3, 9) },
      { id: "afraid", label: "The man says he was afraid and hid", ref: g(3, 10) },
      { id: "who", label: "God asks who told him he was naked", ref: g(3, 11) },
      { id: "blame", label: "The man points to the woman", ref: g(3, 12) },
      { id: "deceived", label: "The woman says the serpent deceived her", ref: g(3, 13) },
    ],
    explanation: "God asks two questions of the man, the man points to the woman, and the woman points to the serpent.",
    references: [g(3, 9, 13)],
  },

  // 5 Master
  {
    id: "creation.order.helper",
    tier: 5,
    prompt: "Put the events of Genesis 2:18–23 in order.",
    events: [
      { id: "alone", label: "God says it is not good for the man to be alone", ref: g(2, 18) },
      { id: "form", label: "God forms the animals and birds", ref: g(2, 19) },
      { id: "names", label: "The man gives names to them", ref: g(2, 20) },
      { id: "none", label: "No comparable helper is found", ref: g(2, 20) },
      { id: "sleep", label: "A deep sleep falls on the man", ref: g(2, 21) },
      { id: "bone", label: "The man says: bone of my bones", ref: g(2, 23) },
    ],
    explanation:
      "In this passage the animals are formed and named after God says the man should not be alone; only then does the deep sleep come and the woman appear. Genesis 1 orders its account differently, and readers explain the two accounts in different ways.",
    references: [g(2, 18, 23)],
  },
  {
    id: "creation.order.across",
    tier: 5,
    prompt: "Put these details from across Genesis 1–2 in the order the text tells them.",
    events: [
      { id: "lights", label: "Lights are set in the expanse", ref: g(1, 17) },
      { id: "bless", label: "Humankind is told to be fruitful", ref: g(1, 28) },
      { id: "seventh", label: "God blesses the seventh day", ref: g(2, 3) },
      { id: "mist", label: "A mist waters the ground", ref: g(2, 6) },
      { id: "keep", label: "The man is put in the garden to keep it", ref: g(2, 15) },
      { id: "names", label: "The man names the livestock and birds", ref: g(2, 20) },
    ],
    explanation: "The fourth day, the sixth day and the seventh day come first in Genesis 1–2:3; the mist, the garden and the naming follow in the account of Genesis 2.",
    references: [g(1, 17), g(1, 28), g(2, 3), g(2, 6), g(2, 15), g(2, 20)],
  },
];

export const storySteps: StoryOrderStep[] = stories.map((s) => ({ ...s, mode: "story-order", topicId: TOPIC }));
