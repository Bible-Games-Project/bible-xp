import { useEffect, useState } from "react";
import { CharacterPicker } from "../components/CharacterPicker";
import { Screen, TopBar } from "../components/Layout";
import { useI18n } from "../i18n";
import { STARTING_CHARACTER } from "../progress/characters";
import { getProgress, progressActions, unlockedCharacters, useProgress } from "../progress/store";

/** Choose the Bible character the player appears as. Every change is saved at once. */
export function AvatarScreen() {
  const { t } = useI18n();
  const { profile } = useProgress();
  const look = profile.look ?? { character: STARTING_CHARACTER.male, equipped: {} };
  // Characters unlocked since the last visit keep their "New" badge while the screen is open.
  const [fresh] = useState(() => {
    const seen = new Set(getProgress().charactersSeen);
    return unlockedCharacters().filter((id) => !seen.has(id));
  });

  useEffect(() => {
    progressActions.markCharactersSeen();
  }, []);

  return (
    <Screen scene="home" className="avatar-screen">
      <TopBar title={t("avatar.title")} back={{ name: "profile" }} />
      <section className="glass onboarding__panel">
        <p className="muted">{t("avatar.body")}</p>
        <CharacterPicker
          selected={look.character}
          fresh={fresh}
          onSelect={(character) => progressActions.setLook({ ...look, character })}
        />
      </section>
    </Screen>
  );
}
