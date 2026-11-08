import type { Unit } from "../content/types";
import type { ProgressData } from "./model";

/*
 * The avatars: Bible characters the player can be. Adam and Eve are open from
 * the start; every other character is unlocked by the Journey, a daily streak,
 * sharing the game, or (later) Testalume Plus. Names and descriptions live in
 * the content locale (`src/content/locales/<lang>/characters.ts`); portraits
 * in `src/assets/characters/<id>.webp` (see docs/avatar-art.md). A character
 * without a portrait yet shows a silhouette.
 *
 * Special unlocks are tied to the story of the character (Joshua marched
 * around Jericho for seven days, Andrew brought his brother to Jesus...), so
 * pick characters known for the thing the requirement asks for.
 *
 * Unlocks are worked out from the player's progress every time instead of
 * being stored, so they can never get out of step with it.
 */

export type Gender = "male" | "female";
export const GENDERS: Gender[] = ["male", "female"];

export type CharacterUnlock =
  /** Open from the start. */
  | { kind: "start" }
  /** Finish this Journey story (a unit id, or the id of a planned story). */
  | { kind: "story"; story: string }
  /** Finish every story of this book in the Journey. */
  | { kind: "book"; book: string }
  /** Reach this many days in a row (best streak ever). */
  | { kind: "streak"; days: number }
  /** Share the game with someone. */
  | { kind: "share" }
  /** Only with Testalume Plus. */
  | { kind: "plus" };

export interface Character {
  id: string;
  gender: Gender;
  unlock: CharacterUnlock;
}

/** The character a player is shown as before choosing, and after a reset. */
export const STARTING_CHARACTER: Record<Gender, string> = { male: "adam", female: "eve" };

/** What unlocks depend on, gathered from progress and the Journey's content. */
export interface UnlockState {
  bestStreak: number;
  shared: boolean;
  plus: boolean;
  storyDone: (id: string) => boolean;
  bookDone: (book: string) => boolean;
}

export interface JourneyStories {
  units: Unit[];
  /** Announced stories: their book can't be finished until they exist. */
  planned: { id: string; bookId: string }[];
}

export function unlockState(data: ProgressData, journey: JourneyStories, plus = false): UnlockState {
  const unitDone = (unit: Unit) => Boolean(data.unitsCompleted[unit.id]);
  return {
    bestStreak: data.streak.best,
    shared: Boolean(data.sharedAt),
    plus,
    storyDone: (id) => journey.units.some((u) => u.id === id && unitDone(u)),
    bookDone: (book) => {
      const units = journey.units.filter((u) => u.bookId === book);
      return units.length > 0 && !journey.planned.some((s) => s.bookId === book) && units.every(unitDone);
    },
  };
}

export function isUnlocked(character: Character, state: UnlockState): boolean {
  const rule = character.unlock;
  switch (rule.kind) {
    case "start":
      return true;
    case "story":
      return state.storyDone(rule.story);
    case "book":
      return state.bookDone(rule.book);
    case "streak":
      return state.bestStreak >= rule.days;
    case "share":
      return state.shared;
    case "plus":
      return state.plus;
  }
}

export function findCharacter(id: string | null | undefined): Character | undefined {
  return id ? CHARACTERS.find((c) => c.id === id) : undefined;
}

export function isCharacterId(id: unknown): id is string {
  return typeof id === "string" && CHARACTERS.some((c) => c.id === id);
}

export function unlockedIds(state: UnlockState): string[] {
  return CHARACTERS.filter((c) => isUnlocked(c, state)).map((c) => c.id);
}

