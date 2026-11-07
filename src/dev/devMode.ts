import { useSyncExternalStore } from "react";

/*
 * Developer mode: switched on and off with the DEV button (DevTools.tsx).
 * While it is on, every stop of the Journey is open and the colour picker and
 * other tools are available. It only exists in developer builds (`bun run
 * dev`, `bun run build:devtools`); in a release build `DEV_BUILD` is the
 * constant false, so the mode can never be on and the button is not shipped.
 * The switch is remembered in this browser, apart from the player's progress.
 */

export const DEV_BUILD = import.meta.env.DEV || import.meta.env.MODE === "devtools";

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
