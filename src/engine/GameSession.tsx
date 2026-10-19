import { X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { navigate, type Route } from "../app/router";
import { Button } from "../components/Button";
import { MODE_STYLE } from "../components/icons";
import { Mascot, type MascotMood } from "../components/Mascot";
import { Dialog } from "../components/Overlay";
import { ProgressBar } from "../components/ProgressBar";
import { formatRefs, getContent } from "../content";
import type { GameMode, Step } from "../content/types";
import { BibleQuiz } from "../games/BibleQuiz";
import { CompleteVerse } from "../games/CompleteVerse";
import { FormTheWord } from "../games/FormTheWord";
import { MatchPairs } from "../games/MatchPairs";
import { StoryOrder } from "../games/StoryOrder";
import { WhoAmI } from "../games/WhoAmI";
import { useI18n } from "../i18n";
import { playCue } from "../lib/feedback";
import type { SessionKind, SessionSummary } from "../progress/model";
import { progressActions, useProgress } from "../progress/store";
import { Results } from "./Results";
import type { GameProps, StepResolution } from "./types";

const GAMES: { [M in GameMode]: ComponentType<GameProps<M>> } = {
  "form-word": FormTheWord,
  "match-pairs": MatchPairs,
  quiz: BibleQuiz,
  "complete-verse": CompleteVerse,
  "story-order": StoryOrder,
  "who-am-i": WhoAmI,
};

export interface GameSessionProps {
  sessionKey: string;
  kind: SessionKind;
  refId: string;
  steps: Step[];
  /** Shown on the results screen, e.g. "The Creation · Bible Quiz". */
  subtitle: string;
  exitRoute: Route;
  nextRoute?: Route | null;
  nextLabel?: string;
}

/**
 * Runs any sequence of steps, of one mode or mixed: progress bar, mascot,
 * feedback, persistence after every step, and the final results.
 */
export function GameSession({ sessionKey, kind, refId, steps, subtitle, exitRoute, nextRoute, nextLabel }: GameSessionProps) {
  const { t, language, messages } = useI18n();
  const pack = getContent(language.code);
  const progress = useProgress();
  const stepIds = useMemo(() => steps.map((s) => s.id), [steps]);
  const [run, setRun] = useState(0);
  const [pending, setPending] = useState<{ index: number; resolution: StepResolution } | null>(null);
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [mood, setMood] = useState<MascotMood>("thinking");
  const [quitOpen, setQuitOpen] = useState(false);
  const finishing = useRef(false);

  useEffect(() => {
    if (!summary) progressActions.startSession(sessionKey, kind, refId, stepIds);
  }, [sessionKey, kind, refId, stepIds, run, summary]);

  const session = progress.sessions[sessionKey];
  const recordedIndex = session?.stepIds.join() === stepIds.join() ? session.index : 0;
  const index = pending ? pending.index : recordedIndex;
  const step = steps[Math.min(index, steps.length - 1)];

  // Every step is recorded and its feedback dismissed: finish exactly once.
  useEffect(() => {
    if (summary || pending || !session || recordedIndex < steps.length || finishing.current) return;
    finishing.current = true;
    const result = progressActions.completeSession(sessionKey);
    if (result) {
      playCue("complete");
      setSummary(result);
    }
    finishing.current = false;
  }, [summary, pending, session, recordedIndex, steps.length, sessionKey]);

  const onResolve = useCallback(
    (resolution: StepResolution) => {
      if (pending) return;
      const current = steps[recordedIndex];
      if (!current) return;
      playCue(resolution.correct ? "correct" : "incorrect");
      setMood(resolution.correct ? "happy" : "encouraging");
      setPending({ index: recordedIndex, resolution });
      progressActions.recordStep(
        sessionKey,
        { stepId: current.id, correct: resolution.correct, correctCount: resolution.correctCount, incorrectCount: resolution.incorrectCount },
        { mode: current.mode, topicId: current.topicId },
      );
    },
    [pending, steps, recordedIndex, sessionKey],
  );

  const onContinue = () => {
    setPending(null);
    setMood("thinking");
  };

  const playAgain = () => {
    setSummary(null);
    setPending(null);
    setMood("thinking");
    setRun((r) => r + 1);
  };

  if (summary) {
    return (
      <Results
        summary={summary}
        steps={steps}
        subtitle={subtitle}
        onDone={() => navigate(exitRoute, { replace: true })}
        onAgain={playAgain}
        nextRoute={nextRoute}
        nextLabel={nextLabel}
      />
    );
  }

  if (!step) return null;
  const Game = GAMES[step.mode] as ComponentType<GameProps<GameMode>>;
  const resolution = pending?.resolution;
  const correctTitles = messages.feedback.correctTitles;
  const modeStyle = MODE_STYLE[step.mode];

  return (
    <div className={`game game--${modeStyle.accent}`}>
      <header className="game__header">
        <button type="button" className="icon-btn" aria-label={t("common.quit")} onClick={() => setQuitOpen(true)}>
          <X size={28} strokeWidth={2.6} />
        </button>
        <ProgressBar value={index + (pending ? 1 : 0)} max={steps.length} label={t("game.progressLabel", { n: index + 1, total: steps.length })} />
        <span className="game__count">{t("common.stepOf", { n: Math.min(index + 1, steps.length), total: steps.length })}</span>
      </header>

      <div className="game__guide">
        <Mascot mood={mood} size={68} />
        <div className="speech">
          <span className="speech__mode">
            <modeStyle.icon size={16} strokeWidth={2.6} aria-hidden="true" />
            {t(`modes.${step.mode}.name`)}
          </span>
          <span className="speech__text">{t(`game.instructions.${step.mode}`)}</span>
        </div>
      </div>

      <div className="game__body" key={`${run}:${step.id}`}>
        <Game step={step} locked={Boolean(pending)} onResolve={onResolve} onMood={setMood} />
      </div>

      {resolution && (
        <section className={`feedback ${resolution.correct ? "feedback--correct" : "feedback--incorrect"}`} role="status" aria-live="assertive">
          <div className="feedback__head">
            <Mascot mood={resolution.correct ? "happy" : "encouraging"} size={56} />
            <div>
              <h2 className="feedback__title">
                {resolution.correct ? correctTitles[(index + run) % correctTitles.length] : t("feedback.incorrectTitle")}
              </h2>
              {!resolution.correct && <p className="feedback__encourage">{t("feedback.incorrectEncourage")}</p>}
            </div>
          </div>
          <div className="feedback__scroll">
            {resolution.detail && <div className="feedback__detail">{resolution.detail}</div>}
            <p className="feedback__explanation">{step.explanation}</p>
            <p className="feedback__ref">{formatRefs(pack, step.references)}</p>
          </div>
          <Button block variant={resolution.correct ? "primary" : "coral"} onClick={onContinue} autoFocus>
            {t("common.continue")}
          </Button>
        </section>
      )}

      <Dialog open={quitOpen} onClose={() => setQuitOpen(false)} title={t("game.quitTitle")}>
        <p className="dialog__body">{t("game.quitBody")}</p>
        <div className="dialog__actions">
          <Button block onClick={() => setQuitOpen(false)}>
            {t("common.keepPlaying")}
          </Button>
          <Button block variant="ghost" onClick={() => navigate(exitRoute, { replace: true })}>
            {t("common.quit")}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
