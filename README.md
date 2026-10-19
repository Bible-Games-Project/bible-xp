# Bible XP

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
bun run dev        # development server
bun run build      # typecheck + production build into dist/
bun run preview    # serve the production build
bun run test       # unit and content tests (vitest)
```

## What's inside

- **Home** — Daily Challenge, Path, Free Play and Multiplayer, plus profile,
  streak, XP and a discreet Plus entry in the header.
- **Path** — Unit 1 "The Creation": an introduction and the six games, unlocked
  one after another.
- **Free Play** — any of the six games at any time.
- **Six games** — Form the Word, Match the Pairs, Bible Quiz, Complete the
  Verse, Put the Story in Order (drag or arrow buttons), Who Am I?
- **Daily Challenge** — five mixed activities, rewarded once per local date,
  resumable after closing the app.
- **Profile** — editable name and avatar, level, XP, streak, lessons, accuracy,
  mistakes review, settings, Bible XP Plus (informational only).
- **Multiplayer** and **Plus** — designed "coming soon" screens; no fake
  players, scores or payments.

## Project layout

```
src/
  app/          hash router, accessibility preferences
  components/   design-system components and Lumi, the mascot (SVG)
  config/       feature flags for not-yet-live features
  content/      typed Bible content per content locale + WEB source text
  engine/       shared game session runner, feedback and results
  games/        one component per game mode
  i18n/         UI strings (English) and language registry
  lib/          dates, seeded shuffle, sound and vibration cues
  progress/     player state model, XP/levels/streak, persistence
  screens/      one file per screen
  theme/        CSS tokens and styles
```

### Adding content

- **A new topic:** add a data file under `src/content/locales/<lang>/`, register
  it in `src/content/index.ts`, and add a unit to `units`. Screens and games do
  not change.
- **A new language:** add `src/i18n/locales/<code>.ts` (same shape as `en.ts`),
  list it in `LANGUAGES`, and add a content pack with its Bible translation.

### Bible accuracy

English quotations use the **World English Bible** (public domain).
`src/content/sources/web-genesis-1-3.json` holds the WEB text of Genesis 1–3,
and `src/content/content.test.ts` fails if any quoted wording, verse fragment or
reference does not match it. Clues and explanations are written for the app and
never appear inside quotation marks.
