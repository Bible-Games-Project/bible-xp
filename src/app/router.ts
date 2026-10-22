import { useEffect, useSyncExternalStore } from "react";

/*
 * Minimal hash router. Hash URLs work the same on a static web host and inside
 * an app WebView, with no server rewrites and no base-path configuration.
 */

export type Route =
  | { name: "home" }
  | { name: "path" }
  | { name: "testament"; testament: "ot" | "nt" }
  | { name: "book"; bookId: string }
  | { name: "story"; unitId: string }
  | { name: "train" }
  | { name: "profile" }
  | { name: "settings" }
  | { name: "about" }
  | { name: "privacy" }
  | { name: "terms" }
  | { name: "multiplayer" }
  | { name: "plus" }
  | { name: "review" }
  | { name: "review-play" }
  | { name: "daily" }
  | { name: "intro"; introId: string }
  | { name: "play"; activityId: string; from?: "free" }
  | { name: "not-found" };

const STATIC: Record<string, Route["name"]> = {
  "": "home",
  path: "path",
  train: "train",
  profile: "profile",
  settings: "settings",
  about: "about",
  privacy: "privacy",
  terms: "terms",
  multiplayer: "multiplayer",
  plus: "plus",
  review: "review",
  "review/play": "review-play",
  daily: "daily",
};

export function parseHash(hash: string): Route {
  const [rawPath, query = ""] = hash.replace(/^#\/?/, "").split("?");
  const path = decodeURIComponent(rawPath).replace(/\/$/, "");
  if (Object.hasOwn(STATIC, path)) return { name: STATIC[path] } as Route;
  const [head, ...rest] = path.split("/");
  const param = rest.join("/");
  if (head === "play" && param) {
    return new URLSearchParams(query).get("from") === "free" ? { name: "play", activityId: param, from: "free" } : { name: "play", activityId: param };
  }
  if (head === "intro" && param) return { name: "intro", introId: param };
  if (head === "path") {
    if (param === "ot" || param === "nt") return { name: "testament", testament: param };
    const [kind, id] = rest;
    if (kind === "book" && id) return { name: "book", bookId: id };
    if (kind === "story" && id) return { name: "story", unitId: id };
  }
  return { name: "not-found" };
}

export function href(route: Route): string {
  switch (route.name) {
    case "home":
      return "#/";
    case "play":
      return `#/play/${encodeURIComponent(route.activityId)}${route.from ? `?from=${route.from}` : ""}`;
    case "intro":
      return `#/intro/${encodeURIComponent(route.introId)}`;
    case "review-play":
      return "#/review/play";
    case "testament":
      return `#/path/${route.testament}`;
    case "book":
      return `#/path/book/${encodeURIComponent(route.bookId)}`;
    case "story":
      return `#/path/story/${encodeURIComponent(route.unitId)}`;
    case "not-found":
      return "#/";
    default:
      return `#/${route.name}`;
  }
}

export function navigate(route: Route, options: { replace?: boolean } = {}) {
  const target = href(route);
  if (options.replace) window.location.replace(target);
  else window.location.hash = target;
}

function subscribe(listener: () => void) {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash, () => "");
  return parseHash(hash);
}

/** Scrolls to the top whenever the route changes. */
export function useScrollReset(key: string) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [key]);
}
