import { ChevronRight, Lock } from "lucide-react";
import { href } from "../app/router";
import { Screen, TabBar, TopBar } from "../components/Layout";
import { ProgressBar } from "../components/ProgressBar";
import { findBook, findTopic, unitsOfBook } from "../content";
import { useContent } from "../content/useContent";
import { useI18n } from "../i18n";
import { completedCount } from "../progress/path";
import { useProgress } from "../progress/store";
import { NotFoundScreen } from "./InfoScreens";

/** The stories of one book: playable ones first, then those still to come. */
export function BookScreen({ bookId }: { bookId: string }) {
  const { t } = useI18n();
  const pack = useContent();
  const progress = useProgress();
  const book = findBook(pack, bookId);
  if (!book) return <NotFoundScreen />;
  const units = unitsOfBook(pack, bookId);
  const planned = pack.plannedStories.filter((s) => s.bookId === bookId);
  const total = units.length + planned.length;

  return (
    <Screen withTabs scene={book.testament === "ot" ? "old-testament" : "bible"}>
      <TopBar title={t("library.title")} back={{ name: "library" }} />
      <div className="glass book-head">
        <span className="eyebrow">{pack.bookGroups[book.group]}</span>
        <h1 className="screen-title">{book.name}</h1>
        <p className="muted small">{t("path.storiesOpen", { n: units.length, total })}</p>
      </div>

      <ol className="stories">
        {units.map((unit) => {
          const topic = findTopic(pack, unit.topicId)!;
          const done = completedCount(progress, unit);
          const started = done > 0;
          return (
            <li key={unit.id}>
              <a className="tale-card" href={href({ name: "story", unitId: unit.id, from: "library" })}>
                <span className="tale-card__num">{unit.number}</span>
                <span className="tale-card__text">
                  <span className="tale-card__title">{topic.title}</span>
                  <span className="tale-card__meta">
                    {topic.passage} · {t("path.stops", { n: done, total: unit.nodes.length })}
                  </span>
                  <ProgressBar value={done} max={unit.nodes.length} label={t("path.stops", { n: done, total: unit.nodes.length })} size="sm" />
                </span>
                <span className="tale-card__go">{started ? t("path.continue") : t("path.start")}</span>
                <ChevronRight size={20} className="faint" aria-hidden="true" />
              </a>
            </li>
          );
        })}
        {planned.map((story, i) => (
          <li key={story.title} className="tale-card is-locked" aria-label={`${story.title}, ${t("path.comingSoon")}`}>
            <span className="tale-card__num">{units.length + i + 1}</span>
            <span className="tale-card__text">
              <span className="tale-card__title">{story.title}</span>
              <span className="tale-card__meta">{story.passage}</span>
            </span>
            <span className="pill">
              <Lock size={12} aria-hidden="true" /> {t("path.comingSoon")}
            </span>
          </li>
        ))}
      </ol>
      <TabBar current="path" />
    </Screen>
  );
}
