import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateBinauralFrequencies, linearToExponentialGain, calculateRMS, clamp } from './audioMath.ts';

test('calculateBinauralFrequencies computes correct split frequencies', () => {
  const result = calculateBinauralFrequencies(200, 10);
  assert.equal(result.carrierHz, 200);
  assert.equal(result.beatHz, 10);
  assert.equal(result.leftHz, 195);
  assert.equal(result.rightHz, 205);
  assert.match(result.stateName, /Alpha/);
});

test('calculateBinauralFrequencies classifies Delta, Theta, and Gamma', () => {
  assert.match(calculateBinauralFrequencies(150, 2).stateName, /Delta/);
  assert.match(calculateBinauralFrequencies(150, 6).stateName, /Theta/);
  assert.match(calculateBinauralFrequencies(150, 40).stateName, /Gamma/);
});

test('linearToExponentialGain maps boundary and midpoint correctly', () => {
  assert.equal(linearToExponentialGain(0), 0);
  assert.equal(linearToExponentialGain(1), 1);
  assert.equal(linearToExponentialGain(0.5), 0.25);
  assert.equal(linearToExponentialGain(-0.2), 0);
  assert.equal(linearToExponentialGain(1.5), 1);
});

test('calculateRMS calculates accurate energy for silence and signal', () => {
  const silence = new Uint8Array([128, 128, 128, 128]);
  assert.equal(calculateRMS(silence), 0);

  const fullWave = new Uint8Array([0, 255, 0, 255]);
  const rms = calculateRMS(fullWave);
  assert.ok(rms > 0.9 && rms <= 1.0);
});

test('clamp restricts values to min and max bounds', () => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-3, 0, 10), 0);
  assert.equal(clamp(15, 0, 10), 10);
});
