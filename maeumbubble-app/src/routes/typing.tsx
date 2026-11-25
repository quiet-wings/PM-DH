import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Keyboard, RotateCcw, SkipForward } from 'lucide-react'
import { toast } from 'sonner'
import { SubPageHeader } from '../components/SubPageHeader'
import { BottomNav } from '../components/BottomNav'
import { TYPING_PHRASES, TYPING_PHRASES_EN, countKeystrokes, shuffled } from '../lib/typing-phrases'
import { useLang, tr } from '../lib/useLang'
import type { Language } from '../lib/i18n'
import { soundManager } from '../lib/sound'
import { triggerBubblePopConfetti } from '../lib/confetti'

export const Route = createFileRoute('/typing')({
  head: () => ({
    meta: [
      { title: '긍정 글귀 타이핑 | 마음 버블' },
      {
        name: 'description',
        content: '따뜻한 긍정 문장을 한 글자씩 따라 쓰며 마음을 가라앉혀 보세요.',
      },
      { property: 'og:title', content: '긍정 글귀 타이핑 | 마음 버블' },
    ],
  }),
  component: TypingPage,
})

interface TypingResult {
  text: string
  /** 분당 타수 */
  cpm: number
  /** 정확도(%) */
  accuracy: number
}

function cheerFor(accuracy: number, lang: Language): string {
  if (accuracy === 100) return tr(lang, '한 글자도 놓치지 않았어요. 이 문장은 이제 당신 거예요 🌸', 'Not a single letter missed. This sentence is yours now 🌸')
  if (accuracy >= 90) return tr(lang, '또박또박 잘 썼어요. 마음에도 잘 새겨졌을 거예요 🍀', 'Nicely typed. It has settled into your heart, too 🍀')
  if (accuracy >= 70) return tr(lang, '조금 틀려도 괜찮아요. 쓰는 동안 마음이 쉬었으니까요 🫧', 'A few slips are okay. Your mind got to rest while you typed 🫧')
  return tr(lang, '빠르지 않아도, 정확하지 않아도 괜찮아요. 천천히 한 번 더 써 볼까요? 🍃', "It doesn't have to be fast or perfect. Shall we type it once more, slowly? 🍃")
}

