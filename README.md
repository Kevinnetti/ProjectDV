# Yemen Data Visualization — ProjectDV

This repository contains a D3/React data-driven story about Yemen (interactive visualizations, preprocessing scripts and source data). The site is built with Vite + React and visualizations use D3.js.

Live site: https://kevinnetti.github.io/ProjectDV/

## Quick start

Prerequisites:
- Node.js (18+ recommended)
- npm
- Python 3.9+ and `pip` for preprocessing scripts

Install JS dependencies and run locally:

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

Deploy to GitHub Pages (repo must be configured):

```bash
npm run predeploy
npm run deploy
```

## Python preprocessing (reproducibility)

Create and activate a virtual environment, then install Python requirements:

```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

Run preprocessing scripts (they expect to run from repository root):

```powershell
python src/data/Raid_unifier.py
python merge_data.py
```

- `src/data/Raid_unifier.py` merges multiple raw CSV files into `Yemen_Data_Project_Unified.csv` in the repo root.
- `merge_data.py` reads the unified CSV and the IPC geojson and writes `src/data/yemen_districts_clean.json` used by the choropleth.

## Where the data lives

- Processed / final files used by the site: `src/data/Yemen_Data_Project_Unified.csv`, `src/data/yemen_districts_clean.json`, `src/data/fatalities.csv`, `src/data/gdp.csv`, `src/data/migrations.csv`, `src/data/world.geojson`.
- Raw inputs (included): the various Yemen Data Project CSV exports and ACLED/IPC files (see `src/data` folder).

## Methodology and pipeline

See `METHOD.md` for a detailed description of the data sources, cleaning steps, filtering thresholds (e.g., FlowMap shows flows > 500 and top-30 destinations), and limitations.

## Project structure (high level)

- `index.html` — app entry
- `src/` — React app
  - `src/components/` — visualization components (D3 + React)
  - `src/data/` — CSV / GeoJSON used by components
- `merge_data.py`, `src/data/Raid_unifier.py` — Python preprocessing scripts

## Team

Add team member names and roles here (required for submission).

## Notes on reproducibility

- Ensure `requirements.txt` is installed before running Python scripts.
- The site uses Vite's runtime imports to load `src/data/*`; when building, the data files referenced are included in the build output.

## Limitations and known issues

- Some visualizations filter or aggregate data for performance and clarity. See `METHOD.md` for exact thresholds, assumptions and limitations.

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
