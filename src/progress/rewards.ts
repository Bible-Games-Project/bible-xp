import type { Tier } from "../content/types";

/*
 * Every XP amount in the app comes from this table. XP rewards correct answers,
 * scaled by tier, so harder play earns more. Replays pay once per game, tier
 * and day; the daily challenge once per date.
 */
export const REWARDS = {
  /** Per step answered right at the first attempt. */
  stepXp: { 1: 2, 2: 3, 3: 4, 4: 5, 5: 6 } as Record<Tier, number>,
  /** First time a game is finished at a tier. */
  firstClear: { 1: 10, 2: 15, 3: 20, 4: 25, 5: 30 } as Record<Tier, number>,
  /** Extra on that first clear when every step was right first time. */
  perfect: { 1: 5, 2: 5, 3: 10, 4: 10, 5: 15 } as Record<Tier, number>,
  /** Completion bonus for the daily challenge, once per local date (answers also earn stepXp). */
  daily: { 1: 15, 2: 20, 3: 25, 4: 30, 5: 35 } as Record<Tier, number>,
  /** Reading a topic introduction for the first time. */
  introFirstCompletion: 10,
  /** Finishing a mistakes review, once per day. */
  review: 10,
} as const;

export type RewardReason =
  | "first-clear"
  | "practice"
  | "practice-already-claimed"
  | "daily"
  | "daily-already-claimed"
  | "review"
  | "review-already-claimed";

export interface RewardResult {
  /** XP for the answers. */
  xp: number;
  /** First-clear and perfect bonuses. */
  bonus: number;
  reason: RewardReason;
}
