import { AvatarEditor, CosmeticSlots } from "../components/AvatarEditor";
import { Screen, TopBar } from "../components/Layout";
import { useI18n } from "../i18n";
import { progressActions, useProgress } from "../progress/store";

/** Edit the avatar chosen during onboarding. Every change is saved at once. */
export function AvatarScreen() {
  const { t } = useI18n();
  const { profile, cosmetics } = useProgress();
  const look = profile.look ?? { presentation: "male" as const, skin: "brown" as const, equipped: {} };

  return (
    <Screen scene="home" className="avatar-screen">
      <TopBar title={t("avatar.title")} back={{ name: "profile" }} />
      <section className="glass onboarding__panel">
        <AvatarEditor
          value={look}
          onChange={(next) => {
            if (next.presentation && next.skin) progressActions.setLook({ ...look, presentation: next.presentation, skin: next.skin });
          }}
        />
      </section>
      <div className="glass onboarding__panel">
        <CosmeticSlots
          unlocked={cosmetics.unlocked}
          equipped={look.equipped}
          onEquip={(slot, itemId) => {
            const equipped = { ...look.equipped };
            if (itemId) equipped[slot] = itemId;
            else delete equipped[slot];
            progressActions.setLook({ ...look, equipped });
          }}
        />
      </div>
    </Screen>
  );
}
