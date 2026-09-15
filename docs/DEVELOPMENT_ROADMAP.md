# Development Roadmap

The project should advance in small, testable phases. This document sets the sequence without defining implementation details that belong to later work.

## Phase 1 — Technical foundation

Status: complete.

- Initialise Vite with React and TypeScript
- Install React Router
- Add the agreed folder structure and documentation
- Create a responsive placeholder home page
- Confirm the development server, ESLint and production build

## Phase 2 — Static domain data and types

Status: complete. Five players, 12 champions (three choices per role), four strategies and four opponents are defined. The agreed three flexible-role pairings are included. Static-data validation, ESLint and the production build passed. The Phase 1 interface is unchanged.

- Add shared TypeScript types
- Add the initial fictional roster, champions, strategies and opponents
- Add validation for static data
- Do not add match formulas yet

## Phase 3 — Game state foundation

Status: complete. Central reducer state, an independent initial roster, versioned localStorage saving/loading/resetting and untrusted-save validation are implemented. The existing home page exposes the save lifecycle. Lint, build, automated tests and browser lifecycle checks passed. No management or match gameplay was added.

- Add `useReducer`
- Add the initial season state
- Add versioned localStorage save, load and reset handling
- Validate loaded data so invalid saves do not crash the application

## Phase 4 — Management screens

Status: complete. Dashboard and team routes, five weekly activities, one atomic weekly event, repeat prevention, saved reports and Phase 3 save migration are implemented. Lint, build and 19 tests passed; browser management flows were checked.

- Add dashboard and team routes
- Display team condition and opponent information
- Implement one weekly activity per week
- Resolve one small automatic weekly event

## Phase 5 — Match preparation

Status: complete. Champion assignments, four selectable strategies, duplicate and role validation, derived readiness and automatic saving are implemented. Existing Phase 3 and 4 saves remain compatible. Lint, build, static-data validation and 29 tests passed; browser preparation, reload and mobile checks passed.

- Add champion assignment
- Add strategy selection
- Validate that all five roles are ready before simulation

## Phase 6 — Match simulation

Status: complete. Five calculated stages, one bounded random event, six chronological commentary entries, progressive reveal and instant reveal are implemented. Completed reports save immediately and cannot be rerolled through normal play. Lint, build, static-data validation and 36 tests passed. Browser checks covered progressive reveal, instant reveal, reload persistence and mobile layout.

- Calculate meaningful match phases rather than individual actions
- Generate four to eight chronological report events
- Add one controlled in-match random event
- Reveal commentary progressively with a skip option

## Phase 7 — Season progression

Status: complete. A six-week schedule, match consequences, condition and fan changes, match history, a five-team standings table, save validation, season completion and a new-season option are implemented. Lint, build, static-data validation and 42 tests passed. Browser checks confirmed result application, standings and the next-week reset.

- Apply match consequences
- Update standings and match history
- Complete a six-match season
- Display the final season result and new-season option

Every phase must finish with `npm run lint` and `npm run build` passing before the next phase begins.

## Match Engine V2 — requested refinement after Phase 7

Status: complete. The owner's revised brief supersedes Phase 6's four-to-eight-event presentation target. New matches have 25, 28 or 31 linked play-by-play events across six phases, evolving momentum and map/objective control, player involvement, tactical encounter selection and one integrated major event. The final engagement uses the state created by earlier encounters.

The viewer adds pause/resume, three playback speeds, optional following of the latest action and a readable scrolling feed. Old completed reports retain their original engine; new reports carry engine version 2. Season progression and the version 1 save envelope remain compatible.

Verification: all 51 tests, lint, production build and static-data validation passed. See `MATCH_ENGINE_V2_REPORT.md` for architecture, file inventory, browser checks and limitations, and `MATCH_ENGINE_V2_EXAMPLE.md` for a complete generated contest. This is a match refinement, not an additional management phase.

Follow-up audit: all 54 tests, lint, build and static-data validation passed after correcting week-five standings and guarding completed-season preparation actions. Added coverage includes 480 strategy/opponent/condition report round trips. Saved-report engine versions are unchanged.

## Guided interface and match presentation — requested refinement

Status: complete. A weekly hub and three-step progress navigation guide activity, line-up and strategy, then match and result. Commentary highlights names and key moments. An estimated gold-lead chart reveals only the action already shown. New games generate stable fictional identities for all 25 players; existing saves retain their original names. Team brands and starting abilities are unchanged.

Verification: 60 tests, lint, production build and static-data validation passed. Desktop and mobile browser checks covered preparation, playback, save/reload and advancing to the next week. See `EXPERIENCE_UPDATE.md` for the full file inventory, model explanation and limitations. No additional phase or dependency was introduced.

## Team identity and red-and-black interface

Status: complete. Team and manager names can be entered at career setup and edited on the roster page. Validated names persist in the existing save format. Custom team names appear in headings and standings. The interface now uses a red-and-black esports theme. All 62 tests, lint and build passed. Desktop/mobile checks covered naming, renaming, reload persistence, validation and layout. See `TEAM_IDENTITY_UPDATE.md`.
