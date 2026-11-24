import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export const THEME_KEY = 'mind_bubble_theme'

/** 페이지가 그려지기 전에 저장된 테마를 먼저 적용하는 짧은 스크립트 (__root.tsx 에서 사용) */
export const themeInitScript = `try{if(localStorage.getItem('${THEME_KEY}')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}`

/** 밝은 화면 / 어두운 화면 전환 버튼 */
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggle = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem(THEME_KEY, next ? 'dark' : 'light')
    } catch {}
  }

  const label = isDark ? '밝은 화면으로 / Light mode' : '어두운 화면으로 / Dark mode'

  return (
    <button
      type="button"
      onClick={toggle}
      title={label}
      aria-label={label}
      className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-white/80 dark:bg-zinc-800/80 border border-emerald-100 dark:border-zinc-700 text-stone-600 dark:text-amber-300 hover:bg-emerald-50 dark:hover:bg-zinc-700 transition-all shadow-xs"
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  )
}
