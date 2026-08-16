/**
 * Web Audio API Sound Synthesizer for "Cuộc Đua Kỳ Thú"
 * Synthesizes all game sounds purely in-browser with zero external asset dependencies.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;
  private volume: number = 0.8;
  private gallopInterval: number | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction to comply with autoplay policies
  }

  private getContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stopRaceGallop();
    }
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public getVolume(): number {
    return this.volume;
  }

  // Click / Tactile UI sound
  public playClick() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(this.volume * 0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Ignore audio errors
    }
  }

  // Countdown Beep (3, 2, 1) or GO!
  public playCountdown(isGo: boolean = false) {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      if (!isGo) {
        // High crisp beep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        gain.gain.setValueAtTime(this.volume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } else {
        // High energetic chord for GO!
        const freqs = [523.25, 659.25, 783.99, 1046.5]; // C Major high
        freqs.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(this.volume * 0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.6);
        });
      }
    } catch {
      // Ignore audio errors
    }
  }

  // Race start horn / whistle
  public playWhistle() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.15);
      osc.frequency.setValueAtTime(1200, now + 0.2);

      gain.gain.setValueAtTime(this.volume * 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch {
      // Ignore
    }
  }

  // Horse galloping rhythmic sound loop with variable tempo
  public startRaceGallop(initialSpeedMs: number = 180) {
    if (!this.isEnabled) return;
    this.stopRaceGallop();

    let currentInterval = initialSpeedMs;

    const playHoofBeat = () => {
      if (!this.isEnabled) return;
      const ctx = this.getContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        // Double hoof clatter (clip-clop)
        const times = [0, 0.06];
        times.forEach((offset, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(idx === 0 ? 170 : 135, now + offset);
          osc.frequency.exponentialRampToValueAtTime(45, now + offset + 0.05);

          gain.gain.setValueAtTime(this.volume * 0.25, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.06);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.06);
        });
      } catch {
        // Ignore
      }
    };

    this.gallopInterval = window.setInterval(playHoofBeat, currentInterval);
    playHoofBeat();
  }

  // Adjust gallop tempo dynamically (e.g. faster towards the finish line)
  public setGallopTempo(tempoMs: number) {
    if (!this.isEnabled || !this.gallopInterval) return;
    this.startRaceGallop(tempoMs);
  }

  // Realistic race start bell
  public playStartBell() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [880, 1760].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(this.volume * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.6);
      });
    } catch {
      // Ignore
    }
  }

  public stopRaceGallop() {
    if (this.gallopInterval !== null) {
      clearInterval(this.gallopInterval);
      this.gallopInterval = null;
    }
  }

  // Winner Fanfare melody
  public playWinnerFanfare() {
    if (!this.isEnabled) return;
    this.stopRaceGallop();
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Notes: G4, C5, E5, G5 (Triumphant victory fanfare)
      const notes = [
        { f: 392.0, time: 0, dur: 0.12 },
        { f: 523.25, time: 0.12, dur: 0.12 },
        { f: 659.25, time: 0.24, dur: 0.14 },
        { f: 783.99, time: 0.40, dur: 0.55 },
      ];

      notes.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, now + n.time);

        gain.gain.setValueAtTime(this.volume * 0.45, now + n.time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + n.time);
        osc.stop(now + n.time + n.dur);
      });
    } catch {
      // Ignore
    }
  }

  // Correct answer chime
  public playCorrect() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(this.volume * 0.4, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.35);
      });
    } catch {
      // Ignore
    }
  }

  // Wrong answer buzz
  public playWrong() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.setValueAtTime(140, now + 0.15);

      gain.gain.setValueAtTime(this.volume * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.38);
    } catch {
      // Ignore
    }
  }

  // Grand Trophy celebration
  public playTrophyFanfare() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const chordNotes = [
        { f: 523.25, time: 0, dur: 0.2 },
        { f: 659.25, time: 0.18, dur: 0.2 },
        { f: 783.99, time: 0.36, dur: 0.25 },
        { f: 1046.5, time: 0.58, dur: 0.8 },
      ];

      chordNotes.forEach((item) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(item.f, now + item.time);

        gain.gain.setValueAtTime(this.volume * 0.45, now + item.time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + item.time + item.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + item.time);
        osc.stop(now + item.time + item.dur);
      });
    } catch {
      // Ignore
    }
  }

  // Timer Tick warning
  public playTimerTick() {
    if (!this.isEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);

      gain.gain.setValueAtTime(this.volume * 0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Ignore
    }
  }
}

export const sound = new SoundEngine();
