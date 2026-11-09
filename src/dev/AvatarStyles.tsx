import { X } from "lucide-react";
import { useState } from "react";

/*
 * Developer tool: the full-body avatar style test (November 2026). Three
 * candidate styles, each with the same four characters, shown as collectible
 * cards so the maintainer can pick one before the 400 characters are painted.
 * Prompts and method: docs/avatar-art.md. Remove this panel and
 * src/dev/avatar-styles/ once a style is chosen.
 */

const IMAGES = import.meta.glob<string>("./avatar-styles/*.webp", { eager: true, import: "default" });
const image = (style: string, id: string) => IMAGES[`./avatar-styles/${style}-${id}.webp`];

const STYLES = [
  { id: "bright", name: "A · Bright painting" },
  { id: "3d", name: "B · 3D animation" },
  { id: "flat", name: "C · Flat cartoon" },
];

const PEOPLE = [
  { id: "adam", name: "Adam", frame: "start" },
  { id: "eve", name: "Eve", frame: "start" },
  { id: "noah", name: "Noah", frame: "streak" },
  { id: "rebekah", name: "Rebekah", frame: "plus" },
];

export function AvatarStyles({ onClose }: { onClose: () => void }) {
  const [big, setBig] = useState<{ style: string; id: string } | null>(null);
  const person = big && PEOPLE.find((p) => p.id === big.id);

  return (
    <div className="das-panel" role="dialog" aria-label="Avatar styles">
      <div className="das-head">
        <strong>Avatar styles</strong>
        <button type="button" onClick={onClose} title="Close" aria-label="Close">
          <X size={18} />
        </button>
      </div>
      <p className="das-note">Tap a card to see it big. Frames are only a sample: plain for Journey, gold for streaks, violet for Plus.</p>
      {STYLES.map((s) => (
        <section key={s.id} className="das-style">
          <h3>{s.name}</h3>
          <div className="das-row">
            {PEOPLE.map((p) => (
              <button key={p.id} type="button" className={`das-card is-${p.frame}`} onClick={() => setBig({ style: s.id, id: p.id })}>
                <img src={image(s.id, p.id)} alt="" />
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </section>
      ))}
      {big && person && (
        <button type="button" className="das-big" onClick={() => setBig(null)} aria-label="Close">
          <span className={`das-card is-${person.frame}`}>
            <img src={image(big.style, big.id)} alt="" />
            <span>{person.name}</span>
          </span>
        </button>
      )}
    </div>
  );
}

export const AVATAR_STYLES_CSS = `
.das-panel { position: fixed; inset: 0; z-index: 10002; overflow-y: auto; padding: 14px 12px 40px; background: #f4f6f9; color: #1d2733;
  font-family: system-ui, sans-serif; }
.das-head { display: flex; align-items: center; gap: 6px; max-width: 560px; margin: 0 auto; }
.das-head strong { flex: 1; font-size: 17px; }
.das-head button { display: grid; place-items: center; width: 34px; height: 34px; border: 0; border-radius: 10px; background: #e3e8ef; color: #1d2733; }
.das-note { max-width: 560px; margin: 6px auto 0; font-size: 13px; color: #5a6878; }
.das-style { max-width: 560px; margin: 16px auto 0; }
.das-style h3 { margin: 0 0 8px; font-size: 15px; }
.das-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.das-card { position: relative; display: flex; flex-direction: column; align-items: center; padding: 6px 4px 0; border: 3px solid #c9d3df;
  border-radius: 14px; background: linear-gradient(#d7ecfb, #fbefd6); overflow: hidden; box-shadow: 0 3px 0 rgb(0 0 0 / .12); }
.das-card img { display: block; width: 100%; aspect-ratio: 2 / 3; object-fit: contain; }
.das-card span { align-self: stretch; margin: 0 -4px; padding: 4px 2px; background: rgb(255 255 255 / .85); font-size: 12px; font-weight: 800; text-align: center; }
.das-card.is-streak { border-color: #f0a51e; background: linear-gradient(#ffe7a8, #ffb55c); box-shadow: 0 0 0 2px #fff4cf inset, 0 3px 0 #b8730a; }
.das-card.is-plus { border-color: #8a5cf6; background: linear-gradient(#e9dcff, #c7b0ff); box-shadow: 0 0 0 2px #f4eeff inset, 0 3px 0 #5b35b8; }
.das-big { position: fixed; inset: 0; display: grid; place-items: center; padding: 24px; border: 0; background: rgb(15 23 32 / .75); }
.das-big .das-card { width: min(340px, 80vw); padding-top: 14px; border-width: 4px; border-radius: 22px; }
.das-big .das-card span { font-size: 20px; padding: 8px; }
`;
