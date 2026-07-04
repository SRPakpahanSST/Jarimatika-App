import CameraManager from './camera.js';
import HandDetector from './hand-detector.js';
import JarimatikaCalculator from './calculator.js';
import JarimatikaChatbot from './chatbot.js';

// Tampilkan error di layar (untuk debugging)
window.onerror = function(msg, url, line, col, error) {
    const div = document.createElement('div');
    div.style.cssText = 'position:fixed; bottom:0; left:0; right:0; background:red; color:white; padding:10px; z-index:9999; font-size:14px;';
    div.innerHTML = `❌ Error: ${msg}<br>${url}:${line}:${col}`;
    document.body.appendChild(div);
};

class JarimatikaApp {
    constructor() {
        this.camera = null;
        this.detector = null;
        this.calculator = null;
        this.chatbot = null;
        this.isRunning = false;
        this.isDarkTheme = false;
        this.init();
    }

    // Function untuk load modul dengan error handling
async function loadModule(path) {
    try {
        const module = await import(path);
        return module;
    } catch (e) {
        const div = document.createElement('div');
        div.style.cssText = 'position:fixed; top:0; left:0; right:0; background:red; color:white; padding:10px; z-index:9999; font-size:16px;';
        div.innerHTML = `❌ Gagal memuat ${path}: ${e.message}`;
        document.body.appendChild(div);
        console.error(`Gagal memuat ${path}:`, e);
        return null;
    }
}

// Ganti import statis dengan dynamic
// Hapus 4 baris import di atas, lalu di dalam init():
async init() {
    try {
        const CameraManager = (await loadModule('./camera.js')).default;
        const HandDetector = (await loadModule('./hand-detector.js')).default;
        const JarimatikaCalculator = (await loadModule('./calculator.js')).default;
        const JarimatikaChatbot = (await loadModule('./chatbot.js')).default;

        if (!CameraManager || !HandDetector || !JarimatikaCalculator || !JarimatikaChatbot) {
            this.updateStatus('error', '❌ Gagal memuat modul');
            return;
        }

        this.camera = new CameraManager();
        this.detector = new HandDetector();
        this.calculator = new JarimatikaCalculator();
        this.chatbot = new JarimatikaChatbot();

        // ... sisanya sama
    }
}

            // Saat kamera siap, mulai loop prediksi
            this.camera.onReady(() => {
                this.startPredictionLoop();
            });

            // Fallback: jika kamera tidak aktif dalam 5 detik, tetap jalankan simulasi
            setTimeout(() => {
                if (!this.camera.isActive()) {
                    console.warn('Kamera tidak aktif, memulai simulasi otomatis.');
                    this.startPredictionLoop();
                }
            }, 5000);

