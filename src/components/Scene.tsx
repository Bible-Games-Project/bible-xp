/**
 * Full-screen illustrated background behind a screen. Use it through
 * `<Screen scene="…">`, which renders it outside the animated <main> so it
 * always covers the whole viewport.
 * Images live in src/assets and are referenced from CSS (screens.css).
 */
export type SceneName = "home" | "bible" | "old-testament";

export function Scene({ name }: { name: SceneName }) {
  return <div className={`scene scene--${name}`} aria-hidden="true" />;
}
