# Phase 4 — Management screens

Status: complete. Phase 5 has not started.

## Implemented

- Protected dashboard and team routes; Start and Continue open the dashboard. Opening a management route without an active game returns home to load or start one.
- Team condition, player details, preferred champions, derived overall ratings and a captain identified by highest Leadership.
- The first opponent's opening record, with tactical details revealed by Opponent Analysis.
- Team Training, Individual Training, Opponent Analysis, Rest and Team Building, with descriptions of their effects and individual training target controls.
- One automatic small event alongside each resolved activity. Activity and event resolve in one pure reducer transition. Repeated actions are rejected, including after saving/loading; a current-state reference also prevents rapid clicks from saving a second outcome.
- Actual combined changes are displayed, with all ratings clamped to 0–100. Individual development uses Potential and current ability. Full balancing is deferred until the match loop exists.
- Automatic saving after management actions, manual retry and existing storage-failure messages. An already-active game is resumed without overwriting it from an older disk save.

The version 1 key and envelope remain unchanged. A missing weekly report in a Phase 3 save is loaded as null. Resolved activities require a valid report/event and matching opponent knowledge. Old saves remain usable; no reset is required. Previous app builds do not understand the extended management data.

## Files created

- `src/types/management.ts`
- `src/data/activities.ts`
- `src/data/weeklyEvents.ts`
- `src/utils/management.ts`
- `src/utils/management.test.mjs`
- `src/components/ManagementLayout.tsx`
- `src/pages/DashboardPage.tsx`
- `src/pages/TeamPage.tsx`
- `src/styles/management.css`
- `docs/PHASE_4_REPORT.md`

## Files modified

- `src/types/gameState.ts`
- `src/utils/createInitialGame.ts`
- `src/reducers/gameReducer.ts`
- `src/hooks/useGame.ts`
- `src/utils/validateSave.ts`
- `src/utils/gameState.test.mjs`
- `src/routes/AppRoutes.tsx`
- `src/pages/HomePage.tsx`
- `package.json` (test script only)
- `README.md`
- `docs/DEVELOPMENT_ROADMAP.md`
- `docs/FOLDER_STRUCTURE.md`

No files removed. No packages installed, added or upgraded. The existing home layout and static roster/champion data are preserved. State remains in App with props through the routes; no Context or architecture replacement was needed.

## Verification

- `npm run lint` and `npm run build` passed.
- `npm run validate:data` passed; the static roster, champions, strategies and opponents remain valid.
- `npm test`: 19 tests passed, covering the existing save lifecycle plus every activity, individual development success/failure, all event branches, input isolation, rating caps, invalid choices, replay prevention, old-save migration and malformed report rejection.
- Local preview: `node node_modules/vite/bin/vite.js --host=127.0.0.1 --port=5174`.
- Browser checks: Continue from the earlier Phase 3 test save, dashboard and roster navigation, hidden/revealed opponent information, analysis completion, event effects, activity lock, opening a protected route without an active game, persistence after reopening, starting a fresh game and individual training target/attribute controls. Selecting Sela and Game Sense showed a 66% improvement chance; completion correctly reported the observed failed improvement and fatigue change.
- Dashboard inspected at 390px width; temporary viewport restored afterwards.

No code check failures occurred. The interrupted preview server stopped and had to be restarted; its stale browser error tab was replaced. An exact-label selector did not match a training dropdown during automation; using its accessible combobox role resolved the check.

## Limitations and next task

The season remains at week 1 and Cinderwake Five is the fixed opening opponent. There is no champion assignment, strategy selection, match simulation, commentary, standings or week advancement. Opponent knowledge is stored for later match logic but applies no match bonus yet. Saves remain local to one browser/origin with no multi-tab synchronisation. If saving fails, the current result is retained in memory and Save game can retry; refreshing before a successful save can lose that result.

Next task: Phase 5 — match preparation, only when requested.
