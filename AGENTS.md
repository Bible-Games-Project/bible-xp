<!-- BGP-ADMIN:BEGIN -->
<!-- Managed by bgp-admin (templates/agent-docs). Edits inside this block are overwritten on the next sync. Add project-specific notes below the END marker. -->

# AGENTS.md

Instructions for AI coding agents working on this repository.

This repo is a **web game**. It is published as an iOS/Android app by a separate
control plane called **bgp-admin** — see "Native boundary" below, it is the rule
that matters most here.

Read also:

- [docs/agents/working-style.md](./docs/agents/working-style.md) — how the maintainer likes to work

## Native boundary

bgp-admin owns everything native. It generates the Capacitor setup, the signing
config and the release workflows from outside this repo, without modifying it.

**Never add or edit any of the following here:**

- `capacitor.config.*`, `ios/`, `android/`
- Capacitor or native plugin dependencies in `package.json`
- `.github/workflows/deploy*.yml`, `.github/workflows/preview-deploy.yml`
- Build config (`vite.config.*`, router config, base paths) changed *for the sake
  of the mobile build*

If something only breaks inside the app shell — blank screen in the WebView,
asset paths, deep links, splash screen, versioning, signing — the fix belongs in
bgp-admin, not here. Say so instead of patching around it. A local fix will be
silently overwritten on the next sync and will hide the real bug.

Normal web work (game logic, UI, assets, web build config for web reasons) is
entirely yours.

## Language

Everything you write into the repository MUST be in English:

- Source code (variables, functions, classes, file names)
- Comments of any kind
- Documentation, README files, guides
- Commit messages, branch names, PR and issue titles and descriptions
- Log messages and error messages
- Tests (descriptions, assertions, fixtures)
- Comments inside config files (YAML, JSON, TOML)
- Database schemas and API route names

Only end-user-facing content may be localized: UI strings in i18n files, store
listings, and marketing copy.

The maintainer communicates in Spanish. You may reply in Spanish in
conversation, but anything committed to the repository stays in English.

## Keeping this file current

At the end of a working session, update `AGENTS.md` with everything important
you learned that day. Worth recording:

- Conventions and patterns of this codebase that were not obvious up front
- Commands that actually work (build, test, lint, run) and their gotchas
- Decisions the maintainer made, and the reasoning behind them
- Traps you fell into, so the next agent does not repeat them

Do not record what the code already says, one-off details of a single task, or a
changelog of what you did. This file is for what the next agent needs to know
before starting, nothing else. Keep it edited down — replace stale entries
instead of appending to them.

Write project-specific notes **below the `BGP-ADMIN:END` marker**. Anything
inside the managed block is shared across all game repos and gets overwritten on
the next sync; if a rule you are adding applies to every game, it belongs in
bgp-admin at `templates/agent-docs/`, so ask before adding it.

<!-- BGP-ADMIN:END -->

## Bible XP — project notes

- Stack: Vite + React 19 + TypeScript, plain CSS (`src/theme/`), lucide-react
  icons, self-hosted fonts (`@fontsource-variable/nunito` for UI,
  `@fontsource/lilita-one` for display headings). No router or state library:
  a small hash router (`src/app/router.ts`) and a `useSyncExternalStore` store
  (`src/progress/store.ts`). Hash routes need no server rewrites and no base path.
- The maintainer's first spec asked for React Native/Expo; we stayed on the web
  stack because bgp-admin owns the native wrapping. Do not add Expo or Capacitor.
- Visual identity (maintainer decision): light and vibrant, built from the
  Home background picture (`src/assets/home-background.webp`): every blue is
  the picture's sky hue (206°) at another lightness (`--sky-*`, navy text,
  blue headers/navigation/selection); warm colours follow the picture's light
  from sun to sand to terracotta (`--flame-1..7`), with `--flame-4` the exact
  complement of the sky. Lumi is drawn with the same flame colours. Gold is the
  main action and rewards; the flame ramp marks difficulty tiers; green/red
  only mark right and wrong answers. Tokens live in `src/theme/tokens.css`;
  never hard-code colours in components. `src/theme/palette.test.ts` checks
  these relationships and contrast.
- The learning path is called "Journey" (maintainer decision; "Atlas" and an
  Eden river map were rejected). Levels: Testaments (`JourneyScreen`, picture
  `journey-bible.webp`) → books of a Testament, 66-book Protestant canon
  (`TestamentScreen`; Old Testament uses `journey-old-testament.webp`) → stories
  of a book (`BookScreen`) → one story's winding road of stops
  (`StoryScreen`, `JourneyRoad`). Only books with a unit are playable (today:
  Genesis → The Creation); later Genesis stories are listed as coming soon from
  `plannedStories` in `src/content/locales/en/books.ts`. The road must look
  Duolingo-like in spirit but not a copy: no round buttons, no popovers.
- Home (maintainer decision): only two big buttons over the landscape —
  "Start/Continue the journey" (goes straight to the next stop) and Daily
  Challenge — with Lumi above them. Pictures supplied by the maintainer live in
  `src/assets/` and are shown with `<Scene>` + `screen--scene`.
- Match the Pairs must make the left-to-right linking obvious: column titles,
  a changing hint line, highlighted waiting column, numbered matched pairs.
- Commands: `bun run build` (runs `tsc -b` first), `bun run test` (vitest),
  `bun run preview`. Playwright is not a dependency; for screenshots use the
  global one at `/opt/node-tools/node_modules/playwright` against
  `bun run preview`.
- Bible text: every literal quote must be verbatim World English Bible.
  `src/content/content.test.ts` checks quotes, curly-quoted fragments in
  explanations, quiz questions and match cards, and that every reference exists,
  against `src/content/sources/web-genesis-1-3.json`. Curly quotes are reserved
  for Bible wording. WEB writes “Yahweh God”, “Hiddekel” (Tigris elsewhere), and
  names Adam from Genesis 3:17 on. Only Genesis 1–3 is verified; do not write
  questions from other passages without adding and testing their source text.
- Difficulty: questions carry `tier` 1–5 (Beginner…Master); a session draws
  `SESSION_SIZE[mode]` least-seen steps of the selected tier. Maintainer
  decision: every tier is open and chosen freely in Settings (an earlier
  accuracy-based unlock system was removed); harder tiers pay more XP. Wrong
  options must be real details from the text (other days, rivers, speakers),
  never absurd, and never a synonym another translation uses for the right answer.
- Navigation (maintainer decision): bottom tabs are Home, Journey, Daily, Train.
  Profile is not a tab; it opens from the avatar at the top left and holds
  Settings.
- Mascot (maintainer decision): Lumi is a friendly flame in red, orange and
  yellow (not white, like the Bible Games Project logo's flame would suggest),
  drawn in SVG in `src/components/Mascot.tsx` with the `--flame` colours and
  five moods.
- Progress is one JSON object (`src/progress/model.ts`, version 3), all
  mutations are pure functions with tests. Bump `PROGRESS_VERSION` and extend
  `migrate()` when the shape changes; never drop XP, path progress or mistakes.
- XP amounts live only in `src/progress/rewards.ts`.
- All UI text goes through `src/i18n/locales/en.ts`; only English exists. Do not
  list languages that are not fully translated (the 12 planned languages were
  not specified).
- Multiplayer (Duels) and Plus are intentionally "coming soon"
  (`src/config/features.ts`); never show fake players, scores or payments.
- CSS trap: a selector like `.foo svg` also hits icon SVGs nested inside an
  illustration; scope with `>`.
