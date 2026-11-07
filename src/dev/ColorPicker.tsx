import { Copy, MousePointerClick, Pipette, RotateCcw, Undo2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { hslToRgb, parseColor, rgbToHsl, toHex, type Hsl, type Rgb } from "./color";

/*
 * Developer colour picker, part of developer mode (DevTools.tsx). Tap the
 * palette button, then any button, text or the mascot:
 * a panel opens with a colour wheel (hue around it, saturation from the centre
 * out) and a lightness bar. It changes either the design token the element
 * uses (e.g. --gold: every gold button changes) or only elements like the one
 * picked. The mascot shows its own colours (--mascot-* tokens) to change one
 * by one. A colour can also come from the screen (eyedropper) or from the
 * game's palette. Tweaks stay in this browser (localStorage) until reset;
 * "Copy CSS" gives the values to move into src/theme.
 *
 * Tweaks show only while developer mode is on, so switching it off shows the
 * colours the game really ships with. Nothing here runs at import time, so
 * release builds drop the module entirely.
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
const NONE: Overrides = { tokens: {}, rules: {} };
export type PickerMode = "idle" | "picking" | "editing";
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
  /** Set when the mascot was picked: its colour tokens, and the one for the part tapped. */
  mascot?: { tokens: string[]; part: string };
}

/** Custom properties declared on :root, in source order. */
function rootTokens(): string[] {
  const names: string[] = [];
  for (const rule of styleRules()) {
    if (rule.selectorText !== ":root") continue;
    for (let i = 0; i < rule.style.length; i++) if (rule.style[i].startsWith("--") && !names.includes(rule.style[i])) names.push(rule.style[i]);
  }
  return names;
}

function tokenColour(name: string): string {
  const rgb = parseColor(getComputedStyle(document.documentElement).getPropertyValue(name));
  return rgb ? toHex(rgb) : "#ffffff";
}

/** Which mascot colour a tapped part starts on. */
const MASCOT_PARTS: [string, string][] = [
  [".mascot__flame--outer", "--mascot-flame-2"],
  [".mascot__flame--middle", "--mascot-inner-2"],
  [".mascot__heart", "--mascot-heart-2"],
  [".mascot__eyes", "--mascot-eye-1"],
  [".mascot__mouth", "--mascot-mouth"],
  [".mascot__glow", "--mascot-glow-1"],
];

const MASCOT_NAMES: Record<string, string> = {
  flame: "Flame", inner: "Inner", heart: "Heart", glow: "Glow", eye: "Eyes",
  brow: "Brows", line: "Lines", mouth: "Mouth", tongue: "Tongue", shine: "Shine",
};
const mascotLabel = (token: string) => {
  const [part, n] = token.replace("--mascot-", "").split("-");
  return `${MASCOT_NAMES[part] ?? part}${n ? ` ${n}` : ""}`;
};

function describe(el: Element, prop: Prop): Info {
  if (el.closest("svg.mascot")) {
    const tokens = rootTokens().filter((n) => n.startsWith("--mascot-"));
    const part = MASCOT_PARTS.find(([sel]) => el.closest(sel))?.[1] ?? "--mascot-flame-2";
    return { selector: ".mascot", token: null, current: tokenColour(part), mascot: { tokens, part } };
  }
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

/* ------------------------------------------------------------ Eyedropper */

/** The pixel of a picture (object-fit: cover) under a screen point. */
function sampleImage(img: HTMLImageElement, x: number, y: number): Rgb | null {
  if (!img.naturalWidth) return null;
  const rect = img.getBoundingClientRect();
  const fit = getComputedStyle(img).objectFit;
  const scaleX = fit === "cover" ? Math.max(rect.width / img.naturalWidth, rect.height / img.naturalHeight) : rect.width / img.naturalWidth;
  const scaleY = fit === "cover" ? scaleX : rect.height / img.naturalHeight;
  const [px, py] = getComputedStyle(img)
    .objectPosition.split(" ")
    .map((v) => (v.endsWith("%") ? parseFloat(v) / 100 : 0.5));
  const left = rect.left + (rect.width - img.naturalWidth * scaleX) * px;
  const top = rect.top + (rect.height - img.naturalHeight * scaleY) * py;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, (x - left) / scaleX, (y - top) / scaleY, 1, 1, 0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    return a > 0 ? [r, g, b] : null;
  } catch {
    return null;
  }
}

