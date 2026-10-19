import { ChevronRight, Lock, Swords } from "lucide-react";
import { href } from "../app/router";
import { MODE_STYLE } from "../components/icons";
import { AppHeader, Screen, TabBar } from "../components/Layout";
import { TierPips, useTierName } from "../components/Tier";
import { freePlayActivity } from "../content";
import { GAME_MODES, TIERS } from "../content/types";
import { useContent } from "../content/useContent";
import { useI18n } from "../i18n";
import { clearKey } from "../progress/model";
import { progressActions, useProgress } from "../progress/store";

export function FreePlayScreen() {
  const { t } = useI18n();
  const pack = useContent();
  const progress = useProgress();
  const tierName = useTierName();
  const { selected, unlocked } = progress.difficulty;

  return (
    <Screen withTabs>
      <AppHeader />
      <h1 className="screen-title">{t("free.title")}</h1>
      <p className="screen-subtitle">{t("free.subtitle")}</p>

      <div className="tier-tabs" role="radiogroup" aria-label={t("free.tier")}>
        {TIERS.map((tier) => (
          <button
            key={tier}
            type="button"
            role="radio"
            aria-checked={tier === selected}
            disabled={tier > unlocked}
            className={`tier-tab tier-${tier}${tier === selected ? " is-selected" : ""}`}
            onClick={() => progressActions.selectTier(tier)}
          >
            {tier > unlocked && <Lock size={14} aria-hidden="true" />}
            {tierName(tier)}
          </button>
        ))}
      </div>

      <nav className="mode-list" aria-label={t("free.title")}>
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
              <TierPips cleared={(tr) => cleared.includes(tr)} label={cleared.map(tierName).join(", ") || t("free.tier")} />
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
          <span className="row-link__title">{t("free.duels")}</span>
          <span className="row-link__meta">{t("free.duelsBody")}</span>
        </span>
        <span className="pill">{t("common.comingSoon")}</span>
      </a>
      <TabBar current="free" />
    </Screen>
  );
}
