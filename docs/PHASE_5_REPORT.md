# Phase 5 — Match preparation

Phase 5 is complete. The existing application now lets you assign one eligible champion to each role, choose one of four strategies and see what remains before the team is ready. Match simulation and season progression have not started.

## How it works

The game stores five champion choices, one per role, and one strategy choice. An empty choice is null. Flexible champions can use either eligible role but cannot appear twice in the same team. The reducer rejects unknown, ineligible or duplicate choices. The interface also disables champions already assigned elsewhere.

Readiness is calculated whenever the state changes rather than saved separately. It requires five valid unique choices, one player per role, a valid strategy and a completed weekly activity. Preferences, focus matches and ratings provide information only; no match formulas or bonuses have been added.

Selections save automatically through the existing localStorage flow. Version 1 saves remain compatible: older saves without assignments receive five empty choices, preserving players and weekly results. Incomplete preparation is valid save data.

## Files created

- `src/pages/MatchPage.tsx` — preparation screen.
- `src/utils/matchPreparation.ts` — eligibility, assignment and readiness helpers.
- `src/utils/matchPreparation.test.mjs` — ten preparation and save compatibility tests.
- `docs/PHASE_5_REPORT.md` — this report.

## Files modified

- `src/types/gameState.ts` — assignment map, strategy choice and explicit actions.
- `src/utils/createInitialGame.ts` — empty initial assignments.
- `src/reducers/gameReducer.ts` — validated selection changes.
- `src/hooks/useGame.ts` — shared action-and-save flow and selection handlers.
- `src/utils/validateSave.ts` — preparation validation and older-save migration.
- `src/utils/gameState.test.mjs` — updated valid save shape and unknown-strategy case.
- `src/routes/AppRoutes.tsx` — protected preparation route.
- `src/components/ManagementLayout.tsx` — preparation navigation.
- `src/styles/management.css` — wrapping navigation for small screens.
- `src/pages/DashboardPage.tsx` — preparation link after the weekly activity.
- `src/pages/HomePage.tsx` — current phase and feature text.
- `package.json` — preparation tests added to the existing test command.
- `README.md` — current features, state, saving and preparation instructions.
- `docs/DEVELOPMENT_ROADMAP.md` — Phase 5 complete; Phase 6 not started.
- `docs/FOLDER_STRUCTURE.md` — preparation file responsibilities.
- `AGENTS.md` — current phase status.

No files were removed. No packages were installed, changed or upgraded.

## Verification

- `npm run lint` — passed.
- `npm run build` — passed.
- `npm run validate:data` — passed.
- `npm test` — all 29 tests passed.
- `node node_modules/vite/bin/vite.js --host=127.0.0.1 --port=5174` — local browser verification server.

Automated checks cover eligible and flexible roles, duplicate rejection, clearing and replacing choices, all strategies, readiness, immutable state updates, partial and complete save round trips, corrupt assignments, and Phase 3/4 save migration. Existing state and management tests still pass.

Browser checks confirmed that an existing management save continued successfully, all three flexible champions worked in their secondary roles, duplicate options were disabled and released when reassigned, and a complete team showed ready. Reloading and continuing restored all choices and strategy. Clearing a champion made the team incomplete again. Navigation and champion cards were checked at a 390-pixel mobile width.

No implementation errors remained after verification. The home layout and existing management behaviour were preserved.

## Remaining scope

The game can manage and prepare the team, but cannot play a match or advance beyond week 1 yet. The next task is Phase 6 — Match simulation, only when requested. Phase 7 will add season progression.
