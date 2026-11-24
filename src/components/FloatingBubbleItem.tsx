import React, { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Language, translations } from '../lib/i18n'
import { getCategoryLabel } from '../lib/affirmations'

export interface BubbleData {
  id: string
  text: string
  textKo?: string
  textEn?: string
  category: string
  categoryLabel?: string
  colorClass: string
  createdAt: number
}

interface FloatingBubbleItemProps {
  bubble: BubbleData
  index: number
  lang?: Language
  onPop: (bubble: BubbleData, clientX: number, clientY: number) => void
}

const CATEGORY_BADGE_STYLES: Record<string, string> = {
  work: 'bg-amber-50/90 text-amber-800 border-amber-200/80 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-700/50',
  people:
    'bg-rose-50/90 text-rose-800 border-rose-200/80 dark:bg-rose-950/70 dark:text-rose-200 dark:border-rose-700/50',
  love: 'bg-pink-50/90 text-pink-700 border-pink-200/90 dark:bg-pink-950/70 dark:text-pink-200 dark:border-pink-700/50',
  future:
    'bg-indigo-50/90 text-indigo-800 border-indigo-200/80 dark:bg-indigo-950/70 dark:text-indigo-200 dark:border-indigo-700/50',
  burnout:
    'bg-emerald-50/90 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/70 dark:text-emerald-200 dark:border-emerald-700/50',
  thoughts:
    'bg-sky-50/90 text-sky-800 border-sky-200/80 dark:bg-sky-950/70 dark:text-sky-200 dark:border-sky-700/50',
}

const CATEGORY_TINT_GLOW: Record<string, string> = {
  work: 'from-amber-200/30 via-orange-100/20 to-transparent',
  people: 'from-rose-200/30 via-pink-100/20 to-transparent',
  love: 'from-pink-300/35 via-rose-200/25 to-transparent',
  future: 'from-indigo-200/30 via-purple-100/20 to-transparent',
  burnout: 'from-emerald-200/30 via-teal-100/20 to-transparent',
  thoughts: 'from-sky-200/30 via-cyan-100/20 to-transparent',
}

export function FloatingBubbleItem({
  bubble,
  index,
  lang = 'ko',
  onPop,
}: FloatingBubbleItemProps) {
  const [isPopping, setIsPopping] = useState(false)
  const t = translations[lang]

  // Dynamic text based on current language
  const displayText =
    lang === 'en' && bubble.textEn
      ? bubble.textEn
      : lang === 'ko' && bubble.textKo
        ? bubble.textKo
        : bubble.text

  // Dynamic category label
  const displayCategory = getCategoryLabel(bubble.category, lang)

  // Subtle floating animation delay based on index for organic rhythm
  const floatDelay = `${(index * 0.65) % 3.2}s`
  const floatDuration = `${4.2 + ((index * 1.1) % 2.6)}s`

  const badgeStyle =
    CATEGORY_BADGE_STYLES[bubble.category] ||
    'bg-stone-50/90 text-stone-700 border-stone-200 dark:bg-zinc-800 dark:text-stone-200'

  const tintGlow =
    CATEGORY_TINT_GLOW[bubble.category] || 'from-sky-200/25 via-white/15 to-transparent'

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (isPopping) return
    setIsPopping(true)
    const rect = e.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    onPop(bubble, x, y)
  }

  return (
    <div
      className={`relative ${isPopping ? '' : 'animate-float-gentle'}`}
      style={{ animationDelay: floatDelay, animationDuration: floatDuration }}
    >
      <button
        onClick={handleClick}
        type="button"
        style={{ animationDelay: floatDelay }}
        className={`group relative w-full min-h-[14rem] md:min-h-[15rem] px-10 pt-11 pb-9 md:px-14 text-center transition-all cursor-pointer select-none focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/50 ${
          isPopping
            ? 'scale-125 opacity-0 duration-300 pointer-events-none'
            : 'hover:scale-[1.035] hover:-translate-y-1 active:scale-95 duration-250'
        }`}
        aria-label={t.bubbleAriaLabel(displayText)}
      >
        {/* 은은하게 비치는 반투명 파스텔 빛깔 레이어 */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-8 inset-y-6 rounded-full bg-radial ${tintGlow} blur-xl opacity-80 transition-opacity duration-300 group-hover:opacity-100`}
        />

        {/* 첨부해주신 거품 일러스트 이미지 (반투명 효과 적용) */}
        <img
          src="/img/foam-bubble.png"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="pointer-events-none select-none absolute inset-0 w-full h-full object-fill opacity-80 dark:opacity-75 group-hover:opacity-90 transition-all duration-300 drop-shadow-[0_12px_24px_rgba(148,184,228,0.28)]"
        />

        {/* Bubble Content */}
        <span className="relative z-10 flex h-full flex-col items-center justify-center gap-2 px-2">
          <span
            className={`inline-flex items-center text-[11px] md:text-xs font-bold px-3 py-0.5 rounded-full border shadow-2xs backdrop-blur-xs ${badgeStyle}`}
          >
            {displayCategory}
          </span>

          <span className="text-base md:text-[17px] font-bold text-stone-800 dark:text-stone-900 leading-relaxed break-keep drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
            {displayText}
          </span>

          <span className="mt-0.5 text-[11px] text-stone-500 flex items-center gap-1 font-semibold group-hover:text-emerald-600 transition-colors">
            <Sparkles className="w-3 h-3 text-sky-500 group-hover:text-emerald-500 transition-colors" />
            <span className="group-hover:hidden">{t.bubbleTapHint}</span>
            <span className="hidden group-hover:inline">{t.bubbleReleaseHint}</span>
          </span>
        </span>
      </button>
    </div>
  )
}
