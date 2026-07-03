"""
Jarimatika App - Streamlit Application
Main entry point for Streamlit Cloud deployment
"""

import streamlit as st
import cv2
import numpy as np
from PIL import Image
import mediapipe as mp
import json
import os
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv()

# Page configuration
st.set_page_config(
    page_title="Jarimatika App - Ubelasy + NKHM",
    page_icon="🖐️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    /* Main header */
    .main-header {
        background: linear-gradient(135deg, #6C63FF, #FF6584);
        padding: 20px;
        border-radius: 10px;
        color: white;
        text-align: center;
        margin-bottom: 30px;
    }
    .main-header h1 {
        font-size: 3rem;
        margin: 0;
        font-weight: 700;
    }
    .main-header p {
        font-size: 1.2rem;
        margin: 5px 0 0;
        opacity: 0.9;
    }
    
    /* Feature cards */
    .feature-card {
        background: #f0f2f6;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        margin: 10px 0;
        transition: transform 0.3s;
    }
    .feature-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    }
    .feature-card .icon {
        font-size: 3rem;
        margin-bottom: 10px;
    }
    
    /* Status indicator */
    .status-indicator {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        margin-right: 8px;
    }
    .status-active { background: #00ff00; }
    .status-inactive { background: #ff0000; }
    
    /* Finger count display */
    .finger-display {
        background: #ffffff;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .finger-number {
        font-size: 4rem;
        font-weight: 700;
        color: #6C63FF;
    }
    
    /* Custom button */
    .stButton > button {
        background: #6C63FF;
        color: white;
        border: none;
        padding: 10px 30px;
        border-radius: 5px;
        font-weight: 600;
        transition: all 0.3s;
    }
    .stButton > button:hover {
        background: #5A52D5;
        transform: scale(1.05);
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state
if 'camera_running' not in st.session_state:
    st.session_state.camera_running = False
if 'finger_count' not in st.session_state:
    st.session_state.finger_count = 0
if 'prediction_result' not in st.session_state:
    st.session_state.prediction_result = "Menunggu deteksi..."
if 'chat_history' not in st.session_state:
    st.session_state.chat_history = []

# MediaPipe Hands initialization
@st.cache_resource
def load_hand_detector():
    """Load MediaPipe Hands model"""
    try:
        mp_hands = mp.solutions.hands
        hands = mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.6
        )
        return hands, mp_hands
    except Exception as e:
        st.error(f"Failed to load hand detector: {e}")
        return None, None

# Count fingers function
def count_fingers(landmarks):
    """Count number of open fingers"""
    if not landmarks:
        return 0
    
    # Finger tip and base indices
    finger_tips = [4, 8, 12, 16, 20]  # Thumb, Index, Middle, Ring, Pinky
    finger_bases = [2, 5, 9, 13, 17]
    
    count = 0
    for tip, base in zip(finger_tips, finger_bases):
        tip_y = landmarks.landmark[tip].y
        base_y = landmarks.landmark[base].y
        if tip_y < base_y:
            count += 1
    
    return min(count, 4)  # Max 4 fingers for this demo

# Process frame function
def process_frame(frame, hands, mp_hands):
    """Process video frame and detect fingers"""
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb_frame)
    
    finger_count = 0
    landmarks = None
    
    if results.multi_hand_landmarks:
        landmarks = results.multi_hand_landmarks[0]
        finger_count = count_fingers(landmarks)
        
        # Draw landmarks on frame
        mp_drawing = mp.solutions.drawing_utils
        mp_drawing.draw_landmarks(
            frame,
            landmarks,
            mp_hands.HAND_CONNECTIONS,
            mp_drawing.DrawingSpec(color=(108, 99, 255), thickness=2, circle_radius=2),
            mp_drawing.DrawingSpec(color=(255, 101, 132), thickness=2)
        )
    
    return frame, finger_count, landmarks

# Main layout
def main():
    # Header
    st.markdown("""
    <div class="main-header">
        <h1>🖐️ Jarimatika App</h1>
        <p>Belajar Berhitung dengan Jari • Ubelasy + NKHM Nusantara</p>
    </div>
    """, unsafe_allow_html=True)

    # Sidebar
    with st.sidebar:
        st.markdown("## 📋 Menu")
        
        # Camera controls
        st.markdown("### 📷 Kamera")
        if st.button("🎥 Mulai Kamera", use_container_width=True):
            st.session_state.camera_running = True
            st.rerun()
        
        if st.button("⏹ Stop Kamera", use_container_width=True):
            st.session_state.camera_running = False
            st.rerun()
        
        # FPS settings
        fps = st.selectbox("Frame Rate", [15, 30, 60], index=1)
        
        st.markdown("---")
        
        # Info
        st.markdown("### 📖 Panduan")
        st.info("""
        **Tangan Kanan** = Satuan (1-9)
        
        **Tangan Kiri** = Puluhan (10-90)
        
        💡 Tips:
        - Pastikan tangan terlihat jelas
        - Gunakan latar belakang terang
        - Jarak 30-50 cm dari kamera
        """)
        
        st.markdown("---")
        
        # Version
        st.caption("v1.0.0 • © 2026 Ubelasy + NKHM")

    # Main content
    col1, col2 = st.columns([2, 1])
    
    with col1:
        # Camera display
        st.markdown("### 📹 Kamera")
        camera_placeholder = st.empty()
        
        # Status
        status_text = "🟢 Active" if st.session_state.camera_running else "🔴 Inactive"
        st.markdown(f"Status: {status_text}")
        
        # Process camera feed
        if st.session_state.camera_running:
            hands, mp_hands = load_hand_detector()
            
            if hands is not None:
                cap = cv2.VideoCapture(0)
                cap.set(cv2.CAP_PROP_FPS, fps)
                
                try:
                    ret, frame = cap.read()
                    if ret:
                        frame = cv2.resize(frame, (640, 480))
                        processed_frame, finger_count, landmarks = process_frame(
                            frame, hands, mp_hands
                        )
                        
                        # Update session state
                        st.session_state.finger_count = finger_count
                        st.session_state.prediction_result = f"{finger_count} jari terbuka"
                        
                        # Display frame
                        camera_placeholder.image(
                            processed_frame,
                            channels="BGR",
                            use_container_width=True
                        )
                except Exception as e:
                    st.error(f"Error processing camera feed: {e}")
                finally:
                    cap.release()
        
        # Finger count display
        st.markdown("### 🤚 Deteksi Jari")
        col_f1, col_f2 = st.columns(2)
        with col_f1:
            st.markdown(f"""
            <div class="finger-display">
                <div style="font-size: 1rem; color: #636E72;">Jari Terbuka</div>
                <div class="finger-number">{st.session_state.finger_count}</div>
            </div>
            """, unsafe_allow_html=True)
        with col_f2:
            st.markdown(f"""
            <div class="finger-display">
                <div style="font-size: 1rem; color: #636E72;">Angka</div>
                <div class="finger-number" style="color: #FF6584;">{st.session_state.finger_count}</div>
            </div>
            """, unsafe_allow_html=True)
    
    with col2:
        # Calculator
        st.markdown("### 🧮 Kalkulator")
        calc_display = st.text_input(
            "Display",
            value="0",
            disabled=True,
            key="calc_display"
        )
        
        # Calculator buttons
        buttons = [
            ['7', '8', '9', '÷'],
            ['4', '5', '6', '×'],
            ['1', '2', '3', '-'],
            ['0', 'C', '=', '+']
        ]
        
        for row in buttons:
            cols = st.columns(4)
            for idx, btn in enumerate(row):
                with cols[idx]:
                    if st.button(btn, use_container_width=True):
                        st.session_state.calc_display = btn
        
        st.markdown("---")
        
        # Chatbot
        st.markdown("### 🤖 AI Chatbot")
        
        # Chat display
        chat_container = st.container()
        with chat_container:
            for msg in st.session_state.chat_history[-5:]:
                if msg['role'] == 'user':
                    st.markdown(f"👤 {msg['content']}")
                else:
                    st.markdown(f"🤖 {msg['content']}")
        
        # Chat input
        chat_input = st.text_input("Tanyakan sesuatu...", key="chat_input")
        if st.button("Kirim", use_container_width=True):
            if chat_input:
                # Add user message
                st.session_state.chat_history.append({
                    'role': 'user',
                    'content': chat_input
                })
                
                # Simple bot response
                if any(word in chat_input.lower() for word in ['halo', 'hai', 'hello']):
                    response = "Halo! Selamat datang di Jarimatika App! Ada yang bisa saya bantu?"
                elif 'jari' in chat_input.lower():
                    response = f"Deteksi jari saat ini: {st.session_state.finger_count} jari terbuka."
                elif any(op in chat_input for op in ['+', '-', '×', '÷']):
                    try:
                        # Simple calculator for chat
                        result = eval(chat_input.replace('×', '*').replace('÷', '/'))
                        response = f"Hasilnya adalah {result}"
                    except:
                        response = "Maaf, saya tidak bisa menghitung ekspresi itu."
                else:
                    response = "Saya asisten Jarimatika. Coba tanyakan tentang berhitung dengan jari!"
                
                # Add bot response
                st.session_state.chat_history.append({
                    'role': 'bot',
                    'content': response
                })
                
                st.rerun()

    # Footer
    st.markdown("---")
    st.markdown(
        "<p style='text-align: center; color: #636E72; font-size: 0.85rem;'>"
        "Powered by MediaPipe · TensorFlow.js · Streamlit<br>"
        "© 2026 Ubelasy + NKHM Nusantara"
        "</p>",
        unsafe_allow_html=True
    )

if __name__ == "__main__":
    main()