import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { Copy, Download, Play, RotateCcw, Sparkles, Timer, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import { SubPageHeader } from '../components/SubPageHeader'
import { BottomNav } from '../components/BottomNav'
import { soundManager } from '../lib/sound'
import { triggerBubblePopConfetti, triggerBreezeCelebration } from '../lib/confetti'
import { downloadAffirmationCard } from '../lib/cardImage'

export const Route = createFileRoute('/game')({
  head: () => ({
    meta: [
      { title: '스트레스 해소 미니게임 | 마음 버블' },
      {
        name: 'description',
        content:
          '행운의 네잎클로버와 황금빛 세잎클로버(행복) 찾기, 뽁뽁이 터뜨리기, 걱정 버블 팡팡으로 마음을 가볍게 쉬어 보세요.',
      },
      { property: 'og:title', content: '스트레스 해소 미니게임 | 마음 버블' },
    ],
  }),
  component: GamePage,
})

type Mode = 'clover' | 'wrap' | 'pop'

function GamePage() {
  const [mode, setMode] = useState<Mode>('clover')

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden pb-16 md:pb-0">
      <div className="fixed top-24 -left-10 w-72 h-72 rounded-full bg-emerald-200/25 dark:bg-emerald-900/10 blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-0 w-96 h-96 rounded-full bg-amber-200/25 dark:bg-amber-900/15 blur-3xl pointer-events-none -z-10" />

      <SubPageHeader emoji="🎮" title="미니게임" />

      <main className="max-w-3xl mx-auto px-4 py-8 md:py-12 w-full flex-1">
        <section className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-stone-800 dark:text-stone-100 tracking-tight">
            생각은 잠시 끄고, 손끝으로 톡톡
          </h2>
          <p className="mt-2 text-stone-600 dark:text-stone-300 text-sm md:text-base">
            이기고 지는 건 없어요. 하나씩 터뜨리며 행운과 행복을 만나 보세요.
          </p>
        </section>

        {/* 게임 고르기 */}
        <div className="flex justify-center mb-6">
          <div className="flex flex-wrap items-center justify-center gap-1 bg-stone-100/80 dark:bg-zinc-800/80 p-1.5 rounded-2xl backdrop-blur-xs">
            <ModeTab active={mode === 'clover'} onClick={() => setMode('clover')}>
              🍀 행운 네잎클로버 찾기
            </ModeTab>
            <ModeTab active={mode === 'wrap'} onClick={() => setMode('wrap')}>
              🫧 뽁뽁이 터뜨리기
            </ModeTab>
            <ModeTab active={mode === 'pop'} onClick={() => setMode('pop')}>
              🎈 걱정 버블 팡팡
            </ModeTab>
          </div>
        </div>

        {mode === 'clover' ? (
          <LuckyCloverGame />
        ) : mode === 'wrap' ? (
          <BubbleWrapGame />
        ) : (
          <WorryPopGame />
        )}
      </main>
      <BottomNav />
    </div>
  )
}

