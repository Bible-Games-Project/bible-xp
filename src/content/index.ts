import type {
  Activity,
  BibleRef,
  ContentPack,
  DailyChallenge,
  GameMode,
  Step,
  Topic,
  TopicIntro,
  TranslationId,
  Unit,
} from "./types";
import { creationDailyChallenges, creationTopic, creationUnit } from "./locales/en/creation";

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
    dailyChallenges: creationDailyChallenges,
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
  for (const d of pack.dailyChallenges) for (const s of d.steps) byId.set(s.id, s);
  return [...byId.values()];
}

export function findStep(pack: ContentPack, stepId: string): Step | undefined {
  return allSteps(pack).find((s) => s.id === stepId);
}

/**
 * The challenge for a local date (YYYY-MM-DD). Rotates deterministically
 * through the pool, so adding challenges needs no code change.
 */
export function dailyChallengeFor(pack: ContentPack, date: string): DailyChallenge {
  const pool = pack.dailyChallenges;
  const dayNumber = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86_400_000);
  return pool[((dayNumber % pool.length) + pool.length) % pool.length];
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
