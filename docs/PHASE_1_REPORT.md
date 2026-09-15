# Phase 1 Report

**Project:** Road to Worlds  
**Repository folder:** `esports-manager-text-game`  
**Verification date:** 11 July 2026  
**Scope:** Technical foundation only

## Result

Phase 1 is complete.

- Vite React TypeScript project initialised
- React Router installed and configured
- Agreed source folders created
- Documentation added
- Responsive placeholder home page created
- Development server response verified
- ESLint passed
- Production build passed
- Clean dependency installation passed with zero reported vulnerabilities
- No game systems were implemented

## Direct packages installed

The versions below are the versions recorded by `package-lock.json` and verified with `npm list --depth=0`.

### Runtime dependencies

| Package | Version |
| --- | ---: |
| `react` | 19.2.7 |
| `react-dom` | 19.2.7 |
| `react-router-dom` | 7.18.1 |

### Development dependencies

| Package | Version |
| --- | ---: |
| `@eslint/js` | 9.39.5 |
| `@types/node` | 24.13.3 |
| `@types/react` | 19.2.17 |
| `@types/react-dom` | 19.2.3 |
| `@vitejs/plugin-react` | 6.0.3 |
| `eslint` | 9.39.5 |
| `eslint-plugin-react-hooks` | 7.1.1 |
| `eslint-plugin-react-refresh` | 0.4.26 |
| `globals` | 17.7.0 |
| `typescript` | 6.0.3 |
| `typescript-eslint` | 8.63.0 |
| `vite` | 8.1.4 |

A clean `npm ci` installed 185 direct and transitive packages and npm reported zero vulnerabilities.

## Project files created or retained

Generated build files and `node_modules` are listed separately because they should not be committed to Git.

### Root files

- `.gitignore` — excludes dependencies, production output, logs and editor files
- `GAME_CONCEPT_V1.md` — cleaned source-of-truth concept document
- `README.md` — project status, requirements and common commands
- `eslint.config.js` — ESLint flat configuration for TypeScript and React
- `index.html` — Vite HTML entry document with British English language metadata
- `package-lock.json` — exact dependency lock file
- `package.json` — scripts, metadata and direct dependencies
- `tsconfig.app.json` — browser application TypeScript configuration
- `tsconfig.json` — root TypeScript project references
- `tsconfig.node.json` — Node-side TypeScript configuration for Vite
- `vite.config.ts` — Vite React plug-in configuration

### Documentation files

- `docs/DEVELOPMENT_ROADMAP.md` — high-level phased development sequence
- `docs/FOLDER_STRUCTURE.md` — folder responsibilities and Phase 1 boundaries
- `docs/PHASE_1_REPORT.md` — this implementation and verification report
- `docs/POWERSHELL_SETUP.md` — beginner-friendly Windows PowerShell instructions

### Public files

- `public/favicon.svg` — original Road to Worlds placeholder favicon

### Application files

- `src/main.tsx` — React browser entry point and `BrowserRouter` wrapper
- `src/app/App.tsx` — root application component
- `src/components/BrandMark.tsx` — small reusable text-based brand mark
- `src/pages/HomePage.tsx` — responsive Phase 1 placeholder home page
- `src/pages/NotFoundPage.tsx` — wildcard route page
- `src/routes/AppRoutes.tsx` — central React Router route definitions
- `src/styles/global.css` — reset, tokens and shared styles
- `src/styles/home.css` — responsive home page styles
- `src/styles/not-found.css` — not-found page styles

### Reserved source folders

These folders contain only `.gitkeep` so Git preserves the agreed structure until later phases:

- `src/context/.gitkeep`
- `src/data/.gitkeep`
- `src/hooks/.gitkeep`
- `src/reducers/.gitkeep`
- `src/types/.gitkeep`
- `src/utils/.gitkeep`

### Generated production files

Created by `npm run build` and excluded by `.gitignore`:

- `dist/index.html`
- `dist/favicon.svg`
- `dist/assets/index-BWkoaoE6.css`
- `dist/assets/index-C9f9ixUj.js`

Build asset names contain content hashes and can change after later edits.

## Commands used

### Project and dependency setup

```text
npm create vite@latest esports-manager-text-game -- --template react-ts
npm install
npm install react-router-dom
npm uninstall oxlint
npm install --save-dev eslint @eslint/js globals eslint-plugin-react-hooks eslint-plugin-react-refresh typescript-eslint
npm install --save-exact react react-dom react-router-dom
npm install --save-dev --save-exact @types/node @types/react @types/react-dom @vitejs/plugin-react typescript vite
```

The scaffolded starter files were then replaced with the complete project files listed above. The Vite demonstration assets and Oxlint configuration were removed.

### Clean installation and package audit

```text
rm -rf node_modules
npm ci
npm list --depth=0
```

For the Windows equivalent of removing `node_modules`, see `docs/POWERSHELL_SETUP.md`.

### Verification

```text
npm run lint
npm run build
npm run dev -- --host 127.0.0.1
curl http://127.0.0.1:5173/
```

The runtime check confirmed that Vite served the application and that the returned HTML contained the `Road to Worlds` document title.

## Verification output

### ESLint

```text
> esports-manager-text-game@0.1.0 lint
> eslint .
```

Result: passed with no warnings or errors.

### Production build

```text
> esports-manager-text-game@0.1.0 build
> tsc -b && vite build

vite v8.1.4 building client environment for production...
30 modules transformed.
dist/index.html                   0.52 kB | gzip: 0.31 kB
dist/assets/index-BWkoaoE6.css    4.29 kB | gzip: 1.59 kB
dist/assets/index-C9f9ixUj.js   235.14 kB | gzip: 75.36 kB
built in 497ms
```

Result: passed.

### Development server

```text
VITE v8.1.4 ready in 269 ms
Local: http://127.0.0.1:5173/
Development server response verified.
```

Result: passed.

## Errors and adjustments encountered

### 1. Initial combined command timed out

The first command combined Vite scaffolding and multiple npm installations. The execution environment timed out after the scaffold completed.

**Resolution:** Checked the generated folder, confirmed the scaffold was intact, and ran each npm installation separately.

### 2. A second combined npm command timed out

The React Router installation completed, but the combined command timed out before the later package operations were reliably reported.

**Resolution:** Inspected `package.json`, then ran the uninstall and ESLint installation as separate commands.

### 3. Current Vite template used Oxlint instead of ESLint

The scaffold generated an `oxlint` script and `.oxlintrc.json`, which conflicted with the agreed requirement to use ESLint.

**Resolution:** Removed Oxlint, deleted `.oxlintrc.json`, installed ESLint and its React/TypeScript plug-ins, and replaced the lint script with `eslint .`.

### 4. Package audit reported invalid version ranges

After a hand-written `package.json` replacement, `npm list --depth=0` reported `ELSPROBLEMS` for ESLint-related packages because the installed versions were newer than the temporary manifest ranges.

**Resolution:** Reinstalled the direct dependencies through npm so it wrote compatible manifest ranges, removed `node_modules`, ran `npm ci`, and repeated the package audit. The final audit passed.

### 5. Interactive terminal session was unavailable

The environment rejected an interactive long-running Vite process with `StreamingExecNotEnabledContainerError`.

**Resolution:** Started Vite as a temporary background process, checked the page with `curl`, recorded the server output, and stopped the process. This was an execution-environment limitation, not a project error.

## Phase boundary confirmation

The following agreed systems are intentionally absent:

- Game reducer and Context
- localStorage save handling
- Players, champions, strategies and opponents
- Weekly activities and random events
- Champion assignment
- Match formula, simulation and commentary
- Dashboard, team, match and standings pages
- Season progression

Those systems belong to later phases and were not started during Phase 1.