/** The pixel of an inline SVG (e.g. the mascot) under a screen point, drawn with its live colours. */
async function sampleSvg(svg: SVGSVGElement, x: number, y: number): Promise<Rgb | null> {
  const rect = svg.getBoundingClientRect();
  const clone = svg.cloneNode(true) as SVGSVGElement;
  // A standalone SVG picture cannot see the page's CSS variables: bake the computed colours in.
  const from = [svg, ...Array.from(svg.querySelectorAll("*"))];
  const to = [clone, ...Array.from(clone.querySelectorAll("*"))];
  from.forEach((el, i) => {
    const cs = getComputedStyle(el);
    const copy = to[i] as SVGElement;
    if (el.tagName.toLowerCase() === "stop") {
      copy.removeAttribute("style");
      copy.setAttribute("stop-color", cs.stopColor);
      copy.setAttribute("stop-opacity", cs.stopOpacity);
    } else {
      copy.style.fill = cs.fill;
      copy.style.stroke = cs.stroke;
    }
  });
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(rect.width));
  clone.setAttribute("height", String(rect.height));
  try {
    const img = new Image();
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(clone))}`;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(rect.width);
    canvas.height = Math.ceil(rect.height);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, rect.width, rect.height);
    const [r, g, b, a] = ctx.getImageData(Math.floor(x - rect.left), Math.floor(y - rect.top), 1, 1).data;
    return a > 128 ? [r, g, b] : null;
  } catch {
    return null;
  }
}

/** The colour shown at a screen point: picture pixels, the mascot, or the nearest solid background. */
async function colourAt(x: number, y: number): Promise<Rgb | null> {
  for (const el of document.elementsFromPoint(x, y)) {
    if (el.closest("[data-devtool]")) continue;
    if (el === document.body || el === document.documentElement) break;
    if (el instanceof HTMLImageElement) {
      const c = sampleImage(el, x, y);
      if (c) return c;
      continue;
    }
    const svg = el.closest("svg");
    if (svg) {
      const c = await sampleSvg(svg, x, y);
      if (c) return c;
      continue;
    }
    const bg = parseColor(getComputedStyle(el).backgroundColor);
    if (bg) return bg;
  }
  // The pictures behind each screen ignore taps, so they are not in that list: look for them directly.
  for (const img of Array.from(document.querySelectorAll("img")).reverse()) {
    const r = img.getBoundingClientRect();
    if (img.closest("[data-devtool]") || x < r.left || x > r.right || y < r.top || y > r.bottom) continue;
    const c = sampleImage(img, x, y);
    if (c) return c;
  }
  return parseColor(getComputedStyle(document.body).backgroundColor);
}

type EyeDropperCtor = new () => { open: () => Promise<{ sRGBHex: string }> };

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

/** The picker itself; DevTools owns `mode` and starts it with its palette button. */
export function ColorPicker({ enabled, mode, setMode }: { enabled: boolean; mode: PickerMode; setMode: (mode: PickerMode) => void }) {
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
  const [mascotToken, setMascotToken] = useState("--mascot-flame-2");
  const [sampling, setSampling] = useState(false);
  const [note, setNote] = useState("");
  const palette = useMemo(() => rootTokens().filter((n) => /^--(sky|sand|flame)(-\d+)?$|^--(success|danger)$/.test(n)), []);
  const target = chain[index] ?? null;
  const info = useMemo(() => (target ? describe(target, prop) : null), [target, prop]);
  const tokenOn = Boolean(info?.token && useToken);
  // The token being edited: a mascot colour, the element's token, or none (an element rule).
  const editToken = info?.mascot ? mascotToken : tokenOn ? info!.token!.token : null;
  const key = info ? (editToken ?? `${info.selector}|${PROPS[prop].write}`) : "";

  useEffect(() => {
    applyOverrides(enabled ? overrides : NONE);
    try {
      localStorage.setItem(STORE, JSON.stringify(overrides));
    } catch {
      /* Not saved; the tweak still shows until reload. */
    }
  }, [overrides, enabled]);

  // Keep the panel clear of the element being edited.
  useEffect(() => {
    if (!target) return;
    const rect = target.getBoundingClientRect();
    setDock(rect.top + rect.height / 2 > window.innerHeight / 2 ? "top" : "bottom");
  }, [target]);

  // A new element, property or mascot colour: start from the colour it shows now.
  const startFrom = (hex: string) => {
    setHsl(rgbToHsl(parseColor(hex)!));
    setHexDraft(hex);
    setOriginal(hex);
  };
  useEffect(() => {
    if (!info) return;
    if (info.mascot) setMascotToken(info.mascot.part);
    startFrom(info.current);
  }, [info]);
  const chooseMascotColour = (token: string) => {
    setMascotToken(token);
    startFrom(tokenColour(token));
  };

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
      if (editToken) copy.tokens[editToken] = hex;
      else copy.rules[key] = { selector: info.selector, prop: PROPS[prop].write, value: hex };
      return copy;
    });
  };
  const applyColour = (rgb: Rgb) => change(rgbToHsl(rgb));

  // Eyedropper: the browser's own when it has one (desktop Chrome and Edge),
  // otherwise the next tap takes the colour under the finger.
  const pickFromScreen = async () => {
    setNote("");
    const Dropper = (window as unknown as { EyeDropper?: EyeDropperCtor }).EyeDropper;
    if (Dropper) {
      try {
        const rgb = parseColor((await new Dropper().open()).sRGBHex);
        if (rgb) applyColour(rgb);
        return;
      } catch (error) {
        if ((error as DOMException).name === "AbortError") return;
      }
    }
    setSampling(true);
  };

  useEffect(() => {
    if (!sampling) return;
    const outside = (e: Event) => e.target instanceof Element && !e.target.closest("[data-devtool]");
    const block = (e: Event) => {
      if (!outside(e)) return;
      e.preventDefault();
      e.stopPropagation();
    };
    const take = (e: MouseEvent) => {
      if (!outside(e)) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      void colourAt(e.clientX, e.clientY).then((rgb) => {
        if (rgb) applyColour(rgb);
        else setNote("No colour found there. Try another spot.");
        setSampling(false);
      });
    };
    const escape = (e: KeyboardEvent) => e.key === "Escape" && setSampling(false);
    const events = ["pointerdown", "pointerup", "mousedown", "mouseup"] as const;
    events.forEach((name) => window.addEventListener(name, block, true));
    window.addEventListener("click", take, true);
    window.addEventListener("keydown", escape);
    return () => {
      events.forEach((name) => window.removeEventListener(name, block, true));
      window.removeEventListener("click", take, true);
      window.removeEventListener("keydown", escape);
    };
  });

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


      {mode === "picking" && (
        <div className="dcp-banner">
          <MousePointerClick size={16} /> Tap a button, a text or the mascot
          <button type="button" onClick={() => setMode("idle")}>
            Cancel
          </button>
        </div>
      )}

      {mode === "editing" && sampling && (
        <div className="dcp-banner">
          <Pipette size={16} /> Tap anywhere to take its colour
          <button type="button" onClick={() => setSampling(false)}>
            Cancel
          </button>
        </div>
      )}

      {mode === "editing" && info && !sampling && (
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

          {info.mascot ? (
            <div className="dcp-mascot">
              <span className="dcp-label">Mascot colours</span>
              <div className="dcp-mascot-grid">
                {info.mascot.tokens.map((token) => (
                  <button key={token} type="button" className={token === mascotToken ? "is-on" : ""} onClick={() => chooseMascotColour(token)} title={token}>
                    <span style={{ background: overrides.tokens[token] ?? tokenColour(token) }} />
                    {mascotLabel(token)}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}

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

          <div className="dcp-palette" title="Game colours">
            <span className="dcp-label">Game colours</span>
            <div>
              {palette.map((token) => (
                <button key={token} type="button" title={token} style={{ background: tokenColour(token) }} onClick={() => applyColour(parseColor(tokenColour(token))!)} />
              ))}
            </div>
          </div>
          {note && <p className="dcp-note">{note}</p>}

          <div className="dcp-actions">
            <button type="button" onClick={pickFromScreen}>
              <Pipette size={14} /> Pick colour from screen
            </button>
            <button type="button" onClick={() => setMode("picking")}>
              <MousePointerClick size={14} /> Other element
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

export const PICKER_STYLES = `
[data-devtool] { font: 13px/1.35 system-ui, sans-serif; color: #1d2733; }
[data-devtool] button { font: inherit; cursor: pointer; }
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
.dcp-label { display: block; font-size: 11px; font-weight: 700; color: #4a5868; margin-bottom: 4px; }
.dcp-mascot-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }
.dcp-mascot-grid button { display: flex; align-items: center; gap: 5px; padding: 3px 6px; border: 1px solid #d5dbe3; border-radius: 8px; background: #fff; font-size: 12px; text-align: left; }
.dcp-mascot-grid button.is-on { border-color: #1d2733; box-shadow: inset 0 0 0 1px #1d2733; font-weight: 700; }
.dcp-mascot-grid span { flex: none; width: 14px; height: 14px; border-radius: 50%; box-shadow: inset 0 0 0 1px rgb(0 0 0 / .15); }
.dcp-palette > div { display: flex; flex-wrap: wrap; gap: 4px; }
.dcp-palette button { width: 22px; height: 22px; padding: 0; border: 0; border-radius: 6px; box-shadow: inset 0 0 0 1px rgb(0 0 0 / .15); }
.dcp-note { margin: 0; color: #b0352f; font-size: 12px; }
.dcp-css { width: 100%; box-sizing: border-box; min-height: 90px; font: 12px ui-monospace, monospace; border: 1px solid #d5dbe3; border-radius: 8px; padding: 6px; }
`;
