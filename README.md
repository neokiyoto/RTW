# Road to Worlds

Road to Worlds is an original, single-player, text-based esports management web game. Phases 1–7 are complete. You can manage a five-player team through a six-match season: complete a weekly activity, prepare champions and a strategy, play the match, apply its result and follow the standings.

## Current status

The latest experience update adds a guided **This week → activity → line-up and strategy → match and result** flow, highlighted commentary and an estimated gold-lead chart. New games generate original esports handles and fictional personal names for your five players and the four opposing line-ups. Existing saves keep their identities. See `docs/EXPERIENCE_UPDATE.md` for details and verification.

Included:

- React, Vite and TypeScript

- React Router

- Plain CSS

- ESLint

- Responsive home page

- Central route configuration

- Project documentation

- Shared player, champion, strategy and opponent types

- Five fictional players, 12 champions, four strategies and four opponents

- A standalone static-data validation command

- Central game state managed with `useReducer`

- New game, Continue, Save game and Reset game controls

- Versioned browser saving with validation and recovery messages

- Dashboard and team screens

- Five weekly activities and one automatic weekly event, with saved results

- Match preparation with eligible champion choices, strategy selection and readiness checks

- Match Engine V2: 25-31 linked events with evolving momentum, map control and one integrated major event

- Progressive commentary, pause/resume, three speeds, optional follow and a Show full report button

- A six-week fixture schedule, match history and five-team standings

- Match consequences for morale, fatigue, fans, synergy, records and experience

- Final-season result and a new-season option that retains player growth

Not included yet:

- Online multiplayer, accounts and cloud saving

## Requirements

- Node.js 22.12 or newer is recommended (Vite also supports Node.js 20.19 or newer)

- npm 10 or newer

- Windows PowerShell, Terminal, or another command-line shell

## Start the development server

```powershell

cd esports-manager-text-game

npm install

npm run dev

```

Open the local address printed by Vite, normally `http://localhost:5173`.

## Quality checks

```powershell

npm run lint

npm run build

npm run validate:data

npm test

```

The production files are written to `dist`.

Phase 2 verification passed: `npm run lint`, `npm run build` and `npm run validate:data`. An additional check confirmed that the validator rejects 13 deliberately invalid data cases without mutating the original data. No browser interaction check was needed because the application screens and entry point were unchanged.

The lockfile's inaccessible internal package download URLs were replaced with public npm registry URLs so the existing dependencies could be installed with `npm ci`. Package versions and integrity hashes were preserved. No dependency was added or upgraded.

The static-data check uses Node.js 22.12 or newer with built-in experimental TypeScript stripping; it may print an experimental-feature warning. It runs separately from lint and build, without loading the data into the home page.

## Static data model

`src/types/domain.ts` defines simple object types and the allowed roles, focuses, playstyles and strategy IDs. The four datasets live in `src/data/`.

- Players have one role, a role-appropriate focus, a playstyle and exactly two preferred champion IDs. Mechanics, Game Sense, Teamwork and Leadership describe ability. Morale and Fatigue describe temporary condition; Potential affects individual development. Matches Played is a non-negative whole number. No Skill or overall rating is stored. The team screen derives overall from the four ability values.

- Champions have a primary role, an optional secondary role, an archetype and four ratings. Player ratings, condition, champion ratings and opponent strength all use whole numbers from 0 to 100. Higher difficulty means harder to play; higher fatigue means more tired. These are initial content values, not balanced match formulas.

- Strategies describe an approach and list supporting focuses. Phase 6 uses these for small compatibility benefits and different early, middle and late strengths.

- Opponents have an identity, overall strength, a preferred strategy ID, strong and weak phases, one notable player, an exploitable weakness and a drafting tendency. They do not contain full simulated rosters.

Each role has exactly three eligible champions:

| Role | Eligible champions |

| --- | --- |

| Top | Brannoch, Velsari, Orravel |

| Jungle | Brannoch, Kelroth, Nyssik |

| Mid | Aurelis, Threnna, Iskavel |

| Carry | Aurelis, Serrune, Draveli |

| Support | Kelroth, Tovren, Mirethi |

Brannoch is Top/Jungle, Kelroth is Jungle/Support and Aurelis is Mid/Carry. A flexible champion has one archetype shared across its roles; eligibility does not require an exact player-focus match.

`src/utils/validateStaticData.ts` reports data errors without changing the inputs. It checks counts, unique IDs, names, ratings, role coverage, flexible pairs, player focuses, preferred champion references and opponent strategy references. It validates authored, TypeScript-checked data only. Browser saves use the separate `validateSave.ts` validator for untrusted input.

