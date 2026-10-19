/**
 * Level curve: reaching level n needs 50 * (n - 1) * n / 2 XP in total,
 * so each level costs 50 XP more than the previous one (50, 100, 150, ...).
 */
export function xpForLevel(level: number): number {
  return (50 * (level - 1) * level) / 2;
}

export function levelForXp(xp: number): number {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;
  return level;
}

export interface LevelProgress {
  level: number;
  /** XP earned inside the current level. */
  current: number;
  /** XP the current level spans. */
  needed: number;
}

export function levelProgress(xp: number): LevelProgress {
  const level = levelForXp(xp);
  const start = xpForLevel(level);
  return { level, current: xp - start, needed: xpForLevel(level + 1) - start };
}
