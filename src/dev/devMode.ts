import { useSyncExternalStore } from "react";

/*
 * Developer mode: switched on and off with the DEV button (DevTools.tsx).
 * While it is on, every stop of the Journey is open and the colour picker and
 * other tools are available. It exists in developer builds (`bun run dev`,
 * `bun run build:devtools`) and, by maintainer request, on the preview site
 * (`*.pages.dev`, which runs the release build). The published app never runs
 * there, so it never shows the button or loads the tools: they live in a
 * separate chunk that main.tsx only imports when `DEV_BUILD` is true.
 * The switch is remembered in this browser, apart from the player's progress.
 */

/** The preview site the console shows next to the Build chat. */
export function isPreviewSite(hostname = typeof location === "undefined" ? "" : location.hostname): boolean {
  return hostname === "pages.dev" || hostname.endsWith(".pages.dev");
}

export const DEV_BUILD = import.meta.env.DEV || import.meta.env.MODE === "devtools" || isPreviewSite();

const KEY = "testalume:dev-mode";
const listeners = new Set<() => void>();
let on = DEV_BUILD && read();

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === "on";
  } catch {
    return false;
  }
}

export function setDevMode(next: boolean) {
  if (!DEV_BUILD || next === on) return;
  on = next;
  try {
    localStorage.setItem(KEY, next ? "on" : "off");
  } catch {
    /* Not remembered after a reload; the mode still works now. */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** True while developer mode is on; always false in a release build. */
export function useDevMode(): boolean {
  return useSyncExternalStore(subscribe, () => on, () => false);
}
