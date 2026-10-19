import type { Tier } from "../content/types";
import { TIERS } from "../content/types";
import { useI18n, type MessageKey } from "../i18n";

/** Translation keys for a tier's name and description. */
export const tierKey = (tier: Tier, field: "name" | "description") => `tiers.${tier}.${field}` as MessageKey;

export function useTierName() {
  const { t } = useI18n();
  return (tier: Tier) => t(tierKey(tier, "name"));
}

export function TierBadge({ tier }: { tier: Tier }) {
  const name = useTierName();
  return (
    <span className={`tier-badge tier-${tier}`}>
      <span className="tier-badge__gem" aria-hidden="true" />
      {name(tier)}
    </span>
  );
}

/** Five small gems: lit for each tier a game has been cleared at. */
export function TierPips({ cleared, label }: { cleared: (tier: Tier) => boolean; label: string }) {
  return (
    <span className="tier-pips" role="img" aria-label={label}>
      {TIERS.map((tier) => (
        <span key={tier} className={`tier-pip tier-${tier}${cleared(tier) ? " is-on" : ""}`} />
      ))}
    </span>
  );
}