function ModeTab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
        active
          ? 'bg-white dark:bg-zinc-700 text-emerald-800 dark:text-emerald-300 shadow-2xs'
          : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
      }`}
    >
      {children}
    </button>
  )
}

/* ───────────────── 🍀 행운 네잎클로버 찾기 ───────────────── */

type CloverDifficulty = 'easy' | 'normal' | 'hard'

const DIFFICULTY_CONFIG: Record<
  CloverDifficulty,
  { label: string; count: number; gridClass: string; desc: string }
> = {
  easy: {
    label: '🌱 쉬움 (12개)',
    count: 12,
    gridClass: 'grid-cols-4 sm:grid-cols-4',
    desc: '가볍게 12개의 거품 방울 속에서 행운과 행복을 찾아보세요.',
  },
  normal: {
    label: '🌿 중간 (24개)',
    count: 24,
    gridClass: 'grid-cols-4 sm:grid-cols-6',
    desc: '24개의 거품 방울을 하나씩 터뜨리며 설레는 마음으로 찾아보세요.',
  },
  hard: {
    label: '🌳 어려움 (36개)',
    count: 36,
    gridClass: 'grid-cols-6 sm:grid-cols-6',
    desc: '36개의 풍성한 거품 방울! 클릭할 때마다 행운이 점점 가까워져요.',
  },
}

interface CloverComfortQuote {
  title: string
  subtext: string
}

const GOLDEN_THREE_LEAF_CARDS: CloverComfortQuote[] = [
  {
    title: "세잎클로버의 꽃말은 '행복'이에요.",
    subtext:
      '우리는 가끔 특별한 행운(네잎클로버)을 찾느라 발밑에 가득 피어난 행복(세잎클로버)을 지나치곤 해요. 오늘 당신의 곁에는 이미 금빛처럼 따뜻한 행복이 머물고 있어요.',
  },
  {
    title: "황금빛 세잎클로버가 건네는 말, '지금 이 순간의 행복'",
    subtext:
      '거창한 행운이 당장 오지 않아도 괜찮아요. 오늘 무사히 숨 쉬고, 작은 거품을 톡 터뜨리며 미소 지을 수 있는 지금이 가장 반짝이는 행복입니다.',
  },
  {
    title: "세잎클로버는 '행복', 네잎클로버는 '행운'을 상징해요.",
    subtext:
      '행운을 찾아가는 길목에서 마주친 이 금빛 세잎클로버처럼, 당신의 평범한 일상 곳곳에 다정하고 포근한 행복이 늘 함께하기를 바랍니다.',
  },
]

const FOUR_LEAF_CARDS: CloverComfortQuote[] = [
  {
    title: "행운의 네잎클로버를 찾았어요! 꽃말은 '행운'이에요.",
    subtext:
      '포기하지 않고 하나씩 거품을 두드린 당신의 손끝에 마침내 네잎클로버가 피어났어요. 조만간 당신의 마음에도 기분 좋은 행운이 다정하게 찾아올 거예요.',
  },
  {
    title: '당신에게 찾아온 초록빛 기적, 네잎클로버!',
    subtext:
      '클릭할 때마다 조금씩 가까워지던 행운이 드디어 당신의 품에 안겼어요. 오늘 하루, 생각지도 못한 따뜻한 일들이 당신을 기다리고 있을 거예요.',
  },
]

const CLOVER_FOUND_TOTAL_KEY = 'mind_bubble_clover_found_total'

function pickRandomIndex(max: number, exclude?: number): number {
  if (max <= 1) return 0
  let idx = Math.floor(Math.random() * max)
  while (exclude !== undefined && idx === exclude) {
    idx = Math.floor(Math.random() * max)
  }
  return idx
}

function LuckyCloverGame() {
  const [difficulty, setDifficulty] = useState<CloverDifficulty>('easy')
  const totalCells = DIFFICULTY_CONFIG[difficulty].count

  const [popped, setPopped] = useState<boolean[]>(() => Array(totalCells).fill(false))
  const [fourLeafIdx, setFourLeafIdx] = useState<number>(0)
  const [goldenThreeLeafIdx, setGoldenThreeLeafIdx] = useState<number>(1)

  const [foundFourLeaf, setFoundFourLeaf] = useState(false)
  const [foundGoldenThreeLeaf, setFoundGoldenThreeLeaf] = useState(false)

  const [goldenCard, setGoldenCard] = useState<CloverComfortQuote>(GOLDEN_THREE_LEAF_CARDS[0])
  const [fourLeafCard, setFourLeafCard] = useState<CloverComfortQuote>(FOUR_LEAF_CARDS[0])
  const [totalFoundCount, setTotalFoundCount] = useState<number>(0)

  // 저장된 누적 발견 횟수 불러오기
  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(CLOVER_FOUND_TOTAL_KEY) || '0')
      if (Number.isFinite(saved)) setTotalFoundCount(saved)
    } catch {}
  }, [])

  // 새 판 세팅
  const startNewRound = (nextDiff: CloverDifficulty = difficulty) => {
    const count = DIFFICULTY_CONFIG[nextDiff].count
    const fourIdx = pickRandomIndex(count)
    const goldIdx = pickRandomIndex(count, fourIdx)
    setPopped(Array(count).fill(false))
    setFourLeafIdx(fourIdx)
    setGoldenThreeLeafIdx(goldIdx)
    setFoundFourLeaf(false)
    setFoundGoldenThreeLeaf(false)
    setGoldenCard(
      GOLDEN_THREE_LEAF_CARDS[Math.floor(Math.random() * GOLDEN_THREE_LEAF_CARDS.length)],
    )
    setFourLeafCard(FOUR_LEAF_CARDS[Math.floor(Math.random() * FOUR_LEAF_CARDS.length)])
  }

  // 처음 마운트 시 랜덤 배치
  useEffect(() => {
    startNewRound('easy')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChangeDifficulty = (nextDiff: CloverDifficulty) => {
    setDifficulty(nextDiff)
    startNewRound(nextDiff)
  }

  const poppedCount = popped.filter(Boolean).length
  const remainingCount = totalCells - poppedCount

  // 다음 클릭에서 네잎클로버(또는 아직 못 찾은 특별 클로버)를 찾을 확률 계산
  // 클릭할수록 남은 버블 수가 줄어들어 확률이 점점 높아지며, 결국 100% 찾게 됨!
  const remainingSpecialCount = (foundFourLeaf ? 0 : 1) + (foundGoldenThreeLeaf ? 0 : 1)
  const nextClickChance =
    remainingSpecialCount === 0
      ? 100
      : remainingCount <= 0
        ? 100
        : Math.min(100, Math.round((remainingSpecialCount / remainingCount) * 100))

  const nextFourLeafChance = foundFourLeaf
    ? 100
    : remainingCount <= 0
      ? 100
      : Math.min(100, Math.round((1 / remainingCount) * 100))

  const handleCellClick = (index: number, e: React.MouseEvent<HTMLButtonElement>) => {
    if (popped[index]) return

    setPopped((prev) => {
      const next = [...prev]
      next[index] = true
      return next
    })

    const rect = e.currentTarget.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2

    if (index === fourLeafIdx) {
      setFoundFourLeaf(true)
      soundManager.playBreezeSound()
      triggerBreezeCelebration()
      triggerBubblePopConfetti(cx, cy)
      setTotalFoundCount((prev) => {
        const next = prev + 1
        try {
          localStorage.setItem(CLOVER_FOUND_TOTAL_KEY, String(next))
        } catch {}
        return next
      })
      toast.success('🍀 행운의 네잎클로버를 찾았어요!')
    } else if (index === goldenThreeLeafIdx) {
      setFoundGoldenThreeLeaf(true)
      soundManager.playPopSound(1.2)
      triggerBubblePopConfetti(cx, cy)
      toast.success("✨ 황금빛 세잎클로버('행복')를 발견했어요! 아래 위로카드를 확인해 보세요.")
    } else {
      soundManager.playPopSound(0.8)
    }
  }

  const handleCopyCard = (quote: CloverComfortQuote) => {
    navigator.clipboard
      .writeText(`"${quote.title}"\n${quote.subtext}\n— 마음 버블`)
      .then(() => toast.success('마음 문장이 복사되었어요 💌'))
      .catch(() => {})
  }

  const handleDownloadCard = async (quote: CloverComfortQuote, footerLabel: string) => {
    const ok = await downloadAffirmationCard(quote.title, quote.subtext, footerLabel)
    if (ok) {
      toast.success('위로카드를 이미지로 저장했어요 🖼️')
    } else {
      toast.error('이미지를 만들지 못했어요. 다시 시도해 주세요.')
    }
  }

  return (
    <div className="space-y-6">
      <section className="bg-white/85 dark:bg-zinc-900/85 border border-emerald-100 dark:border-zinc-800 rounded-3xl p-5 md:p-7 shadow-xl backdrop-blur-md">
        {/* 상단 난이도 선택 탭 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100 dark:border-zinc-800">
          <div>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
              난이도 선택 (버블 개수)
            </span>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              {DIFFICULTY_CONFIG[difficulty].desc}
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-stone-100/90 dark:bg-zinc-800 p-1 rounded-2xl shrink-0">
            {(['easy', 'normal', 'hard'] as CloverDifficulty[]).map((lv) => (
              <button
                key={lv}
                type="button"
                onClick={() => handleChangeDifficulty(lv)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  difficulty === lv
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-stone-600 dark:text-stone-300 hover:bg-white/60 dark:hover:bg-zinc-700'
                }`}
              >
                {DIFFICULTY_CONFIG[lv].label}
              </button>
            ))}
          </div>
        </div>

        {/* 실시간 행운 확률 & 발견 상태 표시줄 */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-amber-50/70 dark:from-zinc-800/90 dark:via-zinc-800/70 dark:to-zinc-800/90 border border-emerald-200/60 dark:border-zinc-700">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border ${
                  foundFourLeaf
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white/90 dark:bg-zinc-900 text-stone-700 dark:text-stone-200 border-emerald-200 dark:border-zinc-700'
                }`}
              >
                🍀 행운 네잎클로버: {foundFourLeaf ? '발견 완료!' : '숨어있음 (1개)'}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border ${
                  foundGoldenThreeLeaf
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white/90 dark:bg-zinc-900 text-stone-700 dark:text-stone-200 border-amber-200 dark:border-zinc-700'
                }`}
              >
                ✨ 금빛 세잎클로버(행복): {foundGoldenThreeLeaf ? '발견 완료!' : '숨어있음 (1개)'}
              </span>
            </div>

            <span className="text-emerald-800 dark:text-emerald-300">
              {foundFourLeaf && foundGoldenThreeLeaf
                ? '🎉 두 클로버를 모두 찾았어요!'
                : `다음 클릭에 찾을 확률: ${nextClickChance}% (네잎 ${nextFourLeafChance}%)`}
            </span>
          </div>

          {/* 확률 게이지 바 */}
          <div className="mt-2.5 w-full h-2 rounded-full bg-white/80 dark:bg-zinc-900 overflow-hidden border border-emerald-100 dark:border-zinc-700">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 transition-all duration-300 rounded-full"
              style={{ width: `${nextClickChance}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-between">
            <span>
              못 찾는 판은 없어요! 버블을 하나씩 터뜨릴 때마다 확률이 올라가며 반드시 찾게 됩니다.
            </span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400 shrink-0 ml-2">
              누적 행운 {totalFoundCount}회
            </span>
          </p>
        </div>

        {/* 버블 그리드 */}
        <div
          className={`mt-5 grid ${DIFFICULTY_CONFIG[difficulty].gridClass} gap-2.5 sm:gap-3 select-none touch-manipulation`}
        >
          {popped.map((isPopped, i) => {
            const isFourLeaf = i === fourLeafIdx
            const isGoldenThree = i === goldenThreeLeafIdx

            return (
              <button
                key={i}
                type="button"
                onClick={(e) => handleCellClick(i, e)}
                aria-label={
                  !isPopped
                    ? `${i + 1}번 거품 버블 터뜨리기`
                    : isFourLeaf
                      ? '행운의 네잎클로버 발견!'
                      : isGoldenThree
                        ? '황금빛 세잎클로버(행복) 발견!'
                        : '초록 세잎클로버'
                }
                className={`group relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-200 ${
                  !isPopped
                    ? 'bg-gradient-to-br from-sky-50/90 via-white/95 to-emerald-50/90 dark:from-zinc-800 dark:to-zinc-800/70 border border-sky-200/80 dark:border-zinc-700 shadow-sm hover:scale-105 hover:shadow-md active:scale-95 cursor-pointer'
                    : isFourLeaf
                      ? 'bg-gradient-to-br from-emerald-100 via-teal-50 to-emerald-200/90 dark:from-emerald-950/90 dark:to-teal-900/80 border-2 border-emerald-400 shadow-lg scale-105'
                      : isGoldenThree
                        ? 'bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-200/90 dark:from-amber-950/90 dark:to-yellow-900/80 border-2 border-amber-400 shadow-lg scale-105'
                        : 'bg-stone-100/70 dark:bg-zinc-800/40 border border-stone-200/50 dark:border-zinc-800 opacity-85'
                }`}
              >
                {!isPopped ? (
                  <>
                    <img
                      src="/img/foam-bubble.png"
                      alt=""
                      draggable={false}
                      className="w-4/5 h-4/5 object-contain opacity-85 group-hover:scale-110 transition-transform pointer-events-none select-none"
                    />
                    <span className="absolute bottom-1.5 text-[10px] font-bold text-stone-400 dark:text-stone-500 group-hover:text-emerald-600">
                      톡!
                    </span>
                  </>
                ) : isFourLeaf ? (
                  <div className="flex flex-col items-center animate-in zoom-in-75 duration-300">
                    <span className="text-2xl sm:text-3xl drop-shadow-xs">🍀</span>
                    <span className="mt-0.5 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-200">
                      행운!
                    </span>
                  </div>
                ) : isGoldenThree ? (
                  <div className="flex flex-col items-center animate-in zoom-in-75 duration-300">
                    <div className="relative flex items-center justify-center">
                      <span
                        className="text-2xl sm:text-3xl"
                        style={{
                          filter:
                            'sepia(1) saturate(4.5) hue-rotate(5deg) brightness(1.08) drop-shadow(0 2px 6px rgba(245,158,11,0.45))',
                        }}
                      >
                        ☘️
                      </span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 absolute -top-1 -right-2 animate-pulse" />
                    </div>
                    <span className="mt-0.5 text-[10px] font-extrabold text-amber-800 dark:text-amber-200">
                      금빛 행복!
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center animate-in fade-in duration-200">
                    <span className="text-lg sm:text-xl opacity-75">☘️</span>
                    <span className="text-[9px] text-stone-400 dark:text-stone-500">세잎</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* 하단 컨트롤 */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 dark:border-zinc-800">
          <p className="text-xs text-stone-500 dark:text-stone-400">
            남은 거품 버블 <strong className="text-stone-700 dark:text-stone-200">{remainingCount}개</strong> ·
            한 게임에 <strong className="text-emerald-700 dark:text-emerald-400">🍀 네잎클로버 1개</strong>와{' '}
            <strong className="text-amber-600 dark:text-amber-400">✨ 금빛 세잎클로버 1개</strong>가 숨어 있어요.
          </p>
          <button
            type="button"
            onClick={() => startNewRound(difficulty)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />새 클로버 숨기기
          </button>
        </div>
      </section>

      {/* ✨ 금빛 세잎클로버 ('행복') 위로카드 */}
      {foundGoldenThreeLeaf && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-br from-amber-50 via-yellow-50/80 to-orange-50/70 dark:from-amber-950/60 dark:via-zinc-900 dark:to-amber-900/40 border-2 border-amber-300/80 dark:border-amber-700/60 shadow-[0_18px_45px_-12px_rgba(245,158,11,0.25)]">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-amber-200 to-yellow-100 dark:from-amber-900 dark:to-yellow-800 border border-amber-300 flex items-center justify-center shadow-sm">
                  <span
                    className="text-3xl select-none"
                    style={{
                      filter: 'sepia(1) saturate(4.5) hue-rotate(5deg) brightness(1.08)',
                    }}
                  >
                    ☘️
                  </span>
                </div>
                <div>
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 text-xs font-extrabold">
                    ✨ 황금빛 세잎클로버 위로카드 · 꽃말: 행복
                  </span>
                  <h3 className="mt-2 text-lg md:text-xl font-extrabold text-stone-900 dark:text-stone-100 leading-snug break-keep">
                    "{goldenCard.title}"
                  </h3>
                  <p className="mt-2 text-sm text-stone-700 dark:text-stone-300 leading-relaxed break-keep">
                    {goldenCard.subtext}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-amber-200/60 dark:border-amber-800/40 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-amber-800/80 dark:text-amber-300/80">
                💛 세잎클로버가 상징하는 ‘행복’을 당신의 마음에 담아보세요
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyCard(goldenCard)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/90 dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 text-stone-700 dark:text-stone-200 text-xs font-bold hover:bg-amber-50 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-600" />
                  문장 복사
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadCard(goldenCard, '마음 버블 · 세잎클로버의 행복')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  위로카드 이미지 저장
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 🍀 행운의 네잎클로버 위로카드 */}
      {foundFourLeaf && (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-br from-emerald-50 via-teal-50/80 to-sky-50/70 dark:from-emerald-950/60 dark:via-zinc-900 dark:to-teal-900/40 border-2 border-emerald-300/80 dark:border-emerald-700/60 shadow-[0_18px_45px_-12px_rgba(16,185,129,0.22)]">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-200 to-teal-100 dark:from-emerald-900 dark:to-teal-800 border border-emerald-300 flex items-center justify-center shadow-sm">
                  <span className="text-3xl select-none">🍀</span>
                </div>
                <div>
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-200/80 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200 text-xs font-extrabold">
                    🍀 행운의 네잎클로버 위로카드 · 꽃말: 행운
                  </span>
                  <h3 className="mt-2 text-lg md:text-xl font-extrabold text-stone-900 dark:text-stone-100 leading-snug break-keep">
                    "{fourLeafCard.title}"
                  </h3>
                  <p className="mt-2 text-sm text-stone-700 dark:text-stone-300 leading-relaxed break-keep">
                    {fourLeafCard.subtext}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-emerald-200/60 dark:border-emerald-800/40 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-emerald-800/80 dark:text-emerald-300/80">
                {!foundGoldenThreeLeaf
                  ? '💡 아직 숨어 있는 금빛 세잎클로버(행복)도 마저 찾아보세요!'
                  : '🌈 오늘 행운(네잎)과 행복(금빛 세잎)을 모두 찾으셨어요!'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyCard(fourLeafCard)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/90 dark:bg-zinc-800 border border-emerald-200 dark:border-zinc-700 text-stone-700 dark:text-stone-200 text-xs font-bold hover:bg-emerald-50 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-emerald-600" />
                  문장 복사
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadCard(fourLeafCard, '마음 버블 · 네잎클로버의 행운')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  위로카드 이미지 저장
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

/* ───────────────── 뽁뽁이 터뜨리기 ───────────────── */

const WRAP_CELLS = 48
const WRAP_TOTAL_KEY = 'mind_bubble_wrap_total'

function BubbleWrapGame() {
  const [popped, setPopped] = useState<boolean[]>(() => Array(WRAP_CELLS).fill(false))
  const [total, setTotal] = useState(0)
  const [sheets, setSheets] = useState(0)

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(WRAP_TOTAL_KEY) || '0')
      if (Number.isFinite(saved)) setTotal(saved)
    } catch {}
  }, [])

  const remaining = popped.filter((p) => !p).length

  // 한 장을 다 터뜨리면 새 뽁뽁이를 깔아 줘요
  useEffect(() => {
    if (remaining !== 0) return
    soundManager.playBreezeSound()
    triggerBreezeCelebration()
    const timer = setTimeout(() => {
      setPopped(Array(WRAP_CELLS).fill(false))
      setSheets((s) => s + 1)
    }, 900)
    return () => clearTimeout(timer)
  }, [remaining])

  const pop = (i: number) => {
    if (popped[i]) return
    soundManager.playPopSound()
    setPopped((prev) => {
      const next = [...prev]
      next[i] = true
      return next
    })
    setTotal((prev) => {
      const next = prev + 1
      try {
        localStorage.setItem(WRAP_TOTAL_KEY, String(next))
      } catch {}
      return next
    })
  }

  return (
    <section className="bg-white/80 dark:bg-zinc-900/80 border border-emerald-100 dark:border-zinc-800 rounded-3xl p-5 md:p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 mb-4 text-xs font-semibold text-stone-600 dark:text-stone-300">
        <span>
          지금까지 터뜨린 뽁뽁이{' '}
          <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">
            {total.toLocaleString()}개
          </span>
        </span>
        <span>
          {sheets > 0 && `${sheets}장 완료 · `}남은 뽁뽁이 {remaining}개
        </span>
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 md:gap-3 select-none touch-manipulation">
        {popped.map((isPopped, i) => (
          <button
            key={i}
            type="button"
            onPointerDown={() => pop(i)}
            aria-label={isPopped ? '터진 뽁뽁이' : '뽁뽁이 터뜨리기'}
            aria-pressed={isPopped}
            className={`relative aspect-square rounded-full transition-all duration-150 ${
              isPopped
                ? 'wrap-popped'
                : 'bubble-glass border border-sky-200 dark:border-white/15 hover:scale-105 active:scale-90 cursor-pointer'
            }`}
          >
            {!isPopped && <span className="bubble-highlight" />}
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-xs text-stone-500 dark:text-stone-400">
          다 터뜨리면 새 뽁뽁이가 자동으로 깔려요.
        </p>
        <button
          type="button"
          onClick={() => setPopped(Array(WRAP_CELLS).fill(false))}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />새 뽁뽁이
        </button>
      </div>
    </section>
  )
}

/* ───────────────── 걱정 버블 팡팡 ───────────────── */

const GAME_SECONDS = 30
const BEST_KEY = 'mind_bubble_game_best'

const WORRY_WORDS = [
  '마감',
  '야근',
  '걱정',
  '불안',
  '피곤',
  '잔소리',
  '비교',
  '후회',
  '눈치',
  '월요일',
  '시험',
  '한숨',
  '짜증',
  '미루기',
  '조급함',
  '과제',
  '답장',
  '잡생각',
]

const BUBBLE_TINTS = [
  'from-amber-200/70 to-orange-200/60',
  'from-rose-200/70 to-pink-200/60',
  'from-indigo-200/70 to-purple-200/60',
  'from-emerald-200/70 to-teal-200/60',
  'from-sky-200/70 to-cyan-200/60',
]

interface RisingBubble {
  id: number
  word: string
  left: number
  size: number
  duration: number
  tint: string
}

type Phase = 'idle' | 'playing' | 'done'

function scoreMessage(score: number): string {
  if (score >= 40) return '걱정이 남아나질 않겠어요! 마음이 뻥 뚫렸죠? 🌈'
  if (score >= 25) return '시원하게 날려 보냈어요. 어깨가 한결 가벼워졌을 거예요 🍃'
  if (score >= 10) return '하나하나 잘 터뜨렸어요. 그만큼 마음이 비워졌어요 🫧'
  return '천천히 해도 괜찮아요. 터뜨린 만큼은 확실히 가벼워졌어요 🍀'
}

function WorryPopGame() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [isNewBest, setIsNewBest] = useState(false)
  const [bubbles, setBubbles] = useState<RisingBubble[]>([])
  const nextId = useRef(1)

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(BEST_KEY) || '0')
      if (Number.isFinite(saved)) setBest(saved)
    } catch {}
  }, [])

  // 게임 중: 1초마다 시간을 줄이고, 버블을 계속 띄워요
  useEffect(() => {
    if (phase !== 'playing') return
    const clock = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000)
    const spawner = setInterval(() => {
      const size = 64 + Math.round(Math.random() * 36)
      setBubbles((prev) => [
        ...prev,
        {
          id: nextId.current++,
          word: WORRY_WORDS[Math.floor(Math.random() * WORRY_WORDS.length)],
          left: 4 + Math.random() * 78,
          size,
          duration: 3.2 + Math.random() * 2.4,
          tint: BUBBLE_TINTS[Math.floor(Math.random() * BUBBLE_TINTS.length)],
        },
      ])
    }, 480)
    return () => {
      clearInterval(clock)
      clearInterval(spawner)
    }
  }, [phase])

  // 시간이 끝나면 결과를 보여 줘요
  useEffect(() => {
    if (phase !== 'playing' || timeLeft > 0) return
    setPhase('done')
    setBubbles([])
    soundManager.playBreezeSound()
    triggerBreezeCelebration()
    if (score > best) {
      setBest(score)
      setIsNewBest(true)
      try {
        localStorage.setItem(BEST_KEY, String(score))
      } catch {}
    }
  }, [phase, timeLeft, score, best])

  const start = () => {
    setScore(0)
    setTimeLeft(GAME_SECONDS)
    setBubbles([])
    setIsNewBest(false)
    setPhase('playing')
    soundManager.playPopSound(1)
  }

  const popBubble = (id: number, e: React.PointerEvent) => {
    soundManager.playPopSound()
    triggerBubblePopConfetti(e.clientX, e.clientY)
    setBubbles((prev) => prev.filter((b) => b.id !== id))
    setScore((s) => s + 1)
  }

  const removeBubble = (id: number) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <section className="bg-white/80 dark:bg-zinc-900/80 border border-emerald-100 dark:border-zinc-800 rounded-3xl p-5 md:p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 mb-4 text-xs font-semibold text-stone-600 dark:text-stone-300">
        <span className="flex items-center gap-1.5">
          <Timer className="w-4 h-4 text-emerald-600" />
          남은 시간{' '}
          <span
            className={`text-sm font-bold ${
              timeLeft <= 5 && phase === 'playing'
                ? 'text-rose-500'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {timeLeft}초
          </span>
        </span>
        <span>
          터뜨린 걱정{' '}
          <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">{score}개</span>
        </span>
        <span className="flex items-center gap-1">
          <Trophy className="w-4 h-4 text-amber-500" />
          최고 {best}개
        </span>
      </div>

      {/* 게임 판 */}
      <div className="relative h-[440px] rounded-2xl overflow-hidden bg-gradient-to-b from-sky-100/80 via-emerald-50/60 to-indigo-100/70 dark:from-slate-900 dark:via-zinc-900 dark:to-slate-950 border border-white/70 dark:border-zinc-800 select-none touch-manipulation">
        {bubbles.map((b) => (
          <button
            key={b.id}
            type="button"
            onPointerDown={(e) => popBubble(b.id, e)}
            onAnimationEnd={() => removeBubble(b.id)}
            aria-label={`${b.word} 걱정 버블 터뜨리기`}
            className={`animate-game-rise absolute rounded-full bg-gradient-to-br ${b.tint} border border-white/80 shadow-md flex items-center justify-center text-xs font-bold text-stone-700 cursor-pointer active:scale-90`}
            style={{
              left: `${b.left}%`,
              bottom: -110,
              width: b.size,
              height: b.size,
              animationDuration: `${b.duration}s`,
            }}
          >
            <span className="bubble-highlight" />
            {b.word}
          </button>
        ))}

        {phase === 'idle' && (
          <Overlay>
            <p className="text-4xl mb-2">🎈</p>
            <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">걱정 버블 팡팡</h3>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-300 max-w-xs">
              {GAME_SECONDS}초 동안 떠오르는 걱정 버블을 눌러서 터뜨려 보세요.
            </p>
            <StartButton onClick={start} label="시작하기" />
          </Overlay>
        )}

        {phase === 'done' && (
          <Overlay>
            <p className="text-4xl mb-2">{isNewBest ? '🏆' : '🌤️'}</p>
            <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">
              걱정 {score}개를 날려 보냈어요
            </h3>
            {isNewBest && (
              <p className="mt-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                새 최고 기록이에요!
              </p>
            )}
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-300 max-w-xs">
              {scoreMessage(score)}
            </p>
            <StartButton onClick={start} label="한 번 더" />
          </Overlay>
        )}
      </div>
    </section>
  )
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-300">
      {children}
    </div>
  )
}

function StartButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-4 flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
    >
      <Play className="w-4 h-4" />
      {label}
    </button>
  )
}
