import { useId } from "react";

export type MascotMood = "normal" | "happy" | "thinking" | "celebrating" | "encouraging";

interface MascotProps {
  mood?: MascotMood;
  size?: number;
  /** Decorative by default; pass a label when the mascot carries meaning. */
  label?: string;
  className?: string;
}

/** The flame silhouette: a main tip and two side tongues over a round base. */
const OUTER =
  "M100 16 C 112 38, 134 46, 140 70 C 147 60, 151 50, 149 38 C 167 60, 172 92, 167 120 C 162 157, 135 183, 100 183 C 65 183, 38 157, 34 121 C 31 96, 40 76, 55 61 C 55 73, 59 82, 66 89 C 63 62, 79 40, 100 16 Z";
const MIDDLE =
  "M101 46 C 110 63, 126 71, 131 89 C 137 81, 140 73, 140 66 C 152 85, 155 106, 151 125 C 147 157, 126 175, 100 175 C 74 175, 52 157, 49 127 C 47 107, 55 93, 65 83 C 67 93, 71 99, 76 103 C 76 81, 88 63, 101 46 Z";

/**
 * Testalume — the game's mascot: a small, friendly flame, the light that
 * shows the way through Scripture. Only the flame and its face: no body, no
 * lamp. Its colours are the game's own gold (the colour of the main buttons)
 * deepening to amber at the edges, with a pale golden heart, so it belongs to
 * the interface and still reads as fire. Every colour is a warm hue of the
 * Home picture (see FLAME and palette.test.ts).
 *
 * Use it sparingly, where it has something to say: onboarding, the Home
 * greeting, intro and lesson completion, level-ups, streak milestones,
 * encouragement. Not beside every question, so it never competes with the
 * Scripture on screen.
 *
 * Drawn as layered SVG (three flame layers, a warm core, a soft highlight),
 * with no image assets. The flame flickers gently; the face changes with
 * `mood`. This is the single place to swap in final artwork later: keep the
 * `mood` prop.
 */
export const FLAME = {
  outer: ["#ff9a1f", "#f07c12", "#c95e08"],
  middle: ["#ffcf3d", "#ffa929", "#f07c12"],
  core: ["#fff3c4", "#fff080", "#ffcf3d"],
  glow: ["#ffcf3d", "#ffa929"],
  eye: ["#593b0d", "#3c2607"],
  brow: "#915a08",
  line: "#3c2607",
  mouth: "#593b0d",
  tongue: "#ff7d1a",
  highlight: "#fff6d6",
  sparkles: ["#ffa929", "#f07c12", "#ffcf3d", "#fff080"],
};

