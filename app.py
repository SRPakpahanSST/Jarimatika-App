import streamlit as st
import os

st.set_page_config(page_title="Jarimatika App", page_icon="🖐️", layout="wide")

# Cek apakah file index.html ada
if not os.path.exists("index.html"):
    st.error("❌ File index.html tidak ditemukan. Pastikan file ada di root proyek.")
    st.stop()

try:
    with open("index.html", "r", encoding="utf-8") as f:
        html_content = f.read()
except Exception as e:
    st.error(f"❌ Gagal membaca index.html: {e}")
    st.stop()

# Tampilkan komponen HTML
st.components.v1.html(html_content, height=950, scrolling=True)