import { Check, Flame } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/Button";
import { AppHeader, Screen, TabBar } from "../components/Layout";
import { Mascot } from "../components/Mascot";
import { TierBadge } from "../components/Tier";
import { dailyChallengeFor, findStep } from "../content";
import type { Step } from "../content/types";
import { useContent } from "../content/useContent";
import { GameSession } from "../engine/GameSession";
import { useI18n } from "../i18n";
import { localDate } from "../lib/date";
import { sessionKey } from "../progress/model";
import { REWARDS } from "../progress/rewards";
import { useProgress } from "../progress/store";

/** The Daily tab: today's challenge card, then the game itself. */
export function DailyScreen() {
  const { t } = useI18n();
  const pack = useContent();
  const progress = useProgress();
  // The date is fixed when the screen opens, so a session never jumps days mid-play.
  const [today] = useState(localDate);
  const key = sessionKey.daily(today);
  const [playing, setPlaying] = useState(false);
  // A started challenge keeps its tier and questions; a new one uses the current tier.
  const session = progress.sessions[key];
  const [startTier, setStartTier] = useState(() => session?.tier ?? progress.difficulty.selected);
  const tier = playing ? startTier : (session?.tier ?? progress.difficulty.selected);
  const challenge = dailyChallengeFor(pack, today, tier);
  const saved = session?.stepIds.map((id) => findStep(pack, id));
  const steps = saved && saved.every((s) => s !== undefined) ? (saved as Step[]) : challenge.steps;
  const done = Boolean(progress.daily[today]?.rewarded);

  if (playing) {
    return (
      <GameSession
        sessionKey={key}
        kind="daily"
        refId={challenge.id}
        steps={steps}
        tier={tier}
        subtitle={t("results.dailySubtitle", { topic: challenge.theme })}
        exitRoute={{ name: "home" }}
      />
    );
  }

  const start = () => {
    setStartTier(tier);
    setPlaying(true);
  };

  return (
    <Screen withTabs scene="daily" className="daily">
      <AppHeader />
      <div className="glass">
        <h1 className="screen-title">{t("daily.title")}</h1>
        <p className="muted">{t("daily.subtitle")}</p>
      </div>

      <section className={`daily-hero${done ? " is-done" : ""}`} aria-labelledby="daily-hero-title">
        <div className="daily-hero__head">
          <Mascot mood={done ? "celebrating" : "happy"} size={84} />
          <div className="daily-hero__heading">
            <span className="daily-hero__eyebrow">{t("daily.today")}</span>
            <h2 id="daily-hero-title" className="daily-hero__title">
              {done ? t("daily.alreadyDone") : challenge.theme}
            </h2>
          </div>
        </div>
        {done ? (
          <p className="muted">{t("daily.alreadyDoneBody")}</p>
        ) : (
          <div className="daily-hero__meta">
            <TierBadge tier={tier} />
            <span>{t("home.questions", { n: steps.length })}</span>
            <span className="daily-card__reward">{t("daily.reward", { n: REWARDS.daily[tier] })}</span>
          </div>
        )}
        {done ? (
          <Button block variant="secondary" onClick={start} icon={<Check size={20} />}>
            {t("daily.replay")}
          </Button>
        ) : (
          <Button block onClick={start}>
            {session && session.index > 0 ? t("daily.continue") : t("daily.start")}
          </Button>
        )}
      </section>

      <p className="daily-streak">
        <Flame size={18} strokeWidth={2.6} aria-hidden="true" />
        {t("daily.streak")}
      </p>
      <TabBar current="daily" />
    </Screen>
  );
}
