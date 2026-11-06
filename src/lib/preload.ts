const kept: HTMLImageElement[] = [];
const requested = new Set<string>();

/**
 * Downloads and decodes pictures ahead of time and keeps them in memory, so a
 * screen that shows one paints it in its first frame instead of blinking in.
 */
export function preloadImages(urls: string[]) {
  if (typeof Image === "undefined") return;
  for (const src of urls) {
    if (requested.has(src)) continue;
    requested.add(src);
    const img = new Image();
    img.src = src;
    img.decode().catch(() => {});
    kept.push(img);
  }
}
