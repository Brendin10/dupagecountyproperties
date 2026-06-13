import streamlit as st
import pandas as pd
import pydeck as pdk
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter

st.set_page_config(layout="wide")
st.title("DuPage County Property Map & Geocoder")

# --- 1. Geocoding Function (Cached) ---
@st.cache_data(show_spinner=False)
def geocode_addresses(df, address_col):
    geolocator = Nominatim(user_agent="dupage_property_mapper")
    geocode = RateLimiter(geolocator.geocode, min_delay_seconds=1)
    
    df['Raw_Location'] = df[address_col].apply(geocode)
    df['LATITUDE'] = df['Raw_Location'].apply(lambda loc: loc.latitude if loc else None)
    df['LONGITUDE'] = df['Raw_Location'].apply(lambda loc: loc.longitude if loc else None)
    df = df.drop(columns=['Raw_Location'])
    return df

# --- 2. File Upload Space ---
uploaded_file = st.file_uploader(
    "Upload CSV (If missing LATITUDE/LONGITUDE, we will generate them)", type="csv"
)

if uploaded_file:
    df = pd.read_csv(uploaded_file, low_memory=False)
    required_columns = {'LATITUDE', 'LONGITUDE'}
    
    # --- 3. Check & Geocode ---
    if not required_columns.issubset(df.columns):
        st.warning("No LATITUDE or LONGITUDE columns found. Let's geocode your addresses.")
        
        if {'BILLSTNUM', 'BILLSTNAME', 'BILLCITY', 'BILLSTATE'}.issubset(df.columns):
            df['Full_Address'] = df['BILLSTNUM'].astype(str) + " " + df['BILLSTNAME'] + ", " + df['BILLCITY'] + ", " + df['BILLSTATE']
            address_columns = ['Full_Address'] + list(df.columns)
        else:
            address_columns = df.columns
            
        address_col = st.selectbox("Select the column containing the full address:", address_columns)
        
        if st.button("Start Geocoding"):
            with st.spinner("Geocoding..."):
                df = geocode_addresses(df, address_col)
                st.success("Geocoding complete!")
    
    # --- 4. Process Data and Plot the Map ---
    if required_columns.issubset(df.columns):
        
        # Filter unwanted columns
        target_columns = ['Consolidated Bill Address', 'BILLVALUE', 'BILLNAME', 'ACREAGE', 'LATITUDE', 'LONGITUDE']
        columns_to_keep = [col for col in target_columns if col in df.columns]
        df_clean = df[columns_to_keep].dropna(subset=['LATITUDE', 'LONGITUDE']).copy()

        # Zoom to DuPage County
        midpoint = [41.86, -88.05]  

        if st.checkbox("Show cleaned data"):
            st.write(df_clean)

        csv = df_clean.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="Download Final Cleaned CSV",
            data=csv,
            file_name='final_dupage_properties.csv',
            mime='text/csv',
        )

        # --- THE FIX: STRICT 2-METER RADIUS ---
        layer = pdk.Layer(
            "ScatterplotLayer",
            data=df_clean,
            get_position='[LONGITUDE, LATITUDE]',
            get_radius=2,                 # Hardcoded to exactly 2
            radius_units="meters",        # Locked strictly to real-world meters
            get_color=[0, 100, 255, 140], # Kept transparency for overlap blending
            pickable=True,
        )

        # Tooltip
        tooltip_html = """
            <b>Owner:</b> {BILLNAME}<br>
            <b>Address:</b> {Consolidated Bill Address}<br>
            <b>Parcel Value:</b> {BILLVALUE}<br>
            <b>Acreage:</b> {ACREAGE}
        """
        tooltip = {"html": tooltip_html, "style": {"backgroundColor": "steelblue", "color": "white"}}

        # Render the pydeck map using the free Carto basemap
        r = pdk.Deck(
            map_style="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
            initial_view_state=pdk.ViewState(
                latitude=midpoint[0], longitude=midpoint[1], zoom=10, pitch=0
            ),
            layers=[layer],
            tooltip=tooltip,
        )
        st.pydeck_chart(r)
