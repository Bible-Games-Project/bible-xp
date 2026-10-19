import { useMemo, useState } from "react";
import type { Route } from "../app/router";
import { drawSteps, findActivity, findStep, findTopic, SESSION_SIZE, stepsAtTier } from "../content";
import type { Step } from "../content/types";
import { useContent } from "../content/useContent";
import { GameSession } from "../engine/GameSession";
import { useI18n } from "../i18n";
import { sessionKey } from "../progress/model";
import { nextNode } from "../progress/path";
import { getProgress, progressActions, useProgress } from "../progress/store";
import { NotFoundScreen } from "./InfoScreens";

export function PlayScreen({ activityId, from }: { activityId: string; from?: "free" }) {
  const { t } = useI18n();
  const pack = useContent();
  const progress = useProgress();
  const activity = findActivity(pack, activityId);
  // The tier is fixed for the life of this screen.
  const [tier] = useState(() => getProgress().difficulty.selected);
  const [draw, setDraw] = useState(0);
  const key = sessionKey.activity(activityId, tier);

  const steps = useMemo<Step[]>(() => {
    if (!activity) return [];
    // Resume a saved session with its own questions when they all still exist.
    const saved = getProgress().sessions[key];
    if (saved) {
      const resumed = saved.stepIds.map((id) => findStep(pack, id));
      if (resumed.every((s) => s !== undefined)) return resumed as Step[];
      progressActions.abandonSession(key);
    }
    const pool = stepsAtTier(activity, tier);
    return drawSteps(pool, SESSION_SIZE[activity.mode], getProgress().seen, `${key}:${Date.now()}`);
    // `draw` forces a fresh set for "Play again".
  }, [activity, pack, key, tier, draw]);

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
      key={`${key}:${draw}`}
      sessionKey={key}
      kind="activity"
      refId={activity.id}
      steps={steps}
      tier={tier}
      onPlayAgain={() => setDraw((d) => d + 1)}
      subtitle={`${topic.title} · ${t(`modes.${activity.mode}.name`)}`}
      exitRoute={exitRoute}
      nextRoute={nextRoute}
    />
  );
}