function TypingPage() {
  const lang = useLang()
  const [queue, setQueue] = useState<string[]>(TYPING_PHRASES)
  const [idx, setIdx] = useState(0)
  const [typed, setTyped] = useState('')
  const [composing, setComposing] = useState(false)
  const [result, setResult] = useState<TypingResult | null>(null)
  const [history, setHistory] = useState<TypingResult[]>([])
  const startedAt = useRef<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 문장 순서는 화면이 뜬 뒤에 섞어요 (서버에서 그린 화면과 어긋나지 않게)
  // 영어 모드면 영어 문장으로 따라 써요
  useEffect(() => {
    setQueue(shuffled(lang === 'en' ? TYPING_PHRASES_EN : TYPING_PHRASES))
    setIdx(0)
    setTyped('')
    setResult(null)
    startedAt.current = null
  }, [lang])

  const target = queue[idx % queue.length]

  const finish = (value: string) => {
    const elapsed = Math.max(Date.now() - (startedAt.current ?? Date.now()), 1000)
    const cpm = Math.round(countKeystrokes(value) / (elapsed / 60000))
    let correct = 0
    for (let i = 0; i < target.length; i++) {
      if (value[i] === target[i]) correct++
    }
    const accuracy = Math.round((correct / target.length) * 100)
    const r: TypingResult = { text: target, cpm, accuracy }
    setResult(r)
    setHistory((prev) => [r, ...prev])
    soundManager.playPopSound()
    triggerBubblePopConfetti()
  }

  const handleChange = (value: string) => {
    if (result) return
    if (startedAt.current === null && value.length > 0) {
      startedAt.current = Date.now()
    }
    setTyped(value)
    if (value === target) finish(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (result) {
      goNext()
      return
    }
    if (typed.length < target.length) {
      toast.info(tr(lang, '문장을 끝까지 따라 써 주세요.', 'Please type the whole sentence.'))
      return
    }
    finish(typed)
  }

  const reset = (nextIdx: number) => {
    setIdx(nextIdx)
    setTyped('')
    setResult(null)
    setComposing(false)
    startedAt.current = null
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const goNext = () => reset(idx + 1)
  const retry = () => reset(idx)

  const avgCpm = history.length
    ? Math.round(history.reduce((s, r) => s + r.cpm, 0) / history.length)
    : 0
  const avgAccuracy = history.length
    ? Math.round(history.reduce((s, r) => s + r.accuracy, 0) / history.length)
    : 0

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden pb-16 md:pb-0">
      <div className="fixed top-24 -left-10 w-72 h-72 rounded-full bg-sky-200/25 dark:bg-sky-900/10 blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-0 w-96 h-96 rounded-full bg-emerald-200/25 dark:bg-emerald-900/15 blur-3xl pointer-events-none -z-10" />

      <SubPageHeader emoji="⌨️" title={tr(lang, '긍정 글귀 타이핑', 'Affirmation Typing')} />

      <main className="max-w-3xl mx-auto px-4 py-8 md:py-12 w-full flex-1">
        <section className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-stone-800 dark:text-stone-100 tracking-tight">
            {tr(lang, '따뜻한 문장을 손끝으로 따라 써요', 'Type warm words with your fingertips')}
          </h2>
          <p className="mt-2 text-stone-600 dark:text-stone-300 text-sm md:text-base leading-relaxed">
            {tr(lang, '빠르게 칠 필요 없어요. 한 글자씩 쓰는 동안', "No need to rush. As you type one letter at a time,")}{' '}
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">{tr(lang, '문장이 마음에 스며들어요.', 'the words sink into your heart.')}</span>
          </p>
        </section>

        {/* 기록 요약 */}
        <section className="grid grid-cols-3 gap-3 mb-6">
          <StatTile label={tr(lang, '따라 쓴 문장', 'Sentences typed')} value={tr(lang, `${history.length}개`, `${history.length}`)} />
          <StatTile label={tr(lang, '평균 타수', 'Avg. speed')} value={history.length ? tr(lang, `${avgCpm}타/분`, `${avgCpm} keys/min`) : '-'} />
          <StatTile label={tr(lang, '평균 정확도', 'Avg. accuracy')} value={history.length ? `${avgAccuracy}%` : '-'} />
        </section>

        {/* 따라 쓰기 카드 */}
        <section className="bg-white/80 dark:bg-zinc-900/80 border border-emerald-100 dark:border-zinc-800 rounded-3xl p-5 md:p-8 shadow-xl backdrop-blur-md">
          <p className="text-xs font-bold tracking-wider text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-1.5">
            <Keyboard className="w-4 h-4" />
            {tr(lang, `${(idx % queue.length) + 1}번째 문장`, `Sentence ${(idx % queue.length) + 1}`)}
          </p>

          {/* 보기 문장: 글자마다 맞음/틀림 색을 입혀요 */}
          <p
            className="text-xl md:text-2xl font-bold leading-relaxed tracking-wide break-keep select-none"
            aria-label={target}
          >
            {target.split('').map((ch, i) => {
              let cls = 'text-stone-400 dark:text-stone-500'
              if (i < typed.length) {
                const isLast = i === typed.length - 1
                if (typed[i] === ch) cls = 'text-emerald-600 dark:text-emerald-400'
                else if (isLast && composing) cls = 'text-stone-700 dark:text-stone-200'
                else cls = 'text-rose-500 bg-rose-100/70 dark:bg-rose-950/50 rounded'
              } else if (i === typed.length && !result) {
                cls =
                  'text-stone-700 dark:text-stone-200 underline decoration-emerald-500 decoration-2 underline-offset-4'
              }
              return (
                <span key={i} className={cls}>
                  {ch}
                </span>
              )
            })}
          </p>

          <form onSubmit={handleSubmit} className="mt-5">
            <input
              ref={inputRef}
              type="text"
              value={typed}
              onChange={(e) => handleChange(e.target.value)}
              onCompositionStart={() => setComposing(true)}
              onCompositionEnd={() => setComposing(false)}
              onPaste={(e) => e.preventDefault()}
              disabled={!!result}
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder={tr(lang, '위 문장을 여기에 따라 써 보세요', 'Type the sentence above here')}
              aria-label={tr(lang, '문장 따라 쓰기 입력', 'Type-along input')}
              className="w-full px-4 py-3.5 rounded-2xl bg-stone-50/80 dark:bg-zinc-800/80 border border-stone-200 dark:border-zinc-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-base md:text-lg transition-all disabled:opacity-60"
            />

            {!result && (
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex-1 h-1.5 rounded-full bg-stone-200/70 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-sky-400 rounded-full transition-all duration-200"
                    style={{
                      width: `${Math.min(100, Math.round((typed.length / target.length) * 100))}%`,
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={goNext}
                  className="flex items-center gap-1 text-xs font-medium text-stone-500 dark:text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  {tr(lang, '다른 문장', 'Another one')}
                </button>
              </div>
            )}
          </form>

          {/* 결과 */}
          {result && (
            <div className="mt-5 p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-sky-50 dark:from-zinc-800 dark:to-zinc-800/60 border border-emerald-200/80 dark:border-emerald-800/40 animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-sm md:text-base font-bold text-emerald-950 dark:text-emerald-100">
                {cheerFor(result.accuracy, lang)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="px-3 py-1 rounded-full bg-white/90 dark:bg-zinc-700 text-stone-700 dark:text-stone-200">
                  {tr(lang, `타수 ${result.cpm}타/분`, `Speed ${result.cpm} keys/min`)}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/90 dark:bg-zinc-700 text-stone-700 dark:text-stone-200">
                  {tr(lang, '정확도', 'Accuracy')} {result.accuracy}%
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={goNext}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
                >
                  {tr(lang, '다음 문장', 'Next sentence')}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={retry}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-700 border border-emerald-200 dark:border-zinc-600 text-emerald-800 dark:text-emerald-200 text-sm font-semibold hover:bg-emerald-50 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  {tr(lang, '한 번 더 쓰기', 'Type it again')}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* 오늘 쓴 문장들 */}
        {history.length > 0 && (
          <section className="mt-8">
            <h3 className="text-sm font-bold text-stone-700 dark:text-stone-200 mb-3">
              {tr(lang, '오늘 손끝에 담은 문장', 'Sentences you typed today')}
            </h3>
            <ul className="space-y-2">
              {history.map((r, i) => (
                <li
                  key={`${r.text}-${i}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-emerald-100/80 dark:border-zinc-800 text-sm"
                >
                  <span className="text-stone-800 dark:text-stone-200">{r.text}</span>
                  <span className="shrink-0 text-xs text-stone-400">
                    {tr(lang, `${r.cpm}타`, `${r.cpm} kpm`)} · {r.accuracy}%
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <BottomNav lang={lang} />
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 md:p-4 rounded-2xl bg-white/60 dark:bg-zinc-900/60 border border-stone-200/60 dark:border-zinc-800 text-center backdrop-blur-xs">
      <p className="text-[11px] text-stone-500 dark:text-stone-400">{label}</p>
      <p className="mt-0.5 text-base md:text-lg font-extrabold text-emerald-700 dark:text-emerald-400">
        {value}
      </p>
    </div>
  )
}
