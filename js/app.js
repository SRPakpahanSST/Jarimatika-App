import CameraManager from './camera.js';
import HandDetector from './hand-detector.js';
import JarimatikaCalculator from './calculator.js';
import JarimatikaChatbot from './chatbot.js';

class JarimatikaApp {
    // ... kode lain

    // Method untuk perkalian Jarimatika (pindahkan ke dalam class)
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

    setupEvents() {
        // Event untuk tombol hitung Jarimatika
        document.getElementById('calcJarimatikaBtn').addEventListener('click', () => {
            this.calculateJarimatika();
        });

        // ... event lainnya (startCamera, stopCamera, calculator, chatbot)
    }

    // ... kode lain
}
        document.getElementById('startCameraBtn').addEventListener('click', () => {
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

    async startPredictionLoop() {
        if (this.isRunning) return;
        this.isRunning = true;
        document.getElementById('cameraOverlay').classList.add('hidden');

        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const video = document.getElementById('video');

        const detect = async () => {
            if (!this.isRunning || !this.camera.isActive()) return;

            try {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
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

document.addEventListener('DOMContentLoaded', () => {
    const app = new JarimatikaApp();
    window.addEventListener('beforeunload', () => {
        if (app.camera) app.camera.destroy();
        if (app.detector) app.detector.dispose();
    });
});