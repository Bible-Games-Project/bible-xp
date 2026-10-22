import { CalendarDays, Check, Play } from "lucide-react";
import { href, type Route } from "../app/router";
import { AppHeader, Screen, TabBar } from "../components/Layout";
import { Mascot } from "../components/Mascot";
import { Scene } from "../components/Scene";
import { useTierName } from "../components/Tier";
import { dailyChallengeFor, findActivity, findBook, findTopic, unitOfActivity } from "../content";
import { useContent } from "../content/useContent";
import { useI18n } from "../i18n";
import { localDate } from "../lib/date";
import { sessionKey } from "../progress/model";
import { nextNode } from "../progress/path";
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

  // Journey button: start, continue, or keep training once everything open is done.
  const rec = recommend(progress, pack);
  const firstUnit = pack.units[0];
  const fresh =
    rec.kind === "intro" && Object.keys(progress.intros).length === 0 && Object.keys(progress.activities).length === 0;
  let journeyTitle: string;
  let journeyMeta: string;
  let lumi: string;
  let route: Route;
  if (rec.kind === "intro") {
    const topic = findTopic(pack, firstUnit.topicId)!;
    journeyTitle = fresh ? t("home.startJourney") : t("home.continueJourney");
    journeyMeta = t("home.startMeta", { book: findBook(pack, firstUnit.bookId)?.name ?? "", story: topic.title });
    lumi = fresh ? t("home.lumiStart") : t("home.lumiContinue");
    route = { name: "intro", introId: rec.introId };
  } else {
    const activity = findActivity(pack, rec.activityId)!;
    route = { name: "play", activityId: activity.id };
    if (rec.kind === "path" || rec.kind === "continue") {
      const unit = unitOfActivity(pack, activity.id) ?? firstUnit;
      const topic = findTopic(pack, unit.topicId)!;
      const stop = (nextNode(progress, unit)?.index ?? unit.nodes.length - 1) + 1;
      journeyTitle = t("home.continueJourney");
      journeyMeta = t("home.continueMeta", { story: topic.title, n: stop, total: unit.nodes.length });
      lumi = t("home.lumiContinue");
    } else {
      journeyTitle = t("home.keepTraining");
      journeyMeta = t("home.practiceMeta", { game: t(`modes.${activity.mode}.name`), tier: tierName(tier) });
      lumi = t("home.lumiDone");
    }
  }

  const dailyDone = Boolean(progress.daily[today]?.rewarded);
  const dailyTier = progress.sessions[sessionKey.daily(today)]?.tier ?? tier;
  const daily = dailyChallengeFor(pack, today, dailyTier);

  return (
    <Screen withTabs className="screen--scene home">
      <Scene name="home" />
      <AppHeader />
      <h1 className="sr-only">{name ? t("home.greeting", { name }) : t("home.greetingGuest")}</h1>

      <div className="home__lumi">
        <p className="bubble">{lumi}</p>
        <Mascot mood={fresh ? "happy" : "normal"} size={132} />
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
