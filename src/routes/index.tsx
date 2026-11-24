import { createFileRoute, Link } from '@tanstack/react-router'
import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  Wind,
  Heart,
  Send,
  RotateCcw,
  BookOpen,
  Share2,
  Globe,
} from 'lucide-react'
import { toast } from 'sonner'
import { CloverMascot } from '../components/CloverMascot'
import { FloatingBubbleItem, BubbleData } from '../components/FloatingBubbleItem'
import { BreathingGuide } from '../components/BreathingGuide'
import { AffirmationModal } from '../components/AffirmationModal'
import { SoundBar } from '../components/SoundBar'
import { ThemeToggle } from '../components/ThemeToggle'
import { BottomNav } from '../components/BottomNav'
import { soundManager } from '../lib/sound'
import { triggerBubblePopConfetti, triggerBreezeCelebration } from '../lib/confetti'
import { Language, translations } from '../lib/i18n'
import {
  STRESS_CATEGORIES,
  PRESET_WORRIES_BY_LANG,
  getRandomAffirmation,
  getAffirmationText,
  getAffirmationSubtext,
  getCategoryLabel,
  getCategoryShortLabel,
  Affirmation,
} from '../lib/affirmations'
import { encryptWorry, getWorryKeyConfig } from '../lib/worryCrypto'

// 테스트 버전에서만: 체크한 고민을 암호화해서 관리자에게 익명으로 보내요.
const WORRY_KEY_CONFIG = getWorryKeyConfig()

export const Route = createFileRoute('/')({
  component: StressReliefHome,
})

const INITIAL_BUBBLES: BubbleData[] = [
  {
    id: 'b-1',
    text: '내일 마감인 일 때문에 가슴이 답답해요',
    textKo: '내일 마감인 일 때문에 가슴이 답답해요',
    textEn: "My chest feels heavy because of tomorrow's deadline",
    category: 'work',
    colorClass: 'from-amber-200/40 to-orange-200/40 border-amber-300/50',
    createdAt: Date.now() - 4000,
  },
  {
    id: 'b-2',
    text: '좋아하는 사람의 사소한 말 한마디에 온종일 마음이 흔들려요',
    textKo: '좋아하는 사람의 사소한 말 한마디에 온종일 마음이 흔들려요',
    textEn: 'Every little word from the person I love sways my heart all day',
    category: 'love',
    colorClass: 'from-pink-200/45 to-rose-200/45 border-pink-300/60',
    createdAt: Date.now() - 3000,
  },
  {
    id: 'b-3',
    text: '다른 사람들의 기대에 부응해야 한다는 부담감',
    textKo: '다른 사람들의 기대에 부응해야 한다는 부담감',
    textEn: "The pressure to live up to everyone's expectations",
    category: 'people',
    colorClass: 'from-rose-200/40 to-pink-200/40 border-rose-300/50',
    createdAt: Date.now() - 2000,
  },
  {
    id: 'b-4',
    text: '아무것도 하지 않고 쉬는 게 왠지 불안해요',
    textKo: '아무것도 하지 않고 쉬는 게 왠지 불안해요',
    textEn: 'Resting and doing nothing makes me feel uneasy',
    category: 'burnout',
    colorClass: 'from-emerald-200/40 to-teal-200/40 border-emerald-300/50',
    createdAt: Date.now() - 1000,
  },
]

