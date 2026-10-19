import type { GameMode, Unit } from "../content/types";
import { levelForXp } from "./levels";
import { REWARDS, type RewardResult } from "./rewards";
import { EMPTY_STREAK, recordActiveDay, type StreakState } from "./streak";

/*
 * The whole player state, kept as one plain JSON object so it can be saved
 * locally today and synced to a server later. Every mutation is a pure
 * function below; `store.ts` only wires them to React and storage.
 */

export const PROGRESS_VERSION = 1;

export type AvatarId = "dawn" | "sky" | "leaf" | "flame" | "wave" | "star";
export const AVATARS: AvatarId[] = ["dawn", "sky", "leaf", "flame", "wave", "star"];

export interface Settings {
  language: string;
  sound: boolean;
  vibration: boolean;
  /** null follows the operating system preference. */
  reduceMotion: boolean | null;
  largeText: boolean;
}

export interface Profile {
  name: string;
  avatar: AvatarId;
}

export interface ActivityRecord {
  startedAt: string;
  firstCompletedAt?: string;
  completions: number;
  bestCorrect: number;
  total: number;
  /** Local date on which replay XP was last granted. */
  lastPracticeRewardDate?: string;
}

export interface StepOutcome {
  stepId: string;
  /** Right at the first attempt. */
  correct: boolean;
  correctCount: number;
  incorrectCount: number;
}

export type SessionKind = "activity" | "daily" | "review";

export interface SessionProgress {
  key: string;
  kind: SessionKind;
  /** Activity id, daily challenge id, or "mistakes". */
  refId: string;
  stepIds: string[];
  index: number;
  outcomes: StepOutcome[];
  startedAt: string;
}

/** Shaped so a spaced-repetition schedule can be added without migration pain. */
export interface MistakeRecord {
  stepId: string;
  mode: GameMode;
  topicId: string;
  wrongCount: number;
  lastWrongAt: string;
  lastCorrectAt?: string;
  resolved: boolean;
}

export interface DailyRecord {
  challengeId: string;
  completedAt?: string;
  rewarded: boolean;
}

export interface ProgressData {
  version: number;
  profile: Profile;
  settings: Settings;
  xp: number;
  streak: StreakState;
  stats: {
    correctAnswers: number;
    incorrectAnswers: number;
    activitiesStarted: number;
    sessionsCompleted: number;
    lastActivity: { kind: SessionKind | "intro"; refId: string; at: string } | null;
  };
  activities: Record<string, ActivityRecord>;
  intros: Record<string, { completedAt: string }>;
  unitsCompleted: Record<string, string>;
  daily: Record<string, DailyRecord>;
  sessions: Record<string, SessionProgress>;
  mistakes: Record<string, MistakeRecord>;
  lastReviewRewardDate?: string;
}

export function defaultProgress(): ProgressData {
  return {
    version: PROGRESS_VERSION,
    profile: { name: "", avatar: "dawn" },
    settings: { language: "en", sound: true, vibration: true, reduceMotion: null, largeText: false },
    xp: 0,
    streak: { ...EMPTY_STREAK },
    stats: { correctAnswers: 0, incorrectAnswers: 0, activitiesStarted: 0, sessionsCompleted: 0, lastActivity: null },
    activities: {},
    intros: {},
    unitsCompleted: {},
    daily: {},
    sessions: {},
    mistakes: {},
  };
}

export const sessionKey = {
  activity: (activityId: string) => `activity:${activityId}`,
  daily: (date: string) => `daily:${date}`,
  review: () => "review",
};

export function startSession(
  data: ProgressData,
  key: string,
  kind: SessionKind,
  refId: string,
  stepIds: string[],
  nowIso: string,
): ProgressData {
  const existing = data.sessions[key];
  const sameSteps = existing && existing.stepIds.join() === stepIds.join();
  // Resume an unfinished session (or one whose last step is recorded but not yet finalised).
  if (existing && sameSteps) return data;

  const session: SessionProgress = { key, kind, refId, stepIds, index: 0, outcomes: [], startedAt: nowIso };
  const next: ProgressData = { ...data, sessions: { ...data.sessions, [key]: session } };
  if (kind === "activity") {
    next.stats = { ...data.stats, activitiesStarted: data.stats.activitiesStarted + 1 };
    if (!data.activities[refId]) {
      next.activities = { ...data.activities, [refId]: { startedAt: nowIso, completions: 0, bestCorrect: 0, total: stepIds.length } };
    }
  }
  return next;
}

export interface StepMeta {
  mode: GameMode;
  topicId: string;
}

