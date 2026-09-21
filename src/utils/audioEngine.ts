/**
 * Web Audio Engine for Real-Time Lyric Video Synchronization
 * Provides synthetic worship/synthwave accompaniment or custom audio file playback,
 * with real-time frequency analysis and MediaStreamDestination for video export.
 */

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private customSource: AudioBufferSourceNode | null = null;
  private customBuffer: AudioBuffer | null = null;
  private isCustomAudioLoaded = false;
  private mediaDest: MediaStreamAudioDestinationNode | null = null;

  // Synthesis state
  private isSynthesizing = false;
  private synthInterval: any = null;
  private bpm = 68;
  private activeGenre: 'worship' | 'synthwave' | 'acoustic' | 'how_to_save_a_life' = 'worship';
  private masterGain: GainNode | null = null;


  constructor() {
    // Lazy initialized on first user click to satisfy browser autoplay policies
  }

  public init(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.85;

      this.mediaDest = this.ctx.createMediaStreamDestination();

      // Route: Source -> Analyser -> MasterGain -> destination & mediaDest
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.connect(this.mediaDest);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getMediaStream(): MediaStream | null {
    if (!this.mediaDest) this.init();
    return this.mediaDest ? this.mediaDest.stream : null;
  }

  public setVolume(val: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, val));
    }
  }

  public async loadCustomAudio(file: File): Promise<number> {
    const ctx = this.init();
    const arrayBuffer = await file.arrayBuffer();
    this.customBuffer = await ctx.decodeAudioData(arrayBuffer);
    this.isCustomAudioLoaded = true;
    return this.customBuffer.duration;
  }

  public clearCustomAudio() {
    this.stop();
    this.customBuffer = null;
    this.isCustomAudioLoaded = false;
  }

  public hasCustomAudio(): boolean {
    return this.isCustomAudioLoaded && this.customBuffer !== null;
  }

  public play(startTimeSec: number = 0, bpm: number = 68, genre: 'worship' | 'synthwave' | 'acoustic' | 'how_to_save_a_life' = 'worship') {
    const ctx = this.init();
    this.bpm = bpm;
    this.activeGenre = genre;

    this.stop();

    if (this.isCustomAudioLoaded && this.customBuffer) {
      this.customSource = ctx.createBufferSource();
      this.customSource.buffer = this.customBuffer;
      this.customSource.connect(this.analyser!);
      this.analyser!.connect(this.masterGain!);

      const offset = Math.min(startTimeSec, this.customBuffer.duration);
      this.customSource.start(0, offset);
    } else {
      // Start real-time synthesized atmospheric accompaniment
      this.startSynthesizer(startTimeSec);
    }
  }

  public stop() {
    if (this.customSource) {
      try {
        this.customSource.stop();
        this.customSource.disconnect();
      } catch (e) {
        // already stopped
      }
      this.customSource = null;
    }

    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    this.isSynthesizing = false;
  }

  public getFrequencyData(): Uint8Array {
    if (!this.analyser) {
      return new Uint8Array(128);
    }
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  public getAverageVolume(): number {
    const data = this.getFrequencyData();
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
    }
    return sum / data.length; // 0 to 255
  }

  // Atmospheric Real-Time Synthesis
  private startSynthesizer(currentSec: number) {
    if (!this.ctx || !this.analyser || !this.masterGain) return;
    this.isSynthesizing = true;

    // Chords progression definitions
    // Worship: E - B - C#m - A (E Major Uplifting Worship Anthem)
    const worshipChords = [
      [164.81, 207.65, 246.94, 329.63], // E3, G#3, B3, E4
      [123.47, 185.00, 246.94, 293.66], // B2, F#3, B3, D#4
      [138.59, 164.81, 220.00, 277.18], // C#3, E3, A3, C#4 (C#m)
      [110.00, 164.81, 220.00, 277.18], // A2, E3, A3, C#4 (A)
    ];

    // Synthwave: Am - F - C - G (Retro neon drive)
    const synthwaveChords = [
      [110.00, 164.81, 220.00, 261.63], // Am
      [87.31, 130.81, 174.61, 220.00],  // F
      [130.81, 164.81, 196.00, 261.63], // C
      [98.00, 146.83, 196.00, 246.94],  // G
    ];

    // How to Save a Life: Bb - F/A - Gm - Eb (signature piano chords)
    const howToSaveALifeChords = [
      [116.54, 174.61, 233.08, 293.66], // Bb2, F3, Bb3, D4 (Bb)
      [110.00, 174.61, 220.00, 261.63], // A2, F3, A3, C4 (F/A)
      [98.00, 146.83, 196.00, 293.66],  // G2, D3, G3, D4 (Gm)
      [77.78, 155.56, 196.00, 233.08],  // Eb2, Eb3, G3, Bb3 (Eb)
    ];

    const chords = this.activeGenre === 'synthwave'
      ? synthwaveChords
      : this.activeGenre === 'how_to_save_a_life'
      ? howToSaveALifeChords
      : worshipChords;
    const beatIntervalMs = (60 / this.bpm) * 1000;

    const barIntervalMs = beatIntervalMs * 4;

    let barIndex = Math.floor((currentSec * 1000) / barIntervalMs) % chords.length;

    const playBar = () => {
      if (!this.isSynthesizing || !this.ctx) return;
      const currentChord = chords[barIndex % chords.length];
      barIndex++;

      // Play rich pad & piano
      this.playAtmosphericPad(currentChord, (barIntervalMs / 1000) * 1.1);

      // Play soft melodic piano chimes over the bar
      for (let i = 0; i < 4; i++) {
        const note = currentChord[i % currentChord.length] * (this.activeGenre === 'worship' ? 2 : 1.5);
        setTimeout(() => {
          if (this.isSynthesizing) {
            this.playMelodicNote(note, 0.9, this.activeGenre === 'worship' ? 'sine' : 'sawtooth');
          }
        }, (i * beatIntervalMs));
      }
    };

    playBar();
    this.synthInterval = setInterval(playBar, barIntervalMs);
  }

  private playAtmosphericPad(frequencies: number[], durationSec: number) {
    if (!this.ctx || !this.analyser || !this.masterGain) return;

    frequencies.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();

      osc.type = this.activeGenre === 'synthwave' ? 'sawtooth' : 'triangle';
      osc.frequency.value = freq;

      filter.type = 'lowpass';
      filter.frequency.value = this.activeGenre === 'worship' ? 600 : 1200;

      const now = this.ctx!.currentTime;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.analyser!);
      this.analyser!.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + durationSec + 0.1);
    });
  }

  private playMelodicNote(freq: number, durationSec: number, wave: OscillatorType = 'sine') {
    if (!this.ctx || !this.analyser || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = wave;
    osc.frequency.value = freq;

    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    osc.connect(gain);
    gain.connect(this.analyser);
    this.analyser.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + durationSec);
  }
}
