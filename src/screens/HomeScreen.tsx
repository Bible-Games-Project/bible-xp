import { CalendarDays, Check, ChevronRight } from "lucide-react";
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

  // The one primary action.
  const rec = recommend(progress, pack);
  const topic = findTopic(pack, pack.units[0].topicId)!;
  let title: string;
  let eyebrow: string;
  let meta: string | null = null;
  let cta: string;
  let route: Route;
  if (rec.kind === "intro") {
    title = topic.intro.title;
    eyebrow = t("home.nextUp");
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

  // Difficulty progress, compact.
  const status = promotionStatus(progress.difficulty);

  // Daily challenge, as a single quiet row.
  const dailyDone = Boolean(progress.daily[today]?.rewarded);
  const dailySession = progress.sessions[sessionKey.daily(today)];
  const dailyTier = dailySession?.tier ?? tier;
  const daily = dailyChallengeFor(pack, today, dailyTier);

  return (
    <Screen withTabs>
      <AppHeader />
      <p className="home__greeting">{name ? t("home.greeting", { name }) : t("home.greetingGuest")}</p>

      <section className="quest" aria-labelledby="quest-title">
        <div className="quest__top">
          <div className="quest__text">
            <span className="eyebrow">
              <RecIcon size={15} strokeWidth={2.6} aria-hidden="true" />
              {eyebrow}
            </span>
            <h1 id="quest-title" className="quest__title">{title}</h1>
            <div className="quest__meta">
              {rec.kind !== "intro" && <TierBadge tier={tier} />}
              <span>{meta ?? `${topic.passage}`}</span>
            </div>
          </div>
          <Mascot mood="happy" size={104} className="quest__mascot" />
        </div>
        <Button block onClick={() => navigate(route)}>
          {cta}
        </Button>
      </section>

      <a className={`climb tier-${status.next ?? status.tier}`} href={href({ name: "difficulty" })}>
        <span className="climb__row">
          <span className="climb__label">
            {status.next ? t("home.tierToNext", { tier: tierName(status.tier), next: tierName(status.next) }) : t("home.tierMaster")}
          </span>
          <span className="climb__meta">
            {status.next
              ? `${Math.min(status.answered, PROMOTION.minAnswered)}/${PROMOTION.minAnswered} · ${status.accuracy === null ? "–" : Math.round(status.accuracy * 100)}%`
              : ""}
            <ChevronRight size={16} style={{ verticalAlign: "-3px" }} aria-hidden="true" />
          </span>
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
      </a>

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

      <TabBar current="home" />
    </Screen>
  );
}
