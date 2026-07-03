import streamlit as st

# Konfigurasi halaman
st.set_page_config(
    page_title="Jarimatika App - Ubelasy + NKHM",
    page_icon="🖐️",
    layout="wide"
)

# Baca file index.html
with open("index.html", "r", encoding="utf-8") as f:
    html_content = f.read()

# Tampilkan sebagai komponen HTML (iframe)
st.components.v1.html(html_content, height=950, scrolling=True)