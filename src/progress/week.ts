/*
 * Competition weeks for Weekly XP and the weekly leaderboard.
 *
 * A week runs from Monday 00:00 UTC to the next Monday 00:00 UTC (ISO
 * weeks), the same instant for every player whatever their time zone. There
 * is no server yet, so the device clock decides which week it is; a shared
 * backend should become the authority for this once it exists.
 */

const DAY = 86_400_000;

/** The Monday (UTC) that starts the week containing `now`, as YYYY-MM-DD. */
export function weekStartUtc(now: Date): string {
  const midnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const daysSinceMonday = (now.getUTCDay() + 6) % 7;
  return new Date(midnight - daysSinceMonday * DAY).toISOString().slice(0, 10);
}

/** When the week starting on `weekStart` ends (the next Monday, 00:00 UTC). */
export function weekEndUtc(weekStart: string): Date {
  return new Date(Date.parse(`${weekStart}T00:00:00Z`) + 7 * DAY);
}

/** XP earned during one competition week. Lifetime XP is kept separately. */
export interface WeeklyXp {
  weekStart: string;
  xp: number;
}

/** Weekly XP for the week containing `now`: 0 once that week has moved on. */
export function weeklyXpAt(weekly: WeeklyXp, now: Date): number {
  return weekly.weekStart === weekStartUtc(now) ? weekly.xp : 0;
}

/** Adds XP to the current week, starting a new week's count when the week changed. */
export function addWeeklyXp(weekly: WeeklyXp, amount: number, now: Date): WeeklyXp {
  const weekStart = weekStartUtc(now);
  return { weekStart, xp: (weekly.weekStart === weekStart ? weekly.xp : 0) + amount };
}
