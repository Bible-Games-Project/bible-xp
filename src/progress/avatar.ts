import type { Tier } from "../content/types";

/*
 * The player's avatar and starting knowledge level, chosen during onboarding
 * and editable later from the profile.
 */

export type Presentation = "male" | "female";
export const PRESENTATIONS: Presentation[] = ["male", "female"];

export type SkinTone = "light" | "brown" | "dark";
export const SKIN_TONES: SkinTone[] = ["light", "brown", "dark"];

/** Avatar parts reserved for rewards earned with XP (see cosmetics.ts). */
export type CosmeticSlot = "clothing" | "footwear" | "accessory";
export const COSMETIC_SLOTS: CosmeticSlot[] = ["clothing", "footwear", "accessory"];

export interface AvatarLook {
  presentation: Presentation;
  skin: SkinTone;
  /** Unlocked cosmetic worn in each slot; an empty slot shows the basic outfit. */
  equipped: Partial<Record<CosmeticSlot, string>>;
}

export function isAvatarLook(value: unknown): value is AvatarLook {
  const look = value as Partial<AvatarLook> | null;
  return (
    !!look &&
    typeof look === "object" &&
    PRESENTATIONS.includes(look.presentation as Presentation) &&
    SKIN_TONES.includes(look.skin as SkinTone)
  );
}

export type KnowledgeLevel = "beginner" | "intermediate" | "advanced";
export const KNOWLEDGE_LEVELS: KnowledgeLevel[] = ["beginner", "intermediate", "advanced"];

/** The difficulty tier each knowledge level starts at (Beginner, Explorer, Scholar). */
export const STARTING_TIER: Record<KnowledgeLevel, Tier> = { beginner: 1, intermediate: 2, advanced: 3 };

export function knowledgeForTier(tier: Tier): KnowledgeLevel {
  return tier <= 1 ? "beginner" : tier === 2 ? "intermediate" : "advanced";
}

/**
 * The tier to play at after choosing a knowledge level. A player whose tier
 * already matches the level keeps it (an Expert who picks Advanced stays Expert).
 */
export function tierForKnowledge(level: KnowledgeLevel, current: Tier): Tier {
  return knowledgeForTier(current) === level ? current : STARTING_TIER[level];
}
