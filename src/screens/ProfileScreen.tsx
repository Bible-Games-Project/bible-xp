import { ChevronRight, Crown, Pencil, RotateCcw, Settings } from "lucide-react";
import { useTierName } from "../components/Tier";
import { useState, type ReactNode } from "react";
import { href } from "../app/router";
import { Button } from "../components/Button";
import { Screen, TopBar } from "../components/Layout";
import { PlayerAvatar } from "../components/PlayerAvatar";
import { ProgressBar } from "../components/ProgressBar";
import { useI18n } from "../i18n";
import { localDate } from "../lib/date";
import { levelProgress } from "../progress/levels";
import { accuracy, openMistakes } from "../progress/model";
import { progressActions, useProgress } from "../progress/store";
import { displayedStreak } from "../progress/streak";
import { weeklyXpAt } from "../progress/week";

export function ProfileScreen() {
  const { t, number } = useI18n();
  const progress = useProgress();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(progress.profile.name);

  const level = levelProgress(progress.xp);
  const acc = accuracy(progress);
  const lessons = Object.values(progress.activities).filter((a) => a.firstCompletedAt).length + Object.keys(progress.intros).length;
  const mistakes = openMistakes(progress).length;
  const name = progress.profile.name.trim();
  const tierName = useTierName();
  const levelText = t("profile.levelProgress", { current: level.current, needed: level.needed, next: level.level + 1 });

  const saveName = () => {
    progressActions.updateProfile({ name: draft.trim().slice(0, 24) });
    setEditing(false);
  };

  return (
    <Screen>
      <TopBar title={t("profile.title")} back={{ name: "home" }} />
      <section className="profile-hero">
        <a className="profile-hero__avatar" href={href({ name: "avatar" })} aria-label={t("profile.editAvatar")}>
          <PlayerAvatar look={progress.profile.look} size={96} />
          <span className="profile-hero__edit" aria-hidden="true">
            <Pencil size={16} strokeWidth={2.8} />
          </span>
        </a>
        {editing ? (
          <form
            className="name-form"
            onSubmit={(e) => {
              e.preventDefault();
              saveName();
            }}
          >
            <label className="sr-only" htmlFor="profile-name">
              {t("profile.nameLabel")}
            </label>
            <input
              id="profile-name"
              className="input"
              value={draft}
              maxLength={24}
              autoFocus
              placeholder={t("profile.namePlaceholder")}
              onChange={(e) => setDraft(e.target.value)}
            />
            <Button size="md" type="submit" onClick={saveName}>
              {t("profile.saveName")}
            </Button>
          </form>
        ) : (
          <button
            type="button"
            className="profile-hero__name"
            onClick={() => {
              setDraft(progress.profile.name);
              setEditing(true);
            }}
            aria-label={t("profile.editName")}
          >
            {name || t("profile.guest")}
            <Pencil size={18} strokeWidth={2.6} aria-hidden="true" />
          </button>
        )}
      </section>

      <div className="rank-cards">
        <a className="rank-card" href={href({ name: "settings" })}>
          <span className="rank-card__label">{t("profile.difficulty")}</span>
          <span className="rank-card__value">
            {tierName(progress.difficulty.selected)}
          </span>
          <span className="rank-card__meta">{t("train.change")}</span>
        </a>
        <div className="rank-card">
          <span className="rank-card__label">{t("common.level", { n: level.level })}</span>
          <span className="rank-card__value text-gold">{t("common.xp", { n: number(progress.xp) })}</span>
          <span className="rank-card__meta">{t("profile.totalXp")}</span>
          <span className="rank-card__meta">{t("profile.weeklyXp", { n: number(weeklyXpAt(progress.weekly, new Date())) })}</span>
          <ProgressBar value={level.current} max={level.needed} label={levelText} size="sm" />
          <span className="rank-card__meta">{levelText}</span>
        </div>
      </div>
      <p className="faint small center">{t("profile.levelExplain")}</p>

      <h2 className="section-heading">{t("profile.stats")}</h2>
      <div className="stats-grid">
        <Stat label={t("profile.streak")} value={displayedStreak(progress.streak, localDate())} />
        <Stat label={t("profile.bestStreak")} value={progress.streak.best} />
        <Stat label={t("profile.lessons")} value={lessons} />
        <Stat label={t("profile.accuracy")} value={acc === null ? t("profile.noAnswers") : `${acc}%`} />
      </div>

      <nav className="menu card" aria-label={t("profile.title")}>
        <a className="menu__item" href={href({ name: "review" })}>
          <span className="menu__icon accent-gold" aria-hidden="true">
            <RotateCcw size={20} strokeWidth={2.6} />
          </span>
          <span className="menu__label">{t("profile.review")}</span>
          <span className="menu__meta">{mistakes ? t("profile.reviewCount", { n: mistakes }) : t("profile.reviewEmpty")}</span>
          <ChevronRight size={20} className="muted" aria-hidden="true" />
        </a>
        <a className="menu__item" href={href({ name: "settings" })}>
          <span className="menu__icon accent-gold" aria-hidden="true">
            <Settings size={20} strokeWidth={2.6} />
          </span>
          <span className="menu__label">{t("profile.settings")}</span>
          <ChevronRight size={20} className="muted" aria-hidden="true" />
        </a>
        <a className="menu__item" href={href({ name: "plus" })}>
          <span className="menu__icon accent-gold" aria-hidden="true">
            <Crown size={20} strokeWidth={2.6} />
          </span>
          <span className="menu__label">{t("profile.plus")}</span>
          <span className="menu__meta">{t("common.comingSoon")}</span>
          <ChevronRight size={20} className="muted" aria-hidden="true" />
        </a>
      </nav>
      <p className="muted small center">{t("profile.guestNote")}</p>

    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="stat">
      <span className="stat__value">{value}</span>
      <span className="stat__label">{label}</span>
    </div>
  );
}
