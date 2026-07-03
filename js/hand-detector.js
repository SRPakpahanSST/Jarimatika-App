import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

class HandDetector {
    constructor() {
        this.isLoaded = false;
        this.landmarks = null;
        this.hands = null;
        this.camera = null;
        this.onResults = null;
    }

    async loadModel() {
        try {
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`;
                }
            });

            this.hands.setOptions({
                maxNumHands: 2,
                modelComplexity: 1,
                minDetectionConfidence: 0.7,
                minTrackingConfidence: 0.6
            });

            this.hands.onResults((results) => {
                this.landmarks = results.multiHandLandmarks;
                if (this.onResults) this.onResults(results);
            });

            this.isLoaded = true;
            return true;
        } catch (error) {
            console.error('Gagal load MediaPipe:', error);
            this.isLoaded = false;
            return false;
        }
    }

    async detect(imageElement) {
        // Fungsi ini akan dipanggil oleh loop; kita akan menggunakan MediaPipe langsung
        // Karena MediaPipe memproses video secara real-time, kita tidak perlu panggil manual.
        // Kita akan gunakan metode startDetection(videoElement) sebagai gantinya.
        return null;
    }

    startDetection(videoElement, onResults) {
        if (!this.isLoaded || !this.hands) return;
        this.onResults = onResults;
        this.camera = new Camera(videoElement, {
            onFrame: async () => {
                await this.hands.send({ image: videoElement });
            },
            width: 640,
            height: 480
        });
        this.camera.start();
    }

    stopDetection() {
        if (this.camera) {
            this.camera.stop();
            this.camera = null;
        }
    }

    countFingers(landmarks) {
        if (!landmarks || landmarks.length === 0) return 0;
        // Ambil tangan pertama
        const points = landmarks[0];
        if (!points) return 0;

        // Indeks ujung dan pangkal
        const tips = [4, 8, 12, 16, 20];
        const bases = [2, 5, 9, 13, 17];
        let count = 0;
        for (let i = 0; i < tips.length; i++) {
            const tip = points[tips[i]];
            const base = points[bases[i]];
            if (tip && base && tip.y < base.y) count++;
        }
        return Math.min(count, 4);
    }

    getNumberFromFingers(fingerCount) {
        return fingerCount;
    }

    drawLandmarks(ctx, landmarks, width, height) {
        // Implementasi gambar landmark tetap sama seperti sebelumnya
        // (gunakan kode yang sudah ada)
    }

    isLoaded() {
        return this.isLoaded;
    }

    dispose() {
        this.stopDetection();
        if (this.hands) {
            this.hands.close();
            this.hands = null;
        }
        this.isLoaded = false;
    }
}

export default HandDetector;