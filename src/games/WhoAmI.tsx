import { useMemo, useState } from "react";
import { formatRef, getContent } from "../content";
import type { GameProps } from "../engine/types";
import { useI18n } from "../i18n";
import { playCue } from "../lib/feedback";
import { shuffle } from "../lib/random";
import { PromptCard } from "./shared";

export function WhoAmI({ step, locked, onResolve, onMood }: GameProps<"who-am-i">) {
  const { t, language } = useI18n();
  const pack = getContent(language.code);
  const options = useMemo(() => shuffle(step.options, step.id), [step]);
  const [revealed, setRevealed] = useState(1);
  const [eliminated, setEliminated] = useState<string[]>([]);
  const [found, setFound] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const done = Boolean(found) || failed;

  const guess = (option: string) => {
    if (locked || done || eliminated.includes(option)) return;
    const wrongs = eliminated.length;
    if (option === step.answer) {
      setFound(option);
      onResolve({
        correct: wrongs === 0,
        correctCount: 1,
        incorrectCount: wrongs,
        detail: wrongs > 0 ? t("feedback.guessedAfter", { n: revealed }) : undefined,
      });
      return;
    }
    playCue("incorrect");
    const nextEliminated = [...eliminated, option];
    setEliminated(nextEliminated);
    if (revealed < step.clues.length) {
      setRevealed(revealed + 1);
      onMood?.("encouraging");
    } else {
      setFailed(true);
      onResolve({
        correct: false,
        correctCount: 0,
        incorrectCount: nextEliminated.length,
        detail: t("feedback.correctAnswer", { answer: step.answer }),
      });
    }
  };

  return (
    <>
      <div className="clue-stack" aria-live="polite">
        {step.clues.slice(0, revealed).map((clue, i) => (
          <PromptCard key={i} tone="clue">
            <span className="prompt-card__eyebrow">{t("game.clueNumber", { n: i + 1, total: step.clues.length })}</span>
            <p className="prompt-card__text">{clue.text}</p>
            {done && <span className="prompt-card__meta">{formatRef(pack, clue.ref)}</span>}
          </PromptCard>
        ))}
        {eliminated.length > 0 && !done && <p className="clue-notice">{t("game.notQuite")}</p>}
      </div>
      <div className="options options--grid">
        {options.map((option) => {
          const isOut = eliminated.includes(option);
          const state = option === found || (failed && option === step.answer) ? "is-correct" : isOut ? "is-wrong" : done ? "is-dim" : "";
          return (
            <button key={option} type="button" className={`option option--center ${state}`} disabled={isOut || done || locked} onClick={() => guess(option)}>
              <span className="option__label">{option}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
