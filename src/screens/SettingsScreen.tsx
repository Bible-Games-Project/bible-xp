import { Check, ChevronRight, FileText, Info, Library, Shield, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { href } from "../app/router";
import { Button } from "../components/Button";
import { Screen, TopBar } from "../components/Layout";
import { Dialog, Toggle } from "../components/Overlay";
import { APP_VERSION } from "../config/features";
import { LANGUAGES, useI18n } from "../i18n";
import { canVibrate } from "../lib/feedback";
import { getStorageStatus, progressActions, useProgress } from "../progress/store";
import { prefersReducedMotion } from "../app/preferences";
import { tierKey } from "../components/Tier";
import { TIERS } from "../content/types";
import { REWARDS } from "../progress/rewards";

export function SettingsScreen() {
  const { t } = useI18n();
  const { settings, difficulty } = useProgress();
  const [resetOpen, setResetOpen] = useState(false);
  const vibrationSupported = canVibrate();
  const systemReduced = prefersReducedMotion();
  const update = progressActions.updateSettings;

  return (
    <Screen>
      <TopBar title={t("settings.title")} back={{ name: "profile" }} />

      {getStorageStatus() !== "ok" && (
        <div className="banner banner--coral" role="alert">
          <TriangleAlert size={22} aria-hidden="true" />
          {t("settings.storageError")}
        </div>
      )}

      <a className="row-link" href={href({ name: "library" })}>
        <span className="row-link__icon" aria-hidden="true">
          <Library size={20} strokeWidth={2.4} />
        </span>
        <span className="row-link__text">
          <span className="row-link__title">{t("library.title")}</span>
          <span className="row-link__meta">{t("library.subtitle")}</span>
        </span>
        <ChevronRight size={20} className="faint" aria-hidden="true" />
      </a>

      <h2 className="section-heading">{t("difficulty.title")}</h2>
      <p className="muted small">{t("difficulty.intro")}</p>
      <div className="tier-list" role="radiogroup" aria-label={t("difficulty.title")}>
        {TIERS.map((tier) => {
          const selected = tier === difficulty.selected;
          return (
            <button
              key={tier}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`tier-plate tier-${tier}${selected ? " is-selected" : ""}`}
              onClick={() => progressActions.selectTier(tier)}
            >
              <span className="tier-plate__num">{tier}</span>
              <span className="tier-plate__text">
                <span className="tier-plate__name">{t(tierKey(tier, "name"))}</span>
                <span className="tier-plate__desc">{t(tierKey(tier, "description"))}</span>
                <span className="tier-plate__xp">{t("difficulty.xp", { n: REWARDS.stepXp[tier] })}</span>
              </span>
              <span className="tier-plate__check" aria-hidden="true">
                {selected && <Check size={18} strokeWidth={3.2} />}
              </span>
            </button>
          );
        })}
      </div>

      <h2 className="section-heading">{t("settings.language")}</h2>
      <div className="card list" role="radiogroup" aria-label={t("settings.language")}>
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            role="radio"
            aria-checked={settings.language === lang.code}
            className="list__item"
            onClick={() => update({ language: lang.code })}
          >
            <span className="list__label">{lang.nativeName}</span>
            {settings.language === lang.code && <Check size={22} strokeWidth={3} className="text-green" aria-hidden="true" />}
          </button>
        ))}
      </div>
      <p className="muted small">{t("settings.languageNote")}</p>

      <h2 className="section-heading">{t("settings.preferences")}</h2>
      <div className="card list">
        <Toggle label={t("settings.sound")} checked={settings.sound} onChange={(v) => update({ sound: v })} />
        <Toggle
          label={t("settings.vibration")}
          description={vibrationSupported ? undefined : t("settings.vibrationUnsupported")}
          checked={vibrationSupported && settings.vibration}
          disabled={!vibrationSupported}
          onChange={(v) => update({ vibration: v })}
        />
      </div>

      <h2 className="section-heading">{t("settings.accessibility")}</h2>
      <div className="card list">
        <Toggle
          label={t("settings.reduceMotion")}
          description={settings.reduceMotion === null ? t("settings.reduceMotionSystem") : undefined}
          checked={settings.reduceMotion ?? systemReduced}
          onChange={(v) => update({ reduceMotion: v })}
        />
        <Toggle label={t("settings.largeText")} checked={settings.largeText} onChange={(v) => update({ largeText: v })} />
      </div>

      <h2 className="section-heading">{t("settings.info")}</h2>
      <nav className="card menu">
        <a className="menu__item" href={href({ name: "about" })}>
          <span className="menu__icon accent-green" aria-hidden="true">
            <Info size={20} strokeWidth={2.6} />
          </span>
          <span className="menu__label">{t("settings.about")}</span>
          <ChevronRight size={20} className="muted" aria-hidden="true" />
        </a>
        <a className="menu__item" href={href({ name: "privacy" })}>
          <span className="menu__icon accent-blue" aria-hidden="true">
            <Shield size={20} strokeWidth={2.6} />
          </span>
          <span className="menu__label">{t("settings.privacy")}</span>
          <ChevronRight size={20} className="muted" aria-hidden="true" />
        </a>
        <a className="menu__item" href={href({ name: "terms" })}>
          <span className="menu__icon accent-yellow" aria-hidden="true">
            <FileText size={20} strokeWidth={2.6} />
          </span>
          <span className="menu__label">{t("settings.terms")}</span>
          <ChevronRight size={20} className="muted" aria-hidden="true" />
        </a>
      </nav>

      <Button block variant="danger" onClick={() => setResetOpen(true)}>
        {t("settings.resetProgress")}
      </Button>
      <p className="muted small center">{t("settings.version", { v: APP_VERSION })}</p>

      <Dialog open={resetOpen} onClose={() => setResetOpen(false)} title={t("settings.resetTitle")}>
        <p className="dialog__body">{t("settings.resetBody")}</p>
        <div className="dialog__actions">
          <Button block variant="secondary" onClick={() => setResetOpen(false)}>
            {t("settings.cancel")}
          </Button>
          <Button
            block
            variant="danger"
            onClick={() => {
              progressActions.resetProgress();
              setResetOpen(false);
            }}
          >
            {t("settings.resetConfirm")}
          </Button>
        </div>
      </Dialog>
    </Screen>
  );
}