function StressReliefHome() {
  const [lang, setLang] = useState<Language>('ko')
  const [inputText, setInputText] = useState('')
  const [shareWithAdmin, setShareWithAdmin] = useState(false)
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(STRESS_CATEGORIES[0].id)
  const [bubbles, setBubbles] = useState<BubbleData[]>(INITIAL_BUBBLES)
  const [activeFilter, setActiveFilter] = useState<string>('all')

  // Stats & Affirmations
  const [clearedCount, setClearedCount] = useState<number>(0)
  const [globalCount, setGlobalCount] = useState<number>(1842)
  const [savedAffirmations, setSavedAffirmations] = useState<Affirmation[]>([])
  const [currentAffirmation, setCurrentAffirmation] = useState<Affirmation | null>(null)

  const t = translations[lang]

  // Mascot emotive state
  const [mascotMessage, setMascotMessage] = useState<string>(translations.ko.mascotDefault)
  const [mascotHappy, setMascotHappy] = useState<boolean>(false)

  // Modals
  const [isBreathingOpen, setIsBreathingOpen] = useState(false)
  const [isAffirmationModalOpen, setIsAffirmationModalOpen] = useState(false)

  // Hydrate language preference from localStorage
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('mind_bubble_lang') as Language | null
      if (savedLang === 'ko' || savedLang === 'en') {
        setLang(savedLang)
        setMascotMessage(translations[savedLang].mascotDefault)
        if (typeof document !== 'undefined') {
          document.documentElement.lang = savedLang
        }
      }
    } catch {}
  }, [])

  // Toggle language and persist to localStorage
  const handleToggleLanguage = () => {
    const nextLang: Language = lang === 'ko' ? 'en' : 'ko'
    setLang(nextLang)
    try {
      localStorage.setItem('mind_bubble_lang', nextLang)
    } catch {}

    if (typeof document !== 'undefined') {
      document.documentElement.lang = nextLang
    }

    // Update mascot default message if it's currently on a default message
    if (
      mascotMessage === translations.ko.mascotDefault ||
      mascotMessage === translations.en.mascotDefault
    ) {
      setMascotMessage(translations[nextLang].mascotDefault)
    }
  }

  // Fetch initial global release count from Netlify Database API
  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.totalReleased) {
          setGlobalCount(data.totalReleased)
        }
      })
      .catch(() => {})
  }, [])

  // Handle adding a new bubble
  const handleAddBubble = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = inputText.trim()
    if (!trimmed) {
      toast.info(t.inputEmptyToast)
      return
    }

    const catObj =
      STRESS_CATEGORIES.find((c) => c.id === selectedCategory) || STRESS_CATEGORIES[0]

    const newBubble: BubbleData = {
      id: `b-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text: trimmed,
      category: catObj.id,
      colorClass: catObj.color,
      createdAt: Date.now(),
    }

    setBubbles((prev) => [newBubble, ...prev])
    setInputText('')

    // 동의(체크)한 경우에만, 브라우저에서 암호화한 뒤 보내요. 원문은 서버로 가지 않아요.
    if (WORRY_KEY_CONFIG && shareWithAdmin) {
      encryptWorry(WORRY_KEY_CONFIG.publicJwk, { text: trimmed, category: catObj.id, lang })
        .then((envelope) =>
          fetch('/api/worries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(envelope),
          }),
        )
        .then((res) => {
          if (!res.ok) throw new Error(String(res.status))
        })
        .catch(() => {
          toast.error(
            lang === 'ko'
              ? '고민을 관리자에게 보내지 못했어요. 버블은 그대로 띄워졌어요.'
              : "Couldn't send your worry to the admin. Your bubble is still here.",
          )
        })
    }
    setMascotMessage(t.mascotBubbleAdded)
    soundManager.playPopSound(1)
    toast.success(t.bubbleAddedToast)
  }

  // Handle popping a single bubble
  const handlePopBubble = (bubble: BubbleData, clientX: number, clientY: number) => {
    soundManager.playPopSound()
    triggerBubblePopConfetti(clientX, clientY)

    // Remove the bubble
    setBubbles((prev) => prev.filter((b) => b.id !== bubble.id))

    // Increment local session count
    const newSessionCount = clearedCount + 1
    setClearedCount(newSessionCount)
    setGlobalCount((prev) => prev + 1)

    // Get a comforting affirmation
    const affirmation = getRandomAffirmation(bubble.category)
    setCurrentAffirmation(affirmation)
    setSavedAffirmations((prev) => [affirmation, ...prev])

    // Update mascot reaction
    setMascotHappy(true)
    const affText = getAffirmationText(affirmation, lang)
    setMascotMessage(`"${affText}" ✨`)
    setTimeout(() => setMascotHappy(false), 1200)

    // Record release to Netlify Database API
    fetch('/api/release', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: getCategoryLabel(bubble.category, 'ko'),
        encouragement: affirmation.text,
      }),
    }).catch(() => {})
  }

  // Handle releasing ALL bubbles with a gentle breeze
  const handleReleaseAll = () => {
    if (bubbles.length === 0) {
      toast.info(t.noBubblesToast)
      return
    }

    soundManager.playBreezeSound()
    triggerBreezeCelebration()

    const countReleased = bubbles.length
    setBubbles([])
    setClearedCount((prev) => prev + countReleased)
    setGlobalCount((prev) => prev + countReleased)

    const grandAffirmation: Affirmation = {
      id: `all-${Date.now()}`,
      text: translations.ko.grandAffirmationText,
      textEn: translations.en.grandAffirmationText,
      subtext: translations.ko.grandAffirmationSubtext,
      subtextEn: translations.en.grandAffirmationSubtext,
    }
    setCurrentAffirmation(grandAffirmation)
    setSavedAffirmations((prev) => [grandAffirmation, ...prev])

    setMascotHappy(true)
    setMascotMessage(t.mascotAllReleased)
    setTimeout(() => setMascotHappy(false), 2000)

    toast.success(t.releasedAllToast(countReleased))
  }

  // Handle quick preset click
  const handlePresetClick = (worry: string, idx?: number) => {
    setInputText(worry)
    const presetCategories = ['work', 'love', 'people', 'burnout', 'future', 'thoughts']
    if (typeof idx === 'number' && presetCategories[idx]) {
      setSelectedCategory(presetCategories[idx])
    }
  }

  // Filtered bubbles
  const visibleBubbles =
    activeFilter === 'all'
      ? bubbles
      : bubbles.filter((b) => b.category === activeFilter)

  // Mind Clarity Level (0 = cloudy, 5+ = clear rainbow)
  const clarityPercent = Math.min(100, Math.round((clearedCount / 5) * 100))

  const presetWorries = PRESET_WORRIES_BY_LANG[lang]

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden pb-16 md:pb-0">
      {/* Ambient background decorative floating orbs */}
      <div className="fixed top-20 left-10 w-72 h-72 rounded-full bg-emerald-200/20 dark:bg-emerald-900/15 blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-10 w-80 h-80 rounded-full bg-sky-200/25 dark:bg-sky-900/15 blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-20 left-1/3 w-96 h-96 rounded-full bg-indigo-100/30 dark:bg-purple-950/20 blur-3xl pointer-events-none -z-10" />

      {/* Navigation / Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 dark:bg-zinc-950/70 border-b border-emerald-100/80 dark:border-zinc-800 transition-colors">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2 sm:gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <span className="w-9 h-9 shrink-0 rounded-2xl bg-gradient-to-tr from-[#f6ecc9] to-[#fdf8e4] border border-[#ecdfb0] flex items-center justify-center shadow-xs text-lg select-none">
              🍀
            </span>
            <div className="max-[359px]:hidden">
              <h1 className="text-base md:text-lg font-bold text-stone-900 dark:text-stone-100 leading-tight flex items-center gap-1.5 whitespace-nowrap">
                <span>{t.siteTitle}</span>
                <span className="hidden lg:inline text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {t.siteSubtitle}
                </span>
              </h1>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 hidden xl:block">
                {t.siteDesc}
              </p>
            </div>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Global Release Count Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50/80 dark:bg-zinc-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium border border-emerald-200/60 dark:border-zinc-700">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-spin [animation-duration:10s]" />
              <span>
                {t.worriesReleasedTogether} {globalCount.toLocaleString()}
                {t.countUnit ? `${t.countUnit}` : ''}
              </span>
            </div>

            {/* Sound bar */}
            <SoundBar lang={lang} />

            {/* Breathing Guide Button */}
            <button
              onClick={() => setIsBreathingOpen(true)}
              className="shrink-0 h-8 min-w-8 flex items-center justify-center gap-1.5 px-2 lg:px-3 rounded-full bg-white/80 dark:bg-zinc-800/80 border border-emerald-100 dark:border-zinc-700 text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-emerald-50 dark:hover:bg-zinc-700 transition-all shadow-xs"
              title={t.breathingGuideTitle}
              aria-label={t.breathingGuideTitle}
            >
              <Wind className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden lg:inline">{t.breathingGuideBtn}</span>
            </button>

            {/* Affirmation Archive Button */}
            <button
              onClick={() => setIsAffirmationModalOpen(true)}
              className="relative shrink-0 h-8 min-w-8 flex items-center justify-center gap-1.5 px-2 lg:px-3 rounded-full bg-white/80 dark:bg-zinc-800/80 border border-emerald-100 dark:border-zinc-700 text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-emerald-50 dark:hover:bg-zinc-700 transition-all shadow-xs"
              title={t.affirmationsArchiveTitle}
              aria-label={t.affirmationsArchiveTitle}
            >
              <BookOpen className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden lg:inline">{t.affirmationsArchiveBtn}</span>
              {savedAffirmations.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {savedAffirmations.length}
                </span>
              )}
            </button>

            <ThemeToggle />

            {/* Language Switcher Button (Top Right) */}
            <button
              type="button"
              onClick={handleToggleLanguage}
              className="shrink-0 h-8 min-w-8 flex items-center justify-center gap-1.5 px-2 lg:px-3 rounded-full bg-white/80 dark:bg-zinc-800/80 border border-emerald-200 dark:border-zinc-700 text-xs font-semibold text-stone-700 dark:text-stone-200 hover:bg-emerald-50 dark:hover:bg-zinc-700 transition-all shadow-xs cursor-pointer"
              title={t.languageToggleTitle}
              aria-label={t.languageToggleAria}
            >
              <Globe className="hidden lg:block w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="lg:hidden">{lang === 'ko' ? '한' : 'EN'}</span>
              <span className="hidden lg:inline">
                <span
                  className={
                    lang === 'ko'
                      ? 'text-emerald-700 dark:text-emerald-300 font-bold underline underline-offset-2'
                      : 'text-stone-400 dark:text-stone-500'
                  }
                >
                  한국어
                </span>
                <span className="mx-1 text-stone-300 dark:text-stone-600">/</span>
                <span
                  className={
                    lang === 'en'
                      ? 'text-emerald-700 dark:text-emerald-300 font-bold underline underline-offset-2'
                      : 'text-stone-400 dark:text-stone-500'
                  }
                >
                  English
                </span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12 w-full flex-1 flex flex-col items-center">
        {/* Mascot Hero Greeting */}
        <section className="w-full flex flex-col items-center text-center mb-9">
          <CloverMascot
            message={mascotMessage}
            isHappy={mascotHappy}
            lang={lang}
            onClick={() => {
              soundManager.playPopSound(0.5)
              setMascotMessage(t.mascotTapped)
              toast.info(t.mascotToastTapped)
            }}
          />

          <div className="mt-5 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/85 dark:bg-zinc-800/90 border border-emerald-200/70 dark:border-zinc-700 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-2xs mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>{lang === 'en' ? 'Mindful Bubble Sanctuary' : '몽글몽글 마음 정화 시간'}</span>
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-stone-800 dark:text-stone-100 tracking-tight break-keep text-balance leading-tight">
              {t.heroTitle}
            </h2>
            <p className="mt-2.5 text-stone-600 dark:text-stone-300 text-sm md:text-base leading-relaxed">
              {t.heroDescStart}
              <span className="font-bold text-emerald-700 dark:text-emerald-400 underline decoration-emerald-300/70 decoration-wavy underline-offset-4">
                {t.heroDescHighlight}
              </span>
              {t.heroDescEnd}
            </p>
          </div>
        </section>

        {/* 쉼터 메뉴: 미니게임 · 타이핑 · 서점 */}
        <section className="w-full max-w-2xl mb-8">
          <p className="text-xs font-bold text-stone-500 dark:text-stone-400 mb-2.5 text-center tracking-wide">
            {t.menuHeader}
          </p>
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {(
              [
                { to: '/game', emoji: '🎮', title: t.menuGameTitle, desc: t.menuGameDesc, tint: 'from-white/95 via-violet-50/70 to-sky-50/80 border-violet-200/60' },
                { to: '/typing', emoji: '⌨️', title: t.menuTypingTitle, desc: t.menuTypingDesc, tint: 'from-white/95 via-emerald-50/70 to-teal-50/80 border-emerald-200/60' },
                { to: '/books', emoji: '📚', title: t.menuBooksTitle, desc: t.menuBooksDesc, tint: 'from-white/95 via-rose-50/70 to-amber-50/80 border-rose-200/60' },
              ] as const
            ).map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`group flex flex-col items-center text-center gap-1.5 p-3.5 md:p-5 rounded-3xl bg-gradient-to-br ${item.tint} dark:from-zinc-900/90 dark:via-zinc-800/80 dark:to-zinc-900/70 dark:border-zinc-700/80 border shadow-[0_8px_24px_-8px_rgba(16,185,129,0.12)] hover:shadow-[0_14px_30px_-8px_rgba(16,185,129,0.2)] hover:-translate-y-1 transition-all duration-200 backdrop-blur-md`}
              >
                <span className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-white/90 dark:bg-zinc-800 shadow-xs border border-white dark:border-zinc-700 flex items-center justify-center text-2xl md:text-3xl select-none group-hover:scale-110 transition-transform">
                  {item.emoji}
                </span>
                <span className="mt-0.5 text-xs md:text-sm font-extrabold text-stone-800 dark:text-stone-100 break-keep">
                  {item.title}
                </span>
                <span className="hidden sm:block text-[11px] text-stone-500 dark:text-stone-400 leading-snug">
                  {item.desc}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Input Box Section */}
        <section className="w-full max-w-2xl bg-white/90 dark:bg-zinc-900/85 border-2 border-white dark:border-zinc-800 rounded-[2rem] p-5 md:p-7 shadow-[0_20px_50px_-15px_rgba(14,116,144,0.12)] backdrop-blur-xl mb-8">
          {/* Category Selector Pills */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-xs font-bold text-stone-600 dark:text-stone-300">
              {lang === 'en' ? 'Choose a mind bubble keyword' : '마음버블 키워드를 골라보세요'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 pb-3.5 mb-3">
            {STRESS_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id
              const isLove = cat.id === 'love'
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? isLove
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm scale-[1.03]'
                        : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm scale-[1.03]'
                      : isLove
                        ? 'bg-pink-50/90 dark:bg-pink-950/40 text-rose-700 dark:text-pink-300 border border-pink-200/80 dark:border-pink-800/50 hover:bg-pink-100/90'
                        : 'bg-stone-100/90 dark:bg-zinc-800 text-stone-600 dark:text-stone-300 border border-stone-200/60 dark:border-zinc-700 hover:bg-emerald-50/80 dark:hover:bg-zinc-700'
                  }`}
                >
                  {getCategoryLabel(cat.id, lang)}
                </button>
              )
            })}
          </div>

          {/* Form input */}
          <form onSubmit={handleAddBubble} className="relative flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              maxLength={120}
              placeholder={t.inputPlaceholder}
              className="flex-1 px-4 py-3.5 rounded-2xl bg-stone-50/90 dark:bg-zinc-800/80 border border-stone-200/90 dark:border-zinc-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm md:text-base transition-all shadow-inner"
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-700 hover:via-teal-700 hover:to-sky-700 text-white font-bold text-sm md:text-base shadow-md hover:shadow-lg transition-all transform active:scale-98 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{t.floatBubbleBtn}</span>
            </button>
          </form>

          {/* 테스트 버전 전용: 고민을 관리자에게 익명으로 보내기 (기본은 꺼짐) */}
          {WORRY_KEY_CONFIG && (
            <div className="mt-2.5 rounded-2xl bg-stone-50/80 dark:bg-zinc-800/50 border border-stone-200/70 dark:border-zinc-700/70 px-3.5 py-2.5">
              <div className="flex items-start justify-between gap-2">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={shareWithAdmin}
                    onChange={(e) => setShareWithAdmin(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600"
                  />
                  <span className="text-xs text-stone-600 dark:text-stone-300 break-keep leading-relaxed">
                    {lang === 'ko'
                      ? '(선택) 이 고민을 익명으로 운영자에게 보내 서비스 개선에 쓰는 데 동의해요.'
                      : '(Optional) I agree to send this worry anonymously to the operator to improve the service.'}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPrivacyInfo((v) => !v)}
                  className="shrink-0 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 underline underline-offset-2 cursor-pointer"
                  aria-expanded={showPrivacyInfo}
                >
                  {lang === 'ko' ? '자세히' : 'Details'}
                </button>
              </div>
              {showPrivacyInfo && (
                <ul className="mt-2 space-y-1 pl-6 text-[11px] text-stone-500 dark:text-stone-400 list-disc break-keep leading-relaxed">
                  {lang === 'ko' ? (
                    <>
                      <li>체크하지 않으면 고민은 어디에도 저장되지 않고, 버블을 터뜨리면 사라져요.</li>
                      <li>보내는 것: 고민 내용, 고민 분류, 언어. 이름·이메일·IP 주소는 받지 않아요.</li>
                      <li>고민은 내 브라우저에서 암호화된 뒤 보내져서, 운영자의 비밀번호로만 열 수 있어요.</li>
                      <li>저장된 고민은 30일 뒤 자동으로 지워지고, 운영자가 그 전에 지울 수도 있어요.</li>
                      <li>동의하지 않아도 마음버블의 모든 기능을 똑같이 쓸 수 있어요.</li>
                      <li>이름, 연락처처럼 나를 알아볼 수 있는 내용은 적지 말아 주세요.</li>
                    </>
                  ) : (
                    <>
                      <li>If unchecked, your worry is never stored and disappears when popped.</li>
                      <li>What is sent: worry text, category, language. No name, email or IP address.</li>
                      <li>It is encrypted in your browser and can only be opened with the operator's password.</li>
                      <li>Stored worries are deleted automatically after 30 days.</li>
                      <li>All features work the same without agreeing.</li>
                      <li>Please don't include names or contact details.</li>
                    </>
                  )}
                </ul>
              )}
            </div>
          )}

          {/* Quick preset chips */}
          <div className="mt-4 pt-3.5 border-t border-stone-100 dark:border-zinc-800/80">
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-2 flex items-center gap-1 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.presetHeader}</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {presetWorries.slice(0, 4).map((worry, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetClick(worry, idx)}
                  className="text-xs text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-zinc-800/70 hover:bg-emerald-50 dark:hover:bg-zinc-700 border border-stone-200/70 dark:border-zinc-700 px-3 py-1.5 rounded-full transition-colors text-left cursor-pointer"
                >
                  "{worry}"
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Popped Affirmation Ribbon (if any popped) */}
        {currentAffirmation && (
          <section className="w-full max-w-2xl mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="relative p-5 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-sky-50 dark:from-zinc-800 dark:to-zinc-800/60 border border-emerald-200/80 dark:border-emerald-800/40 shadow-sm flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl select-none mt-0.5">🌸</span>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    {t.recentAffirmationTag}
                  </span>
                  <p className="text-base md:text-lg font-bold text-emerald-950 dark:text-emerald-100 mt-0.5 leading-snug">
                    "{getAffirmationText(currentAffirmation, lang)}"
                  </p>
                  {getAffirmationSubtext(currentAffirmation, lang) && (
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                      {getAffirmationSubtext(currentAffirmation, lang)}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsAffirmationModalOpen(true)}
                className="shrink-0 p-2 rounded-xl text-emerald-700 dark:text-emerald-300 bg-white/80 dark:bg-zinc-700 hover:bg-white transition-colors shadow-2xs"
                title={t.viewInArchiveTitle}
              >
                <Heart className="w-4 h-4 fill-emerald-500 text-emerald-500" />
              </button>
            </div>
          </section>
        )}

        {/* Mind Clarity Progress Bar */}
        <section className="w-full max-w-2xl mb-6 flex items-center justify-between gap-4 p-4 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-stone-200/60 dark:border-zinc-800 backdrop-blur-xs">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <span>{t.releasedToday}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  {clearedCount}
                  {t.countUnit ? `${t.countUnit}` : ''}
                </span>
              </span>
              <span>
                {clarityPercent >= 100
                  ? t.clarityRainbow
                  : clarityPercent >= 50
                    ? t.clarityClearing
                    : t.clarityStarting}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-stone-200/70 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 transition-all duration-700 rounded-full"
                style={{ width: `${clarityPercent}%` }}
              />
            </div>
          </div>
        </section>

        {/* Floating Bubble Garden Canvas */}
        <section className="w-full max-w-5xl rounded-[2.25rem] bg-gradient-to-b from-sky-100/55 via-white/50 to-emerald-50/45 dark:from-zinc-900/70 dark:via-slate-900/60 dark:to-zinc-900/70 border border-white/90 dark:border-zinc-800 p-5 md:p-8 shadow-[0_16px_40px_-15px_rgba(56,189,248,0.15)] backdrop-blur-md">
          {/* Controls toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            {/* Category filter tabs */}
            <div className="flex items-center gap-1 max-w-full overflow-x-auto scrollbar-none bg-white/80 dark:bg-zinc-800/90 p-1.5 rounded-2xl border border-sky-100/80 dark:border-zinc-700 shadow-2xs [&>button]:shrink-0 [&>button]:whitespace-nowrap">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                {t.filterAll} ({bubbles.length})
              </button>
              {STRESS_CATEGORIES.map((cat) => {
                const count = bubbles.filter((b) => b.category === cat.id).length
                const isActive = activeFilter === cat.id
                const isLove = cat.id === 'love'
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? isLove
                          ? 'bg-rose-500 text-white shadow-2xs'
                          : 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                    }`}
                  >
                    {getCategoryShortLabel(cat.id, lang)} {count > 0 && `(${count})`}
                  </button>
                )
              })}
            </div>

            {/* Bulk Release button */}
            {bubbles.length > 0 && (
              <button
                type="button"
                onClick={handleReleaseAll}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/90 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/60 transition-colors shadow-xs cursor-pointer"
              >
                <Wind className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
                <span>{t.releaseAllBtn}</span>
              </button>
            )}
          </div>

          {/* Bubbles Grid */}
          {visibleBubbles.length === 0 ? (
            <div className="w-full py-16 px-4 rounded-3xl border-2 border-dashed border-sky-200/70 dark:border-zinc-800 text-center flex flex-col items-center justify-center bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xs animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full bg-sky-50 dark:bg-emerald-900/40 flex items-center justify-center text-3xl mb-3 shadow-inner">
                🫧
              </div>
              <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200">
                {t.emptyGardenTitle}
              </h3>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400 max-w-sm">
                {t.emptyGardenDesc}
              </p>
              <button
                onClick={() => setBubbles(INITIAL_BUBBLES)}
                className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-zinc-800 border border-emerald-200 dark:border-zinc-700 hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.restoreInitialBubblesBtn}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
              {visibleBubbles.map((bubble, idx) => (
                <FloatingBubbleItem
                  key={bubble.id}
                  bubble={bubble}
                  index={idx}
                  lang={lang}
                  onPop={handlePopBubble}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-emerald-100/80 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md py-6 px-4 mt-12 transition-colors">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="text-xs text-stone-600 dark:text-stone-400 font-medium">
              {t.footerQuote}
            </p>
            <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
              {t.footerSubquote}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator
                    .share({
                      title: t.shareSiteTitle,
                      text: t.shareSiteText,
                      url: window.location.href,
                    })
                    .catch(() => {})
                } else {
                  navigator.clipboard.writeText(window.location.href).then(() => {
                    toast.success(t.linkCopiedToast)
                  })
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 dark:bg-zinc-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-zinc-700 transition-colors shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t.giftRestBtn}</span>
            </button>
          </div>
        </div>
      </footer>

      <BottomNav lang={lang} />

      {/* Modals */}
      <BreathingGuide
        isOpen={isBreathingOpen}
        onClose={() => setIsBreathingOpen(false)}
        lang={lang}
      />
      <AffirmationModal
        isOpen={isAffirmationModalOpen}
        onClose={() => setIsAffirmationModalOpen(false)}
        affirmations={savedAffirmations}
        lang={lang}
      />
    </div>
  )
}
