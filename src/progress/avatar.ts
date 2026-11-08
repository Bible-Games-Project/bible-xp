import type { Tier } from "../content/types";
import { isCharacterId } from "./characters";

/*
 * The player's avatar (a Bible character, see characters.ts) and starting
 * knowledge level, chosen during onboarding and editable later from the profile.
 */

/** Avatar parts reserved for rewards earned with XP (see cosmetics.ts). */
export type CosmeticSlot = "clothing" | "footwear" | "accessory";
export const COSMETIC_SLOTS: CosmeticSlot[] = ["clothing", "footwear", "accessory"];

export interface AvatarLook {
  /** Id of the Bible character the player appears as. */
  character: string;
  /** Unlocked cosmetic worn in each slot; an empty slot shows the basic outfit. */
  equipped: Partial<Record<CosmeticSlot, string>>;
}

export function isAvatarLook(value: unknown): value is AvatarLook {
  const look = value as Partial<AvatarLook> | null;
  return !!look && typeof look === "object" && isCharacterId(look.character);
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
