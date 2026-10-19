import { useProgress } from "../progress/store";
import en, { type Messages } from "./locales/en";

/**
 * UI languages. Only languages with a complete translation are listed; the
 * others planned for the app will be added here (with their own messages file
 * and content pack) once they are fully translated.
 */
export interface Language {
  code: string;
  /** Name in the language itself. */
  nativeName: string;
  messages: Messages;
}

export const LANGUAGES: Language[] = [{ code: "en", nativeName: "English", messages: en }];

const FALLBACK = LANGUAGES[0];

export function getLanguage(code: string): Language {
  return LANGUAGES.find((l) => l.code === code) ?? FALLBACK;
}

type Join<K, P> = K extends string ? (P extends string ? `${K}.${P}` : never) : never;
type Paths<T> = {
  [K in keyof T]: T[K] extends string ? K : T[K] extends readonly string[] ? never : Join<K, Paths<T[K]>>;
}[keyof T];

export type MessageKey = Paths<Messages>;
export type Params = Record<string, string | number>;

function lookup(messages: Messages, key: string): unknown {
  return key.split(".").reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], messages);
}

export function translate(messages: Messages, key: MessageKey, params?: Params): string {
  const value = lookup(messages, key);
  const text = typeof value === "string" ? value : (lookup(FALLBACK.messages, key) as string | undefined) ?? key;
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
}

export function useI18n() {
  const { settings } = useProgress();
  const language = getLanguage(settings.language);
  const t = (key: MessageKey, params?: Params) => translate(language.messages, key, params);
  return { t, messages: language.messages, language };
}
