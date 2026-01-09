# Methodology

This document explains the data pipeline, cleaning choices, filtering thresholds, and limitations used in the ProjectDV visualizations.

## Data sources

Primary inputs (stored under `src/data/`):

- Yemen Data Project exports (multiple CSVs)
- ACLED / fatalities CSV (`fatalities.csv`)
- IMF GDP CSV (`gdp.csv`)
- IPC GeoJSON for food insecurity (`IPC_YE_A_82302905_2025-12-30.geojson`)
- World/administrative GeoJSONs (`world.geojson`, `gadm41_YEM_1.json`, `yemen_districts_clean.json`)
- UNHCR migration/IDP exports (`migrations.csv`, `idp.csv`)

## Preprocessing steps

1. Merge multiple Yemen Data Project CSV exports using `src/data/Raid_unifier.py`:
   - Standardizes columns (renames variants such as `Min Air Raids` → `Min Projectiles`).
   - Assigns default `Actor` and weapon type where missing.
   - Parses dates and orders incidents, writes `Yemen_Data_Project_Unified.csv`.

2. Aggregate district-level raid counts with `merge_data.py`:
   - Loads IPC district GeoJSON and unified CSV.
   - Normalizes district names (lowercase, strip common Arabic prefixes like `al `, replace dashes with spaces).
   - Attempts exact matches to GeoJSON names; uses Python's `difflib.get_close_matches` with cutoff 0.7 for fuzzy matches.
   - Aggregates numeric raid/projectile counts by year into `properties.raids` for each GeoJSON feature.
   - Outputs `src/data/yemen_districts_clean.json`.

## Visualization filtering & rationale

- FlowMap (`FlowMapD3`) filters migration flows to keep the visualization readable and performant:
  - Only records with `value > 500` are kept.
  - The component limits to the top 30 destination countries by value per year.
  - Stroke widths use a sqrt scale to reduce visual dominance of extreme flows.
  - Rationale: reduce DOM elements and avoid map clutter while preserving the major international flows.

- Choropleth and raid aggregations:
  - Aggregated per-year counts are used to color districts. Low-count districts may appear as low/zero.
  - Donut and other charts aggregate categories; categories labeled `Unknown` are preserved verbatim from source.

## Assumptions and imputations

- When `Actor` or `Type of Weapons` are missing in a source file, `Raid_unifier.py` sets a reasonable default based on file origin.
- District name normalization removes common prefixes and punctuation to improve match rates, but some ambiguous or misspelled names may not match and will be logged by the script.
- Fuzzy matching cutoff (0.7) was chosen empirically; review unmatched names list if many districts are missing.

## Limitations and uncertainty

- Source data completeness: Yemen Data Project and other sources may have missing or inconsistently recorded fields (dates, district names, victim counts).
- Unknowns: a large share of incidents are tagged `Unknown` for actor/target; this introduces uncertainty in attribution.
- Aggregation hides intra-district spatial heterogeneity and temporal reporting biases.
- Estimates (e.g., total displaced) depend on UNHCR/IPC reporting policies and periodicity; they are not wall-to-wall censuses.

## How to reproduce

1. Install Node and Python prerequisites (see `README.md`).
2. Create Python venv and install `requirements.txt`.
3. Run `python src/data/Raid_unifier.py` to produce `Yemen_Data_Project_Unified.csv`.
4. Run `python merge_data.py` to produce `src/data/yemen_districts_clean.json`.
5. Start the site with `npm run dev` and verify visualizations.

## Suggestions for improvement

- Add explicit logging of unmatched district names and provide a mapping file to correct them manually.
- Publish a small CSV of `unmatched_districts.csv` produced by `merge_data.py` to help manual reconciliation.
- Consider adding per-chart uncertainty indicators (e.g., shaded intervals, counts of missing records).

