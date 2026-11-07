import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MUSIC_VOLUME, MusicPlayer, PLAYLIST, type AudioLike } from "./music";

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
const settle = async (ms = 1500) => {
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
    vi.advanceTimersByTime(300);
    expect(audio.paused).toBe(false); // still fading out
    expect(audio.volume).toBeLessThan(MUSIC_VOLUME);
    await settle();
    expect(audio.paused).toBe(true);
    expect(audio.volume).toBe(0);
    player.leaveGame();
    await settle(100);
    expect(audio.paused).toBe(false);
    expect(audio.currentTime).toBe(42);
    expect(audio.volume).toBeLessThan(MUSIC_VOLUME); // still fading in
    await settle();
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

  it("ships the five songs in their playing order", () => {
    expect(PLAYLIST).toHaveLength(5);
    expect(PLAYLIST[0]).toContain("1-luminas-path");
    expect(PLAYLIST[4]).toContain("5-morning-kingdom");
  });
});
