# Yemen: The Eclipse of Humanity
### Data Visualization Project (2025)

Live site: https://kevinnetti.github.io/ProjectDV/
## 📋 Overview
This project is an interactive **Data Visualization Story** examining the decade-long conflict in Yemen (2015-2025). It moves beyond simple statistics to narrate the systemic collapse of a country through five key dimensions:
1.  **Air Warfare:** Mapping the intensity and targets of over 25,000 air raids.
2.  **Economic Collapse:** Visualizing the GDP crash.
3.  **Hunger:** A geospatial analysis of food insecurity phases.
4.  **Displacement:** Comparing internal displacement vs. external refugees.
5.  **The Human Toll:** Direct and indirect fatalities.


## Tech Stack
* **Framework:** React (v18)
* **Build Tool:** Vite
* **Visualization:** D3.js (v7)
* **UI Components:** Material UI (MUI)
* **Data Processing:** Python (Pandas)
* **Maps:** GeoJSON 

## Project structure (high level)

- `index.html` — app entry
- `src/` — React app
  - `src/components/` — visualization components (D3 + React)
  - `src/data/` — CSV / GeoJSON used by components
- `merge_data.py`, `src/data/Raid_unifier.py` — Python preprocessing scripts

## Getting start  
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

## Where the data lives

- Processed / final files used by the site: `src/data/Yemen_Data_Project_Unified.csv`, `src/data/yemen_districts_clean.json`, `src/data/fatalities.csv`, `src/data/gdp.csv`, `src/data/migrations.csv`, `src/data/world.geojson`.
- Raw inputs (included): the various Yemen Data Project CSV exports and ACLED/IPC files (see `src/data` folder).

## Methodology and pipeline

See `METHOD.md` for a detailed description of the data sources, cleaning steps, filtering thresholds (e.g., FlowMap shows flows > 500 and top-30 destinations), and limitations.


## Team

Nettikadan Kevin 5175709 

## Notes on reproducibility

- The site uses Vite's runtime imports to load `src/data/*`; when building, the data files referenced are included in the build output.

## Limitations and known issues

- Some visualizations filter or aggregate data for performance and clarity. See `METHOD.md` for exact thresholds, assumptions and limitations.
 - In the `Fatalities` visualization, governorates with 0 recorded fatalities are grouped into a single category labeled **"Others"** with count 0; this grouping is used for display clarity and does not remove those governorates from the source data.

## Data sources 

Below are the primary data sources used in this project. Local paths link to the files included in this repository; external links point to the original data provider.

- **Yemen Data Project (air raids)**
  - Local: [src/data/Yemen_Data_Project_Unified.csv](src/data/Yemen_Data_Project_Unified.csv)
  - External: https://yemendataproject.org/data/
  - Used fields: `Date`, `Incident ID`, `Governorate`, `District`, `Min Projectiles` / `Min Air Raids`, `Actor`, `Main category`.
  - Notes: multiple raw CSV exports were merged by `src/data/Raid_unifier.py`. Aggregation per district/year is performed by `merge_data.py` to create `src/data/yemen_districts_clean.json` used for the choropleth.

- **ACLED (fatalities / conflict events)**
  - Local: [src/data/fatalities.csv](src/data/fatalities.csv)
  - External: https://acleddata.com/
  - Used fields: fatalities counts, admin1/governorate.

- **IMF / GDP (national economic data)**
  - Local: [src/data/gdp.csv](src/data/gdp.csv)
  - External: https://www.imf.org/external/datamapper/NGDPD@WEO/YEM
  - Used fields: `Year`, `GDP` (used in `GdpLineChartD3`).

- **IPC (food insecurity geojson)**
  - Local: [src/data/IPC_YE_A_82302905_2025-12-30.geojson](src/data/IPC_YE_A_82302905_2025-12-30.geojson)
  - External: https://www.ipcinfo.org/
  - Used fields: `features`, `geometry` for the food insecurity choropleth.

- **UNHCR (migration / IDP statistics)**
  - Local: [src/data/migrations.csv](src/data/migrations.csv), [src/data/idp.csv](src/data/idp.csv)
  - External (UNHCR data finder): https://www.unhcr.org/refugee-statistics/
  - Used fields: `Year`, `Country of Origin`, `Country of Asylum`, `Total` (used in `FlowMapD3` and `MigrationGroupedChart`).

- **Administrative / basemaps**
  - Local: [src/data/world.geojson](src/data/world.geojson), [src/data/gadm41_YEM_1.json](src/data/gadm41_YEM_1.json), [src/data/yemen_districts_clean.json](src/data/yemen_districts_clean.json)
  - Purpose: projection, centroids and district-level geometry for choropleth and flow maps.

Notes:
- Files under `src/data/` are referenced at runtime using Vite (see components `DataSources.jsx` and imports like `new URL('../data/..', import.meta.url)` or `?url`). When building, those referenced files are included in the output if imported.
- If you reuse or update raw data, re-run `src/data/Raid_unifier.py` and `merge_data.py` (see `README.md` instructions) and verify `src/data/yemen_districts_clean.json` is updated.


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
