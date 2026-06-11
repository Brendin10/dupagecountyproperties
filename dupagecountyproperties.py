import streamlit as st
import pandas as pd
import pydeck as pdk

st.title('DuPage County Property Mapper')

# Upload file
uploaded_file = st.file_uploader("Upload your properties CSV", type="csv")

if uploaded_file is not None:
    df = pd.read_csv(uploaded_file)
    
    # Check that the CSV has lat/lon; else error message
    if not {'LATITUDE','LONGITUDE'}.issubset(df.columns):
        st.error("Your CSV must contain LATITUDE and LONGITUDE columns.")
    else:
        # Focus on DuPage County
        midpoint = (41.86, -88.05)  # Approx center of DuPage County, IL

        st.map(df, latitude='LATITUDE', longitude='LONGITUDE', zoom=10)
        
        # Custom Pydeck for popups and more info
        st.write("Click any pin for insights:")
        layer = pdk.Layer(
            "ScatterplotLayer",
            data=df,
            get_position='[LONGITUDE, LATITUDE]',
            get_radius=80,
            get_color=[0, 200, 0],
            pickable=True,
            auto_highlight=True,
        )
        
        # Create popup/tooltip content
        tooltip = {
            "html": """
                <b>Address:</b> {BILLSTNUM} {BILLSTNAME}, {BILLCITY}<br>
                <b>Owner:</b> {BILLNAME}<br>
                <b>PIN:</b> {PIN}<br>
                <b>Parcel Value:</b> {BILLVALUE}
                """,
            "style": {"backgroundColor": "steelblue", "color": "white"}
        }

        view_state = pdk.ViewState(latitude=midpoint[0], longitude=midpoint[1], zoom=10)

        # Show the map
        r = pdk.Deck(
            map_style='mapbox://styles/mapbox/light-v9',
            initial_view_state=view_state,
            layers=[layer],
            tooltip=tooltip
        )

        st.pydeck_c[[5]] inst[[6]]`
2. [[7]]```
3. Use your browser to interact-upload a CSV and see the map.


#### **References**  
- [[2]]
- [[3]]
- [[4]]


import streamlit as st
import pandas as pd
import pydeck as pdk

st.title("DuPage County Property Map")

uploaded_file = st.file_uploader("Upload a CSV (must include LATITUDE and LONGITUDE columns)", type="csv")

if uploaded_file:
    df = pd.read_csv(uploaded_file)
    if 'LATITUDE' not in df.columns or 'LONGITUDE' not in df.columns:
        st.error("CSV must have LATITUDE and LONGITUDE columns")
    else:
        # Map is focused on DuPage County
        midpoint = {"lat": 41.86, "lon": -88.05}
        # Prepare PyDeck layer
        layer = pdk.Layer(
            "ScatterplotLayer",
            data=df,
            get_position="[LONGITUDE, LATITUDE]",
            get_radius=80,
            get_color=[0, 100, 255],
            pickable=True,
        )
        # Tooltips: show selected property info
        tooltip = {
            "html": """
            <b>PIN:</b> {PIN}<br>
            <b>Address:</b> {BILLSTNUM} {BILLSTNAME}, {BILLCITY}, {BILLSTATE} {BILLZIP}<br>
            <b>Owner:</b> {BILLNAME}<br>
            <b>Parcel Value:</b> {BILLVALUE}
            """,
            "style": {"backgroundColor": "steelblue", "color": "white"}
        }
        # Show the map
        st.pydeck_chart(
            pdk.Deck(
                map_style='mapbox://styles/mapbox/light-v9',
                initial_view_state=pdk.ViewState(
                    latitude=midpoint["lat"],
                    longitude=midpoint["lon"],
                    zoom=10,
                    pitch=0,
                ),
                layers=[layer],
                tooltip=tooltip,
            )
        )
