import { BookOpen } from "lucide-react";
import { navigate, type Route } from "../app/router";
import { MODE_STYLE } from "../components/icons";
import { JourneyRoad, type RoadStop } from "../components/JourneyRoad";
import { AppHeader, Screen, TabBar } from "../components/Layout";
import { Mascot } from "../components/Mascot";
import { ProgressBar } from "../components/ProgressBar";
import { useTierName } from "../components/Tier";
import { findTopic } from "../content";
import type { PathNode } from "../content/types";
import { TIERS } from "../content/types";
import { useContent } from "../content/useContent";
import { useI18n } from "../i18n";
import { clearKey } from "../progress/model";
import { completedCount, nodeStatus } from "../progress/path";
import { useProgress } from "../progress/store";
import { nodeLabel, nodeMode } from "./pathLabels";

function routeFor(node: PathNode): Route {
  return node.kind === "intro" ? { name: "intro", introId: node.introId } : { name: "play", activityId: node.activityId };
}

/**
 * The Journey: every Bible story is a chapter with its own road of stops.
 * Adding a story to the content adds a chapter here; nothing else changes.
 */
export function PathScreen() {
  const { t } = useI18n();
  const pack = useContent();
  const progress = useProgress();
  const tierName = useTierName();

  return (
    <Screen withTabs>
      <AppHeader />
      <div>
        <h1 className="screen-title">{t("path.title")}</h1>
        <p className="muted">{t("path.subtitle")}</p>
      </div>

      {pack.units.map((unit) => {
        const topic = findTopic(pack, unit.topicId)!;
        const done = completedCount(progress, unit);
        const stops: RoadStop[] = unit.nodes.map((node, i) => {
          const status = nodeStatus(progress, unit, i);
          const mode = nodeMode(pack, node);
          const cleared =
            node.kind === "activity" ? TIERS.filter((tier) => progress.tierClears[clearKey(node.activityId, tier)]) : [];
          const state =
            status === "locked"
              ? t("path.locked")
              : status === "completed"
                ? cleared.length
                  ? `${t("path.done")} · ${cleared.map(tierName).join(", ")}`
                  : t("path.done")
                : status === "in-progress"
                  ? t("path.continue")
                  : t("path.next");
          return {
            id: node.id,
            name: nodeLabel(t, pack, node),
            icon: MODE_STYLE[mode].icon,
            status,
            state,
            action:
              status === "available" || status === "in-progress"
                ? node.kind === "intro"
                  ? t("path.read")
                  : status === "in-progress"
                    ? t("path.continue")
                    : t("path.play")
                : undefined,
            lockedHint: i > 0 ? t("path.unlockHint", { name: nodeLabel(t, pack, unit.nodes[i - 1]) }) : undefined,
            onOpen: () => navigate(routeFor(node)),
          };
        });
        const complete = done === unit.nodes.length;

        return (
          <section key={unit.id} aria-labelledby={`${unit.id}-title`}>
            <div className="story-head">
              <div className="story-head__text">
                <span className="story-head__eyebrow">
                  {t("path.story", { n: unit.number })} · {topic.passage}
                </span>
                <h2 id={`${unit.id}-title`} className="story-head__title">
                  {topic.title}
                </h2>
                <span className="story-head__meta">{t("path.stops", { n: done, total: unit.nodes.length })}</span>
                <ProgressBar value={done} max={unit.nodes.length} label={t("path.stops", { n: done, total: unit.nodes.length })} size="sm" />
              </div>
              <Mascot mood={complete ? "celebrating" : "happy"} size={92} />
            </div>
            <JourneyRoad stops={stops} finish={{ name: t("path.storyDone"), won: complete }} />
          </section>
        );
      })}

      <div className="soon-card">
        <span className="soon-card__icon" aria-hidden="true">
          <BookOpen size={22} />
        </span>
        <span>
          <strong>{t("path.moreSoon")}</strong>
          <br />
          <span className="small">{t("path.moreSoonBody")}</span>
        </span>
      </div>
      <TabBar current="path" />
    </Screen>
  );
}
