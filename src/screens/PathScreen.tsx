import { Check, Lock, Star, Trophy } from "lucide-react";
import { useState } from "react";
import { navigate, type Route } from "../app/router";
import { Button } from "../components/Button";
import { MODE_STYLE } from "../components/icons";
import { AppHeader, Screen, TabBar } from "../components/Layout";
import { Mascot } from "../components/Mascot";
import { Sheet } from "../components/Overlay";
import { ProgressBar } from "../components/ProgressBar";
import { findTopic } from "../content";
import type { PathNode } from "../content/types";
import { useContent } from "../content/useContent";
import { useI18n } from "../i18n";
import { completedCount, nextNode, nodeStatus, type NodeStatus } from "../progress/path";
import { useProgress } from "../progress/store";
import { nodeDescription, nodeLabel, nodeMode } from "./pathLabels";

/** Horizontal offsets that make the nodes wind like a trail. */
const WIND = [0, 1, 1.6, 1, 0, -1, -1.6, -1];

function routeFor(node: PathNode): Route {
  return node.kind === "intro" ? { name: "intro", introId: node.introId } : { name: "play", activityId: node.activityId };
}

export function PathScreen() {
  const { t } = useI18n();
  const pack = useContent();
  const progress = useProgress();
  const [open, setOpen] = useState<number | null>(null);

  return (
    <Screen withTabs>
      <AppHeader />
      {pack.units.map((unit) => {
        const topic = findTopic(pack, unit.topicId)!;
        const done = completedCount(progress, unit);
        const current = nextNode(progress, unit)?.index ?? -1;
        const selected = open !== null ? unit.nodes[open] : null;
        const selectedStatus: NodeStatus | null = open !== null ? nodeStatus(progress, unit, open) : null;

        return (
          <section key={unit.id} aria-labelledby={`${unit.id}-title`}>
            <div className="unit-banner">
              <div>
                <span className="eyebrow eyebrow--light">
                  {t("path.unit", { n: unit.number })} · {topic.passage}
                </span>
                <h1 id={`${unit.id}-title`} className="unit-banner__title">{unit.title}</h1>
                <p className="unit-banner__meta">{t("path.lessonsDone", { n: done, total: unit.nodes.length })}</p>
              </div>
              <div className="unit-banner__progress">
                <ProgressBar value={done} max={unit.nodes.length} label={t("path.lessonsDone", { n: done, total: unit.nodes.length })} tone="yellow" size="sm" />
              </div>
            </div>

            <ol className="trail">
              {unit.nodes.map((node, i) => {
                const status = nodeStatus(progress, unit, i);
                const mode = nodeMode(pack, node);
                const style = MODE_STYLE[mode];
                const Icon = style.icon;
                const isCurrent = i === current;
                const offset = WIND[i % WIND.length];
                return (
                  <li key={node.id} className="trail__step" style={{ ["--x" as string]: offset }}>
                    {isCurrent && (
                      <div className={`trail__lumi ${offset > 0 ? "is-left" : "is-right"}`} aria-hidden="true">
                        <Mascot mood="happy" size={74} />
                      </div>
                    )}
                    <button
                      type="button"
                      className={`node node--${status} accent-${style.accent}${isCurrent ? " is-current" : ""}`}
                      onClick={() => setOpen(i)}
                      aria-label={`${nodeLabel(t, pack, node)} — ${t(`common.${status === "in-progress" ? "inProgress" : status}`)}`}
                    >
                      {isCurrent && <span className="node__start">{status === "in-progress" ? t("path.nodeContinue") : t("path.nodeStart")}</span>}
                      <span className="node__face">
                        {status === "completed" ? <Check size={34} strokeWidth={3.4} /> : status === "locked" ? <Lock size={28} strokeWidth={2.8} /> : <Icon size={32} strokeWidth={2.6} />}
                      </span>
                    </button>
                    <span className={`trail__label${status === "locked" ? " muted" : ""}`}>{nodeLabel(t, pack, node)}</span>
                  </li>
                );
              })}
              <li className="trail__step" style={{ ["--x" as string]: 0 }}>
                <span className={`node node--trophy${unit.nodes.length === done ? " is-won" : ""}`} aria-hidden="true">
                  <span className="node__face">
                    <Trophy size={32} strokeWidth={2.6} />
                  </span>
                </span>
              </li>
            </ol>

            <Sheet open={selected !== null} onClose={() => setOpen(null)} label={selected ? nodeLabel(t, pack, selected) : ""}>
              {selected && selectedStatus && (
                <div className="node-sheet">
                  <span className={`node-sheet__icon accent-${MODE_STYLE[nodeMode(pack, selected)].accent}`} aria-hidden="true">
                    {(() => {
                      const Icon = MODE_STYLE[nodeMode(pack, selected)].icon;
                      return <Icon size={30} strokeWidth={2.6} />;
                    })()}
                  </span>
                  <h2 className="node-sheet__title">{nodeLabel(t, pack, selected)}</h2>
                  <p className="muted">{nodeDescription(t, pack, selected)}</p>
                  {selectedStatus === "locked" ? (
                    <p className="node-sheet__locked">
                      <Lock size={18} aria-hidden="true" />
                      {t("path.unlockHint", { name: nodeLabel(t, pack, unit.nodes[open! - 1]) })}
                    </p>
                  ) : (
                    <Button
                      block
                      icon={selectedStatus === "completed" ? <Star size={20} /> : undefined}
                      onClick={() => {
                        setOpen(null);
                        navigate(routeFor(selected));
                      }}
                    >
                      {selectedStatus === "completed" ? t("path.nodeReplay") : selectedStatus === "in-progress" ? t("path.nodeContinue") : t("path.nodeStart")}
                    </Button>
                  )}
                </div>
              )}
            </Sheet>
          </section>
        );
      })}
      <p className="trail__soon muted">{t("path.moreSoon")}</p>
      <TabBar current="path" />
    </Screen>
  );
}
