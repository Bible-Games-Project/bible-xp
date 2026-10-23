import { ChevronRight, Swords } from "lucide-react";
import { href } from "../app/router";
import { MODE_STYLE } from "../components/icons";
import { AppHeader, Screen, TabBar } from "../components/Layout";
import { TierBadge, TierPips, useTierName } from "../components/Tier";
import { freePlayActivity } from "../content";
import { GAME_MODES, TIERS } from "../content/types";
import { useContent } from "../content/useContent";
import { useI18n } from "../i18n";
import { clearKey } from "../progress/model";
import { useProgress } from "../progress/store";

/** Train: any game, any time, at the difficulty chosen in Settings. */
export function TrainScreen() {
  const { t } = useI18n();
  const pack = useContent();
  const progress = useProgress();
  const tierName = useTierName();

  return (
    <Screen withTabs scene="train" className="train">
      <AppHeader />
      <div className="glass">
        <h1 className="screen-title">{t("train.title")}</h1>
        <p className="muted">{t("train.subtitle")}</p>
      </div>

      <a className="row-link train__difficulty" href={href({ name: "settings" })}>
        <span className="row-link__text">
          <span className="row-link__meta">{t("difficulty.title")}</span>
          <span>
            <TierBadge tier={progress.difficulty.selected} />
          </span>
        </span>
        <span className="row-link__action">{t("train.change")}</span>
        <ChevronRight size={20} className="faint" aria-hidden="true" />
      </a>

      <nav className="mode-list" aria-label={t("train.title")}>
        {GAME_MODES.map((mode) => {
          const activity = freePlayActivity(pack, mode);
          if (!activity) return null;
          const Icon = MODE_STYLE[mode].icon;
          const cleared = TIERS.filter((tr) => progress.tierClears[clearKey(activity.id, tr)]);
          return (
            <a key={mode} className="mode-card" href={href({ name: "play", activityId: activity.id, from: "free" })}>
              <span className="mode-card__icon" aria-hidden="true">
                <Icon size={24} strokeWidth={2.4} />
              </span>
              <span className="mode-card__body">
                <span className="mode-card__name">{t(`modes.${mode}.name`)}</span>
                <span className="mode-card__desc">{t(`modes.${mode}.description`)}</span>
              </span>
              <TierPips cleared={(tr) => cleared.includes(tr)} label={cleared.map(tierName).join(", ") || t("difficulty.title")} />
              <ChevronRight size={20} className="faint" aria-hidden="true" />
            </a>
          );
        })}
      </nav>

      <a className="row-link" href={href({ name: "multiplayer" })}>
        <span className="row-link__icon" aria-hidden="true">
          <Swords size={20} strokeWidth={2.4} />
        </span>
        <span className="row-link__text">
          <span className="row-link__title">{t("train.duels")}</span>
          <span className="row-link__meta">{t("train.duelsBody")}</span>
        </span>
        <span className="pill">{t("common.comingSoon")}</span>
      </a>
      <TabBar current="train" />
    </Screen>
  );
}
