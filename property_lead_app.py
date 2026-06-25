import re
from datetime import datetime
from typing import Dict, Iterable, List, Optional, Sequence, Tuple
from urllib.parse import quote_plus

import pandas as pd
import pydeck as pdk
import streamlit as st
from geopy.extra.rate_limiter import RateLimiter
from geopy.geocoders import Nominatim


SUPPORTED_COUNTIES = {
    "dupage_il": {
        "label": "DuPage County, Illinois",
        "short": "DuPage IL",
        "state": "IL",
        "center": (41.8606, -88.1084),
        "cities": {
            "addison",
            "aurora",
            "bartlett",
            "bensenville",
            "bloomingdale",
            "bolingbrook",
            "burr ridge",
            "carol stream",
            "clarendon hills",
            "darien",
            "downers grove",
            "elmhurst",
            "glen ellyn",
            "glendale heights",
            "hanover park",
            "hinsdale",
            "itasca",
            "lisle",
            "lombard",
            "naperville",
            "oak brook",
            "roselle",
            "villa park",
            "warrenville",
            "wayne",
            "west chicago",
            "westmont",
            "wheaton",
            "willowbrook",
            "winfield",
            "wood dale",
            "woodridge",
        },
    },
    "lake_in": {
        "label": "Lake County, Indiana",
        "short": "Lake IN",
        "state": "IN",
        "center": (41.4169, -87.3653),
        "cities": {
            "cedar lake",
            "crown point",
            "dyer",
            "east chicago",
            "gary",
            "griffith",
            "hammond",
            "highland",
            "hobart",
            "lake station",
            "lowell",
            "merrillville",
            "munster",
            "new chicago",
            "schererville",
            "st john",
            "whiting",
        },
    },
    "porter_in": {
        "label": "Porter County, Indiana",
        "short": "Porter IN",
        "state": "IN",
        "center": (41.4731, -87.0611),
        "cities": {
            "beverly shores",
            "burns harbor",
            "chesterton",
            "hebron",
            "kouts",
            "ogden dunes",
            "portage",
            "porter",
            "south haven",
            "valparaiso",
            "wheeler",
        },
    },
}

COUNTY_LABELS = [county["label"] for county in SUPPORTED_COUNTIES.values()]
COUNTY_BY_LABEL = {county["label"]: key for key, county in SUPPORTED_COUNTIES.items()}

CITY_COORDINATES = {
    "dupage_il": {
        "addison": (41.9317, -87.9889),
        "aurora": (41.7606, -88.3201),
        "bartlett": (41.9950, -88.1856),
        "bensenville": (41.9550, -87.9401),
        "bloomingdale": (41.9575, -88.0809),
        "bolingbrook": (41.6986, -88.0684),
        "burr ridge": (41.7489, -87.9184),
        "carol stream": (41.9125, -88.1348),
        "clarendon hills": (41.7975, -87.9548),
        "darien": (41.7519, -87.9739),
        "downers grove": (41.8089, -88.0112),
        "elmhurst": (41.8995, -87.9403),
        "glen ellyn": (41.8775, -88.0670),
        "glendale heights": (41.9103, -88.0717),
        "hanover park": (41.9995, -88.1451),
        "hinsdale": (41.8009, -87.9370),
        "itasca": (41.9750, -88.0073),
        "lisle": (41.8011, -88.0748),
        "lombard": (41.8800, -88.0078),
        "naperville": (41.7508, -88.1535),
        "oak brook": (41.8328, -87.9289),
        "roselle": (41.9848, -88.0798),
        "villa park": (41.8898, -87.9889),
        "warrenville": (41.8178, -88.1734),
        "wayne": (41.9506, -88.2420),
        "west chicago": (41.8848, -88.2039),
        "westmont": (41.7959, -87.9756),
        "wheaton": (41.8661, -88.1070),
        "willowbrook": (41.7698, -87.9359),
        "winfield": (41.8617, -88.1609),
        "wood dale": (41.9634, -87.9789),
        "woodridge": (41.7469, -88.0503),
    },
    "lake_in": {
        "cedar lake": (41.3648, -87.4411),
        "crown point": (41.4169, -87.3653),
        "dyer": (41.4942, -87.5217),
        "east chicago": (41.6392, -87.4548),
        "gary": (41.5934, -87.3464),
        "griffith": (41.5284, -87.4237),
        "hammond": (41.5834, -87.5000),
        "highland": (41.5536, -87.4519),
        "hobart": (41.5323, -87.2550),
        "lake station": (41.5750, -87.2389),
        "lowell": (41.2914, -87.4206),
        "merrillville": (41.4828, -87.3328),
        "munster": (41.5645, -87.5125),
        "new chicago": (41.5584, -87.2745),
        "schererville": (41.4789, -87.4548),
        "st john": (41.4500, -87.4700),
        "whiting": (41.6798, -87.4945),
    },
    "porter_in": {
        "beverly shores": (41.6925, -86.9775),
        "burns harbor": (41.6259, -87.1331),
        "chesterton": (41.6106, -87.0642),
        "hebron": (41.3181, -87.2003),
        "kouts": (41.3167, -87.0250),
        "ogden dunes": (41.6225, -87.1914),
        "portage": (41.5759, -87.1761),
        "porter": (41.6156, -87.0742),
        "south haven": (41.5414, -87.1370),
        "valparaiso": (41.4731, -87.0611),
        "wheeler": (41.5114, -87.1792),
    },
}

SCORING_OUTPUT_COLUMNS = (
    "Lead Score",
    "Lead Temperature",
    "County Match",
    "Distress Evidence",
    "Suggested Next Action",
)
HIGH_SCORE_RESEARCH_THRESHOLD = 80

DISTRESS_KEYWORDS = {
    "Pre-foreclosure": [
        "pre foreclosure",
        "pre-foreclosure",
        "lis pendens",
        "notice of default",
        "notice of sale",
        "sheriff sale",
        "foreclosure",
        "auction",
    ],
    "Vacant": [
        "vacant",
        "unoccupied",
        "empty",
        "abandoned",
        "boarded",
        "mail returned",
        "return mail",
    ],
    "Tax delinquency": [
        "tax delinquent",
        "delinquent tax",
        "unpaid tax",
        "tax sale",
        "tax lien",
        "certificate sale",
    ],
    "Physical distress": [
        "distressed",
        "poor condition",
        "major repairs",
        "fire damage",
        "water damage",
        "mold",
        "condemned",
        "unsafe",
        "tear down",
        "demo order",
    ],
    "Code or municipal issue": [
        "code violation",
        "municipal lien",
        "building violation",
        "grass violation",
        "nuisance",
        "unsafe structure",
    ],
    "Probate or estate": [
        "probate",
        "estate",
        "executor",
        "administrator",
        "heir",
        "inherited",
    ],
    "Utility or occupancy issue": [
        "water shutoff",
        "utility shutoff",
        "no utilities",
        "meter pulled",
    ],
}

SIGNAL_WEIGHTS = {
    "Pre-foreclosure": 35,
    "Vacant": 30,
    "Tax delinquency": 24,
    "Physical distress": 22,
    "Code or municipal issue": 20,
    "Utility or occupancy issue": 15,
    "Absentee owner": 14,
    "Out-of-state owner": 12,
    "Probate or estate": 12,
    "High estimated equity": 8,
    "Target county": 5,
}

PROPERTY_VALUE_COLUMNS = (
    "market value",
    "estimated value",
    "avm",
    "assessed value",
    "total value",
    "billvalue",
    "property value",
)
MORTGAGE_COLUMNS = (
    "mortgage balance",
    "loan balance",
    "open mortgage",
    "deed of trust balance",
    "estimated debt",
)


def normalize_text(value: object) -> str:
    if value is None:
        return ""
    try:
        if pd.isna(value):
            return ""
    except (TypeError, ValueError):
        pass
    return str(value).strip()


def normalize_column_name(value: object) -> str:
    return re.sub(r"[^a-z0-9]+", "", normalize_text(value).lower())


def normalize_address(value: object) -> str:
    return re.sub(r"[^a-z0-9]+", "", normalize_text(value).lower())


def row_value(row: pd.Series, candidates: Sequence[str]) -> str:
    normalized_columns = {normalize_column_name(column): column for column in row.index}
    normalized_candidates = [normalize_column_name(candidate) for candidate in candidates]

    for candidate in normalized_candidates:
        if candidate in normalized_columns:
            return normalize_text(row.get(normalized_columns[candidate]))

    for candidate in normalized_candidates:
        for normalized_column, original_column in normalized_columns.items():
            if candidate and (
                normalized_column.startswith(candidate) or normalized_column.endswith(candidate)
            ):
                return normalize_text(row.get(original_column))

    return ""


