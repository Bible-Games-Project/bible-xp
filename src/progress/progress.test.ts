import { describe, expect, it } from "vitest";
import { getContent } from "../content";
import type { Tier } from "../content/types";
import { levelForXp, levelProgress, xpForLevel } from "./levels";
import { STARTING_TIER, tierForKnowledge } from "./avatar";
import { canEquip, newlyUnlocked, type CosmeticItem } from "./cosmetics";
import {
  bestClearedTier,
  completeIntro,
  completeOnboarding,
  completeSession,
  defaultProgress,
  grantXp,
  migrate,
  PROGRESS_VERSION,
  openMistakes,
  recordStep,
  selectTierIn,
  sessionKey,
  setLook,
  startSession,
  type ProgressData,
  type SessionKind,
} from "./model";
import { nextNode, nodeStatus } from "./path";
import { REWARDS } from "./rewards";
import { displayedStreak, EMPTY_STREAK, recordActiveDay } from "./streak";
import { addWeeklyXp, weekEndUtc, weeklyXpAt, weekStartUtc } from "./week";

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
  it("starts at Beginner with every tier open", () => {
    const data = defaultProgress();
    expect(data.difficulty).toEqual({ selected: 1 });
    for (const tier of [1, 2, 3, 4, 5] as Tier[]) expect(selectTierIn(data, tier).difficulty.selected).toBe(tier);
  });

  it("ignores an invalid tier", () => {
    const data = defaultProgress();
    expect(selectTierIn(data, 9 as Tier)).toBe(data);
  });

  it("plays sessions at the tier they were started with and saves it", () => {
    let data = selectTierIn(defaultProgress(), 4);
    const key = sessionKey.activity("creation.quiz", 4);
    data = finish(play(data, key, "activity", "creation.quiz", ["a"], { tier: 4 }), key).data;
    expect(data.tierClears["creation.quiz@4"]).toBeTruthy();
    expect(migrate(JSON.parse(JSON.stringify(data))).difficulty.selected).toBe(4);
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

  it("records mistakes and clears them through review", () => {
    const key = sessionKey.activity(id, 1);
    let data = play(defaultProgress(), key, "activity", id, ["a", "b"], { wrong: ["b"] });
    expect(openMistakes(data).map((m) => m.stepId)).toEqual(["b"]);
    data = finish(data, key).data;
    data = play(data, sessionKey.review(), "review", "mistakes", ["b"]);
    expect(openMistakes(data)).toHaveLength(0);
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
    const sameId = (d: ProgressData) => ({ ...d, profile: { ...d.profile, playerId: "id" } });
    expect(sameId(migrate(null))).toEqual(sameId(defaultProgress()));
    expect(sameId(migrate("nonsense"))).toEqual(sameId(defaultProgress()));
    expect(migrate(null).profile.playerId).not.toBe("");
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
    expect(migrated.version).toBe(PROGRESS_VERSION);
    expect(migrated.settings.music).toBe(true);
    expect(migrated.xp).toBe(120);
    expect(migrated.profile).toEqual({ playerId: expect.any(String), name: "Ruth", knowledge: null, look: null });
    expect(migrated.onboarding.completedAt).toBeNull();
    expect(migrated.settings).toMatchObject({ sound: false, language: "en" });
    expect(migrated.activities["creation.quiz"].firstCompletedAt).toBe(NOW);
    expect(migrated.mistakes["creation.quiz.sky"]).toBeTruthy();
    expect(migrated.sessions).toEqual({});
    expect(migrated.difficulty).toEqual({ selected: 1 });
  });

  it("upgrades version 3 saves: lifetime XP kept, weekly XP from zero, onboarding still to do", () => {
    const v3 = { version: 3, xp: 287, profile: { name: "Ruth", avatar: "flame" }, difficulty: { selected: 4 } };
    const migrated = migrate(v3);
    expect(migrated.xp).toBe(287);
    expect(migrated.weekly.xp).toBe(0);
    expect(migrated.profile).toEqual({ playerId: expect.any(String), name: "Ruth", knowledge: null, look: null });
    expect(migrated.onboarding.completedAt).toBeNull();
    expect(migrated.difficulty.selected).toBe(4);
    expect(migrated.cosmetics).toEqual({ unlocked: [] });
  });

  it("keeps a saved player id, look and weekly XP", () => {
    const saved = {
      version: 4,
      profile: { playerId: "p-1", name: "Ruth", knowledge: "advanced", look: { presentation: "female", skin: "dark", equipped: {} } },
      onboarding: { completedAt: NOW },
      weekly: { weekStart: "2026-10-19", xp: 40 },
    };
    const migrated = migrate(saved);
    // Version 6 replaced gender and skin tone with Bible characters: Eve for the female look.
    expect(migrated.profile).toEqual({ ...saved.profile, look: { character: "eve", equipped: {} } });
    expect(migrated.onboarding.completedAt).toBe(NOW);
    expect(migrated.weekly).toEqual(saved.weekly);
    expect(migrate({ profile: { look: { presentation: "male", skin: "light" } } }).profile.look).toEqual({ character: "adam", equipped: {} });
    expect(migrate({ profile: { look: { presentation: "robot", skin: "light" } } }).profile.look).toBeNull();
    expect(migrate({ profile: { look: { character: "noah", equipped: {} } } }).profile.look).toEqual({ character: "noah", equipped: {} });
    expect(migrate({ profile: { look: { character: "nobody", equipped: {} } } }).profile.look).toBeNull();
    expect(migrated.sharedAt).toBeNull();
    expect(migrated.charactersSeen).toEqual(["adam", "eve"]);
  });

  it("upgrades version 2 saves, keeping the selected tier and dropping unlock data", () => {
    expect(migrate({ version: 2, difficulty: { unlocked: 2, selected: 2, recent: {}, unlockedAt: {} } }).difficulty).toEqual({ selected: 2 });
    expect(migrate({ difficulty: { selected: 7 } }).difficulty).toEqual({ selected: 1 });
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
    data = selectTierIn(data, 2);
    expect(recommend(data, pack)).toMatchObject({ kind: "clear", tier: 2 });
  });
});

