// Web Audio API Synthesizer for healing sound effects & calming soundscapes
// 효과음은 Web Audio로 합성하고, 배경음만 음원 파일(/audio/rain-mind.mp3)을 재생해요

class SoundManager {
  private ctx: AudioContext | null = null
  private isMuted: boolean = false
  private ambientAudio: HTMLAudioElement | null = null
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
    this.applyAmbientVolume()
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

  // 「퇴사할게요」 도장 "쾅": 묵직하게 떨어지는 저음 + 종이에 찍히는 짧은 타격음
  // delay(초) 뒤에 울려서 도장이 종이에 닿는 순간과 맞춰요.
  public playStampSound(delay = 0) {
    if (this.isMuted) return
    try {
      this.initContext()
      if (!this.ctx) return
      const t = this.ctx.currentTime + delay

      // 1) 쿵 — 낮게 떨어지는 사인파
      const body = this.ctx.createOscillator()
      const bodyGain = this.ctx.createGain()
      body.type = 'sine'
      body.frequency.setValueAtTime(150, t)
      body.frequency.exponentialRampToValueAtTime(45, t + 0.25)
      bodyGain.gain.setValueAtTime(0.0001, t)
      bodyGain.gain.exponentialRampToValueAtTime(0.6, t + 0.008)
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4)
      body.connect(bodyGain)
      bodyGain.connect(this.ctx.destination)
      body.start(t)
      body.stop(t + 0.42)

      // 2) 탁 — 아주 짧은 잡음(도장이 종이를 치는 소리)
      const len = Math.floor(this.ctx.sampleRate * 0.12)
      const buffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3)
      const hit = this.ctx.createBufferSource()
      hit.buffer = buffer
      const filter = this.ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(1800, t)
      const hitGain = this.ctx.createGain()
      hitGain.gain.setValueAtTime(0.45, t)
      hit.connect(filter)
      filter.connect(hitGain)
      hitGain.connect(this.ctx.destination)
      hit.start(t)
      hit.stop(t + 0.13)
    } catch {
      // 소리를 낼 수 없는 환경이면 조용히 넘어가요
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

  // 배경음: 빗소리 + 잔잔한 피아노 「Rain Mind」(Light_Music, Pixabay Content License) 앞 8분을 반복 재생해요.
  // 반복되는 순간 끊김이 들리지 않게 시작·끝 3초는 소리를 서서히 키우고 줄여요.
  private ambientVolume(): number {
    const a = this.ambientAudio
    if (!a || this.isMuted) return 0
    const t = a.currentTime
    const d = Number.isFinite(a.duration) && a.duration > 0 ? a.duration : AMBIENT_LENGTH_SEC
    return AMBIENT_VOLUME * Math.max(0, Math.min(1, t / AMBIENT_FADE_SEC, (d - t) / AMBIENT_FADE_SEC))
  }

  private applyAmbientVolume() {
    if (this.ambientAudio) this.ambientAudio.volume = this.ambientVolume()
  }

  private getAmbientAudio(): HTMLAudioElement | null {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') return null
    if (!this.ambientAudio) {
      const a = new Audio(AMBIENT_SRC)
      a.loop = true
      a.preload = 'none'
      a.volume = 0
      a.addEventListener('timeupdate', () => this.applyAmbientVolume())
      this.ambientAudio = a
    }
    return this.ambientAudio
  }

  // 배경음 켜고 끄기 (true를 돌려주면 켜진 상태)
  public toggleAmbientSound(enable?: boolean): boolean {
    const a = this.getAmbientAudio()
    if (!a) return false
    const target = enable !== undefined ? enable : !this.isAmbientPlaying
    if (!target) {
      a.pause()
      this.isAmbientPlaying = false
      return false
    }
    this.isAmbientPlaying = true
    this.applyAmbientVolume()
    a.play().catch(() => this.playOnFirstTouch())
    return true
  }

  // 브라우저는 소리 자동재생을 막기 때문에, 막혔으면 첫 터치·클릭·키 입력 순간에 다시 재생해요.
  private unlockArmed = false
  private playOnFirstTouch() {
    if (this.unlockArmed || typeof window === 'undefined') return
    this.unlockArmed = true
    const events = ['pointerdown', 'touchstart', 'keydown'] as const
    const unlock = () => {
      events.forEach((e) => window.removeEventListener(e, unlock, true))
      this.unlockArmed = false
      const au = this.ambientAudio
      if (this.isAmbientPlaying && au && au.paused) au.play().catch(() => this.playOnFirstTouch())
    }
    events.forEach((e) => window.addEventListener(e, unlock, { capture: true, passive: true }))
  }

  public isAmbientActive(): boolean {
    return this.isAmbientPlaying
  }

  // 페이지에 들어오면 배경음을 켜 둬요.
  // 브라우저는 소리 자동재생을 막기 때문에, 첫 터치·클릭·키 입력 순간에 소리가 나기 시작해요.
  public autoStartAmbient(): boolean {
    if (typeof window === 'undefined') return false
    if (!this.isAmbientPlaying && !this.toggleAmbientSound(true)) return false
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
const AMBIENT_SRC = '/audio/rain-mind.mp3'
const AMBIENT_VOLUME = 0.2
const AMBIENT_FADE_SEC = 3
// 서버가 파일 길이를 알려 주지 않을 때(스트리밍) 쓰는 음원 길이: 8분
const AMBIENT_LENGTH_SEC = 480

export const soundManager = new SoundManager()
