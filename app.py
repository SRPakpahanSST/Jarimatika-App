import streamlit as st
import os

st.set_page_config(page_title="Jarimatika App", page_icon="🖐️", layout="wide")

st.write("🔍 Debug: Aplikasi mulai...")
st.write(f"📁 Current working directory: {os.getcwd()}")
st.write(f"📄 File index.html exists? {os.path.exists('index.html')}")

if os.path.exists("index.html"):
    st.success("✅ index.html ditemukan!")
    with open("index.html", "r", encoding="utf-8") as f:
        html_content = f.read()
    st.write(f"📄 Panjang HTML: {len(html_content)} karakter")
    st.components.v1.html(html_content, height=950, scrolling=True)
else:
    st.error("❌ File index.html tidak ditemukan di root!")