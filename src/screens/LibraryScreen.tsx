import { Check, Lock, Play } from "lucide-react";
import { href } from "../app/router";
import { Screen, TopBar } from "../components/Layout";
import { booksOf, isBookPlayable, unitsOfBook } from "../content";
import type { TestamentId } from "../content/types";
import { useContent } from "../content/useContent";
import { useI18n } from "../i18n";
import { bookProgress } from "../progress/path";
import { useProgress } from "../progress/store";

/**
 * The Bible Library: every book of both Testaments, with the stories finished
 * in each. Opened from Settings and from the end of each story's road.
 */
export function LibraryScreen() {
  const { t } = useI18n();
  const pack = useContent();
  const progress = useProgress();
  const open = pack.books.filter((b) => isBookPlayable(pack, b.id));
  const storiesDone = open.reduce(
    (n, b) => n + bookProgress(progress, unitsOfBook(pack, b.id), 0).done,
    0,
  );

  const testament = (id: TestamentId) => {
    const books = booksOf(pack, id);
    const groups = [...new Set(books.map((b) => b.group))];
    return (
      <section className="library__testament" aria-labelledby={`lib-${id}`}>
        <h2 id={`lib-${id}`} className="library__heading">
          {id === "ot" ? t("path.oldTestament") : t("path.newTestament")}
        </h2>
        {groups.map((group) => (
          <div key={group} className="book-group glass">
            <h3 className="section-heading">{pack.bookGroups[group]}</h3>
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
                  const p = bookProgress(
                    progress,
                    unitsOfBook(pack, book.id),
                    pack.plannedStories.filter((s) => s.bookId === book.id).length,
                  );
                  const complete = p.done === p.total;
                  return (
                    <li key={book.id} className={`book is-open${complete ? " is-complete" : ""}`}>
                      <a href={href({ name: "book", bookId: book.id })}>
                        {complete ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : <Play size={14} fill="currentColor" aria-hidden="true" />}
                        <span className="book__name">{book.name}</span>
                        <span className="book__meta">{t("library.storiesDone", { n: p.done, total: p.total })}</span>
                      </a>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </section>
    );
  };

  return (
    <Screen scene="bible">
      <TopBar title={t("library.title")} back={{ name: "settings" }} />
      <div className="glass library__summary">
        <p className="library__count">{t("library.summary", { n: storiesDone })}</p>
        <p className="muted small">{t("library.subtitle")}</p>
      </div>
      {testament("ot")}
      {testament("nt")}
    </Screen>
  );
}
