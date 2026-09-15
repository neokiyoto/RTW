# Guided interface and match presentation

The requested update makes the next weekly action visible, improves match readability and gives new games their own fictional player identities.

## Behaviour

- The weekly hub leads through activity, champion and strategy selection, then match and result. Roster and standings remain available as supporting pages.
- Applying a match result returns to the next week's hub, or final standings after week six.
- Player, opposition and champion names, plus selected key phrases, are highlighted without changing saved commentary.
- The gold-lead chart advances with revealed commentary. It cannot show future match events.
- Starting a new game creates esports handles and personal names for your five players and the twenty opposing players. Names persist when loading or starting another season. Existing saves keep their names.

## Plain-language model

A new game stores one random identity seed. A small deterministic helper uses it to choose names from original name pools. The same seed always produces the same 25 identities. Your players keep their existing roles, preferences and initial abilities; opponent team brands and tactical identities also remain unchanged. Opponent names are derived when needed, while your roster stores its generated names. Save validation checks both against the seed.

The weekly progress display is calculated from existing game state: whether the activity is complete, the line-up is ready and a match report exists. It does not add another stored progress counter.

Estimated gold lead is the existing match advantage multiplied by 100 and rounded. It is a presentation aid, not an economy simulation or a new match modifier. The chart receives only revealed events. Highlighting splits commentary into plain text and styled text nodes; it never interprets commentary as HTML.

The save envelope remains version 1 and Match Engine V2 calculations and report wording remain unchanged. The identity name pools and generation order must remain stable for these saves; future changes need compatibility handling.

## Files created

- `src/data/playerNames.ts` — fictional identity pools.
- `src/utils/playerIdentities.ts` — repeatable roster identities.
- `src/utils/weeklyFlow.ts` — next-action guidance.
- `src/utils/matchPresentation.ts` — text highlighting, time formatting and gold estimate.
- `src/components/WeeklyProgress.tsx` — weekly progress navigation.
- `src/components/GoldLeadChart.tsx` — progressive chart and accessible values.
- `src/utils/experience.test.mjs` — identity, save, weekly flow and presentation tests.
- `docs/EXPERIENCE_UPDATE.md` — this report.

## Files modified

- `src/types/domain.ts` — optional personal name.
- `src/types/gameState.ts` — optional identity seed and start action input.
- `src/utils/createInitialGame.ts` — generated identities for seeded new games.
- `src/reducers/gameReducer.ts` — passes the new-game seed.
- `src/hooks/useGame.ts` — creates and saves a new-game identity seed.
- `src/utils/season.ts` — resolves opponent player identities.
- `src/utils/validateSave.ts` — validates generated identities and preserves older saves.
- `src/components/ManagementLayout.tsx` — navigation, season status and route scrolling.
- `src/components/MatchReportView.tsx` — highlights, progressive chart and labelled pace control.
- `src/pages/DashboardPage.tsx` — weekly hub, condition summary and opponent line-up.
- `src/pages/MatchPage.tsx` — guided preparation and next-week navigation.
- `src/pages/TeamPage.tsx` — personal names alongside handles.
- `src/pages/HomePage.tsx` — current gameplay description and clearer Continue action.
- `src/styles/management.css` — responsive weekly flow and hub styling.
- `src/styles/match.css` — highlights and responsive chart styling.
- `package.json` — includes the new tests in the existing test command.
- `GAME_CONCEPT_V1.md` — records the approved identity and interface decisions.
- `docs/FOLDER_STRUCTURE.md` — documents the new files' responsibilities.
- `docs/DEVELOPMENT_ROADMAP.md` — records completion of this refinement.
- `README.md` — updates current behaviour and links this report.

No files were removed. No packages were installed or changed.

## Verification

- `npm test`: 60 tests passed, including six new tests and existing simulator/save coverage.
- `npm run lint`: passed.
- `npm run build`: passed.
- `npm run validate:data`: passed.
- Local Vite browser checks: new game, weekly activity, five champion assignments, strategy selection, progressive playback, pause/resume, full report, save/reload and applying a result into week two.
- Desktop and mobile layouts were inspected. The mobile match view had no horizontal overflow at a 375-pixel content width. Small chart labels found during inspection were enlarged.

The temporary browser test server stopped during a tool-session interruption and was restarted. No application error was found in those checks.

## Limits and next task

Gold is explicitly an estimate. Opposing players have identities, but the match model still gives special individual treatment primarily to the notable opponent. Names are randomised when starting a new game, not every week or season. Team brands are fixed.

Recommended next task: play a complete season with this navigation and judge whether the next action and match turning points are now easy to follow before adding more systems.