            console.log('✅ Jarimatika App initialized');
        } catch (error) {
            console.error('❌ Init error:', error);
            this.updateStatus('error', '❌ Gagal memuat aplikasi');
        }
    }

    // ---------- Perkalian Jarimatika (method) ----------
    calculateJarimatika() {
        const num1 = parseInt(document.getElementById('num1Select').value);
        const num2 = parseInt(document.getElementById('num2Select').value);

        if (num1 < 6 || num1 > 10 || num2 < 6 || num2 > 10) {
            document.getElementById('resultValue').textContent = '❌ Gunakan angka 6-10';
            return;
        }

        const idx1 = num1 - 6;
        const idx2 = num2 - 6;
        const fingerNames = ['Kelingking', 'Manis', 'Tengah', 'Telunjuk', 'Jempol'];
        const rightFinger = fingerNames[idx1];
        const leftFinger = fingerNames[idx2];

        const bawahKanan = idx1 + 1;
        const bawahKiri = idx2 + 1;
        const atasKanan = 5 - bawahKanan;
        const atasKiri = 5 - bawahKiri;
        const totalBawah = bawahKanan + bawahKiri;
        const totalAtas = atasKanan * atasKiri;
        const hasil = totalBawah * 10 + totalAtas;

        document.getElementById('resultValue').textContent = hasil;
        document.getElementById('rightFingerName').textContent = `${rightFinger} (${num1})`;
        document.getElementById('leftFingerName').textContent = `${leftFinger} (${num2})`;

        const steps = document.getElementById('calculationSteps');
        steps.innerHTML = `
            <span>📌 ${num1} × ${num2}</span>
            <span>👉 ${rightFinger} kanan + ${leftFinger} kiri</span>
            <span>🔽 Jari bawah: ${bawahKanan} + ${bawahKiri} = ${totalBawah} (puluhan)</span>
            <span>🔼 Jari atas: ${atasKanan} × ${atasKiri} = ${totalAtas} (satuan)</span>
            <span>✅ Hasil: ${totalBawah}${totalAtas} = ${hasil}</span>
        `;
    }

    // ---------- Setup Events (semua event di sini) ----------
    setupEvents() {
        // Tombol hitung Jarimatika
        document.getElementById('calcJarimatikaBtn').addEventListener('click', () => {
            this.calculateJarimatika();
        });

        // Kamera
        document.getElementById('startCameraBtn').addEventListener('click', () => {
            // Debug: tampilkan alert untuk memastikan event terpanggil (bisa dihapus nanti)
            alert('Tombol Mulai Kamera ditekan!');
            this.camera.start();
        });

        document.getElementById('stopCameraBtn').addEventListener('click', () => {
            this.camera.stop();
            this.isRunning = false;
            document.getElementById('cameraOverlay').classList.remove('hidden');
        });

        // Kalkulator
        document.querySelectorAll('.calc-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const value = btn.dataset.value;
                this.calculator.handleInput(value);
                this.updateCalculatorDisplay();
            });
        });

        // Chatbot
        document.getElementById('chatSendBtn').addEventListener('click', () => {
            this.handleChatInput();
        });
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleChatInput();
        });

        document.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const query = chip.dataset.query;
                document.getElementById('chatInput').value = query;
                this.handleChatInput();
            });
        });
    }

    // ---------- Tema ----------
    setupTheme() {
        const toggleBtn = document.getElementById('toggleTheme');
        const savedTheme = localStorage.getItem('jarimatika-theme');
        if (savedTheme === 'dark') {
            this.isDarkTheme = true;
            document.documentElement.setAttribute('data-theme', 'dark');
            toggleBtn.textContent = '☀️';
        }
        toggleBtn.addEventListener('click', () => {
            this.isDarkTheme = !this.isDarkTheme;
            document.documentElement.setAttribute('data-theme', this.isDarkTheme ? 'dark' : 'light');
            toggleBtn.textContent = this.isDarkTheme ? '☀️' : '🌙';
            localStorage.setItem('jarimatika-theme', this.isDarkTheme ? 'dark' : 'light');
        });
    }

    // ---------- Info Modal ----------
    setupInfoModal() {
        const modal = document.getElementById('infoModal');
        const toggleBtn = document.getElementById('toggleInfo');
        const closeBtn = document.getElementById('closeInfoBtn');
        const closeX = modal.querySelector('.modal-close');

        toggleBtn.addEventListener('click', () => modal.classList.add('show'));
        closeBtn.addEventListener('click', () => modal.classList.remove('show'));
        closeX.addEventListener('click', () => modal.classList.remove('show'));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('show');
        });
    }

    // ---------- UI Updates ----------
    updateStatus(type, message) {
        const badge = document.getElementById('statusBadge');
        badge.className = `status-badge ${type}`;
        badge.textContent = message;
    }

    updateCalculatorDisplay() {
        const display = document.getElementById('calcDisplay');
        display.textContent = this.calculator.getDisplay();
    }

    updateFingerDisplay(fingerCount, number) {
        document.getElementById('fingerCount').textContent = fingerCount;
        document.getElementById('fingerNumber').textContent = number;
        const dots = document.querySelectorAll('.finger-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index < fingerCount);
        });
    }

    // ---------- Chatbot ----------
    async handleChatInput() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        if (!message) return;
        this.addChatMessage('user', message);
        input.value = '';
        const response = this.chatbot.getResponse(message);
        this.addChatMessage('bot', response);
    }

    addChatMessage(type, text) {
        const container = document.getElementById('chatMessages');
        const div = document.createElement('div');
        div.className = `chat-message ${type}`;
        if (type === 'bot') {
            div.textContent = '⏳';
            container.appendChild(div);
            container.scrollTop = container.scrollHeight;
            let index = 0;
            const interval = setInterval(() => {
                if (index <= text.length) {
                    div.textContent = text.slice(0, index);
                    container.scrollTop = container.scrollHeight;
                    index++;
                } else {
                    clearInterval(interval);
                }
            }, 15);
        } else {
            div.textContent = text;
            container.appendChild(div);
            container.scrollTop = container.scrollHeight;
        }
    }

    // ---------- Kamera & Deteksi ----------
    async startPredictionLoop() {
        if (this.isRunning) return;
        this.isRunning = true;
        document.getElementById('cameraOverlay').classList.add('hidden');

        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const video = document.getElementById('video');

        const detect = async () => {
            if (!this.isRunning) return;

            try {
                // Jika kamera aktif, gambar dari video, jika tidak, tetap lanjutkan simulasi
                if (this.camera.isActive()) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                }

                const landmarks = await this.detector.detect(canvas);
                if (landmarks) {
                    this.detector.drawLandmarks(ctx, landmarks, canvas.width, canvas.height);
                    const fingerCount = this.detector.countFingers(landmarks);
                    const number = this.detector.getNumberFromFingers(fingerCount);
                    this.updateFingerDisplay(fingerCount, number);
                    this.calculator.setDetectedNumber(number);
                    this.updateCalculatorDisplay();
                }
            } catch (error) {
                console.error('Prediction error:', error);
            }
            requestAnimationFrame(detect);
        };

        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        detect();
    }
}

// Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
    const app = new JarimatikaApp();
    window.addEventListener('beforeunload', () => {
        if (app.camera) app.camera.destroy();
        if (app.detector) app.detector.dispose();
    });
});