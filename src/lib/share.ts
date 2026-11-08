import { SHARE_URL } from "../config/links";

export type ShareResult = "shared" | "copied" | "cancelled" | "failed";

/**
 * Shares the game with the system share sheet, or copies the link where there
 * is none (most desktop browsers). "cancelled" means the player closed the
 * sheet without sharing.
 */
export async function shareGame(title: string, text: string): Promise<ShareResult> {
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({ title, text, url: SHARE_URL });
      return "shared";
    } catch (error) {
      if ((error as Error)?.name === "AbortError") return "cancelled";
    }
  }
  try {
    await navigator.clipboard.writeText(`${text} ${SHARE_URL}`);
    return "copied";
  } catch {
    return "failed";
  }
}
