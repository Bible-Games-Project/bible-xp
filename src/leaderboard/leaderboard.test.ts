import { describe, expect, it } from "vitest";
import { leaderboardService, localLeaderboard, rankScores, sampleLeaderboard, type PlayerScore } from "./leaderboard";

const me: PlayerScore = { playerId: "me", name: "Ruth", look: null, weeklyXp: 120 };

describe("leaderboard", () => {
  it("ranks by Weekly XP, highest first, sharing ranks on ties", () => {
    const ranked = rankScores([
      { ...me, playerId: "a", name: "Anna", weeklyXp: 50 },
      { ...me, playerId: "b", name: "Ben", weeklyXp: 300 },
      { ...me, playerId: "c", name: "Caleb", weeklyXp: 50 },
      { ...me, playerId: "d", name: "Dina", weeklyXp: 10 },
    ]);
    expect(ranked.map((e) => [e.playerId, e.rank])).toEqual([
      ["b", 1],
      ["a", 2],
      ["c", 2],
      ["d", 4],
    ]);
  });

  it("without a backend, shows only the player, unranked, and never other players", async () => {
    const board = await localLeaderboard.weekly("2026-10-19", me);
    expect(board.source).toBe("local");
    expect(board.entries).toEqual([]);
    expect(board.me).toEqual({ ...me, rank: null });
  });

  it("labels development sample data as sample", async () => {
    const board = await sampleLeaderboard.weekly("2026-10-19", me);
    expect(board.source).toBe("sample");
    expect(board.entries.every((e) => e.playerId === "me" || e.name.startsWith("Sample player"))).toBe(true);
    expect(board.me.rank).toBe(board.entries.find((e) => e.playerId === "me")!.rank);
  });

  it("uses the local service unless sample data is asked for", () => {
    expect(leaderboardService()).toBe(localLeaderboard);
  });
});
