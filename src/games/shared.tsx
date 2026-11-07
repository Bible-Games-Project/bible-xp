import type { ReactNode } from "react";

/** Bottom action area of a game; the feedback panel slides over it. */
export function GameFooter({ children }: { children: ReactNode }) {
  return <div className="game-footer">{children}</div>;
}

/** The card a step's question, clue or verse sits on. */
export function PromptCard({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "verse" | "clue" }) {
  return <div className={`prompt-card prompt-card--${tone}`}>{children}</div>;
}
