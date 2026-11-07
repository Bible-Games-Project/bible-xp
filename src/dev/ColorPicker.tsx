import { Copy, MousePointerClick, Palette, RotateCcw, Undo2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { createRoot } from "react-dom/client";
import { hslToRgb, parseColor, rgbToHsl, toHex, type Hsl } from "./color";

/*
 * Developer colour picker. Tap the palette button, then any button or text:
 * a panel opens with a colour wheel (hue around it, saturation from the centre
 * out) and a lightness bar. It changes either the design token the element
 * uses (e.g. --gold: every gold button changes) or only elements like the one
 * picked. Tweaks stay in this browser (localStorage) until reset; "Copy CSS"
 * gives the values to move into src/theme.
 *
 * Mounted only by `bun run dev` and the devtools build (`bun run
 * build:devtools`), never in a release build: see main.tsx. Nothing here runs
 * at import time, so release builds drop the module entirely.
 */

type Prop = "background" | "text" | "border";
const PROPS: Record<Prop, { label: string; read: string[]; write: string; computed: "backgroundColor" | "color" | "borderTopColor" }> = {
  background: { label: "Background", read: ["background-color", "background"], write: "background", computed: "backgroundColor" },
  text: { label: "Text", read: ["color"], write: "color", computed: "color" },
  border: { label: "Border", read: ["border-color", "border", "border-top-color"], write: "border-color", computed: "borderTopColor" },
};

interface Overrides {
  tokens: Record<string, string>;
  rules: Record<string, { selector: string; prop: string; value: string }>;
}

const STORE = "testalume:dev-colours";
const OVERRIDES_ID = "dev-colour-overrides";

function loadOverrides(): Overrides {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) ?? "null") as Overrides | null;
    if (saved && typeof saved.tokens === "object" && typeof saved.rules === "object") return saved;
  } catch {
    /* Private mode or broken data: start clean. */
  }
  return { tokens: {}, rules: {} };
}

function cssText(o: Overrides): string {
  const tokens = Object.entries(o.tokens);
  const rules = Object.values(o.rules);
  let css = "";
  if (tokens.length) css += `:root {\n${tokens.map(([name, value]) => `  ${name}: ${value};`).join("\n")}\n}\n`;
  for (const r of rules) css += `${r.selector} {\n  ${r.prop}: ${r.value};\n}\n`;
  return css;
}

function applyOverrides(o: Overrides) {
  let style = document.getElementById(OVERRIDES_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = OVERRIDES_ID;
  }
  // Last in <head>: a later :root wins for tokens, and element rules also get !important.
  document.head.appendChild(style);
  const tokens = Object.entries(o.tokens).map(([name, value]) => `${name}: ${value};`);
  style.textContent =
    (tokens.length ? `:root { ${tokens.join(" ")} }\n` : "") +
    Object.values(o.rules)
      .map((r) => `${r.selector} { ${r.prop}: ${r.value} !important; }`)
      .join("\n");
}

/* ------------------------------------------------------------ Which rule colours an element */

function* walk(list: CSSRuleList): Generator<CSSStyleRule> {
  for (const rule of Array.from(list)) {
    if (rule instanceof CSSStyleRule) yield rule;
    else if ("cssRules" in rule) yield* walk((rule as CSSGroupingRule).cssRules);
  }
}

function* styleRules(): Generator<CSSStyleRule> {
  for (const sheet of Array.from(document.styleSheets)) {
    if ((sheet.ownerNode as Element | null)?.id === OVERRIDES_ID) continue;
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    yield* walk(rules);
  }
}

function matches(el: Element, selector: string): boolean {
  try {
    return el.matches(selector);
  } catch {
    return false;
  }
}

