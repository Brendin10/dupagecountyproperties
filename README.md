# Property Value and Lead Scout Agent

A Streamlit workspace for:

- A seller-facing property value and intake landing page.
- A lead creation, scoring, mapping, and owner-research dashboard for DuPage County, Illinois; Lake County, Indiana; and Porter County, Indiana.
- Optional CSV cleanup, import, geocoding, scoring, and property mapping utilities.

## Run locally

```bash
pip install -r requirements.txt
streamlit run dupagecountyproperties.py
```

`DupageCountyPropertiesandLocations.py` remains as a compatible entry point and launches the same app.

## Lead agent workflow

1. Open the **Lead Scout Agent** tab.
2. Add new leads with property details, owner details, distress signals, value/debt estimates, and notes.
3. The agent scores and maps each lead using exact coordinates when supplied, geocoding when requested, or an approximate city/county point when needed.
4. Review the map, then click a row in the lead table below it to inspect property details, owner details, and the recommended next action.
5. Use the optional CSV import/export expander only when you want to bulk add or download leads.

The agent scans structured fields and free-text notes for distress signals including vacancy, pre-foreclosure, tax delinquency, code issues, physical distress, probate/estate situations, absentee owners, out-of-state owners, and estimated equity.

The score is a prioritization aid, not a source-of-truth. Verify ownership, liens, court status, sale dates, and property condition before contacting an owner or making an offer.