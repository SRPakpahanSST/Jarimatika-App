import streamlit as st
import os

st.set_page_config(page_title="Jarimatika App", page_icon="🖐️", layout="wide")

if os.path.exists("index.html"):
    st.success("✅ index.html ditemukan!")
    with open("index.html", "r", encoding="utf-8") as f:
        html_content = f.read()
    
    # Debug: tampilkan panjang konten
    st.write(f"📄 Panjang konten HTML: {len(html_content)} karakter")
    
    # Tampilkan komponen HTML
    st.components.v1.html(html_content, height=950, scrolling=True)
else:
    st.error("❌ File index.html tidak ditemukan di root!")