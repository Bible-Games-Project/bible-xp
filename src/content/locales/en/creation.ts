import type {
  Activity,
  CompleteVerseStep,
  DailyChallenge,
  FormWordStep,
  MatchPairsStep,
  QuizStep,
  StoryOrderStep,
  Topic,
  Unit,
  WhoAmIStep,
} from "../../types";

/*
 * Topic: The Creation (Genesis 1–3), English.
 *
 * Literal quotations come from the World English Bible (WEB, public domain)
 * and are checked verbatim against `src/content/sources/web-genesis-1-3.json`
 * by `src/content/content.test.ts`. Clues and explanations are written for the
 * app and are never displayed inside quotation marks.
 */

const TOPIC = "creation";
const g = (chapter: number, verse: number, verseEnd?: number) =>
  verseEnd === undefined
    ? { book: "GEN" as const, chapter, verse }
    : { book: "GEN" as const, chapter, verse, verseEnd };

// ---------------------------------------------------------------- Form the Word

const formWordSteps: FormWordStep[] = [
  {
    id: "creation.form.light",
    topicId: TOPIC,
    mode: "form-word",
    difficulty: 1,
    word: "LIGHT",
    clue: "The first thing God called into being by speaking.",
    explanation:
      "Genesis 1:3 records God's first spoken command: “Let there be light,” and there was light. God then divided the light from the darkness.",
    references: [g(1, 3, 4)],
  },
  {
    id: "creation.form.heavens",
    topicId: TOPIC,
    mode: "form-word",
    difficulty: 1,
    word: "HEAVENS",
    clue: "In the beginning, God created these and the earth.",
    explanation:
      "The Bible's opening verse names two things God created: the heavens and the earth.",
    references: [g(1, 1)],
  },
  {
    id: "creation.form.earth",
    topicId: TOPIC,
    mode: "form-word",
    difficulty: 1,
    word: "EARTH",
    clue: "The name God gave to the dry land.",
    explanation:
      "On the third day the waters were gathered to one place and dry land appeared. God called the dry land “earth” and the waters “seas”.",
    references: [g(1, 9, 10)],
  },
  {
    id: "creation.form.creation",
    topicId: TOPIC,
    mode: "form-word",
    difficulty: 2,
    word: "CREATION",
    clue: "On the seventh day God rested from all his work of this.",
    explanation:
      "Genesis 2:3 says God blessed the seventh day and made it holy, because he rested in it from all his work of creation.",
    references: [g(2, 3)],
  },
  {
    id: "creation.form.adam",
    topicId: TOPIC,
    mode: "form-word",
    difficulty: 2,
    word: "ADAM",
    clue: "The first man, formed from the dust of the ground.",
    explanation:
      "Genesis 2:7 describes God forming the man from the dust of the ground. In the World English Bible he is first called by the name Adam in Genesis 3.",
    references: [g(2, 7), g(3, 17)],
  },
  {
    id: "creation.form.eve",
    topicId: TOPIC,
    mode: "form-word",
    difficulty: 1,
    word: "EVE",
    clue: "The name the man gave his wife, the mother of all the living.",
    explanation:
      "Genesis 3:20 explains the name: the man called his wife Eve because she would be the mother of all the living.",
    references: [g(3, 20)],
  },
];

// -------------------------------------------------------------- Match the Pairs

const matchNamesStep: MatchPairsStep = {
  id: "creation.match.names",
  topicId: TOPIC,
  mode: "match-pairs",
  difficulty: 1,
  prompt: "Match what God made with the name he gave it.",
  pairs: [
    { id: "light-day", left: "Light", right: "Day", icon: "sun" },
    { id: "darkness-night", left: "Darkness", right: "Night", icon: "moon" },
    { id: "expanse-sky", left: "The expanse", right: "Sky", icon: "cloud" },
    { id: "land-earth", left: "Dry land", right: "Earth", icon: "mountain" },
  ],
  explanation:
    "In Genesis 1 God names what he separates: the light “day”, the darkness “night”, the expanse “sky”, and the dry land “earth”.",
  references: [g(1, 5), g(1, 8), g(1, 10)],
};

