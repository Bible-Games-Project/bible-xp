import type { QuizStep } from "../../../types";
import { g, TOPIC } from "./shared";

type Q = Omit<QuizStep, "mode" | "topicId">;

/*
 * Bible Quiz, Genesis 1–3, by tier.
 * Distractors are other real details from the same chapters, so a wrong
 * answer is always a plausible confusion rather than an absurd option.
 */
const questions: Q[] = [
  // ------------------------------------------------------------ 1 Beginner
  {
    id: "creation.quiz.first-day",
    tier: 1,
    question: "According to Genesis 1, what did God create on the first day?",
    options: ["The sun", "Light", "Dry land", "The stars"],
    correctIndex: 1,
    explanation:
      "On the first day God said, “Let there be light,” and divided the light from the darkness. The great lights and the stars come later, on the fourth day.",
    references: [g(1, 3, 5)],
  },
  {
    id: "creation.quiz.seventh-day",
    tier: 1,
    question: "What did God do on the seventh day?",
    options: ["He created humankind", "He planted a garden", "He rested from all his work", "He separated the waters"],
    correctIndex: 2,
    explanation: "Genesis 2:2–3 says God finished his work and rested on the seventh day. He blessed that day and made it holy.",
    references: [g(2, 2, 3)],
  },
  {
    id: "creation.quiz.dust",
    tier: 1,
    question: "According to Genesis 2:7, what did God form the man from?",
    options: ["A rib", "The dust of the ground", "The waters of the deep", "The fruit of a tree"],
    correctIndex: 1,
    explanation:
      "Yahweh God formed man from the dust of the ground and breathed into his nostrils the breath of life. The rib belongs to the making of the woman, later in the chapter.",
    references: [g(2, 7)],
  },
  {
    id: "creation.quiz.eden",
    tier: 1,
    question: "Where did God put the man he had formed?",
    options: ["In the land of Cush", "In a garden in Eden", "In the land of Havilah", "Beside the river Euphrates"],
    correctIndex: 1,
    explanation:
      "Genesis 2:8 says Yahweh God planted a garden eastward, in Eden, and put the man there. Havilah, Cush and the Euphrates are named later as lands and rivers around it.",
    references: [g(2, 8), g(2, 10, 14)],
  },
  {
    id: "creation.quiz.tempter",
    tier: 1,
    question: "In Genesis 3, who persuades the woman to eat from the forbidden tree?",
    options: ["The serpent", "A cherub", "The man", "A bird of the sky"],
    correctIndex: 0,
    explanation: "The serpent questions God's command and tells the woman she will not really die. She then eats and gives some to her husband.",
    references: [g(3, 1, 6)],
  },
  {
    id: "creation.quiz.sky",
    tier: 1,
    question: "What did God call the expanse he made on the second day?",
    options: ["Seas", "Earth", "Sky", "Night"],
    correctIndex: 2,
    explanation: "The expanse divided the waters below from the waters above. Genesis 1:8 says God called the expanse “sky”.",
    references: [g(1, 6, 8)],
  },
  {
    id: "creation.quiz.sixth-day",
    tier: 1,
    question: "On which day of Genesis 1 does God create humankind?",
    options: ["The third day", "The fifth day", "The sixth day", "The seventh day"],
    correctIndex: 2,
    explanation: "Land animals and humankind are both made on the sixth day. God then saw everything he had made, and it was very good.",
    references: [g(1, 24, 31)],
  },

  // ------------------------------------------------------------ 2 Explorer
  {
    id: "creation.quiz.fourth-day",
    tier: 2,
    question: "According to Genesis 1, what was made on the fourth day?",
    options: ["Plants and fruit trees", "Birds and sea creatures", "The great lights and the stars", "The expanse of the sky"],
    correctIndex: 2,
    explanation:
      "Genesis 1:16 says God made the two great lights, the greater light to rule the day and the lesser light to rule the night, and also the stars. Verse 19 closes the fourth day.",
    references: [g(1, 14, 19)],
  },
  {
    id: "daily.creation.quiz.dry-land",
    tier: 2,
    question: "What did God call the gathering together of the waters on the third day?",
    options: ["Sky", "Seas", "Earth", "The deep"],
    correctIndex: 1,
    explanation: "Genesis 1:10 says God called the dry land “earth”, and the gathering together of the waters he called “seas”.",
    references: [g(1, 9, 10)],
  },
  {
    id: "creation.quiz.fifth-day",
    tier: 2,
    question: "On which day were the sea creatures and the birds created?",
    options: ["The third day", "The fourth day", "The fifth day", "The sixth day"],
    correctIndex: 2,
    explanation: "Genesis 1:20–23 describes the waters swarming with living creatures and birds flying in the sky, closing with the fifth day.",
    references: [g(1, 20, 23)],
  },
  {
    id: "creation.quiz.woman-made",
    tier: 2,
    question: "According to Genesis 2, what did God make the woman from?",
    options: ["The dust of the ground", "A rib taken from the man", "A branch of the tree of life", "The breath of life"],
    correctIndex: 1,
    explanation: "God caused a deep sleep to fall on the man, took one of his ribs, and made a woman from it.",
    references: [g(2, 21, 22)],
  },
  {
    id: "creation.quiz.forbidden-tree",
    tier: 2,
    question: "Which tree did God command the man not to eat from in Genesis 2?",
    options: [
      "The tree of life",
      "The tree of the knowledge of good and evil",
      "Every tree in the middle of the garden",
      "The fig tree",
    ],
    correctIndex: 1,
    explanation:
      "The man may freely eat of every tree of the garden except the tree of the knowledge of good and evil. The tree of life is not forbidden in Genesis 2.",
    references: [g(2, 16, 17)],
  },
  {
    id: "creation.quiz.fig-leaves",
    tier: 2,
    question: "What did the man and woman do right after their eyes were opened?",
    options: [
      "They made garments of animal skins",
      "They sewed fig leaves together as coverings",
      "They ran out of the garden",
      "They called on the name of God",
    ],
    correctIndex: 1,
    explanation:
      "Genesis 3:7 says they knew they were naked and sewed fig leaves together. The garments of animal skins are made later, by Yahweh God (3:21).",
    references: [g(3, 7), g(3, 21)],
  },
  {
    id: "creation.quiz.holy-day",
    tier: 2,
    question: "Besides resting in it, what did God do with the seventh day?",
    options: [
      "He divided it from the night",
      "He blessed it and made it holy",
      "He gave it to the man to work the ground",
      "He set lights in it",
    ],
    correctIndex: 1,
    explanation: "Genesis 2:3 says God blessed the seventh day, and made it holy, because he rested in it from all his work.",
    references: [g(2, 3)],
  },

  // ------------------------------------------------------------- 3 Scholar
  {
    id: "creation.quiz.image",
    tier: 3,
    question: "Genesis 1:27 says humankind was created in God's image. What else does that verse say about them?",
    options: [
      "They were formed from the dust of the ground",
      "Male and female he created them",
      "They were placed in the garden of Eden",
      "They became living souls",
    ],
    correctIndex: 1,
    explanation:
      "Genesis 1:27 ends with “male and female he created them.” The dust, the breath of life and the garden belong to the second account, in Genesis 2.",
    references: [g(1, 27), g(2, 7, 8)],
  },
  {
    id: "creation.quiz.human-food",
    tier: 3,
    question: "According to Genesis 1:29, what did God give humankind for food?",
    options: [
      "Every herb yielding seed and every tree bearing fruit",
      "Every green herb, the same as the animals",
      "The fish of the sea and the birds of the sky",
      "Only the fruit of the tree of life",
    ],
    correctIndex: 0,
    explanation:
      "God gives people every herb yielding seed and every tree which bears fruit yielding seed. In the next verse the animals and birds are given every green herb.",
    references: [g(1, 29, 30)],
  },
  {
    id: "creation.quiz.not-good",
    tier: 3,
    question: "In Genesis 2:18, what does God say is not good?",
    options: [
      "That there was no rain on the earth",
      "That the man was alone",
      "That the man had eaten from the tree",
      "That darkness was on the surface of the deep",
    ],
    correctIndex: 1,
    explanation:
      "God says, “It is not good for the man to be alone. I will make him a helper comparable to him.” Up to this point everything in creation had been called good.",
    references: [g(2, 18)],
  },
  {
    id: "creation.quiz.mist",
    tier: 3,
    question: "Before there was rain, how was the ground watered, according to Genesis 2:6?",
    options: [
      "Rain fell from the waters above the expanse",
      "A mist went up from the earth",
      "The man drew water from the river",
      "The river Pishon flooded the land",
    ],
    correctIndex: 1,
    explanation:
      "Genesis 2:5 says God had not yet caused it to rain. Verse 6 adds that a mist went up from the earth and watered the whole surface of the ground.",
    references: [g(2, 5, 6)],
  },
  {
    id: "creation.quiz.four-rivers",
    tier: 3,
    question: "The river that went out of Eden was parted into how many rivers?",
    options: ["Two", "Three", "Four", "Seven"],
    correctIndex: 2,
    explanation: "Genesis 2:10 says the river parted and became the source of four rivers, which verses 11–14 name one by one.",
    references: [g(2, 10, 14)],
  },
  {
    id: "creation.quiz.cherubim",
    tier: 3,
    question: "Where did God place the cherubim after driving the man out of the garden?",
    options: ["At the west of the garden", "At the east of the garden of Eden", "Beside the river Euphrates", "In the land of Havilah"],
    correctIndex: 1,
    explanation:
      "Genesis 3:24 places cherubim at the east of the garden of Eden, with a flaming sword which turned every way, to guard the way to the tree of life.",
    references: [g(3, 24)],
  },
  {
    id: "creation.quiz.blame",
    tier: 3,
    question: "When God asked the man whether he had eaten from the tree, whom did the man point to?",
    options: ["The serpent", "The woman God gave to be with him", "No one; he admitted it at once", "The cherubim"],
    correctIndex: 1,
    explanation:
      "The man answers that the woman whom God gave to be with him gave him the fruit. It is the woman who then says the serpent deceived her.",
    references: [g(3, 11, 13)],
  },

  // -------------------------------------------------------------- 4 Expert
  {
    id: "creation.quiz.no-good-day",
    tier: 4,
    question: "Which day of Genesis 1 closes without the text saying that God saw that what he made was good?",
    options: ["The second day", "The third day", "The fourth day", "The fifth day"],
    correctIndex: 0,
    explanation:
      "Verses 6–8 describe the expanse but contain no such statement. The third day has it twice: “God saw that it was good” in verse 10 and again in verse 12.",
    references: [g(1, 6, 8), g(1, 10), g(1, 12)],
  },
  {
    id: "creation.quiz.touch",
    tier: 4,
    question: "When the woman repeats God's command in Genesis 3:3, what does she include that God's words in Genesis 2:17 do not?",
    options: [
      "A warning that they would die",
      "A ban on touching the tree",
      "A ban on eating from the tree",
      "The name of the tree of the knowledge of good and evil",
    ],
    correctIndex: 1,
    explanation:
      "Genesis 2:17 forbids eating and warns of death. In Genesis 3:3 the woman adds “You shall not touch it,” which is not in the command as Genesis 2 records it.",
    references: [g(2, 16, 17), g(3, 2, 3)],
  },
  {
    id: "creation.quiz.havilah",
    tier: 4,
    question: "Besides good gold, what does Genesis 2:12 say is found in the land of Havilah?",
    options: ["Silver and bronze", "Bdellium and onyx stone", "Pearls and sapphires", "Iron and copper"],
    correctIndex: 1,
    explanation: "Genesis 2:11–12 says the Pishon flows through Havilah, where there is good gold, and that bdellium and onyx stone are also there.",
    references: [g(2, 11, 12)],
  },
  {
    id: "creation.quiz.gihon",
    tier: 4,
    question: "Which river does Genesis 2 say flows through the whole land of Cush?",
    options: ["Pishon", "Gihon", "Hiddekel", "Euphrates"],
    correctIndex: 1,
    explanation:
      "The second river, Gihon, flows through the whole land of Cush. Pishon flows through Havilah, Hiddekel in front of Assyria, and no land is given for the Euphrates.",
    references: [g(2, 11, 14)],
  },
  {
    id: "creation.quiz.first-blessing",
    tier: 4,
    question: "Which creatures are the first that God blesses and tells to be fruitful and multiply in Genesis 1?",
    options: ["Humankind", "The sea creatures and the birds", "The livestock and land animals", "The great lights"],
    correctIndex: 1,
    explanation:
      "On the fifth day God blesses the sea creatures and birds: “Be fruitful, and multiply”. Humankind receives a similar blessing on the sixth day. No blessing is recorded for the land animals.",
    references: [g(1, 22), g(1, 24, 28)],
  },
  {
    id: "creation.quiz.animal-food",
    tier: 4,
    question: "According to Genesis 1:30, what is given as food to the animals and birds?",
    options: [
      "Every herb yielding seed and every fruit tree",
      "Every green herb",
      "The fish of the sea",
      "The fruit of the garden",
    ],
    correctIndex: 1,
    explanation:
      "Verse 29 gives people seed-bearing herbs and fruit trees. Verse 30 gives every animal, bird and creeping thing every green herb for food.",
    references: [g(1, 29, 30)],
  },
  {
    id: "creation.quiz.no-plant",
    tier: 4,
    question: "According to Genesis 2:5, why had no herb of the field sprung up yet?",
    options: [
      "The waters still covered the dry land",
      "God had not yet sent rain, and there was no man to till the ground",
      "The sun had not yet been made",
      "The ground had been cursed",
    ],
    correctIndex: 1,
    explanation:
      "Genesis 2:5 gives two reasons: Yahweh God had not caused it to rain on the earth, and there was not a man to till the ground.",
    references: [g(2, 5)],
  },

  // -------------------------------------------------------------- 5 Master
  {
    id: "creation.quiz.after-alone",
    tier: 5,
    question: "In the Genesis 2 account, what does God do right after saying it is not good for the man to be alone?",
    options: [
      "Causes a deep sleep to fall on the man",
      "Forms the animals and birds and brings them to the man",
      "Plants a garden eastward, in Eden",
      "Commands the man not to eat from the tree",
    ],
    correctIndex: 1,
    explanation:
      "Verse 19 follows directly: God forms every animal of the field and every bird of the sky and brings them to the man to name. The deep sleep comes after no helper is found (2:20–21); the garden and the command come before (2:8, 2:16–17).",
    references: [g(2, 8), g(2, 16, 21)],
  },
  {
    id: "creation.quiz.cursed",
    tier: 5,
    question: "Which two does Genesis 3 explicitly describe as cursed?",
    options: ["The woman and the man", "The serpent and the woman", "The serpent and the ground", "The man and the ground"],
    correctIndex: 2,
    explanation:
      "God tells the serpent “you are cursed above all livestock” (3:14) and tells Adam “the ground is cursed for your sake” (3:17). The woman and the man receive consequences, but the word cursed is not applied to them.",
    references: [g(3, 14), g(3, 16, 17)],
  },
  {
    id: "creation.quiz.task-after",
    tier: 5,
    question: "When Yahweh God sent the man out of the garden of Eden, what was he sent out to do?",
    options: [
      "Cultivate and keep the garden",
      "Till the ground from which he was taken",
      "Guard the way to the tree of life",
      "Give names to every living creature",
    ],
    correctIndex: 1,
    explanation:
      "Genesis 3:23 sends him out to till the ground from which he was taken. Cultivating and keeping the garden was his task inside Eden (2:15); guarding the way is given to the cherubim (3:24).",
    references: [g(2, 15), g(3, 23, 24)],
  },
  {
    id: "creation.quiz.lights-names",
    tier: 5,
    question: "How does Genesis 1:16 refer to the two great lights of the fourth day?",
    options: [
      "As the sun and the moon",
      "As the greater light and the lesser light",
      "As the signs and the seasons",
      "As the day and the night",
    ],
    correctIndex: 1,
    explanation:
      "Genesis 1 never uses the names sun and moon. Verse 16 speaks of “the greater light to rule the day, and the lesser light to rule the night.”",
    references: [g(1, 16)],
  },
  {
    id: "creation.quiz.coverings",
    tier: 5,
    question: "Who made the fig-leaf coverings, and who made the garments of skins?",
    options: [
      "The man and woman made fig-leaf coverings; God made garments of skins",
      "God made fig-leaf coverings; the man and woman made garments of skins",
      "God made both",
      "The man and woman made both",
    ],
    correctIndex: 0,
    explanation:
      "After their eyes were opened, the man and woman sewed fig leaves together (3:7). Before sending them out, Yahweh God made garments of animal skins for Adam and his wife, and clothed them (3:21).",
    references: [g(3, 7), g(3, 21)],
  },
  {
    id: "creation.quiz.return-dust",
    tier: 5,
    question: "To whom does God say “you shall return to dust”?",
    options: ["The serpent", "The woman", "The man", "Both the man and the woman"],
    correctIndex: 2,
    explanation:
      "Genesis 3:19 is part of God's words to Adam. The serpent is also linked with dust, but differently: it will eat dust all the days of its life (3:14).",
    references: [g(3, 14), g(3, 17, 19)],
  },
];

export const quizSteps: QuizStep[] = questions.map((q) => ({ ...q, mode: "quiz", topicId: TOPIC }));
