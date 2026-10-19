import { useId } from "react";

export type MascotMood = "normal" | "happy" | "thinking" | "celebrating" | "encouraging";

interface MascotProps {
  mood?: MascotMood;
  size?: number;
  /** Decorative by default; pass a label when the mascot carries meaning. */
  label?: string;
  className?: string;
}

/**
 * Lumi — Bible XP's mascot: a small, warm soul of light.
 *
 * Drawn as layered SVG (radial gradients, rim light and specular highlights)
 * to read as a soft 3D-rendered character at any size, with no image assets.
 * The component is the single place to swap in final rendered artwork later:
 * keep the `mood` prop and replace the SVG with images per mood.
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
        <radialGradient id={id("glow")} cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="#FFE38A" stopOpacity="0.75" />
          <stop offset="55%" stopColor="#FFD46B" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#FFD46B" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id("body")} cx="40%" cy="42%" r="68%" fx="36%" fy="36%">
          <stop offset="0%" stopColor="#FFFEF6" />
          <stop offset="30%" stopColor="#FFF2BF" />
          <stop offset="62%" stopColor="#FFD976" />
          <stop offset="88%" stopColor="#F9B44A" />
          <stop offset="100%" stopColor="#EE9A38" />
        </radialGradient>
        <radialGradient id={id("bounce")} cx="50%" cy="100%" r="60%">
          <stop offset="0%" stopColor="#FF8E6E" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FF8E6E" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("rim")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={id("limb")} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#FFF6D2" />
          <stop offset="70%" stopColor="#FFD56E" />
          <stop offset="100%" stopColor="#F2A646" />
        </radialGradient>
        <radialGradient id={id("eye")} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#5A4870" />
          <stop offset="100%" stopColor="#2A2138" />
        </radialGradient>
        <filter id={id("soft")} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>

      <ellipse className="mascot__shadow" cx="100" cy="190" rx="38" ry="5.5" fill="#B08A3A" opacity="0.18" />
      <circle className="mascot__glow" cx="100" cy="112" r="96" fill={`url(#${id("glow")})`} />

      {mood === "celebrating" && (
        <g className="mascot__sparkles" fill="#FFC857">
          <Sparkle x={34} y={52} s={9} />
          <Sparkle x={168} y={44} s={11} delay />
          <Sparkle x={178} y={128} s={7} />
          <Sparkle x={22} y={136} s={6} delay />
        </g>
      )}
      {mood === "thinking" && (
        <g className="mascot__thought" fill="#FFFFFF" stroke="#E8DDBF" strokeWidth="2">
          <circle cx="156" cy="58" r="5" />
          <circle cx="170" cy="40" r="8" />
          <circle cx="186" cy="18" r="11" />
        </g>
      )}

      <g className="mascot__float">
        <g className="mascot__arm mascot__arm--left" style={{ transformOrigin: "56px 124px" }}>
          <path d={arms.left} stroke={`url(#${id("limb")})`} strokeWidth="15" strokeLinecap="round" fill="none" />
        </g>
        <g className="mascot__arm mascot__arm--right" style={{ transformOrigin: "144px 124px" }}>
          <path d={arms.right} stroke={`url(#${id("limb")})`} strokeWidth="15" strokeLinecap="round" fill="none" />
        </g>

        {/* Body: a rounded drop of light with a soft curled flame tip. */}
        <path
          d="M104 26 C 98 40, 112 48, 124 62 C 142 80, 154 98, 154 122 C 154 156, 130 180, 100 180 C 70 180, 46 156, 46 122 C 46 92, 66 72, 84 58 C 94 50, 100 40, 104 26 Z"
          fill={`url(#${id("body")})`}
        />
        <path
          d="M104 26 C 98 40, 112 48, 124 62 C 142 80, 154 98, 154 122 C 154 156, 130 180, 100 180 C 70 180, 46 156, 46 122 C 46 92, 66 72, 84 58 C 94 50, 100 40, 104 26 Z"
          fill={`url(#${id("bounce")})`}
        />
        <path
          d="M104 26 C 98 40, 112 48, 124 62 C 142 80, 154 98, 154 122 C 154 156, 130 180, 100 180 C 70 180, 46 156, 46 122 C 46 92, 66 72, 84 58 C 94 50, 100 40, 104 26 Z"
          fill="none"
          stroke={`url(#${id("rim")})`}
          strokeWidth="3"
        />
        {/* Specular highlights give the glossy, rendered volume. */}
        <ellipse cx="76" cy="96" rx="15" ry="9" transform="rotate(-38 76 96)" fill="#FFFFFF" opacity="0.85" filter={`url(#${id("soft")})`} />
        <circle cx="94" cy="80" r="3.2" fill="#FFFFFF" opacity="0.8" />

        <Face mood={mood} eyeFill={`url(#${id("eye")})`} />
      </g>
    </svg>
  );
}