export const CHARACTERS: Character[] = [
  // Men, in Bible order
  { id: "adam", gender: "male", unlock: { kind: "start" } },
  { id: "cain", gender: "male", unlock: { kind: "story", story: "gen-cain-abel" } },
  { id: "abel", gender: "male", unlock: { kind: "story", story: "gen-cain-abel" } },
  { id: "seth", gender: "male", unlock: { kind: "story", story: "gen-cain-abel" } },
  { id: "enoch", gender: "male", unlock: { kind: "streak", days: 365 } },
  { id: "methuselah", gender: "male", unlock: { kind: "story", story: "gen-noah" } },
  { id: "noah", gender: "male", unlock: { kind: "story", story: "gen-noah" } },
  { id: "shem", gender: "male", unlock: { kind: "story", story: "gen-noah" } },
  { id: "ham", gender: "male", unlock: { kind: "story", story: "gen-noah" } },
  { id: "japheth", gender: "male", unlock: { kind: "story", story: "gen-noah" } },
  { id: "nimrod", gender: "male", unlock: { kind: "story", story: "gen-babel" } },
  { id: "terah", gender: "male", unlock: { kind: "story", story: "gen-babel" } },
  { id: "abraham", gender: "male", unlock: { kind: "story", story: "gen-abraham" } },
  { id: "lot", gender: "male", unlock: { kind: "story", story: "gen-abraham" } },
  { id: "melchizedek", gender: "male", unlock: { kind: "story", story: "gen-abraham" } },
  { id: "ishmael", gender: "male", unlock: { kind: "story", story: "gen-abraham" } },
  { id: "isaac", gender: "male", unlock: { kind: "story", story: "gen-abraham" } },
  { id: "esau", gender: "male", unlock: { kind: "story", story: "gen-jacob" } },
  { id: "jacob", gender: "male", unlock: { kind: "story", story: "gen-jacob" } },
  { id: "laban", gender: "male", unlock: { kind: "story", story: "gen-jacob" } },
  { id: "reuben", gender: "male", unlock: { kind: "story", story: "gen-jacob" } },
  { id: "simeon", gender: "male", unlock: { kind: "story", story: "gen-jacob" } },
  { id: "levi", gender: "male", unlock: { kind: "story", story: "gen-jacob" } },
  { id: "judah", gender: "male", unlock: { kind: "story", story: "gen-jacob" } },
  { id: "joseph", gender: "male", unlock: { kind: "story", story: "gen-joseph" } },
  { id: "benjamin", gender: "male", unlock: { kind: "story", story: "gen-joseph" } },
  { id: "potiphar", gender: "male", unlock: { kind: "story", story: "gen-joseph" } },
  { id: "manasseh", gender: "male", unlock: { kind: "story", story: "gen-joseph" } },
  { id: "ephraim", gender: "male", unlock: { kind: "story", story: "gen-joseph" } },
  { id: "moses", gender: "male", unlock: { kind: "book", book: "EXO" } },
  { id: "aaron", gender: "male", unlock: { kind: "book", book: "EXO" } },
  { id: "jethro", gender: "male", unlock: { kind: "book", book: "EXO" } },
  { id: "pharaoh", gender: "male", unlock: { kind: "book", book: "EXO" } },
  { id: "hur", gender: "male", unlock: { kind: "book", book: "EXO" } },
  { id: "bezalel", gender: "male", unlock: { kind: "book", book: "EXO" } },
  { id: "nadab", gender: "male", unlock: { kind: "book", book: "LEV" } },
  { id: "eleazar", gender: "male", unlock: { kind: "book", book: "NUM" } },
  { id: "phinehas", gender: "male", unlock: { kind: "book", book: "NUM" } },
  { id: "korah", gender: "male", unlock: { kind: "book", book: "NUM" } },
  { id: "balaam", gender: "male", unlock: { kind: "book", book: "NUM" } },
  { id: "balak", gender: "male", unlock: { kind: "book", book: "NUM" } },
  { id: "og", gender: "male", unlock: { kind: "book", book: "DEU" } },
  { id: "joshua", gender: "male", unlock: { kind: "streak", days: 7 } },
  { id: "caleb", gender: "male", unlock: { kind: "streak", days: 100 } },
  { id: "achan", gender: "male", unlock: { kind: "book", book: "JOS" } },
  { id: "othniel", gender: "male", unlock: { kind: "book", book: "JDG" } },
  { id: "ehud", gender: "male", unlock: { kind: "book", book: "JDG" } },
  { id: "shamgar", gender: "male", unlock: { kind: "book", book: "JDG" } },
  { id: "barak", gender: "male", unlock: { kind: "book", book: "JDG" } },
  { id: "gideon", gender: "male", unlock: { kind: "book", book: "JDG" } },
  { id: "jephthah", gender: "male", unlock: { kind: "book", book: "JDG" } },
  { id: "manoah", gender: "male", unlock: { kind: "book", book: "JDG" } },
  { id: "samson", gender: "male", unlock: { kind: "plus" } },
  { id: "boaz", gender: "male", unlock: { kind: "book", book: "RUT" } },
  { id: "elimelech", gender: "male", unlock: { kind: "book", book: "RUT" } },
  { id: "obed", gender: "male", unlock: { kind: "book", book: "RUT" } },
  { id: "elkanah", gender: "male", unlock: { kind: "book", book: "1SA" } },
  { id: "eli", gender: "male", unlock: { kind: "book", book: "1SA" } },
  { id: "samuel", gender: "male", unlock: { kind: "book", book: "1SA" } },
  { id: "saul", gender: "male", unlock: { kind: "book", book: "1SA" } },
  { id: "jonathan", gender: "male", unlock: { kind: "book", book: "1SA" } },
  { id: "jesse", gender: "male", unlock: { kind: "book", book: "1SA" } },
  { id: "david", gender: "male", unlock: { kind: "book", book: "1SA" } },
  { id: "goliath", gender: "male", unlock: { kind: "plus" } },
  { id: "nabal", gender: "male", unlock: { kind: "book", book: "1SA" } },
  { id: "abner", gender: "male", unlock: { kind: "book", book: "2SA" } },
  { id: "joab", gender: "male", unlock: { kind: "book", book: "2SA" } },
  { id: "nathan", gender: "male", unlock: { kind: "book", book: "2SA" } },
  { id: "uriah", gender: "male", unlock: { kind: "book", book: "2SA" } },
  { id: "absalom", gender: "male", unlock: { kind: "book", book: "2SA" } },
  { id: "mephibosheth", gender: "male", unlock: { kind: "book", book: "2SA" } },
  { id: "ahithophel", gender: "male", unlock: { kind: "book", book: "2SA" } },
  { id: "hushai", gender: "male", unlock: { kind: "book", book: "2SA" } },
  { id: "barzillai", gender: "male", unlock: { kind: "book", book: "2SA" } },
  { id: "solomon", gender: "male", unlock: { kind: "plus" } },
  { id: "adonijah", gender: "male", unlock: { kind: "book", book: "1KI" } },
  { id: "hiram", gender: "male", unlock: { kind: "book", book: "1KI" } },
  { id: "jeroboam", gender: "male", unlock: { kind: "book", book: "1KI" } },
  { id: "rehoboam", gender: "male", unlock: { kind: "book", book: "1KI" } },
  { id: "ahab", gender: "male", unlock: { kind: "book", book: "1KI" } },
  { id: "elijah", gender: "male", unlock: { kind: "book", book: "1KI" } },
  { id: "naboth", gender: "male", unlock: { kind: "book", book: "1KI" } },
  { id: "micaiah", gender: "male", unlock: { kind: "book", book: "1KI" } },
  { id: "elisha", gender: "male", unlock: { kind: "book", book: "2KI" } },
  { id: "naaman", gender: "male", unlock: { kind: "book", book: "2KI" } },
  { id: "gehazi", gender: "male", unlock: { kind: "book", book: "2KI" } },
  { id: "jehu", gender: "male", unlock: { kind: "book", book: "2KI" } },
  { id: "jehoiada", gender: "male", unlock: { kind: "book", book: "2KI" } },
  { id: "joash", gender: "male", unlock: { kind: "book", book: "2KI" } },
  { id: "hezekiah", gender: "male", unlock: { kind: "book", book: "2KI" } },
  { id: "josiah", gender: "male", unlock: { kind: "book", book: "2KI" } },
  { id: "jabez", gender: "male", unlock: { kind: "book", book: "1CH" } },
  { id: "benaiah", gender: "male", unlock: { kind: "book", book: "1CH" } },
  { id: "asa", gender: "male", unlock: { kind: "book", book: "2CH" } },
  { id: "jehoshaphat", gender: "male", unlock: { kind: "book", book: "2CH" } },
  { id: "uzziah", gender: "male", unlock: { kind: "book", book: "2CH" } },
  { id: "cyrus", gender: "male", unlock: { kind: "book", book: "EZR" } },
  { id: "zerubbabel", gender: "male", unlock: { kind: "book", book: "EZR" } },
  { id: "ezra", gender: "male", unlock: { kind: "book", book: "EZR" } },
  { id: "nehemiah", gender: "male", unlock: { kind: "book", book: "NEH" } },
  { id: "mordecai", gender: "male", unlock: { kind: "book", book: "EST" } },
  { id: "haman", gender: "male", unlock: { kind: "book", book: "EST" } },
  { id: "ahasuerus", gender: "male", unlock: { kind: "book", book: "EST" } },
  { id: "job", gender: "male", unlock: { kind: "book", book: "JOB" } },
  { id: "eliphaz", gender: "male", unlock: { kind: "book", book: "JOB" } },
  { id: "asaph", gender: "male", unlock: { kind: "book", book: "PSA" } },
  { id: "lemuel", gender: "male", unlock: { kind: "book", book: "PRO" } },
  { id: "preacher", gender: "male", unlock: { kind: "book", book: "ECC" } },
  { id: "isaiah", gender: "male", unlock: { kind: "book", book: "ISA" } },
  { id: "jeremiah", gender: "male", unlock: { kind: "book", book: "JER" } },
  { id: "baruch", gender: "male", unlock: { kind: "book", book: "JER" } },
  { id: "ebed-melech", gender: "male", unlock: { kind: "book", book: "JER" } },
  { id: "ezekiel", gender: "male", unlock: { kind: "book", book: "EZK" } },
  { id: "daniel", gender: "male", unlock: { kind: "streak", days: 30 } },
  { id: "shadrach", gender: "male", unlock: { kind: "book", book: "DAN" } },
  { id: "meshach", gender: "male", unlock: { kind: "book", book: "DAN" } },
  { id: "abednego", gender: "male", unlock: { kind: "book", book: "DAN" } },
  { id: "nebuchadnezzar", gender: "male", unlock: { kind: "plus" } },
  { id: "belshazzar", gender: "male", unlock: { kind: "book", book: "DAN" } },
  { id: "darius", gender: "male", unlock: { kind: "book", book: "DAN" } },
  { id: "hosea", gender: "male", unlock: { kind: "book", book: "HOS" } },
  { id: "joel", gender: "male", unlock: { kind: "book", book: "JOL" } },
  { id: "amos", gender: "male", unlock: { kind: "book", book: "AMO" } },
  { id: "obadiah", gender: "male", unlock: { kind: "book", book: "OBA" } },
  { id: "jonah", gender: "male", unlock: { kind: "book", book: "JON" } },
  { id: "micah", gender: "male", unlock: { kind: "book", book: "MIC" } },
  { id: "nahum", gender: "male", unlock: { kind: "book", book: "NAM" } },
  { id: "habakkuk", gender: "male", unlock: { kind: "book", book: "HAB" } },
  { id: "zephaniah", gender: "male", unlock: { kind: "book", book: "ZEP" } },
  { id: "haggai", gender: "male", unlock: { kind: "book", book: "HAG" } },
  { id: "zechariah-prophet", gender: "male", unlock: { kind: "book", book: "ZEC" } },
  { id: "malachi", gender: "male", unlock: { kind: "book", book: "MAL" } },
  { id: "zechariah-priest", gender: "male", unlock: { kind: "book", book: "LUK" } },
  { id: "john-baptist", gender: "male", unlock: { kind: "book", book: "LUK" } },
  { id: "joseph-nazareth", gender: "male", unlock: { kind: "book", book: "MAT" } },
  { id: "simeon-temple", gender: "male", unlock: { kind: "book", book: "LUK" } },
  { id: "herod-great", gender: "male", unlock: { kind: "book", book: "MAT" } },
  { id: "peter", gender: "male", unlock: { kind: "book", book: "MRK" } },
  { id: "andrew", gender: "male", unlock: { kind: "share" } },
  { id: "james-zebedee", gender: "male", unlock: { kind: "book", book: "MRK" } },
  { id: "john-apostle", gender: "male", unlock: { kind: "book", book: "JHN" } },
  { id: "philip-apostle", gender: "male", unlock: { kind: "book", book: "JHN" } },
  { id: "nathanael", gender: "male", unlock: { kind: "book", book: "JHN" } },
  { id: "matthew", gender: "male", unlock: { kind: "book", book: "MAT" } },
  { id: "thomas", gender: "male", unlock: { kind: "book", book: "JHN" } },
  { id: "james-alphaeus", gender: "male", unlock: { kind: "book", book: "MAT" } },
  { id: "thaddaeus", gender: "male", unlock: { kind: "book", book: "MAT" } },
  { id: "simon-zealot", gender: "male", unlock: { kind: "book", book: "LUK" } },
  { id: "judas-iscariot", gender: "male", unlock: { kind: "plus" } },
  { id: "nicodemus", gender: "male", unlock: { kind: "book", book: "JHN" } },
  { id: "lazarus", gender: "male", unlock: { kind: "book", book: "JHN" } },
  { id: "man-born-blind", gender: "male", unlock: { kind: "book", book: "JHN" } },
  { id: "man-bethesda", gender: "male", unlock: { kind: "book", book: "JHN" } },
  { id: "caiaphas", gender: "male", unlock: { kind: "book", book: "JHN" } },
  { id: "pilate", gender: "male", unlock: { kind: "book", book: "JHN" } },
  { id: "zacchaeus", gender: "male", unlock: { kind: "book", book: "LUK" } },
  { id: "cleopas", gender: "male", unlock: { kind: "book", book: "LUK" } },
  { id: "herod-antipas", gender: "male", unlock: { kind: "book", book: "LUK" } },
  { id: "repentant-thief", gender: "male", unlock: { kind: "book", book: "LUK" } },
  { id: "luke", gender: "male", unlock: { kind: "book", book: "LUK" } },
  { id: "rich-young-man", gender: "male", unlock: { kind: "book", book: "MAT" } },
  { id: "centurion", gender: "male", unlock: { kind: "book", book: "MAT" } },
  { id: "joseph-arimathea", gender: "male", unlock: { kind: "book", book: "MAT" } },
  { id: "jairus", gender: "male", unlock: { kind: "book", book: "MRK" } },
  { id: "bartimaeus", gender: "male", unlock: { kind: "book", book: "MRK" } },
  { id: "gerasene", gender: "male", unlock: { kind: "book", book: "MRK" } },
  { id: "paralysed-man", gender: "male", unlock: { kind: "book", book: "MRK" } },
  { id: "barabbas", gender: "male", unlock: { kind: "book", book: "MRK" } },
  { id: "simon-cyrene", gender: "male", unlock: { kind: "book", book: "MRK" } },
  { id: "mark", gender: "male", unlock: { kind: "book", book: "MRK" } },
  { id: "matthias", gender: "male", unlock: { kind: "book", book: "ACT" } },
  { id: "stephen", gender: "male", unlock: { kind: "book", book: "ACT" } },
  { id: "philip-evangelist", gender: "male", unlock: { kind: "book", book: "ACT" } },
  { id: "ethiopian-official", gender: "male", unlock: { kind: "book", book: "ACT" } },
  { id: "simon-sorcerer", gender: "male", unlock: { kind: "book", book: "ACT" } },
  { id: "paul", gender: "male", unlock: { kind: "book", book: "ACT" } },
  { id: "ananias", gender: "male", unlock: { kind: "book", book: "ACT" } },
  { id: "cornelius", gender: "male", unlock: { kind: "book", book: "ACT" } },
  { id: "barnabas", gender: "male", unlock: { kind: "book", book: "ACT" } },
  { id: "agabus", gender: "male", unlock: { kind: "book", book: "ACT" } },
  { id: "silas", gender: "male", unlock: { kind: "book", book: "ACT" } },
  { id: "jailer", gender: "male", unlock: { kind: "book", book: "ACT" } },
  { id: "timothy", gender: "male", unlock: { kind: "book", book: "1TI" } },
  { id: "aquila", gender: "male", unlock: { kind: "book", book: "ACT" } },
  { id: "apollos", gender: "male", unlock: { kind: "book", book: "ACT" } },
  { id: "demetrius", gender: "male", unlock: { kind: "book", book: "ACT" } },
  { id: "eutychus", gender: "male", unlock: { kind: "book", book: "ACT" } },
  { id: "gamaliel", gender: "male", unlock: { kind: "book", book: "ACT" } },
  { id: "felix", gender: "male", unlock: { kind: "book", book: "ACT" } },
  { id: "agrippa", gender: "male", unlock: { kind: "book", book: "ACT" } },
  { id: "tychicus", gender: "male", unlock: { kind: "book", book: "EPH" } },
  { id: "epaphroditus", gender: "male", unlock: { kind: "book", book: "PHP" } },
  { id: "epaphras", gender: "male", unlock: { kind: "book", book: "COL" } },
  { id: "onesiphorus", gender: "male", unlock: { kind: "book", book: "2TI" } },
  { id: "titus", gender: "male", unlock: { kind: "book", book: "TIT" } },
  { id: "philemon", gender: "male", unlock: { kind: "book", book: "PHM" } },
  { id: "onesimus", gender: "male", unlock: { kind: "book", book: "PHM" } },
  { id: "james-brother", gender: "male", unlock: { kind: "book", book: "JAS" } },
  { id: "gaius", gender: "male", unlock: { kind: "book", book: "3JN" } },
  { id: "jude", gender: "male", unlock: { kind: "book", book: "JUD" } },
  // Women, in Bible order
  { id: "eve", gender: "female", unlock: { kind: "start" } },
  { id: "adah", gender: "female", unlock: { kind: "story", story: "gen-cain-abel" } },
  { id: "zillah", gender: "female", unlock: { kind: "story", story: "gen-cain-abel" } },
  { id: "naamah", gender: "female", unlock: { kind: "story", story: "gen-cain-abel" } },
  { id: "noahs-wife", gender: "female", unlock: { kind: "story", story: "gen-noah" } },
  { id: "sarah", gender: "female", unlock: { kind: "story", story: "gen-abraham" } },
  { id: "milcah", gender: "female", unlock: { kind: "story", story: "gen-babel" } },
  { id: "hagar", gender: "female", unlock: { kind: "story", story: "gen-abraham" } },
  { id: "lots-wife", gender: "female", unlock: { kind: "story", story: "gen-abraham" } },
  { id: "rebekah", gender: "female", unlock: { kind: "story", story: "gen-abraham" } },
  { id: "iscah", gender: "female", unlock: { kind: "story", story: "gen-babel" } },
  { id: "reumah", gender: "female", unlock: { kind: "story", story: "gen-abraham" } },
  { id: "keturah", gender: "female", unlock: { kind: "story", story: "gen-abraham" } },
  { id: "deborah-nurse", gender: "female", unlock: { kind: "story", story: "gen-jacob" } },
  { id: "leah", gender: "female", unlock: { kind: "story", story: "gen-jacob" } },
  { id: "rachel", gender: "female", unlock: { kind: "story", story: "gen-jacob" } },
  { id: "bilhah", gender: "female", unlock: { kind: "story", story: "gen-jacob" } },
  { id: "zilpah", gender: "female", unlock: { kind: "story", story: "gen-jacob" } },
  { id: "dinah", gender: "female", unlock: { kind: "story", story: "gen-jacob" } },
  { id: "judith", gender: "female", unlock: { kind: "story", story: "gen-jacob" } },
  { id: "basemath", gender: "female", unlock: { kind: "story", story: "gen-jacob" } },
  { id: "mahalath", gender: "female", unlock: { kind: "story", story: "gen-jacob" } },
  { id: "oholibamah", gender: "female", unlock: { kind: "story", story: "gen-jacob" } },
  { id: "timna", gender: "female", unlock: { kind: "story", story: "gen-jacob" } },
  { id: "mehetabel", gender: "female", unlock: { kind: "story", story: "gen-jacob" } },
  { id: "tamar-judah", gender: "female", unlock: { kind: "story", story: "gen-joseph" } },
  { id: "potiphars-wife", gender: "female", unlock: { kind: "story", story: "gen-joseph" } },
  { id: "asenath", gender: "female", unlock: { kind: "story", story: "gen-joseph" } },
  { id: "serah", gender: "female", unlock: { kind: "story", story: "gen-joseph" } },
  { id: "shiphrah", gender: "female", unlock: { kind: "book", book: "EXO" } },
  { id: "puah", gender: "female", unlock: { kind: "book", book: "EXO" } },
  { id: "jochebed", gender: "female", unlock: { kind: "book", book: "EXO" } },
  { id: "miriam", gender: "female", unlock: { kind: "book", book: "EXO" } },
  { id: "pharaohs-daughter", gender: "female", unlock: { kind: "book", book: "EXO" } },
  { id: "zipporah", gender: "female", unlock: { kind: "book", book: "EXO" } },
  { id: "elisheba", gender: "female", unlock: { kind: "book", book: "EXO" } },
  { id: "shelomith", gender: "female", unlock: { kind: "book", book: "LEV" } },
  { id: "cushite-wife", gender: "female", unlock: { kind: "book", book: "NUM" } },
  { id: "cozbi", gender: "female", unlock: { kind: "book", book: "NUM" } },
  { id: "mahlah", gender: "female", unlock: { kind: "book", book: "NUM" } },
  { id: "noah-zelophehad", gender: "female", unlock: { kind: "book", book: "NUM" } },
  { id: "hoglah", gender: "female", unlock: { kind: "book", book: "NUM" } },
  { id: "milcah-zelophehad", gender: "female", unlock: { kind: "book", book: "NUM" } },
  { id: "tirzah", gender: "female", unlock: { kind: "book", book: "NUM" } },
  { id: "rahab", gender: "female", unlock: { kind: "streak", days: 7 } },
  { id: "achsah", gender: "female", unlock: { kind: "book", book: "JOS" } },
  { id: "deborah", gender: "female", unlock: { kind: "book", book: "JDG" } },
  { id: "jael", gender: "female", unlock: { kind: "book", book: "JDG" } },
  { id: "siseras-mother", gender: "female", unlock: { kind: "book", book: "JDG" } },
  { id: "woman-thebez", gender: "female", unlock: { kind: "book", book: "JDG" } },
  { id: "samsons-mother", gender: "female", unlock: { kind: "book", book: "JDG" } },
  { id: "woman-timnah", gender: "female", unlock: { kind: "book", book: "JDG" } },
  { id: "delilah", gender: "female", unlock: { kind: "plus" } },
  { id: "jephthahs-daughter", gender: "female", unlock: { kind: "book", book: "JDG" } },
  { id: "micahs-mother", gender: "female", unlock: { kind: "book", book: "JDG" } },
  { id: "naomi", gender: "female", unlock: { kind: "book", book: "RUT" } },
  { id: "ruth", gender: "female", unlock: { kind: "streak", days: 30 } },
  { id: "orpah", gender: "female", unlock: { kind: "book", book: "RUT" } },
  { id: "hannah", gender: "female", unlock: { kind: "streak", days: 100 } },
  { id: "peninnah", gender: "female", unlock: { kind: "book", book: "1SA" } },
  { id: "phinehas-wife", gender: "female", unlock: { kind: "book", book: "1SA" } },
  { id: "ahinoam-saul", gender: "female", unlock: { kind: "book", book: "1SA" } },
  { id: "merab", gender: "female", unlock: { kind: "book", book: "1SA" } },
  { id: "michal", gender: "female", unlock: { kind: "book", book: "1SA" } },
  { id: "abigail", gender: "female", unlock: { kind: "book", book: "1SA" } },
  { id: "ahinoam-jezreel", gender: "female", unlock: { kind: "book", book: "1SA" } },
  { id: "medium-endor", gender: "female", unlock: { kind: "book", book: "1SA" } },
  { id: "bathsheba", gender: "female", unlock: { kind: "plus" } },
  { id: "maacah-geshur", gender: "female", unlock: { kind: "book", book: "2SA" } },
  { id: "haggith", gender: "female", unlock: { kind: "book", book: "2SA" } },
  { id: "abital", gender: "female", unlock: { kind: "book", book: "2SA" } },
  { id: "eglah", gender: "female", unlock: { kind: "book", book: "2SA" } },
  { id: "tamar-david", gender: "female", unlock: { kind: "book", book: "2SA" } },
  { id: "tamar-absalom", gender: "female", unlock: { kind: "book", book: "2SA" } },
  { id: "woman-tekoa", gender: "female", unlock: { kind: "book", book: "2SA" } },
  { id: "woman-bahurim", gender: "female", unlock: { kind: "book", book: "2SA" } },
  { id: "woman-abel", gender: "female", unlock: { kind: "book", book: "2SA" } },
  { id: "rizpah", gender: "female", unlock: { kind: "book", book: "2SA" } },
  { id: "abishag", gender: "female", unlock: { kind: "book", book: "1KI" } },
  { id: "true-mother", gender: "female", unlock: { kind: "book", book: "1KI" } },
  { id: "taphath", gender: "female", unlock: { kind: "book", book: "1KI" } },
  { id: "queen-sheba", gender: "female", unlock: { kind: "plus" } },
  { id: "tahpenes", gender: "female", unlock: { kind: "book", book: "1KI" } },
  { id: "zeruah", gender: "female", unlock: { kind: "book", book: "1KI" } },
  { id: "naamah-ammonite", gender: "female", unlock: { kind: "book", book: "1KI" } },
  { id: "jeroboams-wife", gender: "female", unlock: { kind: "book", book: "1KI" } },
  { id: "maacah-queen", gender: "female", unlock: { kind: "book", book: "1KI" } },
  { id: "jezebel", gender: "female", unlock: { kind: "plus" } },
  { id: "widow-zarephath", gender: "female", unlock: { kind: "book", book: "1KI" } },
  { id: "prophets-widow", gender: "female", unlock: { kind: "book", book: "2KI" } },
  { id: "shunammite", gender: "female", unlock: { kind: "book", book: "2KI" } },
  { id: "naamans-servant", gender: "female", unlock: { kind: "book", book: "2KI" } },
  { id: "athaliah", gender: "female", unlock: { kind: "book", book: "2KI" } },
  { id: "jehosheba", gender: "female", unlock: { kind: "book", book: "2KI" } },
  { id: "zibiah", gender: "female", unlock: { kind: "book", book: "2KI" } },
  { id: "jehoaddan", gender: "female", unlock: { kind: "book", book: "2CH" } },
  { id: "jecoliah", gender: "female", unlock: { kind: "book", book: "2KI" } },
  { id: "jerusha", gender: "female", unlock: { kind: "book", book: "2KI" } },
  { id: "abijah-hezekiah", gender: "female", unlock: { kind: "book", book: "2KI" } },
  { id: "hephzibah", gender: "female", unlock: { kind: "book", book: "2KI" } },
  { id: "meshullemeth", gender: "female", unlock: { kind: "book", book: "2KI" } },
  { id: "jedidah", gender: "female", unlock: { kind: "book", book: "2KI" } },
  { id: "huldah", gender: "female", unlock: { kind: "book", book: "2KI" } },
  { id: "hamutal", gender: "female", unlock: { kind: "book", book: "2KI" } },
  { id: "zebidah", gender: "female", unlock: { kind: "book", book: "2KI" } },
  { id: "nehushta", gender: "female", unlock: { kind: "book", book: "2KI" } },
  { id: "shimeath", gender: "female", unlock: { kind: "book", book: "2KI" } },
  { id: "zeruiah", gender: "female", unlock: { kind: "book", book: "1CH" } },
  { id: "abigail-sister", gender: "female", unlock: { kind: "book", book: "1CH" } },
  { id: "azubah", gender: "female", unlock: { kind: "book", book: "1CH" } },
  { id: "jerioth", gender: "female", unlock: { kind: "book", book: "1CH" } },
  { id: "ephrath", gender: "female", unlock: { kind: "book", book: "1CH" } },
  { id: "ephah", gender: "female", unlock: { kind: "book", book: "1CH" } },
  { id: "abijah-hezron", gender: "female", unlock: { kind: "book", book: "1CH" } },
  { id: "atarah", gender: "female", unlock: { kind: "book", book: "1CH" } },
  { id: "hazzelelponi", gender: "female", unlock: { kind: "book", book: "1CH" } },
  { id: "helah", gender: "female", unlock: { kind: "book", book: "1CH" } },
  { id: "naarah", gender: "female", unlock: { kind: "book", book: "1CH" } },
  { id: "bithiah", gender: "female", unlock: { kind: "book", book: "1CH" } },
  { id: "hammolecheth", gender: "female", unlock: { kind: "book", book: "1CH" } },
  { id: "sheerah", gender: "female", unlock: { kind: "book", book: "1CH" } },
  { id: "shua", gender: "female", unlock: { kind: "book", book: "1CH" } },
  { id: "hushim", gender: "female", unlock: { kind: "book", book: "1CH" } },
  { id: "baara", gender: "female", unlock: { kind: "book", book: "1CH" } },
  { id: "hodesh", gender: "female", unlock: { kind: "book", book: "1CH" } },
  { id: "shelomith-zerubbabel", gender: "female", unlock: { kind: "book", book: "1CH" } },
  { id: "abihail", gender: "female", unlock: { kind: "book", book: "2CH" } },
  { id: "shimrith", gender: "female", unlock: { kind: "book", book: "2CH" } },
  { id: "noadiah", gender: "female", unlock: { kind: "book", book: "NEH" } },
  { id: "esther", gender: "female", unlock: { kind: "book", book: "EST" } },
  { id: "vashti", gender: "female", unlock: { kind: "plus" } },
  { id: "zeresh", gender: "female", unlock: { kind: "book", book: "EST" } },
  { id: "jobs-wife", gender: "female", unlock: { kind: "book", book: "JOB" } },
  { id: "jemimah", gender: "female", unlock: { kind: "book", book: "JOB" } },
  { id: "keziah", gender: "female", unlock: { kind: "book", book: "JOB" } },
  { id: "keren-happuch", gender: "female", unlock: { kind: "book", book: "JOB" } },
  { id: "lemuels-mother", gender: "female", unlock: { kind: "book", book: "PRO" } },
  { id: "shulammite", gender: "female", unlock: { kind: "book", book: "SNG" } },
  { id: "isaiahs-wife", gender: "female", unlock: { kind: "book", book: "ISA" } },
  { id: "ezekiels-wife", gender: "female", unlock: { kind: "book", book: "EZK" } },
  { id: "queen-belshazzar", gender: "female", unlock: { kind: "book", book: "DAN" } },
  { id: "gomer", gender: "female", unlock: { kind: "book", book: "HOS" } },
  { id: "lo-ruhamah", gender: "female", unlock: { kind: "book", book: "HOS" } },
  { id: "mary", gender: "female", unlock: { kind: "book", book: "LUK" } },
  { id: "elizabeth", gender: "female", unlock: { kind: "book", book: "LUK" } },
  { id: "anna", gender: "female", unlock: { kind: "streak", days: 365 } },
  { id: "mother-zebedee", gender: "female", unlock: { kind: "book", book: "MAT" } },
  { id: "pilates-wife", gender: "female", unlock: { kind: "book", book: "MAT" } },
  { id: "herodias", gender: "female", unlock: { kind: "book", book: "MAT" } },
  { id: "herodias-daughter", gender: "female", unlock: { kind: "book", book: "MAT" } },
  { id: "peters-mother-in-law", gender: "female", unlock: { kind: "book", book: "MRK" } },
  { id: "jairus-daughter", gender: "female", unlock: { kind: "book", book: "MRK" } },
  { id: "woman-cloak", gender: "female", unlock: { kind: "book", book: "MRK" } },
  { id: "syrophoenician", gender: "female", unlock: { kind: "book", book: "MRK" } },
  { id: "poor-widow", gender: "female", unlock: { kind: "book", book: "MRK" } },
  { id: "servant-girl", gender: "female", unlock: { kind: "book", book: "MRK" } },
  { id: "salome", gender: "female", unlock: { kind: "book", book: "MRK" } },
  { id: "mary-mother-james", gender: "female", unlock: { kind: "book", book: "MRK" } },
  { id: "widow-nain", gender: "female", unlock: { kind: "book", book: "LUK" } },
  { id: "woman-alabaster", gender: "female", unlock: { kind: "book", book: "LUK" } },
  { id: "bent-woman", gender: "female", unlock: { kind: "book", book: "LUK" } },
  { id: "joanna", gender: "female", unlock: { kind: "book", book: "LUK" } },
  { id: "susanna", gender: "female", unlock: { kind: "book", book: "LUK" } },
  { id: "mary-magdalene", gender: "female", unlock: { kind: "book", book: "JHN" } },
  { id: "martha", gender: "female", unlock: { kind: "book", book: "JHN" } },
  { id: "mary-bethany", gender: "female", unlock: { kind: "book", book: "JHN" } },
  { id: "samaritan-woman", gender: "female", unlock: { kind: "share" } },
  { id: "adulterous-woman", gender: "female", unlock: { kind: "book", book: "JHN" } },
  { id: "mary-clopas", gender: "female", unlock: { kind: "book", book: "JHN" } },
  { id: "sapphira", gender: "female", unlock: { kind: "book", book: "ACT" } },
  { id: "candace", gender: "female", unlock: { kind: "book", book: "ACT" } },
  { id: "tabitha", gender: "female", unlock: { kind: "book", book: "ACT" } },
  { id: "mary-mark", gender: "female", unlock: { kind: "book", book: "ACT" } },
  { id: "rhoda", gender: "female", unlock: { kind: "book", book: "ACT" } },
  { id: "lydia", gender: "female", unlock: { kind: "book", book: "ACT" } },
  { id: "slave-girl", gender: "female", unlock: { kind: "book", book: "ACT" } },
  { id: "damaris", gender: "female", unlock: { kind: "book", book: "ACT" } },
  { id: "priscilla", gender: "female", unlock: { kind: "book", book: "ACT" } },
  { id: "pauls-sister", gender: "female", unlock: { kind: "book", book: "ACT" } },
  { id: "drusilla", gender: "female", unlock: { kind: "book", book: "ACT" } },
  { id: "bernice", gender: "female", unlock: { kind: "book", book: "ACT" } },
  { id: "phoebe", gender: "female", unlock: { kind: "book", book: "ROM" } },
  { id: "junia", gender: "female", unlock: { kind: "book", book: "ROM" } },
  { id: "mary-rome", gender: "female", unlock: { kind: "book", book: "ROM" } },
  { id: "tryphaena", gender: "female", unlock: { kind: "book", book: "ROM" } },
  { id: "tryphosa", gender: "female", unlock: { kind: "book", book: "ROM" } },
  { id: "persis", gender: "female", unlock: { kind: "book", book: "ROM" } },
  { id: "rufus-mother", gender: "female", unlock: { kind: "book", book: "ROM" } },
  { id: "julia", gender: "female", unlock: { kind: "book", book: "ROM" } },
  { id: "nereus-sister", gender: "female", unlock: { kind: "book", book: "ROM" } },
  { id: "chloe", gender: "female", unlock: { kind: "book", book: "1CO" } },
  { id: "peters-wife", gender: "female", unlock: { kind: "book", book: "1CO" } },
  { id: "euodia", gender: "female", unlock: { kind: "book", book: "PHP" } },
  { id: "syntyche", gender: "female", unlock: { kind: "book", book: "PHP" } },
  { id: "nympha", gender: "female", unlock: { kind: "book", book: "COL" } },
  { id: "lois", gender: "female", unlock: { kind: "book", book: "2TI" } },
  { id: "eunice", gender: "female", unlock: { kind: "book", book: "2TI" } },
  { id: "claudia", gender: "female", unlock: { kind: "book", book: "2TI" } },
  { id: "apphia", gender: "female", unlock: { kind: "book", book: "PHM" } },
  { id: "elect-lady", gender: "female", unlock: { kind: "book", book: "2JN" } },
];
