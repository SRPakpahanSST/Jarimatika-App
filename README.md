# Jarimatika-App
Aplikasi Operasi Matematika pakai Jari Tangan

URL Link Aplikasi: https://jarimatika-app.streamlit.app/

# Jarimatika App 🖐️

Aplikasi belajar berhitung dengan jari (Jarimatika) berbasis Computer Vision dan AI.

## ✨ Fitur

- **Deteksi Jari Real-time**: Menggunakan MediaPipe untuk mendeteksi jumlah jari yang terbuka
- **Kalkulator Interaktif**: Kalkulator dengan input dari deteksi jari
- **AI Chatbot**: Asisten pintar untuk belajar Jarimatika
- **Tampilan Responsif**: Bisa digunakan di desktop dan mobile
- **Dark/Light Theme**: Nyaman digunakan dalam berbagai kondisi

## 🚀 Teknologi

- HTML5 + CSS3 + JavaScript (ES6+)
- MediaPipe Hands untuk deteksi tangan
- TensorFlow.js untuk model AI
- WebRTC (MediaStream) untuk akses kamera
- Canvas API untuk rendering

## 📦 Instalasi

1. Clone repository:
```bash
git clone https://github.com/yourusername/jarimatika-app.git
cd jarimatika-app


2. Buka dengan Live Server:
   · VS Code: Install extension "Live Server"
   · Klik kanan index.html → "Open with Live Server"
3. Atau menggunakan Python:

```bash
python -m http.server 8000
```

📁 Struktur Proyek

```
jarimatika-app/
├── index.html          # Halaman utama
├── css/
│   └── style.css       # Styling
├── js/
│   ├── app.js          # Aplikasi utama
│   ├── camera.js       # Manajemen kamera
│   ├── hand-detector.js # Deteksi tangan
│   ├── calculator.js   # Kalkulator
│   └── chatbot.js      # AI Chatbot
├── model/
│   ├── model.json      # Model AI
│   └── metadata.json   # Metadata model
└── assets/
    └── images/         # Gambar dan ikon
```

🎯 Cara Penggunaan

1. Mulai Kamera: Klik "Mulai Kamera" dan izinkan akses kamera
2. Tunjukkan Jari: Arahkan tangan ke kamera
3. Lihat Hasil: Aplikasi akan menampilkan jumlah jari dan angka
4. Gunakan Kalkulator: Klik tombol atau gunakan deteksi jari untuk input
5. Tanya Chatbot: Tanyakan tentang Jarimatika atau minta bantuan hitung

🧪 Demo

Aplikasi bisa diakses di: https://jarimatika-app.streamlit.app/

🤝 Kontribusi

Silakan buat Pull Request atau laporkan issue di GitHub.

📄 Lisensi

MIT License - © 2026 Ubelasy + NKHM Nusantara

```

### 12. **.gitignore** (Version Control)

```

Node

node_modules/
npm-debug.log*

Python

pycache/
*.py[cod]
*.so
.Python
env/
venv/
*.egg-info/

IDE

.vscode/
.idea/
*.swp
*.swo

OS

.DS_Store
Thumbs.db

Build

dist/
build/
*.zip
*.tar.gz

Secrets

.env
*.pem
*.key

Model files (large)

*.bin
*.h5
*.pb

Logs

logs/
*.log

```

## 📱 Catatan Penting untuk Deployment

### Untuk Streamlit Cloud:
1. Pastikan file `requirements.txt` ada dengan dependensi yang sesuai
2. Gunakan versi Python 3.10 atau 3.11
3. File utama harus bernama `app.py` atau `main.py` untuk Streamlit

### Untuk GitHub Pages:
1. Pindahkan semua file ke branch `gh-pages`
2. Pastikan path file relatif (gunakan `./` untuk referensi)
3. Enable GitHub Pages di repository settings

### Dependensi yang Dibutuhkan:
```text
# Untuk deployment Streamlit
streamlit>=1.28.0
opencv-python
mediapipe
numpy
pillow
```

Semua file di atas sudah lengkap dan siap digunakan untuk aplikasi Jarimatika App yang terintegrasi dengan Ubelasy + NKHM Nusantara! 🎉

