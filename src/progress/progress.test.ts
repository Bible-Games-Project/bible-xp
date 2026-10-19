import { describe, expect, it } from "vitest";
import { getContent } from "../content";
import { levelForXp, levelProgress, xpForLevel } from "./levels";
import {
  completeIntro,
  completeSession,
  defaultProgress,
  migrate,
  openMistakes,
  recordStep,
  sessionKey,
  startSession,
  type ProgressData,
} from "./model";
import { REWARDS } from "./rewards";
import { displayedStreak, EMPTY_STREAK, recordActiveDay } from "./streak";

const NOW = "2026-10-19T10:00:00.000Z";
const units = getContent("en").units;
const meta = { mode: "quiz" as const, topicId: "creation" };

function play(data: ProgressData, key: string, kind: "activity" | "daily" | "review", refId: string, steps: string[], wrong: string[] = []) {
  data = startSession(data, key, kind, refId, steps, NOW);
  for (const id of steps) {
    const correct = !wrong.includes(id);
    data = recordStep(data, key, { stepId: id, correct, correctCount: correct ? 1 : 0, incorrectCount: correct ? 0 : 1 }, meta, NOW);
  }
  return data;
}

describe("levels", () => {
  it("starts at level 1 and grows with XP", () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(49)).toBe(1);
    expect(levelForXp(50)).toBe(2);
    expect(levelForXp(xpForLevel(5))).toBe(5);
    expect(levelProgress(60)).toEqual({ level: 2, current: 10, needed: 100 });
  });
});

describe("streak", () => {
  it("handles first day, same day, consecutive day and a missed day", () => {
    let s = recordActiveDay(EMPTY_STREAK, "2026-03-01");
    expect(s.current).toBe(1);
    s = recordActiveDay(s, "2026-03-01");
    expect(s.current).toBe(1);
    s = recordActiveDay(s, "2026-03-02");
    expect(s.current).toBe(2);
    expect(displayedStreak(s, "2026-03-03")).toBe(2);
    expect(displayedStreak(s, "2026-03-04")).toBe(0);
    s = recordActiveDay(s, "2026-03-05");
    expect(s).toEqual({ current: 1, best: 2, lastActiveDate: "2026-03-05" });
  });

  it("crosses month and year boundaries", () => {
    const s = recordActiveDay(recordActiveDay(EMPTY_STREAK, "2026-12-31"), "2027-01-01");
    expect(s.current).toBe(2);
  });

  it("ignores a clock that moved backwards", () => {
    const s = recordActiveDay(EMPTY_STREAK, "2026-03-05");
    expect(recordActiveDay(s, "2026-03-01")).toBe(s);
  });
});

