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
 * Lumi — Bible XP's mascot: a small, friendly flame in the warm red, orange
 * and yellow of the Bible Games Project logo, using the app's --flame colours
 * (src/theme/tokens.css) so it matches the rest of the interface.
 *
 * Drawn as layered SVG (three flame layers, a warm core, a soft highlight) so
 * it reads as a rounded 3D character at any size, with no image assets. The
 * flame layers flicker gently; the face and arms change with `mood`. This is
 * the single place to swap in final artwork later: keep the `mood` prop.
 */
export function Mascot({ mood = "normal", size = 120, label, className = "" }: MascotProps) {
  const uid = useId().replace(/:/g, "");
  const id = (name: string) => `lumi-${uid}-${name}`;
  const arms = ARMS[mood];

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
          <stop offset="0%" stopColor="#ffa929" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#ff7d1a" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#ff7d1a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("outer")} x1="0.3" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#f55f14" />
          <stop offset="55%" stopColor="#f04419" />
          <stop offset="100%" stopColor="#c52c1b" />
        </linearGradient>
        <linearGradient id={id("middle")} x1="0.4" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#ffa929" />
          <stop offset="60%" stopColor="#ff7d1a" />
          <stop offset="100%" stopColor="#f55f14" />
        </linearGradient>
        <radialGradient id={id("core")} cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor="#fff080" />
          <stop offset="55%" stopColor="#ffcf3d" />
          <stop offset="100%" stopColor="#ffa929" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("limb")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffa929" />
          <stop offset="100%" stopColor="#f04419" />
        </linearGradient>
        <radialGradient id={id("eye")} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#5a2418" />
          <stop offset="100%" stopColor="#2b0e0a" />
        </radialGradient>
        <filter id={id("soft")} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>

      <ellipse className="mascot__shadow" cx="100" cy="191" rx="40" ry="5.5" fill="#c2501a" opacity="0.2" />
      <circle className="mascot__glow" cx="100" cy="118" r="96" fill={`url(#${id("glow")})`} />

      {mood === "celebrating" && (
        <g className="mascot__sparkles">
          <Sparkle x={30} y={54} s={9} color="#ffa929" />
          <Sparkle x={172} y={30} s={11} color="#ff7d1a" delay />
          <Sparkle x={182} y={126} s={7} color="#ffcf3d" />
          <Sparkle x={18} y={138} s={6} color="#f04419" delay />
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
        <g className="mascot__arm mascot__arm--left" style={{ transformOrigin: "54px 132px" }}>
          <path d={arms.left} stroke={`url(#${id("limb")})`} strokeWidth="14" strokeLinecap="round" fill="none" />
        </g>
        <g className="mascot__arm mascot__arm--right" style={{ transformOrigin: "146px 132px" }}>
          <path d={arms.right} stroke={`url(#${id("limb")})`} strokeWidth="14" strokeLinecap="round" fill="none" />
        </g>

        <path className="mascot__flame mascot__flame--outer" d={OUTER} fill={`url(#${id("outer")})`} />
        <path className="mascot__flame mascot__flame--middle" d={MIDDLE} fill={`url(#${id("middle")})`} />
        <ellipse cx="100" cy="140" rx="44" ry="36" fill={`url(#${id("core")})`} />

        {/* Soft highlights give the rounded, rendered volume. */}
        <ellipse cx="70" cy="108" rx="9" ry="16" transform="rotate(24 70 108)" fill="#fff6d6" opacity="0.55" filter={`url(#${id("soft")})`} />
        <circle cx="83" cy="86" r="3" fill="#fff6d6" opacity="0.7" />

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
      <ellipse cx="73" cy="148" rx="9" ry="5" fill="#ff5a3c" opacity="0.38" />
      <ellipse cx="127" cy="148" rx="9" ry="5" fill="#ff5a3c" opacity="0.38" />

      {(mood === "thinking" || mood === "encouraging") && (
        <g stroke="#8a3a12" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.65">
          <path d={mood === "thinking" ? "M76 115 Q 84 110 92 113" : "M76 115 Q 84 111 92 115"} />
          <path d={mood === "thinking" ? "M110 111 Q 118 108 126 112" : "M108 115 Q 116 111 124 115"} />
        </g>
      )}

      {happyEyes ? (
        <g stroke="#2b0e0a" strokeWidth="4.5" strokeLinecap="round" fill="none">
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
          <path d="M86 148 Q 100 168 114 148 Z" fill="#7a1f16" />
          <path d="M92 157 Q 100 164 108 157 Q 100 154 92 157 Z" fill="#ff7a6a" />
        </g>
      );
    case "thinking":
      return <path d="M99 154 Q 107 151 113 154" stroke="#5a1f14" strokeWidth="3.4" strokeLinecap="round" fill="none" />;
    case "encouraging":
      return <path d="M89 150 Q 100 160 111 150" stroke="#5a1f14" strokeWidth="3.6" strokeLinecap="round" fill="none" />;
    default:
      return <path d="M90 149 Q 100 158 110 149" stroke="#5a1f14" strokeWidth="3.6" strokeLinecap="round" fill="none" />;
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

/** Arm strokes per mood: shoulder → hand, as short rounded limbs. */
const ARMS: Record<MascotMood, { left: string; right: string }> = {
  normal: { left: "M54 132 Q 40 144 38 158", right: "M146 132 Q 160 144 162 158" },
  happy: { left: "M54 132 Q 40 144 38 158", right: "M146 128 Q 164 112 168 92" },
  thinking: { left: "M54 132 Q 40 144 38 158", right: "M146 136 Q 156 152 148 164" },
  celebrating: { left: "M54 126 Q 36 108 30 86", right: "M146 126 Q 164 108 170 86" },
  encouraging: { left: "M54 132 Q 40 144 38 158", right: "M146 130 Q 168 124 174 106" },
};
