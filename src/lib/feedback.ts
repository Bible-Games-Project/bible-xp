import { getProgress } from "../progress/store";

/*
 * Sound and vibration cues. Sounds are short, soft tones synthesised with the
 * Web Audio API, so there are no audio files to ship or fail to load.
 */

export type Cue = "tap" | "correct" | "incorrect" | "complete";

let audio: AudioContext | null = null;

function context(): AudioContext | null {
  if (audio) return audio;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    audio = new Ctor();
  } catch {
    return null;
  }
  return audio;
}

const NOTES: Record<Cue, { freq: number; at: number; len: number }[]> = {
  tap: [{ freq: 660, at: 0, len: 0.05 }],
  correct: [
    { freq: 784, at: 0, len: 0.12 },
    { freq: 1047, at: 0.09, len: 0.18 },
  ],
  incorrect: [
    { freq: 392, at: 0, len: 0.14 },
    { freq: 349, at: 0.11, len: 0.2 },
  ],
  complete: [
    { freq: 659, at: 0, len: 0.12 },
    { freq: 784, at: 0.1, len: 0.12 },
    { freq: 1047, at: 0.2, len: 0.3 },
  ],
};

const VIBRATION: Record<Cue, number | number[]> = {
  tap: 8,
  correct: 20,
  incorrect: [30, 60, 30],
  complete: [20, 40, 20, 40, 40],
};

export function canVibrate(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

export function playCue(cue: Cue) {
  const { settings } = getProgress();
  if (settings.vibration && canVibrate()) {
    try {
      navigator.vibrate(VIBRATION[cue]);
    } catch {
      // Some browsers throw when vibration is blocked; it is only a nicety.
    }
  }
  if (!settings.sound) return;
  const ctx = context();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();
  const start = ctx.currentTime + 0.01;
  for (const note of NOTES[cue]) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = note.freq;
    const t = start + note.at;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(cue === "tap" ? 0.04 : 0.09, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + note.len);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + note.len + 0.02);
  }
}