function abandonForTest(data: ProgressData, key: string): ProgressData {
  const sessions = { ...data.sessions };
  delete sessions[key];
  return { ...data, sessions };
}

describe("journey position", async () => {
  const { currentUnit, bookProgress } = await import("./path");
  const pack = getContent("en");
  const order = pack.books.map((b) => b.id);

  it("starts at the first story and stays there until it is finished", () => {
    expect(currentUnit(defaultProgress(), pack.units, order)?.id).toBe("unit-1");
  });

  it("counts finished stories of a book against open and announced ones", () => {
    const genesis = pack.units.filter((u) => u.bookId === "GEN");
    const planned = pack.plannedStories.filter((s) => s.bookId === "GEN").length;
    expect(bookProgress(defaultProgress(), genesis, planned)).toEqual({ done: 0, total: genesis.length + planned });
    let data = completeIntro(defaultProgress(), "creation.intro", TODAY, NOW, units).data;
    for (const node of units[0].nodes) {
      if (node.kind !== "activity") continue;
      const k = sessionKey.activity(node.activityId, 1);
      data = finish(play(data, k, "activity", node.activityId, ["x"]), k).data;
    }
    expect(bookProgress(data, genesis, planned).done).toBe(1);
  });
});

describe("weekly XP", () => {
  it("weeks start on Monday 00:00 UTC", () => {
    expect(weekStartUtc(new Date("2026-10-19T00:00:00Z"))).toBe("2026-10-19"); // Monday
    expect(weekStartUtc(new Date("2026-10-25T23:59:59Z"))).toBe("2026-10-19"); // Sunday night
    expect(weekStartUtc(new Date("2026-10-26T00:00:00Z"))).toBe("2026-10-26");
    expect(weekStartUtc(new Date("2027-01-01T12:00:00Z"))).toBe("2026-12-28"); // across the year
    expect(weekEndUtc("2026-10-19").toISOString()).toBe("2026-10-26T00:00:00.000Z");
  });

  it("counts within a week and starts again in the next one", () => {
    const monday = new Date("2026-10-19T08:00:00Z");
    let weekly = addWeeklyXp({ weekStart: "2026-10-12", xp: 90 }, 10, monday);
    expect(weekly).toEqual({ weekStart: "2026-10-19", xp: 10 });
    weekly = addWeeklyXp(weekly, 5, new Date("2026-10-25T22:00:00Z"));
    expect(weekly.xp).toBe(15);
    expect(weeklyXpAt(weekly, new Date("2026-10-26T00:00:01Z"))).toBe(0);
  });

  it("every reward adds to both lifetime and weekly XP; a new week keeps lifetime XP", () => {
    let data = defaultProgress();
    const key = sessionKey.activity("creation.quiz", 1);
    data = finish(play(data, key, "activity", "creation.quiz", ["a", "b"]), key).data;
    const earned = data.xp;
    expect(earned).toBeGreaterThan(0);
    expect(data.weekly).toEqual({ weekStart: "2026-10-19", xp: earned });
    const nextWeek = "2026-10-27T09:00:00.000Z";
    data = grantXp(data, 10, nextWeek);
    expect(data.xp).toBe(earned + 10);
    expect(data.weekly).toEqual({ weekStart: "2026-10-26", xp: 10 });
    expect(completeIntro(data, "creation.intro", "2026-10-27", nextWeek, units).data.weekly.xp).toBe(10 + REWARDS.introFirstCompletion);
  });

  it("claimed rewards add nothing, to either total", () => {
    const key = sessionKey.daily(TODAY);
    const first = finish(play(defaultProgress(), key, "daily", "daily", ["a"]), key).data;
    const again = finish(play(first, key, "daily", "daily", ["a"]), key).data;
    expect(again.xp).toBe(first.xp);
    expect(again.weekly).toEqual(first.weekly);
  });
});

