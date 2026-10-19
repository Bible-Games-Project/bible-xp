import { findActivity, type ContentPack } from "../content";
import type { GameMode, PathNode } from "../content/types";
import type { MessageKey, Params } from "../i18n";

type T = (key: MessageKey, params?: Params) => string;

export function nodeMode(pack: ContentPack, node: PathNode): GameMode | "intro" {
  return node.kind === "intro" ? "intro" : (findActivity(pack, node.activityId)?.mode ?? "quiz");
}

export function nodeLabel(t: T, pack: ContentPack, node: PathNode): string {
  const mode = nodeMode(pack, node);
  return mode === "intro" ? t("path.introName") : t(`modes.${mode}.name`);
}

export function nodeDescription(t: T, pack: ContentPack, node: PathNode): string {
  if (node.kind === "intro") return t("path.introDescription");
  const activity = findActivity(pack, node.activityId);
  return activity ? `${activity.title} · ${t(`modes.${activity.mode}.description`)}` : "";
}
