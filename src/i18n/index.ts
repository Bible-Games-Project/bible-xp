import { useProgress } from "../progress/store";
import en, { type Messages } from "./locales/en";

/**
 * UI languages. Only languages with a complete translation are listed (today:
 * English). Testalume is planned in 12 languages; each one is added here once
 * it is fully translated, with no change to screens or game logic:
 *   1. src/i18n/locales/<code>.ts exporting a `Messages` object (the type
 *      makes the compiler list every missing string);
 *   2. a content pack for that language (src/content, verified Bible text);
 *   3. an entry below. Onboarding and Settings list whatever is here.
 * Never list a language before it is complete, and never machine-translate.
 */
export interface Language {
  /** Stored in settings.language; a BCP 47 code ("en", later e.g. "es", "pt-BR"). */
  code: string;
  /** Name in the language itself. */
  nativeName: string;
  /** Text direction, for right-to-left languages added later. */
  dir: "ltr" | "rtl";
  messages: Messages;
}

export const LANGUAGES: Language[] = [{ code: "en", nativeName: "English", dir: "ltr", messages: en }];

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

/** Numbers in the language's own format (1,234 in English). */
export function formatNumber(code: string, n: number): string {
  return new Intl.NumberFormat(code).format(n);
}

/** Dates and times in the language's own format, in the device's time zone. */
export function formatDate(code: string, date: Date, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(code, options).format(date);
}

export function useI18n() {
  const { settings } = useProgress();
  const language = getLanguage(settings.language);
  const t = (key: MessageKey, params?: Params) => translate(language.messages, key, params);
  return {
    t,
    messages: language.messages,
    language,
    number: (n: number) => formatNumber(language.code, n),
    date: (d: Date, options: Intl.DateTimeFormatOptions) => formatDate(language.code, d, options),
  };
}
