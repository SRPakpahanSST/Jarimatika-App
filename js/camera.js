class CameraManager {
    constructor() {
        this.stream = null;
        this.video = document.getElementById('video');
        this.cameraSelect = document.getElementById('cameraSelect');
        this.fpsSelect = document.getElementById('fpsSelect');
        this.startBtn = document.getElementById('startCameraBtn');
        this.stopBtn = document.getElementById('stopCameraBtn');
        this.overlay = document.getElementById('cameraOverlay');
        this.targetFPS = 30;
        this.isActive = false;
        this.onReadyCallback = null;
        this.devices = [];
    }

    async init() {
        await this.loadCameras();
        this.bindEvents();
    }

    async loadCameras() {
        try {
            // Request permission first to get device labels
            await navigator.mediaDevices.getUserMedia({ video: true });
            
            const devices = await navigator.mediaDevices.enumerateDevices();
            this.devices = devices.filter(device => device.kind === 'videoinput');

            // Populate select
            this.cameraSelect.innerHTML = '';
            this.devices.forEach((device, index) => {
                const option = document.createElement('option');
                option.value = device.deviceId;
                option.textContent = device.label || `Kamera ${index + 1}`;
                this.cameraSelect.appendChild(option);
            });

            if (this.devices.length === 0) {
                this.cameraSelect.innerHTML = '<option value="">Tidak ada kamera</option>';
                this.startBtn.disabled = true;
            }
        } catch (error) {
            console.error('Failed to load cameras:', error);
            this.cameraSelect.innerHTML = '<option value="">Akses kamera ditolak</option>';
            this.startBtn.disabled = true;
        }
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.start());
        this.stopBtn.addEventListener('click', () => this.stop());
        this.fpsSelect.addEventListener('change', () => {
            this.targetFPS = parseInt(this.fpsSelect.value);
        });
    }

    async start() {
    this.startBtn.textContent = '⏳ Mengakses...';
    // ... kode lainnya
        if (this.isActive) return;

        try {
            this.startBtn.disabled = true;
            this.startBtn.textContent = '⏳ Memulai...';

            const deviceId = this.cameraSelect.value;
            const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

            const constraints = {
                video: {
                    deviceId: deviceId ? { exact: deviceId } : undefined,
                    width: { ideal: isMobile ? 480 : 640 },
                    height: { ideal: isMobile ? 640 : 480 },
                    facingMode: isMobile ? 'environment' : 'user',
                    frameRate: { ideal: this.targetFPS }
                }
            };

            // Clean up previous stream
            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
            }

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;
            await this.video.play();

            this.isActive = true;
            this.overlay.classList.add('hidden');
            this.startBtn.textContent = '✅ Aktif';
            this.startBtn.disabled = false;

            // Trigger ready callback
            if (this.onReadyCallback) {
                this.onReadyCallback();
            }

        } catch (error) {
            console.error('Failed to start camera:', error);
            this.startBtn.textContent = '❌ Gagal';
            this.startBtn.disabled = false;
            alert(error.name === 'NotAllowedError' 
                ? 'Akses kamera ditolak. Silakan izinkan akses kamera.'
                : 'Gagal memulai kamera.');
        }
    }

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.video.srcObject = null;
        this.isActive = false;
        this.overlay.classList.remove('hidden');
        this.startBtn.textContent = '🎥 Mulai Kamera';
        this.startBtn.disabled = false;
    }

    isActive() {
        return this.isActive;
    }

    onReady(callback) {
        this.onReadyCallback = callback;
    }

    destroy() {
        this.stop();
        this.video = null;
        this.stream = null;
    }
}

export default CameraManager;