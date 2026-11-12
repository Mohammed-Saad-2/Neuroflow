/**
 * Web Audio API Synthesis Engine for VibeForge Flow
 * Generates client-side synthetic noise, ambient elements, binaural beats, and drone tones.
 */

import { linearToExponentialGain, calculateBinauralFrequencies } from '../utils/audioMath.ts';

export type SoundChannelId =
  | 'brown_noise'
  | 'pink_noise'
  | 'rain'
  | 'wind'
  | 'deep_drone'
  | 'binaural'
  | 'chimes';

export interface SoundChannelConfig {
  id: SoundChannelId;
  name: string;
  category: 'noise' | 'nature' | 'harmonic' | 'binaural';
  description: string;
  defaultVolume: number;
  iconName: string;
}

export const SOUND_CHANNELS: SoundChannelConfig[] = [
  {
    id: 'brown_noise',
    name: 'Brownian Noise',
    category: 'noise',
    description: 'Deep, warm low-frequency rumble. Ideal for masking background voices and ADHD flow.',
    defaultVolume: 0.6,
    iconName: 'Activity',
  },
  {
    id: 'pink_noise',
    name: 'Pink Noise',
    category: 'noise',
    description: 'Balanced 1/f spectral density. Proven to soothe cognitive fatigue.',
    defaultVolume: 0.0,
    iconName: 'Waves',
  },
  {
    id: 'rain',
    name: 'Gentle Rain',
    category: 'nature',
    description: 'Bandpass filtered moisture drops with randomized transient raindrops.',
    defaultVolume: 0.5,
    iconName: 'CloudRain',
  },
  {
    id: 'wind',
    name: 'Forest Wind',
    category: 'nature',
    description: 'Slow resonant sweeps evoking mountain pine breeze.',
    defaultVolume: 0.35,
    iconName: 'Wind',
  },
  {
    id: 'deep_drone',
    name: 'Harmonic Drone',
    category: 'harmonic',
    description: 'Tuned 108Hz harmonic foundation with soft sub-bass warmth.',
    defaultVolume: 0.4,
    iconName: 'Radio',
  },
  {
    id: 'binaural',
    name: 'Binaural Flow Beat',
    category: 'binaural',
    description: 'Stereo frequency offset (best with headphones) stimulating brainwave synchronization.',
    defaultVolume: 0.45,
    iconName: 'Headphones',
  },
  {
    id: 'chimes',
    name: 'Temple Chimes',
    category: 'harmonic',
    description: 'Subtle periodic harmonic bells for mindfulness presence.',
    defaultVolume: 0.25,
    iconName: 'Bell',
  },
];

export interface SoundscapePreset {
  id: string;
  name: string;
  description: string;
  channelVolumes: Record<SoundChannelId, number>;
  binauralBeatHz: number;
}

