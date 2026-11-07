import { useMemo, useState } from "react";
import { Button } from "../components/Button";
import { formatRef, getContent, translationLabel } from "../content";
import type { GameProps } from "../engine/types";
import { useI18n } from "../i18n";
import { playCue } from "../lib/feedback";
import { shuffle } from "../lib/random";
import { GameFooter, PromptCard } from "./shared";

export function CompleteVerse({ step, locked, onResolve }: GameProps<"complete-verse">) {
  const { t, language } = useI18n();
  const pack = getContent(language.code);
  const options = useMemo(() => shuffle(step.options, step.id), [step]);
  const [choice, setChoice] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const correct = choice === step.answer;
  const reference = `${formatRef(pack, step.ref)} (${translationLabel(pack, step.translation)})`;

  const check = () => {
    if (!choice) return;
    setChecked(true);
    onResolve({
      correct,
      correctCount: correct ? 1 : 0,
      incorrectCount: correct ? 0 : 1,
      detail: (
        <blockquote className="verse-quote">
          {step.before}
          <mark>{step.answer}</mark>
          {step.after}
        </blockquote>
      ),
    });
  };

  const blank = checked ? step.answer : choice;
  return (
    <>
      <PromptCard tone="verse">
        <p className="verse-text">
          {step.before}
          <span className={`verse-blank${blank ? " is-filled" : ""}${checked ? (correct ? " is-correct" : " is-wrong") : ""}`}>
            {blank ?? " ".repeat(8)}
          </span>
          {step.after}
        </p>
        <span className="prompt-card__meta">{reference}</span>
      </PromptCard>
      <div className="chips" role="radiogroup" aria-label={t("game.instructions.complete-verse")}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={choice === option}
            className={`word-chip${choice === option ? " is-selected" : ""}${checked && option === step.answer ? " is-correct" : ""}${checked && choice === option && !correct ? " is-wrong" : ""}`}
            disabled={checked || locked}
            onClick={() => {
              playCue("tap");
              setChoice(option);
            }}
          >
            {option}
          </button>
        ))}
      </div>
      <GameFooter>
        <Button block onClick={check} disabled={!choice || checked || locked}>
          {t("common.check")}
        </Button>
      </GameFooter>
    </>
  );
}
