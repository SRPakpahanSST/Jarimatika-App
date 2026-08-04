// hand-detector.js
export class HandDetector {
  constructor() {
    this.hands = null;
    this.camera = null;
    this.landmarks = null;
    this.handedness = null;
    this.isRunning = false;
    this.onResults = null;

    // Inisialisasi MediaPipe Hands
    this.hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    this.hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.6
    });

    this.hands.onResults((results) => {
      this.landmarks = results.multiHandLandmarks;
      this.handedness = results.multiHandedness;
      if (this.onResults) this.onResults(results);
    });
  }

  // Mulai kamera
  async startCamera(videoElement, fps = 30) {
    if (this.camera) return;
    this.camera = new Camera(videoElement, {
      onFrame: async () => {
        if (this.hands) {
          await this.hands.send({ image: videoElement });
        }
      },
      width: 640,
      height: 480,
      fps: fps
    });
    await this.camera.start();
    this.isRunning = true;
  }

  // Hentikan kamera
  stopCamera() {
    if (this.camera) {
      this.camera.stop();
      this.camera = null;
    }
    this.isRunning = false;
  }

  // Mendapatkan status (terbuka/tutup) kelima jari dari satu tangan
  // landmarks: array 21 landmark MediaPipe
  // return: [jempol, telunjuk, tengah, manis, kelingking] -> boolean (true=terbuka)
  getFingerStatus(landmarks) {
    if (!landmarks || landmarks.length < 21) return null;

    // Indeks landmark: 4=ujung jempol, 8=ujung telunjuk, 12=ujung tengah,
    // 16=ujung manis, 20=ujung kelingking
    const tipIds = [4, 8, 12, 16, 20];
    // Ruas kedua (PIP) untuk perbandingan: 2,6,10,14,18
    const pipIds = [2, 6, 10, 14, 18];

    const fingers = [];

    // Jempol: terbuka jika jarak horizontal antara tip dan MCP (indeks 2) cukup besar
    const thumbTip = landmarks[4];
    const thumbMcp = landmarks[2];
    const thumbOpen = Math.abs(thumbTip.x - thumbMcp.x) > 0.06;
    fingers.push(thumbOpen);

    // Jari lainnya: terbuka jika ujung jari (tip.y) lebih tinggi dari pip.y
    for (let i = 1; i < 5; i++) {
      const tip = landmarks[tipIds[i]];
      const pip = landmarks[pipIds[i]];
      const open = tip.y < pip.y - 0.02;
      fingers.push(open);
    }

    // Susunan: [jempol, telunjuk, tengah, manis, kelingking]
    return fingers;
  }

  // Mendapatkan status jari untuk kedua tangan
  // return: { left: [status], right: [status] } atau null
  getAllFingerStatus() {
    if (!this.landmarks || this.landmarks.length === 0) return null;

    const result = { left: null, right: null };
    for (let i = 0; i < this.landmarks.length; i++) {
      const hand = this.landmarks[i];
      const handedness = this.handedness[i]?.label || 'Unknown';
      const status = this.getFingerStatus(hand);
      if (handedness === 'Left') result.left = status;
      else if (handedness === 'Right') result.right = status;
    }
    return result;
  }
}