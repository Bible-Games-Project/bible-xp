import { Check, Copy, Pause, Play, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { music } from "../lib/music";
import { CAST } from "../voice/cast";
import library from "./voiceLibrary.json";

/*
 * Developer mode: the Voices panel. The maintainer listens to ElevenLabs
 * Voice Library voices (200 men, 200 women, 20 older men, 20 older women,
 * from the Bible RPG project's library) and picks one for each role of the
 * cast (src/voice/cast.ts): the narrator, Testalume, and any role added here.
 *
 * Previews are ElevenLabs' free samples (no credits). They play from
 * ElevenLabs' links, except in the Claude artifact, whose page cannot load
 * other sites: its build packs them next to the page (voice-previews.json
 * and voices-<n>.mp3). Picks stay in this browser; "Copy choices" gives the
 * list to send, and the lines are then voiced with those voices.
 */

type Voice = [id: string, name: string, labels: string, preview: string];
interface Group {
  key: string;
  title: string;
  note: string;
  voices: Voice[];
}
// Read lazily: nothing here may run at import time, so release builds drop the module.
const groups = () => (library as unknown as { groups: Group[] }).groups;

interface Choices {
  /** Roles added in this panel, besides the cast's own. */
  custom: { id: string; name: string }[];
  /** Voice picked for each role. */
  picks: Record<string, string>;
}

const STORE = "testalume:dev-voices";

function loadChoices(): Choices {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) ?? "null") as Choices | null;
    if (saved && Array.isArray(saved.custom) && typeof saved.picks === "object") return saved;
  } catch {
    /* Private mode or broken data: start clean. */
  }
  return { custom: [], picks: {} };
}

/* ------------------------------------------------------------ Previews */

interface Packs {
  files: string[];
  /** voice id → [pack index, byte offset, byte length] */
  items: Record<string, [number, number, number]>;
}

let packs: Promise<Packs | null> | null = null;
const packData = new Map<string, Promise<ArrayBuffer>>();
let player: HTMLAudioElement | null = null;
const previewPlayer = () => (player ??= new Audio());

/** The artifact's packed previews, if this page has them (elsewhere the request finds no JSON). */
function previewPacks(): Promise<Packs | null> {
  packs ??= fetch("voice-previews.json")
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);
  return packs;
}

async function previewUrl(voice: Voice): Promise<string> {
  const p = await previewPacks();
  const at = p?.items[voice[0]];
  if (!p || !at) return voice[3];
  const file = p.files[at[0]];
  if (!packData.has(file)) packData.set(file, fetch(file).then((r) => r.arrayBuffer()));
  const data = await packData.get(file)!;
  return URL.createObjectURL(new Blob([data.slice(at[1], at[1] + at[2])], { type: "audio/mpeg" }));
}

/* ------------------------------------------------------------ Panel */

