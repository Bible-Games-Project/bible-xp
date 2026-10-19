import { ChevronLeft, Flame, Gem, Gamepad2, House, Map, CircleUser, Crown } from "lucide-react";
import type { ReactNode } from "react";
import { href, navigate, type Route } from "../app/router";
import { useI18n } from "../i18n";
import { localDate } from "../lib/date";
import { useProgress } from "../progress/store";
import { displayedStreak } from "../progress/streak";
import { Avatar } from "./Avatar";

export function Screen({ children, withTabs, className = "" }: { children: ReactNode; withTabs?: boolean; className?: string }) {
  return <main className={`screen${withTabs ? " screen--tabs" : ""} ${className}`}>{children}</main>;
}

/** Header for secondary screens: back button and title. */
export function TopBar({ title, back, right }: { title: string; back: Route; right?: ReactNode }) {
  const { t } = useI18n();
  return (
    <header className="topbar">
      <button type="button" className="icon-btn" aria-label={t("nav.back")} onClick={() => navigate(back, { replace: true })}>
        <ChevronLeft size={28} strokeWidth={2.6} />
      </button>
      <h1 className="topbar__title">{title}</h1>
      <div className="topbar__right">{right}</div>
    </header>
  );
}

/** Header for the main tabs: profile, streak, XP and a discreet Plus entry. */
export function AppHeader() {
  const { t } = useI18n();
  const progress = useProgress();
  const streak = displayedStreak(progress.streak, localDate());
  const activeToday = progress.streak.lastActiveDate === localDate();
  return (
    <header className="app-header">
      <a className="app-header__avatar" href={href({ name: "profile" })} aria-label={t("header.profileLabel")}>
        <Avatar id={progress.profile.avatar} size={40} />
      </a>
      <div className="app-header__stats">
        <span className={`chip chip--streak${activeToday ? " is-active" : ""}`} aria-label={t("header.streakLabel", { n: streak })}>
          <Flame size={20} strokeWidth={2.6} fill={activeToday ? "currentColor" : "none"} aria-hidden="true" />
          {streak}
        </span>
        <span className="chip chip--xp" aria-label={t("header.xpLabel", { n: progress.xp })}>
          <Gem size={19} strokeWidth={2.6} aria-hidden="true" />
          {progress.xp}
        </span>
      </div>
      <a className="chip chip--plus" href={href({ name: "plus" })} aria-label={t("header.plusLabel")}>
        <Crown size={17} strokeWidth={2.6} aria-hidden="true" />
        {t("header.plus")}
      </a>
    </header>
  );
}

const TABS = [
  { route: { name: "home" } as Route, icon: House, key: "nav.home" as const },
  { route: { name: "path" } as Route, icon: Map, key: "nav.path" as const },
  { route: { name: "free" } as Route, icon: Gamepad2, key: "nav.free" as const },
  { route: { name: "profile" } as Route, icon: CircleUser, key: "nav.profile" as const },
];

export function TabBar({ current }: { current: Route["name"] }) {
  const { t } = useI18n();
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map(({ route, icon: Icon, key }) => {
        const active = route.name === current;
        return (
          <a key={route.name} href={href(route)} className={`tabbar__item${active ? " is-active" : ""}`} aria-current={active ? "page" : undefined}>
            <span className="tabbar__icon">
              <Icon size={26} strokeWidth={active ? 2.6 : 2.2} aria-hidden="true" />
            </span>
            <span className="tabbar__label">{t(key)}</span>
          </a>
        );
      })}
    </nav>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="section-title">
      <h2>{children}</h2>
      {action}
    </div>
  );
}
