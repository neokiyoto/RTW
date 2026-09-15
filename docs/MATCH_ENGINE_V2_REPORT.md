# Match Engine V2 implementation report

The existing match engine now produces 25, 28 or 31 connected play-by-play entries. Matches move through opening, early game, mid game, major objectives, late game and a final engagement. This implements the owner's revised brief after Phase 7 and intentionally replaces the original four-to-eight-event limit.

## How it works

`simulateMatch.ts` runs eight to ten encounters. Each encounter creates a situation, lets the other players respond and resolves the consequence. One encounter includes an additional major moment. Each entry records a copy of the state at that time, so playback can show current information without exposing future developments.

The state tracks time, phase, initiative, momentum, map control, objective ownership, cumulative objective control and relative advantage. Signed values represent the balance between both teams, avoiding two redundant momentum counters. Player involvement and the preceding encounter are tracked locally. Secured objectives need five simulated minutes before another becomes available.

Encounter selection uses the initiating team's strategy, current pressure, phase, objective availability and previous encounter. Strategies favour different situations: aggression favours invades and duels, control favours rotations and objectives, scaling favours recovery, and carry protection favours protective positioning. Major-objective phases ensure an objective contest happens. There is no randomly selected prewritten match narrative.

The actor must have a suitable role. Focus and playstyle influence selection, and involvement weighting brings less-used players into the action. Aggressive players have greater performance variation; patient players gain late influence. Game Sense and Teamwork matter more in tactical encounters, while Mechanics matters more in direct exchanges. Morale, Fatigue, captain Leadership, experience and team synergy also contribute. Potential remains a development attribute.

Champions appear by name and affect performance through preferences, focus, primary role, playstyle, strategy fit, difficulty and phase ratings. Team-fighting ratings also affect grouped encounters. These remain modest modifiers alongside player ability and preparation; no abilities, items or damage model were introduced.

Opponent strength and strong/weak phases affect each encounter. Their preferred strategies and structured interpretations of existing tendencies influence the kinds of plays attempted. Cinderwake pressures lanes and invades; Meridian favours objectives and rotations; Stillharbour favours protection and recovery; Crosswind favours disruptive movements. Notable players add small role-sensitive pressure and appear in commentary. Opponent Analysis helps exploit the existing weaknesses through both selection and performance.

Setup changes map pressure; responses change momentum; resolution changes advantage, momentum and map control, and may secure an objective. Momentum is bounded and partly fades between exchanges. It helps later plays without locking in the outcome. Recovery opportunities and leadership help a trailing side stabilise. Earlier advantage contributes to the final exchange, whose resolved performance determines victory or defeat. The winner is not chosen before generating the contest.

The three existing random inputs are retained. Two seed reproducible draws for encounter choices and small performance variation; the third determines the integrated major event. That event changes its encounter edge by six points and momentum by three. Its later influence depends on how the contest develops; it does not automatically choose the winner.

## Presentation and persistence

The simulator completes synchronously when Play match is clicked, and the existing save flow stores its report. The viewer then reveals the already-resolved events. This preserves refresh safety while allowing the outcome to emerge internally from sequential state changes. Normal playback takes about 45–56 seconds; Relaxed takes 75–93 seconds and Fast about 18–22 seconds. Pause, resume, show-full-report and optional following of the latest action are available.

Result application remains in the existing reducer. Fatigue, morale, fans, synergy, experience, history, standings and six-week progression retain their previous behaviour. Ability development still belongs to weekly management. Applying a report twice is prevented.

The save envelope and key remain version 1. New reports have `engineVersion: 2`. Reports without an engine version are recomputed by the preserved V1 simulator, keeping already-saved short reports readable and applicable. Their next match uses V2. Unknown versions and inconsistent reports are rejected safely. Future calculation or wording changes require another report version or an explicit migration.

## Files created

- `src/data/matchEncounters.ts` — original encounter wording and tactical choices.
- `src/utils/matchStrength.ts` — ability, compatibility and encounter calculations.
- `src/utils/matchRandom.ts` — reproducible randomness and input validation.
- `src/utils/legacySimulateMatch.ts` — preserved old simulator for saved reports.
- `src/utils/matchEngineV2.test.mjs` — nine V2 tests, including seeded comparisons.
- `src/utils/exampleMatch.ts` — reproducible example command.
- `src/styles/match.css` — match-only presentation styles.
- `docs/MATCH_ENGINE_V2_EXAMPLE.md` — complete actual generated example.
- `docs/MATCH_ENGINE_V2_REPORT.md` — this report.

