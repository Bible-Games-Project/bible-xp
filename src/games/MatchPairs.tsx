import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CONTENT_ICONS } from "../components/icons";
import type { GameProps } from "../engine/types";
import { useI18n } from "../i18n";
import { playCue } from "../lib/feedback";
import { shuffle } from "../lib/random";
import { PromptCard } from "./shared";

type Side = "left" | "right";

/**
 * Two columns: pick a card on one side, then its match on the other. The hint
 * line says what to do next, the waiting column is highlighted, and matched
 * pairs share a numbered badge.
 */
export function MatchPairs({ step, locked, onResolve }: GameProps<"match-pairs">) {
  const { t } = useI18n();
  const left = useMemo(() => shuffle(step.pairs, `${step.id}:left`), [step]);
  const right = useMemo(() => shuffle(step.pairs, `${step.id}:right`), [step]);
  const [selected, setSelected] = useState<Record<Side, string | null>>({ left: null, right: null });
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState<Record<Side, string> | null>(null);
  const mistakes = useRef(0);
  const resolved = useRef(false);
  const allDone = matched.length === step.pairs.length;

  useEffect(() => {
    if (!wrong) return;
    const timer = window.setTimeout(() => setWrong(null), 650);
    return () => window.clearTimeout(timer);
  }, [wrong]);

  useEffect(() => {
    if (!allDone || resolved.current) return;
    resolved.current = true;
    const timer = window.setTimeout(() => {
      const n = mistakes.current;
      onResolve({
        correct: n === 0,
        correctCount: step.pairs.length,
        incorrectCount: n,
        detail: n > 0 ? t("feedback.matchedWithMistakes", { n }) : undefined,
      });
    }, 450);
    return () => window.clearTimeout(timer);
  }, [allDone, step.pairs.length, onResolve, t]);

  const choose = (side: Side, id: string) => {
    if (locked || matched.includes(id) || wrong) return;
    const next = { ...selected, [side]: selected[side] === id ? null : id };
    if (next.left && next.right) {
      if (next.left === next.right) {
        playCue("correct");
        setMatched((m) => [...m, next.left!]);
      } else {
        playCue("incorrect");
        mistakes.current += 1;
        setWrong({ left: next.left, right: next.right });
      }
      setSelected({ left: null, right: null });
    } else {
      playCue("tap");
      setSelected(next);
    }
  };

  const waiting: Side | null = selected.left ? "right" : selected.right ? "left" : null;
  const hint = allDone
    ? t("game.matchHintDone")
    : waiting === "right"
      ? t("game.matchHintRight")
      : waiting === "left"
        ? t("game.matchHintLeft")
        : t("game.matchHintStart");

  const renderCard = (side: Side, pair: (typeof step.pairs)[number]) => {
    const pairNumber = matched.indexOf(pair.id) + 1;
    const isMatched = pairNumber > 0;
    const isSelected = selected[side] === pair.id;
    const isWrong = wrong?.[side] === pair.id;
    const Icon = side === "left" && pair.icon ? CONTENT_ICONS[pair.icon] : null;
    const label = side === "left" ? pair.left : pair.right;
    return (
      <button
        key={pair.id}
        type="button"
        className={`match-card match-card--${side}${isSelected ? " is-selected" : ""}${isMatched ? " is-matched" : ""}${isWrong ? " is-wrong" : ""}`}
        onClick={() => choose(side, pair.id)}
        disabled={isMatched || locked}
        aria-pressed={isSelected}
        aria-label={isMatched ? `${label}. ${t("game.matchPair", { n: pairNumber })}` : label}
      >
        {isMatched && <span className="match-card__badge">{pairNumber}</span>}
        {Icon && <Icon className="match-card__icon" size={20} strokeWidth={2.4} aria-hidden="true" />}
        <span className="match-card__label">{label}</span>
        {isMatched && <Check className="match-card__check" size={16} strokeWidth={3} aria-hidden="true" />}
      </button>
    );
  };

  return (
    <>
      <PromptCard>
        <p className="prompt-card__text">{step.prompt}</p>
        <span className="prompt-card__meta">{t("game.pairsLeft", { n: step.pairs.length - matched.length })}</span>
      </PromptCard>

      <p className={`match-hint${waiting ? " is-waiting" : ""}${allDone ? " is-done" : ""}`} aria-live="polite">
        {waiting === "left" && <ArrowLeft size={18} strokeWidth={2.8} aria-hidden="true" />}
        {hint}
        {waiting === "right" && <ArrowRight size={18} strokeWidth={2.8} aria-hidden="true" />}
      </p>

      <div className="match-grid">
        <div className={`match-col${waiting === "left" ? " is-waiting" : ""}`}>
          <span className="match-col__title">{t("game.matchColLeft")}</span>
          {left.map((p) => renderCard("left", p))}
        </div>
        <div className={`match-col${waiting === "right" ? " is-waiting" : ""}`}>
          <span className="match-col__title">{t("game.matchColRight")}</span>
          {right.map((p) => renderCard("right", p))}
        </div>
      </div>
    </>
  );
}
