# AGENTS.md

## Project

**Project name:** Road to Worlds  
**Repository:** `esports-manager-text-game`

This is a small, original, single-player, text-based esports management web game. It is a personal, zero-budget project intended to stay understandable and maintainable for a developer with limited React and TypeScript experience.

The current application stack is:

- React
- Vite
- TypeScript
- React Router
- Plain CSS
- localStorage for save data
- ESLint
- Vercel for deployment

Do not introduce a backend, database, authentication, cloud saving, multiplayer, paid API, AI-generated commentary, Redux, large UI framework, or other major dependency unless the user explicitly changes the project scope.

---

## Read before making changes

Before implementing gameplay or changing architecture, read these files:

1. `GAME_CONCEPT_V1.md` — source of truth for the agreed game design.
2. `docs/DEVELOPMENT_ROADMAP.md` — source of truth for development phase order.
3. `docs/FOLDER_STRUCTURE.md` — source of truth for folder responsibilities.
4. `README.md` — current project status and development commands.
5. The current user request — source of truth for the task being performed now.

If the current user request conflicts with an older project document, follow the user's current request and update the relevant documentation when the decision is clearly intentional.

Do not invent major gameplay systems that are not in `GAME_CONCEPT_V1.md`.

---

## Current development status

Phase 1 — Technical foundation is complete.
Phase 2 — Static domain data and types is complete.
Phase 3 — Game state foundation is complete.
Phase 4 — Management screens is complete.
Phase 5 — Match preparation is complete.
Phase 6 — Match simulation is complete.
Phase 7 — Season progression is complete.

Match Engine V2 replaces the original short reports with connected play-by-play. Preserve its engine version when changing saved-report calculations or commentary.

Do **not** reinitialise Vite, replace the existing application with a new scaffold, or redo Phase 1 unless specifically requested.

The planned phase order is:

1. Phase 1 — Technical foundation — complete
2. Phase 2 — Static domain data and types — complete
3. Phase 3 — Game state foundation — complete
4. Phase 4 — Management screens — complete
5. Phase 5 — Match preparation — complete
6. Phase 6 — Match simulation — complete
7. Phase 7 — Season progression — complete

Only implement the phase or task explicitly requested by the user. Do not silently start the next phase.

---

## Development principles

### Keep the project small

The purpose of the first version is to prove that this loop is enjoyable:

`prepare team -> choose champions -> choose strategy -> watch text match -> see consequences -> advance week`

Prefer the smallest implementation that supports that loop.

Do not add features merely because a typical management game might contain them.

### Beginner-friendly code

The project owner is still learning React and TypeScript.

Prefer:

- clear names
- explicit types
- small functions
- straightforward control flow
- simple React patterns
- comments only where they explain non-obvious game logic

Avoid unnecessary:

- advanced generics
- metaprogramming
- dependency injection
- elaborate design patterns
- deeply nested abstractions
- premature optimisation
- clever one-liners that reduce readability

If a simpler implementation is sufficient, use it.

### Preserve working code

Do not silently restructure the application.

Do not remove working features unless doing so is required for the requested task. If a replacement or architectural change is necessary, explain why in the final report.

Make targeted changes rather than broad rewrites.

---

## Game-design guardrails

The game must remain original.

Do not add:

- real esports teams
- real professional players
- copyrighted champions from existing games
- copied commentary
- copied UI text
- copied proprietary formulas
- protected artwork or game assets

Broad genre ideas such as team management, fictional champions, tactical preparation, player development, text commentary, standings, and simulated matches are acceptable, but implementation and content must be original.

Use British English in player-facing game text and project documentation.

---

## First-version scope

The first playable skeleton should remain centred on:

- one fictional five-player team
- Top, Jungle, Mid, Carry, Support roles
- approximately 12 original champions
- approximately three eligible champion choices per role
- some champions with two eligible roles
- four fictional opponent teams
- four team strategies
- one weekly management activity
- one small weekly event
- one controlled random event during each match
- connected chronological play-by-play commentary
- six-match season
- standings
- local browser saving

Explicitly excluded from the initial skeleton unless the user changes scope:

- contracts
- salaries
- transfer market
- sponsors
- staff hiring
- facilities
- equipment
- injuries
- multiplayer
- accounts
- cloud saves
- detailed MOBA combat
- individual champion abilities
- items or runes
- full pick/ban drafting
- complex finances
- animated matches

---

## Player model guardrails

The agreed player model contains:

- name
- role
- role focus
- playstyle
- two preferred champions
- Mechanics
- Game Sense
- Teamwork
- Leadership
- Morale
- Fatigue
- Potential
- Matches Played

Do not add a stored `skill` stat. Overall rating should be derived from underlying ability values.

Morale and Fatigue are temporary condition values.

Potential primarily affects development.

Matches Played may be converted to an experience category such as Rookie, Developing, Experienced, or Veteran.

Keep these systems simple until the core game loop has been tested.

---

## Champion model guardrails

The first champion model should remain lightweight.

Each champion may contain information such as:

- id
- name
- primary role
- optional secondary role
- archetype/focus
- early-game rating
- late-game rating
- team-fighting rating
- difficulty

Do not add champion abilities, detailed damage values, cooldowns, items, runes, skill trees, or complex counter tables during the skeleton phase.

Champion compatibility may later consider:

- player preference
- player focus
- player playstyle
- primary versus secondary role
- selected team strategy

Player quality, preparation, condition, and team decisions should matter more than champion compatibility alone.

---

## Match-simulation guardrails

Do not simulate every second, attack, ability, or movement.

