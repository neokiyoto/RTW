# Phase 6 — Match simulation

Phase 6 is complete. The opening match against Cinderwake Five is playable after preparation. It produces five stage entries and one turning point, reveals them progressively and displays Victory or Defeat. No dependencies or backend were added.

## Data and flow

`currentMatch` is null until Play match succeeds. It then stores the opponent ID, random inputs, six chronological entries, final margin and result. Each entry stores its minute, kind, original commentary and accumulated advantage. Positive advantage favours your team.

The hook draws three numbers for the timing, involved player and outcome of one event. The reducer and simulator are deterministic with those inputs, so React rendering cannot reroll the match. Repeated play actions and preparation edits are rejected once a report exists. Results save before presentation starts. Navigating away or reloading replays the saved report; the reveal timer never changes game state. Show full report bypasses the remaining reveal delay.

Older version 1 saves migrate a missing currentMatch to null. Present reports are recomputed from their saved random inputs and preparation and checked for consistency. This requires future formula or commentary edits to include a report migration or a preserved simulation version. It is corruption validation, not protection against deliberate save editing.

## Initial calculation model

The stages are opening lanes (5 minutes), mid-game rotations (12), major objective (18), late-game setup (25) and final engagement (32). Each adds team strength minus opponent strength to accumulated advantage. A positive final margin wins; a tie favours the defending opponent without another random roll.

Player ability is 35% Mechanics, 30% Game Sense, 25% Teamwork and 10% Leadership. Condition adds `(Morale − 50) × 0.08` and subtracts `Fatigue × 0.12`. Relevant champion rating adds `(rating − 50) × 0.08`: early rating for opening, team fighting for middle stages and late rating for closing stages.

Champion fit adds 2 for preference, 1 each for focus, primary role and strategy support, and 1 for an aggressive player's early champion rating or patient player's late rating of at least 70. Difficulty above Mechanics subtracts the difference divided by 25. Matching player focus to strategy adds 1. Aggressive players gain 2 early and lose 1 elsewhere; patient players gain 2 late and lose 1 elsewhere. Balanced players have no stage modifier.

Team strength averages the five performances and adds `(synergy − 50) × 0.1`. Protect the Carry instead weights the average at 80% and the carry's performance at 20%, making carry quality and condition more important to that plan.

| Strategy | Early | Middle | Late |
| --- | ---: | ---: | ---: |
| Early Aggression | +6 | +1 | −3 |
| Objective Control | 0 | +5 | +1 |
| Late-Game Scaling | −4 | +1 | +6 |
| Protect the Carry | −2 | +2 | +4 |

Opponents use their overall strength and strategy profile, plus 4 in their strong phase and minus 4 in their weak phase. Unanalysed opponents have 2 extra tactical strength. Analysis removes this and subtracts a further 2 in their weak phase. Crosswind replaces its default strategy profile with an adaptive middle-game bonus of 5 against early aggression or 3 against other plans, representing its flexible identity. All four opponents are supported and tested, but only Cinderwake is scheduled in Phase 6.

The single event occurs after the early, middle or late setup stage, involves one player and either gains or loses ground. Its positive chance is bounded to 20–80% and considers Game Sense, Teamwork, captain Leadership, Morale, Fatigue, synergy, champion fit, playstyle and scouting. Aggressive events shift 6 points, balanced 5 and patient 4; experience reduces a negative shift by up to 1 point over 100 matches. Potential is reserved for development. The event can decide a close match, but the five calculated stages dominate large strength differences.

These are initial original balancing values, not a claim of finished competitive balance. Commentary reflects each stage's local outcome and current advantage, plus the involved player and champion at the turning point.

## Files created

- `src/types/match.ts`
- `src/utils/simulateMatch.ts`
- `src/utils/simulateMatch.test.mjs`
- `src/components/MatchReportView.tsx`
- `docs/PHASE_6_REPORT.md`

## Files modified

- `src/types/gameState.ts`
- `src/utils/createInitialGame.ts`
- `src/reducers/gameReducer.ts`
- `src/hooks/useGame.ts`
- `src/utils/validateSave.ts`
- `src/utils/gameState.test.mjs`
- `src/pages/MatchPage.tsx`
- `src/pages/DashboardPage.tsx`
- `src/pages/HomePage.tsx`
- `package.json` — includes the new test file; dependency versions unchanged.
- `README.md`
- `docs/DEVELOPMENT_ROADMAP.md`
- `docs/FOLDER_STRUCTURE.md`

No files removed; no packages installed or upgraded.

## Verification

- `npm run lint` — passed.
- `npm run build` — passed.
- `npm run validate:data` — passed.
- `npm test` — all 36 tests passed.
- `npm run dev -- --host=127.0.0.1 --port=5174` — npm did not forward the options in this environment; Vite selected the available localhost port 5174. Browser verification used that address after the initial IPv4 connection was refused.

New tests check determinism, immutability, chronological reports, exactly one bounded event, early/middle/late event timing, both outcomes, readiness and invalid random inputs, strong and weak teams across all opponents, condition and strategy effects, scouting, distinct opponent profiles, repeat prevention, locked preparation, save round trips, old-save migration and corrupt report rejection.

Browser checks started a fresh local game, completed Rest, assigned five champions and chose Objective Control. Play match was disabled while preparation was incomplete. The report then revealed progressively and finished in Victory. Reload and Continue restored identical commentary; Show full report revealed it immediately. Preparation controls were replaced by the locked report. At a 390-pixel viewport, report text wrapped legibly and there was no horizontal overflow.

No lint, build or test errors remained. The existing experimental Node TypeScript-stripping warning is informational.

## Remaining scope

The opening match is resolved, but season wins/losses, fans, player condition, development and match history remain unchanged. There is no next-week or standings feature. Phase 7 — Season progression is the next task and has not started.
