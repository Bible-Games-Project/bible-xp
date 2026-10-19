import type { Route } from "../app/router";
import { findActivity, findTopic } from "../content";
import { useContent } from "../content/useContent";
import { GameSession } from "../engine/GameSession";
import { useI18n } from "../i18n";
import { sessionKey } from "../progress/model";
import { nextNode } from "../progress/path";
import { useProgress } from "../progress/store";
import { NotFoundScreen } from "./InfoScreens";

export function PlayScreen({ activityId, from }: { activityId: string; from?: "free" }) {
  const { t } = useI18n();
  const pack = useContent();
  const progress = useProgress();
  const activity = findActivity(pack, activityId);
  if (!activity) return <NotFoundScreen />;
  const topic = findTopic(pack, activity.topicId)!;

  const exitRoute: Route = from === "free" ? { name: "free" } : { name: "path" };
  let nextRoute: Route | null = null;
  const unit = pack.units.find((u) => u.nodes.some((n) => n.kind === "activity" && n.activityId === activityId));
  if (unit && from !== "free") {
    const next = nextNode(progress, unit);
    if (next && !(next.node.kind === "activity" && next.node.activityId === activityId)) {
      nextRoute = next.node.kind === "intro" ? { name: "intro", introId: next.node.introId } : { name: "play", activityId: next.node.activityId };
    }
  }

  return (
    <GameSession
      key={activity.id}
      sessionKey={sessionKey.activity(activity.id)}
      kind="activity"
      refId={activity.id}
      steps={activity.steps}
      subtitle={`${topic.title} · ${t(`modes.${activity.mode}.name`)}`}
      exitRoute={exitRoute}
      nextRoute={nextRoute}
    />
  );
}