export function recordStep(
  data: ProgressData,
  key: string,
  outcome: StepOutcome,
  meta: StepMeta,
  nowIso: string,
): ProgressData {
  const session = data.sessions[key];
  // Ignore duplicates (double taps, re-renders): only the current step can be recorded.
  if (!session || session.stepIds[session.index] !== outcome.stepId || session.outcomes.length !== session.index) {
    return data;
  }
  const mistakes = { ...data.mistakes };
  const previous = mistakes[outcome.stepId];
  if (!outcome.correct) {
    mistakes[outcome.stepId] = {
      stepId: outcome.stepId,
      mode: meta.mode,
      topicId: meta.topicId,
      wrongCount: (previous?.wrongCount ?? 0) + 1,
      lastWrongAt: nowIso,
      lastCorrectAt: previous?.lastCorrectAt,
      resolved: false,
    };
  } else if (previous) {
    // A right answer in a review clears the mistake; elsewhere it is just noted.
    mistakes[outcome.stepId] = { ...previous, lastCorrectAt: nowIso, resolved: previous.resolved || session.kind === "review" };
  }
  return {
    ...data,
    mistakes,
    stats: {
      ...data.stats,
      correctAnswers: data.stats.correctAnswers + outcome.correctCount,
      incorrectAnswers: data.stats.incorrectAnswers + outcome.incorrectCount,
    },
    sessions: {
      ...data.sessions,
      [key]: { ...session, index: session.index + 1, outcomes: [...session.outcomes, outcome] },
    },
  };
}

export function abandonSession(data: ProgressData, key: string): ProgressData {
  if (!data.sessions[key]) return data;
  const sessions = { ...data.sessions };
  delete sessions[key];
  return { ...data, sessions };
}

export interface SessionSummary {
  kind: SessionKind;
  refId: string;
  correctSteps: number;
  totalSteps: number;
  correctAnswers: number;
  incorrectAnswers: number;
  reward: RewardResult;
  levelBefore: number;
  levelAfter: number;
  firstCompletion: boolean;
  unitCompleted: string | null;
}

/**
 * Finishes a session, grants XP once, and removes it from in-progress state.
 * Returns null when there is nothing to finish, so it is safe to call twice.
 */
export function completeSession(
  data: ProgressData,
  key: string,
  today: string,
  nowIso: string,
  units: Unit[],
): { data: ProgressData; summary: SessionSummary } | null {
  const session = data.sessions[key];
  if (!session || session.index < session.stepIds.length) return null;

  const correctSteps = session.outcomes.filter((o) => o.correct).length;
  const totalSteps = session.stepIds.length;
  const perfect = correctSteps === totalSteps;
  let next: ProgressData = abandonSession(data, key);
  let reward: RewardResult;
  let firstCompletion = false;

  if (session.kind === "activity") {
    const record = next.activities[session.refId] ?? { startedAt: nowIso, completions: 0, bestCorrect: 0, total: totalSteps };
    firstCompletion = !record.firstCompletedAt;
    if (firstCompletion) {
      reward = { xp: REWARDS.activityFirstCompletion, bonus: perfect ? REWARDS.perfectBonus : 0, reason: "first-completion" };
    } else if (record.lastPracticeRewardDate !== today) {
      reward = { xp: REWARDS.practice, bonus: 0, reason: "practice" };
    } else {
      reward = { xp: 0, bonus: 0, reason: "practice-already-claimed" };
    }
    next.activities = {
      ...next.activities,
      [session.refId]: {
        ...record,
        firstCompletedAt: record.firstCompletedAt ?? nowIso,
        completions: record.completions + 1,
        bestCorrect: Math.max(record.bestCorrect, correctSteps),
        total: totalSteps,
        lastPracticeRewardDate: reward.reason === "practice" ? today : record.lastPracticeRewardDate,
      },
    };
  } else if (session.kind === "daily") {
    // The session key carries the date the challenge belongs to.
    const date = key.slice("daily:".length) || today;
    const record = next.daily[date];
    const rewarded = record?.rewarded ?? false;
    firstCompletion = !rewarded;
    reward = rewarded
      ? { xp: 0, bonus: 0, reason: "daily-already-claimed" }
      : { xp: REWARDS.dailyChallenge, bonus: 0, reason: "daily" };
    next.daily = pruneDaily({
      ...next.daily,
      [date]: { challengeId: session.refId, completedAt: record?.completedAt ?? nowIso, rewarded: true },
    });
  } else {
    const claimed = next.lastReviewRewardDate === today;
    reward = claimed ? { xp: 0, bonus: 0, reason: "review-already-claimed" } : { xp: REWARDS.review, bonus: 0, reason: "review" };
    if (!claimed) next.lastReviewRewardDate = today;
  }

  const levelBefore = levelForXp(next.xp);
  next.xp += reward.xp + reward.bonus;
  next.streak = recordActiveDay(next.streak, today);
  next.stats = {
    ...next.stats,
    sessionsCompleted: next.stats.sessionsCompleted + 1,
    lastActivity: { kind: session.kind, refId: session.refId, at: nowIso },
  };

  const unitCompleted = markCompletedUnits(next, units, nowIso);
  next = unitCompleted.data;

  return {
    data: next,
    summary: {
      kind: session.kind,
      refId: session.refId,
      correctSteps,
      totalSteps,
      correctAnswers: session.outcomes.reduce((n, o) => n + o.correctCount, 0),
      incorrectAnswers: session.outcomes.reduce((n, o) => n + o.incorrectCount, 0),
      reward,
      levelBefore,
      levelAfter: levelForXp(next.xp),
      firstCompletion,
      unitCompleted: unitCompleted.newlyCompleted,
    },
  };
}

