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

    async init() {
        try {
            this.camera = new CameraManager();
            this.detector = new HandDetector();
            this.calculator = new JarimatikaCalculator();
            this.chatbot = new JarimatikaChatbot();

            await this.camera.init();
            await this.detector.loadModel();
            this.updateStatus('ready', '✅ Model siap');

            this.setupEvents();
            this.setupTheme();
            this.setupInfoModal();

            this.camera.onReady(() => {
                this.startPredictionLoop();
            });

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

    // ---------- Perkalian Jarimatika ----------
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

    // ---------- Setup Events ----------
    setupEvents() {
        document.getElementById('calcJarimatikaBtn').addEventListener('click', () => {
            this.calculateJarimatika();
        });

        document.getElementById('startCameraBtn').addEventListener('click', () => {
            alert('Tombol Mulai Kamera ditekan!'); // debug, bisa dihapus
            this.camera.start();
        });

        document.getElementById('stopCameraBtn').addEventListener('click', () => {
            this.camera.stop();
            this.isRunning = false;
            document.getElementById('cameraOverlay').classList.remove('hidden');
        });

        document.querySelectorAll('.calc-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const value = btn.dataset.value;
                this.calculator.handleInput(value);
                this.updateCalculatorDisplay();
            });
        });

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