# Phase 3 — Game state foundation

Status: complete. Phase 4 has not started.

## Implementation

The central reducer creates, loads and resets a game. Each new game owns a separate copy of the fictional roster, including each player's preferred champion list. The initial season starts at week 1 of six, with zero wins/losses, 100 fans and 50 team synergy. Preparation fields remain unset and match history remains empty.

The existing home page now supports Start new game, Continue, Save game and Reset game, and shows a small active-season summary. Its overall layout and routes are preserved. Inline confirmation protects existing games when starting again or resetting. No management screens or gameplay were added.

The hook in `App` owns the reducer and passes state through props. Context is deferred until there is a need for it across screens. Storage operations run in action handlers, outside the reducer. Initial rendering reads save availability without writing to storage, including under React Strict Mode.

The versioned key is `text-esports-manager-save-v1`, with an envelope containing `version: 1` and `game`. The validator receives unknown input and rebuilds known fields after checking the roster, permanent player details, ratings, counts and supported initial season values. Invalid and incompatible saves remain untouched until the user chooses replacement or reset. Storage access, write and removal failures produce messages instead of crashing the page. Reset only removes the game's own key, and a failed removal preserves the active game.

## Files created

- `src/types/gameState.ts`
- `src/utils/createInitialGame.ts`
- `src/reducers/gameReducer.ts`
- `src/utils/validateSave.ts`
- `src/utils/saveStorage.ts`
- `src/hooks/useGame.ts`
- `src/utils/gameState.test.mjs`
- `docs/PHASE_3_REPORT.md`

## Files modified

- `src/app/App.tsx`
- `src/routes/AppRoutes.tsx`
- `src/pages/HomePage.tsx`
- `src/styles/home.css`
- `package.json` — added the test command only
- `README.md`
- `docs/DEVELOPMENT_ROADMAP.md`
- `docs/FOLDER_STRUCTURE.md`

## Files removed

- `src/hooks/.gitkeep`
- `src/reducers/.gitkeep`

## Verification

- `npm run lint` — passed.
- `npm run build` — passed.
- `npm run validate:data` — passed; the Phase 2 data remains valid.
- `npm test` — all eight tests passed. Cases include independent state copies, save/load/reset round trips, malformed JSON, incompatible versions, 28 invalid-data mutations, every missing required field, unknown-field removal, failed writes, blocked storage and preserving unrelated storage entries.
- Browser checks on a separate local preview origin passed: no-save state, Start, immediate save, refresh, Continue, explicit Save, cancelled Reset, confirmed Reset and another refresh showing no save. Replacing an existing game also passed.
- The active save controls and summary were visually checked at 390px width. The temporary viewport override was then cleared.
- The normal desktop browser flow was checked through its accessible controls and status messages. Storage failures were covered by automated tests rather than browser configuration changes.

No packages were installed, upgraded or added. The test command uses the existing Node runtime; its experimental TypeScript stripping warning is expected.

The first `npm run dev -- --host 127.0.0.1 --port 5174` attempt lost its flags through the local command wrapper. A retry with PowerShell stop-parsing also failed. Starting the existing Vite binary directly with `node node_modules/vite/bin/vite.js --host=127.0.0.1 --port=5174` resolved the preview launch. No application lint, build or test errors occurred.

## Remaining scope

Only the initial week is supported. There is no management gameplay, champion selection, match calculation, commentary, standings or week advancement. Later phases must extend the state and save validator together, preserving version 1 saves where practical or providing an explicit migration. The first save format has no earlier saves to migrate.

Saves are local to one browser and origin. There is no cloud save or multi-tab synchronisation. Starting saves immediately, and Save game explicitly saves or retries; future gameplay actions need to call the persistence flow when introduced.

Recommended next task: Phase 4 — management screens, only when requested.
