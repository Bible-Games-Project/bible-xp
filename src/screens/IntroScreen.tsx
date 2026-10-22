import { Gem } from "lucide-react";
import { useState } from "react";
import { navigate, type Route } from "../app/router";
import { Button } from "../components/Button";
import { CONTENT_ICONS } from "../components/icons";
import { Screen, TopBar } from "../components/Layout";
import { Mascot } from "../components/Mascot";
import { findIntro, formatRef, translationLabel, unitOfIntro } from "../content";
import { useContent } from "../content/useContent";
import { useI18n } from "../i18n";
import { playCue } from "../lib/feedback";
import { progressActions, useProgress } from "../progress/store";
import { NotFoundScreen } from "./InfoScreens";

export function IntroScreen({ introId }: { introId: string }) {
  const { t } = useI18n();
  const pack = useContent();
  const progress = useProgress();
  const intro = findIntro(pack, introId);
  const [earned, setEarned] = useState<number | null>(null);
  if (!intro) return <NotFoundScreen />;
  const unit = unitOfIntro(pack, introId);
  const storyRoute: Route = unit ? { name: "story", unitId: unit.id } : { name: "path" };
  const alreadyRead = Boolean(progress.intros[introId]) && earned === null;

  const finish = () => {
    const xp = progressActions.completeIntro(introId);
    if (xp > 0) {
      playCue("complete");
      setEarned(xp);
      window.setTimeout(() => navigate(storyRoute, { replace: true }), 1400);
    } else {
      navigate(storyRoute, { replace: true });
    }
  };

  return (
    <Screen className="intro">
      <TopBar title={t("path.introName")} back={storyRoute} />
      <div className="intro__hero">
        <Mascot mood={earned ? "celebrating" : "happy"} size={120} />
        <h1 className="screen-title">{intro.title}</h1>
      </div>
      <div className="intro__sections">
        {intro.sections.map((section) => {
          const Icon = CONTENT_ICONS[section.icon];
          return (
            <article key={section.title} className="card intro-card">
              <span className="intro-card__icon" aria-hidden="true">
                <Icon size={22} strokeWidth={2.5} />
              </span>
              <h2 className="card__title">{section.title}</h2>
              <p>{section.body}</p>
              {section.quote && (
                <figure className="intro-quote">
                  <blockquote>“{section.quote.text}”</blockquote>
                  <figcaption>
                    {formatRef(pack, section.quote.ref)} ({translationLabel(pack, section.quote.translation)})
                  </figcaption>
                </figure>
              )}
            </article>
          );
        })}
      </div>
      <div className="intro__footer">
        {earned ? (
          <div className="banner banner--yellow" role="status">
            <Gem size={22} aria-hidden="true" /> {t("intro.earned", { n: earned })}
          </div>
        ) : (
          <>
            {alreadyRead && <p className="muted small center">{t("intro.readAgain")}</p>}
            <Button block onClick={finish}>
              {alreadyRead ? t("common.continue") : t("intro.finish")}
            </Button>
          </>
        )}
      </div>
    </Screen>
  );
}
