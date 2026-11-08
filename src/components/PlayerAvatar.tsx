import { useId } from "react";
import { preloadImages } from "../lib/preload";

/*
 * The player's avatar: the painted head-and-shoulders portrait of the Bible
 * character they chose, on a round sky-to-sand backdrop. Portraits live in
 * src/assets/characters/<character id>.webp (transparent, 384×384) and are
 * picked up automatically; docs/avatar-art.md keeps the prompts so new ones
 * match. A character without a portrait yet draws a silhouette.
 */

const files = import.meta.glob<string>("../assets/characters/*.webp", { eager: true, import: "default" });

export const PORTRAITS: Record<string, string> = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.slice(path.lastIndexOf("/") + 1, -".webp".length), url]),
);

/** Backdrop colours, from the Home picture's sky and sand. */
export const BACKDROP = {
  skyTop: "#d8edfd",
  sandBottom: "#ffe9c7",
  empty: "#edca97",
};

/** The two starting portraits appear on every main screen: load them with the scenes. */
export function preloadAvatars(ids: string[]) {
  preloadImages(ids.map((id) => PORTRAITS[id]).filter(Boolean));
}

interface PlayerAvatarProps {
  /** The character shown; null draws a neutral silhouette. */
  look: { character: string } | null;
  size?: number;
  label?: string;
  className?: string;
  /** Greys the portrait out, for characters not unlocked yet. */
  locked?: boolean;
}

export function PlayerAvatar({ look, size = 44, label, className = "", locked = false }: PlayerAvatarProps) {
  const uid = useId().replace(/:/g, "");
  const clip = `avatar-clip-${uid}`;
  const bg = `avatar-bg-${uid}`;
  const portrait = look ? PORTRAITS[look.character] : undefined;
  return (
    <svg
      className={`player-avatar ${className}`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <clipPath id={clip}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
        <linearGradient id={bg} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BACKDROP.skyTop} />
          <stop offset="100%" stopColor={BACKDROP.sandBottom} />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect width="100" height="100" fill={`url(#${bg})`} />
        {portrait ? (
          <image
            href={portrait}
            width="100"
            height="100"
            preserveAspectRatio="xMidYMid slice"
            style={locked ? { filter: "grayscale(0.7)", opacity: 0.8 } : undefined}
          />
        ) : (
          <Silhouette />
        )}
      </g>
    </svg>
  );
}

function Silhouette() {
  return (
    <g fill={BACKDROP.empty}>
      <path d="M16 100 C 18 82 32 74 50 74 C 68 74 82 82 84 100 Z" />
      <ellipse cx="50" cy="45" rx="15" ry="17.5" />
    </g>
  );
}
