import { createFileRoute, Link } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Database,
  Keyboard,
  Lock,
  LogOut,
  MessageSquareHeart,
  RefreshCw,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import { ThemeToggle } from '../components/ThemeToggle'
import { BOOKS } from '../lib/books'
import { COMFORT_AFFIRMATIONS, STRESS_CATEGORIES, getCategoryLabel } from '../lib/affirmations'
import { TYPING_PHRASES } from '../lib/typing-phrases'
import {
  decryptWorry,
  deriveAuthToken,
  getWorryKeyConfig,
  unlockPrivateKey,
  type WorryEnvelope,
} from '../lib/worryCrypto'

const WORRY_KEY_CONFIG = getWorryKeyConfig()

export const Route = createFileRoute('/admin')({
  head: () => ({
    meta: [
      { title: '관리자 | 마음 버블' },
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: AdminPage,
})

const PW_KEY = 'mind_bubble_admin_pw'

// 정적 테스트 버전(npm run build:static)에서는 서버가 없어서,
// 빌드할 때 넣어 둔 비밀번호 해시와 브라우저에서 비교해요.
declare const __STATIC_ADMIN_HASH__: string | undefined
const IS_STATIC = import.meta.env.VITE_STATIC_BUILD === '1'
const STATIC_HASH = typeof __STATIC_ADMIN_HASH__ !== 'undefined' ? __STATIC_ADMIN_HASH__ : ''

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

interface StatsResponse {
  ok: boolean
  static?: boolean
  db?: boolean
  error?: string
  message?: string
  counter?: number | null
  counterUpdatedAt?: string | null
  recordedTotal?: number
  byCategory?: { category: string; count: number }[]
  daily?: { day: string; count: number }[]
  recent?: { id: number; category: string; encouragement: string; createdAt: string | null }[]
}

type LoadState = 'idle' | 'loading' | 'ready' | 'error'

function AdminPage() {
  const [password, setPassword] = useState('')
  const [input, setInput] = useState('')
  const [state, setState] = useState<LoadState>('idle')
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [errorText, setErrorText] = useState('')
  const [loadedAt, setLoadedAt] = useState<Date | null>(null)

  const load = useCallback(async (pw: string) => {
    setState('loading')
    setErrorText('')

    if (IS_STATIC) {
      if (!STATIC_HASH) {
        setState('error')
        setErrorText('테스트 버전에 관리자 비밀번호가 설정되지 않았어요.')
        return
      }
      let match = false
      try {
        match = (await sha256Hex(pw)) === STATIC_HASH
      } catch {
        match = false
      }
      if (!match) {
        setState('error')
        setErrorText('비밀번호가 맞지 않아요.')
        setPassword('')
        try {
          sessionStorage.removeItem(PW_KEY)
        } catch {}
        return
      }
      setStats({ ok: true, static: true, db: false })
      setPassword(pw)
      setLoadedAt(new Date())
      setState('ready')
      try {
        sessionStorage.setItem(PW_KEY, pw)
      } catch {}
      return
    }

    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${pw}` },
        cache: 'no-store',
      })
      if (res.status === 401) {
        setState('error')
        setErrorText('비밀번호가 맞지 않아요.')
        setPassword('')
        try {
          sessionStorage.removeItem(PW_KEY)
        } catch {}
        return
      }
      if (res.status === 503) {
        setState('error')
        setErrorText('서버에 관리자 비밀번호(ADMIN_PASSWORD)가 아직 설정되지 않았어요.')
        return
      }
      if (!res.ok) {
        setState('error')
        setErrorText(
          res.status === 404
            ? '관리자 API를 찾을 수 없어요. 서버 없이 올린 정적 테스트 버전에서는 관리자 페이지가 작동하지 않아요.'
            : `서버 오류가 났어요 (${res.status}).`,
        )
        return
      }
      const data = (await res.json()) as StatsResponse
      setStats(data)
      setPassword(pw)
      setLoadedAt(new Date())
      setState('ready')
      try {
        sessionStorage.setItem(PW_KEY, pw)
      } catch {}
    } catch {
      setState('error')
      setErrorText('서버에 연결할 수 없어요. 인터넷 연결이나 서버 상태를 확인해 주세요.')
    }
  }, [])

  // 같은 탭에서 새로고침하면 다시 로그인하지 않아도 되게
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(PW_KEY)
      if (saved) load(saved)
    } catch {}
  }, [load])

  const logout = () => {
    try {
      sessionStorage.removeItem(PW_KEY)
    } catch {}
    setPassword('')
    setStats(null)
    setState('idle')
    setInput('')
  }

  const loggedIn = !!password && !!stats

  return (
    <div className="min-h-screen pb-12">
      <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link
            to="/"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-300"
            aria-label="홈으로"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-[#ecdfb0] bg-gradient-to-tr from-[#f6ecc9] to-[#fdf8e4] text-lg">
            🍀
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold text-stone-800 dark:text-stone-100">
              마음 버블 관리자
            </h1>
            <p className="truncate text-xs text-stone-500 dark:text-stone-400">대시보드 · 콘텐츠 현황</p>
          </div>
          {loggedIn && (
            <>
              <button
                type="button"
                onClick={() => load(password)}
                className="flex h-9 items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-600 hover:bg-stone-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-300"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${state === 'loading' ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">새로고침</span>
              </button>
              <button
                type="button"
                onClick={logout}
                className="flex h-9 items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-600 hover:bg-stone-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-300"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">로그아웃</span>
              </button>
            </>
          )}
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-6">
        {!loggedIn ? (
          <LoginCard
            input={input}
            setInput={setInput}
            loading={state === 'loading'}
            errorText={errorText}
            onSubmit={() => input && load(input)}
          />
        ) : (
          <Dashboard stats={stats!} loadedAt={loadedAt} password={password} />
        )}
      </main>
    </div>
  )
}

function LoginCard({
  input,
  setInput,
  loading,
  errorText,
  onSubmit,
}: {
  input: string
  setInput: (v: string) => void
  loading: boolean
  errorText: string
  onSubmit: () => void
}) {
  return (
    <div className="mx-auto mt-10 max-w-sm rounded-3xl border border-stone-200 bg-white/90 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90">
      <div className="mb-4 flex items-center gap-2">
        <Lock className="h-5 w-5 text-emerald-600" />
        <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100">관리자 로그인</h2>
      </div>
      <p className="mb-4 text-sm text-stone-500 break-keep dark:text-stone-400">
        관리자 비밀번호를 입력해 주세요.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
        className="space-y-3"
      >
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="비밀번호"
          autoComplete="current-password"
          className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
        />
        <button
          type="submit"
          disabled={loading || !input}
          className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-bold text-white shadow-sm disabled:opacity-50"
        >
          {loading ? '확인 중…' : '들어가기'}
        </button>
      </form>
      {errorText && (
        <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700 break-keep dark:bg-rose-950/50 dark:text-rose-300">
          {errorText}
        </p>
      )}
    </div>
  )
}

function Dashboard({
  stats,
  loadedAt,
  password,
}: {
  stats: StatsResponse
  loadedAt: Date | null
  password: string
}) {
  return (
    <div className="space-y-6">
      {stats.static && (
        <div className="flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800 dark:border-sky-800/60 dark:bg-sky-950/40 dark:text-sky-200">
          <Database className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="break-keep">
            테스트 버전 관리자 페이지예요. 방문자 통계는 모이지 않고, 방문자가 동의하고 보낸 고민과 콘텐츠 현황,
            이 기기 기록을 볼 수 있어요.
          </p>
        </div>
      )}

      {!stats.db && !stats.static && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200">
          <Database className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="break-keep">
            데이터베이스에 연결되지 않아 방문자 통계를 불러오지 못했어요. Netlify에 올린 실제 사이트에서는 자동으로
            연결돼요. 아래 콘텐츠 현황과 이 기기 기록은 그대로 볼 수 있어요.
          </p>
        </div>
      )}

      {stats.static && WORRY_KEY_CONFIG && <WorriesSection password={password} />}
      {stats.db && <UsageSection stats={stats} />}
      <ContentSection />
      <DeviceSection />

      {loadedAt && (
        <p className="text-center text-xs text-stone-400">
          마지막 불러온 시각 {loadedAt.toLocaleString('ko-KR')}
        </p>
      )}
    </div>
  )
}

/* ---------------- 방문자가 보낸 고민 (테스트 버전, 암호화) ---------------- */

interface OpenedWorry {
  id: string
  at: string
  text: string
  category: string
  lang: string
  broken?: boolean
}

function WorriesSection({ password }: { password: string }) {
  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [items, setItems] = useState<OpenedWorry[]>([])
  const [token, setToken] = useState('')
  const [busyId, setBusyId] = useState('')

  const fetchAll = useCallback(async () => {
    if (!WORRY_KEY_CONFIG) return
    setPhase('loading')
    setMessage('')
    try {
      const [authToken, privateKey] = await Promise.all([
        deriveAuthToken(password, WORRY_KEY_CONFIG),
        unlockPrivateKey(password, WORRY_KEY_CONFIG),
      ])
      setToken(authToken)
      const res = await fetch('/api/admin/worries', {
        headers: { Authorization: `Bearer ${authToken}` },
        cache: 'no-store',
      })
      if (res.status === 404 || (res.headers.get('content-type') || '').includes('text/html')) {
        setPhase('error')
        setMessage('고민 저장 기능이 없는 방식으로 올라가 있어요. 폴더 끌어다 놓기 대신 배포 명령으로 올려야 해요.')
        return
      }
      if (res.status === 401) {
        setPhase('error')
        setMessage('서버의 관리자 확인값과 비밀번호가 맞지 않아요.')
        return
      }
      if (res.status === 503) {
        setPhase('error')
        setMessage('서버에 고민 저장소(WORRIES)가 연결되지 않았어요.')
        return
      }
      if (!res.ok) throw new Error(String(res.status))
      const data = (await res.json()) as { items: { id: string; at: string; envelope: WorryEnvelope }[] }
      const opened = await Promise.all(
        data.items.map(async (it): Promise<OpenedWorry> => {
          try {
            const p = await decryptWorry(privateKey, it.envelope)
            return { id: it.id, at: it.at, text: String(p.text ?? ''), category: String(p.category ?? ''), lang: String(p.lang ?? '') }
          } catch {
            return { id: it.id, at: it.at, text: '', category: '', lang: '', broken: true }
          }
        }),
      )
      setItems(opened)
      setPhase('ready')
    } catch {
      setPhase('error')
      setMessage('고민 목록을 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요.')
    }
  }, [password])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const remove = async (id: string | 'all') => {
    if (id === 'all' && !window.confirm('모은 고민을 모두 지울까요? 지운 고민은 되살릴 수 없어요.')) return
    if (id !== 'all' && !window.confirm('이 고민을 지울까요? 되살릴 수 없어요.')) return
    setBusyId(id)
    try {
      const q = id === 'all' ? 'all=1' : `id=${encodeURIComponent(id)}`
      const res = await fetch(`/api/admin/worries?${q}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(String(res.status))
      setItems((prev) => (id === 'all' ? [] : prev.filter((w) => w.id !== id)))
    } catch {
      window.alert('지우지 못했어요. 잠시 뒤 다시 시도해 주세요.')
    } finally {
      setBusyId('')
    }
  }

  return (
    <section className="space-y-4">
      <SectionTitle icon={<ShieldCheck className="h-4 w-4" />} title="방문자가 보낸 고민 (관리자만 보기)" />
      <Card>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-stone-400 break-keep">
            방문자가 동의한 고민만 암호화돼서 모여요. 이 화면에서 관리자 비밀번호로만 열려요. 30일 뒤 자동으로 지워져요.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={fetchAll}
              className="flex items-center gap-1 rounded-full border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-50 dark:border-zinc-700 dark:text-stone-300 dark:hover:bg-zinc-800"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${phase === 'loading' ? 'animate-spin' : ''}`} />
              다시 불러오기
            </button>
            {items.length > 0 && (
              <button
                type="button"
                onClick={() => remove('all')}
                disabled={!!busyId}
                className="flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:border-rose-800/60 dark:text-rose-300 dark:hover:bg-rose-950/40"
              >
                <Trash2 className="h-3.5 w-3.5" />
                모두 지우기
              </button>
            )}
          </div>
        </div>

        {phase === 'loading' && <Empty text="열쇠를 풀고 고민을 여는 중이에요…" />}
        {phase === 'error' && (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800 break-keep dark:bg-amber-950/40 dark:text-amber-200">
            {message}
          </p>
        )}
        {phase === 'ready' && items.length === 0 && <Empty text="아직 받은 고민이 없어요." />}
        {phase === 'ready' && items.length > 0 && (
          <>
            <p className="mb-2 text-xs font-semibold text-stone-500">{items.length}개</p>
            <ul className="divide-y divide-stone-100 dark:divide-zinc-800">
              {items.map((w) => (
                <li key={w.id} className="flex items-start gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] text-stone-400">
                        {w.at ? new Date(w.at).toLocaleString('ko-KR') : '-'}
                      </span>
                      {w.category && (
                        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-600 dark:bg-zinc-800 dark:text-stone-300">
                          {getCategoryLabel(w.category, 'ko')}
                        </span>
                      )}
                      {w.lang === 'en' && <span className="text-[10px] text-stone-400">EN</span>}
                    </div>
                    {w.broken ? (
                      <p className="text-sm text-rose-500">이 고민은 열 수 없어요 (다른 열쇠로 잠긴 글).</p>
                    ) : (
                      <p className="whitespace-pre-wrap break-words text-sm text-stone-800 dark:text-stone-100">{w.text}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(w.id)}
                    disabled={!!busyId}
                    aria-label="이 고민 지우기"
                    className="shrink-0 rounded-full p-2 text-stone-400 hover:bg-rose-50 hover:text-rose-500 disabled:opacity-50 dark:hover:bg-rose-950/40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </section>
  )
}

/* ---------------- 방문자 이용 통계 ---------------- */

function lastDays(n: number): string[] {
  const out: string[] = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i))
    out.push(d.toISOString().slice(0, 10))
  }
  return out
}

function UsageSection({ stats }: { stats: StatsResponse }) {
  const days = useMemo(() => {
    const map = new Map((stats.daily ?? []).map((d) => [d.day, Number(d.count)]))
    return lastDays(14).map((day) => ({ day, count: map.get(day) ?? 0 }))
  }, [stats.daily])

  const today = days[days.length - 1]?.count ?? 0
  const week = days.slice(-7).reduce((s, d) => s + d.count, 0)
  const maxDay = Math.max(1, ...days.map((d) => d.count))
  const categories = stats.byCategory ?? []
  const maxCat = Math.max(1, ...categories.map((c) => Number(c.count)))

  return (
    <section className="space-y-4">
      <SectionTitle icon={<BarChart3 className="h-4 w-4" />} title="방문자 이용 통계" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="오늘 터뜨린 버블" value={today} />
        <Kpi label="최근 7일" value={week} />
        <Kpi label="전체 기록" value={stats.recordedTotal ?? 0} hint="위로 문장을 받은 횟수" />
        <Kpi
          label="첫 화면 표시 숫자"
          value={stats.counter ?? 1842}
          hint="함께한 사람 수 (시작값 1842 포함)"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <h3 className="mb-4 text-sm font-bold text-stone-700 dark:text-stone-200">최근 14일 버블 터뜨리기</h3>
          <div className="flex h-40 items-end gap-1.5">
            {days.map((d) => (
              <div key={d.day} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span className="text-[10px] font-semibold text-stone-500">{d.count || ''}</span>
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-emerald-400 to-teal-300 dark:from-emerald-600 dark:to-teal-500"
                  style={{ height: `${Math.max(2, (d.count / maxDay) * 100)}%` }}
                  title={`${d.day}: ${d.count}회`}
                />
                <span className="text-[9px] text-stone-400">{d.day.slice(8)}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-stone-400">날짜는 세계 표준시(UTC) 기준이에요.</p>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="mb-4 text-sm font-bold text-stone-700 dark:text-stone-200">고민 분류별</h3>
          {categories.length === 0 ? (
            <Empty text="아직 기록이 없어요." />
          ) : (
            <ul className="space-y-2.5">
              {categories.map((c) => (
                <li key={c.category}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-semibold text-stone-700 dark:text-stone-200">{c.category}</span>
                    <span className="text-stone-500">{Number(c.count)}회</span>
                  </div>
                  <div className="h-2 rounded-full bg-stone-100 dark:bg-zinc-800">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400"
                      style={{ width: `${(Number(c.count) / maxCat) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <h3 className="mb-3 text-sm font-bold text-stone-700 dark:text-stone-200">최근 기록 20개</h3>
        <p className="mb-3 text-[11px] text-stone-400 break-keep">
          방문자가 적은 고민 내용은 저장하지 않아요. 고민 분류와 그때 받은 위로 문장만 익명으로 남아요.
        </p>
        {(stats.recent ?? []).length === 0 ? (
          <Empty text="아직 기록이 없어요." />
        ) : (
          <ul className="divide-y divide-stone-100 dark:divide-zinc-800">
            {stats.recent!.map((r) => (
              <li key={r.id} className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-center sm:gap-3">
                <span className="w-32 shrink-0 text-[11px] text-stone-400">
                  {r.createdAt ? new Date(r.createdAt).toLocaleString('ko-KR') : '-'}
                </span>
                <span className="w-fit shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-600 dark:bg-zinc-800 dark:text-stone-300">
                  {r.category}
                </span>
                <span className="text-sm text-stone-700 break-keep dark:text-stone-200">{r.encouragement}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  )
}

/* ---------------- 콘텐츠 현황 ---------------- */

function ContentSection() {
  const rows = STRESS_CATEGORIES.map((cat) => ({
    id: cat.id,
    label: getCategoryLabel(cat.id, 'ko'),
    books: BOOKS.filter((b) => b.category === cat.id).length,
    affirmations: COMFORT_AFFIRMATIONS.filter((a) => a.category === cat.id).length,
  }))
  const generalAffirmations = COMFORT_AFFIRMATIONS.filter((a) => !a.category).length

  return (
    <section className="space-y-4">
      <SectionTitle icon={<Sparkles className="h-4 w-4" />} title="콘텐츠 현황" />

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Kpi label="서점 책" value={BOOKS.length} icon={<BookOpen className="h-4 w-4" />} />
        <Kpi
          label="위로 카드 문장"
          value={COMFORT_AFFIRMATIONS.length}
          icon={<MessageSquareHeart className="h-4 w-4" />}
        />
        <Kpi label="타이핑 문장" value={TYPING_PHRASES.length} icon={<Keyboard className="h-4 w-4" />} />
      </div>

      <Card>
        <h3 className="mb-3 text-sm font-bold text-stone-700 dark:text-stone-200">분류별 콘텐츠 수</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-left text-xs text-stone-500 dark:border-zinc-800">
                <th className="py-2 font-semibold">분류</th>
                <th className="py-2 text-right font-semibold">책</th>
                <th className="py-2 text-right font-semibold">위로 문장</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-stone-50 dark:border-zinc-800/60">
                  <td className="py-2 text-stone-700 dark:text-stone-200">{r.label}</td>
                  <td className={`py-2 text-right ${r.books < 3 ? 'font-bold text-rose-500' : 'text-stone-600 dark:text-stone-300'}`}>
                    {r.books}
                  </td>
                  <td className={`py-2 text-right ${r.affirmations < 3 ? 'font-bold text-rose-500' : 'text-stone-600 dark:text-stone-300'}`}>
                    {r.affirmations}
                  </td>
                </tr>
              ))}
              <tr>
                <td className="py-2 text-stone-500">공통 (분류 없음)</td>
                <td className="py-2 text-right text-stone-400">-</td>
                <td className="py-2 text-right text-stone-600 dark:text-stone-300">{generalAffirmations}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-stone-400 break-keep">
          빨간 숫자는 3개보다 적은 분류예요. 책이나 문장을 보충하면 좋아요.
        </p>
      </Card>
    </section>
  )
}

/* ---------------- 이 기기 기록 ---------------- */

function DeviceSection() {
  const [device, setDevice] = useState<{ label: string; value: string }[]>([])

  useEffect(() => {
    const read = (k: string) => {
      try {
        return localStorage.getItem(k)
      } catch {
        return null
      }
    }
    const listLen = (k: string) => {
      try {
        const v = JSON.parse(read(k) || '[]')
        return Array.isArray(v) ? v.length : 0
      } catch {
        return 0
      }
    }
    setDevice([
      { label: '뽁뽁이 누적', value: `${Number(read('mind_bubble_wrap_total') || 0)}개` },
      { label: '걱정 버블 최고 점수', value: `${Number(read('mind_bubble_game_best') || 0)}점` },
      { label: '서점 책갈피', value: `${listLen('mind_bubble_liked_books')}권` },
      { label: '화면 모드', value: read('mind_bubble_theme') === 'dark' ? '다크' : '라이트' },
    ])
  }, [])

  return (
    <section className="space-y-4">
      <SectionTitle icon={<Smartphone className="h-4 w-4" />} title="이 기기 기록" />
      <Card>
        <p className="mb-3 text-[11px] text-stone-400 break-keep">
          지금 이 브라우저에만 저장된 기록이에요. 다른 방문자의 기록은 볼 수 없어요.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {device.map((d) => (
            <div key={d.label} className="rounded-2xl bg-stone-50 px-3 py-2.5 dark:bg-zinc-800/60">
              <p className="text-[11px] text-stone-500">{d.label}</p>
              <p className="text-base font-bold text-stone-800 dark:text-stone-100">{d.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </section>
  )
}

/* ---------------- 작은 공용 조각 ---------------- */

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">
      {icon}
      {title}
    </h2>
  )
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl border border-stone-200/80 bg-white/90 p-4 shadow-sm sm:p-5 dark:border-zinc-800 dark:bg-zinc-900/80 ${className}`}
    >
      {children}
    </div>
  )
}

function Kpi({
  label,
  value,
  hint,
  icon,
}: {
  label: string
  value: number
  hint?: string
  icon?: ReactNode
}) {
  return (
    <div className="min-w-0 rounded-3xl border border-stone-200/80 bg-white/90 px-3 py-3 shadow-sm sm:px-4 sm:py-3.5 dark:border-zinc-800 dark:bg-zinc-900/80">
      <p className="flex items-center gap-1 text-[11px] text-stone-500 break-keep sm:gap-1.5 sm:text-xs dark:text-stone-400">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-stone-800 tabular-nums dark:text-stone-100">
        {value.toLocaleString('ko-KR')}
      </p>
      {hint && <p className="mt-0.5 text-[10px] text-stone-400 break-keep">{hint}</p>}
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return <p className="py-6 text-center text-sm text-stone-400">{text}</p>
}
