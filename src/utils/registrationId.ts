/**
 * --- COLLISION RISK ANALYSIS FOR 10,000 TICKETS ---
 *
 * Calculated using the Birthday Paradox formula: p ≈ 1 - e^(-n² / 2M)
 * where n = 10,000 and M = 10^serialLength
 *
 * Length | Total Slots | Collision Probability | Risk Level
 * -------|-------------|-----------------------|-----------
 * 4      | 10,000      | ~100.00%              | FATAL (Certain)
 * 6      | 1,000,000   | ~99.99%               | FATAL (Near Certain)
 * 8      | 100,000,000 | ~39.35%               | UNACCEPTABLE (4 in 10)
 * 10     | 10,000,000,000| ~0.50%              | SAFE BASELINE (1 in 200)
 * 12     | 1,000,000,000,000| ~0.005%          | GOLD STANDARD (1 in 20,000)
 *
 * --- ALGORITHM LOGIC ---
 * 1. Normalize UUID to lowercase for cross-language consistency.
 * 2. Hash using SHA-256 (Standard in JS, Python, Dart).
 * 3. Take first 15 hex chars (60 bits) to convert to decimal.
 * 4. Apply modulo to achieve requested length and pad with zeros.
 */

// REGISTRATION ID CONFIGURATION
const SERIAL_LENGTH = 10;
const YEAR_TWO_DIGITS = 26;

// --- SHA-256 INTERNAL CONSTANTS ---
const H_INIT: number[] = [];
const K_INIT: number[] = [];

(function initSha256Constants() {
  const isPrime = (n: number) => {
    for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
    return true;
  };
  let primeCounter = 0;
  for (let i = 2; primeCounter < 64; i++) {
    if (isPrime(i)) {
      if (primeCounter < 8) H_INIT[primeCounter] = (Math.pow(i, 0.5) * Math.pow(2, 32)) | 0;
      K_INIT[primeCounter] = (Math.pow(i, 1 / 3) * Math.pow(2, 32)) | 0;
      primeCounter++;
    }
  }
})();

/**
 * Self-contained Synchronous SHA-256 for Browser and Node.js
 */
function sha256Sync(ascii: string): string {
  const rightRotate = (value: number, amount: number) => {
    return (value >>> amount) | (value << (32 - amount));
  };

  const h = H_INIT.slice(0);
  const k = K_INIT;
  const words: number[] = [];
  const asciiLength = ascii.length * 8;
  const maxWord = Math.pow(2, 32);

  let tempAscii = ascii + '\x80';
  while (tempAscii.length % 64 - 56) tempAscii += '\x00';

  for (let i = 0; i < tempAscii.length; i++) {
    const j = tempAscii.charCodeAt(i);
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }

  words[words.length] = (asciiLength / maxWord) | 0;
  words[words.length] = asciiLength | 0;

  for (let j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = h.slice(0);

    for (let i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const a = h[0], e = h[4];

      const temp1 = h[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & h[5]) ^ (~e & h[6])) +
        k[i] +
        (w[i] = i < 16 ? w[i] : (w[i - 16] +
          (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
          w[i - 7] +
          (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) | 0);

      const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & h[1]) ^ (a & h[2]) ^ (h[1] & h[2]));

      h.unshift((temp1 + temp2) | 0);
      h[4] = (h[4] + temp1) | 0;
      h.pop();
    }

    for (let i = 0; i < 8; i++) h[i] = (h[i] + oldHash[i]) | 0;
  }

  let result = '';
  for (let i = 0; i < 8; i++) {
    for (let j = 3; j + 1; j--) {
      const b = (h[i] >> (j * 8)) & 255;
      result += b.toString(16).padStart(2, '0');
    }
  }
  return result;
}

/**
 * Deterministic Registration ID Generator
 * Input: ticket UUID
 * Output: 12-digit string, e.g. "268461539361"
 */
export const toRegistrationId = (uuid: string): string => {
  const normalizedUuid = uuid.toLowerCase();
  const hashHex = sha256Sync(normalizedUuid);
  const decimal = BigInt(`0x${hashHex.substring(0, 15)}`);
  const divisor = BigInt(10) ** BigInt(SERIAL_LENGTH);
  const serial = (decimal % divisor).toString().padStart(SERIAL_LENGTH, '0');
  const yearPrefix = YEAR_TWO_DIGITS.toString().padStart(2, '0');
  return `${yearPrefix}${serial}`;
};

/**
 * Format registration ID for display: "268461539361" → "268-46153-9361"
 */
export const formatRegistrationId = (id: string): string =>
  `${id.slice(0, 3)}-${id.slice(3, 8)}-${id.slice(8)}`;