describe("streak milestones", () => {
  it("are reported on the day the streak reaches them", () => {
    let data = defaultProgress();
    const milestones = ["2026-10-17", "2026-10-18", "2026-10-19"].map((day) => {
      const key = sessionKey.review();
      const result = completeSession(play(data, key, "review", "mistakes", ["a"]), key, day, `${day}T10:00:00.000Z`, units)!;
      data = result.data;
      return result.summary.streakMilestone;
    });
    expect(milestones).toEqual([null, null, 3]);
  });
});

describe("onboarding and avatar", () => {
  const look = { character: "eve", equipped: {} };
  const START = ["adam", "eve"];

  it("saves every choice and sets the starting difficulty, keeping progress", () => {
    const before = { ...defaultProgress(), xp: 55 };
    const after = completeOnboarding(before, { language: "en", knowledge: "intermediate", look }, NOW, START);
    expect(after.onboarding.completedAt).toBe(NOW);
    expect(after.profile.knowledge).toBe("intermediate");
    expect(after.profile.look).toEqual(look);
    expect(after.settings.language).toBe("en");
    expect(after.difficulty.selected).toBe(STARTING_TIER.intermediate);
    expect(after.xp).toBe(55);
    // Revisiting keeps the first completion date.
    expect(completeOnboarding(after, { language: "en", knowledge: "beginner", look }, "2026-11-01T00:00:00.000Z", START).onboarding.completedAt).toBe(NOW);
  });

  it("rejects incomplete choices and locked characters", () => {
    const data = defaultProgress();
    const old = { presentation: "male", skin: "brown", equipped: {} } as unknown as typeof look;
    expect(completeOnboarding(data, { language: "en", knowledge: "advanced", look: old }, NOW, START)).toBe(data);
    expect(completeOnboarding(data, { language: "en", knowledge: "advanced", look: { character: "noah", equipped: {} } }, NOW, START)).toBe(data);
    const done = completeOnboarding(data, { language: "en", knowledge: "advanced", look }, NOW, START);
    expect(setLook(done, { character: "judas-iscariot", equipped: {} }, START)).toBe(done);
    expect(setLook(done, { character: "adam", equipped: {} }, START).profile.look?.character).toBe("adam");
  });

  it("keeps a tier that already matches the chosen level", () => {
    expect(tierForKnowledge("advanced", 4)).toBe(4);
    expect(tierForKnowledge("advanced", 1)).toBe(3);
    expect(tierForKnowledge("beginner", 5)).toBe(1);
  });

  it("only lets unlocked, real cosmetics be worn", () => {
    const data = completeOnboarding(defaultProgress(), { language: "en", knowledge: "beginner", look }, NOW, START);
    const tried = setLook(data, { ...look, equipped: { clothing: "placeholder-robes", footwear: "unknown" } }, START);
    expect(tried.profile.look?.equipped).toEqual({});
  });
});

describe("cosmetic unlocks", () => {
  const catalog: CosmeticItem[] = [
    { id: "robe", slot: "clothing", unlock: { totalXp: 100 } },
    { id: "soon", slot: "clothing", unlock: null },
    { id: "placeholder-robes", slot: "clothing", placeholder: true, unlock: null },
  ];

  it("unlock with lifetime XP only once their requirement is set", () => {
    expect(newlyUnlocked([], 99, catalog)).toEqual([]);
    expect(newlyUnlocked([], 100, catalog)).toEqual(["robe"]);
    expect(newlyUnlocked(["robe"], 500, catalog)).toEqual([]);
  });

  it("can be worn only when unlocked and in their own slot", () => {
    expect(canEquip("robe", "clothing", [], catalog)).toBe(false);
    expect(canEquip("robe", "clothing", ["robe"], catalog)).toBe(true);
    expect(canEquip("robe", "footwear", ["robe"], catalog)).toBe(false);
    expect(canEquip("placeholder-robes", "clothing", ["placeholder-robes"], catalog)).toBe(false);
  });

  it("the shipped catalogue holds only placeholders, so XP unlocks nothing yet", () => {
    expect(grantXp(defaultProgress(), 100_000, NOW).cosmetics.unlocked).toEqual([]);
  });
});
