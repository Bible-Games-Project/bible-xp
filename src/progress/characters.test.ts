import { describe, expect, it } from "vitest";
import { getContent } from "../content";
import { CHARACTERS, STARTING_CHARACTER, unlockState, unlockedIds, type JourneyStories } from "./characters";
import { defaultProgress, markCharactersSeen, markShared } from "./model";

const pack = getContent("en");
const journey: JourneyStories = { units: pack.units, planned: pack.plannedStories };
const unlocked = (data = defaultProgress(), plus = false) => unlockedIds(unlockState(data, journey, plus));

describe("Bible characters catalogue", () => {
  it("has 200 men and 200 women with unique ids", () => {
    expect(CHARACTERS.filter((c) => c.gender === "male")).toHaveLength(200);
    expect(CHARACTERS.filter((c) => c.gender === "female")).toHaveLength(200);
    expect(new Set(CHARACTERS.map((c) => c.id)).size).toBe(CHARACTERS.length);
  });

  it("has five Plus characters of each gender", () => {
    for (const gender of ["male", "female"])
      expect(CHARACTERS.filter((c) => c.gender === gender && c.unlock.kind === "plus")).toHaveLength(5);
  });

  it("starts with Adam and Eve only", () => {
    expect(CHARACTERS.filter((c) => c.unlock.kind === "start").map((c) => c.id)).toEqual(Object.values(STARTING_CHARACTER));
  });

  it("names and describes every character, with no curly quotes", () => {
    for (const c of CHARACTERS) {
      const text = pack.characters[c.id];
      expect(text?.name, c.id).toBeTruthy();
      expect(text?.about, c.id).toBeTruthy();
      expect(`${text.name} ${text.about} ${text.why ?? ""}`, c.id).not.toMatch(/[“”]/);
    }
    expect(Object.keys(pack.characters).sort()).toEqual(CHARACTERS.map((c) => c.id).sort());
  });

  it("points story and book unlocks at real stories and books", () => {
    const stories = new Set([...pack.units.map((u) => u.id), ...pack.plannedStories.map((s) => s.id)]);
    const books = new Set(pack.books.map((b) => b.id));
    for (const c of CHARACTERS) {
      if (c.unlock.kind === "story") expect(stories.has(c.unlock.story), c.id).toBe(true);
      if (c.unlock.kind === "book") expect(books.has(c.unlock.book), c.id).toBe(true);
    }
  });
});

describe("character unlocks", () => {
  it("opens only Adam and Eve for a new player", () => {
    expect(unlocked()).toEqual(["adam", "eve"]);
  });

  it("unlocks the constant characters with the best streak", () => {
    const data = defaultProgress();
    const week = unlocked({ ...data, streak: { ...data.streak, best: 7 } });
    expect(week).toEqual(expect.arrayContaining(["joshua", "rahab"]));
    expect(week).not.toContain("daniel");
    expect(unlocked({ ...data, streak: { ...data.streak, best: 365 } })).toEqual(
      expect.arrayContaining(["joshua", "rahab", "daniel", "ruth", "caleb", "hannah", "enoch", "anna"]),
    );
  });

  it("unlocks Andrew and the Samaritan woman after sharing", () => {
    const shared = markShared(defaultProgress(), "2026-11-08T10:00:00.000Z");
    expect(unlocked(shared)).toEqual(expect.arrayContaining(["andrew", "samaritan-woman"]));
    // The first share date is kept.
    expect(markShared(shared, "2026-12-01T10:00:00.000Z").sharedAt).toBe("2026-11-08T10:00:00.000Z");
  });

  it("keeps Plus characters locked until Plus exists", () => {
    expect(unlocked()).not.toContain("judas-iscariot");
    expect(unlocked(defaultProgress(), true)).toContain("judas-iscariot");
  });

  it("unlocks story characters once the story is finished", () => {
    const fake = { ...pack.units[0], id: "gen-noah" };
    const data = { ...defaultProgress(), unitsCompleted: { "gen-noah": "2026-11-08T10:00:00.000Z" } };
    const state = unlockState(data, { units: [...pack.units, fake], planned: [] });
    expect(unlockedIds(state)).toEqual(expect.arrayContaining(["noah", "noahs-wife", "methuselah"]));
    expect(unlockedIds(state)).not.toContain("joseph");
    // Genesis is not finished while Creation is still to play.
    expect(state.bookDone("GEN")).toBe(false);
    const all = { ...data, unitsCompleted: { ...data.unitsCompleted, ...Object.fromEntries(pack.units.map((u) => [u.id, "2026-11-08"])) } };
    expect(unlockState(all, { units: [...pack.units, fake], planned: [] }).bookDone("GEN")).toBe(true);
    // A book with stories still announced is not finished.
    expect(unlockState(all, journey).bookDone("GEN")).toBe(false);
  });

  it("records which unlocked characters the player has seen", () => {
    const data = markCharactersSeen(defaultProgress(), ["adam", "eve", "joshua", "nobody"]);
    expect(data.charactersSeen).toEqual(["adam", "eve", "joshua"]);
  });
});