def parse_number(value: object) -> Optional[float]:
    text = normalize_text(value)
    if not text:
        return None
    text = re.sub(r"[^0-9.\-]", "", text)
    if not text or text in {"-", ".", "-."}:
        return None
    try:
        return float(text)
    except ValueError:
        return None


def truthy_signal(value: object) -> bool:
    text = normalize_text(value).lower()
    if not text:
        return False
    if text in {"y", "yes", "true", "1", "active", "open"}:
        return True
    if text in {"n", "no", "false", "0", "closed", "none", "not vacant"}:
        return False
    return any(keyword in text for keyword in ("vacant", "delinquent", "foreclosure", "violation"))


def contains_any(text: str, keywords: Iterable[str]) -> bool:
    normalized = text.lower().replace("_", " ")
    return any(keyword in normalized for keyword in keywords)


def combined_row_text(row: pd.Series) -> str:
    return " ".join(normalize_text(value) for value in row.values if normalize_text(value)).lower()


def infer_supported_county(row: pd.Series) -> Tuple[str, str]:
    county_text = row_value(
        row,
        (
            "county",
            "property county",
            "situs county",
            "site county",
            "parcel county",
            "tax county",
        ),
    ).lower()
    state_text = row_value(row, ("state", "property state", "situs state", "site state", "billstate")).upper()
    city_text = row_value(
        row,
        (
            "city",
            "property city",
            "situs city",
            "site city",
            "billcity",
            "municipality",
        ),
    ).lower()
    address_text = " ".join(
        [
            row_value(row, ("address", "property address", "situs address", "site address")),
            row_value(row, ("mailing address", "bill address", "owner address")),
        ]
    ).lower()

    if "dupage" in county_text or "du page" in county_text:
        return "dupage_il", SUPPORTED_COUNTIES["dupage_il"]["label"]
    if "porter" in county_text:
        return "porter_in", SUPPORTED_COUNTIES["porter_in"]["label"]
    if "lake" in county_text and (state_text == "IN" or " indiana" in address_text or ", in" in address_text):
        return "lake_in", SUPPORTED_COUNTIES["lake_in"]["label"]

    for county_key, county in SUPPORTED_COUNTIES.items():
        if city_text in county["cities"]:
            return county_key, county["label"]
        for city in county["cities"]:
            if city and city in address_text:
                return county_key, county["label"]

    return "", "Unknown or outside target counties"


def detect_absentee_owner(row: pd.Series) -> Tuple[bool, bool]:
    property_address = row_value(
        row,
        (
            "property address",
            "situs address",
            "site address",
            "consolidated property address",
            "full address",
        ),
    )
    mailing_address = row_value(
        row,
        (
            "mailing address",
            "owner mailing address",
            "bill address",
            "billing address",
            "consolidated bill address",
        ),
    )
    property_state = row_value(row, ("property state", "situs state", "site state", "state")).upper()
    mailing_state = row_value(row, ("mailing state", "owner state", "billstate", "billing state")).upper()

    absentee = False
    out_of_state = False

    if property_address and mailing_address:
        absentee = normalize_address(property_address) != normalize_address(mailing_address)
    if property_state and mailing_state and property_state != mailing_state:
        absentee = True
        out_of_state = True
    elif mailing_state and mailing_state not in {"IL", "IN"}:
        absentee = True
        out_of_state = True

    return absentee, out_of_state


def first_number_from_columns(row: pd.Series, candidates: Sequence[str]) -> Optional[float]:
    for candidate in candidates:
        value = row_value(row, (candidate,))
        parsed = parse_number(value)
        if parsed is not None:
            return parsed
    return None


def equity_signal(row: pd.Series) -> bool:
    value = first_number_from_columns(row, PROPERTY_VALUE_COLUMNS)
    debt = first_number_from_columns(row, MORTGAGE_COLUMNS)
    if value is None or debt is None or value <= 0:
        return False
    estimated_equity_ratio = (value - debt) / value
    return estimated_equity_ratio >= 0.4


def suggested_next_action(evidence: Sequence[str], temperature: str) -> str:
    evidence_set = set(evidence)
    if "Pre-foreclosure" in evidence_set:
        return "Verify sale date, title status, and owner contact immediately."
    if "Vacant" in evidence_set and "Physical distress" in evidence_set:
        return "Prioritize drive-by verification, photos, and skip trace."
    if "Tax delinquency" in evidence_set:
        return "Check treasurer records, redemption dates, and mailing address."
    if "Probate or estate" in evidence_set:
        return "Research probate contact and send a sensitive inherited-property letter."
    if temperature == "Hot":
        return "Call first, then send SMS and direct mail within the same sequence."
    if temperature == "Warm":
        return "Send direct mail and follow with a soft-call verification."
    return "Monitor for new distress signals and keep in monthly nurture."


def score_lead_row(row: pd.Series) -> Dict[str, object]:
    score = 0
    evidence: List[str] = []
    text = combined_row_text(row)
    county_key, county_label = infer_supported_county(row)

    if county_key:
        score += SIGNAL_WEIGHTS["Target county"]
        evidence.append("Target county")

    for signal, keywords in DISTRESS_KEYWORDS.items():
        if contains_any(text, keywords):
            score += SIGNAL_WEIGHTS[signal]
            evidence.append(signal)

    absentee, out_of_state = detect_absentee_owner(row)
    if absentee:
        score += SIGNAL_WEIGHTS["Absentee owner"]
        evidence.append("Absentee owner")
    if out_of_state:
        score += SIGNAL_WEIGHTS["Out-of-state owner"]
        evidence.append("Out-of-state owner")

    for column_name in row.index:
        normalized_column = normalize_column_name(column_name)
        value = row.get(column_name)
        if "vacant" in normalized_column and truthy_signal(value) and "Vacant" not in evidence:
            score += SIGNAL_WEIGHTS["Vacant"]
            evidence.append("Vacant")
        if "foreclosure" in normalized_column and truthy_signal(value) and "Pre-foreclosure" not in evidence:
            score += SIGNAL_WEIGHTS["Pre-foreclosure"]
            evidence.append("Pre-foreclosure")
        if "delinquent" in normalized_column and truthy_signal(value) and "Tax delinquency" not in evidence:
            score += SIGNAL_WEIGHTS["Tax delinquency"]
            evidence.append("Tax delinquency")

    if equity_signal(row):
        score += SIGNAL_WEIGHTS["High estimated equity"]
        evidence.append("High estimated equity")

    score = min(score, 100)
    if score >= 70:
        temperature = "Hot"
    elif score >= 40:
        temperature = "Warm"
    else:
        temperature = "Nurture"

    return {
        "Lead Score": score,
        "Lead Temperature": temperature,
        "County Match": county_label,
        "Distress Evidence": ", ".join(dict.fromkeys(evidence)) or "No clear distress signal",
        "Suggested Next Action": suggested_next_action(evidence, temperature),
    }


