// calculator.js

/**
 * Menghitung hasil perkalian dua angka (6-10) menggunakan metode PMD dasar.
 * @param {number} leftIndex - Indeks jari yang ditekuk di tangan kiri (0-4)
 * @param {number} rightIndex - Indeks jari yang ditekuk di tangan kanan (0-4)
 * @returns {Object} { result, detail }
 */
export function calculatePMD(leftIndex, rightIndex) {
  if (leftIndex < 0 || leftIndex > 4 || rightIndex < 0 || rightIndex > 4) {
    return { result: null, error: 'Indeks jari tidak valid' };
  }

  const num1 = leftIndex + 6;
  const num2 = rightIndex + 6;

  const bawahKiri = leftIndex + 1;
  const bawahKanan = rightIndex + 1;
  const atasKiri = 5 - bawahKiri;
  const atasKanan = 5 - bawahKanan;

  const totalBawah = bawahKiri + bawahKanan;
  const totalAtas = atasKiri * atasKanan;

  const result = totalBawah * 10 + totalAtas;

  return {
    result,
    detail: {
      num1,
      num2,
      bawahKiri,
      bawahKanan,
      atasKiri,
      atasKanan,
      totalBawah,
      totalAtas
    }
  };
}

/**
 * Mencari indeks jari yang tertutup (false) dari array status.
 * Mengembalikan indeks (0-4) jika tepat satu jari tertutup, selain itu null.
 */
export function findClosedFinger(statusArray) {
  if (!statusArray || statusArray.length !== 5) return null;
  const closedIndices = statusArray
    .map((open, idx) => (open === false ? idx : -1))
    .filter(idx => idx !== -1);
  if (closedIndices.length === 1) {
    return closedIndices[0];
  }
  return null;
}

/**
 * Mendapatkan nama jari dari indeks (0-4)
 */
export function getFingerName(index) {
  const names = ['Kelingking', 'Manis', 'Tengah', 'Telunjuk', 'Jempol'];
  return names[index] || '-';
}
