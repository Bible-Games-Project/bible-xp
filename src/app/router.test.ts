import { describe, expect, it } from "vitest";
import { href, parseHash, type Route } from "./router";

describe("router", () => {
  it("round-trips every route through its hash", () => {
    const routes: Route[] = [
      { name: "home" },
      { name: "path" },
      { name: "review-play" },
      { name: "play", activityId: "creation.quiz" },
      { name: "play", activityId: "creation.quiz", from: "free" },
      { name: "intro", introId: "creation.intro" },
      { name: "testament", testament: "ot" },
      { name: "testament", testament: "nt" },
      { name: "book", bookId: "GEN" },
      { name: "story", unitId: "unit-1" },
    ];
    for (const r of routes) expect(parseHash(href(r))).toEqual(r);
  });

  it("treats unknown paths as not found and empty as home", () => {
    expect(parseHash("#/nope")).toEqual({ name: "not-found" });
    expect(parseHash("")).toEqual({ name: "home" });
  });
});
