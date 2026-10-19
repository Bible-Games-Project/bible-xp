import { Award, Gem, RotateCcw, Target, Trophy } from "lucide-react";
import { ProgressBar } from "../components/ProgressBar";
import { TierBadge, useTierName } from "../components/Tier";
import { useProgress } from "../progress/store";
import { PROMOTION, promotionStatus } from "../progress/tiers";
import { REWARDS } from "../progress/rewards";
import { navigate, type Route } from "../app/router";
import { Button } from "../components/Button";
import { Mascot } from "../components/Mascot";
import { formatRef, getContent } from "../content";
import type { BibleRef, Step } from "../content/types";
import { useI18n } from "../i18n";
import type { SessionSummary } from "../progress/model";

interface ResultsProps {
  summary: SessionSummary;
  steps: Step[];
  subtitle: string;
  onDone: () => void;
  onAgain: () => void;
  nextRoute?: Route | null;
  nextLabel?: string;
}

export function Results({ summary, steps, subtitle, onDone, onAgain, nextRoute, nextLabel }: ResultsProps) {
  const { t, language } = useI18n();
  const pack = getContent(language.code);
  const { difficulty } = useProgress();
  const tierName = useTierName();
  const status = promotionStatus(difficulty);
  const ratio = summary.totalSteps ? summary.correctSteps / summary.totalSteps : 0;
  const answers = summary.correctAnswers + summary.incorrectAnswers;
  const accuracy = answers ? Math.round((summary.correctAnswers / answers) * 100) : 0;
  const title = ratio === 1 ? t("results.titlePerfect") : ratio >= 0.5 ? t("results.titleGood") : t("results.titleTry");
  const xp = summary.reward.xp + summary.reward.bonus;
  const unit = summary.unitCompleted ? pack.units.find((u) => u.id === summary.unitCompleted) : null;

  const rewardNote = {
    "first-clear": t("results.firstCompletion", { tier: tierName(summary.tier), n: REWARDS.firstClear[summary.tier] }),
    practice: t("results.practiceXp"),
    "practice-already-claimed": t("results.practiceClaimed"),
    daily: t("results.dailyXp"),
    "daily-already-claimed": t("results.dailyClaimed"),
    review: t("results.reviewXp"),
    "review-already-claimed": t("results.reviewClaimed"),
  }[summary.reward.reason];

  // Unique passages across the session, in order of appearance.
  const seen = new Set<string>();
  const refs: BibleRef[] = [];
  for (const step of steps)
    for (const ref of step.references) {
      const label = formatRef(pack, ref);
      if (!seen.has(label)) {
        seen.add(label);
        refs.push(ref);
      }
    }

  return (
    <main className="results">
      <div className="results__hero">
        <div className="results__rays" aria-hidden="true" />
        <Mascot mood={ratio >= 0.5 ? "celebrating" : "encouraging"} size={150} />
        <h1 className="results__title">{title}</h1>
        <p className="results__subtitle">{subtitle}</p>
        <TierBadge tier={summary.tier} />
      </div>

      <div className="stat-tiles">
        <div className="stat-tile">
          <span className="stat-tile__label">{t("results.correct")}</span>
          <span className="stat-tile__value">
            <Target size={20} strokeWidth={2.6} aria-hidden="true" />
            {summary.correctSteps}/{summary.totalSteps}
          </span>
        </div>
        <div className="stat-tile stat-tile--xp">
          <span className="stat-tile__label">{t("results.xpEarned")}</span>
          <span className="stat-tile__value">
            <Gem size={20} strokeWidth={2.6} aria-hidden="true" />+{xp}
          </span>
        </div>
        <div className="stat-tile">
          <span className="stat-tile__label">{t("results.accuracy")}</span>
          <span className="stat-tile__value">{accuracy}%</span>
        </div>
      </div>

      <p className="results__note">
        {rewardNote}
        {summary.reward.reason === "first-clear" && summary.reward.bonus > REWARDS.firstClear[summary.tier] && ` · ${t("results.perfectBonus")}`}
      </p>

      {summary.tierUnlocked ? (
        <section className={`unlock tier-${summary.tierUnlocked}`} role="status">
          <span className="unlock__gem" aria-hidden="true" />
          <h2 className="unlock__title">{t("results.tierUnlocked", { tier: tierName(summary.tierUnlocked) })}</h2>
          <p className="muted small">{t("results.tierUnlockedBody", { tier: tierName(summary.tierUnlocked) })}</p>
        </section>
      ) : (
        summary.kind !== "review" &&
        status.next && (
          <a className={`climb tier-${status.next}`} href="#/difficulty">
            <span className="climb__row">
              <span className="climb__label">{t("results.tierProgress", { next: tierName(status.next) })}</span>
              <span className="climb__meta">
                {Math.min(status.answered, PROMOTION.minAnswered)}/{PROMOTION.minAnswered} · {status.accuracy === null ? "–" : Math.round(status.accuracy * 100)}%
              </span>
            </span>
            <ProgressBar value={Math.min(status.answered, PROMOTION.minAnswered)} max={PROMOTION.minAnswered} label={t("results.tierProgress", { next: tierName(status.next) })} tone="tier" size="sm" />
          </a>
        )
      )}

      {summary.levelAfter > summary.levelBefore && (
        <div className="banner banner--gold">
          <Award size={24} aria-hidden="true" />
          {t("results.levelUp", { n: summary.levelAfter })}
        </div>
      )}
      {unit && (
        <div className="banner banner--gold">
          <Trophy size={24} aria-hidden="true" />
          {t("results.unitComplete", { n: unit.number, name: unit.title })}
        </div>
      )}

      <section className="card results__refs">
        <h2 className="card__title">{t("results.references")}</h2>
        <ul className="ref-list">
          {refs.map((ref) => (
            <li key={formatRef(pack, ref)}>{formatRef(pack, ref)}</li>
          ))}
        </ul>
        <p className="muted small">{t("results.translation", { name: pack.translations.WEB.name, abbr: pack.translations.WEB.abbreviation })}</p>
      </section>

      <div className="results__actions">
        {nextRoute ? (
          <Button block onClick={() => navigate(nextRoute, { replace: true })}>
            {nextLabel ?? t("results.nextLesson")}
          </Button>
        ) : (
          <Button block onClick={onDone}>
            {t("common.continue")}
          </Button>
        )}
        <div className="results__row">
          <Button block variant="secondary" onClick={onAgain} icon={<RotateCcw size={20} />}>
            {t("common.playAgain")}
          </Button>
          {nextRoute && (
            <Button block variant="secondary" onClick={onDone}>
              {t("common.backHome")}
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
