/*
 * The cast: who speaks in the game and with which ElevenLabs voice. The
 * maintainer picks voices in developer mode (DEV → Voices), where they can
 * also add roles; the picks are copied here so the lines can be voiced with
 * them. `voice: null` means not chosen yet.
 */

export interface CastVoice {
  /** ElevenLabs voice_id (Voice Library). */
  id: string;
  name: string;
}

export interface VoiceRole {
  id: string;
  name: string;
  voice: CastVoice | null;
}

export const CAST: VoiceRole[] = [
  { id: "narrator", name: "Narrator", voice: null },
  { id: "testalume", name: "Testalume (mascot)", voice: null },
];
