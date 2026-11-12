/**
 * Audio synthesis mathematics and frequency calculations
 */

export interface BinauralFrequencies {
  carrierHz: number;
  beatHz: number;
  leftHz: number;
  rightHz: number;
  stateName: string;
}

/**
 * Calculates left and right frequencies for binaural beats given a carrier and target beat frequency
 */
export function calculateBinauralFrequencies(carrierHz: number, beatHz: number): BinauralFrequencies {
  const safeCarrier = Math.max(50, Math.min(600, carrierHz));
  const safeBeat = Math.max(0.5, Math.min(50, beatHz));

  let stateName = 'Alpha (Relaxed Flow)';
  if (safeBeat < 4) {
    stateName = 'Delta (Deep Recovery)';
  } else if (safeBeat < 8) {
    stateName = 'Theta (Deep Intuition & Meditation)';
  } else if (safeBeat < 13) {
    stateName = 'Alpha (Relaxed Alertness & Flow)';
  } else if (safeBeat < 30) {
    stateName = 'Beta (Active Problem Solving)';
  } else {
    stateName = 'Gamma (Hyper-Concentration & Processing)';
  }

  return {
    carrierHz: safeCarrier,
    beatHz: safeBeat,
    leftHz: Number((safeCarrier - safeBeat / 2).toFixed(2)),
    rightHz: Number((safeCarrier + safeBeat / 2).toFixed(2)),
    stateName,
  };
}

/**
 * Converts a linear volume [0..1] to an exponential gain value for natural human ear perception
 */
export function linearToExponentialGain(linearVal: number): number {
  if (linearVal <= 0) return 0;
  if (linearVal >= 1) return 1;
  // Natural logarithmic perceptual curve
  return Math.pow(linearVal, 2);
}

/**
 * Computes root mean square (RMS) amplitude from audio byte frequency/time-domain data
 */
export function calculateRMS(dataArray: Uint8Array): number {
  if (dataArray.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < dataArray.length; i++) {
    // dataArray values are 0..255 with 128 as zero point
    const normalized = (dataArray[i] - 128) / 128;
    sum += normalized * normalized;
  }
  return Math.sqrt(sum / dataArray.length);
}

/**
 * Clamp a number to a bounded range
 */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}
