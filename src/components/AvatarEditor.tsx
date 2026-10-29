import { Check, Lock } from "lucide-react";
import { useI18n, type MessageKey } from "../i18n";
import { COSMETIC_SLOTS, PRESENTATIONS, SKIN_TONES, type CosmeticSlot, type Presentation, type SkinTone } from "../progress/avatar";
import { COSMETICS, type CosmeticItem } from "../progress/cosmetics";
import { PlayerAvatar, SKIN, type LookDraft } from "./PlayerAvatar";

interface AvatarEditorProps {
  value: LookDraft;
  onChange: (next: LookDraft) => void;
}

/** Live preview plus the two basic choices: gender and skin tone. */
export function AvatarEditor({ value, onChange }: AvatarEditorProps) {
  const { t } = useI18n();
  return (
    <div className="avatar-editor">
      <div className="avatar-editor__preview">
        <PlayerAvatar look={value} size={128} label={t("avatar.preview")} />
      </div>

      <fieldset className="choice-group">
        <legend className="choice-group__legend">{t("avatar.gender")}</legend>
        <div className="segmented">
          {PRESENTATIONS.map((p: Presentation) => (
            <label key={p} className={`segmented__option${value.presentation === p ? " is-selected" : ""}`}>
              <input
                type="radio"
                name="avatar-presentation"
                className="sr-only"
                checked={value.presentation === p}
                onChange={() => onChange({ ...value, presentation: p })}
              />
              {t(`avatar.presentation.${p}`)}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="choice-group">
        <legend className="choice-group__legend">{t("avatar.skinTone")}</legend>
        <div className="swatches">
          {SKIN_TONES.map((tone: SkinTone) => (
            <label key={tone} className={`swatch${value.skin === tone ? " is-selected" : ""}`}>
              <input
                type="radio"
                name="avatar-skin"
                className="sr-only"
                checked={value.skin === tone}
                onChange={() => onChange({ ...value, skin: tone })}
              />
              <span className="swatch__dot" style={{ background: SKIN[tone].base }} aria-hidden="true">
                {value.skin === tone && <Check size={18} strokeWidth={3} />}
              </span>
              <span className="swatch__label">{t(`avatar.skin.${tone}`)}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

interface CosmeticSlotsProps {
  unlocked: string[];
  equipped?: Partial<Record<CosmeticSlot, string>>;
  /** Omit to show the slots read-only (onboarding). */
  onEquip?: (slot: CosmeticSlot, itemId: string | null) => void;
}

/**
 * Rewards reserved for later: robes, footwear and accessories unlocked with
 * XP. Placeholders are shown as "coming later"; XP requirements appear only
 * for items that have one configured.
 */
export function CosmeticSlots({ unlocked, equipped = {}, onEquip }: CosmeticSlotsProps) {
  const { t, number } = useI18n();
  const state = (item: CosmeticItem) =>
    item.placeholder
      ? t("avatar.comingLater")
      : item.unlock
        ? t("avatar.unlocksAt", { n: number(item.unlock.totalXp) })
        : t("avatar.locked");

  return (
    <section className="cosmetics" aria-labelledby="cosmetics-title">
      <h2 id="cosmetics-title" className="cosmetics__title">
        {t("avatar.moreTitle")}
      </h2>
      <p className="muted small">{t("avatar.moreBody")}</p>
      <ul className="cosmetics__slots">
        {COSMETIC_SLOTS.map((slot) => {
          const items = COSMETICS.filter((item) => item.slot === slot);
          return (
            <li key={slot} className="cosmetic-slot">
              <span className="cosmetic-slot__name">{t(`avatar.slots.${slot}`)}</span>
              <span className="cosmetic-slot__items">
                {onEquip && (
                  <button
                    type="button"
                    className={`cosmetic${!equipped[slot] ? " is-selected" : ""}`}
                    aria-pressed={!equipped[slot]}
                    onClick={() => onEquip(slot, null)}
                  >
                    {t("avatar.basic")}
                  </button>
                )}
                {items.map((item) => {
                  const owned = !item.placeholder && unlocked.includes(item.id);
                  const name = t(`avatar.items.${item.id}` as MessageKey);
                  return owned && onEquip ? (
                    <button
                      key={item.id}
                      type="button"
                      className={`cosmetic${equipped[slot] === item.id ? " is-selected" : ""}`}
                      aria-pressed={equipped[slot] === item.id}
                      onClick={() => onEquip(slot, item.id)}
                    >
                      {name}
                    </button>
                  ) : (
                    <span key={item.id} className="cosmetic is-locked">
                      <Lock size={14} strokeWidth={2.6} aria-hidden="true" />
                      <span>
                        {name} · {state(item)}
                      </span>
                    </span>
                  );
                })}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