describe("sessions and rewards", () => {
  const key = sessionKey.activity("creation.quiz");

  it("grants first-completion XP once, then limited practice XP", () => {
    let data = play(defaultProgress(), key, "activity", "creation.quiz", ["a", "b"]);
    const first = completeSession(data, key, "2026-10-19", NOW, units)!;
    expect(first.summary.reward).toEqual({ xp: REWARDS.activityFirstCompletion, bonus: REWARDS.perfectBonus, reason: "first-completion" });
    data = first.data;
    expect(data.xp).toBe(REWARDS.activityFirstCompletion + REWARDS.perfectBonus);
    expect(data.streak.current).toBe(1);

    // Completing again is a no-op: the session is gone.
    expect(completeSession(data, key, "2026-10-19", NOW, units)).toBeNull();

    const replay = completeSession(play(data, key, "activity", "creation.quiz", ["a", "b"]), key, "2026-10-19", NOW, units)!;
    expect(replay.summary.reward.reason).toBe("practice");
    const again = completeSession(play(replay.data, key, "activity", "creation.quiz", ["a", "b"]), key, "2026-10-19", NOW, units)!;
    expect(again.summary.reward).toEqual({ xp: 0, bonus: 0, reason: "practice-already-claimed" });
    const nextDay = completeSession(play(again.data, key, "activity", "creation.quiz", ["a", "b"]), key, "2026-10-20", NOW, units)!;
    expect(nextDay.summary.reward.reason).toBe("practice");
  });

  it("does not complete a session with steps left", () => {
    const data = startSession(defaultProgress(), key, "activity", "creation.quiz", ["a", "b"], NOW);
    expect(completeSession(data, key, "2026-10-19", NOW, units)).toBeNull();
  });

  it("ignores a duplicate or out-of-order step record", () => {
    let data = startSession(defaultProgress(), key, "activity", "creation.quiz", ["a", "b"], NOW);
    const outcome = { stepId: "a", correct: true, correctCount: 1, incorrectCount: 0 };
    data = recordStep(data, key, outcome, meta, NOW);
    const same = recordStep(data, key, outcome, meta, NOW);
    expect(same).toBe(data);
    expect(data.stats.correctAnswers).toBe(1);
  });

  it("resumes an unfinished session instead of restarting it", () => {
    let data = startSession(defaultProgress(), key, "activity", "creation.quiz", ["a", "b"], NOW);
    data = recordStep(data, key, { stepId: "a", correct: true, correctCount: 1, incorrectCount: 0 }, meta, NOW);
    expect(startSession(data, key, "activity", "creation.quiz", ["a", "b"], NOW).sessions[key].index).toBe(1);
  });

  it("rewards the daily challenge once per date", () => {
    const dKey = sessionKey.daily("2026-10-19");
    const first = completeSession(play(defaultProgress(), dKey, "daily", "daily.x", ["a"]), dKey, "2026-10-19", NOW, units)!;
    expect(first.summary.reward.xp).toBe(REWARDS.dailyChallenge);
    const second = completeSession(play(first.data, dKey, "daily", "daily.x", ["a"]), dKey, "2026-10-19", NOW, units)!;
    expect(second.summary.reward.xp).toBe(0);
    expect(second.data.xp).toBe(REWARDS.dailyChallenge);
  });

  it("records mistakes and clears them through review", () => {
    let data = play(defaultProgress(), key, "activity", "creation.quiz", ["a", "b"], ["b"]);
    expect(openMistakes(data).map((m) => m.stepId)).toEqual(["b"]);
    data = completeSession(data, key, "2026-10-19", NOW, units)!.data;
    expect(data.xp).toBe(REWARDS.activityFirstCompletion);
    const rKey = sessionKey.review();
    data = play(data, rKey, "review", "mistakes", ["b"]);
    expect(openMistakes(data)).toHaveLength(0);
  });

  it("intro XP is granted once", () => {
    const first = completeIntro(defaultProgress(), "creation.intro", "2026-10-19", NOW, units);
    expect(first.xp).toBe(REWARDS.introFirstCompletion);
    expect(completeIntro(first.data, "creation.intro", "2026-10-19", NOW, units).xp).toBe(0);
  });

  it("marks the unit completed when every node is done", () => {
    const unit = units[0];
    let data = completeIntro(defaultProgress(), "creation.intro", "2026-10-19", NOW, units).data;
    let last = null;
    for (const node of unit.nodes) {
      if (node.kind !== "activity") continue;
      const k = sessionKey.activity(node.activityId);
      last = completeSession(play(data, k, "activity", node.activityId, ["x"]), k, "2026-10-19", NOW, units)!;
      data = last.data;
    }
    expect(last!.summary.unitCompleted).toBe(unit.id);
    expect(data.unitsCompleted[unit.id]).toBeTruthy();
  });
});

describe("migration", () => {
  it("returns defaults for missing or broken data", () => {
    expect(migrate(null)).toEqual(defaultProgress());
    expect(migrate("nonsense")).toEqual(defaultProgress());
  });

  it("keeps saved values and fills in new fields", () => {
    const migrated = migrate({ version: 1, xp: 120, profile: { name: "Ruth" }, settings: { sound: false } });
    expect(migrated.xp).toBe(120);
    expect(migrated.profile).toEqual({ name: "Ruth", avatar: "dawn" });
    expect(migrated.settings.sound).toBe(false);
    expect(migrated.settings.language).toBe("en");
  });
});

describe("path", async () => {
  const { nodeStatus, nextNode } = await import("./path");
  const unit = units[0];

  it("opens the first node and locks the rest", () => {
    const data = defaultProgress();
    expect(nodeStatus(data, unit, 0)).toBe("available");
    expect(nodeStatus(data, unit, 1)).toBe("locked");
    expect(nextNode(data, unit)?.index).toBe(0);
  });

  it("unlocks the next node after completing one, and shows in-progress", () => {
    let data = completeIntro(defaultProgress(), "creation.intro", "2026-10-19", NOW, units).data;
    expect(nodeStatus(data, unit, 0)).toBe("completed");
    expect(nodeStatus(data, unit, 1)).toBe("available");
    const first = unit.nodes[1];
    if (first.kind !== "activity") throw new Error("expected an activity");
    data = startSession(data, sessionKey.activity(first.activityId), "activity", first.activityId, ["x", "y"], NOW);
    expect(nodeStatus(data, unit, 1)).toBe("in-progress");
    expect(nodeStatus(data, unit, 2)).toBe("locked");
  });
});
