import { CalendarDays, Check, ChevronRight, Gauge } from "lucide-react";
import { href, navigate, type Route } from "../app/router";
import { Button } from "../components/Button";
import { MODE_STYLE } from "../components/icons";
import { AppHeader, Screen, TabBar } from "../components/Layout";
import { Mascot } from "../components/Mascot";
import { ProgressBar } from "../components/ProgressBar";
import { TierBadge, useTierName } from "../components/Tier";
import { dailyChallengeFor, findActivity, findTopic, SESSION_SIZE } from "../content";
import { useContent } from "../content/useContent";
import { useI18n } from "../i18n";
import { localDate } from "../lib/date";
import { sessionKey } from "../progress/model";
import { completedCount } from "../progress/path";
import { recommend } from "../progress/recommend";
import { useProgress } from "../progress/store";
import { PROMOTION, promotionStatus } from "../progress/tiers";

export function HomeScreen() {
  const { t } = useI18n();
  const pack = useContent();
  const progress = useProgress();
  const tierName = useTierName();
  const today = localDate();
  const name = progress.profile.name.trim();
  const tier = progress.difficulty.selected;
  const unit = pack.units[0];
  const topic = findTopic(pack, unit.topicId)!;

  // The one primary action.
  const rec = recommend(progress, pack);
  let title: string;
  let eyebrow: string;
  let meta: string;
  let cta: string;
  let route: Route;
  if (rec.kind === "intro") {
    title = topic.intro.title;
    eyebrow = t("home.nextUp");
    meta = topic.passage;
    cta = t("home.read");
    route = { name: "intro", introId: rec.introId };
  } else {
    const activity = findActivity(pack, rec.activityId)!;
    title = t(`modes.${activity.mode}.name`);
    eyebrow = {
      continue: t("home.continueUp"),
      path: t("home.nextUp"),
      clear: t("home.practiceUp", { tier: tierName(tier) }),
      practice: t("home.practiceMore", { tier: tierName(tier) }),
    }[rec.kind];
    const n = SESSION_SIZE[activity.mode];
    meta = n === 1 ? t("home.question") : t("home.questions", { n });
    cta = rec.kind === "continue" ? t("home.continue") : t("home.play");
    route = { name: "play", activityId: activity.id };
  }
  const RecIcon = rec.kind === "intro" ? MODE_STYLE.intro.icon : MODE_STYLE[findActivity(pack, rec.activityId)!.mode].icon;
  const done = completedCount(progress, unit);

  const status = promotionStatus(progress.difficulty);
  const dailyDone = Boolean(progress.daily[today]?.rewarded);
  const dailyTier = progress.sessions[sessionKey.daily(today)]?.tier ?? tier;
  const daily = dailyChallengeFor(pack, today, dailyTier);

  return (
    <Screen withTabs>
      <AppHeader />
      <div>
        <h1 className="screen-title">{name ? t("home.greeting", { name }) : t("home.greetingGuest")}</h1>
        <p className="muted">{t("home.ready")}</p>
      </div>

      <section className="quest" aria-labelledby="quest-title">
        <div className="quest__top">
          <div className="quest__text">
            <span className="quest__eyebrow">
              <RecIcon size={15} strokeWidth={2.6} aria-hidden="true" />
              {eyebrow}
            </span>
            <h2 id="quest-title" className="quest__title">{title}</h2>
            <div className="quest__meta">
              {rec.kind !== "intro" && <TierBadge tier={tier} />}
              <span>{meta}</span>
            </div>
          </div>
          <Mascot mood="happy" size={104} className="quest__mascot" />
        </div>
        <div className="quest__story">
          <span>{t("home.storyOf", { story: topic.title, n: Math.min(done + 1, unit.nodes.length), total: unit.nodes.length })}</span>
          <ProgressBar value={done} max={unit.nodes.length} label={t("path.stops", { n: done, total: unit.nodes.length })} size="sm" />
        </div>
        <Button block onClick={() => navigate(route)}>
          {cta}
        </Button>
      </section>

      <a className={`row-link${dailyDone ? " is-done" : ""}`} href={href({ name: "daily" })}>
        <span className="row-link__icon" aria-hidden="true">
          {dailyDone ? <Check size={20} strokeWidth={3} /> : <CalendarDays size={20} strokeWidth={2.4} />}
        </span>
        <span className="row-link__text">
          <span className="row-link__title">{t("home.dailyTitle")}</span>
          <span className="row-link__meta">
            {dailyDone ? t("home.dailyDone") : t("home.dailyMeta", { n: daily.steps.length, tier: tierName(dailyTier) })}
          </span>
        </span>
        <ChevronRight size={20} className="faint" aria-hidden="true" />
      </a>

      <a className={`row-link row-link--stack tier-${status.next ?? status.tier}`} href={href({ name: "difficulty" })}>
        <span className="row-link__icon row-link__icon--tier" aria-hidden="true">
          <Gauge size={20} strokeWidth={2.4} />
        </span>
        <span className="row-link__text">
          <span className="row-link__title">{t("home.difficultyTitle", { tier: tierName(progress.difficulty.unlocked) })}</span>
          <span className="row-link__meta">
            {status.next
              ? t("home.difficultyNext", {
                  next: tierName(status.next),
                  n: Math.min(status.answered, PROMOTION.minAnswered),
                  min: PROMOTION.minAnswered,
                  pct: status.accuracy === null ? 0 : Math.round(status.accuracy * 100),
                  need: PROMOTION.minAccuracy * 100,
                })
              : t("home.difficultyMax")}
          </span>
          {status.next && (
            <ProgressBar
              value={Math.min(status.answered, PROMOTION.minAnswered)}
              max={PROMOTION.minAnswered}
              label={t("difficulty.working", { next: tierName(status.next) })}
              tone="tier"
              size="sm"
            />
          )}
        </span>
        <ChevronRight size={20} className="faint" aria-hidden="true" />
      </a>

      <TabBar current="home" />
    </Screen>
  );
}
