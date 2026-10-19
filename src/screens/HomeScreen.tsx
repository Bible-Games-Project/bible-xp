import { CalendarDays, Check, ChevronRight, Lock, Swords } from "lucide-react";
import { href, navigate } from "../app/router";
import { Button } from "../components/Button";
import { MODE_STYLE } from "../components/icons";
import { AppHeader, Screen, TabBar } from "../components/Layout";
import { Mascot } from "../components/Mascot";
import { ProgressBar } from "../components/ProgressBar";
import { dailyChallengeFor, findActivity, findTopic } from "../content";
import { GAME_MODES } from "../content/types";
import { useContent } from "../content/useContent";
import { useI18n } from "../i18n";
import { localDate } from "../lib/date";
import { sessionKey } from "../progress/model";
import { completedCount, nextNode, nodeStatus } from "../progress/path";
import { useProgress } from "../progress/store";
import { nodeLabel } from "./pathLabels";

export function HomeScreen() {
  const { t } = useI18n();
  const pack = useContent();
  const progress = useProgress();
  const today = localDate();
  const daily = dailyChallengeFor(pack, today);
  const dailySession = progress.sessions[sessionKey.daily(today)];
  const dailyDone = Boolean(progress.daily[today]?.rewarded);
  const dailyIndex = dailyDone ? daily.steps.length : (dailySession?.index ?? 0);

  const unit = pack.units[0];
  const topic = findTopic(pack, unit.topicId)!;
  const next = nextNode(progress, unit);
  const done = completedCount(progress, unit);
  const name = progress.profile.name.trim();

  return (
    <Screen withTabs>
      <AppHeader />
      <h1 className="home__greeting">{name ? t("home.greeting", { name }) : t("home.greetingGuest")}</h1>

      {/* Daily challenge: the hero of the home screen. */}
      <section className="daily-card" aria-labelledby="daily-title">
        <div className="daily-card__glow" aria-hidden="true" />
        <div className="daily-card__text">
          <span className="eyebrow eyebrow--light">
            <CalendarDays size={16} strokeWidth={2.6} aria-hidden="true" />
            {t("home.dailyTitle")}
          </span>
          <h2 id="daily-title" className="daily-card__title">{daily.theme}</h2>
          <p className="daily-card__meta">{t("home.dailyActivities", { n: daily.steps.length })}</p>
          <ProgressBar value={dailyIndex} max={daily.steps.length} label={t("common.stepOf", { n: dailyIndex, total: daily.steps.length })} tone="yellow" size="sm" />
          {dailyDone ? (
            <p className="daily-card__done">
              <Check size={18} strokeWidth={3} aria-hidden="true" /> {t("home.dailyDone")}
            </p>
          ) : (
            <Button variant="secondary" className="daily-card__btn" onClick={() => navigate({ name: "daily" })}>
              {dailySession && dailySession.index > 0 ? t("home.dailyContinue") : t("home.dailyStart")}
            </Button>
          )}
        </div>
        <Mascot mood={dailyDone ? "celebrating" : "happy"} size={118} className="daily-card__mascot" />
      </section>
      {dailyDone && <p className="home__hint">{t("home.dailyDoneHint")}</p>}

      {/* Path */}
      <a className="card card--link path-card" href={href({ name: "path" })}>
        <div className="path-card__top">
          <span className="eyebrow">{t("path.unit", { n: unit.number })} · {topic.passage}</span>
          <ChevronRight size={22} className="muted" aria-hidden="true" />
        </div>
        <h2 className="card__title card__title--lg">{unit.title}</h2>
        <ProgressBar value={done} max={unit.nodes.length} label={t("path.lessonsDone", { n: done, total: unit.nodes.length })} />
        <div className="path-card__row">
          <div className="mini-nodes" aria-hidden="true">
            {unit.nodes.map((node, i) => {
              const status = nodeStatus(progress, unit, i);
              const mode = node.kind === "intro" ? "intro" : findActivity(pack, node.activityId)!.mode;
              const Icon = MODE_STYLE[mode].icon;
              return (
                <span key={node.id} className={`mini-node mini-node--${status}`}>
                  {status === "completed" ? <Check size={14} strokeWidth={3.2} /> : status === "locked" ? <Lock size={12} strokeWidth={2.8} /> : <Icon size={14} strokeWidth={2.8} />}
                </span>
              );
            })}
          </div>
          <span className="muted small">{t("home.pathLessons", { n: done, total: unit.nodes.length })}</span>
        </div>
        <p className="path-card__next">{next ? t("home.pathNext", { name: nodeLabel(t, pack, next.node) }) : t("home.pathDone")}</p>
      </a>

      <div className="home__grid">
        <a className="card card--link tile tile--blue" href={href({ name: "free" })}>
          <div className="tile__icons" aria-hidden="true">
            {GAME_MODES.map((m) => {
              const Icon = MODE_STYLE[m].icon;
              return (
                <span key={m} className={`tile__icon accent-${MODE_STYLE[m].accent}`}>
                  <Icon size={16} strokeWidth={2.6} />
                </span>
              );
            })}
          </div>
          <h2 className="card__title">{t("home.freeTitle")}</h2>
          <p className="muted small">{t("home.freeBody")}</p>
        </a>
        <a className="card card--link tile tile--violet" href={href({ name: "multiplayer" })}>
          <span className="tile__badge">{t("common.comingSoon")}</span>
          <span className="tile__big-icon accent-violet" aria-hidden="true">
            <Swords size={26} strokeWidth={2.4} />
          </span>
          <h2 className="card__title">{t("home.multiplayerTitle")}</h2>
          <p className="muted small">{t("home.multiplayerBody")}</p>
        </a>
      </div>
      <TabBar current="home" />
    </Screen>
  );
}
