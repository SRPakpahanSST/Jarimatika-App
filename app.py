import streamlit as st
import os

st.set_page_config(page_title="Jarimatika App", page_icon="🖐️", layout="wide")

# Debug: tampilkan info file
if os.path.exists("index.html"):
    st.success("✅ index.html ditemukan!")
    with open("index.html", "r", encoding="utf-8") as f:
        html_content = f.read()
    # Tampilkan komponen HTML
    st.components.v1.html(html_content, height=950, scrolling=True)
else:
    st.error("❌ File index.html tidak ditemukan di root!")