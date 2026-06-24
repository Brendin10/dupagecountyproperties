# Property Value and Lead Scout Agent

A Streamlit workspace for:

- A seller-facing property value and intake landing page.
- A lead scoring agent for DuPage County, Illinois; Lake County, Indiana; and Porter County, Indiana.
- CSV cleanup, optional geocoding, lead scoring, and property mapping.

## Run locally

```bash
pip install -r requirements.txt
streamlit run dupagecountyproperties.py
```

`DupageCountyPropertiesandLocations.py` remains as a compatible entry point and launches the same app.

## Lead agent workflow

1. Open the **Lead Scout Agent** tab.
2. Download the CSV template or upload a county/tax/foreclosure/code/probate/property export.
3. The agent scans structured columns and free-text fields for distress signals including vacancy, pre-foreclosure, tax delinquency, code issues, physical distress, probate/estate situations, absentee owners, out-of-state owners, and estimated equity.
4. Review the ranked action queue, map records with latitude/longitude, and download the scored CSV.

The score is a prioritization aid, not a source-of-truth. Verify ownership, liens, court status, sale dates, and property condition before contacting an owner or making an offer.