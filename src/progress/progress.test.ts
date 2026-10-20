import { describe, expect, it } from "vitest";
import { getContent } from "../content";
import type { Tier } from "../content/types";
import { levelForXp, levelProgress, xpForLevel } from "./levels";
import {
  bestClearedTier,
  completeIntro,
  completeSession,
  defaultProgress,
  migrate,
  openMistakes,
  recordStep,
  selectTierIn,
  sessionKey,
  startSession,
  type ProgressData,
  type SessionKind,
} from "./model";
import { nextNode, nodeStatus } from "./path";
import { REWARDS } from "./rewards";
import { displayedStreak, EMPTY_STREAK, recordActiveDay } from "./streak";
import { applyPromotion, defaultDifficulty, PROMOTION, promotionStatus, recordTierOutcome, selectTier } from "./tiers";

const NOW = "2026-10-19T10:00:00.000Z";
const TODAY = "2026-10-19";
const units = getContent("en").units;
const MODES = ["quiz", "form-word", "complete-verse", "match-pairs"] as const;

/** Plays a whole session; `wrong` lists step ids answered wrong. */
function play(
  data: ProgressData,
  key: string,
  kind: SessionKind,
  refId: string,
  steps: string[],
  { wrong = [] as string[], tier = 1 as Tier, mode = "quiz" as (typeof MODES)[number] } = {},
) {
  data = startSession(data, key, kind, refId, steps, tier, NOW);
  for (const id of steps) {
    const correct = !wrong.includes(id);
    data = recordStep(data, key, { stepId: id, correct, correctCount: correct ? 1 : 0, incorrectCount: correct ? 0 : 1 }, { mode, topicId: "creation" }, NOW);
  }
  return data;
}

function finish(data: ProgressData, key: string, today = TODAY) {
  const result = completeSession(data, key, today, NOW, units);
  if (!result) throw new Error("session did not complete");
  return result;
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
    expect(recordActiveDay(recordActiveDay(EMPTY_STREAK, "2026-12-31"), "2027-01-01").current).toBe(2);
  });

  it("ignores a clock that moved backwards", () => {
    const s = recordActiveDay(EMPTY_STREAK, "2026-03-05");
    expect(recordActiveDay(s, "2026-03-01")).toBe(s);
  });
});

