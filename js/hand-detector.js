import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

class HandDetector {
    constructor() {
        this.isLoaded = false;
    }

    async loadModel() {
        await new Promise(resolve => setTimeout(resolve, 300));
        this.isLoaded = true;
        console.log('✅ Hand detector model loaded (simulasi)');
        return true;
    }

    async detect(imageElement) {
        if (!this.isLoaded) return null;
        // Simulasi acak 0-4 jari
        const count = Math.floor(Math.random() * 5);
        return this.generateFakeLandmarks(count);
    }

    generateFakeLandmarks(fingerCount) {
        const landmarks = [];
        for (let i = 0; i < 21; i++) {
            let y = 0.3 + Math.random() * 0.4;
            if ([4, 8, 12, 16, 20].includes(i)) {
                const fingerIndex = [4, 8, 12, 16, 20].indexOf(i);
                if (fingerIndex < fingerCount) {
                    y = 0.1 + Math.random() * 0.2;
                } else {
                    y = 0.4 + Math.random() * 0.2;
                }
            }
            landmarks.push({ x: 0.3 + Math.random() * 0.4, y, z: (Math.random() - 0.5) * 0.1 });
        }
        return { landmarks };
    }

    countFingers(landmarks) {
        if (!landmarks || !landmarks.landmarks) return 0;
        const points = landmarks.landmarks;
        let count = 0;
        const tips = [8, 12, 16, 20];
        const bases = [5, 9, 13, 17];
        for (let i = 0; i < tips.length; i++) {
            if (points[tips[i]] && points[bases[i]] && points[tips[i]].y < points[bases[i]].y) {
                count++;
            }
        }
        return Math.min(count, 4);
    }

    getNumberFromFingers(fingerCount) {
        return fingerCount;
    }

    drawLandmarks(ctx, landmarks, width, height) {
        if (!landmarks || !landmarks.landmarks) return;
        const points = landmarks.landmarks;
        const connections = [
            [0,1],[1,2],[2,3],[3,4],
            [0,5],[5,6],[6,7],[7,8],
            [0,9],[9,10],[10,11],[11,12],
            [0,13],[13,14],[14,15],[15,16],
            [0,17],[17,18],[18,19],[19,20]
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
        ctx.fillStyle = '#FF6584';
        for (const point of points) {
            ctx.beginPath();
            ctx.arc(point.x * width, point.y * height, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    isLoaded() { return this.isLoaded; }
    dispose() { this.isLoaded = false; }
}

export default HandDetector;