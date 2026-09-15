# Windows PowerShell Setup

These instructions assume that Node.js is already installed.

## 1. Open the project folder

Open PowerShell in the folder that contains `esports-manager-text-game`, then run:

```powershell
cd .\esports-manager-text-game
```

## 2. Install the exact project dependencies

Use the lock file for a repeatable installation:

```powershell
npm ci
```

Use `npm install` instead only when deliberately changing packages.

## 3. Start the local development server

```powershell
npm run dev
```

Vite prints a local address, normally:

```text
http://localhost:5173
```

Press `Ctrl+C` in PowerShell when you want to stop the server.

## 4. Run ESLint

```powershell
npm run lint
```

A successful run returns to the PowerShell prompt without lint errors.

## 5. Create a production build

```powershell
npm run build
```

A successful build creates the `dist` folder.

## 6. Preview the production build locally

```powershell
npm run preview
```

Open the address printed by Vite. Press `Ctrl+C` to stop the preview server.

## Common beginner checks

Confirm Node.js and npm are available:

```powershell
node --version
npm --version
```

Remove an old dependency installation and restore it from the lock file:

```powershell
Remove-Item -Recurse -Force .\node_modules
npm ci
```

Do not delete `package-lock.json`; it records the tested dependency versions.
