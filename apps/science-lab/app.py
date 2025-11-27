import streamlit as st
import pandas as pd
import clickhouse_connect
import plotly.express as px
import time

# Page Config
st.set_page_config(
    page_title="Operation Obsidian // Science Lab",
    page_icon="🔬",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom CSS for "Ordnance" Aesthetic
st.markdown("""
<style>
    .stApp {
        background-color: #000000;
        color: #ffffff;
        font-family: 'Inter', sans-serif;
    }
    .stMetric {
        background-color: #111111;
        border: 1px solid #333;
        padding: 10px;
        border-radius: 5px;
    }
    h1, h2, h3 {
        font-family: 'JetBrains Mono', monospace;
        letter-spacing: -1px;
    }
</style>
""", unsafe_allow_html=True)

# Database Connection
@st.cache_resource
def get_client():
    return clickhouse_connect.get_client(host='localhost', port=8123, username='default', password='password')

client = get_client()

# Header
st.title("🔬 SCIENCE LAB")
st.markdown("`SECURE DATA ANALYTICS TERMINAL`")
st.divider()

# Auto-refresh
if st.checkbox("Auto-refresh (5s)", value=True):
    time.sleep(5)
    st.rerun()

# Fetch Data
try:
    df = client.query_df('SELECT * FROM ledger_events_olap ORDER BY timestamp DESC LIMIT 1000')
    
    if not df.empty:
        # Metrics
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Total Events", len(df))
        with col2:
            st.metric("Unique Actors", df['actor_id'].nunique())
        with col3:
            st.metric("Latest Action", df.iloc[0]['action_type'])

        # Timeline Chart
        df['datetime'] = pd.to_datetime(df['timestamp'], unit='ms')
        fig = px.scatter(df, x='datetime', y='action_type', color='action_type', 
                         title="Event Timeline", template="plotly_dark",
                         hover_data=['actor_id', 'payload'])
        st.plotly_chart(fig, use_container_width=True)

        # Raw Data
        st.subheader("Raw Ledger Data")
        st.dataframe(df, use_container_width=True)
    else:
        st.info("No data found in the Ledger. Waiting for incoming telemetry...")

except Exception as e:
    st.error(f"Connection Error: {e}")
