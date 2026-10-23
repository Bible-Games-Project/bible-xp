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

- **Home** — two big buttons over an illustrated landscape: start or continue
  the Journey, and the Daily Challenge.
- **Journey** — goes straight to the road of the story you are on: Story 1,
  The Creation (Genesis 1–3), with an introduction and the six games, unlocked
  in order.
- **Bible Library** (Settings, and the end of every story) — all 66 books of the
  Bible with the stories finished in each. Genesis is open; its later stories
  are listed as coming soon.
- **Daily** — one question from five games at your difficulty, chosen by
  date; rewarded once per day and resumable.
- **Train** — any of the six games, any time, plus a "coming soon" Duels entry.
- **Six games** — Form the Word, Match the Pairs, Bible Quiz, Complete the
  Verse, Put the Story in Order (drag or arrow buttons), Who Am I?
- **Difficulty** — Beginner, Explorer, Scholar, Expert, Master, all open and
  chosen in Settings. Each game has its own questions at every level, and the
  mechanics tighten too (decoy letters, more verse options, more pairs, fewer
  clues). Harder levels pay more XP.
- **Profile** (avatar, top left) — level, XP, stats, mistakes review, Settings
  and Bible XP Plus (informational).
- **Lumi** — the mascot, a friendly flame with five moods.

## Progression in one paragraph

Correct first-try answers earn XP scaled by difficulty (2–6 per answer); the
first clear of a game at a difficulty adds a bonus (10–30, plus a perfect
bonus). Replays pay once per game, difficulty and day; the daily challenge once
per date. XP drives the player level; the streak counts days with a finished
game.

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
  progress/     player state, tiers and promotion, XP/levels/streak, persistence
  screens/      one file per screen
  theme/        CSS tokens and styles
```

### Adding content

- **A new topic:** add a folder under `src/content/locales/<lang>/` with a
  question bank per game, tagged by `tier` (at least one full session per tier
  — the tests enforce this), register it in `src/content/index.ts`, and add a
  unit to `units`. Screens and games do not change.
- **A new language:** add `src/i18n/locales/<code>.ts` (same shape as `en.ts`),
  list it in `LANGUAGES`, and add a content pack with its Bible translation.

### Bible accuracy

English quotations use the **World English Bible** (public domain).
`src/content/sources/web-genesis-1-3.json` holds the WEB text of Genesis 1–3,
and `src/content/content.test.ts` fails if any quoted wording, verse fragment or
reference does not match it. Clues and explanations are written for the app and
never appear inside quotation marks.
