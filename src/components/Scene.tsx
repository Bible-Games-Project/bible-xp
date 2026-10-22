/**
 * Full-screen illustrated background behind a screen. Pair it with
 * `<Screen className="screen--scene">` so the content sits above it.
 * Images live in src/assets and are referenced from CSS (screens.css).
 */
export type SceneName = "home" | "bible" | "old-testament";

export function Scene({ name }: { name: SceneName }) {
  return <div className={`scene scene--${name}`} aria-hidden="true" />;
}
