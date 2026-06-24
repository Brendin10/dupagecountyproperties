import io
import re
from typing import Dict, Iterable, List, Optional, Sequence, Tuple

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

    scored_rows = df.apply(score_lead_row, axis=1, result_type="expand").reset_index(drop=True)
    scored = pd.concat([scored_rows, df.reset_index(drop=True)], axis=1)
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
    score_series = (
        pd.to_numeric(map_df["Lead Score"], errors="coerce")
        if "Lead Score" in map_df.columns
        else pd.Series(0, index=map_df.index)
    )
    map_df["MAP_SCORE"] = map_df["Lead Score"] if "Lead Score" in map_df.columns else ""
    map_df["MAP_EVIDENCE"] = map_df["Distress Evidence"] if "Distress Evidence" in map_df.columns else ""
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
            "html": "<b>{MAP_ADDRESS}</b><br/>Score: {MAP_SCORE}<br/>{MAP_EVIDENCE}",
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


def render_lead_agent() -> None:
    st.header("Lead Scout Agent")
    st.write(
        "Upload property, tax, foreclosure, code, probate, or vacancy lists. "
        "The agent scores records for hot-lead signals in DuPage County IL, Lake County IN, and Porter County IN."
    )

    source_col, scoring_col = st.columns([1, 1])
    with source_col:
        st.subheader("Target lead signals")
        st.markdown(
            """
            - Vacant, abandoned, boarded, or returned-mail properties
            - Pre-foreclosure, sheriff sale, lis pendens, or auction records
            - Tax delinquency, tax sale, liens, or municipal debt
            - Code violations, unsafe structures, fire/water damage, or heavy repairs
            - Absentee or out-of-state owners with likely equity
            - Probate, inherited, estate, or executor situations
            """
        )
    with scoring_col:
        st.subheader("Suggested data sources")
        st.markdown(
            """
            - County treasurer tax delinquency lists
            - Recorder or court foreclosure filings
            - Sheriff sale calendars
            - Municipal code violation and vacant-building lists
            - Probate filings and public notices
            - Parcel exports with mailing address vs. site address
            """
        )

    st.download_button(
        "Download CSV template",
        data=lead_template_csv(),
        file_name="lead_scout_template.csv",
        mime="text/csv",
    )

    uploaded_file = st.file_uploader("Upload lead CSV", type="csv", key="lead_agent_upload")
    if not uploaded_file:
        st.info("Upload a CSV to rank leads. The template shows useful columns, but the agent also scans free-text fields.")
        return

    try:
        df = pd.read_csv(uploaded_file, low_memory=False)
    except Exception as exc:
        st.error(f"Could not read the CSV: {exc}")
        return

    if df.empty:
        st.warning("The uploaded CSV did not contain any rows.")
        return

    scored = score_leads(df)
    only_target_counties = st.checkbox("Only show target counties", value=True)
    temperatures = st.multiselect(
        "Lead temperatures",
        ["Hot", "Warm", "Nurture"],
        default=["Hot", "Warm"],
    )
    min_score = st.slider("Minimum lead score", min_value=0, max_value=100, value=40, step=5)

    filtered = scored.copy()
    if only_target_counties:
        filtered = filtered[filtered["County Match"].isin(COUNTY_LABELS)]
    if temperatures:
        filtered = filtered[filtered["Lead Temperature"].isin(temperatures)]
    filtered = filtered[filtered["Lead Score"] >= min_score]

    hot_count = int((filtered["Lead Temperature"] == "Hot").sum()) if not filtered.empty else 0
    warm_count = int((filtered["Lead Temperature"] == "Warm").sum()) if not filtered.empty else 0
    avg_score = int(filtered["Lead Score"].mean()) if not filtered.empty else 0

    metric_a, metric_b, metric_c, metric_d = st.columns(4)
    metric_a.metric("Ranked leads", len(filtered))
    metric_b.metric("Hot leads", hot_count)
    metric_c.metric("Warm leads", warm_count)
    metric_d.metric("Average score", avg_score)

    st.subheader("Prioritized action queue")
    priority_columns = [
        column
        for column in [
            "Lead Score",
            "Lead Temperature",
            "County Match",
            "Distress Evidence",
            "Suggested Next Action",
            "Property Address",
            "Address",
            "City",
            "State",
            "Owner Name",
            "Mailing Address",
            "Phone",
            "Email",
        ]
        if column in filtered.columns
    ]
    display_df = filtered[priority_columns] if priority_columns else filtered
    st.dataframe(display_df, use_container_width=True, hide_index=True)
    dataframe_download(filtered, "ranked_hot_property_leads.csv", "Download ranked leads")

    st.subheader("Map")
    render_map(filtered)

    if not filtered.empty:
        top_lead = filtered.iloc[0]
        st.subheader("Top lead playbook")
        st.markdown(
            f"""
            **Lead temperature:** {top_lead['Lead Temperature']} ({top_lead['Lead Score']}/100)

            **Evidence:** {top_lead['Distress Evidence']}

            **Recommended next action:** {top_lead['Suggested Next Action']}

            **Contact sequence:** call or skip trace first, send a short SMS if compliant, mail a personal letter,
            then re-check county records before making an offer.
            """
        )


def render_map_tools() -> None:
    st.header("Map and data tools")
    st.write(
        "Use this workspace for parcel CSVs. If coordinates are missing, choose an address column and geocode before mapping."
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
    st.sidebar.write("Seller intake, hot-lead scoring, and property mapping.")
    st.sidebar.markdown("**Target markets**")
    for county in SUPPORTED_COUNTIES.values():
        st.sidebar.write(f"- {county['label']}")

    seller_tab, agent_tab, map_tab = st.tabs(
        ["Seller landing page", "Lead Scout Agent", "Map and data tools"]
    )
    with seller_tab:
        render_seller_landing()
    with agent_tab:
        render_lead_agent()
    with map_tab:
        render_map_tools()


if __name__ == "__main__":
    main()
