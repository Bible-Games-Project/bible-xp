import { Check, ChevronRight } from "lucide-react";
import { href } from "../app/router";
import { MODE_STYLE } from "../components/icons";
import { AppHeader, Screen, TabBar } from "../components/Layout";
import { findTopic, freePlayActivity } from "../content";
import { GAME_MODES } from "../content/types";
import { useContent } from "../content/useContent";
import { useI18n } from "../i18n";
import { useProgress } from "../progress/store";

export function FreePlayScreen() {
  const { t } = useI18n();
  const pack = useContent();
  const progress = useProgress();
  const topic = findTopic(pack, pack.units[0].topicId)!;

  return (
    <Screen withTabs>
      <AppHeader />
      <h1 className="screen-title">{t("free.title")}</h1>
      <p className="screen-subtitle">{t("free.subtitle", { topic: topic.title })}</p>
      <div className="mode-list">
        {GAME_MODES.map((mode) => {
          const activity = freePlayActivity(pack, mode);
          if (!activity) return null;
          const style = MODE_STYLE[mode];
          const Icon = style.icon;
          const record = progress.activities[activity.id];
          const completed = Boolean(record?.firstCompletedAt);
          return (
            <a key={mode} className={`card card--link mode-card accent-${style.accent}`} href={href({ name: "play", activityId: activity.id, from: "free" })}>
              <span className="mode-card__icon" aria-hidden="true">
                <Icon size={30} strokeWidth={2.5} />
              </span>
              <span className="mode-card__body">
                <span className="mode-card__name">{t(`modes.${mode}.name`)}</span>
                <span className="mode-card__desc">{t(`modes.${mode}.description`)}</span>
                <span className="mode-card__status">
                  {completed ? (
                    <span className="pill pill--green">
                      <Check size={14} strokeWidth={3} aria-hidden="true" /> {t("free.best", { n: record!.bestCorrect, total: record!.total })}
                    </span>
                  ) : (
                    <span className="pill">{t("common.available")}</span>
                  )}
                  <span className="muted small">{activity.title}</span>
                </span>
              </span>
              <ChevronRight size={22} className="muted" aria-hidden="true" />
            </a>
          );
        })}
      </div>
      <TabBar current="free" />
    </Screen>
  );
}