describe("difficulty tiers", () => {
  const outcome = (i: number, correct: boolean, mode: (typeof MODES)[number] = MODES[i % 3]) => ({ stepId: `s${i}`, mode, correct });

  it("starts at Beginner", () => {
    expect(defaultProgress().difficulty).toMatchObject({ selected: 1, unlocked: 1 });
  });

  it("does not promote before enough answers", () => {
    let d = defaultDifficulty();
    for (let i = 0; i < PROMOTION.minAnswered - 1; i++) d = recordTierOutcome(d, 1, outcome(i, true));
    expect(promotionStatus(d).ready).toBe(false);
    expect(applyPromotion(d, NOW).unlocked).toBeNull();
  });

  it("promotes after enough accurate answers across several games", () => {
    let d = defaultDifficulty();
    for (let i = 0; i < PROMOTION.minAnswered; i++) d = recordTierOutcome(d, 1, outcome(i, i % 10 !== 0));
    const status = promotionStatus(d);
    expect(status.accuracy).toBeGreaterThanOrEqual(PROMOTION.minAccuracy);
    expect(status.ready).toBe(true);
    const promoted = applyPromotion(d, NOW);
    expect(promoted.unlocked).toBe(2);
    expect(promoted.state).toMatchObject({ unlocked: 2, selected: 2 });
  });

  it("requires accuracy, not just volume", () => {
    let d = defaultDifficulty();
    for (let i = 0; i < 40; i++) d = recordTierOutcome(d, 1, outcome(i, i % 3 !== 0));
    expect(promotionStatus(d).accuracy).toBeLessThan(PROMOTION.minAccuracy);
    expect(promotionStatus(d).ready).toBe(false);
  });

  it("requires several different games", () => {
    let d = defaultDifficulty();
    for (let i = 0; i < 20; i++) d = recordTierOutcome(d, 1, outcome(i, true, "quiz"));
    expect(promotionStatus(d).ready).toBe(false);
  });

  it("only counts the most recent answers, so improvement is rewarded", () => {
    let d = defaultDifficulty();
    for (let i = 0; i < 20; i++) d = recordTierOutcome(d, 1, outcome(i, false));
    expect(promotionStatus(d).ready).toBe(false);
    for (let i = 0; i < 20; i++) d = recordTierOutcome(d, 1, outcome(i, true));
    expect(d.recent[1]).toHaveLength(PROMOTION.window);
    expect(promotionStatus(d).ready).toBe(true);
  });

  it("answers at a lower tier do not promote", () => {
    let d = { ...defaultDifficulty(), unlocked: 2 as Tier, selected: 1 as Tier };
    for (let i = 0; i < 20; i++) d = recordTierOutcome(d, 1, outcome(i, true));
    expect(promotionStatus(d).ready).toBe(false);
  });

  it("stops at Master", () => {
    let d = { ...defaultDifficulty(), unlocked: 5 as Tier, selected: 5 as Tier };
    for (let i = 0; i < 20; i++) d = recordTierOutcome(d, 5, outcome(i, true));
    expect(promotionStatus(d).next).toBeNull();
    expect(applyPromotion(d, NOW).unlocked).toBeNull();
  });

  it("flags a struggling player without demoting them", () => {
    let d = { ...defaultDifficulty(), unlocked: 3 as Tier, selected: 3 as Tier };
    for (let i = 0; i < 10; i++) d = recordTierOutcome(d, 3, outcome(i, i % 4 === 0));
    expect(promotionStatus(d).struggling).toBe(true);
    expect(d.unlocked).toBe(3);
  });

  it("lets the player pick only unlocked tiers", () => {
    const d = { ...defaultDifficulty(), unlocked: 3 as Tier, selected: 3 as Tier };
    expect(selectTier(d, 1).selected).toBe(1);
    expect(selectTier(d, 4).selected).toBe(3);
  });

  it("promotes through completed sessions and saves the new tier", () => {
    let data = defaultProgress();
    let unlocked = null;
    for (const [i, mode] of MODES.entries()) {
      const id = `creation.${mode}`;
      const key = sessionKey.activity(id, 1);
      data = play(data, key, "activity", id, [`${mode}.a`, `${mode}.b`, `${mode}.c`, `${mode}.d`], { mode });
      const r = finish(data, key);
      data = r.data;
      if (r.summary.tierUnlocked) unlocked = { at: i, tier: r.summary.tierUnlocked };
    }
    expect(unlocked).toEqual({ at: 3, tier: 2 });
    expect(migrate(JSON.parse(JSON.stringify(data))).difficulty).toMatchObject({ unlocked: 2, selected: 2 });
    expect(selectTierIn(data, 1).difficulty.selected).toBe(1);
    expect(selectTierIn(data, 3)).toBe(data);
  });
});

