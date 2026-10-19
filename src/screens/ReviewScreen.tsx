import { useEffect, useState } from "react";
import { navigate } from "../app/router";
import { Button } from "../components/Button";
import { MODE_STYLE } from "../components/icons";
import { Screen, TopBar } from "../components/Layout";
import { Mascot } from "../components/Mascot";
import { findStep, formatRefs } from "../content";
import { describeStep } from "../content/describe";
import { useContent } from "../content/useContent";
import { GameSession } from "../engine/GameSession";
import { useI18n } from "../i18n";
import { openMistakes, sessionKey } from "../progress/model";
import { getProgress, useProgress } from "../progress/store";

const REVIEW_SIZE = 8;

export function ReviewScreen() {
  const { t } = useI18n();
  const pack = useContent();
  const progress = useProgress();
  const items = openMistakes(progress)
    .map((m) => ({ mistake: m, step: findStep(pack, m.stepId) }))
    .filter((x) => x.step);

  return (
    <Screen>
      <TopBar title={t("review.title")} back={{ name: "profile" }} />
      {items.length === 0 ? (
        <div className="empty-state">
          <Mascot mood="happy" size={150} />
          <h1 className="empty-state__title">{t("review.empty")}</h1>
          <p className="muted">{t("review.emptyBody")}</p>
        </div>
      ) : (
        <>
          <p className="screen-subtitle">{t("review.subtitle")}</p>
          <ul className="review-list">
            {items.map(({ mistake, step }) => {
              const style = MODE_STYLE[step!.mode];
              const Icon = style.icon;
              const { prompt, answer } = describeStep(step!);
              return (
                <li key={mistake.stepId} className="card review-item">
                  <div className="review-item__head">
                    <span className={`menu__icon accent-${style.accent}`} aria-hidden="true">
                      <Icon size={18} strokeWidth={2.6} />
                    </span>
                    <span className="review-item__mode">{t(`modes.${step!.mode}.name`)}</span>
                    <span className="pill pill--coral">{t("review.missed", { n: mistake.wrongCount })}</span>
                  </div>
                  <p className="review-item__prompt">{prompt}</p>
                  <p className="review-item__answer">{t("feedback.correctAnswer", { answer })}</p>
                  <p className="muted small">{formatRefs(pack, step!.references)}</p>
                </li>
              );
            })}
          </ul>
          <div className="sticky-cta">
            <Button block onClick={() => navigate({ name: "review-play" })}>
              {t("review.start", { n: Math.min(items.length, REVIEW_SIZE) })}
            </Button>
          </div>
        </>
      )}
    </Screen>
  );
}

export function ReviewPlayScreen() {
  const { t } = useI18n();
  const pack = useContent();
  // The set of steps is fixed when the review starts: answering clears mistakes.
  const [steps] = useState(() => {
    const saved = getProgress().sessions[sessionKey.review()];
    const ids = saved ? saved.stepIds : openMistakes(getProgress()).slice(0, REVIEW_SIZE).map((m) => m.stepId);
    return ids.map((id) => findStep(pack, id)).filter((s) => s !== undefined);
  });

  useEffect(() => {
    if (steps.length === 0) navigate({ name: "review" }, { replace: true });
  }, [steps.length]);

  if (steps.length === 0) return null;
  return (
    <GameSession
      sessionKey={sessionKey.review()}
      kind="review"
      refId="mistakes"
      steps={steps}
      subtitle={t("results.reviewSubtitle")}
      exitRoute={{ name: "profile" }}
    />
  );
}
