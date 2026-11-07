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

## Testalume — project notes

- Name (maintainer decision): the game is **Testalume** (formerly Bible XP),
  and so is its mascot. Internal identifiers keep `bible-xp` on purpose: the
  repository, `package.json` name and the saved-progress key
  `bible-xp:progress` (renaming the key would wipe every player's progress).
  The native app's display name and store listing live in bgp-admin.

- Stack: Vite + React 19 + TypeScript, plain CSS (`src/theme/`), lucide-react
  icons, self-hosted fonts (`@fontsource-variable/nunito` for UI,
  `@fontsource/lilita-one` for display headings). No router or state library:
  a small hash router (`src/app/router.ts`) and a `useSyncExternalStore` store
  (`src/progress/store.ts`). Hash routes need no server rewrites and no base path.
- The maintainer's first spec asked for React Native/Expo; we stayed on the web
  stack because bgp-admin owns the native wrapping. Do not add Expo or Capacitor.
- Visual identity (maintainer decision): every interface colour (buttons,
  text, borders, backgrounds, avatars) is monochromatic with the Home picture
  (`src/assets/home-background.webp`, the hill with three crosses): it uses one
  of the picture's hues — sky 206° (blues, text, navigation, selection), sand
  35° (gold buttons, warm text, borders, backgrounds), cypress 147° (right
  answers), rock shade 22° (wrong answers) — and only changes
  lightness/saturation. The flame scale (`--flame-*`, the difficulty tiers)
  uses only warm hues of the same picture (sun, meadow, path, stones, rock
  shade; no pure reds), and its heart is the exact complement of the sky.
  Tokens live in `src/theme/tokens.css`; never hard-code colours in
  components. `src/theme/palette.test.ts` enforces this, with colours sampled
  from the picture: if Home's picture changes, re-sample them and re-derive
  the palette.
- The learning path is called "Journey" (maintainer decision; "Atlas" and an
  Eden river map were rejected). The Journey tab (`#/path`) and Home's
  "Start/Continue the journey" button go straight to the road of the current
  story (`CurrentStoryScreen` → `StoryScreen` + `JourneyRoad`, `currentUnit()`
  in `progress/path.ts`); there is no landing screen in between (the
  maintainer asked for it to be removed). Each story can have its own picture
  behind its road (`storyScene()` in `Scene.tsx`; The Creation uses
  `story-creation.webp`). The catalogue of all 66 books with finished stories
  is the Bible Library (`LibraryScreen`, `#/library`, picture
  `journey-bible.webp`), reached from Settings and from the card at the end of
  every story's road; a book opens its list of stories (`BookScreen`, picture
  `journey-old-testament.webp`), whose roads open with `from=library` and get
  a back button to the book. Only books with
  a unit are playable (today: Genesis → The Creation); later Genesis stories are
  listed as coming soon from `plannedStories` in `src/content/locales/en/books.ts`.
  The road must look Duolingo-like in spirit but not a copy.
- Home (maintainer decision): two big buttons over the landscape —
  "Start/Continue the journey" (opens the current road) and Daily Challenge —
  with the Total XP / Weekly XP panel and Testalume's speech bubble in the sky
  above. The mascot must never cover the three crosses; check narrow, short
  (375×667, 360×640) and wide screens after layout changes. The big buttons
  scale with the viewport (`clamp()` on height, padding and type) and are
  capped at 460px wide: the maintainer found them too big on some screens.
