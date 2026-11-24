import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { NAV_ITEMS } from './BottomNav'
import { ThemeToggle } from './ThemeToggle'

interface SubPageHeaderProps {
  emoji: string
  title: string
  right?: React.ReactNode
}

/** 미니게임·타이핑·서점 같은 하위 페이지에서 함께 쓰는 상단 바 */
export function SubPageHeader({ emoji, title, right }: SubPageHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 dark:bg-zinc-950/70 border-b border-emerald-100/80 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            to="/"
            aria-label="마음 버블 홈으로"
            className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-white/80 dark:bg-zinc-800/80 border border-emerald-100 dark:border-zinc-700 text-stone-700 dark:text-stone-200 hover:bg-emerald-50 dark:hover:bg-zinc-700 transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="w-9 h-9 shrink-0 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white text-lg select-none shadow-xs">
            {emoji}
          </span>
          <h1 className="text-base md:text-lg font-bold text-stone-900 dark:text-stone-100 truncate">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* 넓은 화면에서는 위쪽에 메뉴를 보여 줘요 (휴대폰은 아래 탭 메뉴) */}
          <nav aria-label="주요 메뉴" className="hidden md:flex items-center gap-1 mr-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: true }}
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-zinc-800 transition-colors"
                activeProps={{
                  className: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300',
                }}
              >
                {item.ko}
              </Link>
            ))}
          </nav>
          {right}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
