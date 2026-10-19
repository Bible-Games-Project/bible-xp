import type { GameMode, Tier } from "../content/types";

/*
 * Difficulty tiers. The player starts at Beginner and unlocks the next tier
 * by answering well at their highest unlocked tier, across several games.
 * XP never unlocks a tier, and a tier is never taken away.
 */

export const PROMOTION = {
  /** Only the most recent answers at the tier count. */
  window: 20,
  /** Answers needed at the tier before promotion is possible. */
  minAnswered: 15,
  /** First-try accuracy needed across the window. */
  minAccuracy: 0.8,
  /** Different game modes that must be played at the tier. */
  minModes: 3,
} as const;

export const MAX_TIER: Tier = 5;

export interface TierOutcome {
  stepId: string;
  mode: GameMode;
  correct: boolean;
}

export interface DifficultyState {
  /** The tier new sessions are played at. */
  selected: Tier;
  /** The highest tier the player has unlocked. */
  unlocked: Tier;
  /** Recent first-try results per tier, newest last. */
  recent: Partial<Record<Tier, TierOutcome[]>>;
  /** When each tier was unlocked (ISO time). */
  unlockedAt: Partial<Record<Tier, string>>;
}

export function defaultDifficulty(): DifficultyState {
  return { selected: 1, unlocked: 1, recent: {}, unlockedAt: {} };
}

export function recordTierOutcome(state: DifficultyState, tier: Tier, outcome: TierOutcome): DifficultyState {
  const list = [...(state.recent[tier] ?? []), outcome].slice(-PROMOTION.window);
  return { ...state, recent: { ...state.recent, [tier]: list } };
}

export interface TierStats {
  answered: number;
  correct: number;
  /** 0..1, or null before any answer. */
  accuracy: number | null;
  modes: number;
}

export function tierStats(state: DifficultyState, tier: Tier): TierStats {
  const list = state.recent[tier] ?? [];
  const correct = list.filter((o) => o.correct).length;
  return {
    answered: list.length,
    correct,
    accuracy: list.length ? correct / list.length : null,
    modes: new Set(list.map((o) => o.mode)).size,
  };
}

export interface PromotionStatus extends TierStats {
  /** The tier being worked on (the highest unlocked). */
  tier: Tier;
  /** The tier that would unlock, or null at Master. */
  next: Tier | null;
  ready: boolean;
  /** True when recent results suggest practising an easier tier. */
  struggling: boolean;
}

export function promotionStatus(state: DifficultyState): PromotionStatus {
  const tier = state.unlocked;
  const stats = tierStats(state, tier);
  const next = tier < MAX_TIER ? ((tier + 1) as Tier) : null;
  const ready =
    next !== null &&
    stats.answered >= PROMOTION.minAnswered &&
    stats.accuracy !== null &&
    stats.accuracy >= PROMOTION.minAccuracy &&
    stats.modes >= PROMOTION.minModes;
  const struggling = tier > 1 && stats.answered >= 8 && (stats.accuracy ?? 1) < 0.5;
  return { ...stats, tier, next, ready, struggling };
}

/** Unlocks the next tier when earned and moves the player onto it. */
export function applyPromotion(state: DifficultyState, nowIso: string): { state: DifficultyState; unlocked: Tier | null } {
  const status = promotionStatus(state);
  if (!status.ready || !status.next) return { state, unlocked: null };
  return {
    state: { ...state, unlocked: status.next, selected: status.next, unlockedAt: { ...state.unlockedAt, [status.next]: nowIso } },
    unlocked: status.next,
  };
}

export function selectTier(state: DifficultyState, tier: Tier): DifficultyState {
  return tier <= state.unlocked ? { ...state, selected: tier } : state;
}
