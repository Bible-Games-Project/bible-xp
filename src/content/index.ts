import { shuffle } from "../lib/random";
import type {
  Activity,
  BibleRef,
  ContentPack,
  DailyChallenge,
  GameMode,
  Step,
  Tier,
  Topic,
  TopicIntro,
  TranslationId,
  Unit,
} from "./types";
import { creationDaily, creationTopic, creationUnit } from "./locales/en/creation";

/**
 * Content packs by content locale. Adding a language means adding a pack here
 * (with its own Bible translation); adding a topic means adding its data to the
 * pack and a unit to `units`. No screen or game needs to change.
 */
const packs: Record<string, ContentPack> = {
  en: {
    bookNames: { GEN: "Genesis" },
    translations: { WEB: { name: "World English Bible", abbreviation: "WEB" } },
    topics: [creationTopic],
    units: [creationUnit],
    daily: creationDaily,
  },
};

const FALLBACK = "en";

export function getContent(locale: string): ContentPack {
  return packs[locale] ?? packs[FALLBACK];
}

export function hasContent(locale: string): boolean {
  return locale in packs;
}

export function findTopic(pack: ContentPack, topicId: string): Topic | undefined {
  return pack.topics.find((t) => t.id === topicId);
}

export function findActivity(pack: ContentPack, activityId: string): Activity | undefined {
  for (const topic of pack.topics) {
    const activity = topic.activities.find((a) => a.id === activityId);
    if (activity) return activity;
  }
  return undefined;
}

export function findIntro(pack: ContentPack, introId: string): TopicIntro | undefined {
  return pack.topics.find((t) => t.intro.id === introId)?.intro;
}

/** The activity of a mode that Free Play launches. Today: the first topic that has one. */
export function freePlayActivity(pack: ContentPack, mode: GameMode): Activity | undefined {
  for (const topic of pack.topics) {
    const activity = topic.activities.find((a) => a.mode === mode);
    if (activity) return activity;
  }
  return undefined;
}

export function allSteps(pack: ContentPack): Step[] {
  const byId = new Map<string, Step>();
  for (const topic of pack.topics) for (const a of topic.activities) for (const s of a.steps) byId.set(s.id, s);
  return [...byId.values()];
}

export function findStep(pack: ContentPack, stepId: string): Step | undefined {
  return allSteps(pack).find((s) => s.id === stepId);
}

/** Steps drawn from a mode's bank for one session. */
export const SESSION_SIZE: Record<GameMode, number> = {
  "form-word": 4,
  "match-pairs": 2,
  quiz: 5,
  "complete-verse": 4,
  "story-order": 1,
  "who-am-i": 2,
};

/** Steps of an activity at a tier; falls back to the nearest lower tier with content. */
export function stepsAtTier(activity: Activity, tier: Tier): Step[] {
  for (let t = tier; t >= 1; t--) {
    const steps = activity.steps.filter((s) => s.tier === t);
    if (steps.length) return steps;
  }
  return activity.steps;
}

/**
 * Picks `count` steps, least-seen first so players meet the whole bank before
 * repeats; ties are broken by a seeded shuffle.
 */
export function drawSteps(pool: Step[], count: number, seen: Record<string, number>, seed: string): Step[] {
  return shuffle(pool, seed)
    .map((step, order) => ({ step, order }))
    .sort((a, b) => (seen[a.step.id] ?? 0) - (seen[b.step.id] ?? 0) || a.order - b.order)
    .slice(0, count)
    .map((x) => x.step);
}

/**
 * The daily challenge for a local date (YYYY-MM-DD) and tier: one step of each
 * mode in the recipe, chosen deterministically so it stays the same all day.
 */
export function dailyChallengeFor(pack: ContentPack, date: string, tier: Tier): DailyChallenge {
  const { topicId, theme, modes } = pack.daily;
  const topic = findTopic(pack, topicId)!;
  const steps = modes.flatMap((mode) => {
    const activity = topic.activities.find((a) => a.mode === mode);
    return activity ? shuffle(stepsAtTier(activity, tier), `${date}:${tier}:${mode}`).slice(0, 1) : [];
  });
  return { id: `daily.${topicId}.${date}.t${tier}`, topicId, theme, tier, steps };
}

export function unitFor(pack: ContentPack, unitId: string): Unit | undefined {
  return pack.units.find((u) => u.id === unitId);
}

export function formatRef(pack: ContentPack, ref: BibleRef): string {
  const range = ref.verseEnd ? `${ref.verse}–${ref.verseEnd}` : `${ref.verse}`;
  return `${pack.bookNames[ref.book]} ${ref.chapter}:${range}`;
}

export function formatRefs(pack: ContentPack, refs: BibleRef[]): string {
  return refs.map((r) => formatRef(pack, r)).join("; ");
}

export function translationLabel(pack: ContentPack, id: TranslationId): string {
  return pack.translations[id].abbreviation;
}

export type { ContentPack };
