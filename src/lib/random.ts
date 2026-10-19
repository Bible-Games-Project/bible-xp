/** Small deterministic PRNG so shuffles are stable for a given seed (and testable). */
export function seededRandom(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: readonly T[], seed: string): T[] {
  const rand = seededRandom(seed);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Shuffles until the order differs from the original (when that is possible). */
export function shuffleChanged<T>(items: readonly T[], seed: string, same: (a: T[], b: readonly T[]) => boolean): T[] {
  for (let attempt = 0; attempt < 20; attempt++) {
    const out = shuffle(items, `${seed}#${attempt}`);
    if (!same(out, items)) return out;
  }
  // Rotating by one always changes the order unless every item is identical.
  return [...items.slice(1), items[0]];
}
