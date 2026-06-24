# AGENTS.md

## Cursor Cloud specific instructions

This repo is a small Python + Streamlit app for visualizing DuPage County, IL property data on an interactive map. There is no backend/database; everything runs in a single Streamlit process.

### Entry points
- `DupageCountyPropertiesandLocations.py` — main app: upload a CSV, optionally geocode addresses (via Nominatim/OSM, requires network), then render a pydeck map. Use a CSV that already contains `LATITUDE`/`LONGITUDE` columns to skip geocoding.
- `dupagecountyproperties.py` — simpler variant of the same map (no geocoding; the basemap uses a Mapbox style URL).

### Running
- Python deps are installed into the system interpreter via `pip --break-system-packages` (the base image lacks `python3-venv`, so a venv is avoided to keep the startup update script free of system-package installs).
- Console scripts land in `~/.local/bin`, which is not on `PATH` by default. Either add it to `PATH` or invoke via module form: `python3 -m streamlit run <file> --server.port 8501 --server.address 0.0.0.0 --server.headless true`.
- Health check: `curl -s http://localhost:8501/_stcore/health` returns `ok`.

### Testing
- There is no automated test suite or lint config in this repo. For a quick sanity check use `python3 -m py_compile *.py`.
- End-to-end check: start the app, upload a CSV containing `LATITUDE`/`LONGITUDE` columns, and confirm the scatterplot map and the "Show cleaned data" table render.
