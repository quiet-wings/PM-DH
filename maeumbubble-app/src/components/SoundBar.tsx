import { useEffect, useState } from 'react'
import { Volume2, VolumeX, Music } from 'lucide-react'
import { soundManager } from '../lib/sound'
import { Language, translations } from '../lib/i18n'

interface SoundBarProps {
  lang?: Language
}

export function SoundBar({ lang = 'ko' }: SoundBarProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false)

  const t = translations[lang]

  // 배경음은 페이지에 들어올 때 자동으로 켜져요(index.tsx). 여기서는 현재 상태만 맞춰요.
  useEffect(() => {
    setIsMuted(soundManager.getMuted())
    setIsAmbientPlaying(soundManager.isAmbientActive())
  }, [])

  const handleToggleMute = () => {
    const nextMuted = !isMuted
    setIsMuted(nextMuted)
    soundManager.setMuted(nextMuted)
  }

  const handleToggleAmbient = () => {
    const nextState = soundManager.toggleAmbientSound()
    setIsAmbientPlaying(nextState)
    soundManager.saveAmbientPref(nextState)
  }

  return (
    <div className="flex items-center gap-0.5 p-1 rounded-full bg-white/80 dark:bg-zinc-800/80 border border-emerald-100 dark:border-zinc-700 shadow-sm backdrop-blur-md">
      {/* Ambient soundscape toggle */}
      <button
        onClick={handleToggleAmbient}
        type="button"
        className={`flex items-center gap-1.5 px-2 xl:px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          isAmbientPlaying
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-zinc-700/60'
        }`}
        title={t.ambientTitle}
      >
        <Music className="w-3.5 h-3.5" />
        <span className="hidden xl:inline">
          {isAmbientPlaying ? t.ambientPlaying : t.ambientTurnOn}
        </span>
        {isAmbientPlaying && (
          <span className="flex items-center gap-0.5 ml-1">
            <span className="w-1 h-3 bg-white rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-1 h-4 bg-white rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-1 h-2 bg-white rounded-full animate-bounce [animation-delay:300ms]" />
          </span>
        )}
      </button>

      {/* Pop sound effects mute/unmute */}
      <button
        onClick={handleToggleMute}
        type="button"
        className="p-1.5 rounded-full text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-zinc-700/60 transition-colors"
        title={isMuted ? t.soundFxOn : t.soundFxOff}
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
    </div>
  )
}
