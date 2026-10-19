import type { AvatarId } from "../progress/model";

/** Abstract gradient avatars: no faces of real people, no image files. */
const AVATAR_STYLE: Record<AvatarId, { from: string; to: string; glyph: string; outline?: boolean }> = {
  dawn: { from: "#FFD36E", to: "#FF8066", glyph: "M12 4 L14 10 L20 12 L14 14 L12 20 L10 14 L4 12 L10 10 Z" },
  sky: { from: "#7ED3F5", to: "#4A8FE8", glyph: "M5 15 Q 5 10 10 10 Q 11 6 15 7 Q 19 8 19 12 Q 21 13 20 15 Z" },
  leaf: { from: "#8FE3A8", to: "#2FA868", glyph: "M6 18 Q 6 6 18 6 Q 18 18 6 18 Z M6 18 L 14 10" },
  flame: { from: "#FFC857", to: "#F0663E", glyph: "M12 3 Q 18 9 16 15 Q 14 20 12 20 Q 8 20 7 15 Q 7 11 10 8 Q 10 12 12 12 Q 13 8 12 3 Z" },
  wave: { from: "#9FE6E0", to: "#3B9FC9", glyph: "M2 10 Q 6 5 10 10 T 18 10 T 22 10 M2 16 Q 6 11 10 16 T 18 16 T 22 16", outline: true },
  star: { from: "#C7B5FF", to: "#7C5FE0", glyph: "M12 3 L14.6 9 L21 9.5 L16 13.6 L17.6 20 L12 16.5 L6.4 20 L8 13.6 L3 9.5 L9.4 9 Z" },
};

export function Avatar({ id, size = 44 }: { id: AvatarId; size?: number }) {
  const s = AVATAR_STYLE[id];
  const gid = `avatar-${id}`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="avatar">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={s.from} />
          <stop offset="100%" stopColor={s.to} />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="12" fill={`url(#${gid})`} />
      <circle cx="9" cy="7" r="5" fill="#fff" opacity="0.18" />
      <path d={s.glyph} fill={s.outline ? "none" : "#fff"} stroke="#fff" strokeWidth={s.outline ? 2.4 : 1.2} strokeLinejoin="round" strokeLinecap="round" opacity="0.92" transform="translate(2.4 2.4) scale(0.8)" />
    </svg>
  );
}
