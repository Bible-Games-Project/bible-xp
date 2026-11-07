import { useId } from "react";
import femaleBrown from "../assets/avatars/female-brown.webp";
import femaleDark from "../assets/avatars/female-dark.webp";
import femaleLight from "../assets/avatars/female-light.webp";
import maleBrown from "../assets/avatars/male-brown.webp";
import maleDark from "../assets/avatars/male-dark.webp";
import maleLight from "../assets/avatars/male-light.webp";
import { preloadImages } from "../lib/preload";
import type { Presentation, SkinTone } from "../progress/avatar";

/*
 * The player's avatar: a painted head-and-shoulders portrait in biblical-era
 * dress, one per gender and skin tone, on a round sky-to-sand backdrop. The
 * portraits (src/assets/avatars, transparent webp) were made with an image
 * model; docs/avatar-art.md keeps the prompts so new pictures, such as the
 * robes and sandals rewards (`look.equipped`), can match them.
 */

export const PORTRAITS: Record<Presentation, Record<SkinTone, string>> = {
  male: { light: maleLight, brown: maleBrown, dark: maleDark },
  female: { light: femaleLight, brown: femaleBrown, dark: femaleDark },
};

/** Swatches for the skin tone choice, matched to the portraits. */
export const SKIN: Record<SkinTone, string> = {
  light: "#f0c4a2",
  brown: "#b5764a",
  dark: "#5c3622",
};

/** Backdrop colours, from the Home picture's sky and sand. */
export const BACKDROP = {
  skyTop: "#d8edfd",
  sandBottom: "#ffe9c7",
  empty: "#edca97",
};

/** Avatars appear on every main screen: load them with the scenes. */
export function preloadAvatars() {
  preloadImages(Object.values(PORTRAITS).flatMap((tones) => Object.values(tones)));
}

/** A saved look, or one being chosen where parts may still be missing. */
export interface LookDraft {
  presentation: Presentation | null;
  skin: SkinTone | null;
}

interface PlayerAvatarProps {
  /** null, or no presentation yet, draws a neutral silhouette. */
  look: LookDraft | null;
  size?: number;
  label?: string;
  className?: string;
}

export function PlayerAvatar({ look, size = 44, label, className = "" }: PlayerAvatarProps) {
  const uid = useId().replace(/:/g, "");
  const clip = `avatar-clip-${uid}`;
  const bg = `avatar-bg-${uid}`;
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
        {look?.presentation ? (
          // Until a skin tone is chosen, the portrait shows in grey, as a hint.
          <image
            href={PORTRAITS[look.presentation][look.skin ?? "brown"]}
            width="100"
            height="100"
            preserveAspectRatio="xMidYMid slice"
            style={look.skin ? undefined : { filter: "grayscale(1)", opacity: 0.45 }}
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
