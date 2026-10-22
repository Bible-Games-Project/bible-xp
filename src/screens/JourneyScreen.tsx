import { BookOpen, ChevronRight, Lock } from "lucide-react";
import { href } from "../app/router";
import { AppHeader, Screen, TabBar } from "../components/Layout";
import { Scene } from "../components/Scene";
import { booksOf, isBookPlayable } from "../content";
import type { TestamentId } from "../content/types";
import { useContent } from "../content/useContent";
import { useI18n } from "../i18n";

/** The Journey: the two Testaments over the panorama of the Bible. */
export function JourneyScreen() {
  const { t } = useI18n();
  const pack = useContent();

  const card = (testament: TestamentId) => {
    const books = booksOf(pack, testament);
    const open = books.filter((b) => isBookPlayable(pack, b.id)).length;
    const name = testament === "ot" ? t("path.oldTestament") : t("path.newTestament");
    const range = testament === "ot" ? t("path.otRange") : t("path.ntRange");
    return (
      <a className={`testament${open ? "" : " is-soon"}`} href={href({ name: "testament", testament })}>
        <span className="testament__icon" aria-hidden="true">
          {open ? <BookOpen size={26} strokeWidth={2.4} /> : <Lock size={24} strokeWidth={2.4} />}
        </span>
        <span className="testament__text">
          <span className="testament__name">{name}</span>
          <span className="testament__meta">
            {t("path.books", { n: books.length })} · {range}
          </span>
          <span className={`pill ${open ? "pill--gold" : ""}`}>
            {open ? t("path.openBooks", { n: open, total: books.length }) : t("path.comingSoon")}
          </span>
        </span>
        <ChevronRight size={22} className="faint" aria-hidden="true" />
      </a>
    );
  };

  return (
    <Screen withTabs className="screen--scene journey">
      <Scene name="bible" />
      <AppHeader />
      <div className="glass">
        <h1 className="screen-title">{t("path.title")}</h1>
        <p className="muted">{t("path.subtitle")}</p>
      </div>
      <div className="journey__testaments">
        {card("ot")}
        {card("nt")}
      </div>
      <TabBar current="path" />
    </Screen>
  );
}
