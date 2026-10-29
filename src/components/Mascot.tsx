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
 * Lumi — Bible XP's mascot: the light rising from an ancient clay oil lamp,
 * the light that shows the way through Scripture (discovery, understanding,
 * wisdom). The flame uses the app's --flame colours (src/theme/tokens.css) and
 * the lamp the clay of the Home picture's stones, so Lumi belongs to the
 * landscape and stands out against its sky.
 *
 * Use it sparingly, where it has something to say: onboarding, the Home
 * greeting, lesson and story completion, level-ups and streak milestones,
 * encouragement. Not beside every question, so it never competes with the
 * Scripture on screen.
 *
 * Drawn as layered SVG (lamp, three flame layers, a warm core, a soft
 * highlight), with no image assets. The flame flickers gently; the face and
 * arms change with `mood`. This is the single place to swap in final artwork
 * later: keep the `mood` prop.
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
          <stop offset="0%" stopColor="#f56a19" />
          <stop offset="55%" stopColor="#c24a0a" />
          <stop offset="100%" stopColor="#953b0f" />
        </linearGradient>
        <linearGradient id={id("middle")} x1="0.4" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#ffa929" />
          <stop offset="60%" stopColor="#ff7d1a" />
          <stop offset="100%" stopColor="#f56a19" />
        </linearGradient>
        <radialGradient id={id("core")} cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor="#fff080" />
          <stop offset="55%" stopColor="#ffcf3d" />
          <stop offset="100%" stopColor="#ffa929" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("limb")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffa929" />
          <stop offset="100%" stopColor="#c24a0a" />
        </linearGradient>
        <radialGradient id={id("eye")} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#572a14" />
          <stop offset="100%" stopColor="#2e170a" />
        </radialGradient>
        <linearGradient id={id("clay")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d9935c" />
          <stop offset="100%" stopColor="#a8602f" />
        </linearGradient>
        <filter id={id("soft")} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>

      <ellipse cx="100" cy="197" rx="46" ry="3.4" fill="#8a4520" opacity="0.18" />
      <circle className="mascot__glow" cx="100" cy="108" r="96" fill={`url(#${id("glow")})`} />

      {/* The lamp's rim and oil, behind the flame. */}
      <ellipse cx="100" cy="158" rx="58" ry="9" fill="#efc495" />
      <ellipse cx="100" cy="157" rx="50" ry="6" fill="#5a3018" />

      {/* The flame, scaled, its base sunk into the lamp so the light rises out of it. */}
      <g transform="translate(20 18) scale(0.8)">
        {mood === "celebrating" && (
          <g className="mascot__sparkles">
            <Sparkle x={30} y={54} s={9} color="#ffa929" />
            <Sparkle x={172} y={30} s={11} color="#ff7d1a" delay />
            <Sparkle x={182} y={126} s={7} color="#ffcf3d" />
            <Sparkle x={18} y={138} s={6} color="#f56a19" delay />
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
      </g>

      {/* The lamp's body in front: a wide, shallow clay saucer lamp. */}
      <ellipse cx="100" cy="192" rx="20" ry="4" fill="#94562b" />
      <path d="M42 158 C 44 176 70 190 100 190 C 130 190 156 176 158 158 C 156 164 130 167 100 167 C 70 167 44 164 42 158 Z" fill={`url(#${id("clay")})`} />
      <path d="M42 158 C 44 164 70 167 100 167 C 130 167 156 164 158 158" fill="none" stroke="#efc495" strokeWidth="2.2" />
      <path d="M56 175 C 74 183 126 183 144 175" fill="none" stroke="#8a4a22" strokeWidth="1.6" strokeDasharray="1 5" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function Face({ mood, eyeFill }: { mood: MascotMood; eyeFill: string }) {
  const happyEyes = mood === "happy" || mood === "celebrating";
  const dx = mood === "thinking" ? 3 : 0;
  return (
    <g className="mascot__face">
      {(mood === "thinking" || mood === "encouraging") && (
        <g stroke="#8a3a12" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.65">
          <path d={mood === "thinking" ? "M76 115 Q 84 110 92 113" : "M76 115 Q 84 111 92 115"} />
          <path d={mood === "thinking" ? "M110 111 Q 118 108 126 112" : "M108 115 Q 116 111 124 115"} />
        </g>
      )}

      {happyEyes ? (
        <g stroke="#2e170a" strokeWidth="4.5" strokeLinecap="round" fill="none">
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
          <path d="M86 148 Q 100 168 114 148 Z" fill="#753515" />
          <path d="M92 157 Q 100 164 108 157 Q 100 154 92 157 Z" fill="#ff9966" />
        </g>
      );
    case "thinking":
      return <path d="M99 154 Q 107 151 113 154" stroke="#572a14" strokeWidth="3.4" strokeLinecap="round" fill="none" />;
    case "encouraging":
      return <path d="M89 150 Q 100 160 111 150" stroke="#572a14" strokeWidth="3.6" strokeLinecap="round" fill="none" />;
    default:
      return <path d="M90 149 Q 100 158 110 149" stroke="#572a14" strokeWidth="3.6" strokeLinecap="round" fill="none" />;
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
