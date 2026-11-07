import luminasPath from "../assets/music/1-luminas-path.mp3";
import magicalKingdom from "../assets/music/2-magical-kingdom.mp3";
import adventureAwaits from "../assets/music/3-adventure-awaits.mp3";
import magicalMorning from "../assets/music/4-magical-morning.mp3";
import luminasPathII from "../assets/music/5-luminas-path-ii.mp3";
import magicalKingdomII from "../assets/music/6-magical-kingdom-ii.mp3";
import adventureAwaitsII from "../assets/music/7-adventure-awaits-ii.mp3";
import morningKingdom from "../assets/music/8-morning-kingdom.mp3";

/*
 * Background music. The playlist plays in order and starts again from the
 * first song after the last. It sounds on menus (Home, Journey, Daily,
 * Train, Ranking, Profile, onboarding...) and fades out while a game is
 * being played (GameSession), pausing exactly where it was; back on a menu
 * it fades in from that point. It also pauses while the app is in the
 * background, and follows the Music setting.
 *
 * Browsers only let sound start after the first tap or key press, so if
 * starting at once is refused, the music begins with the first touch.
 *
 * To add songs: put the file in src/assets/music (128 kbps MP3, levelled to
 * about -16 LUFS like the others, numbered in playing order) and add it to
 * PLAYLIST. Versions of the same song are kept apart, also across the loop.
 */
export const PLAYLIST = [
  luminasPath,
  magicalKingdom,
  adventureAwaits,
  magicalMorning,
  luminasPathII,
  magicalKingdomII,
  adventureAwaitsII,
  morningKingdom,
];

/** Music volume, below the sound effects. */
export const MUSIC_VOLUME = 0.5;
/** Maintainer's choice: a slow 3 s fade out into a game, a quick 1 s fade back in. */
export const FADE_OUT_MS = 3000;
export const FADE_IN_MS = 1000;
/** One volume step every this many ms, so long fades stay smooth. */
const TICK_MS = 40;

/** What the player needs from <audio>; a fake one stands in for it in tests. */
export interface AudioLike {
  src: string;
  volume: number;
  paused: boolean;
  currentTime: number;
  preload: string;
  play(): Promise<void>;
  pause(): void;
  addEventListener(type: "ended", listener: () => void): void;
}

export class MusicPlayer {
  private readonly audio: AudioLike;
  private index = 0;
  private games = 0;
  private enabled = true;
  private hidden = false;
  private unlocked = false;
  private gain: GainNode | null = null;
  private context: AudioContext | null = null;
  private fade: ReturnType<typeof setInterval> | null = null;
  private level = 0;

  constructor(
    private readonly playlist: string[],
    audio: AudioLike,
    private readonly makeContext?: () => AudioContext | null,
  ) {
    this.audio = audio;
    this.audio.preload = "auto";
    this.audio.src = playlist[0];
    this.audio.volume = 0;
    this.audio.addEventListener("ended", () => this.next());
  }

  get track(): number {
    return this.index;
  }

  /** Whether the music should be heard right now. */
  get wanted(): boolean {
    return this.enabled && this.games === 0 && !this.hidden;
  }

  /** Tries to start at once; the first tap or key press retries if the browser refused. */
  start() {
    this.update();
  }

  /** Call from the first user gesture: the moment every browser allows sound. */
  unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    this.ensureGain();
    void this.context?.resume().catch(() => {});
    this.update();
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    this.update();
  }

  setHidden(hidden: boolean) {
    this.hidden = hidden;
    this.update();
  }

  /** A game screen opened: fade out and pause where the song is. */
  enterGame() {
    this.games += 1;
    this.update();
  }

  /** A game screen closed: back on a menu, fade in from the same point. */
  leaveGame() {
    this.games = Math.max(0, this.games - 1);
    this.update();
  }

  private next() {
    this.index = (this.index + 1) % this.playlist.length;
    this.audio.src = this.playlist[this.index];
    this.audio.currentTime = 0;
    if (this.wanted) void this.play();
  }

  private update() {
    if (!this.wanted) {
      this.rampTo(0, FADE_OUT_MS, () => this.audio.pause());
      return;
    }
    if (!this.audio.paused) {
      this.rampTo(MUSIC_VOLUME, FADE_IN_MS);
      return;
    }
    // Fade in only once playback has really started, and only if still wanted.
    void this.play().then((playing) => {
      if (!playing) return;
      if (this.wanted) this.rampTo(MUSIC_VOLUME, FADE_IN_MS);
      else this.rampTo(0, FADE_OUT_MS, () => this.audio.pause());
    });
  }

  /** False when the browser refuses (no tap yet): unlock() tries again. */
  private async play(): Promise<boolean> {
    try {
      await this.audio.play();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Volume goes through a Web Audio gain when available, because iOS ignores
   * changes to an <audio> element's own volume; otherwise the element's volume.
   */
  private ensureGain() {
    if (this.gain || !this.makeContext) return;
    const ctx = this.makeContext();
    if (!ctx) return;
    try {
      const source = ctx.createMediaElementSource(this.audio as HTMLAudioElement);
      this.gain = ctx.createGain();
      this.gain.gain.value = this.level;
      source.connect(this.gain).connect(ctx.destination);
      this.audio.volume = 1;
      this.context = ctx;
    } catch {
      this.gain = null;
    }
  }

  private setLevel(level: number) {
    this.level = level;
    if (this.gain) this.gain.gain.value = level;
    else this.audio.volume = level;
  }

  private rampTo(target: number, ms: number, done?: () => void) {
    if (this.fade) clearInterval(this.fade);
    const from = this.level;
    if (from === target) {
      done?.();
      return;
    }
    const steps = Math.max(1, Math.round(ms / TICK_MS));
    let step = 0;
    this.fade = setInterval(() => {
      step += 1;
      this.setLevel(from + ((target - from) * step) / steps);
      if (step >= steps) {
        clearInterval(this.fade!);
        this.fade = null;
        done?.();
      }
    }, ms / steps);
  }
}

function audioContext(): AudioContext | null {
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  try {
    return Ctor ? new Ctor() : null;
  } catch {
    return null;
  }
}

let player: MusicPlayer | null = null;

/** The app's one music player, created on first use in the browser. */
export function music(): MusicPlayer | null {
  if (player || typeof Audio === "undefined") return player;
  player = new MusicPlayer(PLAYLIST, new Audio(), audioContext);
  const unlock = () => player?.unlock();
  for (const type of ["pointerdown", "keydown", "touchend"]) window.addEventListener(type, unlock, { capture: true, passive: true });
  document.addEventListener("visibilitychange", () => player?.setHidden(document.visibilityState === "hidden"));
  return player;
}
