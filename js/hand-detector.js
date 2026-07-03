class HandDetector {
    constructor() {
        this.isLoaded = false;
        this.landmarks = null;
        
        // Indeks ujung jari (untuk simulasi)
        this.THUMB_TIP = 4;
        this.INDEX_TIP = 8;
        this.MIDDLE_TIP = 12;
        this.RING_TIP = 16;
        this.PINKY_TIP = 20;
        
        this.THUMB_BASE = 2;
        this.INDEX_BASE = 5;
        this.MIDDLE_BASE = 9;
        this.RING_BASE = 13;
        this.PINKY_BASE = 17;
    }

    // Memuat model (simulasi, langsung sukses)
    async loadModel() {
        try {
            // Simulasi loading
            await new Promise(resolve => setTimeout(resolve, 500));
            this.isLoaded = true;
            console.log('✅ Hand detector model loaded (simulasi)');
            return true;
        } catch (error) {
            console.error('❌ Gagal load model:', error);
            this.isLoaded = false;
            return false;
        }
    }

    // Deteksi (simulasi berdasarkan canvas)
    async detect(imageElement) {
        if (!this.isLoaded) {
            return null;
        }

        // Simulasi: kita akan mengembalikan landmark palsu dengan jumlah jari acak
        // Tapi agar lebih realistis, kita bisa mendeteksi berdasarkan warna? Tidak.
        // Untuk demo, kita beri angka acak antara 0-4.
        // Namun agar interaktif, kita bisa membuat simulasi berdasarkan posisi mouse? Tidak.
        // Kita tetap gunakan acak dengan seed berdasarkan waktu agar terlihat bergerak.
        const randomCount = Math.floor(Math.random() * 5);
        return this.generateFakeLandmarks(randomCount);
    }

    // Generate landmark palsu dengan jumlah jari tertentu
    generateFakeLandmarks(fingerCount) {
        const landmarks = [];
        // Buat 21 titik acak, tapi kita atur posisi y untuk jari yang terbuka lebih rendah (ke atas)
        for (let i = 0; i < 21; i++) {
            let x = 0.3 + Math.random() * 0.4;
            let y = 0.3 + Math.random() * 0.4;
            // Untuk jari yang terbuka, turunkan nilai y (lebih tinggi di gambar)
            if (i === 4 || i === 8 || i === 12 || i === 16 || i === 20) {
                // Ini adalah ujung jari
                const fingerIndex = [4,8,12,16,20].indexOf(i);
                if (fingerIndex < fingerCount) {
                    y = 0.1 + Math.random() * 0.2; // lebih tinggi
                } else {
                    y = 0.4 + Math.random() * 0.2; // lebih rendah
                }
            }
            landmarks.push({ x, y, z: (Math.random() - 0.5) * 0.1 });
        }
        return {
            landmarks: landmarks,
            handedness: 'Right'
        };
    }

    // Menghitung jari terbuka dari landmark (simulasi, berdasarkan jumlah yang kita set)
    countFingers(landmarks) {
        if (!landmarks || !landmarks.landmarks) return 0;
        const points = landmarks.landmarks;
        let count = 0;
        // Periksa 4 jari (telunjuk, tengah, manis, kelingking) - abaikan ibu jari untuk sederhana
        const tips = [8, 12, 16, 20];
        const bases = [5, 9, 13, 17];
        for (let i = 0; i < tips.length; i++) {
            const tip = points[tips[i]];
            const base = points[bases[i]];
            if (tip && base && tip.y < base.y) {
                count++;
            }
        }
        return Math.min(count, 4);
    }

    // Konversi jumlah jari ke angka (langsung return count)
    getNumberFromFingers(fingerCount) {
        return fingerCount;
    }

    // Gambar landmark di canvas
    drawLandmarks(ctx, landmarks, width = 640, height = 480) {
        if (!landmarks || !landmarks.landmarks) return;
        const points = landmarks.landmarks;

        // Koneksi antar titik (untuk menggambar garis)
        const connections = [
            [0,1], [1,2], [2,3], [3,4],
            [0,5], [5,6], [6,7], [7,8],
            [0,9], [9,10], [10,11], [11,12],
            [0,13], [13,14], [14,15], [15,16],
            [0,17], [17,18], [18,19], [19,20]
        ];

        ctx.strokeStyle = '#6C63FF';
        ctx.lineWidth = 2;
        for (const [start, end] of connections) {
            const p1 = points[start];
            const p2 = points[end];
            if (p1 && p2) {
                ctx.beginPath();
                ctx.moveTo(p1.x * width, p1.y * height);
                ctx.lineTo(p2.x * width, p2.y * height);
                ctx.stroke();
            }
        }

        // Titik-titik
        ctx.fillStyle = '#FF6584';
        for (const point of points) {
            ctx.beginPath();
            ctx.arc(point.x * width, point.y * height, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    isLoaded() {
        return this.isLoaded;
    }

    dispose() {
        this.isLoaded = false;
    }
}

export default HandDetector;