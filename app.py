import streamlit as st

st.set_page_config(page_title="Jarimatika App", page_icon="🖐️", layout="wide")

with open("index.html", "r") as f:
    html = f.read()

# Tampilkan sebagai markdown (hanya untuk debug)
st.markdown(html, unsafe_allow_html=True)