describe("sessions and rewards", () => {
  const id = "creation.quiz";

  it("pays answers by tier plus a first-clear bonus, then limited practice XP", () => {
    const key = sessionKey.activity(id, 3);
    const first = finish(play(defaultProgress(), key, "activity", id, ["a", "b"], { tier: 3, wrong: ["b"] }), key);
    expect(first.summary.reward).toEqual({ xp: REWARDS.stepXp[3], bonus: REWARDS.firstClear[3], reason: "first-clear" });
    expect(first.data.xp).toBe(REWARDS.stepXp[3] + REWARDS.firstClear[3]);
    expect(first.data.streak.current).toBe(1);
    expect(bestClearedTier(first.data, id)).toBe(3);

    // Completing again is a no-op: the session is gone.
    expect(completeSession(first.data, key, TODAY, NOW, units)).toBeNull();

    const replay = finish(play(first.data, key, "activity", id, ["a", "b"], { tier: 3 }), key);
    expect(replay.summary.reward).toEqual({ xp: 2 * REWARDS.stepXp[3], bonus: 0, reason: "practice" });
    const again = finish(play(replay.data, key, "activity", id, ["a", "b"], { tier: 3 }), key);
    expect(again.summary.reward).toEqual({ xp: 0, bonus: 0, reason: "practice-already-claimed" });
    const nextDay = finish(play(again.data, key, "activity", id, ["a", "b"], { tier: 3 }), key, "2026-10-20");
    expect(nextDay.summary.reward.reason).toBe("practice");
  });

  it("adds a perfect bonus on a flawless first clear, and higher tiers pay more", () => {
    const k1 = sessionKey.activity(id, 1);
    const k5 = sessionKey.activity(id, 5);
    const t1 = finish(play(defaultProgress(), k1, "activity", id, ["a", "b"], { tier: 1 }), k1);
    const t5 = finish(play(defaultProgress(), k5, "activity", id, ["a", "b"], { tier: 5 }), k5);
    expect(t1.summary.reward.bonus).toBe(REWARDS.firstClear[1] + REWARDS.perfect[1]);
    expect(t5.data.xp).toBeGreaterThan(t1.data.xp);
  });

  it("does not complete a session with steps left", () => {
    const data = startSession(defaultProgress(), "k", "activity", id, ["a", "b"], 1, NOW);
    expect(completeSession(data, "k", TODAY, NOW, units)).toBeNull();
  });

  it("ignores a duplicate or out-of-order step record", () => {
    let data = startSession(defaultProgress(), "k", "activity", id, ["a", "b"], 1, NOW);
    const outcome = { stepId: "a", correct: true, correctCount: 1, incorrectCount: 0 };
    data = recordStep(data, "k", outcome, { mode: "quiz", topicId: "creation" }, NOW);
    expect(recordStep(data, "k", outcome, { mode: "quiz", topicId: "creation" }, NOW)).toBe(data);
    expect(data.stats.correctAnswers).toBe(1);
    expect(data.seen.a).toBe(1);
    expect(data.difficulty.recent[1]).toHaveLength(1);
  });

  it("resumes an unfinished session instead of redrawing it", () => {
    let data = startSession(defaultProgress(), "k", "activity", id, ["a", "b"], 1, NOW);
    data = recordStep(data, "k", { stepId: "a", correct: true, correctCount: 1, incorrectCount: 0 }, { mode: "quiz", topicId: "creation" }, NOW);
    const resumed = startSession(data, "k", "activity", id, ["x", "y"], 1, NOW);
    expect(resumed.sessions.k).toMatchObject({ stepIds: ["a", "b"], index: 1 });
  });

  it("rewards the daily challenge once per date", () => {
    const dKey = sessionKey.daily(TODAY);
    const first = finish(play(defaultProgress(), dKey, "daily", "daily.x", ["a"], { tier: 2 }), dKey);
    expect(first.summary.reward).toEqual({ xp: REWARDS.stepXp[2], bonus: REWARDS.daily[2], reason: "daily" });
    const second = finish(play(first.data, dKey, "daily", "daily.x", ["a"], { tier: 2 }), dKey);
    expect(second.summary.reward.xp + second.summary.reward.bonus).toBe(0);
  });

  it("records mistakes, clears them through review, and keeps reviews out of promotion", () => {
    const key = sessionKey.activity(id, 1);
    let data = play(defaultProgress(), key, "activity", id, ["a", "b"], { wrong: ["b"] });
    expect(openMistakes(data).map((m) => m.stepId)).toEqual(["b"]);
    data = finish(data, key).data;
    const before = data.difficulty.recent[1]?.length;
    data = play(data, sessionKey.review(), "review", "mistakes", ["b"]);
    expect(openMistakes(data)).toHaveLength(0);
    expect(data.difficulty.recent[1]?.length).toBe(before);
    expect(finish(data, sessionKey.review()).summary.reward.xp).toBe(REWARDS.review);
  });

  it("intro XP is granted once", () => {
    const first = completeIntro(defaultProgress(), "creation.intro", TODAY, NOW, units);
    expect(first.xp).toBe(REWARDS.introFirstCompletion);
    expect(completeIntro(first.data, "creation.intro", TODAY, NOW, units).xp).toBe(0);
  });

  it("marks the unit completed when every node is done", () => {
    const unit = units[0];
    let data = completeIntro(defaultProgress(), "creation.intro", TODAY, NOW, units).data;
    let last = null;
    for (const node of unit.nodes) {
      if (node.kind !== "activity") continue;
      const k = sessionKey.activity(node.activityId, 1);
      last = finish(play(data, k, "activity", node.activityId, ["x"]), k);
      data = last.data;
    }
    expect(last!.summary.unitCompleted).toBe(unit.id);
    expect(data.unitsCompleted[unit.id]).toBeTruthy();
  });
});