export function Mascot({ mood = "normal", size = 120, label, className = "" }: MascotProps) {
  const uid = useId().replace(/:/g, "");
  const id = (name: string) => `testalume-${uid}-${name}`;

  return (
    <svg
      className={`mascot mascot--${mood} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <radialGradient id={id("glow")} cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor={FLAME.glow[0]} stopOpacity="0.5" />
          <stop offset="60%" stopColor={FLAME.glow[1]} stopOpacity="0.12" />
          <stop offset="100%" stopColor={FLAME.glow[1]} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("outer")} x1="0.3" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor={FLAME.outer[0]} />
          <stop offset="55%" stopColor={FLAME.outer[1]} />
          <stop offset="100%" stopColor={FLAME.outer[2]} />
        </linearGradient>
        <linearGradient id={id("middle")} x1="0.4" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor={FLAME.middle[0]} />
          <stop offset="60%" stopColor={FLAME.middle[1]} />
          <stop offset="100%" stopColor={FLAME.middle[2]} />
        </linearGradient>
        <radialGradient id={id("core")} cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor={FLAME.core[0]} />
          <stop offset="55%" stopColor={FLAME.core[1]} />
          <stop offset="100%" stopColor={FLAME.core[2]} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id("eye")} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor={FLAME.eye[0]} />
          <stop offset="100%" stopColor={FLAME.eye[1]} />
        </radialGradient>
        <filter id={id("soft")} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>

      <circle className="mascot__glow" cx="100" cy="118" r="96" fill={`url(#${id("glow")})`} />

      {mood === "celebrating" && (
        <g className="mascot__sparkles">
          <Sparkle x={30} y={54} s={9} color={FLAME.sparkles[0]} />
          <Sparkle x={172} y={30} s={11} color={FLAME.sparkles[1]} delay />
          <Sparkle x={182} y={126} s={7} color={FLAME.sparkles[2]} />
          <Sparkle x={18} y={138} s={6} color={FLAME.sparkles[3]} delay />
        </g>
      )}
      {mood === "thinking" && (
        <g className="mascot__thought" fill="#ffffff" stroke="#f3cfa6" strokeWidth="2">
          <circle cx="160" cy="62" r="5" />
          <circle cx="174" cy="44" r="8" />
          <circle cx="188" cy="20" r="11" />
        </g>
      )}

      <g className="mascot__float">
        <path className="mascot__flame mascot__flame--outer" d={OUTER} fill={`url(#${id("outer")})`} />
        <path className="mascot__flame mascot__flame--middle" d={MIDDLE} fill={`url(#${id("middle")})`} />
        <ellipse cx="100" cy="140" rx="44" ry="36" fill={`url(#${id("core")})`} />

        {/* Soft highlights give the rounded, rendered volume. */}
        <ellipse cx="70" cy="108" rx="9" ry="16" transform="rotate(24 70 108)" fill={FLAME.highlight} opacity="0.55" filter={`url(#${id("soft")})`} />
        <circle cx="83" cy="86" r="3" fill={FLAME.highlight} opacity="0.7" />

        <Face mood={mood} eyeFill={`url(#${id("eye")})`} />
      </g>
    </svg>
  );
}

function Face({ mood, eyeFill }: { mood: MascotMood; eyeFill: string }) {
  const happyEyes = mood === "happy" || mood === "celebrating";
  const dx = mood === "thinking" ? 3 : 0;
  return (
    <g className="mascot__face">
      {(mood === "thinking" || mood === "encouraging") && (
        <g stroke={FLAME.brow} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.65">
          <path d={mood === "thinking" ? "M76 115 Q 84 110 92 113" : "M76 115 Q 84 111 92 115"} />
          <path d={mood === "thinking" ? "M110 111 Q 118 108 126 112" : "M108 115 Q 116 111 124 115"} />
        </g>
      )}

      {happyEyes ? (
        <g stroke={FLAME.line} strokeWidth="4.5" strokeLinecap="round" fill="none">
          <path d="M75 132 Q 83 122 91 132" />
          <path d="M109 132 Q 117 122 125 132" />
        </g>
      ) : (
        <g className="mascot__eyes">
          <ellipse cx={83 + dx} cy="130" rx="7.4" ry="9.6" fill={eyeFill} />
          <ellipse cx={117 + dx} cy="130" rx="7.4" ry="9.6" fill={eyeFill} />
          <circle cx={85.6 + dx} cy="126" r="2.8" fill="#ffffff" />
          <circle cx={119.6 + dx} cy="126" r="2.8" fill="#ffffff" />
          <circle cx={81 + dx} cy="134" r="1.2" fill="#ffffff" opacity="0.8" />
          <circle cx={115 + dx} cy="134" r="1.2" fill="#ffffff" opacity="0.8" />
        </g>
      )}

      <Mouth mood={mood} />
    </g>
  );
}

function Mouth({ mood }: { mood: MascotMood }) {
  switch (mood) {
    case "happy":
    case "celebrating":
      return (
        <g>
          <path d="M86 148 Q 100 168 114 148 Z" fill={FLAME.mouth} />
          <path d="M92 157 Q 100 164 108 157 Q 100 154 92 157 Z" fill={FLAME.tongue} />
        </g>
      );
    case "thinking":
      return <path d="M99 154 Q 107 151 113 154" stroke={FLAME.line} strokeWidth="3.4" strokeLinecap="round" fill="none" />;
    case "encouraging":
      return <path d="M89 150 Q 100 160 111 150" stroke={FLAME.line} strokeWidth="3.6" strokeLinecap="round" fill="none" />;
    default:
      return <path d="M90 149 Q 100 158 110 149" stroke={FLAME.line} strokeWidth="3.6" strokeLinecap="round" fill="none" />;
  }
}

function Sparkle({ x, y, s, color, delay }: { x: number; y: number; s: number; color: string; delay?: boolean }) {
  return (
    <path
      className={`mascot__sparkle${delay ? " mascot__sparkle--delay" : ""}`}
      style={{ transformOrigin: `${x}px ${y}px` }}
      fill={color}
      d={`M${x} ${y - s} Q ${x} ${y} ${x + s} ${y} Q ${x} ${y} ${x} ${y + s} Q ${x} ${y} ${x - s} ${y} Q ${x} ${y} ${x} ${y - s} Z`}
    />
  );
}
