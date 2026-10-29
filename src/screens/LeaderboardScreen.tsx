import { CloudOff, FlaskConical, TriangleAlert, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { AppHeader, Screen, TabBar } from "../components/Layout";
import { PlayerAvatar } from "../components/PlayerAvatar";
import { useI18n } from "../i18n";
import { leaderboardService, type LeaderboardEntry, type WeeklyLeaderboard } from "../leaderboard/leaderboard";
import { useProgress } from "../progress/store";
import { weekEndUtc, weeklyXpAt, weekStartUtc } from "../progress/week";

type Load = { status: "loading" } | { status: "error" } | { status: "ready"; board: WeeklyLeaderboard };

/** The global weekly ranking, by Weekly XP. See leaderboard/leaderboard.ts for where data comes from. */
export function LeaderboardScreen({ sample }: { sample?: boolean }) {
  const { t, number, date } = useI18n();
  const progress = useProgress();
  const [now] = useState(() => new Date());
  const weekStart = weekStartUtc(now);
  const weeklyXp = weeklyXpAt(progress.weekly, now);
  const name = progress.profile.name.trim();
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const { playerId, look } = progress.profile;

  useEffect(() => {
    let live = true;
    setLoad({ status: "loading" });
    leaderboardService({ sample })
      .weekly(weekStart, { playerId, name, look, weeklyXp })
      .then((board) => live && setLoad({ status: "ready", board }))
      .catch(() => live && setLoad({ status: "error" }));
    return () => {
      live = false;
    };
  }, [sample, weekStart, playerId, name, look, weeklyXp, attempt]);

  const end = weekEndUtc(weekStart);
  const lastDay = new Date(end.getTime() - 1);
  const day = { day: "numeric", month: "short", timeZone: "UTC" } as const;

  const row = (entry: Pick<LeaderboardEntry, "playerId" | "name" | "look" | "weeklyXp"> & { rank: number | null }, mine: boolean) => (
    <li key={entry.playerId} className={`rank-row${mine ? " is-me" : ""}`} aria-current={mine ? "true" : undefined}>
      <span className="rank-row__rank">{entry.rank ?? "–"}</span>
      <PlayerAvatar look={entry.look} size={40} />
      <span className="rank-row__name">
        {mine ? (entry.name ? `${entry.name} (${t("leaderboard.you")})` : t("leaderboard.you")) : entry.name}
      </span>
      <span className="rank-row__xp">
        {number(entry.weeklyXp)} <small>XP</small>
      </span>
    </li>
  );

  return (
    <Screen withTabs scene="home" className="leaderboard">
      <AppHeader />
      <div className="glass leaderboard__head">
        <span className="leaderboard__icon" aria-hidden="true">
          <Trophy size={24} strokeWidth={2.4} />
        </span>
        <div>
          <h1 className="screen-title">{t("leaderboard.title")}</h1>
          <p className="muted small">{t("leaderboard.subtitle")}</p>
          <p className="leaderboard__week">{t("leaderboard.week", { start: date(new Date(`${weekStart}T00:00:00Z`), day), end: date(lastDay, day) })}</p>
          <p className="faint small">
            {t("leaderboard.resets", { when: date(end, { weekday: "long", hour: "numeric", minute: "2-digit" }) })}
          </p>
        </div>
      </div>

      {load.status === "loading" && (
        <div className="card leaderboard__state" role="status">
          <span className="skeleton" />
          <span className="skeleton" />
          <span className="skeleton" />
          <span className="sr-only">{t("leaderboard.loading")}</span>
        </div>
      )}

      {load.status === "error" && (
        <div className="card leaderboard__state" role="alert">
          <TriangleAlert size={24} aria-hidden="true" />
          <p>{t("leaderboard.error")}</p>
          <Button size="md" variant="secondary" onClick={() => setAttempt(attempt + 1)}>
            {t("leaderboard.retry")}
          </Button>
        </div>
      )}

      {load.status === "ready" && (
        <>
          {load.board.source === "local" && (
            <div className="banner banner--info">
              <CloudOff size={22} aria-hidden="true" />
              <span>
                <strong>{t("leaderboard.offlineTitle")}</strong> {t("leaderboard.offlineBody")}
              </span>
            </div>
          )}
          {load.board.source === "sample" && (
            <div className="banner banner--coral">
              <FlaskConical size={22} aria-hidden="true" />
              <span>
                <strong>{t("leaderboard.sampleTitle")}</strong> {t("leaderboard.sampleBody")}
              </span>
            </div>
          )}

          <section aria-labelledby="my-position">
            <h2 id="my-position" className="section-heading on-scene">
              {load.board.source === "local" ? t("leaderboard.yourWeek") : t("leaderboard.yourPosition")}
            </h2>
            <ol className="rank-list">{row(load.board.me, true)}</ol>
          </section>

          {load.board.source !== "local" &&
            (load.board.entries.length ? (
              <ol className="rank-list" aria-label={t("leaderboard.subtitle")}>
                {load.board.entries.map((entry) => row(entry, entry.playerId === playerId))}
              </ol>
            ) : (
              <div className="card leaderboard__state">
                <p>{t("leaderboard.empty")}</p>
              </div>
            ))}

          <p className="leaderboard__note">{t("leaderboard.scoring")}</p>
        </>
      )}
      <TabBar current="leaderboard" />
    </Screen>
  );
}
