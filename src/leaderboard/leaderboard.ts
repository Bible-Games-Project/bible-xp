import type { AvatarLook } from "../progress/avatar";

/*
 * Global weekly leaderboard, ranked by Weekly XP (never by Total XP).
 *
 * Testalume has no backend or player accounts yet, so there is no shared
 * ranking to read. The screen talks to a `LeaderboardService`; today that is
 * `localLeaderboard`, which only knows the player on this device and says so
 * (source "local"). A future shared backend implements the same interface,
 * returns source "global", and becomes the authority for the competition week
 * (see progress/week.ts). Nothing here invents other players: the sample
 * service exists only in developer builds and labels itself as sample data.
 */

/** What this device knows about the current player for the ranking. */
export interface PlayerScore {
  playerId: string;
  name: string;
  look: AvatarLook | null;
  weeklyXp: number;
}

export interface LeaderboardEntry extends PlayerScore {
  /** 1-based; players with the same Weekly XP share a rank (1, 2, 2, 4). */
  rank: number;
}

export type LeaderboardSource = "global" | "local" | "sample";

export interface WeeklyLeaderboard {
  /** Monday (UTC) that starts the competition week, YYYY-MM-DD. */
  weekStart: string;
  source: LeaderboardSource;
  /** Top of the ranking, highest Weekly XP first. Always empty for "local". */
  entries: LeaderboardEntry[];
  /** The current player; `rank` is null when there is no shared ranking. */
  me: PlayerScore & { rank: number | null };
}

export interface LeaderboardService {
  weekly(weekStart: string, me: PlayerScore): Promise<WeeklyLeaderboard>;
}

/** Sorts by Weekly XP (then name, for a stable order) and assigns shared ranks. */
export function rankScores(scores: PlayerScore[]): LeaderboardEntry[] {
  const sorted = [...scores].sort((a, b) => b.weeklyXp - a.weeklyXp || a.name.localeCompare(b.name));
  const entries: LeaderboardEntry[] = [];
  sorted.forEach((score, i) => {
    const previous = entries[i - 1];
    entries.push({ ...score, rank: previous && previous.weeklyXp === score.weeklyXp ? previous.rank : i + 1 });
  });
  return entries;
}

/** No shared data: only the player's own Weekly XP, without a rank. */
export const localLeaderboard: LeaderboardService = {
  async weekly(weekStart, me) {
    return { weekStart, source: "local", entries: [], me: { ...me, rank: null } };
  },
};

const SAMPLE_CHARACTERS = ["noah", "sarah", "abel", "rebekah", "seth", "hagar", "shem", "eve", "adam"];

/** Development only: made-up players to preview the layout. Never shipped as real data. */
export const sampleLeaderboard: LeaderboardService = {
  async weekly(weekStart, me) {
    const sample: PlayerScore[] = [420, 365, 310, 310, 240, 185, 120, 75, 30].map((weeklyXp, i) => ({
      playerId: `sample-${i + 1}`,
      name: `Sample player ${i + 1}`,
      look: { character: SAMPLE_CHARACTERS[i % SAMPLE_CHARACTERS.length], equipped: {} },
      weeklyXp,
    }));
    const entries = rankScores([...sample, me]);
    const mine = entries.find((e) => e.playerId === me.playerId)!;
    return { weekStart, source: "sample", entries, me: { ...me, rank: mine.rank } };
  },
};

/**
 * The service the app uses. When a shared backend exists, return its
 * implementation here; screens do not change.
 */
export function leaderboardService(options: { sample?: boolean } = {}): LeaderboardService {
  // Written out (not DEV_BUILD from dev/devMode) so release builds fold it to false and drop the sample data.
  const developerBuild = import.meta.env.DEV || import.meta.env.MODE === "devtools";
  return options.sample && developerBuild ? sampleLeaderboard : localLeaderboard;
}
