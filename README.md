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

- **Home** — one primary action (the next thing to play), a compact line
  showing progress toward the next difficulty tier, and the Daily Challenge.
- **Journey** — the learning path. Each Bible story is a chapter with a
  winding road of stops; Story 1, The Creation (Genesis 1–3), has seven stops:
  an introduction and the six games, unlocked in order.
- **Six games** — Form the Word, Match the Pairs, Bible Quiz, Complete the
  Verse, Put the Story in Order (drag or arrow buttons), Who Am I?
- **Difficulty tiers** — Beginner, Explorer, Scholar, Expert, Master. Each game
  has its own questions at every tier, and the mechanics tighten too (decoy
  letters, more verse options, more pairs, fewer clues). A tier unlocks with
  accuracy, never with XP.
- **Daily Challenge** — one question from five games at the player's tier,
  chosen by date; rewarded once per day and resumable.
- **Play** — any game at any unlocked tier, plus a "coming soon" Duels entry.
- **Profile** — level (from XP) and difficulty (from accuracy) shown side by
  side, stats, mistakes review, settings and Bible XP Plus (informational).

## Progression in one paragraph

Correct first-try answers earn XP scaled by tier (2–6 per answer); the first
clear of a game at a tier adds a bonus (10–30, plus a perfect bonus). Replays
pay once per game, tier and day; the daily challenge once per date. XP only
drives the player level. To unlock the next tier the player needs, at their
highest tier, at least 15 answers with 80% accuracy over the last 20, across
3 different games (`src/progress/tiers.ts`). Tiers are never taken away.

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
