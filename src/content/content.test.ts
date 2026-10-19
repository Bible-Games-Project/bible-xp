import { describe, expect, it } from "vitest";
import source from "./sources/web-genesis-1-3.json";
import { allSteps, dailyChallengeFor, getContent } from "./index";
import type { BibleRef } from "./types";
import { scrambleLetters } from "../games/formWordLogic";

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

  it("clues and prompts never pose as quotations", () => {
    for (const s of steps) {
      const texts: string[] = [];
      if (s.mode === "form-word") texts.push(s.clue);
      if (s.mode === "who-am-i") texts.push(...s.clues.map((c) => c.text));
      if (s.mode === "quiz") texts.push(s.question, ...s.options);
      for (const t of texts) expect(t, s.id).not.toMatch(/[“”]/);
    }
  });
});

describe("step data is playable", () => {
  it("step ids are unique per activity and globally", () => {
    const ids = steps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("form-the-word words can be built from their tiles", () => {
    for (const s of steps) {
      if (s.mode !== "form-word") continue;
      expect(s.word).toMatch(/^[A-Z]+$/);
      const tiles = scrambleLetters(s.word, s.id);
      expect(tiles.map((t) => t.letter).sort().join("")).toBe([...s.word].sort().join(""));
      expect(tiles.map((t) => t.letter).join("")).not.toBe(s.word);
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
    }
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

  it("there is a daily challenge for any date", () => {
    expect(dailyChallengeFor(pack, "2026-01-01").steps.length).toBeGreaterThan(0);
    expect(dailyChallengeFor(pack, "1999-12-31").steps.length).toBeGreaterThan(0);
  });
});
