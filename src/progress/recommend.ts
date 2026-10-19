import type { ContentPack } from "../content";
import type { Tier } from "../content/types";
import { clearKey, type ProgressData } from "./model";
import { nextNode } from "./path";

/** The single thing Home suggests doing next. */
export type Recommendation =
  | { kind: "continue"; activityId: string; tier: Tier }
  | { kind: "intro"; introId: string }
  | { kind: "path"; activityId: string; tier: Tier }
  | { kind: "clear"; activityId: string; tier: Tier }
  | { kind: "practice"; activityId: string; tier: Tier };

/**
 * 1. Finish a game already under way at the current tier.
 * 2. Otherwise follow the Atlas to the next unexplored site.
 * 3. Otherwise clear a game not yet cleared at the current tier.
 * 4. Otherwise practise the game played least at this tier.
 */
export function recommend(data: ProgressData, pack: ContentPack): Recommendation {
  const tier = data.difficulty.selected;
  const unfinished = Object.values(data.sessions)
    .filter((s) => s.kind === "activity" && s.tier === tier && s.index < s.stepIds.length)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
  if (unfinished) return { kind: "continue", activityId: unfinished.refId, tier };

  const unit = pack.units[0];
  const next = unit ? nextNode(data, unit) : null;
  if (next) {
    return next.node.kind === "intro" ? { kind: "intro", introId: next.node.introId } : { kind: "path", activityId: next.node.activityId, tier };
  }

  const activities = pack.topics.flatMap((t) => t.activities);
  const uncleared = activities.find((a) => !data.tierClears[clearKey(a.id, tier)]);
  if (uncleared) return { kind: "clear", activityId: uncleared.id, tier };

  const plays = (id: string) => activities.find((a) => a.id === id)!.steps.filter((s) => s.tier === tier).reduce((n, s) => n + (data.seen[s.id] ?? 0), 0);
  const least = [...activities].sort((a, b) => plays(a.id) - plays(b.id))[0];
  return { kind: "practice", activityId: least.id, tier };
}
