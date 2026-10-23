import { CalendarDays, Check, Play } from "lucide-react";
import { href, type Route } from "../app/router";
import { AppHeader, Screen, TabBar } from "../components/Layout";
import { Mascot } from "../components/Mascot";
import { useTierName } from "../components/Tier";
import { dailyChallengeFor, findActivity, findBook, findTopic } from "../content";
import { useContent } from "../content/useContent";
import { useI18n } from "../i18n";
import { localDate } from "../lib/date";
import { sessionKey } from "../progress/model";
import { currentUnit, nextNode } from "../progress/path";
import { recommend } from "../progress/recommend";
import { REWARDS } from "../progress/rewards";
import { useProgress } from "../progress/store";

/** Home: two big buttons over the landscape — the Journey and the Daily Challenge. */
export function HomeScreen() {
  const { t } = useI18n();
  const pack = useContent();
  const progress = useProgress();
  const tierName = useTierName();
  const today = localDate();
  const name = progress.profile.name.trim();
  const tier = progress.difficulty.selected;

  // Journey button: onto the road of the current story, or keep training once everything open is done.
  const unit = currentUnit(progress, pack.units, pack.books.map((b) => b.id));
  const next = unit ? nextNode(progress, unit) : null;
  const fresh = Object.keys(progress.intros).length === 0 && Object.keys(progress.activities).length === 0;
  let journeyTitle: string;
  let journeyMeta: string;
  let lumi: string;
  let route: Route;
  if (unit && next) {
    const topic = findTopic(pack, unit.topicId)!;
    journeyTitle = fresh ? t("home.startJourney") : t("home.continueJourney");
    journeyMeta = fresh
      ? t("home.startMeta", { book: findBook(pack, unit.bookId)?.name ?? "", story: topic.title })
      : t("home.continueMeta", { story: topic.title, n: next.index + 1, total: unit.nodes.length });
    lumi = fresh ? t("home.lumiStart") : t("home.lumiContinue");
    route = { name: "path" };
  } else {
    const rec = recommend(progress, pack);
    journeyTitle = t("home.keepTraining");
    lumi = t("home.lumiDone");
    if (rec.kind === "intro") {
      journeyMeta = "";
      route = { name: "intro", introId: rec.introId };
    } else {
      const activity = findActivity(pack, rec.activityId)!;
      journeyMeta = t("home.practiceMeta", { game: t(`modes.${activity.mode}.name`), tier: tierName(tier) });
      route = { name: "play", activityId: activity.id };
    }
  }

  const dailyDone = Boolean(progress.daily[today]?.rewarded);
  const dailyTier = progress.sessions[sessionKey.daily(today)]?.tier ?? tier;
  const daily = dailyChallengeFor(pack, today, dailyTier);

  return (
    <Screen withTabs scene="home" className="home">
      <AppHeader />
      <h1 className="sr-only">{name ? t("home.greeting", { name }) : t("home.greetingGuest")}</h1>

      {/* Lumi talks from the sky, clear of the hill with the crosses. */}
      <div className="home__lumi">
        <Mascot mood={fresh ? "happy" : "normal"} size={112} />
        <p className="bubble">{lumi}</p>
      </div>

      <nav className="home__actions" aria-label={t("nav.home")}>
        <a className="big-btn big-btn--journey" href={href(route)}>
          <span className="big-btn__icon" aria-hidden="true">
            <Play size={26} strokeWidth={2.6} fill="currentColor" />
          </span>
          <span className="big-btn__text">
            <span className="big-btn__title">{journeyTitle}</span>
            <span className="big-btn__meta">{journeyMeta}</span>
          </span>
        </a>
        <a className={`big-btn big-btn--daily${dailyDone ? " is-done" : ""}`} href={href({ name: "daily" })}>
          <span className="big-btn__icon" aria-hidden="true">
            {dailyDone ? <Check size={26} strokeWidth={3} /> : <CalendarDays size={26} strokeWidth={2.4} />}
          </span>
          <span className="big-btn__text">
            <span className="big-btn__title">{t("home.dailyTitle")}</span>
            <span className="big-btn__meta">
              {dailyDone ? t("home.dailyDone") : t("home.dailyMeta", { n: daily.steps.length, xp: REWARDS.daily[dailyTier] })}
            </span>
          </span>
        </a>
      </nav>

      <TabBar current="home" />
    </Screen>
  );
}
