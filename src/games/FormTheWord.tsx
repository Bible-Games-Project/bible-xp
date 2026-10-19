import { Delete } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../components/Button";
import type { GameProps } from "../engine/types";
import { useI18n } from "../i18n";
import { playCue } from "../lib/feedback";
import { decoyCount, scrambleLetters } from "./formWordLogic";
import { GameFooter, PromptCard } from "./shared";

export function FormTheWord({ step, locked, onResolve }: GameProps<"form-word">) {
  const { t } = useI18n();
  const decoys = decoyCount(step.tier);
  const tiles = useMemo(() => scrambleLetters(step.word, step.id, decoys), [step.word, step.id, decoys]);
  const [picked, setPicked] = useState<string[]>([]);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);

  const letterOf = (id: string) => tiles.find((tile) => tile.id === id)!.letter;
  const answer = picked.map(letterOf).join("");
  const full = picked.length === step.word.length;

  const pick = (id: string) => {
    if (locked || result || picked.includes(id) || full) return;
    playCue("tap");
    setPicked([...picked, id]);
  };
  const unpick = (id: string) => {
    if (locked || result) return;
    playCue("tap");
    setPicked(picked.filter((p) => p !== id));
  };

  const check = () => {
    const correct = answer === step.word;
    setResult(correct ? "correct" : "incorrect");
    onResolve({
      correct,
      correctCount: correct ? 1 : 0,
      incorrectCount: correct ? 0 : 1,
      detail: correct ? undefined : t("feedback.correctAnswer", { answer: step.word }),
    });
  };

  return (
    <>
      <PromptCard tone="clue">
        <span className="prompt-card__eyebrow">{t("game.clue")}</span>
        <p className="prompt-card__text">{step.clue}</p>
      </PromptCard>

      <div
        className={`word-slots${result ? ` is-${result}` : ""}`}
        aria-label={t("game.answerArea")}
        style={{ ["--slots" as string]: step.word.length }}
      >
        {Array.from({ length: step.word.length }, (_, i) => {
          const id = picked[i];
          return id ? (
            <button
              key={id}
              type="button"
              className="letter-tile letter-tile--placed"
              onClick={() => unpick(id)}
              aria-label={t("game.removeLetter", { letter: letterOf(id) })}
              disabled={locked || !!result}
            >
              {letterOf(id)}
            </button>
          ) : (
            <span key={`slot-${i}`} className="word-slot" aria-hidden="true" />
          );
        })}
      </div>

      <div className="letter-pool">
        {tiles.map((tile) => {
          const used = picked.includes(tile.id);
          return (
            <button
              key={tile.id}
              type="button"
              className={`letter-tile${used ? " is-used" : ""}`}
              onClick={() => pick(tile.id)}
              disabled={used || locked || !!result}
              aria-label={t("game.addLetter", { letter: tile.letter })}
              aria-hidden={used || undefined}
            >
              {used ? "" : tile.letter}
            </button>
          );
        })}
      </div>

      {decoys > 0 && <p className="decoy-note">{t("game.decoys")}</p>}

      <GameFooter>
        <Button variant="secondary" size="lg" onClick={() => setPicked([])} disabled={!picked.length || locked || !!result} aria-label={t("game.clear")} icon={<Delete size={22} />} />
        <Button block onClick={check} disabled={!full || locked || !!result}>
          {t("common.check")}
        </Button>
      </GameFooter>
    </>
  );
}
