// app.js
import { HandDetector } from './hand-detector.js';
import { calculatePMD, findClosedFinger, getFingerName } from './calculator.js';

// Elemen DOM
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const leftClosedSpan = document.getElementById('leftClosed');
const rightClosedSpan = document.getElementById('rightClosed');
const leftFingerName = document.getElementById('leftFingerName');
const rightFingerName = document.getElementById('rightFingerName');
const resultValue = document.getElementById('resultValue');
const calculationSteps = document.getElementById('calculationSteps');
const statusBadge = document.getElementById('statusBadge');

const startCameraBtn = document.getElementById('startCameraBtn');
const stopCameraBtn = document.getElementById('stopCameraBtn');
const cameraSelect = document.getElementById('cameraSelect');
const fpsSelect = document.getElementById('fpsSelect');
const cameraOverlay = document.getElementById('cameraOverlay');

// Inisialisasi detector
const detector = new HandDetector();

// Variabel untuk menyimpan hasil deteksi terakhir
let lastStatus = null;

// Fungsi untuk mengupdate UI berdasarkan status jari
function updateUI(status) {
  if (!status) {
    leftClosedSpan.textContent = '-';
    rightClosedSpan.textContent = '-';
    leftFingerName.textContent = '-';
    rightFingerName.textContent = '-';
    resultValue.textContent = '-';
    calculationSteps.innerHTML = 'Menunggu deteksi tangan...';
    statusBadge.textContent = '⏳ Menunggu';
    statusBadge.className = 'status-badge';
    return;
  }

  let leftIndex = null;
  let rightIndex = null;

  // Proses tangan kiri
  if (status.left) {
    leftIndex = findClosedFinger(status.left);
    if (leftIndex !== null) {
      const num = leftIndex + 6;
      leftFingerName.textContent = `${getFingerName(leftIndex)} (${num})`;
      leftClosedSpan.textContent = getFingerName(leftIndex);
    } else {
      leftFingerName.textContent = '❌ Tekuk satu jari';
      leftClosedSpan.textContent = '⚠️';
    }
  } else {
    leftFingerName.textContent = 'Tidak terdeteksi';
    leftClosedSpan.textContent = '-';
  }

  // Proses tangan kanan
  if (status.right) {
    rightIndex = findClosedFinger(status.right);
    if (rightIndex !== null) {
      const num = rightIndex + 6;
      rightFingerName.textContent = `${getFingerName(rightIndex)} (${num})`;
      rightClosedSpan.textContent = getFingerName(rightIndex);
    } else {
      rightFingerName.textContent = '❌ Tekuk satu jari';
      rightClosedSpan.textContent = '⚠️';
    }
  } else {
    rightFingerName.textContent = 'Tidak terdeteksi';
    rightClosedSpan.textContent = '-';
  }

  // Jika kedua tangan memiliki satu jari tertutup, hitung hasil
  if (leftIndex !== null && rightIndex !== null) {
    const { result, detail, error } = calculatePMD(leftIndex, rightIndex);
    if (error) {
      resultValue.textContent = `❌ ${error}`;
      calculationSteps.innerHTML = '';
    } else {
      resultValue.textContent = result;
      calculationSteps.innerHTML = `
        <div class="step">${detail.num1} × ${detail.num2} = ?</div>
        <div class="step">Bawah: ${detail.bawahKiri} + ${detail.bawahKanan} = ${detail.totalBawah}</div>
        <div class="step">Atas: ${detail.atasKiri} × ${detail.atasKanan} = ${detail.totalAtas}</div>
        <div class="step result">Hasil = ${detail.totalBawah} × 10 + ${detail.totalAtas} = <strong>${result}</strong></div>
      `;
      statusBadge.textContent = '✅ Berhasil';
      statusBadge.className = 'status-badge success';
    }
  } else {
    // Jika salah satu tangan tidak valid
    if (leftIndex === null && rightIndex === null) {
      resultValue.textContent = '⚠️ Tekuk satu jari di kedua tangan';
      calculationSteps.innerHTML = 'Pastikan masing-masing tangan menekuk tepat satu jari.';
      statusBadge.textContent = '⚠️ Formasi salah';
      statusBadge.className = 'status-badge warning';
    } else if (leftIndex === null) {
      resultValue.textContent = '⚠️ Perbaiki formasi tangan kiri';
      calculationSteps.innerHTML = 'Tangan kiri harus menekuk tepat satu jari.';
      statusBadge.textContent = '⚠️ Kiri salah';
      statusBadge.className = 'status-badge warning';
    } else {
      resultValue.textContent = '⚠️ Perbaiki formasi tangan kanan';
      calculationSteps.innerHTML = 'Tangan kanan harus menekuk tepat satu jari.';
      statusBadge.textContent = '⚠️ Kanan salah';
      statusBadge.className = 'status-badge warning';
    }
  }
}

// Fungsi untuk menggambar landmark di canvas
function drawLandmarks(results) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!results.multiHandLandmarks) return;

  for (const landmarks of results.multiHandLandmarks) {
    // Gambar titik
    for (const lm of landmarks) {
      const x = lm.x * canvas.width;
      const y = lm.y * canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#00ff88';
      ctx.fill();
      ctx.strokeStyle = '#00cc66';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    // Gambar garis sambungan
    const connections = [
      [0,1],[1,2],[2,3],[3,4],
      [0,5],[5,6],[6,7],[7,8],
      [5,9],[9,10],[10,11],[11,12],
      [9,13],[13,14],[14,15],[15,16],
      [13,17],[17,18],[18,19],[19,20],
      [0,17]
    ];
    for (const [i, j] of connections) {
      const p1 = landmarks[i];
      const p2 = landmarks[j];
      ctx.beginPath();
      ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
      ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
      ctx.strokeStyle = '#00cc66';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}

// Event listener untuk tombol mulai kamera
startCameraBtn.addEventListener('click', async () => {
  try {
    await detector.startCamera(video, parseInt(fpsSelect.value));
    cameraOverlay.style.display = 'none';
    statusBadge.textContent = '📷 Kamera aktif';
    statusBadge.className = 'status-badge';

    // Atur ukuran canvas
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Set callback hasil deteksi
    detector.onResults = (results) => {
      drawLandmarks(results);
      const status = detector.getAllFingerStatus();
      lastStatus = status;
      updateUI(status);
    };
  } catch (err) {
    console.error('Gagal memulai kamera:', err);
    alert('Gagal mengakses kamera. Pastikan izin kamera diberikan.');
  }
});

// Stop kamera
stopCameraBtn.addEventListener('click', () => {
  detector.stopCamera();
  cameraOverlay.style.display = 'flex';
  statusBadge.textContent = '⏹ Kamera berhenti';
  statusBadge.className = 'status-badge';
  updateUI(null);
});

// Pilihan kamera (dapat diisi dengan enumerateDevices)
navigator.mediaDevices.enumerateDevices().then(devices => {
  const videoDevices = devices.filter(d => d.kind === 'videoinput');
  cameraSelect.innerHTML = '<option value="">Pilih Kamera...</option>';
  videoDevices.forEach((device, index) => {
    const opt = document.createElement('option');
    opt.value = device.deviceId;
    opt.textContent = device.label || `Kamera ${index + 1}`;
    cameraSelect.appendChild(opt);
  });
});

// Saat memilih kamera, restart jika sedang berjalan
cameraSelect.addEventListener('change', () => {
  if (detector.isRunning) {
    detector.stopCamera();
    startCameraBtn.click();
  }
});

// Inisialisasi UI awal
updateUI(null);
