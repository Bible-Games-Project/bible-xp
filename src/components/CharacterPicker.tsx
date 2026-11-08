import { Check, Crown, Lock, Share2, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { href } from "../app/router";
import { useContent } from "../content/useContent";
import { useI18n } from "../i18n";
import { CHARACTERS, GENDERS, findCharacter, isUnlocked, type Character, type Gender } from "../progress/characters";
import { characterUnlocks, progressActions, useProgress } from "../progress/store";
import { shareGame } from "../lib/share";
import { PlayerAvatar } from "./PlayerAvatar";

interface CharacterPickerProps {
  selected: string;
  onSelect: (id: string) => void;
  /** Unlocked characters the player had not seen before opening the screen. */
  fresh?: string[];
}

/**
 * The avatar choice: every Bible character, men and women in Bible order.
 * Unlocked ones can be chosen; locked ones say who they are and what unlocks
 * them.
 */
export function CharacterPicker({ selected, onSelect, fresh = [] }: CharacterPickerProps) {
  const { t, number } = useI18n();
  const pack = useContent();
  const progress = useProgress();
  const unlocks = useMemo(() => characterUnlocks(progress), [progress]);
  const current = findCharacter(selected);
  const [gender, setGender] = useState<Gender>(current?.gender ?? "male");
  const [shareNote, setShareNote] = useState<string | null>(null);
  const unlockedCount = CHARACTERS.filter((c) => isUnlocked(c, unlocks)).length;
  const text = (id: string) => pack.characters[id] ?? { name: id, about: "" };

  const share = async () => {
    const result = await shareGame(t("avatar.shareTitle"), t("avatar.shareText"));
    if (result === "shared" || result === "copied") progressActions.markShared();
    setShareNote(result === "copied" ? t("avatar.linkCopied") : result === "failed" ? t("avatar.shareFailed") : null);
  };

  const requirement = (c: Character): string => {
    const rule = c.unlock;
    switch (rule.kind) {
      case "story": {
        const story = pack.units.find((u) => u.id === rule.story)?.title ?? pack.plannedStories.find((s) => s.id === rule.story)?.title;
        return t("avatar.requirement.story", { name: story ?? rule.story });
      }
      case "book":
        return t("avatar.requirement.book", { name: pack.books.find((b) => b.id === rule.book)?.name ?? rule.book });
      case "streak":
        return text(c.id).why ?? t("avatar.requirement.streak", { n: number(rule.days) });
      case "share":
        return text(c.id).why ?? t("avatar.requirement.share");
      case "plus":
        return t("avatar.requirement.plus");
      default:
        return "";
    }
  };

  return (
    <div className="character-picker">
      {current && (
        <div className="character-picker__current">
          <span className="character-picker__portrait">
            <PlayerAvatar look={{ character: current.id }} size={112} label={t("avatar.preview")} />
          </span>
          <span className="character-picker__name">{text(current.id).name}</span>
          <span className="character-picker__about">{text(current.id).about}</span>
        </div>
      )}

      <p className="character-picker__count">
        {t("avatar.count", { n: number(unlockedCount), total: number(CHARACTERS.length) })}
      </p>

      <div className="segmented" role="tablist" aria-label={t("avatar.title")}>
        {GENDERS.map((g) => (
          <button
            key={g}
            type="button"
            role="tab"
            aria-selected={gender === g}
            className={`segmented__option${gender === g ? " is-selected" : ""}`}
            onClick={() => setGender(g)}
          >
            {t(`avatar.gender.${g}`)}
          </button>
        ))}
      </div>

      <ul className="character-list">
        {CHARACTERS.filter((c) => c.gender === gender).map((c) => {
          const open = isUnlocked(c, unlocks);
          const chosen = c.id === selected;
          const { name, about } = text(c.id);
          const body = (
            <>
              <PlayerAvatar look={{ character: c.id }} size={56} locked={!open} className="character-row__avatar" />
              <span className="character-row__text">
                <span className="character-row__name">
                  {name}
                  {open && fresh.includes(c.id) && (
                    <span className="character-row__new">
                      <Sparkles size={12} strokeWidth={2.8} aria-hidden="true" /> {t("avatar.new")}
                    </span>
                  )}
                </span>
                <span className="character-row__about">{about}</span>
                {!open && (
                  <span className={`character-row__req${c.unlock.kind === "plus" ? " is-plus" : ""}`}>
                    {c.unlock.kind === "plus" ? <Crown size={14} strokeWidth={2.6} aria-hidden="true" /> : <Lock size={14} strokeWidth={2.6} aria-hidden="true" />}
                    <span>{requirement(c)}</span>
                  </span>
                )}
              </span>
            </>
          );
          return (
            <li key={c.id}>
              {open ? (
                <button
                  type="button"
                  className={`character-row${chosen ? " is-selected" : ""}`}
                  aria-pressed={chosen}
                  onClick={() => onSelect(c.id)}
                >
                  {body}
                  <span className="option-card__check" aria-hidden="true">
                    {chosen && <Check size={18} strokeWidth={3.2} />}
                  </span>
                </button>
              ) : (
                <div className="character-row is-locked">
                  {body}
                  {c.unlock.kind === "share" && (
                    <button type="button" className="character-row__action" onClick={share}>
                      <Share2 size={16} strokeWidth={2.6} aria-hidden="true" /> {t("avatar.share")}
                    </button>
                  )}
                  {c.unlock.kind === "plus" && (
                    <a className="character-row__action" href={href({ name: "plus" })}>
                      {t("avatar.plusLink")}
                    </a>
                  )}
                </div>
              )}
              {c.unlock.kind === "share" && !open && shareNote && (
                <p className="character-row__note" role="status">
                  {shareNote}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
