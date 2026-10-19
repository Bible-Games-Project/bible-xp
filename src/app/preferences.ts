import { useEffect, useSyncExternalStore } from "react";
import type { Settings } from "../progress/model";

const QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.(QUERY).matches === true;
}

function subscribe(listener: () => void) {
  const mql = window.matchMedia?.(QUERY);
  mql?.addEventListener("change", listener);
  return () => mql?.removeEventListener("change", listener);
}

/** Mirrors accessibility settings onto <html> so CSS can react to them. */
export function useApplySettings(settings: Settings, languageCode: string) {
  const systemReduced = useSyncExternalStore(subscribe, prefersReducedMotion, () => false);
  const reduce = settings.reduceMotion ?? systemReduced;
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.reduceMotion = String(reduce);
    root.dataset.largeText = String(settings.largeText);
    root.lang = languageCode;
  }, [reduce, settings.largeText, languageCode]);
}
