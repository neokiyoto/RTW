# Folder Structure

This structure keeps the project understandable for a beginner and leaves room for the agreed game systems.

```text
esports-manager-text-game/
├── docs/                  Project guidance and phase reports
├── public/                Static files copied directly by Vite
├── src/
│   ├── app/               Root application component
│   ├── components/        Reusable visual components
│   ├── context/           React Context definitions when genuinely needed
│   ├── data/              Static fictional players, champions, strategies and opponents
│   ├── hooks/             Reusable React hooks
│   ├── pages/             Route-level page components
│   ├── reducers/          Pure central game-state transitions
│   ├── routes/            Central React Router configuration
│   ├── styles/            Plain CSS files
│   ├── types/             Shared TypeScript types
│   ├── utils/             Small pure helper functions
│   └── main.tsx           Browser entry point
├── GAME_CONCEPT_V1.md     Source-of-truth design document
├── eslint.config.js       ESLint flat configuration
├── index.html             Vite HTML entry document
├── package.json           Scripts and dependencies
└── vite.config.ts         Vite configuration
```

## Current implementation boundaries

Phase 1 uses `app`, `components`, `pages`, `routes` and `styles`. Phase 2 adds `types/domain.ts`, four datasets in `data`, and `utils/validateStaticData.ts` with the standalone `utils/checkStaticData.ts` command entry point.

Phase 3 adds `types/gameState.ts`, `reducers/gameReducer.ts` and `hooks/useGame.ts`. `App` owns the hook and passes the session through the existing routes to the home page. `utils/createInitialGame.ts`, `utils/validateSave.ts` and `utils/saveStorage.ts` handle initial state, untrusted save validation and browser persistence. `utils/gameState.test.mjs` exercises the pure state and storage helpers using Node's built-in test runner.

Phase 4 adds `pages/DashboardPage.tsx`, `pages/TeamPage.tsx`, `components/ManagementLayout.tsx` and `styles/management.css`. Activity and event definitions live in `data`; management types live in `types/management.ts`; pure activity effects and derived overall ratings live in `utils/management.ts`, with tests in `utils/management.test.mjs`. The reducer resolves the activity and event together, while the hook draws randomness and saves the result.

Phase 5 adds `pages/MatchPage.tsx` for champion and strategy selection. `utils/matchPreparation.ts` checks role eligibility, unique choices and readiness, with tests in `utils/matchPreparation.test.mjs`. `types/gameState.ts` holds the five-role assignment map and nullable strategy choice. The reducer handles assignment and strategy actions; the hook saves them and the save validator accepts partial preparation while migrating older saves to empty assignments.

Phase 6 adds `types/match.ts` for reports and random inputs, `utils/simulateMatch.ts` for deterministic calculations and original commentary, `utils/simulateMatch.test.mjs` for simulation tests, and `components/MatchReportView.tsx` for timed reveal and instant reveal. The existing match route switches from preparation to the report. The hook supplies random inputs once; the reducer saves a `currentMatch` and locks preparation. Save validation recomputes the report from the saved inputs to reject inconsistent results.

Phase 7 adds `utils/season.ts` for the six-week schedule, derived standings and final-season wording, `utils/season.test.mjs` for season transitions, and `pages/StandingsPage.tsx` for the league table and match history. `GameState` now retains played matches and a complete season status. Advancing applies one report atomically, clears weekly preparation and opens the next fixture. Starting a new season retains player ability and experience but clears season records.

The `context` folder remains reserved with `.gitkeep`; passing props through the short route tree is sufficient. The complete six-match first-season loop is now present.

Match Engine V2 keeps those boundaries. `data/matchEncounters.ts` contains original encounter wording and strategy/opponent choices. `utils/simulateMatch.ts` progresses match state, `utils/matchStrength.ts` calculates performance and `utils/matchRandom.ts` supplies reproducible draws. `types/match.ts` includes event snapshots and the report engine version. `utils/legacySimulateMatch.ts` preserves the old implementation solely for validating existing saved reports.

`components/MatchReportView.tsx` handles playback only, using `styles/match.css`. `utils/matchEngineV2.test.mjs` checks narrative structure, seeded performance comparisons and compatibility. `utils/exampleMatch.ts` generates the complete example with `npm run example:match`. The reducer, season logic, route structure and management screens retain their existing responsibilities.

The guided experience update adds `components/WeeklyProgress.tsx` and `utils/weeklyFlow.ts` for weekly guidance, `components/GoldLeadChart.tsx` and `utils/matchPresentation.ts` for the estimated gold chart and safe text highlighting, and `data/playerNames.ts` plus `utils/playerIdentities.ts` for stable generated identities. `utils/experience.test.mjs` tests the new guidance, identities, save lifecycle and presentation helpers. Existing pages, styles, types and save validation integrate these additions without new routes or dependencies.

`components/TeamProfileForm.tsx` provides career and roster naming. `utils/teamProfile.ts` validates names and supplies legacy display defaults, using `TeamProfile` from `types/domain.ts`.
