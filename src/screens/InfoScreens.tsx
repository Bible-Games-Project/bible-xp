import { Check, Crown, Link2, Repeat, Sparkles, Swords, Timer, Users } from "lucide-react";
import { navigate } from "../app/router";
import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { Screen, TopBar } from "../components/Layout";
import { Mascot } from "../components/Mascot";
import { useI18n } from "../i18n";
import { useProgress } from "../progress/store";

export function MultiplayerScreen() {
  const { t } = useI18n();
  const { profile } = useProgress();
  return (
    <Screen>
      <TopBar title={t("multiplayer.title")} back={{ name: "home" }} />
      <section className="feature-hero feature-hero--violet">
        <span className="pill pill--light">{t("multiplayer.badge")}</span>
        <div className="duel" aria-hidden="true">
          <div className="duel__side">
            <Avatar id={profile.avatar} size={64} />
            <span>{t("multiplayer.you")}</span>
          </div>
          <div className="duel__vs">
            <Mascot mood="happy" size={92} />
            <span className="duel__badge">
              <Swords size={18} strokeWidth={2.8} /> VS
            </span>
          </div>
          <div className="duel__side">
            <span className="duel__unknown">
              <Users size={30} />
            </span>
            <span>{t("multiplayer.friend")}</span>
          </div>
        </div>
        <h1 className="feature-hero__title">{t("multiplayer.headline")}</h1>
        <p className="feature-hero__body">{t("multiplayer.body")}</p>
      </section>
      <ul className="card feature-list">
        <li>
          <Link2 size={20} aria-hidden="true" /> {t("multiplayer.feature1")}
        </li>
        <li>
          <Timer size={20} aria-hidden="true" /> {t("multiplayer.feature2")}
        </li>
        <li>
          <Repeat size={20} aria-hidden="true" /> {t("multiplayer.feature3")}
        </li>
      </ul>
      <p className="muted small center">{t("multiplayer.notice")}</p>
      <Button block onClick={() => navigate({ name: "train" })}>
        {t("multiplayer.cta")}
      </Button>
    </Screen>
  );
}

const PLUS_BENEFITS = ["noAds", "paths", "challenges", "stats", "review", "freeze"] as const;

export function PlusScreen() {
  const { t } = useI18n();
  return (
    <Screen>
      <TopBar title={t("plus.title")} back={{ name: "profile" }} />
      <section className="feature-hero feature-hero--plus">
        <span className="pill pill--light">{t("plus.badge")}</span>
        <span className="feature-hero__crown" aria-hidden="true">
          <Crown size={44} strokeWidth={2.2} />
        </span>
        <h1 className="feature-hero__title">{t("plus.headline")}</h1>
        <p className="feature-hero__body">{t("plus.body")}</p>
      </section>
      <ul className="card feature-list">
        {PLUS_BENEFITS.map((key) => (
          <li key={key}>
            <Check size={20} strokeWidth={3} className="text-green" aria-hidden="true" /> {t(`plus.benefits.${key}`)}
          </li>
        ))}
      </ul>
      <div className="price-card card">
        <Sparkles size={22} className="text-violet" aria-hidden="true" />
        <div>
          <p className="price-card__price">{t("plus.price")}</p>
          <p className="muted small">{t("plus.priceNote")}</p>
        </div>
      </div>
      <Button block variant="secondary" disabled>
        {t("plus.cta")}
      </Button>
      <p className="muted small center">{t("plus.notice")}</p>
    </Screen>
  );
}

function TextPage({ title, paragraphs, back }: { title: string; paragraphs: string[]; back: "settings" }) {
  return (
    <Screen>
      <TopBar title={title} back={{ name: back }} />
      <article className="card text-page">
        {paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </article>
    </Screen>
  );
}

export function AboutScreen() {
  const { t } = useI18n();
  return (
    <>
      <TextPage
        title={t("about.title")}
        back="settings"
        paragraphs={[t("about.body"), t("about.content"), t("about.translation"), t("about.explanations"), t("about.mascot")]}
      />
    </>
  );
}

export function PrivacyScreen() {
  const { t } = useI18n();
  return <TextPage title={t("privacy.title")} back="settings" paragraphs={[t("privacy.p1"), t("privacy.p2"), t("privacy.p3"), t("privacy.p4")]} />;
}

export function TermsScreen() {
  const { t } = useI18n();
  return <TextPage title={t("terms.title")} back="settings" paragraphs={[t("terms.p1"), t("terms.p2"), t("terms.p3")]} />;
}

export function NotFoundScreen() {
  const { t } = useI18n();
  return (
    <Screen>
      <div className="empty-state">
        <Mascot mood="thinking" size={150} />
        <h1 className="empty-state__title">{t("common.notFoundTitle")}</h1>
        <p className="muted">{t("common.notFoundBody")}</p>
        <Button block onClick={() => navigate({ name: "home" }, { replace: true })}>
          {t("common.backHome")}
        </Button>
      </div>
    </Screen>
  );
}