/** The custom property behind a colour on `el`, from the last rule that sets it (null if a plain value). */
function declaredVar(el: Element, props: string[]): { name: string | null; set: boolean } {
  let result = { name: null as string | null, set: false };
  for (const rule of styleRules()) {
    if (!matches(el, rule.selectorText)) continue;
    for (const p of props) {
      const raw = rule.style.getPropertyValue(p);
      if (!raw) continue;
      result = { name: raw.match(/var\(\s*(--[\w-]+)/)?.[1] ?? null, set: true };
    }
  }
  return result;
}

/** Where a custom property is defined for `el`: on an element rule (local) or on :root (a token). */
function definition(el: Element, name: string): { value: string; root: boolean } | null {
  for (let node: Element | null = el; node; node = node.parentElement) {
    let found: string | null = null;
    for (const rule of styleRules()) {
      if (rule.selectorText === ":root") continue;
      if (matches(node, rule.selectorText) && rule.style.getPropertyValue(name)) found = rule.style.getPropertyValue(name).trim();
    }
    if (found) return { value: found, root: false };
  }
  for (const rule of styleRules()) {
    if (rule.selectorText === ":root" && rule.style.getPropertyValue(name)) return { value: rule.style.getPropertyValue(name).trim(), root: true };
  }
  return null;
}

/** Follows local aliases (e.g. --b: var(--gold)) up to the :root token they use. */
function rootToken(el: Element, name: string): { chain: string[]; token: string } | null {
  const chain = [name];
  let current = name;
  for (let i = 0; i < 8; i++) {
    const def = definition(el, current);
    if (!def) return null;
    if (def.root) return { chain, token: current };
    const alias = def.value.match(/^var\(\s*(--[\w-]+)\s*\)$/)?.[1];
    if (!alias) return null;
    chain.push(alias);
    current = alias;
  }
  return null;
}

function selectorFor(el: Element): string {
  const classes = Array.from(el.classList).filter((c) => !c.startsWith("dcp"));
  if (classes.length) return classes.map((c) => `.${CSS.escape(c)}`).join("");
  const parent = el.parentElement;
  const tag = el.tagName.toLowerCase();
  return parent && parent !== document.body ? `${selectorFor(parent)} > ${tag}` : tag;
}

interface Info {
  selector: string;
  token: { chain: string[]; token: string } | null;
  current: string;
}

function describe(el: Element, prop: Prop): Info {
  // Text colour is often inherited: look up the tree for the rule that sets it.
  let source: Element | null = el;
  let found = declaredVar(el, PROPS[prop].read);
  while (prop === "text" && !found.set && source?.parentElement) {
    source = source.parentElement;
    found = declaredVar(source, PROPS[prop].read);
  }
  const token = found.name && source ? rootToken(source, found.name) : null;
  const rgb = parseColor(getComputedStyle(el)[PROPS[prop].computed]);
  return { selector: selectorFor(el), token, current: rgb ? toHex(rgb) : "#ffffff" };
}

const label = (el: Element) => `${el.tagName.toLowerCase()}${Array.from(el.classList).slice(0, 2).map((c) => `.${c}`).join("")}`;

/* ------------------------------------------------------------ UI */

function Wheel({ hsl, onChange }: { hsl: Hsl; onChange: (next: Hsl) => void }) {
  const SIZE = 168;
  const canvas = useRef<HTMLCanvasElement>(null);
  const [h, s, l] = hsl;

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const n = Math.round(SIZE * dpr);
    c.width = n;
    c.height = n;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const img = ctx.createImageData(n, n);
    const r = n / 2;
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const dx = x - r;
        const dy = y - r;
        const d = Math.hypot(dx, dy) / r;
        const i = (y * n + x) * 4;
        if (d > 1) continue;
        const [R, G, B] = hslToRgb([(Math.atan2(dy, dx) * 180) / Math.PI + 360, d, l]);
        img.data[i] = R;
        img.data[i + 1] = G;
        img.data[i + 2] = B;
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [l]);

  const pick = (e: ReactPointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = e.clientX - rect.left - SIZE / 2;
    const dy = e.clientY - rect.top - SIZE / 2;
    const sat = Math.min(1, Math.hypot(dx, dy) / (SIZE / 2));
    onChange([((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360, sat, l]);
  };
  const angle = (h * Math.PI) / 180;

  return (
    <div
      className="dcp-wheel"
      style={{ width: SIZE, height: SIZE }}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        pick(e);
      }}
      onPointerMove={(e) => e.buttons && pick(e)}
    >
      <canvas ref={canvas} style={{ width: SIZE, height: SIZE }} />
      <span
        className="dcp-handle"
        style={{ left: SIZE / 2 + Math.cos(angle) * s * (SIZE / 2), top: SIZE / 2 + Math.sin(angle) * s * (SIZE / 2), background: toHex(hslToRgb(hsl)) }}
      />
    </div>
  );
}

