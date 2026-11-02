# AgriSense

Smart Digital Agriculture Monitoring and Decision Support System — a **demonstration** web application for university project walkthroughs.

AgriSense is a React + Vite dashboard. Farms, crop readings, and irrigation recommendations are stored in the browser (`localStorage`). There are **no paid APIs**, **no IoT sensors**, and **no trained machine learning model**. Irrigation suggestions come from a transparent, configurable rule engine with **illustrative demonstration thresholds**.

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite (typically `http://localhost:5173`).

Production build:

```bash
npm run build
npm run preview
```

## Demo mode

1. Click **Load Demo Data** in the top bar.
2. A marked sample farm (**Sunrise Demo Farm**), sample readings, and sample recommendations appear.
3. Open **Smart Recommendations**, enter readings, and click **Generate Recommendation**.

Clear browser data with **Clear data** if you want an empty start.

## Recommendation engine

The engine lives in `src/lib/recommendationEngine.js`.

1. Validate farm name, crop type, moisture (0–100%), pH (0–14), and temperature (°C).
2. Classify moisture using demonstration bands (very dry / dry / adequate / wet).
3. Adjust using a crop demo profile (target moisture and labelled drought tolerance).
4. Attach pH and temperature modifiers for the reasoning panel.
5. Save the inputs and result to `localStorage` and show them in history.

**This is not scientifically validated agricultural advice.**

## GitHub upload

```bash
git init
git add .
git commit -m "Add AgriSense demonstration dashboard"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

Do not commit `node_modules` or `.env` files. This repo already includes a `.gitignore`.

## Vercel deployment

1. Push the project to GitHub.
2. Sign in at [vercel.com](https://vercel.com) (Hobby/free plan is enough).
3. Import the GitHub repository.
4. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
5. Deploy. `vercel.json` rewrites all routes to `index.html` so React Router works on refresh.

CLI alternative (after `npm i -g vercel` if you choose to use it):

```bash
npx vercel
```

## Architecture

| Layer | Role |
| --- | --- |
| Pages | Dashboard, farms, monitoring, recommendations, reports, about |
| `AppContext` | CRUD + persistence |
| `storage.js` | Versioned `localStorage` schema |
| `recommendationEngine.js` | Rule-based irrigation output |
| `demoData.js` | One-click sample dataset |
| Recharts | Moisture / pH / temperature charts |

Data never leaves the browser unless you download a CSV report.
