import type { MatchPairsStep } from "../../../types";
import { g, TOPIC } from "./shared";

type P = Omit<MatchPairsStep, "mode" | "topicId">;

/* Match the Pairs, by tier: more pairs and finer distinctions as tiers rise. */
const rounds: P[] = [
  // 1 Beginner
  {
    id: "creation.match.names",
    tier: 1,
    prompt: "Match what God made with the name he gave it.",
    pairs: [
      { id: "light-day", left: "Light", right: "Day", icon: "sun" },
      { id: "darkness-night", left: "Darkness", right: "Night", icon: "moon" },
      { id: "expanse-sky", left: "The expanse", right: "Sky", icon: "cloud" },
      { id: "land-earth", left: "Dry land", right: "Earth", icon: "mountain" },
    ],
    explanation: "In Genesis 1 God names what he separates: the light “day”, the darkness “night”, the expanse “sky”, and the dry land “earth”.",
    references: [g(1, 5), g(1, 8), g(1, 10)],
  },
  {
    id: "daily.creation.match.days",
    tier: 1,
    prompt: "Match each day with what God made on it.",
    pairs: [
      { id: "day1", left: "First day", right: "Light", icon: "sun" },
      { id: "day2", left: "Second day", right: "The expanse", icon: "cloud" },
      { id: "day3", left: "Third day", right: "Dry land and plants", icon: "sprout" },
      { id: "day5", left: "Fifth day", right: "Sea creatures and birds", icon: "fish" },
    ],
    explanation: "Genesis 1 narrates light on day one, the expanse on day two, dry land and vegetation on day three, and sea creatures and birds on day five.",
    references: [g(1, 3, 13), g(1, 20, 23)],
  },

  // 2 Explorer
  {
    id: "creation.match.fill",
    tier: 2,
    prompt: "Match each part of creation with what Genesis says about it.",
    pairs: [
      { id: "lights-signs", left: "The great lights and the stars", right: "Signs, seasons, days and years", icon: "stars" },
      { id: "sea-waters", left: "Sea creatures", right: "Swarmed in the waters", icon: "fish" },
      { id: "birds-sky", left: "Birds", right: "Fly in the open sky", icon: "bird" },
      { id: "adam-dust", left: "Adam", right: "Formed from the dust of the ground", icon: "user" },
      { id: "eve-mother", left: "Eve", right: "Mother of all the living", icon: "heart" },
    ],
    explanation:
      "The lights mark signs, seasons, days and years (1:14). The waters swarm with living creatures while birds fly in the open expanse of the sky (1:20–21). The man is formed from the dust (2:7), and Eve is named the mother of all the living (3:20).",
    references: [g(1, 14), g(1, 20, 21), g(2, 7), g(3, 20)],
  },
  {
    id: "creation.match.garden",
    tier: 2,
    prompt: "Match each place or tree with what Genesis 2–3 says about it.",
    pairs: [
      { id: "eden", left: "Eden", right: "Where God planted a garden eastward", icon: "leaf" },
      { id: "knowledge", left: "Tree of the knowledge of good and evil", right: "Forbidden to eat from", icon: "sprout" },
      { id: "life", left: "Tree of life", right: "Guarded by cherubim and a flaming sword", icon: "sparkles" },
      { id: "havilah", left: "Havilah", right: "A land where the gold is good", icon: "mountain" },
    ],
    explanation:
      "God planted a garden eastward in Eden (2:8) and forbade the tree of the knowledge of good and evil (2:17). Havilah is the land of good gold (2:11–12), and cherubim guard the way to the tree of life (3:24).",
    references: [g(2, 8), g(2, 11, 12), g(2, 17), g(3, 24)],
  },

  // 3 Scholar
  {
    id: "creation.match.which-day",
    tier: 3,
    prompt: "Match each detail with the day of Genesis 1 it belongs to.",
    pairs: [
      { id: "d2", left: "An expanse in the middle of the waters", right: "Second day" },
      { id: "d3", left: "Herbs yielding seed and fruit trees", right: "Third day" },
      { id: "d4", left: "Lights to divide the day from the night", right: "Fourth day" },
      { id: "d5", left: "Birds flying above the earth", right: "Fifth day" },
      { id: "d6", left: "Livestock and creeping things", right: "Sixth day" },
    ],
    explanation:
      "Each detail comes from its own day: the expanse (1:6–8), vegetation (1:11–13), the lights (1:14–19), birds (1:20–23) and livestock with creeping things (1:24–31).",
    references: [g(1, 6, 31)],
  },
  {
    id: "creation.match.genesis3",
    tier: 3,
    prompt: "Match each one with what they did or said in Genesis 3.",
    pairs: [
      { id: "serpent", left: "The serpent", right: "Said they would not really die", icon: "sparkles" },
      { id: "woman", left: "The woman", right: "Said the serpent deceived her", icon: "heart" },
      { id: "man", left: "The man", right: "Said he hid because he was afraid", icon: "user" },
      { id: "god", left: "Yahweh God", right: "Made garments of skins for them", icon: "sun" },
    ],
    explanation:
      "The serpent contradicts God's warning (3:4). The man says he was afraid because he was naked and hid himself (3:10), the woman says the serpent deceived her (3:13), and God clothes them with garments of skins (3:21).",
    references: [g(3, 4), g(3, 10), g(3, 13), g(3, 21)],
  },

  // 4 Expert
  {
    id: "creation.match.rivers",
    tier: 4,
    prompt: "Match each river of Eden with how Genesis 2 describes it.",
    pairs: [
      { id: "pishon", left: "Pishon", right: "Flows through Havilah", icon: "waves" },
      { id: "gihon", left: "Gihon", right: "Flows through Cush", icon: "waves" },
      { id: "hiddekel", left: "Hiddekel", right: "Flows in front of Assyria", icon: "waves" },
      { id: "euphrates", left: "Euphrates", right: "Named fourth, with no land given", icon: "waves" },
    ],
    explanation:
      "Genesis 2:11–14 names the four rivers in order: Pishon (Havilah), Gihon (Cush), Hiddekel (in front of Assyria), and the Euphrates, for which no land is described.",
    references: [g(2, 10, 14)],
  },
  {
    id: "creation.match.speakers",
    tier: 4,
    prompt: "Match each saying with the one who said it.",
    pairs: [
      { id: "alone", left: "“It is not good for the man to be alone.”", right: "Yahweh God" },
      { id: "bone", left: "“This is now bone of my bones”", right: "The man" },
      { id: "deceived", left: "“The serpent deceived me”", right: "The woman" },
      { id: "die", left: "“You won’t really die”", right: "The serpent" },
    ],
    explanation:
      "God speaks in 2:18, the man greets the woman in 2:23, the serpent contradicts God in 3:4, and the woman answers God in 3:13.",
    references: [g(2, 18), g(2, 23), g(3, 4), g(3, 13)],
  },

  // 5 Master
  {
    id: "creation.match.similar",
    tier: 5,
    prompt: "These look alike. Match each one with where it belongs.",
    pairs: [
      { id: "keep", left: "Cultivate and keep it", right: "The man's task inside the garden" },
      { id: "till", left: "Till the ground he was taken from", right: "The man's task after leaving Eden" },
      { id: "eat-dust", left: "Eat dust all the days of your life", right: "Said to the serpent" },
      { id: "return-dust", left: "Return to dust", right: "Said to the man" },
    ],
    explanation:
      "Cultivating and keeping is the task in Eden (2:15); tilling the ground is the task outside it (3:23). The serpent will eat dust (3:14); the man will return to dust (3:19).",
    references: [g(2, 15), g(3, 14), g(3, 19), g(3, 23)],
  },
  {
    id: "creation.match.details",
    tier: 5,
    prompt: "Match each detail of Genesis 2–3 with what the text says about it.",
    pairs: [
      { id: "fig", left: "Fig leaves", right: "Sewn together by the man and woman" },
      { id: "skins", left: "Garments of skins", right: "Made by Yahweh God" },
      { id: "sword", left: "A flaming sword", right: "Turned every way" },
      { id: "thorns", left: "Thorns and thistles", right: "Yielded by the cursed ground" },
      { id: "sleep", left: "A deep sleep", right: "Caused to fall on the man" },
    ],
    explanation:
      "The fig leaves are the couple's own covering (3:7), the garments of skins are God's (3:21). The flaming sword guards the way to the tree of life (3:24), the ground yields thorns and thistles (3:17–18), and the deep sleep comes before the woman is made (2:21).",
    references: [g(2, 21), g(3, 7), g(3, 17, 18), g(3, 21), g(3, 24)],
  },
];

export const pairSteps: MatchPairsStep[] = rounds.map((r) => ({ ...r, mode: "match-pairs", topicId: TOPIC }));
