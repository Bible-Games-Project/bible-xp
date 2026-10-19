import type { FormWordStep } from "../../../types";
import { g, TOPIC } from "./shared";

type W = Omit<FormWordStep, "mode" | "topicId">;

/*
 * Form the Word, by tier. Higher tiers use less familiar words from
 * Genesis 1–3, and the game adds decoy letters per tier (see formWordLogic).
 */
const words: W[] = [
  // 1 Beginner
  {
    id: "creation.form.light",
    tier: 1,
    word: "LIGHT",
    clue: "The first thing God called into being by speaking.",
    explanation: "Genesis 1:3 records God's first spoken command: “Let there be light,” and there was light.",
    references: [g(1, 3, 4)],
  },
  {
    id: "creation.form.earth",
    tier: 1,
    word: "EARTH",
    clue: "The name God gave to the dry land.",
    explanation: "On the third day dry land appeared. God called the dry land “earth” and the waters “seas”.",
    references: [g(1, 9, 10)],
  },
  {
    id: "creation.form.adam",
    tier: 1,
    word: "ADAM",
    clue: "The first man, formed from the dust of the ground.",
    explanation: "Genesis 2:7 describes God forming the man from the dust. In the World English Bible he is first called Adam in Genesis 3:17.",
    references: [g(2, 7), g(3, 17)],
  },
  {
    id: "creation.form.eve",
    tier: 1,
    word: "EVE",
    clue: "The name the man gave his wife, the mother of all the living.",
    explanation: "Genesis 3:20: the man called his wife Eve because she would be the mother of all the living.",
    references: [g(3, 20)],
  },
  {
    id: "daily.creation.form.garden",
    tier: 1,
    word: "GARDEN",
    clue: "What God planted eastward, in Eden.",
    explanation: "Genesis 2:8 says Yahweh God planted a garden eastward, in Eden, and put the man there.",
    references: [g(2, 8)],
  },

  // 2 Explorer
  {
    id: "creation.form.heavens",
    tier: 2,
    word: "HEAVENS",
    clue: "In the beginning, God created these and the earth.",
    explanation: "The Bible's opening verse names what God created: the heavens and the earth.",
    references: [g(1, 1)],
  },
  {
    id: "creation.form.creation",
    tier: 2,
    word: "CREATION",
    clue: "On the seventh day God rested from all his work of this.",
    explanation: "Genesis 2:3 says God rested in the seventh day from all his work of creation which he had done.",
    references: [g(2, 3)],
  },
  {
    id: "creation.form.serpent",
    tier: 2,
    word: "SERPENT",
    clue: "More subtle than any animal of the field.",
    explanation: "Genesis 3:1 introduces the serpent as more subtle than any animal of the field which Yahweh God had made.",
    references: [g(3, 1)],
  },
  {
    id: "creation.form.expanse",
    tier: 2,
    word: "EXPANSE",
    clue: "Made on the second day to divide the waters from the waters.",
    explanation: "God made the expanse to divide the waters under it from the waters above it, and called it “sky”.",
    references: [g(1, 6, 8)],
  },

  // 3 Scholar
  {
    id: "creation.form.eastward",
    tier: 3,
    word: "EASTWARD",
    clue: "The direction in which God planted the garden in Eden.",
    explanation: "Genesis 2:8: Yahweh God planted a garden eastward, in Eden.",
    references: [g(2, 8)],
  },
  {
    id: "creation.form.cherubim",
    tier: 3,
    word: "CHERUBIM",
    clue: "Placed at the east of the garden to guard the way to the tree of life.",
    explanation: "Genesis 3:24 places cherubim and a flaming sword at the east of the garden of Eden.",
    references: [g(3, 24)],
  },
  {
    id: "creation.form.thistles",
    tier: 3,
    word: "THISTLES",
    clue: "Yielded by the cursed ground, together with thorns.",
    explanation: "God tells Adam that the ground will yield thorns and thistles to him.",
    references: [g(3, 17, 18)],
  },
  {
    id: "creation.form.helper",
    tier: 3,
    word: "HELPER",
    clue: "God said he would make the man one of these, comparable to him.",
    explanation: "Genesis 2:18: “I will make him a helper comparable to him.”",
    references: [g(2, 18)],
  },

  // 4 Expert
  {
    id: "creation.form.pishon",
    tier: 4,
    word: "PISHON",
    clue: "The first of the four rivers named in Genesis 2.",
    explanation: "Genesis 2:11 names the first river Pishon, flowing through the whole land of Havilah.",
    references: [g(2, 11)],
  },
  {
    id: "creation.form.havilah",
    tier: 4,
    word: "HAVILAH",
    clue: "The land of good gold, through which the first river flows.",
    explanation: "Genesis 2:11–12: the Pishon flows through Havilah, where there is gold, and the gold of that land is good.",
    references: [g(2, 11, 12)],
  },
  {
    id: "creation.form.onyx",
    tier: 4,
    word: "ONYX",
    clue: "A stone found in Havilah, named alongside bdellium.",
    explanation: "Genesis 2:12 says bdellium and onyx stone are found in Havilah.",
    references: [g(2, 12)],
  },
  {
    id: "creation.form.euphrates",
    tier: 4,
    word: "EUPHRATES",
    clue: "The fourth river named in Genesis 2.",
    explanation: "Genesis 2:14 ends the list of rivers: the fourth river is the Euphrates.",
    references: [g(2, 14)],
  },

  // 5 Master
  {
    id: "creation.form.hiddekel",
    tier: 5,
    word: "HIDDEKEL",
    clue: "The third river, flowing in front of Assyria (as the World English Bible names it).",
    explanation:
      "Genesis 2:14 names the third river Hiddekel. Many English translations render this name as Tigris.",
    references: [g(2, 14)],
  },
  {
    id: "creation.form.bdellium",
    tier: 5,
    word: "BDELLIUM",
    clue: "Found in Havilah together with onyx stone.",
    explanation: "Genesis 2:12 lists bdellium and onyx stone among the riches of Havilah.",
    references: [g(2, 12)],
  },
  {
    id: "creation.form.assyria",
    tier: 5,
    word: "ASSYRIA",
    clue: "The third river flows in front of this land.",
    explanation: "Genesis 2:14: the third river is the one which flows in front of Assyria.",
    references: [g(2, 14)],
  },
  {
    id: "creation.form.cush",
    tier: 5,
    word: "CUSH",
    clue: "The land that the second river, Gihon, flows through.",
    explanation: "Genesis 2:13: the Gihon flows through the whole land of Cush.",
    references: [g(2, 13)],
  },
];

export const formWordSteps: FormWordStep[] = words.map((w) => ({ ...w, mode: "form-word", topicId: TOPIC }));
