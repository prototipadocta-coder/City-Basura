/**
 * Procedural Web Audio API sound generator for authentic retro voxel video game sounds.
 * Fully offline, zero dependencies, no broken network audio requests.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  public masterVolume: number = 0.8;
  public sfxVolume: number = 0.8;
  public musicVolume: number = 0.5;

  private musicInterval: ReturnType<typeof setInterval> | null = null;
  private musicStep: number = 0;
  public currentLevelTrack: number = 0;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Starts procedural environmental soundtrack tailored to each level's unique setting.
   * Uses synthesized Web Audio oscillators - zero external network dependencies, runs 100% offline.
   */
  playLevelMusic(levelNumber: number) {
    if (this.currentLevelTrack === levelNumber && this.musicInterval) return;
    this.stopMusic();
    this.currentLevelTrack = levelNumber;
    this.musicStep = 0;

    this.initContext();
    if (!this.ctx) return;

    // Tempo and sequencing per level
    const tempoMs = levelNumber === 5 ? 175 : levelNumber === 4 ? 260 : levelNumber === 3 ? 200 : levelNumber === 2 ? 340 : 230;

    this.musicInterval = setInterval(() => {
      if (this.isMuted || this.musicVolume <= 0) {
        this.musicStep++;
        return;
      }
      this.initContext();
      if (!this.ctx || this.ctx.state !== 'running') {
        this.musicStep++;
        return;
      }

      const now = this.ctx.currentTime;
      const step = this.musicStep;
      const baseVol = 0.08 * this.musicVolume * this.masterVolume;

      // Note helper: schedules an envelope note
      const playTone = (
        freq: number,
        type: OscillatorType,
        duration: number,
        volScale: number = 1.0,
        detune: number = 0
      ) => {
        if (!this.ctx || freq <= 0) return;
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(freq, now);
          if (detune !== 0) osc.detune.setValueAtTime(detune, now);

          const peakVol = baseVol * volScale;
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(peakVol, now + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + duration + 0.02);
        } catch {
          // Ignore audio quirks
        }
      };

      // Environmental music profiles:
      if (levelNumber === 1) {
        // Nivel 1: "Ruta escolar de San Antonio" - Warm Latin suburban acoustic morning
        // G Major / C Major happy, sunny pentatonic melody and bouncy walking bass
        const bassPattern = [196, 0, 196, 220, 246.9, 0, 164.8, 146.8]; // G3, A3, B3, E3, D3
        const leadPattern = [
          392.0, 440.0, 493.88, 587.33, 659.25, 587.33, 493.88, 440.0,
          523.25, 493.88, 440.0, 392.0, 329.63, 392.0, 440.0, 392.0,
        ];
        const bassNote = bassPattern[step % bassPattern.length];
        const leadNote = leadPattern[step % leadPattern.length];

        if (bassNote > 0 && step % 2 === 0) {
          playTone(bassNote / 2, 'triangle', 0.22, 1.1); // Warm acoustic bass
        }
        if (leadNote > 0) {
          playTone(leadNote, 'sine', 0.18, 0.7); // Soft school bell/kalimba
        }
        if (step % 4 === 2) {
          playTone(587.33, 'triangle', 0.08, 0.35); // Light acoustic tap
        }
      } else if (levelNumber === 2) {
        // Nivel 2: "Jornada junto a la quebrada" - Tranquil nature stream, gentle flowing flute
        // D minor / F major peaceful ambient arpeggio
        const streamNotes = [293.66, 349.23, 440.0, 523.25, 587.33, 440.0, 349.23, 392.0];
        const droneNotes = [146.83, 174.61, 130.81, 110.0];
        const melody = streamNotes[step % streamNotes.length];
        const drone = droneNotes[Math.floor(step / 8) % droneNotes.length];

        if (step % 8 === 0) {
          playTone(drone, 'sine', 1.8, 1.2); // Warm gentle stream drone
        }
        playTone(melody, 'sine', 0.28, 0.6); // Water drop chime
        if (step % 4 === 1) {
          playTone(melody * 1.5, 'sine', 0.2, 0.3); // High harmonic bird whistle
        }
      } else if (levelNumber === 3) {
        // Nivel 3: "Corredor comercial y movilidad" - Upbeat urban city groove
        // Funky synth bassline and bright 8-bit commercial boulevard rhythm
        const funkyBass = [110, 110, 130.81, 146.83, 164.81, 196.0, 164.81, 146.83];
        const synthLead = [440, 0, 523.25, 0, 659.25, 587.33, 523.25, 440];
        const bass = funkyBass[step % funkyBass.length];
        const lead = synthLead[step % synthLead.length];

        playTone(bass, 'sawtooth', 0.14, 0.85); // Punchy city bass
        if (lead > 0) {
          playTone(lead, 'square', 0.12, 0.5); // Bright retro synth
        }
        if (step % 2 === 1) {
          playTone(200, 'triangle', 0.06, 0.4); // Hi-hat click
        }
      } else if (levelNumber === 4) {
        // Nivel 4: "Residuos especiales de los talleres" - Industrial tension and caution
        // Low detuned warning pulse, tense minor intervals for toxic safety operation
        const industrialBass = [73.42, 0, 73.42, 82.41, 65.41, 0, 73.42, 98.0];
        const alertNote = [293.66, 0, 311.13, 0, 277.18, 0, 293.66, 329.63];
        const bass = industrialBass[step % industrialBass.length];
        const alert = alertNote[step % alertNote.length];

        if (bass > 0) {
          playTone(bass, 'sawtooth', 0.26, 1.1, 8); // Gritty industrial engine
        }
        if (alert > 0 && step % 4 === 2) {
          playTone(alert, 'triangle', 0.2, 0.7, -12); // Tension siren pulse
        }
      } else {
        // Nivel 5: "La Cumbre del Basurero (Mr. Basura)" - High-tempo dramatic boss battle!
        // Driving 16th-note rhythm, aggressive synth bass and heroic struggle lead
        const bossBass = [98.0, 98.0, 116.54, 98.0, 130.81, 123.47, 116.54, 98.0];
        const bossLead = [
          392.0, 466.16, 523.25, 587.33, 622.25, 587.33, 523.25, 466.16,
          698.46, 622.25, 587.33, 523.25, 466.16, 392.0, 523.25, 587.33
        ];
        const bass = bossBass[step % bossBass.length];
        const lead = bossLead[step % bossLead.length];

        playTone(bass, 'sawtooth', 0.12, 1.2); // Fast driving battle bass
        playTone(lead, 'triangle', 0.14, 0.85); // Heroic lead arpeggio
        if (step % 2 === 0) {
          playTone(180, 'square', 0.05, 0.35); // Snappy combat pulse
        }
      }

      this.musicStep++;
    }, tempoMs);
  }

  /**
   * Stops background music playback and resets the sequencer.
   */
  stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.currentLevelTrack = 0;
    this.musicStep = 0;
  }

  // Soft menu hover blip
  playHover() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(540, this.ctx.currentTime + 0.04);
      
      const vol = 0.08 * this.sfxVolume * this.masterVolume;
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // AudioContext may be blocked before interaction
    }
  }

  // Authentic blocky Minecraft-style button click
  playClick() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

      const vol = 0.22 * this.sfxVolume * this.masterVolume;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.08);
    } catch {
      // Ignore
    }
  }

  // Picking up trash item in first person
  playCollectTrash() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.setValueAtTime(480, now + 0.04);
      osc.frequency.setValueAtTime(640, now + 0.08);

      const vol = 0.15 * this.sfxVolume * this.masterVolume;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.14);
    } catch {
      // Ignore
    }
  }

  // Depositing into green/blue recycle bin
  playRecycleSuccess() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      
      // Chime arpeggio
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.06;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        
        const vol = 0.18 * this.sfxVolume * this.masterVolume;
        gain.gain.setValueAtTime(vol, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.2);
      });
    } catch {
      // Ignore
    }
  }

  // Shop purchase chime
  playShopBuy() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      const vol = 0.25 * this.sfxVolume * this.masterVolume;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.25);
    } catch {
      // Ignore
    }
  }

  // Soft walking footstep on voxel street
  playFootstep() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120 + Math.random() * 20, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.04);

      const vol = 0.06 * this.sfxVolume * this.masterVolume;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.04);
    } catch {
      // Ignore
    }
  }

  // Short descending tone for invalid actions and blocked checkpoints
  playError() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);

      const volume = 0.12 * this.sfxVolume * this.masterVolume;
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch {
      // AudioContext may be blocked before interaction
    }
  }
}

export const soundManager = new SoundManager();