## Files modified

- `src/utils/simulateMatch.ts` — V2 state progression and encounter resolution.
- `src/types/match.ts` — snapshots, event metadata and report version.
- `src/utils/validateSave.ts` — version-aware report verification.
- `src/utils/simulateMatch.test.mjs` — existing simulation expectations updated for V2.
- `src/components/MatchReportView.tsx` — playback and visible match state.
- `src/pages/MatchPage.tsx` — match-day heading and locked-line-up wording.
- `package.json` — V2 test and example scripts.
- `GAME_CONCEPT_V1.md` — intentional change to the commentary target.
- `README.md` — current match behaviour and save compatibility.
- `docs/DEVELOPMENT_ROADMAP.md` — completed V2 refinement.
- `docs/FOLDER_STRUCTURE.md` — new files and responsibilities.

No files were removed. No packages were installed, removed or upgraded. The existing scaffold and unrelated screens were preserved. Build output was regenerated in `dist`.

## Verification

- `npm test`: 51 passed, zero failed or skipped, including all nine new V2 tests.
- `npm run lint`: passed.
- `npm run build`: passed.
- `npm run validate:data`: passed.
- `npm run example:match`: passed; its actual output is the accompanying example document.
- Development browser: tested using Vite on a separate localhost port to isolate test saves.

Tests cover chronological 20–35-event reports, bounded snapshots, one major event, valid results, roster involvement, six phases, deterministic replay, stronger-team win rates, condition and champion fit, strategy and opponent behaviour, momentum reversals, comebacks, thrown leads, major-event limits, legacy/V2 saves and corrupt reports. Existing tests also cover management development, match consequences, repeat prevention and completing a six-match season.

Browser checks confirmed hidden outcomes during playback, pause/resume, Fast pace, following toggles, instant reveal, result application and clean preparation for week two. Reload/Continue replayed exactly the same full commentary, checked against the pre-reload text. Mobile checks at 390 × 844 showed readable controls and commentary with no horizontal document overflow. The temporary viewport override was reset afterwards.

During implementation, a Fast Refresh lint issue was fixed by keeping the time formatter private to the component. Generated reports exposed self-referential phrasing and unsuitable actor roles; these were corrected. An objective contest was made explicit in the major-objective phase so valid matches cannot omit objectives entirely. No check remains failing.

## Example and remaining limitations

Read `MATCH_ENGINE_V2_EXAMPLE.md` for one complete 31-entry contest generated by `npm run example:match`. It includes the exact preparation and random inputs for reproduction.

This is an abstract contest, not detailed combat. Encounters still follow a regular three-entry rhythm; sentence variants can recur across seasons. Opponents retain one named notable player rather than full rosters. Playback position and speed reset when the viewer is reopened, while the match itself remains saved. History retains concise results rather than full past reports.

The prepared starting roster wins frequently in the seeded comparison fixture. Tests establish that quality and preparation matter and that reversals are possible; they do not establish ideal difficulty or entertainment value. The recommended next task is to play several matches with different strategies, then tune pacing, wording and balance from that feedback before adding systems.

## Follow-up audit — 15 September 2026

The requested double-check found and corrected two season integration issues:

- Week five incorrectly credited Meridian with the other fixture's win despite Cinderwake and Crosswind being its participants. Crosswind now receives that win, retaining Cinderwake's loss. Standings are derived, so existing saves automatically show corrected totals from week five onwards. Player match results and saved reports are unaffected.
- The reducer now rejects champion and strategy changes after season completion. Previously those actions could create state that the save validator rejected, although the normal UI did not expose the controls.

Regression tests reproduced both faults before the fixes. Tests now check fixture winners and each team's weekly appearances, completed-season preparation guards, and 480 report/save round trips across all four strategies, all four opponents and three condition levels.

Fresh verification: `npm test` passed all 54 tests; `npm run lint`, `npm run build` and `npm run validate:data` passed. Browser interaction checks were not repeated in this audit; the changes affect pure season/reducer logic, covered by the regression tests. Earlier browser results above remain the implementation-time checks.

This audit modified `src/utils/season.ts`, `src/reducers/gameReducer.ts`, `src/utils/season.test.mjs`, `src/utils/matchEngineV2.test.mjs`, this report, `README.md` and `docs/DEVELOPMENT_ROADMAP.md`. No files or packages were added or removed. No simulator formulas or commentary changed, preserving V1 and V2 report reproduction.
