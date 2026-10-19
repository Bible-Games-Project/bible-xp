import {
  ALargeSmall,
  Bird,
  BookOpenText,
  CircleQuestionMark,
  Cloud,
  Fish,
  Heart,
  Leaf,
  Link2,
  ListOrdered,
  Moon,
  Mountain,
  PawPrint,
  ScrollText,
  Sparkles,
  Sprout,
  Stars,
  Sun,
  User,
  UserSearch,
  Waves,
  type LucideIcon,
} from "lucide-react";
import type { GameMode, IconName } from "../content/types";

export const CONTENT_ICONS: Record<IconName, LucideIcon> = {
  sun: Sun,
  moon: Moon,
  stars: Stars,
  cloud: Cloud,
  waves: Waves,
  mountain: Mountain,
  sprout: Sprout,
  bird: Bird,
  fish: Fish,
  paw: PawPrint,
  user: User,
  heart: Heart,
  sparkles: Sparkles,
  leaf: Leaf,
};

export type Accent = "gold";

/** Each game mode is told apart by its icon; colour is kept for meaning (tiers, states). */
export const MODE_STYLE: Record<GameMode | "intro", { icon: LucideIcon; accent: Accent }> = {
  intro: { icon: BookOpenText, accent: "gold" },
  "form-word": { icon: ALargeSmall, accent: "gold" },
  "match-pairs": { icon: Link2, accent: "gold" },
  quiz: { icon: CircleQuestionMark, accent: "gold" },
  "complete-verse": { icon: ScrollText, accent: "gold" },
  "story-order": { icon: ListOrdered, accent: "gold" },
  "who-am-i": { icon: UserSearch, accent: "gold" },
};