function ColorPicker() {
  const [mode, setMode] = useState<"idle" | "picking" | "editing">("idle");
  const [chain, setChain] = useState<Element[]>([]);
  const [index, setIndex] = useState(0);
  const [prop, setProp] = useState<Prop>("background");
  const [useToken, setUseToken] = useState(true);
  const [hsl, setHsl] = useState<Hsl>([36, 1, 0.58]);
  const [hexDraft, setHexDraft] = useState("#ffa929");
  const [original, setOriginal] = useState("#ffa929");
  const [overrides, setOverrides] = useState<Overrides>(loadOverrides);
  const [dock, setDock] = useState<"bottom" | "top">("bottom");
  const [showCss, setShowCss] = useState(false);
  const [box, setBox] = useState<DOMRect | null>(null);
  const target = chain[index] ?? null;
  const info = useMemo(() => (target ? describe(target, prop) : null), [target, prop]);
  const tokenOn = Boolean(info?.token && useToken);
  const key = info ? (tokenOn ? info.token!.token : `${info.selector}|${PROPS[prop].write}`) : "";

  useEffect(() => {
    applyOverrides(overrides);
    try {
      localStorage.setItem(STORE, JSON.stringify(overrides));
    } catch {
      /* Not saved; the tweak still shows until reload. */
    }
  }, [overrides]);

  // Keep the panel clear of the element being edited.
  useEffect(() => {
    if (!target) return;
    const rect = target.getBoundingClientRect();
    setDock(rect.top + rect.height / 2 > window.innerHeight / 2 ? "top" : "bottom");
  }, [target]);

  // A new element or property: start from the colour it shows now.
  useEffect(() => {
    if (!info) return;
    const rgb = parseColor(info.current)!;
    setHsl(rgbToHsl(rgb));
    setHexDraft(info.current);
    setOriginal(info.current);
  }, [info]);

  // Picking: the next tap selects an element instead of using it.
  useEffect(() => {
    if (mode !== "picking") return;
    const outside = (e: Event) => e.target instanceof Element && !e.target.closest("[data-devtool]");
    const block = (e: Event) => {
      if (!outside(e)) return;
      e.preventDefault();
      e.stopPropagation();
    };
    const hover = (e: PointerEvent) => {
      if (outside(e)) setBox((e.target as Element).getBoundingClientRect());
    };
    const choose = (e: MouseEvent) => {
      if (!outside(e)) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const picked = e.target as Element;
      const ancestors: Element[] = [];
      for (let node: Element | null = picked; node && node !== document.body && ancestors.length < 5; node = node.parentElement) ancestors.push(node);
      setChain(ancestors);
      setIndex(0);
      const bg = parseColor(getComputedStyle(picked).backgroundColor);
      setProp(bg ? "background" : "text");
      setUseToken(true);
      setMode("editing");
    };
    const escape = (e: KeyboardEvent) => e.key === "Escape" && setMode("idle");
    const events = ["pointerdown", "pointerup", "mousedown", "mouseup"] as const;
    events.forEach((name) => window.addEventListener(name, block, true));
    window.addEventListener("pointermove", hover, true);
    window.addEventListener("click", choose, true);
    window.addEventListener("keydown", escape);
    return () => {
      events.forEach((name) => window.removeEventListener(name, block, true));
      window.removeEventListener("pointermove", hover, true);
      window.removeEventListener("click", choose, true);
      window.removeEventListener("keydown", escape);
    };
  }, [mode]);

  // While editing, keep the outline on the target as the page scrolls.
  useEffect(() => {
    if (mode !== "editing" || !target) return;
    let frame = 0;
    const loop = () => {
      setBox(target.isConnected ? target.getBoundingClientRect() : null);
      frame = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(frame);
  }, [mode, target]);

  const change = (next: Hsl) => {
    if (!info) return;
    setHsl(next);
    const hex = toHex(hslToRgb(next));
    setHexDraft(hex);
    setOverrides((o) => {
      const copy: Overrides = { tokens: { ...o.tokens }, rules: { ...o.rules } };
      if (tokenOn) copy.tokens[info.token!.token] = hex;
      else copy.rules[key] = { selector: info.selector, prop: PROPS[prop].write, value: hex };
      return copy;
    });
  };

  const undo = () =>
    setOverrides((o) => {
      const copy: Overrides = { tokens: { ...o.tokens }, rules: { ...o.rules } };
      delete copy.tokens[key];
      delete copy.rules[key];
      return copy;
    });

  const copyCss = async () => {
    setShowCss(true);
    try {
      await navigator.clipboard.writeText(`/* Testalume colour tweaks (dev picker) */\n${cssText(overrides)}`);
    } catch {
      /* The text box below lets you copy it by hand. */
    }
  };

  const [h, s, l] = hsl;
  const current = toHex(hslToRgb(hsl));

  return (
    <div data-devtool="">
      {box && mode !== "idle" && (
        <div className={`dcp-outline${mode === "editing" ? " is-target" : ""}`} style={{ left: box.left - 3, top: box.top - 3, width: box.width + 6, height: box.height + 6 }} />
      )}

      {mode === "idle" && (
        <button type="button" className="dcp-fab" onClick={() => setMode("picking")} aria-label="Developer colour picker">
          <Palette size={18} />
          <span>DEV</span>
        </button>
      )}

      {mode === "picking" && (
        <div className="dcp-banner">
          <MousePointerClick size={16} /> Tap a button or a text to recolour it
          <button type="button" onClick={() => setMode("idle")}>
            Cancel
          </button>
        </div>
      )}

      {mode === "editing" && info && (
        <section className={`dcp-panel dcp-panel--${dock}`} aria-label="Developer colour picker">
          <header className="dcp-head">
            <strong>
              <span className="dcp-tag">DEV</span> Colour picker
            </strong>
            <button type="button" onClick={() => setDock(dock === "bottom" ? "top" : "bottom")} title="Move panel">
              ⇅
            </button>
            <button type="button" onClick={() => setMode("idle")} title="Close">
              <X size={16} />
            </button>
          </header>

          <div className="dcp-chips" title="The element to recolour">
            {chain.map((el, i) => (
              <button key={i} type="button" className={i === index ? "is-on" : ""} onClick={() => setIndex(i)}>
                {label(el)}
              </button>
            ))}
          </div>

          <div className="dcp-seg">
            {(Object.keys(PROPS) as Prop[]).map((p) => (
              <button key={p} type="button" className={p === prop ? "is-on" : ""} onClick={() => setProp(p)}>
                {PROPS[p].label}
              </button>
            ))}
          </div>

          <div className="dcp-scope">
            {info.token && (
              <label>
                <input type="radio" checked={tokenOn} onChange={() => setUseToken(true)} />
                Token <code>{info.token.token}</code> · everything that uses it
                {info.token.chain.length > 1 && <small> (via {info.token.chain.slice(0, -1).join(" → ")})</small>}
              </label>
            )}
            <label>
              <input type="radio" checked={!tokenOn} onChange={() => setUseToken(false)} />
              Only elements like this one: <code>{info.selector}</code>
            </label>
          </div>

          <div className="dcp-body">
            <Wheel hsl={hsl} onChange={change} />
            <div className="dcp-side">
              <div className="dcp-swatches" title="Before / now">
                <span style={{ background: original }} />
                <span style={{ background: current }} />
              </div>
              <div className="dcp-hsl">
                H {Math.round(h)}° · S {Math.round(s * 100)}% · L {Math.round(l * 100)}%
              </div>
              <input
                className="dcp-hex"
                value={hexDraft}
                spellCheck={false}
                onChange={(e) => {
                  setHexDraft(e.target.value);
                  const rgb = parseColor(e.target.value);
                  if (rgb && e.target.value.length >= 4) change(rgbToHsl(rgb));
                }}
              />
            </div>
          </div>

          <label className="dcp-light">
            Light
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(l * 100)}
              onChange={(e) => change([h, s, Number(e.target.value) / 100])}
              style={{ background: `linear-gradient(to right, #000, hsl(${h} ${s * 100}% 50%), #fff)` }}
            />
          </label>

          <div className="dcp-actions">
            <button type="button" onClick={() => setMode("picking")}>
              <MousePointerClick size={14} /> Pick another
            </button>
            <button type="button" onClick={undo}>
              <Undo2 size={14} /> Undo this
            </button>
            <button type="button" onClick={() => setOverrides({ tokens: {}, rules: {} })}>
              <RotateCcw size={14} /> Reset all
            </button>
            <button type="button" onClick={copyCss}>
              <Copy size={14} /> Copy CSS
            </button>
          </div>
          {showCss && <textarea className="dcp-css" readOnly value={cssText(overrides) || "/* No tweaks yet */"} onFocus={(e) => e.currentTarget.select()} />}
        </section>
      )}
    </div>
  );
}

