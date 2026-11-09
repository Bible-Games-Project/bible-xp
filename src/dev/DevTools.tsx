import { Mic, Palette, RotateCcw, Trophy, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { navigate } from "../app/router";
import { progressActions } from "../progress/store";
import { AVATAR_STYLES_CSS, AvatarStyles } from "./AvatarStyles";
import { ColorPicker, PICKER_STYLES, type PickerMode } from "./ColorPicker";
import { setDevMode, useDevMode } from "./devMode";
import { VOICE_STYLES, VoicePanel } from "./VoicePanel";

/*
 * The DEV button: switches developer mode on and off. While it is on, every
 * Journey stop is open (StoryScreen), every avatar can be tried on
 * (CharacterPicker) and these tools appear beside it:
 * colour picker, voices (pick an ElevenLabs voice for each role), the
 * avatar style test, the ranking with sample players, and replaying onboarding.
 * Only developer builds mount this (main.tsx); release builds drop it.
 */
function DevTools() {
  const on = useDevMode();
  const [mode, setMode] = useState<PickerMode>("idle");
  const [voices, setVoices] = useState(false);
  const [styles, setStyles] = useState(false);

  useEffect(() => {
    if (on) return;
    setMode("idle");
    setVoices(false);
    setStyles(false);
  }, [on]);

  return (
    <div data-devtool="">
      {mode === "idle" && !voices && !styles && (
        <div className="dev-bar">
          <button
            type="button"
            className={`dev-toggle${on ? " is-on" : ""}`}
            aria-pressed={on}
            aria-label="Developer mode"
            title={on ? "Developer mode is on: all games open, tools available" : "Developer mode is off"}
            onClick={() => setDevMode(!on)}
          >
            DEV <span>{on ? "ON" : "OFF"}</span>
          </button>
          {on && (
            <>
              <button type="button" className="dev-tool" aria-label="Colours" title="Colours" onClick={() => setMode("picking")}>
                <Palette size={17} aria-hidden="true" />
              </button>
              <button type="button" className="dev-tool" aria-label="Voices" title="Voices" onClick={() => setVoices(true)}>
                <Mic size={17} aria-hidden="true" />
              </button>
              <button type="button" className="dev-tool" aria-label="Avatar styles" title="Avatar styles" onClick={() => setStyles(true)}>
                <UserRound size={17} aria-hidden="true" />
              </button>
              <button type="button" className="dev-tool" aria-label="Sample ranking" title="Sample ranking" onClick={() => navigate({ name: "leaderboard", sample: true })}>
                <Trophy size={17} aria-hidden="true" />
              </button>
              <button type="button" className="dev-tool" aria-label="Replay onboarding" title="Replay onboarding" onClick={() => progressActions.restartOnboarding()}>
                <RotateCcw size={17} aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      )}
      <ColorPicker enabled={on} mode={on ? mode : "idle"} setMode={setMode} />
      {on && voices && <VoicePanel onClose={() => setVoices(false)} />}
      {on && styles && <AvatarStyles onClose={() => setStyles(false)} />}
    </div>
  );
}

const DEV_STYLES = `
.dev-bar { position: fixed; left: 10px; bottom: calc(var(--tabbar-h, 66px) + env(safe-area-inset-bottom, 0px) + 12px); z-index: 10000;
  display: flex; align-items: center; gap: 6px; }
.dev-toggle, .dev-tool { display: inline-flex; align-items: center; gap: 5px; border: 0; border-radius: 999px; font-weight: 700;
  box-shadow: 0 4px 14px rgb(0 0 0 / .25); }
.dev-toggle { padding: 6px 10px; background: #1d2733; color: #fff; font-size: 11px; letter-spacing: .06em; opacity: .8; }
.dev-toggle span { padding: 1px 5px; border-radius: 999px; background: rgb(255 255 255 / .2); font-size: 10px; }
.dev-toggle.is-on { background: #d6248f; opacity: 1; }
.dev-tool { justify-content: center; width: 34px; height: 34px; padding: 0; background: #fff; color: #1d2733; }
`;

/** Adds the DEV button to the page. */
export function mountDevTools() {
  const style = document.createElement("style");
  style.textContent = PICKER_STYLES + DEV_STYLES + VOICE_STYLES + AVATAR_STYLES_CSS;
  document.head.appendChild(style);
  const host = document.createElement("div");
  document.body.appendChild(host);
  createRoot(host).render(<DevTools />);
}