- Pictures supplied by the maintainer live in `src/assets/` (webp, quality 80)
  and are shown with `<Screen scene="…">`: Home, the story road, Daily, Train
  (the maintainer's picture, mirrored so the speaker faces the other way),
  Bible Library and books. Screens with a picture leave a window onto it (the
  Daily card sits low, Train's games start lower, the road starts lower).
- Trap: never animate `transform` on `.screen` or any ancestor of a
  `position: fixed` element (tab bar, backgrounds) — while it runs, fixed
  children size to that ancestor, so backgrounds looked narrow then snapped
  wide. Screen entry fades with opacity only.
- Trap: pictures must not blink in. `preloadScenes()` (called in `main.tsx`)
  downloads and decodes every scene picture at start-up, and `Scene` draws an
  `<img decoding="sync">`, not a CSS background (CSS backgrounds only start
  loading when a screen first uses them). Register new pictures in
  `PICTURES` in `src/components/Scene.tsx`.
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
- Navigation (maintainer decision): bottom tabs are Home, Journey, Daily,
  Train, Ranking (the weekly leaderboard; "Leaderboard" does not fit five tabs
  at 360px). Header (maintainer decision): a settings gear at the top left
  (`#/settings`, Back goes Home; from the Profile menu it is
  `#/settings?from=profile` and Back returns there), and the level + avatar
  pill at the top right, which opens the Profile (avatar editor `#/avatar`,
  stats, Settings). No streak chip in the header; the streak shows in the
  Profile and as milestone banners in the results.
- Developer mode (`src/dev/`, maintainer request): one game, with a "DEV"
  toggle button in it. While on: every Journey stop is open, and icon buttons
  give the colour picker (pick any element, recolour it with an HSL wheel and a
  lightness bar through the token it uses, e.g. `--gold`, or for elements like
  it only; tapping the mascot lists its `--mascot-*` tokens one by one; a
  colour can also come from the screen, with the browser's EyeDropper where it
  exists, else the next tap reads the pixel, background pictures included, or
  from the game palette; "Copy CSS" exports the tweaks for `src/theme`; tweaks
  only show while the mode is on), the Voices panel (see Voices), the ranking
  with sample players, and replaying onboarding. The mascot's colours are the `--mascot-*` tokens in
  `tokens.css` (set through `style`, since SVG presentation attributes ignore
  CSS variables). The switch and the colour tweaks persist in localStorage, apart
  from the player's progress. It exists only in `bun run dev` and `bun run
  build:devtools` (`--mode devtools`, output `dist-devtools/`); the Claude
  artifact the maintainer plays is a devtools build. Release builds (`bun run
  build`, what bgp-admin publishes) must not contain it: `main.tsx` and
  `leaderboard.ts` write the condition out so it folds to false; check with a
  grep for `dev-toggle` and `Sample player` in `dist/`.
- Onboarding (maintainer decision): first-time players see exactly three
  steps over the Home picture — language (English only), Bible knowledge level
  (Beginner/Intermediate/Advanced → starting tier 1/2/3, see
  `progress/avatar.ts`), avatar. `App.tsx` shows it until
  `onboarding.completedAt` is set; choices are saved together on "Start
  learning" (`completeOnboarding`), never touching XP or progress. Players from
  before version 4 see it once too.
- Avatar: a painted head-and-shoulders portrait in biblical-era dress
  (`PlayerAvatar.tsx`, six transparent webp files in `src/assets/avatars/`):
  male/female, three skin tones (white, mixed/brown, black). They were made
  with an image model as one consistent set; `docs/avatar-art.md` has the
  prompts and the method (always edit from an existing portrait). New avatar
  pictures must match that set. Robes,
  footwear and accessories are reserved for XP rewards (`progress/cosmetics.ts`):
  today the catalogue holds one clearly marked placeholder per slot that can
  never be unlocked or worn. Never invent items or XP prices; add real ones
  only when the maintainer defines them. Cosmetics never give XP or advantages,
  and there is no shop.
- Mascot (maintainer decision): Testalume is a small friendly flame, only the
  flame with eyes, eyebrows and mouth: no lamp or bowl under it, no arms (both
  were tried and removed). Its colours (`FLAME` in `src/components/Mascot.tsx`)
  start from the gold of the main buttons and deepen to amber, with a pale
  golden heart, so it matches the game and still reads as fire; never white
  (like the Bible Games Project logo's flame) and no heavy reds. Five moods. Use
  it selectively: onboarding, the Home greeting, intro and lesson completion,
  level-ups, streak milestones, encouragement. Not beside questions or as
  decoration (it was removed from the game header, answer feedback, story
  header, Daily card and Duels screen).
- Voices (maintainer request, in progress): the maintainer picks an ElevenLabs
  voice per role in developer mode (DEV → microphone, `src/dev/VoicePanel.tsx`);
  roles are the cast in `src/voice/cast.ts` (Narrator, Testalume) plus any
  added in the panel. Picks stay in that browser; "Copy choices" gives the
  list, which goes into `CAST`, and then the lines are voiced. No line is
  voiced yet. The catalogue (`src/dev/voiceLibrary.json`, developer builds
  only) is the Bible RPG project's library (Bible-Games-Project/bible-rpg,
  `public/assets/dev/library.json`): 200 American men, 200 women (one with no
  preview left replaced by Emma, same criteria: no extra cost, no live
  moderation, at least a year's notice), 20 older men, 20 older women; its
  monsters were left out. Previews are ElevenLabs' free samples (no credits)
  and not ours to ship: they play from ElevenLabs' links, and only the Claude
  artifact packs them next to the page (`voice-previews.json` +
  `voices-<n>.mp3`, 64 kbps mono, ≤ 12 MB each) because its page cannot load
  other sites. Preview links expire: `GET /v1/shared-voices?search=<voice id>`
  (free) returns a current one; `api.us.elevenlabs.io` links work on
  `api.elevenlabs.io`. The API key is a network secret of the cloud
  environment for `api.elevenlabs.io`, header `xi-api-key` with no prefix.
  Per the Bible RPG notes the account is on the paid Starter plan (library
  voices work by voice_id); voice final lines while subscribed, so they keep
  their commercial licence, and every line costs credits: only regenerate
  lines whose text or voice changed.
- Music (maintainer decision): background music plays on every menu screen
  (onboarding included) from a playlist that loops back to the first song
  (`PLAYLIST` in `src/lib/music.ts`, files in `src/assets/music/`, numbered
  in playing order, 128 kbps MP3 levelled to about -16 LUFS, no cover art).
  While a game is open (`GameSession`, results included) it fades out over
  3 s and pauses where it was, and fades back in over 1 s from there on a
  menu (maintainer's timing, `FADE_OUT_MS` / `FADE_IN_MS`). It also pauses
  in the background and follows Settings > Music (`settings.music`, progress
  version 5). Volume goes through a Web Audio gain because iOS ignores
  `<audio>.volume`. Browsers allow sound only after a first tap, so the music
  may start with the first touch; in the app shell, autoplay is bgp-admin's
  call. Eight songs today; versions of the same song are never back to back,
  also across the loop (tested). More may come: add them to `PLAYLIST`.
- XP: `xp` is lifetime Total XP (never resets, drives the level); `weekly` is
  the current competition week's XP (Monday 00:00 UTC to Monday 00:00 UTC,
  `progress/week.ts`). Both only grow through `grantXp()` in `model.ts`, from
  the rewards in `src/progress/rewards.ts`; claimed rewards add nothing.
- Leaderboard: there is no backend or account system. `src/leaderboard/`
  defines `LeaderboardService`; the app uses `localLeaderboard`, which shows
  only the player's own Weekly XP with no rank and says the global ranking is
  not live. Never present local or sample data as a real ranking. Sample
  players exist only in development builds (`#/leaderboard?sample=1` with `bun
  run dev`) and are labelled as such. A shared backend should implement
  `LeaderboardService` (and own the week boundary) using `profile.playerId`.
- Progress is one JSON object (`src/progress/model.ts`, version 5), all
  mutations are pure functions with tests. Bump `PROGRESS_VERSION` and extend
  `migrate()` when the shape changes; never drop XP, path progress or mistakes.
- XP amounts live only in `src/progress/rewards.ts`.
- All UI text goes through `src/i18n/locales/en.ts`; only English exists. The
  app is planned in 12 languages (not yet specified); add one only when it is
  fully translated, following the steps in `src/i18n/index.ts`. Never list,
  machine-translate or placeholder-translate a language. Format numbers and
  dates with `number()` / `date()` from `useI18n()`.
- Multiplayer (Duels) and Plus are intentionally "coming soon"
  (`src/config/features.ts`); never show fake players, scores or payments.
- CSS trap: a selector like `.foo svg` also hits icon SVGs nested inside an
  illustration; scope with `>`.
