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
            // Minta izin kamera terlebih dahulu agar label perangkat terbaca
            await navigator.mediaDevices.getUserMedia({ video: true });
            
            const devices = await navigator.mediaDevices.enumerateDevices();
            this.devices = devices.filter(device => device.kind === 'videoinput');

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
            console.error('Gagal memuat kamera:', error);
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
        if (this.isActive) return;

        // Cek apakah browser mendukung getUserMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('Browser Anda tidak mendukung akses kamera.');
            return;
        }

        try {
            this.startBtn.disabled = true;
            this.startBtn.textContent = '⏳ Memulai...';

            // Constraints sederhana (kompatibel dengan sebagian besar perangkat)
            const constraints = {
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    frameRate: { ideal: this.targetFPS }
                }
            };

            // Hentikan stream sebelumnya jika ada
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

            // Panggil callback jika ada
            if (this.onReadyCallback) {
                this.onReadyCallback();
            }

        } catch (error) {
            console.error('Gagal memulai kamera:', error);
            this.startBtn.textContent = '❌ Gagal';
            this.startBtn.disabled = false;

            let pesan = 'Gagal memulai kamera.';
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                pesan = 'Akses kamera ditolak. Izinkan akses kamera di pengaturan browser.';
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                pesan = 'Tidak ada kamera yang terdeteksi.';
            } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                pesan = 'Kamera sedang digunakan oleh aplikasi lain.';
            }
            alert(pesan);
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