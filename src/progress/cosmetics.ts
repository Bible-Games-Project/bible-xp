import type { CosmeticSlot } from "./avatar";

/*
 * Avatar cosmetics unlocked with lifetime XP. They only change how the avatar
 * looks: they never give XP, bonuses or any advantage, and there is no shop.
 *
 * No reward items exist yet. Each slot has one clearly marked placeholder so
 * the avatar screen can show what is coming; a placeholder can never be
 * unlocked or worn. To add a real item: give it art in PlayerAvatar, an
 * `unlock` requirement, and drop `placeholder`.
 */

export interface CosmeticItem {
  id: string;
  slot: CosmeticSlot;
  /** Reserved slot entry, not a real item yet. */
  placeholder?: true;
  /** Lifetime XP needed; null until the requirement has been decided. */
  unlock: { totalXp: number } | null;
}

export const COSMETICS: CosmeticItem[] = [
  { id: "placeholder-robes", slot: "clothing", placeholder: true, unlock: null },
  { id: "placeholder-sandals", slot: "footwear", placeholder: true, unlock: null },
  { id: "placeholder-accessories", slot: "accessory", placeholder: true, unlock: null },
];

export function findCosmetic(id: string, catalog: CosmeticItem[] = COSMETICS): CosmeticItem | undefined {
  return catalog.find((item) => item.id === id);
}

/** Items whose XP requirement is met but that are not unlocked yet. */
export function newlyUnlocked(unlocked: string[], totalXp: number, catalog: CosmeticItem[] = COSMETICS): string[] {
  return catalog
    .filter((item) => !item.placeholder && item.unlock && totalXp >= item.unlock.totalXp && !unlocked.includes(item.id))
    .map((item) => item.id);
}

/** Only real, unlocked items of the right slot can be worn. */
export function canEquip(itemId: string, slot: CosmeticSlot, unlocked: string[], catalog: CosmeticItem[] = COSMETICS): boolean {
  const item = findCosmetic(itemId, catalog);
  return !!item && !item.placeholder && item.slot === slot && unlocked.includes(itemId);
}