const STYLES = `
[data-devtool] { font: 13px/1.35 system-ui, sans-serif; color: #1d2733; }
[data-devtool] button { font: inherit; cursor: pointer; }
.dcp-fab { position: fixed; left: 10px; bottom: calc(var(--tabbar-h, 66px) + env(safe-area-inset-bottom, 0px) + 12px); z-index: 10000;
  display: flex; align-items: center; gap: 4px; padding: 6px 9px; border: 0; border-radius: 999px;
  background: #1d2733; color: #fff; font-weight: 700; font-size: 11px; letter-spacing: .06em; opacity: .85; box-shadow: 0 4px 14px rgb(0 0 0 / .25); }
.dcp-banner { position: fixed; left: 50%; top: 10px; transform: translateX(-50%); z-index: 10001; display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; border-radius: 999px; background: #1d2733; color: #fff; box-shadow: 0 6px 20px rgb(0 0 0 / .3); white-space: nowrap; }
.dcp-banner button { border: 0; border-radius: 999px; padding: 3px 10px; background: #fff; color: #1d2733; }
.dcp-outline { position: fixed; z-index: 9999; pointer-events: none; border: 2px dashed #d6248f; border-radius: 6px; }
.dcp-outline.is-target { border-style: solid; }
.dcp-panel { position: fixed; left: 50%; transform: translateX(-50%); z-index: 10001; width: min(372px, calc(100vw - 16px));
  max-height: 72vh; overflow: auto; padding: 10px 12px 12px; border-radius: 16px; background: #fff; box-shadow: 0 10px 40px rgb(0 0 0 / .35);
  display: flex; flex-direction: column; gap: 8px; }
.dcp-panel--bottom { bottom: 8px; }
.dcp-panel--top { top: 8px; }
.dcp-head { display: flex; align-items: center; gap: 6px; }
.dcp-head strong { flex: 1; }
.dcp-head button { border: 0; background: #eef1f5; border-radius: 8px; width: 28px; height: 28px; display: grid; place-items: center; }
.dcp-tag { background: #d6248f; color: #fff; border-radius: 4px; padding: 0 4px; font-size: 10px; }
.dcp-chips { display: flex; gap: 4px; overflow-x: auto; }
.dcp-chips button, .dcp-seg button, .dcp-actions button { border: 1px solid #d5dbe3; background: #fff; border-radius: 8px; padding: 4px 8px; white-space: nowrap; }
.dcp-chips button.is-on, .dcp-seg button.is-on { background: #1d2733; color: #fff; border-color: #1d2733; }
.dcp-seg { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }
.dcp-scope { display: flex; flex-direction: column; gap: 3px; }
.dcp-scope label { display: flex; flex-wrap: wrap; gap: 2px 6px; align-items: baseline; }
.dcp-scope code { background: #eef1f5; padding: 0 4px; border-radius: 4px; word-break: break-all; }
.dcp-body { display: flex; gap: 12px; align-items: center; }
.dcp-wheel { position: relative; flex: none; touch-action: none; border-radius: 50%; }
.dcp-wheel canvas { display: block; border-radius: 50%; }
.dcp-handle { position: absolute; width: 16px; height: 16px; margin: -8px 0 0 -8px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 0 1px rgb(0 0 0 / .4); pointer-events: none; }
.dcp-side { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.dcp-swatches { display: flex; height: 40px; border-radius: 8px; overflow: hidden; border: 1px solid #d5dbe3; }
.dcp-swatches span { flex: 1; }
.dcp-hsl { font-variant-numeric: tabular-nums; color: #4a5868; }
.dcp-hex { width: 100%; box-sizing: border-box; padding: 5px 8px; border: 1px solid #d5dbe3; border-radius: 8px; font: 13px ui-monospace, monospace; }
.dcp-light { display: flex; align-items: center; gap: 8px; }
.dcp-light input { flex: 1; -webkit-appearance: none; appearance: none; height: 14px; border-radius: 999px; border: 1px solid #d5dbe3; }
.dcp-light input::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #fff; border: 2px solid #1d2733; }
.dcp-light input::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: #fff; border: 2px solid #1d2733; }
.dcp-actions { display: flex; flex-wrap: wrap; gap: 4px; }
.dcp-actions button { display: inline-flex; align-items: center; gap: 4px; }
.dcp-css { width: 100%; box-sizing: border-box; min-height: 90px; font: 12px ui-monospace, monospace; border: 1px solid #d5dbe3; border-radius: 8px; padding: 6px; }
`;

/** Adds the picker to the page. Saved tweaks are applied straight away. */
export function mountColorPicker() {
  const style = document.createElement("style");
  style.textContent = STYLES;
  document.head.appendChild(style);
  applyOverrides(loadOverrides());
  const host = document.createElement("div");
  host.setAttribute("data-devtool", "");
  document.body.appendChild(host);
  createRoot(host).render(<ColorPicker />);
}
