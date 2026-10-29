import { useId } from "react";
import type { Presentation, SkinTone } from "../progress/avatar";

/*
 * The player's avatar: a simple bust in biblical-era dress, drawn in SVG so it
 * needs no image files. It is a placeholder for final artwork: keep the props
 * (`look`, `size`) and replace the drawing. Cosmetic rewards (robes, sandals,
 * accessories) will draw their own layers from `look.equipped` once they exist.
 *
 * Clothing and background take the Home picture's hues (palette.test.ts);
 * skin and hair are natural tones.
 */

export const SKIN: Record<SkinTone, { base: string; shade: string }> = {
  light: { base: "#f1c9a5", shade: "#dcae88" },
  brown: { base: "#c58b5d", shade: "#a87146" },
  dark: { base: "#7b4a2d", shade: "#5e3720" },
};
/** Face of a figure whose skin tone is not chosen yet. */
const UNSET_SKIN = { base: "#f3d9b1", shade: "#e2c08f" };
const HAIR = "#3a2414";
const FEATURE = "#2b1a10";

/** Clothing and backdrop colours, all from the Home picture. */
export const WEAR = {
  skyTop: "#d8edfd",
  sandBottom: "#ffe9c7",
  linen: "#fff3e0",
  linenShade: "#edca97",
  mantle: "#b8612f",
  mantleShade: "#8a4520",
  veil: "#2f6f9f",
  veilShade: "#245a82",
  empty: "#edca97",
};

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
          <stop offset="0%" stopColor={WEAR.skyTop} />
          <stop offset="100%" stopColor={WEAR.sandBottom} />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect width="100" height="100" fill={`url(#${bg})`} />
        {look?.presentation ? <Figure presentation={look.presentation} skin={look.skin ? SKIN[look.skin] : UNSET_SKIN} /> : <Silhouette />}
      </g>
    </svg>
  );
}

function Silhouette() {
  return (
    <g fill={WEAR.empty}>
      <path d="M16 100 C 18 82 32 74 50 74 C 68 74 82 82 84 100 Z" />
      <ellipse cx="50" cy="45" rx="15" ry="17.5" />
    </g>
  );
}

function Figure({ presentation, skin }: { presentation: Presentation; skin: { base: string; shade: string } }) {
  const female = presentation === "female";
  return (
    <g>
      {/* Veil falling behind the head and over the shoulders. */}
      {female && <path d="M29 55 C 26 33 38 22 50 22 C 62 22 74 33 71 55 C 70 68 76 81 86 100 L 14 100 C 24 81 30 68 29 55 Z" fill={WEAR.veil} />}

      {/* Linen tunic. */}
      <path
        d={female ? "M25 100 C 27 85 37 77 50 77 C 63 77 73 85 75 100 Z" : "M12 100 C 14 82 28 74 50 74 C 72 74 86 82 88 100 Z"}
        fill={WEAR.linen}
      />
      <path d="M38 78 C 42 84 46 86 50 86 C 54 86 58 84 62 78" fill="none" stroke={WEAR.linenShade} strokeWidth="1.6" />

      {/* Mantle over one shoulder. */}
      {!female && (
        <>
          <path d="M12 100 C 14 86 22 78 34 75 C 44 84 54 92 64 100 Z" fill={WEAR.mantle} />
          <path d="M34 75 C 44 84 54 92 64 100 L 58 100 C 50 92 42 85 33 78 Z" fill={WEAR.mantleShade} />
        </>
      )}

      {/* Neck with an opening of the tunic. */}
      <path d="M43.5 60 H 56.5 V 73 L 50 80 L 43.5 73 Z" fill={skin.shade} />

      {/* Head. */}
      <g transform="translate(0 3)">
        <ellipse cx="35.6" cy="46.5" rx="2.6" ry="4" fill={skin.shade} />
        <ellipse cx="64.4" cy="46.5" rx="2.6" ry="4" fill={skin.shade} />
        <ellipse cx="50" cy="44" rx="14.5" ry="17" fill={skin.base} />

        {female ? (
          <>
            <path d="M37 42 C 39 35 44 32.5 50 32.5 C 56 32.5 61 35 63 42 C 59 38 55 36.5 50 36.5 C 45 36.5 41 38 37 42 Z" fill={HAIR} />
            <path d="M34.5 41 C 36 28 43 24 50 24 C 57 24 64 28 65.5 41 C 61 34.5 56 32 50 32 C 44 32 39 34.5 34.5 41 Z" fill={WEAR.veil} />
            <path d="M34.5 41 C 39 34.5 44 32 50 32 C 56 32 61 34.5 65.5 41" fill="none" stroke={WEAR.veilShade} strokeWidth="1.2" />
          </>
        ) : (
          <>
            <path
              d="M35.4 45 C 33.5 30 41 23.5 50 23.5 C 59 23.5 66.5 30 64.6 45 C 63 38 60 34.5 56 33.5 C 53 35 47 35 44 33.5 C 40 34.5 37 38 35.4 45 Z"
              fill={HAIR}
            />
            <path d="M36 47 C 36.5 59 42.5 66 50 66 C 57.5 66 63.5 59 64 47 C 62 53 58 56.5 50 56.5 C 42 56.5 38 53 36 47 Z" fill={HAIR} />
            <path d="M44.5 54.6 C 47 52.8 53 52.8 55.5 54.6 C 53 55.6 47 55.6 44.5 54.6 Z" fill={HAIR} />
          </>
        )}

        {/* Face: calm and simple. */}
        <path d="M41.5 40.6 Q 44.5 39.2 47.5 40.6" fill="none" stroke={HAIR} strokeWidth="1.3" strokeLinecap="round" />
        <path d="M52.5 40.6 Q 55.5 39.2 58.5 40.6" fill="none" stroke={HAIR} strokeWidth="1.3" strokeLinecap="round" />
        <ellipse cx="44.6" cy="45" rx="1.5" ry="1.9" fill={FEATURE} />
        <ellipse cx="55.4" cy="45" rx="1.5" ry="1.9" fill={FEATURE} />
        <path d="M50.2 46.5 Q 48.8 50.5 50.8 51.4" fill="none" stroke={skin.shade} strokeWidth="1.3" strokeLinecap="round" />
        <path d={female ? "M46.8 55.6 Q 50 57.6 53.2 55.6" : "M47.5 57 Q 50 58.2 52.5 57"} fill="none" stroke={female ? "#9a4f3c" : skin.shade} strokeWidth="1.3" strokeLinecap="round" />
      </g>
    </g>
  );
}
