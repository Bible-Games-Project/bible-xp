import { useState } from "react";
import { navigate } from "../app/router";
import { Button } from "../components/Button";
import { Screen, TopBar } from "../components/Layout";
import { Mascot } from "../components/Mascot";
import { dailyChallengeFor, findStep } from "../content";
import type { Step } from "../content/types";
import { useContent } from "../content/useContent";
import { GameSession } from "../engine/GameSession";
import { useI18n } from "../i18n";
import { localDate } from "../lib/date";
import { sessionKey } from "../progress/model";
import { useProgress } from "../progress/store";

export function DailyScreen() {
  const { t } = useI18n();
  const pack = useContent();
  const progress = useProgress();
  // The date is fixed when the screen opens, so a session never jumps days mid-play.
  const [today] = useState(localDate);
  const key = sessionKey.daily(today);
  // A started challenge keeps its tier and questions; a new one uses the current tier.
  const [tier] = useState(() => progress.sessions[key]?.tier ?? progress.difficulty.selected);
  const challenge = dailyChallengeFor(pack, today, tier);
  const saved = progress.sessions[key]?.stepIds.map((id) => findStep(pack, id));
  const steps = saved && saved.every((s) => s !== undefined) ? (saved as Step[]) : challenge.steps;
  // Decided once: finishing the challenge must not swap the results screen away.
  const [playing, setPlaying] = useState(() => !progress.daily[today]?.rewarded || Boolean(progress.sessions[key]));

  if (!playing) {
    return (
      <Screen>
        <TopBar title={t("daily.title")} back={{ name: "home" }} />
        <div className="empty-state">
          <Mascot mood="celebrating" size={160} />
          <h1 className="empty-state__title">{t("daily.alreadyDone")}</h1>
          <p className="muted">{t("daily.alreadyDoneBody")}</p>
          <Button block onClick={() => navigate({ name: "home" }, { replace: true })}>
            {t("common.backHome")}
          </Button>
          <Button block variant="secondary" onClick={() => setPlaying(true)}>
            {t("daily.replay")}
          </Button>
        </div>
      </Screen>
    );
  }

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
