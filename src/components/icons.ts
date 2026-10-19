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

export type Accent = "green" | "blue" | "yellow" | "coral" | "violet";

/** Visual identity of each game mode, used everywhere a mode is shown. */
export const MODE_STYLE: Record<GameMode | "intro", { icon: LucideIcon; accent: Accent }> = {
  intro: { icon: BookOpenText, accent: "green" },
  "form-word": { icon: ALargeSmall, accent: "blue" },
  "match-pairs": { icon: Link2, accent: "coral" },
  quiz: { icon: CircleQuestionMark, accent: "violet" },
  "complete-verse": { icon: BookOpenText, accent: "yellow" },
  "story-order": { icon: ListOrdered, accent: "green" },
  "who-am-i": { icon: UserSearch, accent: "blue" },
};
