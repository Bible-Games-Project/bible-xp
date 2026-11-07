/**
 * Content model. Everything a game shows lives in data files that follow these
 * types; game components only know how to render a step of their mode.
 *
 * Content is authored per content locale (see `src/content/index.ts`), so a
 * future translation can ship its own wording and its own Bible translation.
 */

export type GameMode =
  | "form-word"
  | "match-pairs"
  | "quiz"
  | "complete-verse"
  | "story-order"
  | "who-am-i";

export const GAME_MODES: GameMode[] = [
  "form-word",
  "match-pairs",
  "quiz",
  "complete-verse",
  "story-order",
  "who-am-i",
];

/** Bible book identifiers (USFM codes). Display names come from content locales. */
export type BookId = "GEN";

export interface BibleRef {
  book: BookId;
  chapter: number;
  verse: number;
  /** Inclusive last verse of a range in the same chapter. */
  verseEnd?: number;
}

/** Identifier of the Bible translation a literal quote was taken from. */
export type TranslationId = "WEB";

/** A literal Bible quotation. `text` must appear verbatim in `translation`. */
export interface Quote {
  text: string;
  ref: BibleRef;
  translation: TranslationId;
}

/**
 * Difficulty tier of a question: 1 Beginner, 2 Explorer, 3 Scholar, 4 Expert,
 * 5 Master. Independent of the player's XP level.
 */
export type Tier = 1 | 2 | 3 | 4 | 5;
export const TIERS: Tier[] = [1, 2, 3, 4, 5];

interface StepBase {
  /** Globally unique and stable: progress and mistake review are keyed by it. */
  id: string;
  topicId: string;
  tier: Tier;
  /** Explanation written for this app. Never presented as Bible text. */
  explanation: string;
  /** Passages the step and its explanation are based on. */
  references: BibleRef[];
}

export interface FormWordStep extends StepBase {
  mode: "form-word";
  /** Upper-case answer, letters only. */
  word: string;
  /** Short clue shown above the tiles. A paraphrase, never shown in quotes. */
  clue: string;
}

export interface MatchPair {
  id: string;
  /** May hold a literal quote in curly quotes; it is then checked against the source. */
  left: string;
  right: string;
  icon?: IconName;
}

export interface MatchPairsStep extends StepBase {
  mode: "match-pairs";
  prompt: string;
  pairs: MatchPair[];
}

export interface QuizStep extends StepBase {
  mode: "quiz";
  question: string;
  /** Exactly four options. */
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
}

export interface CompleteVerseStep extends StepBase {
  mode: "complete-verse";
  /** `before + answer + after` must be a verbatim fragment of `ref` in `translation`. */
  before: string;
  answer: string;
  after: string;
  /** Includes `answer`. */
  options: string[];
  ref: BibleRef;
  translation: TranslationId;
}

export interface StoryEvent {
  id: string;
  label: string;
  ref: BibleRef;
}

export interface StoryOrderStep extends StepBase {
  mode: "story-order";
  prompt: string;
  /** In the correct order. The game shuffles them. */
  events: StoryEvent[];
}

export interface WhoAmIClue {
  text: string;
  ref: BibleRef;
}

export interface WhoAmIStep extends StepBase {
  mode: "who-am-i";
  /** Revealed one at a time, hardest first. */
  clues: WhoAmIClue[];
  options: string[];
  answer: string;
}

export type Step =
  | FormWordStep
  | MatchPairsStep
  | QuizStep
  | CompleteVerseStep
  | StoryOrderStep
  | WhoAmIStep;

export type StepOf<M extends GameMode> = Extract<Step, { mode: M }>;

/** Icons used by content. Mapped to Lucide components in `src/components/icons.ts`. */
export type IconName =
  | "sun"
  | "moon"
  | "stars"
  | "cloud"
  | "waves"
  | "mountain"
  | "sprout"
  | "bird"
  | "fish"
  | "paw"
  | "user"
  | "heart"
  | "sparkles"
  | "leaf";

/**
 * One game mode on one topic. `steps` is the whole question bank across all
 * tiers; a session draws a few steps of the player's tier from it.
 */
export interface Activity {
  id: string;
  topicId: string;
  mode: GameMode;
  title: string;
  steps: Step[];
}

export interface IntroSection {
  title: string;
  body: string;
  quote?: Quote;
  icon: IconName;
}

export interface TopicIntro {
  id: string;
  topicId: string;
  title: string;
  sections: IntroSection[];
}

export interface Topic {
  id: string;
  title: string;
  subtitle: string;
  /** Short human-readable range, e.g. "Genesis 1–3". */
  passage: string;
  intro: TopicIntro;
  activities: Activity[];
}

export type TestamentId = "ot" | "nt";

/** A book of the Bible in the Journey catalogue. Ids are USFM codes. */
export interface BookEntry {
  id: string;
  name: string;
  testament: TestamentId;
  /** Key of the section the book belongs to (see ContentPack.bookGroups). */
  group: string;
}

/** A story announced in a book but not playable yet. Never shown as available. */
export interface PlannedStory {
  bookId: string;
  title: string;
  /** Short human-readable range, e.g. "Genesis 6–9". */
  passage: string;
}

/** A node on the learning path. */
export type PathNode =
  | { id: string; kind: "intro"; topicId: string; introId: string }
  | { id: string; kind: "activity"; topicId: string; activityId: string };

export interface Unit {
  id: string;
  number: number;
  title: string;
  /** Book of the Bible this story belongs to (BookEntry id). */
  bookId: string;
  topicId: string;
  nodes: PathNode[];
}

/** How a daily challenge is assembled: one step of each mode, at the player's tier. */
export interface DailyRecipe {
  topicId: string;
  theme: string;
  modes: GameMode[];
}

export interface DailyChallenge {
  id: string;
  topicId: string;
  theme: string;
  tier: Tier;
  steps: Step[];
}

/** Everything authored for one content locale. */
export interface ContentPack {
  bookNames: Record<BookId, string>;
  translations: Record<TranslationId, { name: string; abbreviation: string }>;
  topics: Topic[];
  units: Unit[];
  daily: DailyRecipe;
  /** All books of the Bible, in canonical order. */
  books: BookEntry[];
  /** Section names by group key, in display order. */
  bookGroups: Record<string, string>;
  plannedStories: PlannedStory[];
}
