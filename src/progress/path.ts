import type { PathNode, Unit } from "../content/types";
import { isNodeCompleted, sessionKey, type ProgressData } from "./model";

export type NodeStatus = "locked" | "available" | "in-progress" | "completed";

/** Each node unlocks when the previous one is completed; the first is always open. */
export function nodeStatus(data: ProgressData, unit: Unit, index: number): NodeStatus {
  const node = unit.nodes[index];
  if (isNodeCompleted(data, node)) return "completed";
  if (index > 0 && !isNodeCompleted(data, unit.nodes[index - 1])) return "locked";
  if (node.kind === "activity" && data.sessions[sessionKey.activity(node.activityId, data.difficulty.selected)]) return "in-progress";
  return "available";
}

/** The node the player should do next, or null when the unit is complete. */
export function nextNode(data: ProgressData, unit: Unit): { node: PathNode; index: number } | null {
  const index = unit.nodes.findIndex((n) => !isNodeCompleted(data, n));
  return index === -1 ? null : { node: unit.nodes[index], index };
}

export function completedCount(data: ProgressData, unit: Unit): number {
  return unit.nodes.filter((n) => isNodeCompleted(data, n)).length;
}
