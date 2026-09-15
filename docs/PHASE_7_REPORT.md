# Phase 7 — Season progression

Phase 7 is complete. Road to Worlds now has a complete, playable six-match first-season loop. No packages, backend services or external APIs were added.

## What happens after a match

Once the full report is visible, **Apply result and advance** applies the result as one reducer action. Every player receives one match played and 8 Fatigue. A victory gives every player 4 Morale, 15 fans and 2 team synergy. A defeat removes 5 Morale, 5 fans and 1 synergy. Morale, Fatigue and synergy remain within 0–100; fans cannot fall below zero.

The action also writes a history entry, updates wins and losses, clears the completed activity, scouting, champions and strategy, and opens the next week. It cannot be applied twice. The next weekly fixture is selected from the six-week schedule:

1. Cinderwake Five
2. Meridian Keepers
3. Stillharbour Ward
4. Crosswind Parallax
5. Meridian Keepers
6. Cinderwake Five

## Standings and season ending

The standings route contains Road to Worlds and the four fictional opponents. Each completed week includes the player fixture plus one fixed fixture between the other teams, so records and positions change as the season progresses. The table sorts by wins, then fewer losses, games played and name. Match history records the week, opponent, outcome and rounded advantage margin.

After the sixth applied result, the season becomes complete and no new management or match can start. The final standings page displays a result based on the win total and a Start new season button. A new season retains player permanent ability changes, Potential, Matches Played and fans. It clears seasonal wins, losses, history, preparation and match report; restores Morale to at least 70 and Fatigue to at most 15; and resets synergy to 50.

## Save compatibility

The existing version 1 save key is unchanged. Phase 6 saves with an empty match history migrate without a reset. Progressed saves validate their exact fixture order, non-negative record, wins/losses totals, valid status and week. Completed reports remain recomputed from their saved inputs as in Phase 6. Invalid or inconsistent saves are rejected rather than used.

## Files created

- `src/utils/season.ts`
- `src/utils/season.test.mjs`
- `src/pages/StandingsPage.tsx`
- `docs/PHASE_7_REPORT.md`

## Files modified

- `src/types/gameState.ts`
- `src/utils/createInitialGame.ts`
- `src/utils/simulateMatch.ts`
- `src/reducers/gameReducer.ts`
- `src/hooks/useGame.ts`
- `src/utils/validateSave.ts`
- `src/components/MatchReportView.tsx`
- `src/pages/MatchPage.tsx`
- `src/pages/DashboardPage.tsx`
- `src/pages/HomePage.tsx`
- `src/components/ManagementLayout.tsx`
- `src/routes/AppRoutes.tsx`
- `src/styles/management.css`
- `package.json`
- `README.md`
- `docs/DEVELOPMENT_ROADMAP.md`
- `docs/FOLDER_STRUCTURE.md`

No files were removed. No dependency versions changed.

## Verification

- `npm run lint` — passed.
- `npm run build` — passed.
- `npm run validate:data` — passed.
- `npm test` — all 42 tests passed.

New automated tests cover the full schedule, atomic result application, condition and record updates, repeat prevention, six-match completion, standings totals, a new season, Phase 6 save migration and invalid progressed saves.

Browser testing started a new game, completed Rest, prepared all five roles, selected Objective Control and played Cinderwake Five. Applying the victory updated the Week 2 dashboard to 1–0, 115 fans and 52 synergy, with Meridian Keepers as the next opponent. The standings table showed the player result plus the scheduled other-team fixture. Mobile testing confirmed report and table layouts had no horizontal page overflow.

The initial game scope is now complete. Future work should be driven by playtesting and focused balancing rather than a new large system.