The simulator should model meaningful phases and moments, such as:

- early game
- mid game
- major objective
- late game
- final engagement

Following the owner's Match Engine V2 brief, a normal match should contain about 20–35 connected chronological events. This intentionally replaces the original four-to-eight-event limit. Model actions, responses and consequences within meaningful phases, without simulating individual attacks or abilities.

Commentary must reflect the simulated state and decisions. It should not be unrelated random flavour text.

Randomness must remain controlled. Player decisions and team quality should matter more than random rolls.

Each match may contain approximately one important random event influenced by relevant state such as morale, fatigue, playstyle, game sense, teamwork, leadership, synergy, strategy, champion compatibility, and opponent preparation.

The random event should shift momentum rather than automatically decide the match.

---

## State management

When the project reaches the relevant phase:

- use `useReducer` for central game state
- use React Context only where needed to make that state available across routes
- avoid Redux or another state-management dependency

Keep reducer actions explicit and understandable.

Examples may include:

- `START_GAME`
- `SELECT_WEEKLY_ACTIVITY`
- `RESOLVE_WEEKLY_ACTIVITY`
- `SELECT_STRATEGY`
- `ASSIGN_CHAMPION`
- `PLAY_MATCH`
- `ADVANCE_WEEK`
- `RESET_GAME`
- `LOAD_SAVE`

These names are examples, not mandatory API contracts. Use the simplest action model that fits the implemented phase.

---

## Save-data rules

When localStorage is implemented:

- use a versioned save key, for example `text-esports-manager-save-v1`
- validate loaded data before using it
- invalid or outdated data must not crash the app
- preserve save compatibility where practical
- if a change intentionally breaks save compatibility, document it clearly

Do not add cloud saving for the initial version.

---

## Styling and UI

Use plain CSS unless the user explicitly requests another approach.

The interface should be:

- dark and clean
- text-first
- readable on desktop and mobile
- responsive without excessive visual complexity

Do not add a UI framework solely for convenience.

Do not redesign working screens while implementing unrelated game logic.

Accessibility basics should be preserved:

- semantic HTML where practical
- labelled interactive controls
- keyboard-usable buttons and links
- sufficient readable contrast
- no information conveyed only through colour

---

## File and folder responsibilities

Respect the existing project structure.

Typical responsibilities:

- `src/app/` — root application composition
- `src/components/` — reusable UI components
- `src/context/` — shared React context when required
- `src/data/` — static fictional game data
- `src/hooks/` — reusable React hooks
- `src/pages/` — route-level page components
- `src/reducers/` — reducer/state-transition logic
- `src/routes/` — route definitions
- `src/styles/` — CSS
- `src/types/` — shared TypeScript domain types
- `src/utils/` — focused utility functions and validation helpers

Do not create a new top-level architecture without a clear need.

Remove `.gitkeep` files when a folder receives real files.

---

## Dependencies

Avoid unnecessary libraries.

Before installing a package, ask whether the same requirement can be handled clearly with the existing stack.

Do not upgrade React, Vite, TypeScript, React Router, ESLint, or other existing packages merely because newer versions exist. Change dependency versions only when required for the current task or explicitly requested.

If a new dependency is necessary, explain why it was added in the completion report.

---

## Coding conventions

- Use TypeScript rather than `any` where reasonable.
- Prefer `type` aliases for game-domain unions and straightforward object shapes unless an interface is materially clearer.
- Use string literal unions for small closed sets such as roles, playstyles, and strategies.
- Keep static game data separate from simulation logic.
- Keep pure calculation functions independent from React where practical.
- Avoid embedding large static datasets directly inside components.
- Avoid magic numbers when a named constant makes game logic clearer.
- Clamp bounded game values such as Morale and Fatigue to their intended ranges.
- Prefer deterministic helper functions where possible; isolate randomness so simulations can eventually be tested.
- Do not suppress TypeScript or ESLint errors merely to make checks pass.

---

## Testing and verification

After meaningful code changes, run:

```powershell
npm run lint
npm run build
```

Both must pass before a development phase is considered complete.

When relevant, also run:

```powershell
npm run dev
```

and manually verify the affected user flow.

Do not report lint or build as passing unless the command was actually run successfully in the current task.

If tooling cannot be run because of an environment restriction, state that clearly instead of claiming success.

---

## Documentation

Update documentation when an important project decision, phase status, save-format change, or architectural change occurs.

Keep `docs/DEVELOPMENT_ROADMAP.md` aligned with actual progress.

Do not mark a phase complete until its requested functionality exists and lint/build checks pass.

Do not rewrite `GAME_CONCEPT_V1.md` merely to match implementation shortcuts. If implementation conflicts with the agreed design, flag the conflict.

---

## How to work on a task

For each requested development task:

1. Read the relevant source files first.
2. Inspect the current implementation before editing.
3. Stay inside the requested phase and scope.
4. Make the smallest coherent implementation.
5. Preserve existing working behaviour.
6. Run appropriate verification.
7. Fix errors caused by the change.
8. Update relevant project documentation if progress or decisions changed.
9. Stop when the requested task is complete.

Do not continue into the next feature or phase unless explicitly requested.

---

## Completion report

At the end of a coding task, provide a concise report containing:

- what was implemented
- files created
- files modified
- files removed, if any
- packages installed or changed, if any
- commands run
- lint result
- build result
- manual checks performed, if any
- errors encountered and how they were resolved
- remaining limitations relevant to the requested task
- recommended next task

Explain important game or architectural logic in plain language.

Do not overwhelm the user with line-by-line implementation commentary.