function Face({ mood, eyeFill }: { mood: MascotMood; eyeFill: string }) {
  const happyEyes = mood === "happy" || mood === "celebrating";
  return (
    <g className="mascot__face">
      <ellipse cx="72" cy="140" rx="9" ry="5" fill="#FF8E6E" opacity="0.42" />
      <ellipse cx="128" cy="140" rx="9" ry="5" fill="#FF8E6E" opacity="0.42" />

      {mood === "thinking" && (
        <g stroke="#8A6A3A" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.7">
          <path d="M74 106 Q 82 101 90 104" />
          <path d="M110 102 Q 118 99 126 103" />
        </g>
      )}
      {mood === "encouraging" && (
        <g stroke="#8A6A3A" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6">
          <path d="M74 106 Q 82 102 90 106" />
          <path d="M110 106 Q 118 102 126 106" />
        </g>
      )}

      {happyEyes ? (
        <g stroke="#2E2440" strokeWidth="4.5" strokeLinecap="round" fill="none">
          <path d="M74 124 Q 82 114 90 124" />
          <path d="M110 124 Q 118 114 126 124" />
        </g>
      ) : (
        <g className="mascot__eyes">
          <ellipse cx={mood === "thinking" ? 84 : 82} cy="122" rx="7.2" ry="9.4" fill={eyeFill} />
          <ellipse cx={mood === "thinking" ? 120 : 118} cy="122" rx="7.2" ry="9.4" fill={eyeFill} />
          <circle cx={mood === "thinking" ? 86.5 : 84.5} cy="118" r="2.7" fill="#FFFFFF" />
          <circle cx={mood === "thinking" ? 122.5 : 120.5} cy="118" r="2.7" fill="#FFFFFF" />
          <circle cx={mood === "thinking" ? 82 : 80} cy="126" r="1.2" fill="#FFFFFF" opacity="0.8" />
          <circle cx={mood === "thinking" ? 118 : 116} cy="126" r="1.2" fill="#FFFFFF" opacity="0.8" />
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
          <path d="M86 140 Q 100 160 114 140 Z" fill="#7A3446" />
          <path d="M92 149 Q 100 156 108 149 Q 100 146 92 149 Z" fill="#FF7E86" />
        </g>
      );
    case "thinking":
      return <path d="M98 146 Q 106 143 112 146" stroke="#5A3A40" strokeWidth="3.4" strokeLinecap="round" fill="none" />;
    case "encouraging":
      return <path d="M89 142 Q 100 152 111 142" stroke="#5A3A40" strokeWidth="3.6" strokeLinecap="round" fill="none" />;
    default:
      return <path d="M90 141 Q 100 150 110 141" stroke="#5A3A40" strokeWidth="3.6" strokeLinecap="round" fill="none" />;
  }
}

function Sparkle({ x, y, s, delay }: { x: number; y: number; s: number; delay?: boolean }) {
  return (
    <path
      className={`mascot__sparkle${delay ? " mascot__sparkle--delay" : ""}`}
      style={{ transformOrigin: `${x}px ${y}px` }}
      d={`M${x} ${y - s} Q ${x} ${y} ${x + s} ${y} Q ${x} ${y} ${x} ${y + s} Q ${x} ${y} ${x - s} ${y} Q ${x} ${y} ${x} ${y - s} Z`}
    />
  );
}

/** Arm strokes per mood: shoulder → hand, as short rounded limbs. */
const ARMS: Record<MascotMood, { left: string; right: string }> = {
  normal: { left: "M56 124 Q 42 136 40 150", right: "M144 124 Q 158 136 160 150" },
  happy: { left: "M56 124 Q 42 136 40 150", right: "M144 120 Q 162 104 166 84" },
  thinking: { left: "M56 124 Q 42 136 40 150", right: "M144 128 Q 136 150 118 154" },
  celebrating: { left: "M56 118 Q 38 100 32 78", right: "M144 118 Q 162 100 168 78" },
  encouraging: { left: "M56 124 Q 42 136 40 150", right: "M144 122 Q 166 116 172 98" },
};
