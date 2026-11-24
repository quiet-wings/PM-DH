// Web Audio API Synthesizer for healing sound effects & calming soundscapes
// Zero external asset dependencies - runs 100% reliably in browser

class SoundManager {
  private ctx: AudioContext | null = null
  private isMuted: boolean = false
  private ambientGain: GainNode | null = null
  private ambientOscillators: OscillatorNode[] = []
  private ambientNoiseNode: AudioNode | null = null
  private isAmbientPlaying: boolean = false

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(muted ? 0 : 0.05, this.ctx.currentTime)
    }
  }

  public getMuted() {
    return this.isMuted
  }

  // Play satisfying soft crystal chime & bubble pop sound
  public playPopSound(pitchShift = 0) {
    if (this.isMuted) return
    try {
      this.initContext()
      if (!this.ctx) return

      const now = this.ctx.currentTime

      // Pentatonic soothing frequencies (C5, D5, E5, G5, A5, C6)
      const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66]
      const baseFreq = scale[Math.floor(Math.random() * scale.length)] * (1 + pitchShift * 0.1)

      // 1. Primary crystal bell tone
      const osc1 = this.ctx.createOscillator()
      const gain1 = this.ctx.createGain()
      osc1.type = 'sine'
      osc1.frequency.setValueAtTime(baseFreq, now)
      osc1.frequency.exponentialRampToValueAtTime(baseFreq * 0.98, now + 0.35)

      gain1.gain.setValueAtTime(0.001, now)
      gain1.gain.linearRampToValueAtTime(0.2, now + 0.01)
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35)

      osc1.connect(gain1)
      gain1.connect(this.ctx.destination)
      osc1.start(now)
      osc1.stop(now + 0.36)

      // 2. Harmonic overtone (shimmer)
      const osc2 = this.ctx.createOscillator()
      const gain2 = this.ctx.createGain()
      osc2.type = 'triangle'
      osc2.frequency.setValueAtTime(baseFreq * 2, now)

      gain2.gain.setValueAtTime(0.001, now)
      gain2.gain.linearRampToValueAtTime(0.08, now + 0.015)
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.25)

      osc2.connect(gain2)
      gain2.connect(this.ctx.destination)
      osc2.start(now)
      osc2.stop(now + 0.26)

      // 3. Tactile soft pop click (filtered noise)
      const bufferSize = this.ctx.sampleRate * 0.04
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25))
      }
      const noise = this.ctx.createBufferSource()
      noise.buffer = buffer

      const filter = this.ctx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.setValueAtTime(1400, now)
      filter.Q.setValueAtTime(2, now)

      const noiseGain = this.ctx.createGain()
      noiseGain.gain.setValueAtTime(0.12, now)
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)

      noise.connect(filter)
      filter.connect(noiseGain)
      noiseGain.connect(this.ctx.destination)
      noise.start(now)
      noise.stop(now + 0.04)
    } catch {
      // AudioContext could be blocked until user gesture, ignore gracefully
    }
  }

  // Play gentle wind sweep when releasing all bubbles together
  public playBreezeSound() {
    if (this.isMuted) return
    try {
      this.initContext()
      if (!this.ctx) return

      const now = this.ctx.currentTime
      const duration = 2.0

      // Ascending chord cascade
      const notes = [440, 523.25, 659.25, 783.99, 880, 1046.5]
      notes.forEach((freq, idx) => {
        if (!this.ctx) return
        const startTime = now + idx * 0.12
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, startTime)

        gain.gain.setValueAtTime(0.001, startTime)
        gain.gain.linearRampToValueAtTime(0.12, startTime + 0.03)
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.8)

        osc.connect(gain)
        gain.connect(this.ctx.destination)
        osc.start(startTime)
        osc.stop(startTime + 0.85)
      })

      // Soft wind noise sweep
      const bufferSize = this.ctx.sampleRate * duration
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }
      const noise = this.ctx.createBufferSource()
      noise.buffer = buffer

      const filter = this.ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(300, now)
      filter.frequency.exponentialRampToValueAtTime(1200, now + 0.8)
      filter.frequency.exponentialRampToValueAtTime(200, now + duration)

      const noiseGain = this.ctx.createGain()
      noiseGain.gain.setValueAtTime(0.01, now)
      noiseGain.gain.linearRampToValueAtTime(0.08, now + 0.6)
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

      noise.connect(filter)
      filter.connect(noiseGain)
      noiseGain.connect(this.ctx.destination)
      noise.start(now)
      noise.stop(now + duration)
    } catch {}
  }

  // Toggle soothing ambient drone / singing bowl
  public toggleAmbientSound(enable?: boolean): boolean {
    try {
      this.initContext()
      if (!this.ctx) return false

      const target = enable !== undefined ? enable : !this.isAmbientPlaying

      if (!target) {
        // Stop ambient
        this.ambientOscillators.forEach((osc) => {
          try {
            osc.stop()
            osc.disconnect()
          } catch {}
        })
        this.ambientOscillators = []
        if (this.ambientNoiseNode) {
          try {
            this.ambientNoiseNode.disconnect()
          } catch {}
          this.ambientNoiseNode = null
        }
        this.isAmbientPlaying = false
        return false
      }

      // Start ambient: warm drone + subtle harmonic singing bowls
      const now = this.ctx.currentTime
      this.ambientGain = this.ctx.createGain()
      this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.04, now)
      this.ambientGain.connect(this.ctx.destination)

      const freqs = [174.61, 261.63, 392.0, 523.25] // Solfeggio 174Hz (relieves stress/tension) + harmonics
      freqs.forEach((freq) => {
        if (!this.ctx || !this.ambientGain) return
        const osc = this.ctx.createOscillator()
        const lfo = this.ctx.createOscillator()
        const lfoGain = this.ctx.createGain()
        const oscGain = this.ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now)

        // Slow subtle wave modulation
        lfo.type = 'sine'
        lfo.frequency.setValueAtTime(0.1 + Math.random() * 0.1, now)
        lfoGain.gain.setValueAtTime(freq * 0.015, now)
        lfo.connect(lfoGain)
        lfoGain.connect(osc.frequency)

        oscGain.gain.setValueAtTime(0.25, now)
        osc.connect(oscGain)
        oscGain.connect(this.ambientGain)

        osc.start(now)
        lfo.start(now)
        this.ambientOscillators.push(osc, lfo)
      })

      this.isAmbientPlaying = true
      return true
    } catch {
      return false
    }
  }

  public isAmbientActive(): boolean {
    return this.isAmbientPlaying
  }

  // 페이지에 들어오면 배경음을 켜 둬요.
  // 브라우저는 소리 자동재생을 막기 때문에, 첫 터치·클릭·키 입력 순간에 소리가 나기 시작해요.
  public autoStartAmbient(): boolean {
    if (typeof window === 'undefined') return false
    if (!this.isAmbientPlaying && !this.toggleAmbientSound(true)) return false
    if (this.ctx && this.ctx.state !== 'running') {
      const events = ['pointerdown', 'touchstart', 'keydown'] as const
      const unlock = () => {
        this.ctx?.resume().catch(() => {})
        events.forEach((e) => window.removeEventListener(e, unlock, true))
      }
      events.forEach((e) => window.addEventListener(e, unlock, { capture: true, passive: true }))
    }
    return true
  }

  // 사용자가 배경음을 직접 끈 적이 없을 때만 자동으로 켜요.
  public autoStartAmbientIfAllowed(): boolean {
    let off = false
    try {
      off = localStorage.getItem(AMBIENT_PREF_KEY) === 'off'
    } catch {}
    return off ? false : this.autoStartAmbient()
  }

  public saveAmbientPref(on: boolean) {
    try {
      localStorage.setItem(AMBIENT_PREF_KEY, on ? 'on' : 'off')
    } catch {}
  }
}

export const AMBIENT_PREF_KEY = 'maeum-ambient'

export const soundManager = new SoundManager()
