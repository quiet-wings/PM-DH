import { useState, useEffect } from 'react'
import { Wind, X, Play, Pause } from 'lucide-react'
import { Language, translations } from '../lib/i18n'

interface BreathingGuideProps {
  isOpen: boolean
  onClose: () => void
  lang?: Language
}

export function BreathingGuide({ isOpen, onClose, lang = 'ko' }: BreathingGuideProps) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale')
  const [counter, setCounter] = useState(4)
  const [isActive, setIsActive] = useState(true)

  const t = translations[lang]

  useEffect(() => {
    if (!isOpen || !isActive) return

    const cycle = [
      { name: 'inhale' as const, duration: 4 },
      { name: 'hold' as const, duration: 4 },
      { name: 'exhale' as const, duration: 4 },
      { name: 'rest' as const, duration: 2 },
    ]

    let currentIdx = 0
    let timeLeft = cycle[0].duration
    setPhase(cycle[0].name)
    setCounter(timeLeft)

    const timer = setInterval(() => {
      timeLeft -= 1
      if (timeLeft <= 0) {
        currentIdx = (currentIdx + 1) % cycle.length
        timeLeft = cycle[currentIdx].duration
        setPhase(cycle[currentIdx].name)
      }
      setCounter(timeLeft)
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, isActive])

  if (!isOpen) return null

  const phaseText = {
    inhale: t.breathingInhale,
    hold: t.breathingHold,
    exhale: t.breathingExhale,
    rest: t.breathingRest,
  }[phase]

  const phaseScale = {
    inhale: 'scale-125 duration-[4000ms]',
    hold: 'scale-125 duration-1000',
    exhale: 'scale-90 duration-[4000ms]',
    rest: 'scale-90 duration-1000',
  }[phase]

  const phaseLabel = {
    inhale: t.phaseInhale,
    hold: t.phaseHold,
    exhale: t.phaseExhale,
    rest: t.phaseRest,
  }[phase]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white/95 dark:bg-zinc-900/95 border border-emerald-100 dark:border-emerald-900/40 rounded-3xl p-8 shadow-2xl text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-200/30 dark:bg-emerald-700/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-sky-200/30 dark:bg-sky-700/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label={t.closeAria}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400 font-medium text-sm">
          <Wind className="w-4 h-4 animate-pulse" />
          <span>{t.breathingBadge}</span>
        </div>

        <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-8">
          {t.breathingTitle}
        </h3>

        {/* Dynamic Breathing Orb */}
        <div className="relative w-56 h-56 mx-auto flex items-center justify-center mb-8">
          {/* Outer Ripple */}
          <div
            className={`absolute inset-0 rounded-full bg-emerald-100/60 dark:bg-emerald-900/30 transition-transform ease-in-out ${phaseScale}`}
          />
          {/* Middle Ring */}
          <div
            className={`absolute inset-4 rounded-full bg-gradient-to-tr from-emerald-200/50 via-teal-100/40 to-sky-200/50 dark:from-emerald-800/40 dark:to-sky-800/40 transition-transform ease-in-out ${phaseScale}`}
          />
          {/* Core Orb */}
          <div className="relative z-10 flex flex-col items-center justify-center w-36 h-36 rounded-full bg-white dark:bg-zinc-800 shadow-lg border border-emerald-200/60 dark:border-emerald-700/40">
            <span className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-300 font-dodum">
              {counter}
            </span>
            <span className="text-xs uppercase tracking-widest text-emerald-600/70 dark:text-emerald-400/70 font-semibold mt-1">
              {phaseLabel}
            </span>
          </div>
        </div>

        <p className="text-base font-medium text-stone-700 dark:text-stone-200 mb-6 min-h-[1.5rem] transition-all">
          {phaseText}
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setIsActive(!isActive)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 transition-colors text-sm font-medium"
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4" /> {t.pauseBtn}
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> {t.resumeBtn}
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-zinc-700 transition-colors text-sm font-medium"
          >
            {t.enoughBtn}
          </button>
        </div>
      </div>
    </div>
  )
}
