import { ChevronRight, Library } from "lucide-react";
import { href, navigate, type Route } from "../app/router";
import { MODE_STYLE } from "../components/icons";
import { JourneyRoad, type RoadStop } from "../components/JourneyRoad";
import { AppHeader, Screen, TabBar, TopBar } from "../components/Layout";
import { Mascot } from "../components/Mascot";
import { ProgressBar } from "../components/ProgressBar";
import { storyScene } from "../components/Scene";
import { useTierName } from "../components/Tier";
import { findBook, findTopic, unitFor, unitsOfBook } from "../content";
import type { PathNode } from "../content/types";
import { TIERS } from "../content/types";
import { useContent } from "../content/useContent";
import { useI18n } from "../i18n";
import { clearKey } from "../progress/model";
import { bookProgress, completedCount, currentUnit, nodeStatus } from "../progress/path";
import { useProgress } from "../progress/store";
import { NotFoundScreen } from "./InfoScreens";
import { nodeLabel, nodeMode } from "./pathLabels";

function routeFor(node: PathNode): Route {
  return node.kind === "intro" ? { name: "intro", introId: node.introId } : { name: "play", activityId: node.activityId };
}

/** The Journey tab: straight onto the road of the story the player is on. */
export function CurrentStoryScreen() {
  const pack = useContent();
  const progress = useProgress();
  const unit = currentUnit(progress, pack.units, pack.books.map((b) => b.id));
  if (!unit) return <NotFoundScreen />;
  return <StoryScreen key={unit.id} unitId={unit.id} />;
}

/**
 * One story of the Journey: a winding road of stops, unlocked in order.
 * Opened from the Bible Library (`from`), it gets a back button to its book.
 */
export function StoryScreen({ unitId, from }: { unitId: string; from?: "library" }) {
  const { t } = useI18n();
  const pack = useContent();
  const progress = useProgress();
  const tierName = useTierName();
  const unit = unitFor(pack, unitId);
  if (!unit) return <NotFoundScreen />;
  const topic = findTopic(pack, unit.topicId)!;
  const book = findBook(pack, unit.bookId);
  const done = completedCount(progress, unit);

  const stops: RoadStop[] = unit.nodes.map((node, i) => {
    const status = nodeStatus(progress, unit, i);
    const cleared = node.kind === "activity" ? TIERS.filter((tier) => progress.tierClears[clearKey(node.activityId, tier)]) : [];
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
      icon: MODE_STYLE[nodeMode(pack, node)].icon,
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
    <Screen withTabs scene={storyScene(unit.id)} className="story">
      {from === "library" && book ? <TopBar title={book.name} back={{ name: "book", bookId: book.id }} /> : <AppHeader />}
      <section aria-labelledby={`${unit.id}-title`}>
        <div className="story-head">
          <div className="story-head__text">
            <span className="story-head__eyebrow">
              {t("path.story", { n: unit.number })} · {topic.passage}
            </span>
            <h1 id={`${unit.id}-title`} className="story-head__title">
              {topic.title}
            </h1>
            <span className="story-head__meta">{t("path.stops", { n: done, total: unit.nodes.length })}</span>
            <ProgressBar value={done} max={unit.nodes.length} label={t("path.stops", { n: done, total: unit.nodes.length })} size="sm" />
          </div>
          <Mascot mood={complete ? "celebrating" : "happy"} size={92} />
        </div>
        <JourneyRoad stops={stops} finish={{ name: t("path.storyDone"), won: complete }} />
      </section>
      <a className={`library-card${complete ? " is-won" : ""}`} href={href({ name: "library" })}>
        <span className="library-card__icon" aria-hidden="true">
          <Library size={26} strokeWidth={2.4} />
        </span>
        <span className="library-card__text">
          <span className="library-card__title">
            {complete ? t("library.storyFinished", { story: topic.title }) : t("library.title")}
          </span>
          <span className="library-card__meta">
            {book &&
              t("library.bookProgress", {
                book: book.name,
                ...bookProgress(progress, unitsOfBook(pack, book.id), pack.plannedStories.filter((s) => s.bookId === book.id).length),
              })}
          </span>
        </span>
        <ChevronRight size={20} className="faint" aria-hidden="true" />
      </a>
      <TabBar current="path" />
    </Screen>
  );
}
