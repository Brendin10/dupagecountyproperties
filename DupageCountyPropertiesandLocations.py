import streamlit as st
import pandas as pd
import pydeck as pdk
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter

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
    df = pd.read_csv(uploaded_file)
    required_columns = {'LATITUDE', 'LONGITUDE'}
    
    # --- 3. Check for Coordinates & Geocode if Missing ---
    if not required_columns.issubset(df.columns):
        st.warning("No LATITUDE or LONGITUDE columns found. Let's geocode your addresses.")
        
        # Auto-combine address columns based on your existing tooltip format
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
                
                # Create the spot to download the new CSV
                csv = df.to_csv(index=False).encode('utf-8')
                st.download_button(
                    label="Download Enriched CSV (with Lat/Lon)",
                    data=csv,
                    file_name='geocoded_properties.csv',
                    mime='text/csv',
                )
    
    # --- 4. Plot the Map (Only triggers if coordinates exist) ---
    if required_columns.issubset(df.columns):
        
        # Remove any rows where the geocoder failed to find a location
        df_clean = df.dropna(subset=['LATITUDE', 'LONGITUDE'])
        if len(df_clean) < len(df):
            st.info(f"Omitted {len(df) - len(df_clean)} rows that could not be mapped.")

        # Zoom to DuPage County
        midpoint = [41.86, -88.05]  

        if st.checkbox("Show raw data"):
            st.write(df_clean)

        # Define the map layer
       # Define the map layer
        layer = pdk.Layer(
            "ScatterplotLayer",
            data=df_clean,
            get_position='[LONGITUDE, LATITUDE]',
            get_radius=5,              # Changed from 80 to 5
            radius_units="pixels",     # Forces dots to stay 5 pixels wide on your screen!
            get_color=[0, 100, 255, 140], # Added a 4th number (140) for transparency
            pickable=True,
        )

        # Tooltip
        tooltip_html = """
            <b>PIN:</b> {PIN}<br>
            <b>Address:</b> {BILLSTNUM} {BILLSTNAME}, {BILLCITY}, {BILLSTATE} {BILLZIP}<br>
            <b>Owner:</b> {BILLNAME}<br>
            <b>Parcel Value:</b> {BILLVALUE}
        """
        tooltip = {"html": tooltip_html, "style": {"backgroundColor": "steelblue", "color": "white"}}

        # Render the pydeck map
       # Render the pydeck map
        r = pdk.Deck(
            # Swapped Mapbox for Carto's 'Voyager' style (a colorful, detailed street map)
            map_style="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
            initial_view_state=pdk.ViewState(
                latitude=midpoint[0], longitude=midpoint[1], zoom=10, pitch=0
            ),
            layers=[layer],
            tooltip=tooltip,
        )
        st.pydeck_chart(r)
