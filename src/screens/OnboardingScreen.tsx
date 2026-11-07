import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { navigate } from "../app/router";
import { AvatarEditor, CosmeticSlots } from "../components/AvatarEditor";
import { Button } from "../components/Button";
import { Screen } from "../components/Layout";
import { Mascot } from "../components/Mascot";
import type { LookDraft } from "../components/PlayerAvatar";
import { useTierName } from "../components/Tier";
import { LANGUAGES, useI18n } from "../i18n";
import { KNOWLEDGE_LEVELS, knowledgeForTier, tierForKnowledge, type KnowledgeLevel } from "../progress/avatar";
import { progressActions, useProgress } from "../progress/store";

const STEPS = 3;

/**
 * First-time setup, shown until it is completed: language, Bible knowledge
 * level, avatar. Choices are kept here until "Start learning" saves them all
 * at once, so a half-finished setup never leaves a half-saved profile.
 */
export function OnboardingScreen() {
  const { t } = useI18n();
  const tierName = useTierName();
  const progress = useProgress();
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState(LANGUAGES.some((l) => l.code === progress.settings.language) ? progress.settings.language : LANGUAGES[0].code);
  // A returning player keeps the level matching the difficulty they play at.
  const playedBefore = progress.xp > 0;
  const [knowledge, setKnowledge] = useState<KnowledgeLevel | null>(
    progress.profile.knowledge ?? (playedBefore ? knowledgeForTier(progress.difficulty.selected) : null),
  );
  const [look, setLook] = useState<LookDraft>({
    presentation: progress.profile.look?.presentation ?? null,
    skin: progress.profile.look?.skin ?? null,
  });
  const heading = useRef<HTMLHeadingElement>(null);

  // Each step starts at the top, with its title announced to screen readers.
  useEffect(() => {
    window.scrollTo(0, 0);
    heading.current?.focus();
  }, [step]);

  const finish = () => {
    if (!knowledge || !look.presentation || !look.skin) return;
    progressActions.completeOnboarding({
      language,
      knowledge,
      look: { presentation: look.presentation, skin: look.skin, equipped: progress.profile.look?.equipped ?? {} },
    });
    navigate({ name: "home" }, { replace: true });
  };

  const avatarReady = Boolean(look.presentation && look.skin);

  return (
    <Screen scene="home" className="onboarding">
      <div className="onboarding__progress" aria-hidden="true">
        {Array.from({ length: STEPS }, (_, i) => (
          <span key={i} className={`onboarding__dot${i <= step ? " is-done" : ""}`} />
        ))}
      </div>
      <p className="onboarding__step">{t("onboarding.step", { n: step + 1, total: STEPS })}</p>

      {step === 0 && (
        <>
          <section className="onboarding__welcome">
            <Mascot mood="happy" size={104} />
            <div className="glass onboarding__hello">
              <h1 className="onboarding__title" ref={heading} tabIndex={-1}>
                {t("onboarding.welcome")}
              </h1>
              <p className="muted">{t("onboarding.welcomeBody")}</p>
            </div>
          </section>
          <section className="glass onboarding__panel" aria-labelledby="language-title">
            <h2 id="language-title" className="onboarding__subtitle">
              {t("onboarding.languageTitle")}
            </h2>
            <div className="option-list" role="radiogroup" aria-labelledby="language-title">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  role="radio"
                  aria-checked={language === l.code}
                  lang={l.code}
                  className={`option-card${language === l.code ? " is-selected" : ""}`}
                  onClick={() => setLanguage(l.code)}
                >
                  <span className="option-card__text">
                    <span className="option-card__name">{l.nativeName}</span>
                  </span>
                  <span className="option-card__check" aria-hidden="true">
                    {language === l.code && <Check size={18} strokeWidth={3.2} />}
                  </span>
                </button>
              ))}
            </div>
            <p className="muted small">{t("onboarding.languageBody")}</p>
          </section>
        </>
      )}

      {step === 1 && (
        <section className="glass onboarding__panel" aria-labelledby="level-title">
          <h1 id="level-title" className="onboarding__title" ref={heading} tabIndex={-1}>
            {t("onboarding.levelTitle")}
          </h1>
          <p className="muted">{t("onboarding.levelBody")}</p>
          <div className="option-list" role="radiogroup" aria-labelledby="level-title">
            {KNOWLEDGE_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                role="radio"
                aria-checked={knowledge === level}
                className={`option-card${knowledge === level ? " is-selected" : ""}`}
                onClick={() => setKnowledge(level)}
              >
                <span className="option-card__text">
                  <span className="option-card__name">{t(`knowledge.${level}.name`)}</span>
                  <span className="option-card__desc">{t(`knowledge.${level}.description`)}</span>
                  <span className="option-card__meta">
                    {t("onboarding.levelStarts", { tier: tierName(tierForKnowledge(level, progress.difficulty.selected)) })}
                  </span>
                </span>
                <span className="option-card__check" aria-hidden="true">
                  {knowledge === level && <Check size={18} strokeWidth={3.2} />}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 2 && (
        <>
          <section className="glass onboarding__panel" aria-labelledby="avatar-title">
            <h1 id="avatar-title" className="onboarding__title" ref={heading} tabIndex={-1}>
              {t("onboarding.avatarTitle")}
            </h1>
            <p className="muted">{t("onboarding.avatarBody")}</p>
            <AvatarEditor value={look} onChange={setLook} />
          </section>
          <div className="glass onboarding__panel">
            <CosmeticSlots unlocked={progress.cosmetics.unlocked} />
          </div>
        </>
      )}

      <div className="onboarding__actions">
        {step === 1 && !knowledge && <p className="onboarding__hint">{t("onboarding.levelRequired")}</p>}
        {step === 2 && !avatarReady && <p className="onboarding__hint">{t("onboarding.avatarRequired")}</p>}
        <div className="onboarding__buttons">
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep(step - 1)}>
              {t("onboarding.back")}
            </Button>
          )}
          {step < STEPS - 1 ? (
            <Button disabled={step === 1 && !knowledge} onClick={() => setStep(step + 1)}>
              {t("onboarding.continue")}
            </Button>
          ) : (
            <Button disabled={!avatarReady} onClick={finish}>
              {t("onboarding.start")}
            </Button>
          )}
        </div>
      </div>
    </Screen>
  );
}
