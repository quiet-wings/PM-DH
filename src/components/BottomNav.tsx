import { Link } from '@tanstack/react-router'
import { BookOpen, Gamepad2, Home, Keyboard } from 'lucide-react'
import { Language } from '../lib/i18n'

export const NAV_ITEMS = [
  { to: '/', ko: '홈', en: 'Home', icon: Home },
  { to: '/game', ko: '게임', en: 'Games', icon: Gamepad2 },
  { to: '/typing', ko: '타이핑', en: 'Typing', icon: Keyboard },
  { to: '/books', ko: '서점', en: 'Books', icon: BookOpen },
] as const

/** 휴대폰 화면 아래에 고정되는 탭 메뉴 (넓은 화면에서는 숨겨요) */
export function BottomNav({ lang = 'ko' }: { lang?: Language }) {
  return (
    <nav
      aria-label={lang === 'en' ? 'Main menu' : '주요 메뉴'}
      className="md:hidden fixed bottom-0 inset-x-0 z-40 backdrop-blur-md bg-white/85 dark:bg-zinc-950/85 border-t border-emerald-100/80 dark:border-zinc-800 pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                activeOptions={{ exact: true }}
                className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold text-stone-500 dark:text-stone-400 transition-colors"
                activeProps={{
                  className: 'text-emerald-700 dark:text-emerald-300',
                }}
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`flex items-center justify-center w-12 h-7 rounded-full transition-colors ${
                        isActive ? 'bg-emerald-100 dark:bg-emerald-950' : ''
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </span>
                    <span>{lang === 'en' ? item.en : item.ko}</span>
                  </>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
