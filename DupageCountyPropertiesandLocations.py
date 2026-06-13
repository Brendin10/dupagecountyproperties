import streamlit as st
import pandas as pd
import numpy as np
import pydeck as pdk
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter

st.set_page_config(layout="wide")
st.title("DuPage County Property Map & Geocoder")

# --- 1. Geocoding Function (Cached so it only runs once per dataset) ---
@st.cache_data(show_spinner=False)
def geocode_addresses(df, address_col):
    geolocator = Nominatim(user_agent="dupage_property_mapper")
    geocode = RateLimiter(geolocator.geocode, min_delay_seconds=1)
    
    # Apply geocoding
    df['Raw_Location'] = df[address_col].apply(geocode)
    
    # Extract coordinates
    df['LATITUDE'] = df['Raw_Location'].apply(lambda loc: loc.latitude if loc else None)
    df['LONGITUDE'] = df['Raw_Location'].apply(lambda loc: loc.longitude if loc else None)
    
    # Clean up the raw location data
    df = df.drop(columns=['Raw_Location'])
    return df

# --- 2. File Upload Space ---
uploaded_file = st.file_uploader(
    "Upload CSV (If missing LATITUDE/LONGITUDE, we will generate them)", type="csv"
)

if uploaded_file:
    # Added low_memory=False to prevent mixed-type warnings on large files
    df = pd.read_csv(uploaded_file, low_memory=False)
    required_columns = {'LATITUDE', 'LONGITUDE'}
    
    # --- 3. Check for Coordinates & Geocode if Missing ---
    if not required_columns.issubset(df.columns):
        st.warning("No LATITUDE or LONGITUDE columns found. Let's geocode your addresses.")
        
        # Auto-combine address columns based on existing tooltip format
        if {'BILLSTNUM', 'BILLSTNAME', 'BILLCITY', 'BILLSTATE'}.issubset(df.columns):
            df['Full_Address'] = df['BILLSTNUM'].astype(str) + " " + df['BILLSTNAME'] + ", " + df['BILLCITY'] + ", " + df['BILLSTATE']
            address_columns = ['Full_Address'] + list(df.columns)
        else:
            address_columns = df.columns
            
        # Let the user confirm which column to use
        address_col = st.selectbox("Select the column containing the full address:", address_columns)
        
        if st.button("Start Geocoding"):
            with st.spinner("Geocoding... (Takes ~1 second per address to respect API limits)"):
                df = geocode_addresses(df, address_col)
                st.success("Geocoding complete!")
    
    # --- 4. Process Data and Plot the Map (Only triggers if coordinates exist) ---
    if required_columns.issubset(df.columns):
        
        # --- Filter out unwanted columns ---
        # We only keep the specific columns you requested, if they exist in the file
        target_columns = ['Consolidated Bill Address', 'BILLVALUE', 'BILLNAME', 'ACREAGE', 'LATITUDE', 'LONGITUDE']
        columns_to_keep = [col for col in target_columns if col in df.columns]
        df_filtered = df[columns_to_keep].copy()

        # Remove any rows where the geocoder failed to find a location
        df_clean = df_filtered.dropna(subset=['LATITUDE', 'LONGITUDE']).copy()
        if len(df_clean) < len(df_filtered):
            st.info(f"Omitted {len(df_filtered) - len(df_clean)} rows that could not be mapped.")

        # --- Dynamic Property Sizing Math ---
        # Ensure ACREAGE is a number (fills missing acreage with 0.25 acres as a fallback)
        if 'ACREAGE' in df_clean.columns:
            df_clean['ACREAGE'] = pd.to_numeric(df_clean['ACREAGE'], errors='coerce').fillna(0.25)
        else:
            df_clean['ACREAGE'] = 0.25 # Fallback if column is entirely missing

        # Calculate the physical radius of the property in meters (1 acre = ~4046.86 sq meters)
        df_clean['Real_Radius_Meters'] = np.sqrt((df_clean['ACREAGE'] * 4046.86) / np.pi)
        
        # Add a slider to let you tweak the "1/10th" size dynamically just in case!
        scale_factor = st.sidebar.slider("Dot Size Scale (0.1 = 1/10th size)", min_value=0.01, max_value=1.0, value=0.10, step=0.01)
        df_clean['Display_Radius'] = df_clean['Real_Radius_Meters'] * scale_factor
        # -------------------------------------

        # Zoom to DuPage County
        midpoint = [41.86, -88.05]  

        if st.checkbox("Show cleaned data"):
            st.write(df_clean)

        # Allow user to download the final cleaned and mapped dataset
        csv = df_clean.to_csv(index=False).encode('utf-8')
        st.download_button(
            label="Download Final Cleaned CSV",
            data=csv,
            file_name='final_dupage_properties.csv',
            mime='text/csv',
        )

        # Define the map layer
        layer = pdk.Layer(
            "ScatterplotLayer",
            data=df_clean,
            get_position='[LONGITUDE, LATITUDE]',
            get_radius='Display_Radius',  # Uses your custom calculated size
            radius_units="meters",        # Stays grounded in real-world meters
            get_color=[0, 100, 255, 140], # Kept transparency for overlap blending
            pickable=True,
        )

        # Tooltip - adjusted to use the columns we kept
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
