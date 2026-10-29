import { useSyncExternalStore } from "react";
import { getContent } from "../content";
import type { Tier } from "../content/types";
import { localDate } from "../lib/date";
import type { AvatarLook } from "./avatar";
import {
  abandonSession,
  completeIntro,
  completeOnboarding,
  completeSession,
  defaultProgress,
  migrate,
  PROGRESS_VERSION,
  recordStep,
  selectTierIn,
  setLook,
  startSession,
  type OnboardingChoices,
  type ProgressData,
  type Profile,
  type SessionKind,
  type SessionSummary,
  type Settings,
  type StepMeta,
  type StepOutcome,
} from "./model";

const STORAGE_KEY = "bible-xp:progress";

export type StorageStatus = "ok" | "unavailable" | "write-failed";

let storageStatus: StorageStatus = "ok";
let state: ProgressData = load();
const listeners = new Set<() => void>();

function load(): ProgressData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw) as { version?: number; data?: unknown };
    const data = migrate(parsed.data);
    // Save an upgraded save at once, so new fields (like the player id) stay stable.
    if (parsed.version !== PROGRESS_VERSION) save(data);
    return data;
  } catch (error) {
    console.warn("Bible XP: could not read saved progress, starting fresh.", error);
    storageStatus = "unavailable";
    return defaultProgress();
  }
}

function save(next: ProgressData) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: PROGRESS_VERSION, data: next }));
    storageStatus = "ok";
  } catch (error) {
    console.warn("Bible XP: could not save progress.", error);
    storageStatus = "write-failed";
  }
}

function commit(next: ProgressData) {
  if (next === state) return;
  state = next;
  save(next);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useProgress(): ProgressData {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

export function getProgress(): ProgressData {
  return state;
}

export function getStorageStatus(): StorageStatus {
  return storageStatus;
}

const now = () => new Date().toISOString();
const units = () => getContent(state.settings.language).units;

export const progressActions = {
  startSession(key: string, kind: SessionKind, refId: string, stepIds: string[], tier: Tier) {
    commit(startSession(state, key, kind, refId, stepIds, tier, now()));
  },
  selectTier(tier: Tier) {
    commit(selectTierIn(state, tier));
  },
  recordStep(key: string, outcome: StepOutcome, meta: StepMeta) {
    commit(recordStep(state, key, outcome, meta, now()));
  },
  completeSession(key: string): SessionSummary | null {
    const result = completeSession(state, key, localDate(), now(), units());
    if (!result) return null;
    commit(result.data);
    return result.summary;
  },
  abandonSession(key: string) {
    commit(abandonSession(state, key));
  },
  completeIntro(introId: string): number {
    const result = completeIntro(state, introId, localDate(), now(), units());
    commit(result.data);
    return result.xp;
  },
  updateSettings(patch: Partial<Settings>) {
    commit({ ...state, settings: { ...state.settings, ...patch } });
  },
  updateProfile(patch: Partial<Pick<Profile, "name">>) {
    commit({ ...state, profile: { ...state.profile, ...patch } });
  },
  completeOnboarding(choices: OnboardingChoices) {
    commit(completeOnboarding(state, choices, now()));
  },
  setLook(look: AvatarLook) {
    commit(setLook(state, look));
  },
  /** Clears progress but keeps the player's profile, avatar, onboarding and settings. */
  resetProgress() {
    // Cosmetics come from XP, so they are cleared too and nothing stays worn.
    const look = state.profile.look && { ...state.profile.look, equipped: {} };
    commit({ ...defaultProgress(), profile: { ...state.profile, look }, settings: state.settings, onboarding: state.onboarding });
  },
};
