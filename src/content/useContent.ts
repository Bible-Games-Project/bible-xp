import { useI18n } from "../i18n";
import { getContent } from "./index";

/** The content pack for the current language. */
export function useContent() {
  const { language } = useI18n();
  return getContent(language.code);
}
