import { useEffect, useState } from 'react'
import type { Language } from './i18n'

// 홈에서 고른 언어(한국어/English)를 하위 화면(미니게임·타이핑·처리방침 등)도 똑같이 따라가요.
// 홈은 localStorage 'mind_bubble_lang'에 언어를 저장해요. 서버에서 미리 만든 화면은 한국어로 시작하고,
// 브라우저에서 저장된 언어를 읽어 바로 바꿔요.
export const LANG_KEY = 'mind_bubble_lang'

export function readLang(): Language {
  try {
    return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'ko'
  } catch {
    return 'ko'
  }
}

export function useLang(): Language {
  const [lang, setLang] = useState<Language>('ko')
  useEffect(() => {
    const apply = () => {
      const next = readLang()
      setLang(next)
      try {
        document.documentElement.lang = next
      } catch {}
    }
    apply()
    const onStorage = (e: StorageEvent) => {
      if (e.key === LANG_KEY) apply()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])
  return lang
}

/** 한국어·영어 문장 중 지금 언어에 맞는 쪽을 골라요: tr(lang, '안녕', 'Hello') */
export function tr<T>(lang: Language, ko: T, en: T): T {
  return lang === 'en' ? en : ko
}