export function VoicePanel({ onClose }: { onClose: () => void }) {
  const GROUPS = groups();
  const [choices, setChoices] = useState<Choices>(loadChoices);
  const roles = useMemo(() => [...CAST.map(({ id, name }) => ({ id, name })), ...choices.custom], [choices.custom]);
  const [role, setRole] = useState(roles[0].id);
  const [groupKey, setGroupKey] = useState(GROUPS[0].key);
  const [query, setQuery] = useState("");
  const [playing, setPlaying] = useState<string | null>(null);
  const [newRole, setNewRole] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const voices = useMemo(() => new Map(GROUPS.flatMap((g) => g.voices.map((v) => [v[0], v] as const))), [GROUPS]);
  const pickOf = (roleId: string) => choices.picks[roleId] ?? CAST.find((r) => r.id === roleId)?.voice?.id ?? null;
  const group = GROUPS.find((g) => g.key === groupKey)!;
  const q = query.trim().toLowerCase();
  const shown = q ? group.voices.filter((v) => `${v[1]} ${v[2]}`.toLowerCase().includes(q)) : group.voices;

  useEffect(() => {
    try {
      localStorage.setItem(STORE, JSON.stringify(choices));
    } catch {
      /* Not saved; the picks still hold until reload. */
    }
  }, [choices]);

  // Quiet the background music while listening, and stop any preview on close.
  useEffect(() => {
    const m = music();
    m?.enterGame();
    return () => {
      player?.pause();
      m?.leaveGame();
    };
  }, []);

  const toggle = async (voice: Voice) => {
    const audio = previewPlayer();
    if (playing === voice[0]) {
      audio.pause();
      setPlaying(null);
      return;
    }
    setPlaying(voice[0]);
    audio.src = await previewUrl(voice);
    audio.onended = () => setPlaying(null);
    audio.play().catch(() => setPlaying(null));
  };

  const pick = (voiceId: string | null) =>
    setChoices((c) => {
      const picks = { ...c.picks };
      if (voiceId) picks[role] = voiceId;
      else delete picks[role];
      return { ...c, picks };
    });

  const addRole = () => {
    const name = newRole.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `role-${Date.now()}`;
    if (roles.some((r) => r.id === id)) return setRole(id);
    setChoices((c) => ({ ...c, custom: [...c.custom, { id, name }] }));
    setRole(id);
    setNewRole("");
  };

  const removeRole = (id: string) => {
    setChoices((c) => {
      const picks = { ...c.picks };
      delete picks[id];
      return { custom: c.custom.filter((r) => r.id !== id), picks };
    });
    if (role === id) setRole(roles[0].id);
  };

  const summary = roles
    .map((r) => {
      const v = pickOf(r.id);
      return `${r.name}: ${v ? `${voices.get(v)?.[1] ?? "?"} (${v})` : "not chosen yet"}`;
    })
    .join("\n");
  const copy = async () => {
    setCopied(summary);
    try {
      await navigator.clipboard.writeText(`Testalume voices\n${summary}`);
    } catch {
      /* The text box lets you copy it by hand. */
    }
  };

  const roleName = (id: string) => roles.find((r) => r.id === id)?.name ?? id;
  const usedBy = (voiceId: string) => roles.filter((r) => pickOf(r.id) === voiceId).map((r) => r.name);

  return (
    <section className="dvp" aria-label="Voices">
      <header className="dvp-head">
        <strong>
          <span className="dcp-tag">DEV</span> Voices
        </strong>
        <button type="button" onClick={onClose} title="Close" aria-label="Close">
          <X size={18} />
        </button>
      </header>

      <div className="dvp-roles">
        {roles.map((r) => {
          const v = pickOf(r.id);
          const voice = v ? voices.get(v) : undefined;
          return (
            <div key={r.id} className={`dvp-role${r.id === role ? " is-on" : ""}`}>
              <button type="button" className="dvp-role__main" onClick={() => setRole(r.id)} aria-pressed={r.id === role}>
                <span className="dvp-role__name">{r.name}</span>
                <span className="dvp-role__voice">{voice ? voice[1] : "No voice yet"}</span>
              </button>
              {voice && (
                <button type="button" className="dvp-icon" onClick={() => toggle(voice)} aria-label={`Play ${voice[1]}`}>
                  {playing === voice[0] ? <Pause size={15} /> : <Play size={15} />}
                </button>
              )}
              {!CAST.some((c) => c.id === r.id) && (
                <button type="button" className="dvp-icon" onClick={() => removeRole(r.id)} aria-label={`Remove ${r.name}`}>
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          );
        })}
        <form
          className="dvp-add"
          onSubmit={(e) => {
            e.preventDefault();
            addRole();
          }}
        >
          <input value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="New role, e.g. Quiz host" />
          <button type="submit" aria-label="Add role">
            <Plus size={16} />
          </button>
        </form>
      </div>

      <p className="dvp-hint">
        Choosing for <b>{roleName(role)}</b>. Tap ▶ to listen, then “Use”.
      </p>

      <div className="dvp-tabs">
        {GROUPS.map((g) => (
          <button key={g.key} type="button" className={g.key === groupKey ? "is-on" : ""} onClick={() => setGroupKey(g.key)}>
            {g.title} <small>{g.voices.length}</small>
          </button>
        ))}
      </div>
      <input className="dvp-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or style (deep, calm, narrator…)" />

      <ol className="dvp-list">
        {shown.map((v) => {
          const users = usedBy(v[0]);
          const mine = pickOf(role) === v[0];
          return (
            <li key={v[0]} className={mine ? "is-mine" : ""}>
              <button type="button" className="dvp-icon dvp-play" onClick={() => toggle(v)} aria-label={`Play ${v[1]}`}>
                {playing === v[0] ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <span className="dvp-voice">
                <span className="dvp-voice__name">{v[1]}</span>
                <span className="dvp-voice__labels">
                  {v[2]}
                  {users.length > 0 && <em> · {users.join(", ")}</em>}
                </span>
              </span>
              <button type="button" className="dvp-use" onClick={() => pick(mine ? null : v[0])}>
                {mine ? (
                  <>
                    <Check size={14} /> In use
                  </>
                ) : (
                  "Use"
                )}
              </button>
            </li>
          );
        })}
        {shown.length === 0 && <li className="dvp-empty">No voice matches “{query}”.</li>}
      </ol>

      <footer className="dvp-foot">
        <p>{group.note} Previews are ElevenLabs' free samples (no credits). Picks stay in this browser: send me the list and I'll voice the lines.</p>
        <button type="button" onClick={copy}>
          <Copy size={14} /> Copy choices
        </button>
        {copied && <textarea readOnly value={copied} onFocus={(e) => e.currentTarget.select()} />}
      </footer>
    </section>
  );
}

export const VOICE_STYLES = `
.dvp { position: fixed; inset: 8px; z-index: 10002; display: flex; flex-direction: column; gap: 8px; max-width: 520px; margin: 0 auto;
  padding: 10px 12px; border-radius: 16px; background: #fff; box-shadow: 0 10px 40px rgb(0 0 0 / .35); overflow: hidden; }
.dvp-head { display: flex; align-items: center; gap: 6px; }
.dvp-head strong { flex: 1; font-size: 15px; }
.dvp-head button, .dvp-icon { display: grid; place-items: center; width: 30px; height: 30px; border: 0; border-radius: 8px; background: #eef1f5; color: #1d2733; flex: none; }
.dvp-roles { flex: none; display: flex; flex-direction: column; gap: 4px; max-height: 34vh; overflow-y: auto; }
.dvp-role { display: flex; align-items: center; gap: 4px; padding: 3px; border: 1px solid #d5dbe3; border-radius: 10px; }
.dvp-role.is-on { border-color: #d6248f; box-shadow: inset 0 0 0 1px #d6248f; }
.dvp-role__main { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: flex-start; border: 0; background: none; padding: 2px 6px; text-align: left; }
.dvp-role__name { font-weight: 700; }
.dvp-role__voice { font-size: 12px; color: #4a5868; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
.dvp-add { display: flex; gap: 4px; }
.dvp-add input, .dvp-search { min-width: 0; padding: 6px 8px; border: 1px solid #d5dbe3; border-radius: 8px; font: inherit; }
.dvp-add input { flex: 1; }
.dvp-search { flex: none; }
.dvp-add button { width: 34px; border: 0; border-radius: 8px; background: #1d2733; color: #fff; display: grid; place-items: center; }
.dvp-hint { margin: 0; font-size: 12px; color: #4a5868; }
.dvp-tabs { display: flex; gap: 4px; overflow-x: auto; }
.dvp-tabs button { border: 1px solid #d5dbe3; background: #fff; border-radius: 8px; padding: 4px 8px; white-space: nowrap; }
.dvp-tabs button.is-on { background: #1d2733; color: #fff; border-color: #1d2733; }
.dvp-tabs small { opacity: .7; }
.dvp-list { flex: 1; min-height: 120px; overflow-y: auto; margin: 0; padding: 0; list-style: none; border-top: 1px solid #eef1f5; }
.dvp-list li { display: flex; align-items: center; gap: 8px; padding: 6px 2px; border-bottom: 1px solid #eef1f5; }
.dvp-list li.is-mine { background: #fdeaf4; }
.dvp-play { width: 34px; height: 34px; border-radius: 50%; }
.dvp-voice { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.dvp-voice__name { font-weight: 600; font-size: 13px; }
.dvp-voice__labels { font-size: 11px; color: #4a5868; }
.dvp-voice__labels em { color: #d6248f; font-style: normal; font-weight: 700; }
.dvp-use { display: inline-flex; align-items: center; gap: 3px; border: 1px solid #d5dbe3; background: #fff; border-radius: 8px; padding: 4px 9px; flex: none; }
.dvp-list li.is-mine .dvp-use { background: #d6248f; border-color: #d6248f; color: #fff; }
.dvp-empty { justify-content: center; color: #4a5868; }
.dvp-foot { display: flex; flex-direction: column; gap: 6px; }
.dvp-foot p { margin: 0; font-size: 11px; color: #4a5868; }
.dvp-foot button { align-self: flex-start; display: inline-flex; align-items: center; gap: 4px; border: 1px solid #d5dbe3; background: #fff; border-radius: 8px; padding: 4px 9px; }
.dvp-foot textarea { min-height: 70px; font: 12px ui-monospace, monospace; border: 1px solid #d5dbe3; border-radius: 8px; padding: 6px; }
`;
