import CameraManager from './camera.js';
import HandDetector from './hand-detector.js';
import JarimatikaCalculator from './calculator.js';
import JarimatikaChatbot from './chatbot.js';

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
            // Initialize components
            this.camera = new CameraManager();
            this.detector = new HandDetector();
            this.calculator = new JarimatikaCalculator();
            this.chatbot = new JarimatikaChatbot();

            // Initialize camera
            await this.camera.init();
            
            // Load hand detector model
            this.updateStatus('loading', '⏳ Memuat model...');
            await this.detector.loadModel();
            this.updateStatus('ready', '✅ Model siap');

            // Setup event listeners
            this.setupEvents();

            // Setup theme
            this.setupTheme();

            // Setup info modal
            this.setupInfoModal();

            // Start prediction loop when camera is ready
            this.camera.onReady(() => {
                this.startPredictionLoop();
            });

            console.log('✅ Jarimatika App initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize:', error);
            this.updateStatus('error', '❌ Gagal memuat aplikasi');
        }
    }

    setupEvents() {
        // Start camera button
        document.getElementById('startCameraBtn').addEventListener('click', () => {
            this.camera.start();
        });

        // Stop camera button
        document.getElementById('stopCameraBtn').addEventListener('click', () => {
            this.camera.stop();
            this.isRunning = false;
            document.getElementById('cameraOverlay').classList.remove('hidden');
        });

        // Calculator buttons
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

        // Suggestion chips
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

        // Update visual dots
        const dots = document.querySelectorAll('.finger-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index < fingerCount);
        });
    }

    async handleChatInput() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        if (!message) return;

        // Add user message
        this.addChatMessage('user', message);
        input.value = '';

        // Get bot response
        const response = this.chatbot.getResponse(message);
        
        // Add bot message with typing effect
        this.addChatMessage('bot', response);
    }

    addChatMessage(type, text) {
        const container = document.getElementById('chatMessages');
        const div = document.createElement('div');
        div.className = `chat-message ${type}`;
        
        // Simple typing effect for bot
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
            if (!this.isRunning || !this.camera.isActive()) {
                return;
            }

            try {
                // Draw video frame to canvas
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Detect hand landmarks
                const landmarks = await this.detector.detect(canvas);

                if (landmarks) {
                    // Draw landmarks
                    this.detector.drawLandmarks(ctx, landmarks);

                    // Count fingers
                    const fingerCount = this.detector.countFingers(landmarks);
                    const number = this.detector.getNumberFromFingers(fingerCount);

                    // Update display
                    this.updateFingerDisplay(fingerCount, number);

                    // Update calculator with detected number
                    this.calculator.setDetectedNumber(number);
                    this.updateCalculatorDisplay();
                }

            } catch (error) {
                console.error('Prediction error:', error);
            }

            // Continue loop
            requestAnimationFrame(detect);
        };

        // Set canvas dimensions
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        detect();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new JarimatikaApp();

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (app.camera) app.camera.destroy();
        if (app.detector) app.detector.dispose();
    });
});