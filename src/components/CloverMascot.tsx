import { useState } from 'react'
import { Sparkles, Heart } from 'lucide-react'
import { Language, translations } from '../lib/i18n'

interface CloverMascotProps {
  message: string
  isHappy?: boolean
  onClick?: () => void
  lang?: Language
}

export function CloverMascot({ message, isHappy = false, onClick, lang = 'ko' }: CloverMascotProps) {
  const [wiggle, setWiggle] = useState(false)
  const t = translations[lang]

  const handleTap = () => {
    setWiggle(true)
    setTimeout(() => setWiggle(false), 800)
    if (onClick) onClick()
  }

  return (
    <div className="relative flex flex-col items-center">
      {/* Speech dialogue bubble above mascot */}
      <div className="relative mb-3 max-w-xs md:max-w-sm px-5 py-3 rounded-2xl bg-white/95 dark:bg-zinc-800/95 border border-emerald-200/80 dark:border-emerald-800/50 shadow-md backdrop-blur-sm transition-all duration-300">
        <p className="text-sm md:text-base font-medium text-emerald-950 dark:text-emerald-100 text-center leading-relaxed">
          {message}
        </p>
        {/* Tail */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 dark:bg-zinc-800/95 border-r border-b border-emerald-200/80 dark:border-emerald-800/50 transform rotate-45" />
      </div>

      {/* Mascot character with Netlify Image CDN & fallback */}
      <div
        onClick={handleTap}
        className={`relative cursor-pointer transition-transform duration-300 ${
          isHappy ? 'scale-110 -translate-y-2' : 'hover:scale-105'
        } ${wiggle ? 'animate-bounce' : 'animate-float-slow'}`}
        role="button"
        tabIndex={0}
        aria-label={t.mascotAria}
      >
        {/* Aura glow behind mascot */}
        <div className="absolute inset-0 bg-radial from-emerald-300/40 via-teal-200/20 to-transparent blur-2xl rounded-full scale-125 pointer-events-none" />

        {/* Mascot Image */}
        <div className="relative w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden border-4 border-white/80 dark:border-zinc-800/80 shadow-xl bg-gradient-to-b from-sky-100/60 to-emerald-100/60 dark:from-slate-800/60 dark:to-emerald-950/60">
          {/* Netlify가 아닌 서버에서도 보이도록 원본 이미지를 바로 써요 */}
          <img
            src="/img/clover-spirit.png"
            alt={t.mascotAlt}
            width={480}
            height={480}
            className="w-full h-full object-cover object-center transform transition-transform duration-700 hover:scale-105"
            loading="eager"
          />
        </div>

        {/* Floating clover badge */}
        <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-zinc-900 animate-pulse">
          <span className="text-base select-none">🍀</span>
        </div>

        {/* Sparkling hearts when happy */}
        {isHappy && (
          <div className="absolute -top-3 -right-2 flex gap-1 animate-bounce">
            <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
        )}
      </div>

      <p className="mt-2 text-xs text-stone-500 dark:text-stone-400 font-medium">
        {t.mascotHint}
      </p>
    </div>
  )
}