const matchFillStep: MatchPairsStep = {
  id: "creation.match.fill",
  topicId: TOPIC,
  mode: "match-pairs",
  difficulty: 2,
  prompt: "Match each part of creation with what Genesis says about it.",
  pairs: [
    { id: "lights-signs", left: "The great lights and the stars", right: "Signs, seasons, days and years", icon: "stars" },
    { id: "sea-waters", left: "Sea creatures", right: "Swarmed in the waters", icon: "fish" },
    { id: "birds-sky", left: "Birds", right: "Fly in the open sky", icon: "bird" },
    { id: "adam-dust", left: "Adam", right: "Formed from the dust of the ground", icon: "user" },
    { id: "eve-mother", left: "Eve", right: "Mother of all the living", icon: "heart" },
  ],
  explanation:
    "The lights in the sky are given to mark signs, seasons, days and years (1:14). The waters swarm with living creatures while birds fly in the open expanse of the sky (1:20–21). The man is formed from the dust (2:7), and Eve is named the mother of all the living (3:20).",
  references: [g(1, 14), g(1, 20, 21), g(2, 7), g(3, 20)],
};

// ------------------------------------------------------------------- Bible Quiz

const quizSteps: QuizStep[] = [
  {
    id: "creation.quiz.first-day",
    topicId: TOPIC,
    mode: "quiz",
    difficulty: 1,
    question: "According to Genesis 1, what did God create on the first day?",
    options: ["The sun", "Light", "Dry land", "The stars"],
    correctIndex: 1,
    explanation:
      "On the first day God said, “Let there be light,” and separated the light from the darkness. The sun, moon and stars come later, on the fourth day.",
    references: [g(1, 3, 5)],
  },
  {
    id: "creation.quiz.fourth-day",
    topicId: TOPIC,
    mode: "quiz",
    difficulty: 2,
    question: "According to Genesis 1, what was made on the fourth day?",
    options: [
      "Plants and fruit trees",
      "Birds and sea creatures",
      "The great lights and the stars",
      "The expanse of the sky",
    ],
    correctIndex: 2,
    explanation:
      "Genesis 1:16 says God made the two great lights, the greater light to rule the day and the lesser light to rule the night, and also the stars. Verse 19 closes the fourth day.",
    references: [g(1, 14, 19)],
  },
  {
    id: "creation.quiz.sky",
    topicId: TOPIC,
    mode: "quiz",
    difficulty: 1,
    question: "What did God call the expanse he made on the second day?",
    options: ["Seas", "Earth", "Sky", "Night"],
    correctIndex: 2,
    explanation:
      "The expanse divided the waters below from the waters above. Genesis 1:8 says God called the expanse “sky”.",
    references: [g(1, 6, 8)],
  },
  {
    id: "creation.quiz.sixth-day",
    topicId: TOPIC,
    mode: "quiz",
    difficulty: 2,
    question: "On which day of Genesis 1 does God create humankind?",
    options: ["The third day", "The fifth day", "The sixth day", "The seventh day"],
    correctIndex: 2,
    explanation:
      "Land animals and humankind are both made on the sixth day. God then saw everything he had made and it was very good.",
    references: [g(1, 24, 31)],
  },
  {
    id: "creation.quiz.image",
    topicId: TOPIC,
    mode: "quiz",
    difficulty: 2,
    question: "According to Genesis 1:27, in whose image was humankind created?",
    options: ["The image of the animals", "God's own image", "The image of the sun", "The image of the garden"],
    correctIndex: 1,
    explanation:
      "Genesis 1:27 says God created man in his own image, male and female. What being made in God's image means is a question theologians answer in different ways.",
    references: [g(1, 27)],
  },
  {
    id: "creation.quiz.seventh-day",
    topicId: TOPIC,
    mode: "quiz",
    difficulty: 1,
    question: "What did God do on the seventh day?",
    options: [
      "He created humankind",
      "He planted a garden",
      "He rested from all his work",
      "He separated the waters",
    ],
    correctIndex: 2,
    explanation:
      "Genesis 2:2–3 says God finished his work and rested on the seventh day. He blessed that day and made it holy.",
    references: [g(2, 2, 3)],
  },
];

// ----------------------------------------------------------- Complete the Verse

