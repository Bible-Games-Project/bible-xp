import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { navigate } from "../app/router";
import { Button } from "../components/Button";
import { Screen } from "../components/Layout";
import { Mascot } from "../components/Mascot";
import { PlayerAvatar } from "../components/PlayerAvatar";
import { useTierName } from "../components/Tier";
import { useContent } from "../content/useContent";
import { LANGUAGES, useI18n } from "../i18n";
import { KNOWLEDGE_LEVELS, knowledgeForTier, tierForKnowledge, type KnowledgeLevel } from "../progress/avatar";
import { CHARACTERS, STARTING_CHARACTER } from "../progress/characters";
import { progressActions, unlockedCharacters, useProgress } from "../progress/store";

const STEPS = 3;

/**
 * First-time setup, shown until it is completed: language, Bible knowledge
 * level, avatar. Choices are kept here until "Start learning" saves them all
 * at once, so a half-finished setup never leaves a half-saved profile.
 */
export function OnboardingScreen() {
  const { t, number } = useI18n();
  const pack = useContent();
  const tierName = useTierName();
  const progress = useProgress();
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState(LANGUAGES.some((l) => l.code === progress.settings.language) ? progress.settings.language : LANGUAGES[0].code);
  // A returning player keeps the level matching the difficulty they play at.
  const playedBefore = progress.xp > 0;
  const [knowledge, setKnowledge] = useState<KnowledgeLevel | null>(
    progress.profile.knowledge ?? (playedBefore ? knowledgeForTier(progress.difficulty.selected) : null),
  );
  const [character, setCharacter] = useState<string | null>(progress.profile.look?.character ?? null);
  // Everyone starts as Adam or Eve; a returning player also sees the character they wear.
  const choices = [...new Set([...Object.values(STARTING_CHARACTER), ...(character ? [character] : [])])].filter((id) =>
    unlockedCharacters(progress).includes(id),
  );
  const heading = useRef<HTMLHeadingElement>(null);

  // Each step starts at the top, with its title announced to screen readers.
  useEffect(() => {
    window.scrollTo(0, 0);
    heading.current?.focus();
  }, [step]);

  const finish = () => {
    if (!knowledge || !character) return;
    progressActions.completeOnboarding({
      language,
      knowledge,
      look: { character, equipped: progress.profile.look?.equipped ?? {} },
    });
    navigate({ name: "home" }, { replace: true });
  };

  const avatarReady = Boolean(character);

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
        <section className="glass onboarding__panel" aria-labelledby="avatar-title">
          <h1 id="avatar-title" className="onboarding__title" ref={heading} tabIndex={-1}>
            {t("onboarding.avatarTitle")}
          </h1>
          <p className="muted">{t("onboarding.avatarBody")}</p>
          <div className="option-list" role="radiogroup" aria-labelledby="avatar-title">
            {choices.map((id) => {
              const text = pack.characters[id];
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={character === id}
                  className={`option-card option-card--character${character === id ? " is-selected" : ""}`}
                  onClick={() => setCharacter(id)}
                >
                  <PlayerAvatar look={{ character: id }} size={72} />
                  <span className="option-card__text">
                    <span className="option-card__name">{text?.name ?? id}</span>
                    <span className="option-card__desc">{text?.about}</span>
                  </span>
                  <span className="option-card__check" aria-hidden="true">
                    {character === id && <Check size={18} strokeWidth={3.2} />}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="muted small">{t("onboarding.avatarMore", { total: number(CHARACTERS.length) })}</p>
        </section>
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
