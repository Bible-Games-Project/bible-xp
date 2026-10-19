/** Every XP amount in the app comes from this table. */
export const REWARDS = {
  /** Finishing a path activity or Free Play game for the first time. */
  activityFirstCompletion: 20,
  /** Extra on a first completion with every step right first time. */
  perfectBonus: 5,
  /** Replaying an activity already completed: once per activity per day. */
  practice: 5,
  /** Reading a topic introduction for the first time. */
  introFirstCompletion: 10,
  /** Finishing the daily challenge: once per local date. */
  dailyChallenge: 30,
  /** Finishing a mistakes review session: once per day. */
  review: 5,
} as const;

export type RewardReason =
  | "first-completion"
  | "practice"
  | "practice-already-claimed"
  | "daily"
  | "daily-already-claimed"
  | "review"
  | "review-already-claimed";

export interface RewardResult {
  xp: number;
  bonus: number;
  reason: RewardReason;
}
