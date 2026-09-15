# Team identity and visual update

New careers ask for team and manager names. Existing games can use **Roster > Edit team & manager**. Names are trimmed, limited to 32 characters, validated and saved automatically. Blank names and control characters are rejected.

An optional profile stores the two names in game state. Older saves use display defaults, Road to Worlds and Manager, until edited. Names persist across seasons. The team header, roster, home summary, match heading and standings use the custom identity. Renaming preserves player identities, progress and saved commentary. The application remains called Road to Worlds.

The red-and-black theme uses charcoal surfaces, red accents, squared controls, condensed headings and a slanted brand mark. Soft gradients and rounded cards were removed. Distinct commentary highlight colours remain for readability. No external fonts, artwork or packages are required.

## Files created

- `src/components/TeamProfileForm.tsx`
- `src/utils/teamProfile.ts`
- `docs/TEAM_IDENTITY_UPDATE.md`

## Files modified

- `src/types/domain.ts`
- `src/types/gameState.ts`
- `src/utils/createInitialGame.ts`
- `src/reducers/gameReducer.ts`
- `src/hooks/useGame.ts`
- `src/utils/validateSave.ts`
- `src/utils/season.ts`
- `src/components/ManagementLayout.tsx`
- `src/components/MatchReportView.tsx`
- `src/pages/HomePage.tsx`
- `src/pages/TeamPage.tsx`
- `src/styles/global.css`
- `src/styles/home.css`
- `src/styles/management.css`
- `src/styles/match.css`
- `src/utils/experience.test.mjs`
- `GAME_CONCEPT_V1.md`
- `README.md`
- `docs/FOLDER_STRUCTURE.md`
- `docs/DEVELOPMENT_ROADMAP.md`

No project files removed. No packages installed or changed.

## Verification and corrections

- `npm run lint`: passed.
- `npm run build`: passed.
- `npm test`: all 62 tests passed. New cases cover names surviving save/reload, renaming after simulation, unchanged reports, six weeks, a new season and invalid names.
- Local Vite browser checks covered career setup, roster editing, renamed standings, reload/Continue, replacement warnings and whitespace-only name rejection.
- Desktop home/dashboard and mobile dashboard/form were visually inspected. A decorative slash caused five pixels of horizontal overflow; its position was corrected and the mobile document then measured 375 pixels wide with 375 pixels of content. The form now focuses its first field when opened.
- The npm development command did not forward the requested port in this environment; the installed Vite entry point was used for the isolated port 5178 check.
- A Windows encoding error interrupted the README update. Its earlier captured content and subsequent edits were recovered from this task's tool history, and documentation was saved explicitly as UTF-8.

## Limits and next task

Names are local save data, not accounts. Naming changes display labels; saved match commentary retains its existing references to your team to preserve engine compatibility. Opponent brands remain fixed.

Recommended next task: try your names in the existing save and assess the new visual direction during a match before expanding the design further.
