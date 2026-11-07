import { daysBetween } from "../lib/date";

export interface StreakState {
  current: number;
  best: number;
  /** Local date of the last day with a completed activity. */
  lastActiveDate: string | null;
}

export const EMPTY_STREAK: StreakState = { current: 0, best: 0, lastActiveDate: null };

/** Records a valid activity on `today`. Opening the app does not call this. */
export function recordActiveDay(streak: StreakState, today: string): StreakState {
  if (streak.lastActiveDate === today) return streak;
  const gap = streak.lastActiveDate ? daysBetween(streak.lastActiveDate, today) : null;
  // A negative gap means the device clock moved backwards; keep the streak as is.
  if (gap !== null && gap < 0) return streak;
  const current = gap === 1 ? streak.current + 1 : 1;
  return { current, best: Math.max(streak.best, current), lastActiveDate: today };
}

/** The streak to display: it is lost once a whole day passes without activity. */
export function displayedStreak(streak: StreakState, today: string): number {
  if (!streak.lastActiveDate) return 0;
  const gap = daysBetween(streak.lastActiveDate, today);
  return gap <= 1 ? streak.current : 0;
}

export function isActiveToday(streak: StreakState, today: string): boolean {
  return streak.lastActiveDate === today;
}
