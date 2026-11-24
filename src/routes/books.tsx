import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { BookOpen, Heart, Shuffle, Share2, ExternalLink } from 'lucide-react'
import { SubPageHeader } from '../components/SubPageHeader'
import { BottomNav } from '../components/BottomNav'
import { toast } from 'sonner'
import { BOOKS, Book, getBookStoreUrl, getRandomBook } from '../lib/books'
import { STRESS_CATEGORIES, getCategoryLabel } from '../lib/affirmations'
import { soundManager } from '../lib/sound'
import { triggerBubblePopConfetti } from '../lib/confetti'

export const Route = createFileRoute('/books')({
  head: () => ({
    meta: [
      { title: '마음버블서점 | 마음 버블' },
      {
        name: 'description',
        content: '지금 내 마음 상태에 맞는 위로의 책을 추천해 드려요. 마음 버블이 고른 힐링 도서 큐레이션.',
      },
      { property: 'og:title', content: '마음버블서점 | 마음 버블' },
    ],
  }),
  component: BookstorePage,
})

const LIKED_KEY = 'mind_bubble_liked_books'

function BookstorePage() {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [pick, setPick] = useState<Book | null>(null)
  const [liked, setLiked] = useState<string[]>([])
  const [showLikedOnly, setShowLikedOnly] = useState(false)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LIKED_KEY) || '[]')
      if (Array.isArray(saved)) setLiked(saved)
    } catch {}
  }, [])

  const toggleLike = (id: string) => {
    setLiked((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      try {
        localStorage.setItem(LIKED_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }

  const handlePick = (e: React.MouseEvent) => {
    const book = getRandomBook(activeCategory === 'all' ? undefined : activeCategory)
    setPick(book)
    soundManager.playPopSound()
    triggerBubblePopConfetti(e.clientX, e.clientY)
  }

  const handleShare = (book?: Book) => {
    const url = window.location.origin + '/books'
    const text = book
      ? `마음버블서점이 추천한 오늘의 한 권: 『${book.title}』 - ${book.author}`
      : '지금 내 마음에 맞는 책을 추천해 주는 마음버블서점'
    if (navigator.share) {
      navigator.share({ title: '마음버블서점', text, url }).catch(() => {})
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
        toast.success('링크를 복사했어요. 친구에게 전해 주세요!')
      })
    }
  }

  let visible = activeCategory === 'all' ? BOOKS : BOOKS.filter((b) => b.category === activeCategory)
  if (showLikedOnly) visible = visible.filter((b) => liked.includes(b.id))

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden pb-16 md:pb-0">
      {/* 배경 장식 */}
      <div className="fixed top-24 -left-10 w-72 h-72 rounded-full bg-amber-200/25 dark:bg-amber-900/10 blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-0 w-96 h-96 rounded-full bg-emerald-200/25 dark:bg-emerald-900/15 blur-3xl pointer-events-none -z-10" />

      {/* 헤더 */}
      <SubPageHeader
        emoji="📚"
        title="마음버블서점"
        right={
          <button
            type="button"
            onClick={() => handleShare()}
            aria-label="서점 공유"
            title="서점 공유"
            className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-white/80 dark:bg-zinc-800/80 border border-emerald-100 dark:border-zinc-700 text-stone-700 dark:text-stone-200 hover:bg-emerald-50 dark:hover:bg-zinc-700 transition-all shadow-xs"
          >
            <Share2 className="w-4 h-4" />
          </button>
        }
      />

      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12 w-full flex-1">
        {/* 소개 */}
        <section className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-stone-800 dark:text-stone-100 tracking-tight">
            오늘 마음에 꼭 맞는 한 권
          </h2>
          <p className="mt-2 text-stone-600 dark:text-stone-300 text-sm md:text-base leading-relaxed">
            버블로 걱정을 날려보냈다면, 이제 <span className="font-semibold text-emerald-700 dark:text-emerald-400">책 한 권</span>으로 마음을 채워 볼까요?
          </p>
        </section>

        {/* 마음 상태 선택 */}
        <section className="w-full max-w-2xl mx-auto bg-white/80 dark:bg-zinc-900/80 border border-emerald-100 dark:border-zinc-800 rounded-3xl p-5 md:p-6 shadow-xl backdrop-blur-md mb-8">
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-200 mb-3">
            요즘 나를 가장 무겁게 하는 건…
          </p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            <CategoryChip active={activeCategory === 'all'} onClick={() => setActiveCategory('all')}>
              🍀 전체
            </CategoryChip>
            {STRESS_CATEGORIES.map((cat) => (
              <CategoryChip
                key={cat.id}
                active={activeCategory === cat.id}
                onClick={() => setActiveCategory(cat.id)}
              >
                {getCategoryLabel(cat.id, 'ko')}
              </CategoryChip>
            ))}
          </div>
          <button
            type="button"
            onClick={handlePick}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-sm md:text-base shadow-md hover:shadow-lg transition-all active:scale-98"
          >
            <Shuffle className="w-4 h-4" />
            <span>오늘의 한 권 뽑기</span>
          </button>
        </section>

        {/* 오늘의 한 권 결과 */}
        {pick && (
          <section className="w-full max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="p-5 md:p-6 rounded-3xl bg-gradient-to-r from-amber-50 via-emerald-50/60 to-sky-50 dark:from-zinc-800 dark:to-zinc-800/60 border border-emerald-200/80 dark:border-emerald-800/40 shadow-sm flex flex-col sm:flex-row gap-5 items-center sm:items-start">
              <BookCover book={pick} size="lg" />
              <div className="flex-1 text-center sm:text-left">
                <span className="text-xs font-bold tracking-wider text-emerald-700 dark:text-emerald-400">
                  🌸 마음버블이 고른 오늘의 한 권
                </span>
                <h3 className="mt-1 text-xl font-extrabold text-stone-900 dark:text-stone-100">
                  『{pick.title}』
                </h3>
                <p className="text-sm text-stone-500 dark:text-stone-400">{pick.author}</p>
                <p className="mt-3 text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                  {pick.note}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <a
                    href={getBookStoreUrl(pick)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    서점에서 보기
                  </a>
                  <button
                    type="button"
                    onClick={() => handleShare(pick)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-zinc-700 border border-emerald-200 dark:border-zinc-600 text-emerald-800 dark:text-emerald-200 text-xs font-semibold hover:bg-emerald-50 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    친구에게 추천
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 책 목록 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 flex items-center gap-1.5">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              {activeCategory === 'all' ? '전체 서가' : getCategoryLabel(activeCategory, 'ko')}
              <span className="text-sm font-medium text-stone-400">({visible.length})</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowLikedOnly((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                showLikedOnly
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'bg-white/80 dark:bg-zinc-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-zinc-700 hover:bg-rose-50'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${showLikedOnly ? 'fill-white' : ''}`} />
              내 책갈피 {liked.length > 0 && `(${liked.length})`}
            </button>
          </div>

          {visible.length === 0 ? (
            <div className="py-16 rounded-3xl border-2 border-dashed border-emerald-200/60 dark:border-zinc-800 text-center bg-white/40 dark:bg-zinc-900/40">
              <p className="text-3xl mb-2">🔖</p>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                아직 책갈피에 담은 책이 없어요. 마음에 드는 책의 하트를 눌러 보세요.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {visible.map((book) => (
                <article
                  key={book.id}
                  className="group flex gap-4 p-4 rounded-3xl bg-white/80 dark:bg-zinc-900/80 border border-emerald-100/80 dark:border-zinc-800 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all backdrop-blur-sm"
                >
                  <BookCover book={book} />
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-bold text-stone-900 dark:text-stone-100 leading-snug">
                          {book.title}
                        </h4>
                        <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                          {book.author}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleLike(book.id)}
                        aria-label={liked.includes(book.id) ? '책갈피에서 빼기' : '책갈피에 담기'}
                        className="shrink-0 p-1.5 rounded-full hover:bg-rose-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            liked.includes(book.id) ? 'fill-rose-500 text-rose-500' : 'text-stone-300'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="mt-2 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                      {book.mood}
                    </p>
                    <p className="mt-1 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      {book.note}
                    </p>
                    <a
                      href={getBookStoreUrl(book)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto pt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline"
                    >
                      서점에서 보기 <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="w-full border-t border-emerald-100/80 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-md py-6 px-4 mt-12 text-center">
        <p className="text-xs text-stone-600 dark:text-stone-400 font-medium">
          📚 마음버블서점은 마음 버블이 직접 고른 위로의 책들을 소개해요.
        </p>
        <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
          서점 링크는 교보문고 검색 결과로 연결돼요.
        </p>
      </footer>
      <BottomNav />
    </div>
  )
}

function CategoryChip({
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
      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
        active
          ? 'bg-emerald-600 text-white shadow-xs'
          : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-zinc-700'
      }`}
    >
      {children}
    </button>
  )
}

/** 실제 표지 이미지 대신 쓰는 파스텔 책 표지 */
function BookCover({ book, size = 'md' }: { book: Book; size?: 'md' | 'lg' }) {
  const dims = size === 'lg' ? 'w-28 h-40' : 'w-20 h-28'
  return (
    <div
      className={`${dims} shrink-0 rounded-r-xl rounded-l-sm bg-gradient-to-br ${book.cover} shadow-md relative overflow-hidden flex flex-col items-center justify-center p-2 text-center`}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-black/10" />
      <span className={size === 'lg' ? 'text-4xl' : 'text-2xl'}>{book.emoji}</span>
      <span
        className={`mt-1 font-bold text-white drop-shadow-sm leading-tight ${
          size === 'lg' ? 'text-xs' : 'text-[10px]'
        } line-clamp-3`}
      >
        {book.title}
      </span>
    </div>
  )
}