## Game state and browser saves

Start new game creates a fresh copy of the five-player roster at week 1 of a six-match season, with no wins or losses, 100 fans and 50 team synergy. Weekly activity and strategy are unset, opponent knowledge is zero and match history is empty. These initial values are foundations for later phases, not match calculations.

The reducer lives above the routes through `useGame` in `App`. Its actions are `START_GAME`, `LOAD_SAVE`, `RESET_GAME`, `RESOLVE_WEEKLY_ACTIVITY`, `ASSIGN_CHAMPION`, `SELECT_STRATEGY`, `PLAY_MATCH`, `ADVANCE_WEEK` and `START_NEW_SEASON`. State and controls are passed through props to the five screens; Context is not needed for this short component tree.

- Starting a game saves it immediately and opens the dashboard. Resolving a weekly activity saves its effects and event together. Champion and strategy changes also save immediately. Save game retries or explicitly saves the current game.

- Refreshing a management route returns to the home screen. Continue reads and validates the save before opening the dashboard. If a game is already active, Continue resumes it without replacing unsaved in-memory changes.

- Starting again or resetting requires an inline confirmation. Reset removes only this game's save key and clears the current game. A failed reset keeps the current game available.

- Invalid or incompatible saves disable Continue and show recovery choices. They are not automatically deleted or overwritten.

- If browser storage is blocked or full, the app reports the failure. A new game remains available in memory, but may be lost when the page closes or refreshes.

The save key is `text-esports-manager-save-v1`. The JSON envelope is `{ version: 1, game: ... }`. Loading checks every required field, all five known player identities and their permanent role/focus/playstyle/preferences, numerical ranges and the currently supported season state. Unknown extra fields are discarded. Version 1 accepts week 1 with an optional resolved activity, weekly report, partial or complete champion assignments and a selected strategy, plus an optional completed opening match (see below). Existing Phase 3 saves migrate their missing weekly report to null. Phase 3 and 4 saves receive empty champion assignments when that field is missing; no reset is required. Present assignments must contain exactly the five roles and valid, eligible, unique champion IDs or null. A resolved activity requires a valid event report and consistent opponent knowledge. Later phases must extend the model and validator together while preserving existing saves where practical.

Saves belong to the current browser profile and site address. For example, localhost and 127.0.0.1, or different ports, have separate saves. There is no cloud saving or automatic synchronisation between tabs; use a single game tab. Future actions that change gameplay state will need to use the saving flow as they are added.

`npm test` uses Node's built-in test runner with TypeScript stripping, without a new dependency. It checks reducer isolation, save round trips, corrupt data, missing fields, unsupported versions, failed writes, blocked storage and reset isolation. It also checks all activity effects, development outcomes, event persistence, repeat prevention, rating limits and Phase 3 save migration. See the Phase 4 report for verification details.

## Documentation

- `GAME_CONCEPT_V1.md` — agreed game design and project constraints

- `docs/FOLDER_STRUCTURE.md` — source folder responsibilities

- `docs/DEVELOPMENT_ROADMAP.md` — high-level phased sequence

- `docs/POWERSHELL_SETUP.md` — beginner-friendly Windows setup

- `docs/PHASE_1_REPORT.md` — Phase 1 implementation record

- `docs/PHASE_3_REPORT.md` — Phase 3 implementation and verification record

## Weekly management

The dashboard shows week 1, condition and Cinderwake Five as the opening opponent. Tactical details are hidden until Opponent Analysis reveals the full profile. The team page shows all player attributes, preferences and a captain chosen by highest Leadership.

| Activity | Effect before the weekly event |

| --- | --- |

| Team Training | Each player: Teamwork +1, Fatigue +8; synergy +4 |

| Individual Training | Selected player: Fatigue +12; chance of Mechanics or Game Sense +1 |

| Opponent Analysis | Full opponent knowledge; no ability gain |

| Rest | Each player: Fatigue −15, Morale +3 |

| Team Building | Each player: Morale +6; synergy +5 |

Individual development chance is `(Potential + 100 − current ability) / 200`, bounded between 10% and 90%. An attribute already at 100 cannot improve. These are initial balancing values.

One equally likely event accompanies each activity: a player gains 3 Morale after good practice, a player gains 3 Fatigue after a long review, or team synergy rises by 2 after a discussion. All bounded values stay within 0–100. Reports show actual combined changes after those limits.

Selection stays local until completion. Completion applies the activity and event atomically, prevents repeat actions and saves the report. Navigating or reloading a successfully saved game does not reroll it. The week stays at 1 until season progression is implemented.

