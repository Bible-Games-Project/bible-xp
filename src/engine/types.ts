import type { ReactNode } from "react";
import type { GameMode, StepOf } from "../content/types";

/** What a game reports when the player has finished one step. */
export interface StepResolution {
  /** Right at the first attempt. */
  correct: boolean;
  correctCount: number;
  incorrectCount: number;
  /** Shown in the feedback panel, e.g. the right answer or the full verse. */
  detail?: ReactNode;
}

export interface GameProps<M extends GameMode> {
  step: StepOf<M>;
  /** Locked while feedback is showing, so answers cannot change. */
  locked: boolean;
  onResolve: (resolution: StepResolution) => void;
  /** Lets a game swap the mascot's mood mid-step (e.g. after a wrong guess). */
  onMood?: (mood: "thinking" | "encouraging" | "happy") => void;
}