const verseSteps: CompleteVerseStep[] = [
  {
    id: "creation.verse.1-1",
    topicId: TOPIC,
    mode: "complete-verse",
    difficulty: 1,
    before: "In the beginning, God created the ",
    answer: "heavens",
    after: " and the earth.",
    options: ["waters", "heavens", "garden", "stars"],
    ref: g(1, 1),
    translation: "WEB",
    explanation: "These are the opening words of the Bible. They introduce God as the Creator of everything that follows.",
    references: [g(1, 1)],
  },
  {
    id: "creation.verse.1-3",
    topicId: TOPIC,
    mode: "complete-verse",
    difficulty: 1,
    before: "God said, “Let there be ",
    answer: "light",
    after: ",” and there was light.",
    options: ["life", "water", "light", "land"],
    ref: g(1, 3),
    translation: "WEB",
    explanation: "God speaks and it happens. This pattern of command and fulfilment repeats through each day of Genesis 1.",
    references: [g(1, 3)],
  },
  {
    id: "creation.verse.1-31",
    topicId: TOPIC,
    mode: "complete-verse",
    difficulty: 2,
    before: "God saw everything that he had made, and, behold, it was very ",
    answer: "good",
    after: ".",
    options: ["bright", "good", "holy", "new"],
    ref: g(1, 31),
    translation: "WEB",
    explanation:
      "Earlier days end with “God saw that it was good”. At the end of the sixth day, looking at everything together, the verdict becomes “very good”.",
    references: [g(1, 25), g(1, 31)],
  },
  {
    id: "creation.verse.2-7",
    topicId: TOPIC,
    mode: "complete-verse",
    difficulty: 2,
    before: "Yahweh God formed man from the ",
    answer: "dust",
    after: " of the ground, and breathed into his nostrils the breath of life; and man became a living soul.",
    options: ["clay", "dust", "water", "light"],
    ref: g(2, 7),
    translation: "WEB",
    explanation:
      "Genesis 2 zooms in on the making of the man. The World English Bible writes God's personal name as Yahweh.",
    references: [g(2, 7)],
  },
];

// ------------------------------------------------------- Put the Story in Order

const storyStep: StoryOrderStep = {
  id: "creation.order.days",
  topicId: TOPIC,
  mode: "story-order",
  difficulty: 2,
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
    "This is the order of the six days as Genesis 1 narrates them, each closing with “There was evening and there was morning”. It follows the text of the story; it is not presented here as a scientific timeline.",
  references: [g(1, 3, 31)],
};

// ------------------------------------------------------------------- Who Am I?

const whoAdamStep: WhoAmIStep = {
  id: "creation.who.adam",
  topicId: TOPIC,
  mode: "who-am-i",
  difficulty: 2,
  clues: [
    { text: "I gave names to the livestock, the birds and the animals of the field.", ref: g(2, 20) },
    { text: "God put me in the garden of Eden to cultivate and keep it.", ref: g(2, 15) },
    { text: "I was formed from the dust of the ground, and God breathed the breath of life into me.", ref: g(2, 7) },
  ],
  options: ["Eve", "Adam", "The serpent", "The cherubim"],
  answer: "Adam",
  explanation:
    "Genesis 2 tells how God formed the man, placed him in Eden and brought the animals to him to be named. In the World English Bible he is called Adam from Genesis 3 onwards.",
  references: [g(2, 7), g(2, 15), g(2, 20)],
};

const whoEveStep: WhoAmIStep = {
  id: "creation.who.eve",
  topicId: TOPIC,
  mode: "who-am-i",
  difficulty: 2,
  clues: [
    { text: "The serpent spoke to me in the garden about the tree.", ref: g(3, 1, 2) },
    { text: "I was made from a rib that God took from the man.", ref: g(2, 21, 22) },
    { text: "My husband named me because I would be the mother of all the living.", ref: g(3, 20) },
  ],
  options: ["Adam", "The serpent", "Eve", "The cherubim"],
  answer: "Eve",
  explanation:
    "Eve is made from the man's rib in Genesis 2, speaks with the serpent in Genesis 3, and is named in Genesis 3:20 as the mother of all the living.",
  references: [g(2, 21, 22), g(3, 1, 2), g(3, 20)],
};

