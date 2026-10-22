import { Lock, Play } from "lucide-react";
import { href } from "../app/router";
import { Screen, TabBar, TopBar } from "../components/Layout";
import { Scene } from "../components/Scene";
import { booksOf, isBookPlayable, unitsOfBook } from "../content";
import type { TestamentId } from "../content/types";
import { useContent } from "../content/useContent";
import { useI18n } from "../i18n";
import { completedCount } from "../progress/path";
import { useProgress } from "../progress/store";

/** All books of one Testament, by section. Only books with stories can be opened. */
export function TestamentScreen({ testament }: { testament: TestamentId }) {
  const { t } = useI18n();
  const pack = useContent();
  const progress = useProgress();
  const books = booksOf(pack, testament);
  const groups = [...new Set(books.map((b) => b.group))];
  const title = testament === "ot" ? t("path.oldTestament") : t("path.newTestament");

  return (
    <Screen withTabs className="screen--scene">
      <Scene name={testament === "ot" ? "old-testament" : "bible"} />
      <TopBar title={title} back={{ name: "path" }} />
      {groups.map((group) => (
        <section key={group} className="book-group glass" aria-label={pack.bookGroups[group]}>
          <h2 className="section-heading">{pack.bookGroups[group]}</h2>
          <ul className="book-grid">
            {books
              .filter((b) => b.group === group)
              .map((book) => {
                if (!isBookPlayable(pack, book.id)) {
                  return (
                    <li key={book.id} className="book is-locked" aria-label={`${book.name}, ${t("path.comingSoon")}`}>
                      <Lock size={14} aria-hidden="true" />
                      <span className="book__name">{book.name}</span>
                    </li>
                  );
                }
                const units = unitsOfBook(pack, book.id);
                const done = units.filter((u) => completedCount(progress, u) === u.nodes.length).length;
                return (
                  <li key={book.id} className="book is-open">
                    <a href={href({ name: "book", bookId: book.id })}>
                      <Play size={14} fill="currentColor" aria-hidden="true" />
                      <span className="book__name">{book.name}</span>
                      <span className="book__meta">
                        {done}/{units.length + pack.plannedStories.filter((s) => s.bookId === book.id).length}
                      </span>
                    </a>
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
      <TabBar current="path" />
    </Screen>
  );
}
