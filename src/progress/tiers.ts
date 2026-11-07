import type { Tier } from "../content/types";

/*
 * Difficulty tiers. Every tier is open from the start; the player picks one
 * in Settings and new games are played at it. XP rewards scale with the tier
 * (see rewards.ts), so harder play is worth more.
 */

export interface DifficultyState {
  /** The tier new sessions are played at. */
  selected: Tier;
}

export function defaultDifficulty(): DifficultyState {
  return { selected: 1 };
}

export const isTier = (v: unknown): v is Tier => v === 1 || v === 2 || v === 3 || v === 4 || v === 5;
