import { Lock } from "lucide-react";
import { useState } from "react";
import { href, navigate, type Route } from "../app/router";
import { Button } from "../components/Button";
import { EdenMap, type MapSite } from "../components/EdenMap";
import { MODE_STYLE } from "../components/icons";
import { Screen, TabBar } from "../components/Layout";
import { TierBadge, TierPips, useTierName } from "../components/Tier";
import { findTopic } from "../content";
import type { PathNode } from "../content/types";
import { TIERS } from "../content/types";
import { useContent } from "../content/useContent";
import { useI18n } from "../i18n";
import { clearKey } from "../progress/model";
import { completedCount, nextNode, nodeStatus, type NodeStatus } from "../progress/path";
import { useProgress } from "../progress/store";
import { nodeDescription, nodeLabel, nodeMode } from "./pathLabels";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

function routeFor(node: PathNode): Route {
  return node.kind === "intro" ? { name: "intro", introId: node.introId } : { name: "play", activityId: node.activityId };
}

const STATUS_KEY = {
  locked: "path.statusLocked",
  available: "path.statusAvailable",
  "in-progress": "path.statusInProgress",
  completed: "path.statusCompleted",
} as const;

/**
 * The Atlas: each region of Scripture is a map with sites to explore. Today
 * there is one region, Eden (Genesis 1–3).
 */
export function PathScreen() {
  const { t } = useI18n();
  const pack = useContent();
  const progress = useProgress();
  const tierName = useTierName();
  const [selected, setSelected] = useState<string | null>(null);
  const tier = progress.difficulty.selected;

  return (
    <Screen withTabs>
      <header className="region__head">
        <h1 className="screen-title">{t("path.title")}</h1>
        <a href={href({ name: "difficulty" })} aria-label={t("difficulty.title")}>
          <TierBadge tier={tier} />
        </a>
      </header>

      {pack.units.map((unit) => {
        const topic = findTopic(pack, unit.topicId)!;
        const done = completedCount(progress, unit);
        const current = nextNode(progress, unit);
        const statuses: NodeStatus[] = unit.nodes.map((_, i) => nodeStatus(progress, unit, i));
        const selectedIndex = Math.max(0, unit.nodes.findIndex((n) => n.id === (selected ?? current?.node.id ?? unit.nodes[0].id)));
        const node = unit.nodes[selectedIndex];
        const status = statuses[selectedIndex];
        const mode = nodeMode(pack, node);
        const Icon = MODE_STYLE[mode].icon;
        const activities = topic.activities;
        const clears = activities.reduce((n, a) => n + TIERS.filter((tr) => progress.tierClears[clearKey(a.id, tr)]).length, 0);
        const sites: MapSite[] = unit.nodes.map((n, i) => ({
          id: n.id,
          mode: nodeMode(pack, n),
          label: `${ROMAN[i]}. ${nodeLabel(t, pack, n)}, ${t(STATUS_KEY[statuses[i]])}`,
          status: statuses[i],
        }));

        return (
          <section key={unit.id} className="region" aria-labelledby={`${unit.id}-title`}>
            <div className="region__head">
              <div>
                <span className="eyebrow">
                  {t("path.region", { n: ROMAN[unit.number - 1] })} · {topic.passage}
                </span>
                <h2 id={`${unit.id}-title`} className="region__title">
                  {unit.title}
                </h2>
              </div>
              <div className="region__stats">
                <div>{t("path.sites", { n: done, total: unit.nodes.length })}</div>
                <div>{t("path.mastery", { n: clears, total: activities.length * TIERS.length })}</div>
              </div>
            </div>

            <div className="atlas-map">
              <EdenMap sites={sites} selectedId={node.id} currentId={current?.node.id ?? null} onSelect={setSelected} />
            </div>
            <p className="atlas-map__caption">{t("path.mapCaption")}</p>

            <div className="site-panel" aria-live="polite">
              <div className="site-panel__head">
                <span className="site-panel__icon" aria-hidden="true">
                  <Icon size={24} strokeWidth={2.4} />
                </span>
                <div>
                  <h3 className="site-panel__title">
                    {ROMAN[selectedIndex]}. {nodeLabel(t, pack, node)}
                  </h3>
                  <p className="site-panel__sub">{nodeDescription(t, pack, node)}</p>
                </div>
              </div>
              {node.kind === "activity" && (
                <div className="site-panel__foot">
                  <span>{t("path.clearedAt")}</span>
                  <TierPips
                    cleared={(tr) => Boolean(progress.tierClears[clearKey(node.activityId, tr)])}
                    label={TIERS.filter((tr) => progress.tierClears[clearKey(node.activityId, tr)])
                      .map(tierName)
                      .join(", ") || t("common.locked")}
                  />
                </div>
              )}
              {status === "locked" ? (
                <p className="site-panel__locked">
                  <Lock size={18} aria-hidden="true" />
                  {t("path.unlockHint", { name: nodeLabel(t, pack, unit.nodes[selectedIndex - 1]) })}
                </p>
              ) : (
                <Button block onClick={() => navigate(routeFor(node))}>
                  {node.kind === "intro"
                    ? t("path.nodeRead")
                    : status === "completed"
                      ? t("path.nodeReplay")
                      : status === "in-progress"
                        ? t("path.nodeContinue")
                        : t("path.nodeStart")}
                </Button>
              )}
            </div>

            <h3 className="section-heading">{t("path.log")}</h3>
            <ol className="log">
              {unit.nodes.map((n, i) => (
                <li key={n.id} className="log__item">
                  <button
                    type="button"
                    className={`log__btn${i === selectedIndex ? " is-selected" : ""}${statuses[i] === "locked" ? " is-locked" : ""}`}
                    onClick={() => {
                      setSelected(n.id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    aria-current={i === selectedIndex ? "true" : undefined}
                  >
                    <span className="log__num">{ROMAN[i]}</span>
                    <span className="log__name">{nodeLabel(t, pack, n)}</span>
                    <span className={`status status--${statuses[i]}`}>{t(STATUS_KEY[statuses[i]])}</span>
                  </button>
                </li>
              ))}
            </ol>
          </section>
        );
      })}
      <p className="muted small center">{t("path.moreSoon")}</p>
      <TabBar current="path" />
    </Screen>
  );
}