describe("path", () => {
  const unit = units[0];

  it("opens the first node and locks the rest", () => {
    const data = defaultProgress();
    expect(nodeStatus(data, unit, 0)).toBe("available");
    expect(nodeStatus(data, unit, 1)).toBe("locked");
    expect(nextNode(data, unit)?.index).toBe(0);
  });

  it("unlocks the next node after completing one, and shows in-progress", () => {
    let data = completeIntro(defaultProgress(), "creation.intro", TODAY, NOW, units).data;
    expect(nodeStatus(data, unit, 1)).toBe("available");
    const first = unit.nodes[1];
    if (first.kind !== "activity") throw new Error("expected an activity");
    data = startSession(data, sessionKey.activity(first.activityId, 1), "activity", first.activityId, ["x", "y"], 1, NOW);
    expect(nodeStatus(data, unit, 1)).toBe("in-progress");
    expect(nodeStatus(data, unit, 2)).toBe("locked");
  });
});

describe("saved progress", () => {
  it("returns defaults for missing or broken data", () => {
    expect(migrate(null)).toEqual(defaultProgress());
    expect(migrate("nonsense")).toEqual(defaultProgress());
  });

  it("round-trips the current version unchanged", () => {
    const key = sessionKey.activity("creation.quiz", 1);
    const data = finish(play(defaultProgress(), key, "activity", "creation.quiz", ["a", "b"], { wrong: ["a"] }), key).data;
    expect(migrate(JSON.parse(JSON.stringify(data)))).toEqual(data);
  });

  it("upgrades version 1 saves, keeping XP, path progress and mistakes", () => {
    const v1 = {
      version: 1,
      xp: 120,
      profile: { name: "Ruth" },
      settings: { sound: false },
      activities: { "creation.quiz": { startedAt: NOW, firstCompletedAt: NOW, completions: 2, bestCorrect: 5, total: 6 } },
      mistakes: { "creation.quiz.sky": { stepId: "creation.quiz.sky", mode: "quiz", topicId: "creation", wrongCount: 1, lastWrongAt: NOW, resolved: false } },
      sessions: { "activity:creation.quiz": { key: "activity:creation.quiz", kind: "activity", refId: "creation.quiz", stepIds: ["x"], index: 0, outcomes: [], startedAt: NOW } },
    };
    const migrated = migrate(v1);
    expect(migrated.version).toBe(2);
    expect(migrated.xp).toBe(120);
    expect(migrated.profile).toEqual({ name: "Ruth", avatar: "dawn" });
    expect(migrated.settings).toMatchObject({ sound: false, language: "en" });
    expect(migrated.activities["creation.quiz"].firstCompletedAt).toBe(NOW);
    expect(migrated.mistakes["creation.quiz.sky"]).toBeTruthy();
    expect(migrated.sessions).toEqual({});
    expect(migrated.difficulty).toMatchObject({ unlocked: 1, selected: 1 });
  });

  it("repairs an impossible selected tier", () => {
    expect(migrate({ difficulty: { unlocked: 2, selected: 4 } }).difficulty.selected).toBe(2);
  });
});

describe("home recommendation", async () => {
  const { recommend } = await import("./recommend");
  const pack = getContent("en");

  it("follows the Journey, then asks for clears at the current tier, then practice", () => {
    let data = defaultProgress();
    expect(recommend(data, pack)).toEqual({ kind: "intro", introId: "creation.intro" });
    data = completeIntro(data, "creation.intro", TODAY, NOW, units).data;
    expect(recommend(data, pack)).toMatchObject({ kind: "path", activityId: "creation.form-word" });

    const key = sessionKey.activity("creation.form-word", 1);
    data = startSession(data, key, "activity", "creation.form-word", ["a", "b"], 1, NOW);
    expect(recommend(data, pack)).toMatchObject({ kind: "continue", activityId: "creation.form-word" });

    for (const a of pack.topics[0].activities) {
      const k = sessionKey.activity(a.id, 1);
      data = abandonForTest(data, k);
      data = finish(play(data, k, "activity", a.id, ["x"]), k).data;
    }
    data = { ...data, difficulty: { ...data.difficulty, unlocked: 2, selected: 2 } };
    expect(recommend(data, pack)).toMatchObject({ kind: "clear", tier: 2 });
  });
});

function abandonForTest(data: ProgressData, key: string): ProgressData {
  const sessions = { ...data.sessions };
  delete sessions[key];
  return { ...data, sessions };
}
