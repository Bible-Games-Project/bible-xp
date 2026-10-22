import { Play } from "lucide-react";
import { href } from "../app/router";
import { AppHeader, Screen, TabBar } from "../components/Layout";
import { findBook, findTopic } from "../content";
import { useContent } from "../content/useContent";
import { useI18n } from "../i18n";
import { completedCount, currentUnit } from "../progress/path";
import { useProgress } from "../progress/store";

/** The Journey tab: one button that takes you to the road of the current story. */
export function JourneyScreen() {
  const { t } = useI18n();
  const pack = useContent();
  const progress = useProgress();
  const unit = currentUnit(progress, pack.units, pack.books.map((b) => b.id));

  return (
    <Screen withTabs scene="bible" className="journey">
      <AppHeader />
      <div className="glass">
        <h1 className="screen-title">{t("path.title")}</h1>
        <p className="muted">{t("path.subtitle")}</p>
      </div>
      {unit && (
        <div className="journey__go">
          {(() => {
            const topic = findTopic(pack, unit.topicId)!;
            const done = completedCount(progress, unit);
            const fresh = done === 0 && !Object.values(progress.sessions).some((s) => s.kind === "activity");
            return (
              <a className="big-btn big-btn--journey" href={href({ name: "story", unitId: unit.id })}>
                <span className="big-btn__icon" aria-hidden="true">
                  <Play size={26} strokeWidth={2.6} fill="currentColor" />
                </span>
                <span className="big-btn__text">
                  <span className="big-btn__title">{fresh ? t("home.startJourney") : t("home.continueJourney")}</span>
                  <span className="big-btn__meta">
                    {findBook(pack, unit.bookId)?.name} · {t("path.story", { n: unit.number })} · {topic.title}
                  </span>
                  <span className="big-btn__meta">{t("path.stops", { n: done, total: unit.nodes.length })}</span>
                </span>
              </a>
            );
          })()}
        </div>
      )}
      <TabBar current="path" />
    </Screen>
  );
}
