import { describe, expect, it } from "vitest";
import source from "./sources/web-genesis-1-3.json";
import { allSteps, dailyChallengeFor, drawSteps, getContent, SESSION_SIZE, stepsAtTier } from "./index";
import { TIERS, type BibleRef } from "./types";
import { decoyCount, scrambleLetters } from "../games/formWordLogic";

const web = source as Record<string, string>;
const pack = getContent("en");
const steps = allSteps(pack);

function verseKeys(ref: BibleRef): string[] {
  const end = ref.verseEnd ?? ref.verse;
  const keys: string[] = [];
  for (let v = ref.verse; v <= end; v++) keys.push(`${ref.chapter}:${v}`);
  return keys;
}

function passageText(refs: BibleRef[]): string {
  return refs.flatMap(verseKeys).map((k) => web[k]).join(" ");
}

/** Text inside curly double quotes, which the app reserves for Bible wording. */
function quotedFragments(text: string): string[] {
  return [...text.matchAll(/“([^”]+)”/g)].map((m) => m[1]);
}

describe("bible references", () => {
  const refs: BibleRef[] = [];
  for (const s of steps) {
    refs.push(...s.references);
    if (s.mode === "complete-verse") refs.push(s.ref);
    if (s.mode === "story-order") refs.push(...s.events.map((e) => e.ref));
    if (s.mode === "who-am-i") refs.push(...s.clues.map((c) => c.ref));
  }
  for (const topic of pack.topics) for (const sec of topic.intro.sections) if (sec.quote) refs.push(sec.quote.ref);

  it("every referenced verse exists in Genesis 1–3", () => {
    for (const ref of refs) {
      expect(ref.verseEnd === undefined || ref.verseEnd > ref.verse).toBe(true);
      for (const key of verseKeys(ref)) expect(web[key], key).toBeTypeOf("string");
    }
  });
});

describe("literal quotations match the World English Bible", () => {
  it("complete-the-verse fragments are verbatim", () => {
    for (const s of steps) {
      if (s.mode !== "complete-verse") continue;
      expect(s.translation).toBe("WEB");
      expect(web[`${s.ref.chapter}:${s.ref.verse}`]).toContain(s.before + s.answer + s.after);
    }
  });

  it("intro quotes are verbatim", () => {
    for (const topic of pack.topics)
      for (const sec of topic.intro.sections)
        if (sec.quote) expect(passageText([sec.quote.ref])).toContain(sec.quote.text);
  });

  it("quoted wording inside explanations appears in the referenced passages", () => {
    for (const s of steps) {
      for (const fragment of quotedFragments(s.explanation)) {
        expect(passageText(s.references), `${s.id}: ${fragment}`).toContain(fragment);
      }
    }
  });

  it("quoted wording in questions and pair cards appears in the referenced passages", () => {
    for (const s of steps) {
      const texts: string[] = [];
      if (s.mode === "quiz") texts.push(s.question);
      if (s.mode === "match-pairs") texts.push(...s.pairs.flatMap((p) => [p.left, p.right]));
      for (const t of texts)
        for (const fragment of quotedFragments(t)) expect(passageText(s.references), `${s.id}: ${fragment}`).toContain(fragment);
    }
  });

  it("clues and answer options never pose as quotations", () => {
    for (const s of steps) {
      const texts: string[] = [];
      if (s.mode === "form-word") texts.push(s.clue);
      if (s.mode === "who-am-i") texts.push(...s.clues.map((c) => c.text));
      if (s.mode === "quiz") texts.push(...s.options);
      for (const t of texts) expect(t, s.id).not.toMatch(/[“”]/);
    }
  });
});