const whoSerpentStep: WhoAmIStep = {
  id: "creation.who.serpent",
  topicId: TOPIC,
  mode: "who-am-i",
  difficulty: 3,
  clues: [
    { text: "I was more subtle than any animal of the field.", ref: g(3, 1) },
    { text: "I asked the woman whether God had really forbidden every tree of the garden.", ref: g(3, 1) },
    { text: "I was told I would go on my belly and eat dust all the days of my life.", ref: g(3, 14) },
  ],
  options: ["The serpent", "Adam", "Eve", "The cherubim"],
  answer: "The serpent",
  explanation:
    "The serpent appears in Genesis 3. It questions God's command, the woman eats the fruit, and God pronounces a curse on the serpent in verse 14.",
  references: [g(3, 1), g(3, 14)],
};

// ------------------------------------------------------------------- Activities

const activities: Activity[] = [
  { id: "creation.form-word", topicId: TOPIC, mode: "form-word", title: "Words of Creation", steps: formWordSteps },
  { id: "creation.match-pairs", topicId: TOPIC, mode: "match-pairs", title: "Names and Places", steps: [matchNamesStep, matchFillStep] },
  { id: "creation.quiz", topicId: TOPIC, mode: "quiz", title: "The Seven Days", steps: quizSteps },
  { id: "creation.complete-verse", topicId: TOPIC, mode: "complete-verse", title: "Verses of Genesis", steps: verseSteps },
  { id: "creation.story-order", topicId: TOPIC, mode: "story-order", title: "The Six Days", steps: [storyStep] },
  { id: "creation.who-am-i", topicId: TOPIC, mode: "who-am-i", title: "People of Eden", steps: [whoAdamStep, whoEveStep, whoSerpentStep] },
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
  topicId: TOPIC,
  nodes: [
    { id: "u1.intro", kind: "intro", topicId: TOPIC, introId: "creation.intro" },
    ...activities.map((a) => ({ id: `u1.${a.mode}`, kind: "activity" as const, topicId: TOPIC, activityId: a.id })),
  ],
};

// -------------------------------------------------------------- Daily challenge

const dailyCreation: DailyChallenge = {
  id: "daily.creation.1",
  topicId: TOPIC,
  title: "Daily Challenge",
  theme: "The Creation",
  steps: [
    {
      id: "daily.creation.quiz.dry-land",
      topicId: TOPIC,
      mode: "quiz",
      difficulty: 1,
      question: "What did God call the gathering of the waters on the third day?",
      options: ["Sky", "Seas", "Earth", "Eden"],
      correctIndex: 1,
      explanation: "Genesis 1:10 says God called the dry land “earth”, and the gathering together of the waters he called “seas”.",
      references: [g(1, 9, 10)],
    },
    {
      id: "daily.creation.form.garden",
      topicId: TOPIC,
      mode: "form-word",
      difficulty: 1,
      word: "GARDEN",
      clue: "What God planted eastward, in Eden.",
      explanation: "Genesis 2:8 says Yahweh God planted a garden eastward, in Eden, and put the man there.",
      references: [g(2, 8)],
    },
    {
      id: "daily.creation.match.days",
      topicId: TOPIC,
      mode: "match-pairs",
      difficulty: 2,
      prompt: "Match each day with what God made on it.",
      pairs: [
        { id: "day1", left: "First day", right: "Light", icon: "sun" },
        { id: "day2", left: "Second day", right: "The expanse", icon: "cloud" },
        { id: "day3", left: "Third day", right: "Dry land and plants", icon: "sprout" },
        { id: "day5", left: "Fifth day", right: "Sea creatures and birds", icon: "fish" },
      ],
      explanation:
        "Genesis 1 narrates light on day one, the expanse on day two, dry land and vegetation on day three, and sea creatures and birds on day five.",
      references: [g(1, 3, 13), g(1, 20, 23)],
    },
    {
      id: "daily.creation.verse.2-2",
      topicId: TOPIC,
      mode: "complete-verse",
      difficulty: 2,
      before: "On the seventh day God finished his work which he had done; and he ",
      answer: "rested",
      after: " on the seventh day from all his work which he had done.",
      options: ["spoke", "rested", "walked", "sang"],
      ref: g(2, 2),
      translation: "WEB",
      explanation: "The seventh day is set apart. Genesis 2:3 adds that God blessed it and made it holy.",
      references: [g(2, 2, 3)],
    },
    whoEveStep,
  ],
};

export const creationDailyChallenges: DailyChallenge[] = [dailyCreation];