- `docs/PHASE_4_REPORT.md` — full Phase 4 change inventory and verification

## Match preparation

Open Match preparation from the management navigation. Choose one eligible champion per role and one of the four strategies. A champion can only occupy one role at a time, including flexible champions. Choices can be replaced or cleared and are saved automatically.

The game stores a champion ID or null for each of the five roles, plus a strategy ID or null. Readiness is calculated from these choices: all five roles need unique eligible champions, a strategy must be selected and the weekly activity must be complete. The guided match screen opens champion and strategy choices after the weekly activity is complete. Existing saved preparation is retained.

Player preferences, focus matches, primary or secondary roles and champion ratings are shown to help selection. These provide small match benefits alongside the more important player abilities, condition and preparation.

Phase 5 verification passed lint, build, static-data validation and all 29 tests. Browser checks covered flexible roles, duplicate prevention, clearing choices, readiness, saved selections after reload and mobile layout. See `docs/PHASE_5_REPORT.md` for the full change inventory.

## Playing a season

Complete the weekly activity, assign all five champions and select a strategy. Play match progresses the current fixture through linked encounters and saves the completed report immediately. The winner is determined by the final encounter after earlier events have changed the match state. Playback reveals 25, 28 or 31 entries at 1.8-second intervals (about 45–56 seconds total). Relaxed uses 3 seconds and Fast uses 0.7 seconds per entry. Pause/resume and Show full report let you control reading time. Victory or Defeat appears after the final entry. Returning to the match page replays the same commentary without simulating again.

Preparation locks once a match has been played. Apply result and advance then adds 8 Fatigue and one Matches Played to every player. Victory gives every player 4 Morale, 15 fans and 2 team synergy; defeat removes 5 Morale, 5 fans and 1 synergy. Values remain between 0 and 100 where applicable. It records the result, clears preparation and opens the next week.

Phase 6 added `currentMatch` to version 1 saves. Missing values in older saves become null. V2 reports contain `engineVersion: 2`, the opponent ID, three saved random inputs, timed events with state snapshots and the final result/margin. The first two inputs seed reproducible encounter draws; the third resolves the one major event. Loading recomputes the report from unchanged preparation and rejects inconsistent data. Reports without an engine version are validated by the preserved V1 engine and remain playable. Their next match uses V2. The save key and envelope stay at version 1. Future formula or wording changes must preserve or migrate completed reports under a new engine version.

The formulas use weighted player ability, condition, synergy, small champion compatibility benefits and stage-specific strategies. Strategy and opponent tendencies influence encounter selection. Each encounter changes momentum and control, which influence later opportunities. One major event modifies its encounter's performance edge by six points and momentum by three; its eventual effect depends on the following encounters. Potential does not directly improve match strength. See `docs/MATCH_ENGINE_V2_REPORT.md` for the current architecture and verification; the Phase 6 report describes the historical V1 engine.

The six fixtures are Cinderwake Five, Meridian Keepers, Stillharbour Ward, Crosswind Parallax, Meridian Keepers and Cinderwake Five. Each week also resolves one fixed fixture between the other teams, so the five-team standings table reflects all completed fixtures. The result screen after week six offers a new season. It keeps player ability, potential, matches played and fans, restores condition to at least 70 Morale and at most 15 Fatigue, and resets the season record, table and preparation.

Phase 7 adds match-history save validation. Existing Phase 6 saves with no history migrate normally. A progressed save must have the matching fixture order, a consistent record and an appropriate week; invalid save data is rejected without crashing the app.

Phase 7 checks passed: lint, build, static-data validation and all 42 tests. Browser checks verified progressive and instant reveal, result application, standings, next-week reset and mobile-safe tables. See `docs/PHASE_7_REPORT.md` for the complete implementation record.

Match Engine V2 checks passed: lint, build, static-data validation and all 51 tests. The refinement retains the existing season consequences and browser saves. The complete reproducible example is in `docs/MATCH_ENGINE_V2_EXAMPLE.md`; generate it again with `npm run example:match`.

The follow-up audit passes all 54 tests, lint, build and static-data validation. It corrects the week-five other-fixture winner to Crosswind and prevents preparation changes after season completion. Existing saved reports remain compatible; derived standings automatically reflect the correction. See the audit section in `docs/MATCH_ENGINE_V2_REPORT.md`.


The team identity update adds team and manager naming at career setup and under **Roster > Edit team & manager**. Names persist across seasons and existing saves remain compatible. The interface now uses a red-and-black esports theme. See `docs/TEAM_IDENTITY_UPDATE.md` for the file inventory and verification.