describe("step data is playable", () => {
  it("step ids are unique per activity and globally", () => {
    const ids = steps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("form-the-word words can be built from their tiles, decoys included", () => {
    for (const s of steps) {
      if (s.mode !== "form-word") continue;
      expect(s.word).toMatch(/^[A-Z]+$/);
      expect(s.clue.toUpperCase(), s.id).not.toContain(s.word);
      const tiles = scrambleLetters(s.word, s.id, decoyCount(s.tier));
      expect(tiles).toHaveLength(s.word.length + decoyCount(s.tier));
      const pool = tiles.map((t) => t.letter);
      for (const letter of s.word) pool.splice(pool.indexOf(letter), 1);
      expect(pool).toHaveLength(decoyCount(s.tier));
      expect(tiles.map((t) => t.letter).join("").startsWith(s.word)).toBe(false);
      expect(new Set(tiles.map((t) => t.id)).size).toBe(tiles.length);
    }
  });

  it("quiz questions have four distinct options", () => {
    for (const s of steps) {
      if (s.mode !== "quiz") continue;
      expect(new Set(s.options).size).toBe(4);
      expect(s.options[s.correctIndex]).toBeTruthy();
    }
  });

  it("complete-the-verse options are distinct and include the answer", () => {
    for (const s of steps) {
      if (s.mode !== "complete-verse") continue;
      expect(new Set(s.options).size).toBe(s.options.length);
      expect(s.options).toContain(s.answer);
    }
  });

  it("match-the-pairs sides are unambiguous", () => {
    for (const s of steps) {
      if (s.mode !== "match-pairs") continue;
      expect(s.pairs.length).toBeGreaterThanOrEqual(3);
      expect(new Set(s.pairs.map((p) => p.left)).size).toBe(s.pairs.length);
      expect(new Set(s.pairs.map((p) => p.right)).size).toBe(s.pairs.length);
    }
  });

  it("story order has four to six events", () => {
    for (const s of steps) {
      if (s.mode !== "story-order") continue;
      expect(s.events.length).toBeGreaterThanOrEqual(4);
      expect(s.events.length).toBeLessThanOrEqual(6);
    }
  });

  it("who-am-i has one answer among distinct options and several clues", () => {
    for (const s of steps) {
      if (s.mode !== "who-am-i") continue;
      expect(new Set(s.options).size).toBe(s.options.length);
      expect(s.options.filter((o) => o === s.answer)).toHaveLength(1);
      expect(s.clues.length).toBeGreaterThanOrEqual(2);
      expect(s.clues.length).toBeLessThan(s.options.length);
      // The clues must not simply name the answer.
      const name = s.answer.replace(/^(The|A) /, "").toLowerCase();
      for (const c of s.clues) expect(c.text.toLowerCase(), s.id).not.toContain(name);
    }
  });

  it("quiz options are never given away by the question", () => {
    for (const s of steps) {
      if (s.mode !== "quiz") continue;
      for (const o of s.options) expect(s.question.toLowerCase(), s.id).not.toContain(o.toLowerCase());
    }
  });
});

describe("difficulty tiers", () => {
  const topic = pack.topics[0];

  it("every game has a full session of questions at every tier", () => {
    for (const activity of topic.activities)
      for (const tier of TIERS) {
        const own = activity.steps.filter((s) => s.tier === tier);
        expect(own.length, `${activity.mode} tier ${tier}`).toBeGreaterThanOrEqual(SESSION_SIZE[activity.mode]);
      }
  });

  it("tiers do not share questions", () => {
    for (const activity of topic.activities) {
      const ids = TIERS.flatMap((tier) => stepsAtTier(activity, tier).map((s) => s.id));
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("harder tiers ask for more: more verse options, more pairs, fewer clues", () => {
    const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
    const byMode = (mode: string, tier: number) => steps.filter((s) => s.mode === mode && s.tier === tier);
    const verseOptions = (tier: number) => avg(byMode("complete-verse", tier).map((s) => (s.mode === "complete-verse" ? s.options.length : 0)));
    const clues = (tier: number) => avg(byMode("who-am-i", tier).map((s) => (s.mode === "who-am-i" ? s.clues.length : 0)));
    const pairs = (tier: number) => avg(byMode("match-pairs", tier).map((s) => (s.mode === "match-pairs" ? s.pairs.length : 0)));
    expect(verseOptions(5)).toBeGreaterThan(verseOptions(1));
    expect(clues(5)).toBeLessThan(clues(1));
    expect(pairs(5)).toBeGreaterThanOrEqual(pairs(1));
    expect(decoyCount(5)).toBeGreaterThan(decoyCount(1));
  });

  it("draws the least-seen questions first", () => {
    const quiz = topic.activities.find((a) => a.mode === "quiz")!;
    const pool = stepsAtTier(quiz, 1);
    const seen = Object.fromEntries(pool.slice(0, 5).map((s) => [s.id, 3]));
    const drawn = drawSteps(pool, 2, seen, "seed");
    for (const s of drawn) expect(seen[s.id]).toBeUndefined();
  });
});

describe("structure", () => {
  it("the topic has exactly one activity per game mode", () => {
    for (const topic of pack.topics) {
      const modes = topic.activities.map((a) => a.mode);
      expect(new Set(modes).size).toBe(6);
    }
  });

  it("path nodes point at existing content", () => {
    for (const unit of pack.units) {
      const topic = pack.topics.find((t) => t.id === unit.topicId)!;
      for (const node of unit.nodes) {
        if (node.kind === "intro") expect(node.introId).toBe(topic.intro.id);
        else expect(topic.activities.some((a) => a.id === node.activityId)).toBe(true);
      }
    }
  });

  it("builds a daily challenge for any date and tier, stable within the day", () => {
    for (const tier of TIERS) {
      const daily = dailyChallengeFor(pack, "2026-01-01", tier);
      expect(daily.steps).toHaveLength(pack.daily.modes.length);
      expect(daily.steps.every((s) => s.tier === tier)).toBe(true);
      expect(dailyChallengeFor(pack, "2026-01-01", tier).steps.map((s) => s.id)).toEqual(daily.steps.map((s) => s.id));
    }
    const days = new Set(["2026-01-01", "2026-01-02", "2026-01-03", "2026-01-04"].map((d) => dailyChallengeFor(pack, d, 1).steps.map((s) => s.id).join()));
    expect(days.size).toBeGreaterThan(1);
  });
});

describe("answer positions", () => {
  it("quiz answers are spread across positions once shuffled", async () => {
    const { shuffle } = await import("../lib/random");
    const positions = new Set<number>();
    for (const s of steps) if (s.mode === "quiz") positions.add(shuffle([0, 1, 2, 3], s.id).indexOf(s.correctIndex));
    expect(positions.size).toBe(4);
  });
});

describe("books of the Bible", () => {
  it("lists 39 Old Testament and 27 New Testament books with unique ids", () => {
    expect(pack.books.filter((b) => b.testament === "ot")).toHaveLength(39);
    expect(pack.books.filter((b) => b.testament === "nt")).toHaveLength(27);
    expect(new Set(pack.books.map((b) => b.id)).size).toBe(66);
    expect(pack.books[0].name).toBe("Genesis");
    expect(pack.books[65].name).toBe("Revelation");
    for (const b of pack.books) expect(pack.bookGroups[b.group], b.id).toBeTruthy();
  });

  it("every story belongs to a listed book; Genesis starts with the Creation", () => {
    for (const unit of pack.units) expect(pack.books.some((b) => b.id === unit.bookId)).toBe(true);
    for (const s of pack.plannedStories) expect(pack.books.some((b) => b.id === s.bookId)).toBe(true);
    const genesis = pack.units.filter((u) => u.bookId === "GEN").sort((a, b) => a.number - b.number);
    expect(pack.topics.find((t) => t.id === genesis[0].topicId)?.title).toBe("The Creation");
  });

  it("planned stories are not playable and do not overlap a playable story's title", () => {
    const playable = new Set(pack.units.map((u) => pack.topics.find((t) => t.id === u.topicId)?.title));
    for (const s of pack.plannedStories) expect(playable.has(s.title)).toBe(false);
  });
});
