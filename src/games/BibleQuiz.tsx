import { useMemo, useState } from "react";
import { Button } from "../components/Button";
import type { GameProps } from "../engine/types";
import { useI18n } from "../i18n";
import { playCue } from "../lib/feedback";
import { shuffle } from "../lib/random";
import { GameFooter, PromptCard } from "./shared";

const LETTERS = ["A", "B", "C", "D"];

export function BibleQuiz({ step, locked, onResolve }: GameProps<"quiz">) {
  const { t } = useI18n();
  // Shown in a shuffled order so the right answer's position carries no hint.
  const order = useMemo(() => shuffle([0, 1, 2, 3], step.id), [step.id]);
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);

  const check = () => {
    if (choice === null) return;
    const correct = choice === step.correctIndex;
    setChecked(true);
    onResolve({
      correct,
      correctCount: correct ? 1 : 0,
      incorrectCount: correct ? 0 : 1,
      detail: correct ? undefined : t("feedback.correctAnswer", { answer: step.options[step.correctIndex] }),
    });
  };

  return (
    <>
      <PromptCard>
        <p className="prompt-card__question">{step.question}</p>
      </PromptCard>
      <div className="options" role="radiogroup" aria-label={step.question}>
        {order.map((i, position) => {
          const option = step.options[i];
          const state = !checked ? (choice === i ? "is-selected" : "") : i === step.correctIndex ? "is-correct" : choice === i ? "is-wrong" : "is-dim";
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={choice === i}
              className={`option ${state}`}
              disabled={checked || locked}
              onClick={() => {
                playCue("tap");
                setChoice(i);
              }}
            >
              <span className="option__key" aria-hidden="true">{LETTERS[position]}</span>
              <span className="option__label">{option}</span>
            </button>
          );
        })}
      </div>
      <GameFooter>
        <Button block onClick={check} disabled={choice === null || checked || locked}>
          {t("common.check")}
        </Button>
      </GameFooter>
    </>
  );
}
