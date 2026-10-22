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

/**
 * The story the Journey continues from: the first story, in Bible order, that
 * still has stops to explore; the last one once everything open is done.
 */
export function currentUnit(data: ProgressData, units: Unit[], bookOrder: string[]): Unit | undefined {
  const ordered = [...units].sort(
    (a, b) => bookOrder.indexOf(a.bookId) - bookOrder.indexOf(b.bookId) || a.number - b.number,
  );
  return ordered.find((u) => completedCount(data, u) < u.nodes.length) ?? ordered[ordered.length - 1];
}

/** Stories finished in a book, out of all its stories (open and announced). */
export function bookProgress(data: ProgressData, units: Unit[], plannedCount: number): { done: number; total: number } {
  return {
    done: units.filter((u) => completedCount(data, u) === u.nodes.length).length,
    total: units.length + plannedCount,
  };
}
