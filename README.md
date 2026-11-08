# Testalume

_Formerly Bible XP. The repository, package and saved-progress key keep the old
`bible-xp` name so existing players keep their progress._

A gamified Bible-learning app for adults: short, tactile exercises about the
people, events and words of the Bible, with XP, levels, streaks and a daily
challenge. This first version covers one topic, **The Creation (Genesis 1–3)**,
across six game modes.

It is a mobile-first web app (Vite + React + TypeScript). The iOS and Android
builds are produced by bgp-admin, which wraps the web build with Capacitor —
see `AGENTS.md`. Nothing native lives in this repo.

## Run it

```bash
bun install
bun run dev        # development server (with the DEV button)
bun run build      # typecheck + release build into dist/ (no DEV button)
bun run build:devtools  # same build plus the DEV button, into dist-devtools/
bun run preview    # serve the production build
bun run test       # unit and content tests (vitest)
```

**Developer mode.** In `bun run dev` and the devtools build, a small "DEV"
button sits above the tab bar. Switch it on and every Journey stop opens, and
four tools appear: the colour picker (tap it, then any button, text or the
mascot: a colour wheel for hue and saturation and a lightness bar change the
design token the element uses, or only elements like it, or one of the
mascot's colours; "Pick colour from screen" takes a colour from anything on
screen, the pictures included, and "Game colours" offers the palette; "Copy
CSS" gives the values to put into `src/theme`), voices (listen to 200 men's
and 200 women's ElevenLabs voices and pick one for the narrator, Testalume
and any role you add), the ranking with sample players, and replaying
onboarding. Switch it off to see the game exactly as it ships. Release builds
do not include any of it.

## What's inside

- **Onboarding** (first launch) — three steps over the Home picture: language
  (English), Bible knowledge level (sets the starting difficulty) and avatar.
- **Home** — Total XP and this week's XP, and two big buttons over an
  illustrated landscape: start or continue the Journey, and the Daily Challenge.
- **Journey** — goes straight to the road of the story you are on: Story 1,
  The Creation (Genesis 1–3), with an introduction and the six games, unlocked
  in order.
- **Bible Library** (Settings, and the end of every story) — all 66 books of the
  Bible with the stories finished in each. Genesis is open; its later stories
  are listed as coming soon.
- **Daily** — one question from five games at your difficulty, chosen by
  date; rewarded once per day and resumable.
- **Train** — any of the six games, any time, plus a "coming soon" Duels entry.
- **Ranking** — the global weekly leaderboard by Weekly XP. There is no
  backend yet, so it shows your own Weekly XP and says the global ranking is
  not live; `src/leaderboard/` is the integration point.
- **Six games** — Form the Word, Match the Pairs, Bible Quiz, Complete the
  Verse, Put the Story in Order (drag or arrow buttons), Who Am I?
- **Difficulty** — Beginner, Explorer, Scholar, Expert, Master, all open and
  chosen in Settings. Each game has its own questions at every level, and the
  mechanics tighten too (decoy letters, more verse options, more pairs, fewer
  clues). Harder levels pay more XP.
- **Profile** (avatar, top left) — character picker, level, Total and Weekly XP,
  stats, mistakes review, Settings and Testalume Plus (informational).
- **Avatar** — a Bible character from a list of 200 men and 200 women. Adam
  and Eve are open from the start; the rest unlock through the Journey,
  streaks, sharing the game or Plus. Locked ones say what unlocks them.
- **Music** — a looping playlist on the menus that fades out and pauses
  during games, then fades back in where it left off (Settings > Music).
- **Testalume** — the mascot: a little flame with a face and five moods,
  shown at key moments only.

## Progression in one paragraph

Correct first-try answers earn XP scaled by difficulty (2–6 per answer); the
first clear of a game at a difficulty adds a bonus (10–30, plus a perfect
bonus). Replays pay once per game, difficulty and day; the daily challenge once
per date. XP drives the player level; the streak counts days with a finished
game. Total XP never resets; Weekly XP counts the same rewards within a
competition week (Monday 00:00 UTC to Monday 00:00 UTC) and decides the weekly
ranking.

## Project layout

```
src/
  app/          hash router, accessibility preferences
  components/   design-system components and Testalume, the mascot (SVG)
  config/       feature flags for not-yet-live features
  content/      typed Bible content per content locale + WEB source text
  engine/       shared game session runner, feedback and results
  games/        one component per game mode
  i18n/         UI strings (English), language registry, number/date formats
  leaderboard/  weekly ranking service interface (local today, backend later)
  lib/          dates, seeded shuffle, sound and vibration cues
  progress/     player state, tiers, XP (total and weekly), levels, streak,
                avatar and cosmetics, persistence
  screens/      one file per screen
  theme/        CSS tokens and styles
```

### Adding content

- **A new topic:** add a folder under `src/content/locales/<lang>/` with a
  question bank per game, tagged by `tier` (at least one full session per tier
  — the tests enforce this), register it in `src/content/index.ts`, and add a
  unit to `units`. Screens and games do not change.
- **A new language:** add `src/i18n/locales/<code>.ts` (typed as `Messages`,
  so the compiler lists every missing string), list it in `LANGUAGES` with its
  text direction, and add a content pack with its Bible translation. Onboarding
  and Settings pick it up automatically.
- **An avatar reward:** add an item to `src/progress/cosmetics.ts` with its
  `unlock` requirement, its name in `avatar.items`, and its drawing in
  `PlayerAvatar.tsx`.

### Bible accuracy

English quotations use the **World English Bible** (public domain).
`src/content/sources/web-genesis-1-3.json` holds the WEB text of Genesis 1–3,
and `src/content/content.test.ts` fails if any quoted wording, verse fragment or
reference does not match it. Clues and explanations are written for the app and
never appear inside quotation marks.
