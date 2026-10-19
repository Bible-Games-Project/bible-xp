import { Lock } from "lucide-react";
import { Screen, TopBar } from "../components/Layout";
import { ProgressBar } from "../components/ProgressBar";
import { tierKey, useTierName } from "../components/Tier";
import { TIERS, type Tier } from "../content/types";
import { useI18n } from "../i18n";
import { progressActions, useProgress } from "../progress/store";
import { PROMOTION, promotionStatus } from "../progress/tiers";

export function DifficultyScreen() {
  const { t } = useI18n();
  const { difficulty } = useProgress();
  const tierName = useTierName();
  const status = promotionStatus(difficulty);
  const pct = (n: number | null) => (n === null ? "–" : `${Math.round(n * 100)}%`);

  return (
    <Screen>
      <TopBar title={t("difficulty.title")} back={{ name: "home" }} />
      <p className="muted">{t("difficulty.intro")}</p>

      <ol className="tier-list">
        {TIERS.map((tier) => {
          const unlocked = tier <= difficulty.unlocked;
          const selected = tier === difficulty.selected;
          return (
            <li key={tier}>
              <button
                type="button"
                className={`tier-plate tier-${tier}${unlocked ? "" : " is-locked"}${selected ? " is-selected" : ""}`}
                disabled={!unlocked}
                aria-pressed={selected}
                onClick={() => progressActions.selectTier(tier)}
              >
                <span className="tier-plate__num">{tier}</span>
                <span className="tier-plate__text">
                  <span className="tier-plate__name">{t(tierKey(tier, "name"))}</span>
                  <span className="tier-plate__desc">
                    {unlocked ? t(tierKey(tier, "description")) : t("difficulty.lockedHint", { prev: tierName((tier - 1) as Tier) })}
                  </span>
                </span>
                <span className="tier-plate__state">
                  {selected ? t("difficulty.current") : unlocked ? t("difficulty.unlocked") : <Lock size={16} aria-label={t("difficulty.locked")} />}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <section className={`card meters tier-${status.next ?? status.tier}`} aria-labelledby="climb-title">
        <h2 id="climb-title" className="card__title">
          {status.next ? t("difficulty.working", { next: tierName(status.next) }) : tierName(status.tier)}
        </h2>
        {status.next ? (
          <>
            <Meter
              label={t("difficulty.answered", { tier: tierName(status.tier) })}
              value={t("difficulty.of", { n: Math.min(status.answered, PROMOTION.minAnswered), total: PROMOTION.minAnswered })}
              met={status.answered >= PROMOTION.minAnswered}
              current={Math.min(status.answered, PROMOTION.minAnswered)}
              max={PROMOTION.minAnswered}
            />
            <Meter
              label={t("difficulty.accuracy")}
              value={`${pct(status.accuracy)} · ${t("difficulty.needPct", { n: PROMOTION.minAccuracy * 100 })}`}
              met={(status.accuracy ?? 0) >= PROMOTION.minAccuracy}
              current={Math.round((status.accuracy ?? 0) * 100)}
              max={100}
            />
            <Meter
              label={t("difficulty.games")}
              value={t("difficulty.of", { n: Math.min(status.modes, PROMOTION.minModes), total: PROMOTION.minModes })}
              met={status.modes >= PROMOTION.minModes}
              current={Math.min(status.modes, PROMOTION.minModes)}
              max={PROMOTION.minModes}
            />
            {status.ready && <p className="text-green small">{t("difficulty.ready", { next: tierName(status.next) })}</p>}
            {status.struggling && (
              <p className="muted small">{t("difficulty.struggling", { tier: tierName((status.tier - 1) as Tier) })}</p>
            )}
            <p className="faint small">
              {t("difficulty.rule", {
                window: PROMOTION.window,
                min: PROMOTION.minAnswered,
                pct: PROMOTION.minAccuracy * 100,
                modes: PROMOTION.minModes,
              })}
            </p>
          </>
        ) : (
          <p className="muted small">{t("difficulty.master")}</p>
        )}
      </section>
    </Screen>
  );
}

function Meter({ label, value, met, current, max }: { label: string; value: string; met: boolean; current: number; max: number }) {
  return (
    <div className={`meter${met ? " is-met" : ""}`}>
      <div className="meter__row">
        <span>{label}</span>
        <span className="meter__value">{value}</span>
      </div>
      <ProgressBar value={current} max={max} label={label} tone={met ? "green" : "tier"} size="sm" />
    </div>
  );
}
