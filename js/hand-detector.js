class HandDetector {
    constructor() {
        this.model = null;
        this.isLoaded = false;
        this.landmarks = null;
        
        // Finger tip indices
        this.THUMB_TIP = 4;
        this.INDEX_TIP = 8;
        this.MIDDLE_TIP = 12;
        this.RING_TIP = 16;
        this.PINKY_TIP = 20;
        
        // Finger base indices
        this.THUMB_BASE = 2;
        this.INDEX_BASE = 5;
        this.MIDDLE_BASE = 9;
        this.RING_BASE = 13;
        this.PINKY_BASE = 17;
        
        // Finger MCP indices
        this.THUMB_MCP = 1;
        this.INDEX_MCP = 5;
        this.MIDDLE_MCP = 9;
        this.RING_MCP = 13;
        this.PINKY_MCP = 17;
    }

    async loadModel() {
        try {
            // Simple approach using MediaPipe Hands via CDN
            // We'll use the global Hands object from CDN
            if (typeof Hands === 'undefined') {
                // If MediaPipe not loaded, use fallback
                console.warn('MediaPipe not available, using simple fallback');
                this.isLoaded = true;
                return;
            }

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

            this.isLoaded = true;
            console.log('✅ Hand detector model loaded');
        } catch (error) {
            console.error('❌ Failed to load hand detector:', error);
            // Use fallback detection
            this.isLoaded = true;
        }
    }

    async detect(imageElement) {
        if (!this.isLoaded) {
            return null;
        }

        try {
            // For demo purposes, simulate detection
            // In production, use MediaPipe Hands
            return this.simulateDetection(imageElement);
        } catch (error) {
            console.error('Detection error:', error);
            return null;
        }
    }

    simulateDetection(imageElement) {
        // Simulate hand detection for demo
        // In production, this would be replaced with actual MediaPipe detection
        return {
            landmarks: this.generateFakeLandmarks(),
            handedness: 'Right'
        };
    }

    generateFakeLandmarks() {
        // Generate fake landmarks for demonstration
        const landmarks = [];
        for (let i = 0; i < 21; i++) {
            landmarks.push({
                x: 0.5 + (Math.random() - 0.5) * 0.2,
                y: 0.5 + (Math.random() - 0.5) * 0.2,
                z: (Math.random() - 0.5) * 0.1
            });
        }
        return landmarks;
    }

    countFingers(landmarks) {
        if (!landmarks || !landmarks.landmarks) {
            return 0;
        }

        const points = landmarks.landmarks;
        let count = 0;

        // Check each finger tip relative to base
        const fingers = [
            { tip: this.THUMB_TIP, base: this.THUMB_BASE },
            { tip: this.INDEX_TIP, base: this.INDEX_BASE },
            { tip: this.MIDDLE_TIP, base: this.MIDDLE_BASE },
            { tip: this.RING_TIP, base: this.RING_BASE },
            { tip: this.PINKY_TIP, base: this.PINKY_BASE }
        ];

        for (const finger of fingers) {
            const tip = points[finger.tip];
            const base = points[finger.base];
            
            // Check if tip is higher than base (for fingers pointing up)
            if (tip && base && tip.y < base.y) {
                count++;
            }
        }

        return Math.min(count, 4);
    }

    getNumberFromFingers(fingerCount) {
        return Math.min(fingerCount, 4);
    }

    drawLandmarks(ctx, landmarks, width = 640, height = 480) {
        if (!landmarks || !landmarks.landmarks) return;

        const points = landmarks.landmarks;

        // Draw connections
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8], // Index
            [0, 9], [9, 10], [10, 11], [11, 12], // Middle
            [0, 13], [13, 14], [14, 15], [15, 16], // Ring
            [0, 17], [17, 18], [18, 19], [19, 20] // Pinky
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

        // Draw points
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
        if (this.hands) {
            this.hands.close();
            this.hands = null;
        }
        this.isLoaded = false;
    }
}

export default HandDetector;