import streamlit as st
import pandas as pd
import pydeck as pdk

st.title("DuPage County Property Map")

uploaded_file = st.file_uploader(
    "Upload CSV (must include 'LATITUDE' and 'LONGITUDE' columns)", type="csv"
)

if uploaded_file:
    df = pd.read_csv(uploaded_file)
    
    # Check for required columns
    required_columns = {'LATITUDE', 'LONGITUDE'}
    if not required_columns.issubset(df.columns):
        st.error("CSV must contain 'LATITUDE' and 'LONGITUDE' columns!")
    else:
        # Zoom to DuPage County
        midpoint = [41.86, -88.05]  # Center of DuPage County, IL

        # If you want to see the DataFrame
        if st.checkbox("Show raw data"):
            st.write(df)

        # Define the map layer and tooltip
        layer = pdk.Layer(
            "ScatterplotLayer",
            data=df,
            get_position='[LONGITUDE, LATITUDE]',
            get_radius=80,
            get_color=[0, 100, 255],
            pickable=True,
        )

        # Tooltip with property info: will display empty if key is missing in the df
        tooltip_html = """
            <b>PIN:</b> {PIN}<br>
            <b>Address:</b> {BILLSTNUM} {BILLSTNAME}, {BILLCITY}, {BILLSTATE} {BILLZIP}<br>
            <b>Owner:</b> {BILLNAME}<br>
            <b>Parcel Value:</b> {BILLVALUE}
        """
        tooltip = {"html": tooltip_html, "style": {"backgroundColor": "steelblue", "color": "white"}}

        # Render the pydeck map
        r = pdk.Deck(
            map_style="mapbox://styles/mapbox/light-v9",
            initial_view_state=pdk.ViewState(
                latitude=midpoint[0], longitude=midpoint[1], zoom=10, pitch=0
            ),
            layers=[layer],
            tooltip=tooltip,
        )
        st.pydeck_chart(r)
