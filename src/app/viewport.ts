/**
 * Keeps `--app-height` equal to the visible screen height. On phones the page
 * is drawn zoomed out (`--ui-scale` in tokens.css), and CSS lengths inside it
 * are scaled too, so a full-height screen needs the height divided by the
 * scale. Measuring here avoids depending on how each browser zooms `dvh`.
 */
export function trackAppHeight() {
  const root = document.documentElement;
  const update = () => {
    const scale = parseFloat(getComputedStyle(root).getPropertyValue("--ui-scale")) || 1;
    root.style.setProperty("--app-height", `${window.innerHeight / scale}px`);
  };
  update();
  window.addEventListener("resize", update);
  window.visualViewport?.addEventListener("resize", update);
}
