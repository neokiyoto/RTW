# Road to Worlds

Road to Worlds is a little browser game about running a fictional esports team. You have five players, six matches and a season to see how far your decisions can take them.

Before each match, you choose what the team needs most: training, rest, time together or a closer look at the opponent. Then you give everyone a champion, pick a strategy and watch the match play out in a text report. The commentary follows the action as it happens, with a chart showing who seems to have the upper hand. Afterwards, your players' condition, the standings and your record change.

You can name the team and manager, and new games give your players fictional esports handles. The game saves in your browser, so you can come back to the same season later. There are no accounts or cloud saves. The gold chart is an estimate of match advantage rather than a full economy system.

## Try it locally

You'll need Node.js 22.12 or newer and npm. In PowerShell:

```powershell
git clone https://github.com/neokiyoto/RTW.git
cd RTW
npm install
npm run dev
```

Open the address Vite prints in the terminal. Your save belongs to that browser and address; clearing its site data will clear the save too.

## If you're changing the code

It's a React, Vite and TypeScript project with plain CSS. These are the checks I use before calling a change done:

```powershell
npm run lint
npm run build
npm test
npm run validate:data
```

The longer design notes are in [GAME_CONCEPT_V1.md](GAME_CONCEPT_V1.md), and the [roadmap](docs/DEVELOPMENT_ROADMAP.md) explains how the game got here.

Everything in the game — teams, players, champions and match writing — is fictional and original.
