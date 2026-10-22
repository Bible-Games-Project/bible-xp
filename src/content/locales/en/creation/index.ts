import type { Activity, DailyRecipe, Topic, Unit } from "../../../types";
import { formWordSteps } from "./formWord";
import { pairSteps } from "./pairs";
import { quizSteps } from "./quiz";
import { g, TOPIC } from "./shared";
import { storySteps } from "./story";
import { verseSteps } from "./verses";
import { whoAmISteps } from "./whoAmI";

/*
 * Topic: The Creation (Genesis 1–3), English.
 *
 * Literal quotations come from the World English Bible (WEB, public domain)
 * and are checked verbatim against `src/content/sources/web-genesis-1-3.json`
 * by `src/content/content.test.ts`. Clues and explanations are written for the
 * app; any wording shown in curly quotes must be verbatim WEB text.
 */

const activities: Activity[] = [
  { id: "creation.form-word", topicId: TOPIC, mode: "form-word", title: "Words of Eden", steps: formWordSteps },
  { id: "creation.match-pairs", topicId: TOPIC, mode: "match-pairs", title: "Names and Places", steps: pairSteps },
  { id: "creation.quiz", topicId: TOPIC, mode: "quiz", title: "Genesis 1–3", steps: quizSteps },
  { id: "creation.complete-verse", topicId: TOPIC, mode: "complete-verse", title: "Verses of Genesis", steps: verseSteps },
  { id: "creation.story-order", topicId: TOPIC, mode: "story-order", title: "The Order of Things", steps: storySteps },
  { id: "creation.who-am-i", topicId: TOPIC, mode: "who-am-i", title: "Voices of Eden", steps: whoAmISteps },
];

export const creationTopic: Topic = {
  id: TOPIC,
  title: "The Creation",
  subtitle: "In the beginning",
  passage: "Genesis 1–3",
  intro: {
    id: "creation.intro",
    topicId: TOPIC,
    title: "In the beginning",
    sections: [
      {
        title: "Where the story starts",
        icon: "sparkles",
        body: "The Bible opens with God creating everything. These first chapters set the stage for the whole story that follows.",
        quote: { text: "In the beginning, God created the heavens and the earth.", ref: g(1, 1), translation: "WEB" },
      },
      {
        title: "Six days of work",
        icon: "sun",
        body: "Genesis 1 describes God's work over six days. Each day closes with the same refrain.",
        quote: { text: "There was evening and there was morning, the first day.", ref: g(1, 5), translation: "WEB" },
      },
      {
        title: "Made in God's image",
        icon: "user",
        body: "On the sixth day God creates humankind, male and female, and gives them a special place in creation.",
        quote: {
          text: "God created man in his own image. In God’s image he created him; male and female he created them.",
          ref: g(1, 27),
          translation: "WEB",
        },
      },
      {
        title: "A day of rest",
        icon: "moon",
        body: "On the seventh day God rests, and blesses that day.",
        quote: { text: "God blessed the seventh day, and made it holy", ref: g(2, 3), translation: "WEB" },
      },
      {
        title: "The garden of Eden",
        icon: "leaf",
        body: "Genesis 2 looks closely at the first man and woman in the garden. Genesis 3 tells how they ate from the forbidden tree. Readers understand these chapters in different ways; Bible XP focuses on what the text says.",
        quote: {
          text: "Yahweh God planted a garden eastward, in Eden, and there he put the man whom he had formed.",
          ref: g(2, 8),
          translation: "WEB",
        },
      },
    ],
  },
  activities,
};

export const creationUnit: Unit = {
  id: "unit-1",
  number: 1,
  title: "The Creation",
  bookId: "GEN",
  topicId: TOPIC,
  nodes: [
    { id: "u1.intro", kind: "intro", topicId: TOPIC, introId: "creation.intro" },
    ...activities.map((a) => ({ id: `u1.${a.mode}`, kind: "activity" as const, topicId: TOPIC, activityId: a.id })),
  ],
};

export const creationDaily: DailyRecipe = {
  topicId: TOPIC,
  theme: "The Creation",
  modes: ["quiz", "form-word", "match-pairs", "complete-verse", "who-am-i"],
};
