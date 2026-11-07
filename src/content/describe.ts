import type { Step } from "./types";

/** One-line prompt and answer for a step, used by the mistakes review list. */
export function describeStep(step: Step): { prompt: string; answer: string } {
  switch (step.mode) {
    case "form-word":
      return { prompt: step.clue, answer: step.word };
    case "match-pairs":
      return { prompt: step.prompt, answer: step.pairs.map((p) => `${p.left} → ${p.right}`).join(" · ") };
    case "quiz":
      return { prompt: step.question, answer: step.options[step.correctIndex] };
    case "complete-verse":
      return { prompt: `${step.before}____${step.after}`, answer: step.answer };
    case "story-order":
      return { prompt: step.prompt, answer: step.events.map((e, i) => `${i + 1}. ${e.label}`).join("  ") };
    case "who-am-i":
      return { prompt: step.clues[0].text, answer: step.answer };
  }
}