export const SOUNDSCAPE_PRESETS: SoundscapePreset[] = [
  {
    id: 'midnight_sprint',
    name: 'Midnight Sprint',
    description: 'Heavy Brownian acoustic masking with rain and 10Hz Alpha binaural rhythm.',
    channelVolumes: {
      brown_noise: 0.7,
      pink_noise: 0.0,
      rain: 0.55,
      wind: 0.2,
      deep_drone: 0.35,
      binaural: 0.5,
      chimes: 0.1,
    },
    binauralBeatHz: 10, // Alpha
  },
  {
    id: 'zen_sanctuary',
    name: 'Zen Sanctuary',
    description: 'Forest wind, gentle raindrops, warm drone and meditative Theta frequency.',
    channelVolumes: {
      brown_noise: 0.2,
      pink_noise: 0.0,
      rain: 0.4,
      wind: 0.6,
      deep_drone: 0.45,
      binaural: 0.4,
      chimes: 0.4,
    },
    binauralBeatHz: 6, // Theta
  },
  {
    id: 'hyper_focus',
    name: 'Hyper-Focus Gamma',
    description: 'Structured 40Hz Gamma wave with pink & brown noise for high-tempo problem solving.',
    channelVolumes: {
      brown_noise: 0.5,
      pink_noise: 0.4,
      rain: 0.2,
      wind: 0.0,
      deep_drone: 0.5,
      binaural: 0.6,
      chimes: 0.0,
    },
    binauralBeatHz: 40, // Gamma
  },
  {
    id: 'deep_restoration',
    name: 'Deep Restoration',
    description: 'Gentle low drone with 2.5Hz Delta frequency and soft nocturnal breeze.',
    channelVolumes: {
      brown_noise: 0.4,
      pink_noise: 0.0,
      rain: 0.3,
      wind: 0.4,
      deep_drone: 0.6,
      binaural: 0.45,
      chimes: 0.2,
    },
    binauralBeatHz: 2.5, // Delta
  },
  {
    id: 'pure_brown',
    name: 'Pure Acoustic Cloak',
    description: 'Maximum distraction isolation with pure deep Brownian resonance.',
    channelVolumes: {
      brown_noise: 0.85,
      pink_noise: 0.0,
      rain: 0.0,
      wind: 0.0,
      deep_drone: 0.0,
      binaural: 0.0,
      chimes: 0.0,
    },
    binauralBeatHz: 10,
  },
];

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isRunning = false;

  // Channel gain nodes
  private channelGains: Map<SoundChannelId, GainNode> = new Map();
  private channelVolumes: Record<SoundChannelId, number> = {
    brown_noise: 0.6,
    pink_noise: 0.0,
    rain: 0.5,
    wind: 0.35,
    deep_drone: 0.4,
    binaural: 0.45,
    chimes: 0.25,
  };
  private channelMutes: Record<SoundChannelId, boolean> = {
    brown_noise: false,
    pink_noise: false,
    rain: false,
    wind: false,
    deep_drone: false,
    binaural: false,
    chimes: false,
  };

  private masterVolume = 0.75;
  private binauralCarrierHz = 216;
  private binauralBeatHz = 10;

  // Active audio nodes references to stop or modulate
  private binauralLeftOsc: OscillatorNode | null = null;
  private binauralRightOsc: OscillatorNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private windIntervalId: number | null = null;
  private chimesIntervalId: number | null = null;

  public getContext(): AudioContext | null {
    return this.ctx;
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }

  public getChannelVolumes(): Record<SoundChannelId, number> {
    return { ...this.channelVolumes };
  }

  public getChannelMutes(): Record<SoundChannelId, boolean> {
    return { ...this.channelMutes };
  }

  public getBinauralBeatHz(): number {
    return this.binauralBeatHz;
  }

  /**
   * Initializes the audio graph and starts synthesis
   */
  public async start(): Promise<void> {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    if (!this.masterGain) {
      this.setupAudioGraph();
    }

    // Ramp up master gain smoothly
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(0, now);
      this.masterGain.gain.linearRampToValueAtTime(linearToExponentialGain(this.masterVolume), now + 0.3);
    }

    this.isRunning = true;
  }

  /**
   * Smoothly stops or pauses synthesis
   */
  public stop(): void {
    if (!this.ctx || !this.masterGain) {
      this.isRunning = false;
      return;
    }

    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.2);

    setTimeout(() => {
      this.isRunning = false;
    }, 220);
  }

  /**
   * Build the complete client-side Web Audio routing graph
   */
  private setupAudioGraph(): void {
    if (!this.ctx) return;

    // Master Compressor prevents digital clipping
    const compressor = this.ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
    compressor.knee.setValueAtTime(12, this.ctx.currentTime);
    compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
    compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
    compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

    // Master Analyser for visualizer canvas
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 128;
    this.analyser.smoothingTimeConstant = 0.85;

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(linearToExponentialGain(this.masterVolume), this.ctx.currentTime);

    this.masterGain.connect(compressor);
    compressor.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // Setup channel gain nodes
    for (const channel of SOUND_CHANNELS) {
      const channelGain = this.ctx.createGain();
      const vol = this.channelMutes[channel.id] ? 0 : linearToExponentialGain(this.channelVolumes[channel.id]);
      channelGain.gain.setValueAtTime(vol, this.ctx.currentTime);
      channelGain.connect(this.masterGain);
      this.channelGains.set(channel.id, channelGain);
    }

    // Initialize individual synthesizers
    this.initBrownNoise();
    this.initPinkNoise();
    this.initRain();
    this.initWind();
    this.initDeepDrone();
    this.initBinauralBeats();
    this.initChimes();
  }

  /**
   * Brown noise: integrated random walk buffer with lowpass resonance
   */
  private initBrownNoise(): void {
    if (!this.ctx) return;
    const channelGain = this.channelGains.get('brown_noise');
    if (!channelGain) return;

    const bufferSize = 5 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Gain compensation
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Filter to warm up tone
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, this.ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(channelGain);
    noiseSource.start();
  }

  /**
   * Pink noise: Paul Kellet's filter algorithm (1/f)
   */
  private initPinkNoise(): void {
    if (!this.ctx) return;
    const channelGain = this.channelGains.get('pink_noise');
    if (!channelGain) return;

    const bufferSize = 5 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(channelGain);
    noiseSource.start();
  }

  /**
   * Rain: bandpassed noise bed with randomized droplet transients
   */
  private initRain(): void {
    if (!this.ctx) return;
    const channelGain = this.channelGains.get('rain');
    if (!channelGain) return;

    // Steady rain shower bed
    const bufferSize = 4 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.2;
    }

    const rainBed = this.ctx.createBufferSource();
    rainBed.buffer = buffer;
    rainBed.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1200, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(0.8, this.ctx.currentTime);

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(450, this.ctx.currentTime);

    rainBed.connect(bandpass);
    bandpass.connect(highpass);
    highpass.connect(channelGain);
    rainBed.start();
  }

  /**
   * Wind: sweeping resonant bandpass filter over noise
   */
  private initWind(): void {
    if (!this.ctx) return;
    const channelGain = this.channelGains.get('wind');
    if (!channelGain) return;

    const bufferSize = 4 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.25;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(260, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.5, this.ctx.currentTime);
    this.windFilter = filter;

    noiseSource.connect(filter);
    filter.connect(channelGain);
    noiseSource.start();

    // Modulate wind frequency gently over time
    this.windIntervalId = window.setInterval(() => {
      if (!this.ctx || !this.windFilter || !this.isRunning) return;
      const targetFreq = 180 + Math.random() * 320;
      const now = this.ctx.currentTime;
      this.windFilter.frequency.cancelScheduledValues(now);
      this.windFilter.frequency.linearRampToValueAtTime(targetFreq, now + 3.0);
    }, 3200);
  }

  /**
   * Deep Harmonic Drone: Rich layered fundamental chords (108Hz, 162Hz, 216Hz)
   */
  private initDeepDrone(): void {
    if (!this.ctx) return;
    const channelGain = this.channelGains.get('deep_drone');
    if (!channelGain) return;

    const freqs = [108, 162, 216];
    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const oscGain = this.ctx.createGain();
      oscGain.gain.setValueAtTime(0.25 / (idx + 1), this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(channelGain);
      osc.start();
    });
  }

  /**
   * Binaural Beats: Stereo separation with left/right frequency offset
   */
  private initBinauralBeats(): void {
    if (!this.ctx) return;
    const channelGain = this.channelGains.get('binaural');
    if (!channelGain) return;

    const { leftHz, rightHz } = calculateBinauralFrequencies(this.binauralCarrierHz, this.binauralBeatHz);

    // Left channel
    const leftOsc = this.ctx.createOscillator();
    leftOsc.type = 'sine';
    leftOsc.frequency.setValueAtTime(leftHz, this.ctx.currentTime);
    this.binauralLeftOsc = leftOsc;

    const leftPanner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (leftPanner) leftPanner.pan.setValueAtTime(-1, this.ctx.currentTime);

    // Right channel
    const rightOsc = this.ctx.createOscillator();
    rightOsc.type = 'sine';
    rightOsc.frequency.setValueAtTime(rightHz, this.ctx.currentTime);
    this.binauralRightOsc = rightOsc;

    const rightPanner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (rightPanner) rightPanner.pan.setValueAtTime(1, this.ctx.currentTime);

    if (leftPanner && rightPanner) {
      leftOsc.connect(leftPanner);
      leftPanner.connect(channelGain);

      rightOsc.connect(rightPanner);
      rightPanner.connect(channelGain);
    } else {
      leftOsc.connect(channelGain);
      rightOsc.connect(channelGain);
    }

    leftOsc.start();
    rightOsc.start();
  }

  /**
   * Chimes: Peaceful intermittent bell harmonics
   */
  private initChimes(): void {
    if (!this.ctx) return;
    const channelGain = this.channelGains.get('chimes');
    if (!channelGain) return;

    // Trigger intermittent bell every 12 to 24 seconds
    this.chimesIntervalId = window.setInterval(() => {
      if (!this.isRunning || !this.ctx || this.channelMutes.chimes) return;
      if (Math.random() > 0.45) {
        this.strikeChime();
      }
    }, 12000);
  }

  /**
   * Interactive single chime / singing bowl strike
   */
  public strikeChime(baseFrequency = 528): void {
    if (!this.ctx) return;
    const channelGain = this.channelGains.get('chimes');
    if (!channelGain) return;

    const now = this.ctx.currentTime;
    // Harmonic series of a singing bell: fundamental + 2.76x + 5.4x harmonics
    const harmonics = [1, 2.76, 5.4];
    harmonics.forEach((ratio, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFrequency * ratio, now);

      const gain = this.ctx.createGain();
      const peak = (0.2 / (i + 1)) * (this.channelVolumes.chimes || 0.3);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(peak, now + 0.05);
      // Exponential long decay
      gain.gain.exponentialRampToValueAtTime(0.0001, now + (4.0 + i * 1.5));

      osc.connect(gain);
      gain.connect(channelGain);

      osc.start(now);
      osc.stop(now + 6.0);
    });
  }

  /**
   * Update master volume with click-free smoothing
   */
  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.ctx && this.masterGain && this.isRunning) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(linearToExponentialGain(this.masterVolume), now + 0.05);
    }
  }

  /**
   * Update channel volume
   */
  public setChannelVolume(channelId: SoundChannelId, volume: number): void {
    const safeVol = Math.max(0, Math.min(1, volume));
    this.channelVolumes[channelId] = safeVol;

    const gainNode = this.channelGains.get(channelId);
    if (this.ctx && gainNode) {
      const now = this.ctx.currentTime;
      gainNode.gain.cancelScheduledValues(now);
      const effectiveVol = this.channelMutes[channelId] ? 0 : linearToExponentialGain(safeVol);
      gainNode.gain.linearRampToValueAtTime(effectiveVol, now + 0.05);
    }
  }

  /**
   * Toggle mute for a specific sound channel
   */
  public toggleChannelMute(channelId: SoundChannelId): boolean {
    const isMuted = !this.channelMutes[channelId];
    this.channelMutes[channelId] = isMuted;

    const gainNode = this.channelGains.get(channelId);
    if (this.ctx && gainNode) {
      const now = this.ctx.currentTime;
      gainNode.gain.cancelScheduledValues(now);
      const effectiveVol = isMuted ? 0 : linearToExponentialGain(this.channelVolumes[channelId]);
      gainNode.gain.linearRampToValueAtTime(effectiveVol, now + 0.05);
    }

    return isMuted;
  }

  /**
   * Update Binaural beat frequency
   */
  public setBinauralBeatHz(beatHz: number): void {
    this.binauralBeatHz = Math.max(0.5, Math.min(45, beatHz));
    if (this.ctx && this.binauralLeftOsc && this.binauralRightOsc) {
      const { leftHz, rightHz } = calculateBinauralFrequencies(this.binauralCarrierHz, this.binauralBeatHz);
      const now = this.ctx.currentTime;
      this.binauralLeftOsc.frequency.cancelScheduledValues(now);
      this.binauralLeftOsc.frequency.linearRampToValueAtTime(leftHz, now + 0.1);
      this.binauralRightOsc.frequency.cancelScheduledValues(now);
      this.binauralRightOsc.frequency.linearRampToValueAtTime(rightHz, now + 0.1);
    }
  }

  /**
   * Apply an entire preset cleanly
   */
  public applyPreset(preset: SoundscapePreset): void {
    for (const [chId, vol] of Object.entries(preset.channelVolumes)) {
      this.setChannelVolume(chId as SoundChannelId, vol);
      if (this.channelMutes[chId as SoundChannelId]) {
        this.channelMutes[chId as SoundChannelId] = false;
      }
    }
    this.setBinauralBeatHz(preset.binauralBeatHz);
  }

  /**
   * Clean up Web Audio resources on unmount
   */
  public destroy(): void {
    if (this.windIntervalId) clearInterval(this.windIntervalId);
    if (this.chimesIntervalId) clearInterval(this.chimesIntervalId);
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close();
    }
  }
}

// Global singleton instance for easy React access
export const globalAudioEngine = new AudioEngine();
