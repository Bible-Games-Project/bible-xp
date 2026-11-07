import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FADE_IN_MS, FADE_OUT_MS, MUSIC_VOLUME, MusicPlayer, PLAYLIST, type AudioLike } from "./music";

class FakeAudio implements AudioLike {
  src = "";
  volume = 1;
  paused = true;
  currentTime = 0;
  preload = "";
  /** Like a browser before the first tap. */
  blocked = false;
  private onEnded: (() => void)[] = [];
  play() {
    if (this.blocked) return Promise.reject(new Error("NotAllowedError"));
    this.paused = false;
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
  addEventListener(_type: "ended", listener: () => void) {
    this.onEnded.push(listener);
  }
  finish() {
    this.paused = true;
    this.onEnded.forEach((l) => l());
  }
}

const SONGS = ["one.mp3", "two.mp3", "three.mp3"];
const settle = async (ms = Math.max(FADE_IN_MS, FADE_OUT_MS) + 100) => {
  await Promise.resolve();
  await Promise.resolve();
  vi.advanceTimersByTime(ms);
};

describe("background music", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("plays the playlist in order and starts again after the last song", async () => {
    const audio = new FakeAudio();
    const player = new MusicPlayer(SONGS, audio);
    player.start();
    await settle();
    expect(audio.src).toBe("one.mp3");
    expect(audio.paused).toBe(false);
    expect(audio.volume).toBeCloseTo(MUSIC_VOLUME);
    audio.finish();
    await settle(0);
    expect(audio.src).toBe("two.mp3");
    audio.finish();
    audio.finish();
    await settle(0);
    expect(audio.src).toBe("one.mp3");
    expect(player.track).toBe(0);
    expect(audio.paused).toBe(false);
  });

  it("fades out and pauses in a game, then fades back in from the same point", async () => {
    const audio = new FakeAudio();
    const player = new MusicPlayer(SONGS, audio);
    player.start();
    await settle();
    audio.currentTime = 42;
    player.enterGame();
    vi.advanceTimersByTime(FADE_OUT_MS / 2);
    expect(audio.paused).toBe(false); // halfway through the 3 s fade out
    expect(audio.volume).toBeCloseTo(MUSIC_VOLUME / 2, 1);
    vi.advanceTimersByTime(FADE_OUT_MS / 2 - 200);
    expect(audio.paused).toBe(false);
    vi.advanceTimersByTime(300);
    expect(audio.paused).toBe(true);
    expect(audio.volume).toBe(0);
    player.leaveGame();
    await settle(FADE_IN_MS / 2);
    expect(audio.paused).toBe(false);
    expect(audio.currentTime).toBe(42);
    expect(audio.volume).toBeCloseTo(MUSIC_VOLUME / 2, 1); // halfway through the 1 s fade in
    await settle(FADE_IN_MS / 2 + 50);
    expect(audio.volume).toBeCloseTo(MUSIC_VOLUME);
  });

  it("waits for the first tap when the browser blocks sound, then fades in", async () => {
    const audio = new FakeAudio();
    audio.blocked = true;
    const player = new MusicPlayer(SONGS, audio);
    player.start();
    await settle();
    expect(audio.paused).toBe(true);
    expect(audio.volume).toBe(0);
    audio.blocked = false;
    player.unlock();
    await settle(100);
    expect(audio.paused).toBe(false);
    expect(audio.volume).toBeLessThan(MUSIC_VOLUME);
    await settle();
    expect(audio.volume).toBeCloseTo(MUSIC_VOLUME);
  });

  it("stays silent with the Music setting off or the app in the background", async () => {
    const audio = new FakeAudio();
    const player = new MusicPlayer(SONGS, audio);
    player.setEnabled(false);
    player.start();
    await settle();
    expect(audio.paused).toBe(true);
    player.setEnabled(true);
    await settle();
    expect(audio.paused).toBe(false);
    player.setHidden(true);
    await settle();
    expect(audio.paused).toBe(true);
  });

  it("ships the songs numbered in playing order, with versions of a song never back to back", () => {
    expect(PLAYLIST).toHaveLength(8);
    const names = PLAYLIST.map((src) => src.match(/(\d+)-([a-z-]+?)(?:-ii)?(?:-[\w]{8})?\.mp3/)!);
    names.forEach((m, i) => expect(Number(m[1]), m[0]).toBe(i + 1));
    names.forEach((m, i) => expect(m[2], `${m[0]} next to ${names[(i + 1) % names.length][0]}`).not.toBe(names[(i + 1) % names.length][2]));
  });
});
