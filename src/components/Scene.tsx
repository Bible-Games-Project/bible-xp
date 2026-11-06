import bible from "../assets/journey-bible.webp";
import creation from "../assets/story-creation.webp";
import daily from "../assets/daily-background.webp";
import home from "../assets/home-background.webp";
import oldTestament from "../assets/journey-old-testament.webp";
import train from "../assets/train-background.webp";
import { preloadImages } from "../lib/preload";

/**
 * Full-screen illustrated background behind a screen. Use it through
 * `<Screen scene="…">`, which renders it outside the animated <main> so it
 * always covers the whole viewport. Framing per picture lives in screens.css.
 */
const PICTURES = {
  home,
  creation,
  daily,
  train,
  bible,
  "old-testament": oldTestament,
};

export type SceneName = keyof typeof PICTURES;

/** Story units with their own picture behind the road. */
const STORY_SCENES: Record<string, SceneName> = { "unit-1": "creation" };

export function storyScene(unitId: string): SceneName {
  return STORY_SCENES[unitId] ?? "bible";
}

/**
 * Downloads and decodes every picture once, at start-up, so no screen shows
 * an empty background while its picture loads. Home's picture goes first.
 */
export function preloadScenes() {
  preloadImages(Object.values(PICTURES));
}

export function Scene({ name }: { name: SceneName }) {
  return (
    <div className={`scene scene--${name}`} aria-hidden="true">
      <img className="scene__img" src={PICTURES[name]} alt="" decoding="sync" draggable={false} />
    </div>
  );
}