def score_leads(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        return df.copy()

    source_df = df.drop(columns=list(SCORING_OUTPUT_COLUMNS), errors="ignore").copy()
    scored_rows = source_df.apply(score_lead_row, axis=1, result_type="expand").reset_index(drop=True)
    scored = pd.concat([scored_rows, source_df.reset_index(drop=True)], axis=1)
    return scored.sort_values(["Lead Score"], ascending=False).reset_index(drop=True)


def lead_template_csv() -> bytes:
    template = pd.DataFrame(
        [
            {
                "Property Address": "123 Example St",
                "City": "Wheaton",
                "State": "IL",
                "County": "DuPage",
                "Owner Name": "Sample Owner",
                "Mailing Address": "PO Box 100, Phoenix, AZ",
                "Vacant": "Yes",
                "Foreclosure Status": "Pre-foreclosure",
                "Tax Status": "Delinquent",
                "Property Condition": "Needs major repairs",
                "Market Value": 250000,
                "Mortgage Balance": 90000,
                "LATITUDE": 41.8661,
                "LONGITUDE": -88.107,
            }
        ]
    )
    return template.to_csv(index=False).encode("utf-8")


@st.cache_data(show_spinner=False)
def geocode_addresses(df: pd.DataFrame, address_col: str) -> pd.DataFrame:
    geolocator = Nominatim(user_agent="property_lead_agent")
    geocode = RateLimiter(geolocator.geocode, min_delay_seconds=1)
    geocoded = df.copy()
    geocoded["Raw_Location"] = geocoded[address_col].apply(geocode)
    geocoded["LATITUDE"] = geocoded["Raw_Location"].apply(lambda loc: loc.latitude if loc else None)
    geocoded["LONGITUDE"] = geocoded["Raw_Location"].apply(lambda loc: loc.longitude if loc else None)
    return geocoded.drop(columns=["Raw_Location"])


def estimate_value_range(
    county_label: str,
    square_feet: Optional[float],
    owner_estimate: Optional[float],
    assessed_value: Optional[float],
    repair_budget: Optional[float],
    condition: str,
) -> Dict[str, object]:
    county_key = COUNTY_BY_LABEL.get(county_label, "dupage_il")
    fallback_price_per_sqft = {
        "dupage_il": 245,
        "lake_in": 145,
        "porter_in": 165,
    }
    condition_factor = {
        "Move-in ready": 1.04,
        "Good": 1.0,
        "Average": 0.94,
        "Needs cosmetic updates": 0.88,
        "Needs major repairs": 0.72,
        "Vacant or distressed": 0.68,
    }.get(condition, 0.94)

    if owner_estimate:
        base_value = owner_estimate
        basis = "your entered estimate"
    elif square_feet:
        base_value = square_feet * fallback_price_per_sqft[county_key]
        basis = "county price-per-square-foot placeholder"
    elif assessed_value:
        base_value = assessed_value
        basis = "assessed/tax value"
    else:
        return {
            "ready": False,
            "message": "Add an owner estimate, square footage, or assessed value to produce a quick range.",
        }

    adjusted_value = max(base_value * condition_factor - (repair_budget or 0), 0)
    spread = 0.09 if condition in {"Move-in ready", "Good"} else 0.15
    low = max(adjusted_value * (1 - spread), 0)
    high = adjusted_value * (1 + spread)
    cash_low = max(adjusted_value * 0.62, 0)
    cash_high = max(adjusted_value * 0.78, 0)

    return {
        "ready": True,
        "basis": basis,
        "retail_low": round(low, -3),
        "retail_high": round(high, -3),
        "cash_low": round(cash_low, -3),
        "cash_high": round(cash_high, -3),
    }


def motivation_score(timeline: str, occupancy: str, condition: str, selling_reason: Sequence[str]) -> Tuple[int, str]:
    score = 0
    if timeline in {"Immediately", "Within 30 days"}:
        score += 35
    elif timeline == "1-3 months":
        score += 20
    if occupancy in {"Vacant", "Tenant occupied - problem tenant"}:
        score += 25
    if condition in {"Needs major repairs", "Vacant or distressed"}:
        score += 25
    reason_weights = {
        "Behind on payments or taxes": 25,
        "Pre-foreclosure or legal deadline": 35,
        "Inherited property": 15,
        "Relocation": 12,
        "Tired landlord": 18,
        "Major repairs needed": 20,
        "Need cash quickly": 20,
    }
    score += sum(reason_weights.get(reason, 0) for reason in selling_reason)
    score = min(score, 100)
    if score >= 70:
        return score, "Priority seller"
    if score >= 40:
        return score, "Motivated seller"
    return score, "Information gathering"


def money(value: object) -> str:
    number = parse_number(value)
    if number is None:
        return "Not enough information"
    return f"${number:,.0f}"


def dataframe_download(df: pd.DataFrame, filename: str, label: str) -> None:
    st.download_button(
        label=label,
        data=df.to_csv(index=False).encode("utf-8"),
        file_name=filename,
        mime="text/csv",
    )


def render_metric_card(title: str, body: str) -> None:
    st.markdown(
        f"""
        <div class="metric-card">
            <div class="metric-title">{title}</div>
            <div class="metric-body">{body}</div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_map(df: pd.DataFrame, default_county_key: str = "dupage_il") -> None:
    if "LATITUDE" not in df.columns or "LONGITUDE" not in df.columns:
        st.info("Add LATITUDE and LONGITUDE columns to map these properties.")
        return

    map_df = df.copy()
    map_df["LATITUDE"] = pd.to_numeric(map_df["LATITUDE"], errors="coerce")
    map_df["LONGITUDE"] = pd.to_numeric(map_df["LONGITUDE"], errors="coerce")
    map_df = map_df.dropna(subset=["LATITUDE", "LONGITUDE"])

    if map_df.empty:
        st.warning("No valid latitude/longitude values were found.")
        return

    map_df["MAP_ADDRESS"] = map_df.apply(
        lambda row: row_value(
            row,
            (
                "property address",
                "situs address",
                "site address",
                "consolidated bill address",
                "full address",
                "address",
            ),
        ),
        axis=1,
    )
    map_df["MAP_LEAD_ID"] = map_df["Lead ID"] if "Lead ID" in map_df.columns else ""
    map_df["MAP_OWNER"] = map_df.apply(
        lambda row: row_value(row, ("owner name", "billname", "name")) or "Owner research needed",
        axis=1,
    )
    score_series = (
        pd.to_numeric(map_df["Lead Score"], errors="coerce")
        if "Lead Score" in map_df.columns
        else pd.Series(0, index=map_df.index)
    )
    map_df["MAP_SCORE"] = map_df["Lead Score"] if "Lead Score" in map_df.columns else ""
    map_df["MAP_EVIDENCE"] = map_df["Distress Evidence"] if "Distress Evidence" in map_df.columns else ""
    map_df["MAP_ACTION"] = map_df["Suggested Next Action"] if "Suggested Next Action" in map_df.columns else ""
    map_df["RED"] = score_series.apply(lambda score: 220 if score >= 70 else 50)
    map_df["GREEN"] = score_series.apply(lambda score: 140 if score >= 40 else 110)
    map_df["BLUE"] = score_series.apply(lambda score: 55 if score >= 40 else 220)

    center_lat = float(map_df["LATITUDE"].mean())
    center_lon = float(map_df["LONGITUDE"].mean())
    if pd.isna(center_lat) or pd.isna(center_lon):
        center_lat, center_lon = SUPPORTED_COUNTIES[default_county_key]["center"]

    layer = pdk.Layer(
        "ScatterplotLayer",
        data=map_df,
        get_position="[LONGITUDE, LATITUDE]",
        get_radius=70,
        radius_units="meters",
        radius_min_pixels=3,
        radius_max_pixels=12,
        get_fill_color="[RED, GREEN, BLUE, 170]",
        get_line_color=[255, 255, 255, 220],
        stroked=True,
        pickable=True,
    )

    deck = pdk.Deck(
        map_style="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
        initial_view_state=pdk.ViewState(latitude=center_lat, longitude=center_lon, zoom=10, pitch=0),
        layers=[layer],
        tooltip={
            "html": (
                "<b>{MAP_LEAD_ID} {MAP_ADDRESS}</b><br/>"
                "Owner: {MAP_OWNER}<br/>"
                "Score: {MAP_SCORE}<br/>{MAP_EVIDENCE}<br/>"
                "<i>{MAP_ACTION}</i>"
            ),
            "style": {"backgroundColor": "#0f172a", "color": "white"},
        },
    )
    st.pydeck_chart(deck, use_container_width=True)


def render_seller_landing() -> None:
    st.markdown(
        """
        <section class="hero">
            <div>
                <p class="eyebrow">Cash offer and property value review</p>
                <h1>Find out what your property could be worth before you decide how to sell.</h1>
                <p>
                    Homeowners can share property details, condition, timeline, and selling goals.
                    The form below creates a quick value range and a clean lead record for follow-up.
                </p>
            </div>
        </section>
        """,
        unsafe_allow_html=True,
    )

    col_a, col_b, col_c = st.columns(3)
    with col_a:
        render_metric_card("For sellers", "Get a quick range and understand cash-offer tradeoffs.")
    with col_b:
        render_metric_card("For distressed properties", "Vacant, inherited, repair-heavy, tax, or foreclosure situations.")
    with col_c:
        render_metric_card("For follow-up", "Capture contact, property, urgency, and next action in one record.")

    st.subheader("Property value and seller intake")
    with st.form("seller_intake_form"):
        contact_col, property_col = st.columns(2)
        with contact_col:
            name = st.text_input("Full name")
            phone = st.text_input("Phone")
            email = st.text_input("Email")
            preferred_contact = st.selectbox("Preferred contact method", ["Phone", "Text", "Email"])
            timeline = st.selectbox(
                "How soon are you thinking about selling?",
                ["Just researching", "1-3 months", "Within 30 days", "Immediately"],
            )
        with property_col:
            address = st.text_input("Property address")
            city = st.text_input("City")
            county = st.selectbox("County", COUNTY_LABELS)
            property_type = st.selectbox(
                "Property type",
                ["Single-family", "Townhome", "Condo", "2-4 unit", "Vacant land", "Other"],
            )
            occupancy = st.selectbox(
                "Occupancy",
                ["Owner occupied", "Tenant occupied", "Tenant occupied - problem tenant", "Vacant", "Unknown"],
            )

        detail_col, condition_col = st.columns(2)
        with detail_col:
            beds = st.number_input("Bedrooms", min_value=0, max_value=20, value=3)
            baths = st.number_input("Bathrooms", min_value=0.0, max_value=20.0, value=2.0, step=0.5)
            square_feet = st.number_input("Approximate square feet", min_value=0, value=0, step=50)
            owner_estimate = st.number_input("What do you think it may be worth?", min_value=0, value=0, step=5000)
            assessed_value = st.number_input("Assessed/tax value, if known", min_value=0, value=0, step=5000)
        with condition_col:
            condition = st.selectbox(
                "Current condition",
                [
                    "Move-in ready",
                    "Good",
                    "Average",
                    "Needs cosmetic updates",
                    "Needs major repairs",
                    "Vacant or distressed",
                ],
            )
            repair_budget = st.number_input("Estimated repairs needed", min_value=0, value=0, step=2500)
            mortgage_balance = st.number_input("Mortgage or lien balance, if known", min_value=0, value=0, step=5000)
            selling_reason = st.multiselect(
                "What is driving the possible sale?",
                [
                    "Just curious",
                    "Relocation",
                    "Tired landlord",
                    "Inherited property",
                    "Major repairs needed",
                    "Behind on payments or taxes",
                    "Pre-foreclosure or legal deadline",
                    "Need cash quickly",
                ],
            )
            notes = st.text_area("Anything else we should know?", height=110)

        submitted = st.form_submit_button("Create my property review")

    if submitted:
        value_range = estimate_value_range(
            county,
            float(square_feet) if square_feet else None,
            float(owner_estimate) if owner_estimate else None,
            float(assessed_value) if assessed_value else None,
            float(repair_budget) if repair_budget else None,
            condition,
        )
        score, segment = motivation_score(timeline, occupancy, condition, selling_reason)

        result_col, next_col = st.columns([1, 1])
        with result_col:
            st.markdown("### Quick value snapshot")
            if value_range["ready"]:
                st.metric("Possible retail range", f"{money(value_range['retail_low'])} - {money(value_range['retail_high'])}")
                st.metric("Possible as-is cash range", f"{money(value_range['cash_low'])} - {money(value_range['cash_high'])}")
                st.caption(
                    "This is an intake estimate based on the information entered, not an appraisal. "
                    f"Basis: {value_range['basis']}."
                )
            else:
                st.info(value_range["message"])
        with next_col:
            st.markdown("### Follow-up priority")
            st.metric(segment, f"{score}/100")
            st.write(
                "Next step: verify recent comparable sales, repair scope, payoff information, "
                "and the seller's preferred closing timeline."
            )

        lead_record = pd.DataFrame(
            [
                {
                    "Name": name,
                    "Phone": phone,
                    "Email": email,
                    "Preferred Contact": preferred_contact,
                    "Timeline": timeline,
                    "Property Address": address,
                    "City": city,
                    "County": county,
                    "Property Type": property_type,
                    "Occupancy": occupancy,
                    "Bedrooms": beds,
                    "Bathrooms": baths,
                    "Square Feet": square_feet,
                    "Owner Estimate": owner_estimate,
                    "Assessed Value": assessed_value,
                    "Repair Budget": repair_budget,
                    "Mortgage Balance": mortgage_balance,
                    "Condition": condition,
                    "Selling Reasons": "; ".join(selling_reason),
                    "Motivation Score": score,
                    "Segment": segment,
                    "Notes": notes,
                }
            ]
        )
        dataframe_download(lead_record, "seller_property_review.csv", "Download seller lead record")


def county_key_from_label_or_text(value: object) -> str:
    text = normalize_text(value).lower()
    if text in COUNTY_BY_LABEL:
        return COUNTY_BY_LABEL[text]
    for label, county_key in COUNTY_BY_LABEL.items():
        if text == label.lower():
            return county_key
    if "dupage" in text or "du page" in text:
        return "dupage_il"
    if "porter" in text:
        return "porter_in"
    if "lake" in text:
        return "lake_in"
    return "dupage_il"


def county_label_from_any(value: object) -> str:
    county_key = county_key_from_label_or_text(value)
    return SUPPORTED_COUNTIES[county_key]["label"]


def city_options_for_county(county_label: str) -> List[str]:
    county_key = county_key_from_label_or_text(county_label)
    return sorted(city.title() for city in SUPPORTED_COUNTIES[county_key]["cities"])


def approximate_coordinates(county_label: str, city: object) -> Tuple[float, float]:
    county_key = county_key_from_label_or_text(county_label)
    normalized_city = normalize_text(city).lower()
    if normalized_city in CITY_COORDINATES[county_key]:
        return CITY_COORDINATES[county_key][normalized_city]
    return SUPPORTED_COUNTIES[county_key]["center"]


@st.cache_data(show_spinner=False)
def geocode_single_address(address: str) -> Optional[Tuple[float, float]]:
    if not address:
        return None
    geolocator = Nominatim(user_agent="property_lead_agent_single")
    location = geolocator.geocode(address)
    if not location:
        return None
    return float(location.latitude), float(location.longitude)


def resolve_coordinates(
    address: str,
    city: str,
    county_label: str,
    latitude: float,
    longitude: float,
    use_geocoder: bool,
) -> Tuple[float, float, str]:
    if latitude and longitude:
        return float(latitude), float(longitude), "Manual coordinates"

    full_address = ", ".join(
        part
        for part in [
            normalize_text(address),
            normalize_text(city),
            SUPPORTED_COUNTIES[county_key_from_label_or_text(county_label)]["state"],
        ]
        if part
    )
    if use_geocoder and full_address:
        geocoded = geocode_single_address(full_address)
        if geocoded:
            return geocoded[0], geocoded[1], "Geocoded from address"

    approx_lat, approx_lon = approximate_coordinates(county_label, city)
    return approx_lat, approx_lon, "Approximate city/county center"


def starter_leads() -> pd.DataFrame:
    today = datetime.utcnow().date().isoformat()
    return pd.DataFrame(
        [
            {
                "Lead ID": "DL-001",
                "Property Address": "Verify vacant property near downtown Wheaton",
                "City": "Wheaton",
                "State": "IL",
                "County": "DuPage County, Illinois",
                "Property Type": "Single-family",
                "Occupancy": "Vacant",
                "Property Condition": "Needs major repairs",
                "Distress Signals": "Vacant; code violation; major repairs",
                "Owner Name": "Owner research needed",
                "Owner Type": "Unknown",
                "Mailing Address": "Research mailing address",
                "Preferred Contact": "Skip trace needed",
                "Phone": "",
                "Email": "",
                "Estimated Value": 285000,
                "Mortgage Balance": 95000,
                "Estimated Repairs": 65000,
                "Bedrooms": 3,
                "Bathrooms": 1.5,
                "Square Feet": 1450,
                "Lead Source": "Starter lead - replace with verified research",
                "Lead Created": today,
                "Owner Notes": "Confirm vacancy, owner mailing address, and any municipal violations.",
                "Property Notes": "Drive-by and photo verification needed before outreach.",
                "LATITUDE": 41.8661,
                "LONGITUDE": -88.1070,
            },
            {
                "Lead ID": "DL-002",
                "Property Address": "Pre-foreclosure research lead in Downers Grove",
                "City": "Downers Grove",
                "State": "IL",
                "County": "DuPage County, Illinois",
                "Property Type": "Single-family",
                "Occupancy": "Unknown",
                "Property Condition": "Average",
                "Distress Signals": "Pre-foreclosure; notice of sale",
                "Owner Name": "Owner research needed",
                "Owner Type": "Owner occupant",
                "Mailing Address": "Research mailing address",
                "Preferred Contact": "Call after verification",
                "Phone": "",
                "Email": "",
                "Estimated Value": 360000,
                "Mortgage Balance": 250000,
                "Estimated Repairs": 25000,
                "Bedrooms": 4,
                "Bathrooms": 2.0,
                "Square Feet": 1900,
                "Lead Source": "Starter lead - verify court/recorder status",
                "Lead Created": today,
                "Owner Notes": "Verify filing status, sale date, and payoff before outreach.",
                "Property Notes": "Prioritize a sensitive foreclosure-help conversation.",
                "LATITUDE": 41.8089,
                "LONGITUDE": -88.0112,
            },
            {
                "Lead ID": "LI-001",
                "Property Address": "Tax delinquency lead in Gary",
                "City": "Gary",
                "State": "IN",
                "County": "Lake County, Indiana",
                "Property Type": "Single-family",
                "Occupancy": "Vacant",
                "Property Condition": "Vacant or distressed",
                "Distress Signals": "Vacant; tax delinquent; boarded",
                "Owner Name": "Owner research needed",
                "Owner Type": "Absentee owner",
                "Mailing Address": "Out-of-state owner address to verify",
                "Preferred Contact": "Skip trace needed",
                "Phone": "",
                "Email": "",
                "Estimated Value": 95000,
                "Mortgage Balance": 15000,
                "Estimated Repairs": 40000,
                "Bedrooms": 3,
                "Bathrooms": 1.0,
                "Square Feet": 1200,
                "Lead Source": "Starter lead - verify treasurer records",
                "Lead Created": today,
                "Owner Notes": "Check tax sale, redemption status, and mailing address.",
                "Property Notes": "Vacancy and exterior condition need field confirmation.",
                "LATITUDE": 41.5934,
                "LONGITUDE": -87.3464,
            },
            {
                "Lead ID": "PI-001",
                "Property Address": "Inherited property research lead in Valparaiso",
                "City": "Valparaiso",
                "State": "IN",
                "County": "Porter County, Indiana",
                "Property Type": "Single-family",
                "Occupancy": "Unknown",
                "Property Condition": "Needs cosmetic updates",
                "Distress Signals": "Probate; inherited; estate",
                "Owner Name": "Estate contact research needed",
                "Owner Type": "Estate / probate",
                "Mailing Address": "Research executor address",
                "Preferred Contact": "Direct mail first",
                "Phone": "",
                "Email": "",
                "Estimated Value": 240000,
                "Mortgage Balance": 45000,
                "Estimated Repairs": 30000,
                "Bedrooms": 3,
                "Bathrooms": 2.0,
                "Square Feet": 1650,
                "Lead Source": "Starter lead - verify probate filing",
                "Lead Created": today,
                "Owner Notes": "Research executor or administrator before contact.",
                "Property Notes": "Likely equity lead; verify occupancy and condition.",
                "LATITUDE": 41.4731,
                "LONGITUDE": -87.0611,
            },
        ]
    )


def ensure_lead_pipeline() -> None:
    if "lead_sequence" not in st.session_state:
        st.session_state["lead_sequence"] = 5
    if "lead_pipeline" not in st.session_state:
        st.session_state["lead_pipeline"] = score_leads(starter_leads())


def next_lead_id(county_label: str) -> str:
    ensure_lead_pipeline()
    lead_id = generated_lead_id(county_label, st.session_state["lead_sequence"])
    st.session_state["lead_sequence"] += 1
    return lead_id


def generated_lead_id(county_label: str, sequence: int) -> str:
    county_key = county_key_from_label_or_text(county_label)
    prefix = {"dupage_il": "DL", "lake_in": "LI", "porter_in": "PI"}[county_key]
    return f"{prefix}-{sequence:03d}"


def add_leads_to_pipeline(new_leads: pd.DataFrame) -> None:
    ensure_lead_pipeline()
    if new_leads.empty:
        return

    assigned_lead_count = int(new_leads.attrs.get("assigned_lead_count", 0))
    if assigned_lead_count:
        st.session_state["lead_sequence"] += assigned_lead_count

    existing = st.session_state["lead_pipeline"].drop(
        columns=list(SCORING_OUTPUT_COLUMNS), errors="ignore"
    )
    combined = pd.concat([existing, new_leads], ignore_index=True, sort=False)
    st.session_state["lead_pipeline"] = score_leads(enrich_lead_coordinates(combined))


def enrich_lead_coordinates(df: pd.DataFrame) -> pd.DataFrame:
    enriched = df.copy()
    if "LATITUDE" not in enriched.columns:
        enriched["LATITUDE"] = None
    if "LONGITUDE" not in enriched.columns:
        enriched["LONGITUDE"] = None

    for idx, row in enriched.iterrows():
        lat = parse_number(row.get("LATITUDE"))
        lon = parse_number(row.get("LONGITUDE"))
        if lat is not None and lon is not None:
            enriched.at[idx, "LATITUDE"] = lat
            enriched.at[idx, "LONGITUDE"] = lon
            continue

        county_label = county_label_from_any(row_value(row, ("county", "county match")))
        city = row_value(row, ("city", "property city", "situs city", "billcity"))
        approx_lat, approx_lon = approximate_coordinates(county_label, city)
        enriched.at[idx, "LATITUDE"] = approx_lat
        enriched.at[idx, "LONGITUDE"] = approx_lon
        if not normalize_text(row.get("Coordinate Source")):
            enriched.at[idx, "Coordinate Source"] = "Approximate city/county center"

    return enriched


def prepare_imported_leads(df: pd.DataFrame) -> pd.DataFrame:
    ensure_lead_pipeline()
    imported = df.copy()
    if "Lead ID" not in imported.columns:
        imported["Lead ID"] = ""
    assigned_lead_count = 0
    next_sequence = st.session_state["lead_sequence"]
    for idx, row in imported.iterrows():
        if not normalize_text(row.get("Lead ID")):
            county_label = county_label_from_any(row_value(row, ("county", "county match")))
            imported.at[idx, "Lead ID"] = generated_lead_id(
                county_label, next_sequence + assigned_lead_count
            )
            assigned_lead_count += 1
        if "Lead Source" not in imported.columns or not normalize_text(row.get("Lead Source")):
            imported.at[idx, "Lead Source"] = "Optional CSV import"
        if "Lead Created" not in imported.columns or not normalize_text(row.get("Lead Created")):
            imported.at[idx, "Lead Created"] = datetime.utcnow().date().isoformat()
    prepared = enrich_lead_coordinates(imported)
    prepared.attrs["assigned_lead_count"] = assigned_lead_count
    return prepared


def apply_lead_filters(
    leads: pd.DataFrame,
    selected_counties: Sequence[str],
    selected_temperatures: Sequence[str],
    min_score: int,
    search_text: str,
) -> pd.DataFrame:
    filtered = leads.copy()
    if selected_counties:
        filtered = filtered[filtered["County Match"].isin(selected_counties)]
    if selected_temperatures:
        filtered = filtered[filtered["Lead Temperature"].isin(selected_temperatures)]
    filtered = filtered[pd.to_numeric(filtered["Lead Score"], errors="coerce").fillna(0) >= min_score]
    if search_text:
        needle = search_text.lower()
        filtered = filtered[
            filtered.apply(lambda row: needle in combined_row_text(row), axis=1)
        ]
    return filtered.reset_index(drop=True)


def lead_display_columns(leads: pd.DataFrame) -> List[str]:
    preferred_columns = [
        "Lead ID",
        "Lead Score",
        "Lead Temperature",
        "County Match",
        "Property Address",
        "City",
        "Owner Name",
        "Occupancy",
        "Property Condition",
        "Distress Evidence",
        "Suggested Next Action",
    ]
    return [column for column in preferred_columns if column in leads.columns]


def is_placeholder_owner(value: object) -> bool:
    text = normalize_text(value).lower()
    if not text:
        return True
    return any(placeholder in text for placeholder in ("research needed", "unknown", "verify"))


def has_contact_value(value: object) -> bool:
    return bool(normalize_text(value))


def missing_research_fields(lead: pd.Series) -> List[str]:
    missing = []
    if is_placeholder_owner(lead.get("Owner Name") or lead.get("BILLNAME")):
        missing.append("owner name")
    if not has_contact_value(lead.get("Mailing Address") or lead.get("Consolidated Bill Address")):
        missing.append("mailing address")
    if not has_contact_value(lead.get("Phone") or lead.get("Cell Phone")):
        missing.append("cell phone")
    if not has_contact_value(lead.get("Email") or lead.get("Email Address")):
        missing.append("email")
    return missing


def research_status_for_lead(lead: pd.Series) -> str:
    stored_status = normalize_text(lead.get("Research Status"))
    if stored_status:
        return stored_status

    missing = set(missing_research_fields(lead))
    if not missing:
        return "Contact ready"
    if "owner name" not in missing and "mailing address" not in missing:
        return "Owner verified"
    if "owner name" not in missing:
        return "Owner identified"
    return "Needs research"


def build_research_queue(leads: pd.DataFrame) -> pd.DataFrame:
    if leads.empty or "Lead Score" not in leads.columns:
        return pd.DataFrame()

    queue = leads[
        pd.to_numeric(leads["Lead Score"], errors="coerce").fillna(0)
        > HIGH_SCORE_RESEARCH_THRESHOLD
    ].copy()
    if queue.empty:
        return queue

    queue["Research Status"] = queue.apply(research_status_for_lead, axis=1)
    queue["Missing Research"] = queue.apply(
        lambda row: ", ".join(missing_research_fields(row)) or "Complete",
        axis=1,
    )
    return queue.sort_values(["Lead Score"], ascending=False).reset_index(drop=True)


def research_queue_columns(queue: pd.DataFrame) -> List[str]:
    preferred_columns = [
        "Lead ID",
        "Lead Score",
        "Research Status",
        "Missing Research",
        "Property Address",
        "City",
        "County Match",
        "Owner Name",
        "Phone",
        "Email",
        "Distress Evidence",
    ]
    return [column for column in preferred_columns if column in queue.columns]


def owner_name_for_display(lead: pd.Series) -> str:
    return display_value(lead.get("Owner Name") or lead.get("BILLNAME"))


def lead_search_terms(lead: pd.Series) -> Dict[str, str]:
    address = display_value(lead.get("Property Address"))
    city = display_value(lead.get("City"))
    county = display_value(lead.get("County Match") or lead.get("County"))
    owner = owner_name_for_display(lead)
    state = display_value(lead.get("State"))
    location = " ".join(part for part in [city, state, county] if part != "Not provided")

    return {
        "property_record": f'"{address}" "{location}" property owner assessor',
        "tax_status": f'"{address}" "{county}" treasurer tax delinquent property',
        "foreclosure_status": f'"{address}" "{county}" foreclosure sheriff sale court',
        "code_or_vacancy": f'"{address}" "{city}" code violation vacant building',
        "owner_contact": f'"{owner}" "{address}" owner contact phone email',
    }


def research_links_for_lead(lead: pd.Series) -> List[Tuple[str, str]]:
    terms = lead_search_terms(lead)
    return [
        ("Property/assessor record search", f"https://www.google.com/search?q={quote_plus(terms['property_record'])}"),
        ("Tax status search", f"https://www.google.com/search?q={quote_plus(terms['tax_status'])}"),
        ("Foreclosure/sheriff sale search", f"https://www.google.com/search?q={quote_plus(terms['foreclosure_status'])}"),
        ("Code/vacancy search", f"https://www.google.com/search?q={quote_plus(terms['code_or_vacancy'])}"),
        ("Owner contact verification search", f"https://www.google.com/search?q={quote_plus(terms['owner_contact'])}"),
    ]


def update_lead_research(lead_id: str, updates: Dict[str, object]) -> None:
    ensure_lead_pipeline()
    pipeline = st.session_state["lead_pipeline"].copy()
    if "Lead ID" not in pipeline.columns:
        return

    for column in updates:
        if column not in pipeline.columns:
            pipeline[column] = ""

    lead_mask = pipeline["Lead ID"].astype(str) == str(lead_id)
    for column, value in updates.items():
        pipeline.loc[lead_mask, column] = value

    st.session_state["lead_pipeline"] = pipeline


def render_high_score_research_agent(leads: pd.DataFrame) -> None:
    st.subheader(f"Research Agent: leads scoring over {HIGH_SCORE_RESEARCH_THRESHOLD}")
    st.caption(
        "This queue focuses research on the hottest leads. Use public records and compliant contact-data sources, "
        "then save verified owner names, mailing addresses, cell phones, emails, source notes, and confidence."
    )

    research_queue = build_research_queue(leads)
    if research_queue.empty:
        st.info(f"No leads currently score above {HIGH_SCORE_RESEARCH_THRESHOLD}. Add more distress signals or new leads to build this queue.")
        return

    contact_ready_count = int((research_queue["Research Status"] == "Contact ready").sum())
    owner_verified_count = int(research_queue["Research Status"].isin(["Owner verified", "Contact ready"]).sum())
    missing_phone_count = int(research_queue["Missing Research"].str.contains("cell phone", case=False, na=False).sum())
    missing_email_count = int(research_queue["Missing Research"].str.contains("email", case=False, na=False).sum())

    metric_a, metric_b, metric_c, metric_d = st.columns(4)
    metric_a.metric("Research targets", len(research_queue))
    metric_b.metric("Owner verified", owner_verified_count)
    metric_c.metric("Missing cell", missing_phone_count)
    metric_d.metric("Missing email", missing_email_count)

    queue_event = st.dataframe(
        research_queue[research_queue_columns(research_queue)],
        use_container_width=True,
        hide_index=True,
        on_select="rerun",
        selection_mode="single-row",
        key="high_score_research_table",
    )
    selection = getattr(queue_event, "selection", None)
    selected_rows = getattr(selection, "rows", []) if selection is not None else []
    selected_index = selected_rows[0] if selected_rows else 0
    selected_lead = research_queue.iloc[selected_index]
    lead_id = display_value(selected_lead.get("Lead ID"))

    st.markdown(
        f"""
        <div class="detail-card research-card">
            <div class="metric-title">Research target</div>
            <h3>{lead_id} - {display_value(selected_lead.get('Property Address'))}</h3>
            <p><strong>Score:</strong> {display_value(selected_lead.get('Lead Score'))}/100 &nbsp; 
            <strong>Status:</strong> {research_status_for_lead(selected_lead)}</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    property_col, owner_col = st.columns(2)
    with property_col:
        st.markdown("#### Property facts to verify")
        render_detail_field("Address", selected_lead.get("Property Address"))
        render_detail_field("City", selected_lead.get("City"))
        render_detail_field("County", selected_lead.get("County Match") or selected_lead.get("County"))
        render_detail_field("Distress evidence", selected_lead.get("Distress Evidence"))
        render_detail_field("Suggested next action", selected_lead.get("Suggested Next Action"))
    with owner_col:
        st.markdown("#### Current owner and contact status")
        render_detail_field("Owner", selected_lead.get("Owner Name") or selected_lead.get("BILLNAME"))
        render_detail_field("Mailing address", selected_lead.get("Mailing Address") or selected_lead.get("Consolidated Bill Address"))
        render_detail_field("Cell phone", selected_lead.get("Phone") or selected_lead.get("Cell Phone"))
        render_detail_field("Email", selected_lead.get("Email") or selected_lead.get("Email Address"))
        render_detail_field("Missing", ", ".join(missing_research_fields(selected_lead)) or "Nothing obvious")

    with st.expander("Research shortcuts and checklist", expanded=True):
        st.markdown(
            """
            **Recommended order**
            1. Verify parcel/property record and current vesting owner.
            2. Verify owner mailing address and whether the owner is absentee or out-of-state.
            3. Check tax, foreclosure, sheriff sale, code, vacancy, and probate indicators.
            4. Use a lawful contact-data or skip-trace source to verify cell phone and email.
            5. Record where each contact detail came from and your confidence before outreach.
            """
        )
        for label, url in research_links_for_lead(selected_lead):
            st.markdown(f"- [{label}]({url})")

    with st.form(f"research_update_{lead_id}"):
        st.markdown("#### Save researched owner/contact information")
        form_owner_col, form_contact_col, form_notes_col = st.columns([1, 1, 1])
        with form_owner_col:
            researched_owner = st.text_input(
                "Current owner name",
                value=normalize_text(selected_lead.get("Owner Name") or selected_lead.get("BILLNAME")),
            )
            researched_mailing = st.text_input(
                "Owner mailing address",
                value=normalize_text(selected_lead.get("Mailing Address") or selected_lead.get("Consolidated Bill Address")),
            )
            researched_status = st.selectbox(
                "Research status",
                ["Needs research", "Owner identified", "Owner verified", "Contact ready", "Do not contact"],
                index=["Needs research", "Owner identified", "Owner verified", "Contact ready", "Do not contact"].index(
                    research_status_for_lead(selected_lead)
                    if research_status_for_lead(selected_lead)
                    in ["Needs research", "Owner identified", "Owner verified", "Contact ready", "Do not contact"]
                    else "Needs research"
                ),
            )
        with form_contact_col:
            researched_phone = st.text_input(
                "Verified cell phone",
                value=normalize_text(selected_lead.get("Phone") or selected_lead.get("Cell Phone")),
            )
            researched_email = st.text_input(
                "Verified email address",
                value=normalize_text(selected_lead.get("Email") or selected_lead.get("Email Address")),
            )
            confidence = st.selectbox(
                "Contact confidence",
                ["Unverified", "Low", "Medium", "High", "Confirmed by owner"],
                index=["Unverified", "Low", "Medium", "High", "Confirmed by owner"].index(
                    normalize_text(selected_lead.get("Contact Confidence")) or "Unverified"
                )
                if normalize_text(selected_lead.get("Contact Confidence")) in ["Unverified", "Low", "Medium", "High", "Confirmed by owner"]
                else 0,
            )
        with form_notes_col:
            contact_source = st.text_input(
                "Contact/source notes",
                value=normalize_text(selected_lead.get("Contact Source")),
                placeholder="County record, skip trace provider, owner callback...",
            )
            research_notes = st.text_area(
                "Research notes",
                value=normalize_text(selected_lead.get("Research Notes")),
                height=112,
            )

        saved = st.form_submit_button("Save research to lead")

    if saved:
        update_lead_research(
            lead_id,
            {
                "Owner Name": researched_owner,
                "Mailing Address": researched_mailing,
                "Phone": researched_phone,
                "Cell Phone": researched_phone,
                "Email": researched_email,
                "Email Address": researched_email,
                "Research Status": researched_status,
                "Contact Confidence": confidence,
                "Contact Source": contact_source,
                "Research Notes": research_notes,
                "Last Researched": datetime.utcnow().date().isoformat(),
            },
        )
        st.success("Research details saved to the lead pipeline.")
        st.rerun()

    dataframe_download(
        research_queue,
        "high_score_property_research_queue.csv",
        "Download high-score research queue",
    )


def display_value(value: object) -> str:
    text = normalize_text(value)
    return text if text else "Not provided"


def render_detail_field(label: str, value: object) -> None:
    st.markdown(f"**{label}:** {display_value(value)}")


def render_lead_detail(lead: pd.Series) -> None:
    estimated_value = lead.get("Estimated Value")
    if not normalize_text(estimated_value):
        estimated_value = lead.get("Market Value")

    st.markdown(
        f"""
        <div class="detail-card">
            <div class="metric-title">Selected Lead</div>
            <h3>{display_value(lead.get('Lead ID'))} - {display_value(lead.get('Property Address'))}</h3>
            <p><strong>{display_value(lead.get('Lead Temperature'))}</strong> lead with score
            <strong>{display_value(lead.get('Lead Score'))}/100</strong>.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    property_tab, owner_tab, action_tab = st.tabs(["Property details", "Owner details", "Follow-up plan"])
    with property_tab:
        col_a, col_b, col_c = st.columns(3)
        with col_a:
            render_detail_field("Address", lead.get("Property Address"))
            render_detail_field("City", lead.get("City"))
            render_detail_field("County", lead.get("County Match") or lead.get("County"))
            render_detail_field("Property type", lead.get("Property Type"))
        with col_b:
            render_detail_field("Occupancy", lead.get("Occupancy"))
            render_detail_field("Condition", lead.get("Property Condition"))
            render_detail_field("Bedrooms", lead.get("Bedrooms"))
            render_detail_field("Bathrooms", lead.get("Bathrooms"))
        with col_c:
            render_detail_field("Estimated value", money(estimated_value))
            render_detail_field("Mortgage balance", money(lead.get("Mortgage Balance")))
            render_detail_field("Estimated repairs", money(lead.get("Estimated Repairs")))
            render_detail_field("Square feet", lead.get("Square Feet"))
        render_detail_field("Property notes", lead.get("Property Notes") or lead.get("Notes"))

    with owner_tab:
        col_a, col_b = st.columns(2)
        with col_a:
            render_detail_field("Owner name", lead.get("Owner Name") or lead.get("BILLNAME"))
            render_detail_field("Owner type", lead.get("Owner Type"))
            render_detail_field("Mailing address", lead.get("Mailing Address") or lead.get("Consolidated Bill Address"))
        with col_b:
            render_detail_field("Phone", lead.get("Phone"))
            render_detail_field("Email", lead.get("Email"))
            render_detail_field("Preferred contact", lead.get("Preferred Contact"))
        render_detail_field("Owner notes", lead.get("Owner Notes"))

    with action_tab:
        col_a, col_b = st.columns(2)
        with col_a:
            render_detail_field("Distress evidence", lead.get("Distress Evidence"))
            render_detail_field("Raw distress signals", lead.get("Distress Signals"))
            render_detail_field("Lead source", lead.get("Lead Source"))
        with col_b:
            render_detail_field("Suggested next action", lead.get("Suggested Next Action"))
            render_detail_field("Lead created", lead.get("Lead Created"))
            render_detail_field("Coordinate source", lead.get("Coordinate Source"))


def render_lead_agent() -> None:
    ensure_lead_pipeline()
    st.header("Lead Scout Agent")
    st.write(
        "Create, score, map, and review property leads. CSV import is available below as a supporting tool, "
        "but the main workflow is building a live lead pipeline and working it from the map and table."
    )

    with st.expander("Create a new lead", expanded=True):
        with st.form("new_lead_form", clear_on_submit=True):
            property_col, owner_col, signal_col = st.columns([1.1, 1, 1])
            with property_col:
                county = st.selectbox("Target county", COUNTY_LABELS, key="new_lead_county")
                city = st.selectbox("City", city_options_for_county(county))
                address = st.text_input("Property address or research label")
                property_type = st.selectbox(
                    "Property type",
                    ["Single-family", "Townhome", "Condo", "2-4 unit", "Vacant land", "Commercial", "Other"],
                )
                occupancy = st.selectbox(
                    "Occupancy",
                    ["Unknown", "Owner occupied", "Tenant occupied", "Tenant occupied - problem tenant", "Vacant"],
                )
                condition = st.selectbox(
                    "Condition",
                    ["Unknown", "Move-in ready", "Good", "Average", "Needs cosmetic updates", "Needs major repairs", "Vacant or distressed"],
                )
            with owner_col:
                owner_name = st.text_input("Owner name")
                owner_type = st.selectbox(
                    "Owner type",
                    ["Unknown", "Owner occupant", "Absentee owner", "Out-of-state owner", "Estate / probate", "LLC / company"],
                )
                mailing_address = st.text_input("Owner mailing address")
                phone = st.text_input("Phone")
                email = st.text_input("Email")
                preferred_contact = st.selectbox("Preferred contact", ["Unknown", "Call", "Text", "Email", "Direct mail", "Skip trace needed"])
            with signal_col:
                distress_signals = st.multiselect(
                    "Distress or motivation signals",
                    [
                        "Vacant",
                        "Pre-foreclosure",
                        "Tax delinquent",
                        "Code violation",
                        "Major repairs",
                        "Fire damage",
                        "Water damage",
                        "Probate / inherited",
                        "Absentee owner",
                        "Out-of-state owner",
                        "Tired landlord",
                        "Need cash quickly",
                    ],
                )
                estimated_value = st.number_input("Estimated value", min_value=0, value=0, step=5000)
                mortgage_balance = st.number_input("Mortgage/lien balance", min_value=0, value=0, step=5000)
                estimated_repairs = st.number_input("Estimated repairs", min_value=0, value=0, step=2500)

            details_col, geo_col = st.columns([1.2, 1])
            with details_col:
                property_notes = st.text_area("Property notes", height=90)
                owner_notes = st.text_area("Owner notes", height=90)
            with geo_col:
                latitude = st.number_input("Latitude (optional)", value=0.0, format="%.6f")
                longitude = st.number_input("Longitude (optional)", value=0.0, format="%.6f")
                use_geocoder = st.checkbox(
                    "Try to geocode from address",
                    value=False,
                    help="If unchecked or no exact match is found, the map uses an approximate city/county point.",
                )
                lead_source = st.text_input("Lead source", value="Manual research")

            submitted = st.form_submit_button("Add lead to map")

        if submitted:
            if not normalize_text(address):
                st.error("Add a property address or research label so the lead is easy to recognize.")
            else:
                resolved_lat, resolved_lon, coordinate_source = resolve_coordinates(
                    address,
                    city,
                    county,
                    latitude,
                    longitude,
                    use_geocoder,
                )
                state = SUPPORTED_COUNTIES[county_key_from_label_or_text(county)]["state"]
                raw_lead = pd.DataFrame(
                    [
                        {
                            "Lead ID": next_lead_id(county),
                            "Property Address": address,
                            "City": city,
                            "State": state,
                            "County": county,
                            "Property Type": property_type,
                            "Occupancy": occupancy,
                            "Property Condition": condition,
                            "Distress Signals": "; ".join(distress_signals),
                            "Owner Name": owner_name or "Owner research needed",
                            "Owner Type": owner_type,
                            "Mailing Address": mailing_address,
                            "Phone": phone,
                            "Email": email,
                            "Preferred Contact": preferred_contact,
                            "Estimated Value": estimated_value,
                            "Market Value": estimated_value,
                            "Mortgage Balance": mortgage_balance,
                            "Estimated Repairs": estimated_repairs,
                            "Lead Source": lead_source,
                            "Lead Created": datetime.utcnow().date().isoformat(),
                            "Owner Notes": owner_notes,
                            "Property Notes": property_notes,
                            "Coordinate Source": coordinate_source,
                            "LATITUDE": resolved_lat,
                            "LONGITUDE": resolved_lon,
                        }
                    ]
                )
                add_leads_to_pipeline(raw_lead)
                st.success("Lead added, scored, and placed on the map.")

    leads = st.session_state["lead_pipeline"]
    hot_count = int((leads["Lead Temperature"] == "Hot").sum()) if not leads.empty else 0
    warm_count = int((leads["Lead Temperature"] == "Warm").sum()) if not leads.empty else 0
    avg_score = int(leads["Lead Score"].mean()) if not leads.empty else 0

    metric_a, metric_b, metric_c, metric_d = st.columns(4)
    metric_a.metric("Total leads", len(leads))
    metric_b.metric("Hot leads", hot_count)
    metric_c.metric("Warm leads", warm_count)
    metric_d.metric("Average score", avg_score)

    filter_col, temp_col, score_col, search_col = st.columns([1.2, 1, 1, 1.2])
    with filter_col:
        selected_counties = st.multiselect("Counties on map", COUNTY_LABELS, default=COUNTY_LABELS)
    with temp_col:
        selected_temperatures = st.multiselect(
            "Lead temperatures",
            ["Hot", "Warm", "Nurture"],
            default=["Hot", "Warm", "Nurture"],
        )
    with score_col:
        min_score = st.slider("Minimum score", min_value=0, max_value=100, value=0, step=5)
    with search_col:
        search_text = st.text_input("Search leads", placeholder="owner, city, signal...")

    filtered = apply_lead_filters(
        leads,
        selected_counties,
        selected_temperatures,
        min_score,
        search_text,
    )

    st.subheader("Lead map")
    st.caption("Map points are exact when latitude/longitude or geocoding is available; otherwise they use approximate city/county centers.")
    render_map(filtered)

    st.subheader("Lead table")
    st.caption("Click a row to inspect the property, owner, and recommended next action.")
    if filtered.empty:
        st.warning("No leads match the current filters.")
    else:
        display_df = filtered[lead_display_columns(filtered)].copy()
        table_event = st.dataframe(
            display_df,
            use_container_width=True,
            hide_index=True,
            on_select="rerun",
            selection_mode="single-row",
            key="lead_pipeline_table",
        )
        selection = getattr(table_event, "selection", None)
        selected_rows = getattr(selection, "rows", []) if selection is not None else []
        selected_index = selected_rows[0] if selected_rows else 0
        selected_lead = filtered.iloc[selected_index]
        render_lead_detail(selected_lead)

    render_high_score_research_agent(leads)

    with st.expander("Optional CSV import/export"):
        st.write(
            "Use CSVs as a secondary way to bulk add leads. Imported records are scored and added to the same map."
        )
        st.download_button(
            "Download CSV template",
            data=lead_template_csv(),
            file_name="lead_scout_template.csv",
            mime="text/csv",
        )
        uploaded_file = st.file_uploader("Optional lead CSV", type="csv", key="lead_agent_upload")
        if uploaded_file:
            try:
                imported_df = pd.read_csv(uploaded_file, low_memory=False)
                prepared_import = prepare_imported_leads(imported_df)
                scored_import = score_leads(prepared_import)
                st.dataframe(
                    scored_import[lead_display_columns(scored_import)],
                    use_container_width=True,
                    hide_index=True,
                )
                if st.button("Add uploaded CSV leads to map"):
                    add_leads_to_pipeline(prepared_import)
                    st.success(f"Added {len(prepared_import)} uploaded leads to the map.")
            except Exception as exc:
                st.error(f"Could not import the CSV: {exc}")

        dataframe_download(leads, "current_property_lead_pipeline.csv", "Download current lead pipeline")
        if st.button("Reset to starter leads"):
            st.session_state["lead_pipeline"] = score_leads(starter_leads())
            st.session_state["lead_sequence"] = 5
            st.success("Lead pipeline reset to the starter target leads.")


def render_map_tools() -> None:
    st.header("Optional CSV tools")
    st.write(
        "Use this secondary workspace for parcel CSVs. If coordinates are missing, choose an address column and geocode before mapping."
    )

    uploaded_file = st.file_uploader(
        "Upload CSV. If missing LATITUDE/LONGITUDE, you can generate them from an address column.",
        type="csv",
        key="map_tools_upload",
    )

    if not uploaded_file:
        st.info("Upload a parcel or lead CSV to clean, geocode, score, map, and export it.")
        return

    try:
        df = pd.read_csv(uploaded_file, low_memory=False)
    except Exception as exc:
        st.error(f"Could not read the CSV: {exc}")
        return

    required_columns = {"LATITUDE", "LONGITUDE"}
    working_df = df.copy()

    if not required_columns.issubset(working_df.columns):
        st.warning("No LATITUDE/LONGITUDE columns found.")
        address_columns = list(working_df.columns)
        if {"BILLSTNUM", "BILLSTNAME", "BILLCITY", "BILLSTATE"}.issubset(working_df.columns):
            working_df["Full_Address"] = (
                working_df["BILLSTNUM"].astype(str)
                + " "
                + working_df["BILLSTNAME"].astype(str)
                + ", "
                + working_df["BILLCITY"].astype(str)
                + ", "
                + working_df["BILLSTATE"].astype(str)
            )
            address_columns = ["Full_Address"] + address_columns

        address_col = st.selectbox("Select the column containing the full address:", address_columns)
        if st.button("Start geocoding"):
            with st.spinner("Geocoding addresses. Large files can take a while because the public geocoder is rate limited."):
                working_df = geocode_addresses(working_df, address_col)
                st.success("Geocoding complete.")

    if required_columns.issubset(working_df.columns):
        scored = score_leads(working_df)
        useful_columns = [
            column
            for column in [
                "Lead Score",
                "Lead Temperature",
                "County Match",
                "Distress Evidence",
                "Suggested Next Action",
                "Consolidated Bill Address",
                "Property Address",
                "BILLVALUE",
                "BILLNAME",
                "ACREAGE",
                "LATITUDE",
                "LONGITUDE",
            ]
            if column in scored.columns
        ]
        cleaned = scored[useful_columns] if useful_columns else scored

        if st.checkbox("Show cleaned/scored data"):
            st.dataframe(cleaned, use_container_width=True, hide_index=True)

        dataframe_download(cleaned, "cleaned_scored_properties.csv", "Download cleaned scored CSV")
        render_map(cleaned)


def render_styles() -> None:
    st.markdown(
        """
        <style>
        .block-container {
            padding-top: 2rem;
            padding-bottom: 3rem;
        }
        .hero {
            background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 55%, #2f6f73 100%);
            color: white;
            padding: 2.25rem;
            border-radius: 1.25rem;
            margin-bottom: 1.25rem;
            box-shadow: 0 18px 45px rgba(15, 23, 42, 0.18);
        }
        .hero h1 {
            font-size: 2.7rem;
            line-height: 1.08;
            margin: 0.2rem 0 0.8rem 0;
        }
        .hero p {
            max-width: 820px;
            font-size: 1.05rem;
        }
        .eyebrow {
            text-transform: uppercase;
            letter-spacing: 0.12em;
            font-size: 0.78rem !important;
            color: #a7f3d0;
            font-weight: 700;
        }
        .metric-card {
            border: 1px solid #dbe4ef;
            border-radius: 1rem;
            padding: 1rem;
            background: #ffffff;
            min-height: 118px;
            box-shadow: 0 8px 25px rgba(15, 23, 42, 0.06);
        }
        .metric-title {
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #2563eb;
            font-weight: 700;
            margin-bottom: 0.45rem;
        }
        .metric-body {
            color: #0f172a;
            font-size: 1rem;
            line-height: 1.35;
        }
        .detail-card {
            border: 1px solid #cbd5e1;
            border-left: 6px solid #2563eb;
            border-radius: 1rem;
            padding: 1rem 1.25rem;
            background: #f8fafc;
            margin: 1rem 0;
        }
        .detail-card h3 {
            margin: 0.1rem 0 0.4rem 0;
        }
        </style>
        """,
        unsafe_allow_html=True,
    )


def main() -> None:
    st.set_page_config(
        page_title="Property Value and Lead Scout Agent",
        page_icon="house",
        layout="wide",
    )
    render_styles()
    st.sidebar.title("Property Lead System")
    st.sidebar.write("Create leads, map opportunities, inspect owners, and keep CSV upload as an optional utility.")
    st.sidebar.markdown("**Target markets**")
    for county in SUPPORTED_COUNTIES.values():
        st.sidebar.write(f"- {county['label']}")

    agent_tab, seller_tab, map_tab = st.tabs(
        ["Lead Scout Agent", "Seller landing page", "Optional CSV tools"]
    )
    with agent_tab:
        render_lead_agent()
    with seller_tab:
        render_seller_landing()
    with map_tab:
        render_map_tools()


if __name__ == "__main__":
    main()