export function completeIntro(
  data: ProgressData,
  introId: string,
  today: string,
  nowIso: string,
  units: Unit[],
): { data: ProgressData; xp: number } {
  if (data.intros[introId]) return { data, xp: 0 };
  let next: ProgressData = {
    ...data,
    xp: data.xp + REWARDS.introFirstCompletion,
    intros: { ...data.intros, [introId]: { completedAt: nowIso } },
    streak: recordActiveDay(data.streak, today),
    stats: { ...data.stats, lastActivity: { kind: "intro", refId: introId, at: nowIso } },
  };
  next = markCompletedUnits(next, units, nowIso).data;
  return { data: next, xp: REWARDS.introFirstCompletion };
}

export function isNodeCompleted(data: ProgressData, node: Unit["nodes"][number]): boolean {
  return node.kind === "intro" ? Boolean(data.intros[node.introId]) : Boolean(data.activities[node.activityId]?.firstCompletedAt);
}

function markCompletedUnits(data: ProgressData, units: Unit[], nowIso: string) {
  let newlyCompleted: string | null = null;
  for (const unit of units) {
    if (data.unitsCompleted[unit.id]) continue;
    if (unit.nodes.every((n) => isNodeCompleted(data, n))) {
      data = { ...data, unitsCompleted: { ...data.unitsCompleted, [unit.id]: nowIso } };
      newlyCompleted = unit.id;
    }
  }
  return { data, newlyCompleted };
}

/** Keeps the daily history small: the last 60 days are plenty for any UI. */
function pruneDaily(daily: Record<string, DailyRecord>): Record<string, DailyRecord> {
  const dates = Object.keys(daily).sort();
  if (dates.length <= 60) return daily;
  const keep = new Set(dates.slice(-60));
  return Object.fromEntries(Object.entries(daily).filter(([d]) => keep.has(d)));
}

/** Accuracy over every answer ever given, or null before the first answer. */
export function accuracy(data: ProgressData): number | null {
  const total = data.stats.correctAnswers + data.stats.incorrectAnswers;
  return total === 0 ? null : Math.round((data.stats.correctAnswers / total) * 100);
}

export function openMistakes(data: ProgressData): MistakeRecord[] {
  return Object.values(data.mistakes)
    .filter((m) => !m.resolved)
    .sort((a, b) => b.lastWrongAt.localeCompare(a.lastWrongAt));
}

/**
 * Turns whatever was saved into a valid current-version object. Unknown or
 * missing fields fall back to defaults instead of discarding the player's data.
 */
export function migrate(raw: unknown): ProgressData {
  const base = defaultProgress();
  if (!raw || typeof raw !== "object") return base;
  const saved = raw as Partial<ProgressData>;
  // Version 1 is the first schema. Future versions add steps here, e.g.
  // `if (saved.version === 1) saved = migrateV1toV2(saved)`.
  const obj = <T extends object>(value: unknown, fallback: T): T =>
    value && typeof value === "object" && !Array.isArray(value) ? { ...fallback, ...(value as T) } : fallback;
  const avatar = AVATARS.includes(saved.profile?.avatar as AvatarId) ? (saved.profile!.avatar as AvatarId) : base.profile.avatar;
  return {
    version: PROGRESS_VERSION,
    profile: { ...obj(saved.profile, base.profile), avatar },
    settings: obj(saved.settings, base.settings),
    xp: typeof saved.xp === "number" && saved.xp >= 0 ? saved.xp : 0,
    streak: obj(saved.streak, base.streak),
    stats: obj(saved.stats, base.stats),
    activities: obj(saved.activities, {}),
    intros: obj(saved.intros, {}),
    unitsCompleted: obj(saved.unitsCompleted, {}),
    daily: obj(saved.daily, {}),
    sessions: obj(saved.sessions, {}),
    mistakes: obj(saved.mistakes, {}),
    lastReviewRewardDate: typeof saved.lastReviewRewardDate === "string" ? saved.lastReviewRewardDate : undefined,
  };
}
