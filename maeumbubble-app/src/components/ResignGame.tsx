import { useState } from 'react'
import { RotateCcw, Send } from 'lucide-react'
import { soundManager } from '../lib/sound'
import { triggerBreezeCelebration } from '../lib/confetti'
import { useLang, tr } from '../lib/useLang'
import type { Language } from '../lib/i18n'

/* ───────────────── 📝 퇴사할게요 (가상 사직서) ─────────────────
 * 실제 사직서 양식(소속·직위·성명·입사일·퇴사 희망일·사유·제출일·수신)을 단순하게 옮겼어요.
 * 인수인계·비밀유지 같은 복잡한 문구는 뺐어요.
 * 적은 내용은 이 화면에만 있고 어디에도 저장·전송하지 않아요.
 */

const STAMP_LAND_SEC = 0.25

export const RESIGN_REASONS = ['개인 사정', '쉼이 필요해서', '새로운 도전', '건강 관리'] as const
const RESIGN_REASONS_EN = ['Personal reasons', 'I need a break', 'A new challenge', 'My health']

const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function fmtDate(y: number, m: number, d: number, lang: Language) {
  return lang === 'en' ? `${MONTHS_EN[m - 1]} ${d}, ${y}` : `${y}년 ${m}월 ${d}일`
}

function todayLabel(lang: Language, d = new Date()) {
  return fmtDate(d.getFullYear(), d.getMonth() + 1, d.getDate(), lang)
}

function dateLabel(v: string, lang: Language) {
  if (!v) return lang === 'en' ? '________, ____' : '____년 __월 __일'
  const [y, m, d] = v.split('-').map(Number)
  return fmtDate(y, m, d, lang)
}

const inputClass =
  'w-full min-w-0 bg-transparent border-b border-dashed border-stone-300 dark:border-zinc-600 px-1 py-1 text-sm text-stone-800 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 disabled:opacity-80'

function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <>
      <div className="py-2.5 pr-2 border-b border-stone-300 dark:border-zinc-700 font-semibold text-stone-600 dark:text-stone-300 break-keep self-stretch flex items-start pt-3.5">
        {label}
      </div>
      <div className={`py-2 pr-2 border-b border-stone-300 dark:border-zinc-700 min-w-0 ${wide ? 'sm:col-span-3' : ''}`}>{children}</div>
    </>
  )
}

export function ResignGame() {
  const lang = useLang()
  const [dept, setDept] = useState('')
  const [title, setTitle] = useState('')
  const [name, setName] = useState('')
  const [joined, setJoined] = useState('')
  const [leaving, setLeaving] = useState('')
  const [reason, setReason] = useState<string>(RESIGN_REASONS[0])
  const [reasonText, setReasonText] = useState('')
  const [company, setCompany] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (submitted) return
    setSubmitted(true)
    // 도장이 커졌다가 종이에 닿는 순간(약 0.25초)에 "쾅", 이어서 축하 꽃가루
    soundManager.playStampSound(STAMP_LAND_SEC)
    window.setTimeout(() => {
      soundManager.playBreezeSound()
      triggerBreezeCelebration()
    }, 700)
  }

  const reset = () => {
    setDept('')
    setTitle('')
    setName('')
    setJoined('')
    setLeaving('')
    setReason(RESIGN_REASONS[0])
    setReasonText('')
    setCompany('')
    setSubmitted(false)
  }

  const shownName = name.trim() || tr(lang, '마음버블러', 'Bubble Friend')

  return (
    <section className="bg-white/80 dark:bg-zinc-900/80 border border-emerald-100 dark:border-zinc-800 rounded-3xl p-4 md:p-6 shadow-xl backdrop-blur-md">
      <p className="text-center text-xs text-stone-500 dark:text-stone-400 mb-4">
        {tr(lang, '진짜로 내는 건 아니에요. 마음속 사직서를 한 번 써 보고, 시원하게 제출해 보세요.', "It's not for real. Write the resignation letter in your heart and hand it in with a big sigh of relief.")}
      </p>

      <form onSubmit={submit} aria-label={tr(lang, '가상 사직서', 'Pretend resignation letter')}>
        {/* 종이 */}
        <div className="relative mx-auto max-w-xl rounded-2xl bg-[#fffdf7] dark:bg-zinc-950 border border-stone-200 dark:border-zinc-700 shadow-md px-5 py-7 md:px-9 md:py-9">
          <h3 className={`text-center text-2xl md:text-3xl font-extrabold text-stone-800 dark:text-stone-100 ${lang === 'en' ? 'tracking-[0.2em] uppercase' : 'tracking-[0.6em] pl-[0.6em]'}`}>
            {tr(lang, '사직서', 'Resignation')}
          </h3>

          {/* 휴대폰: 한 줄에 한 항목 / 넓은 화면: 두 항목씩 */}
          <div className="mt-6 grid grid-cols-[4.5rem_1fr] sm:grid-cols-[4.5rem_1fr_4.5rem_1fr] border-t border-stone-300 dark:border-zinc-700 text-sm">
            <Field label={tr(lang, '소속', 'Team')}>
              <input aria-label={tr(lang, '소속', 'Team')} className={inputClass} value={dept} onChange={(e) => setDept(e.target.value)} placeholder={tr(lang, '예: 마음팀', 'e.g. Mind Team')} maxLength={30} disabled={submitted} />
            </Field>
            <Field label={tr(lang, '직위', 'Title')}>
              <input aria-label={tr(lang, '직위', 'Title')} className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={tr(lang, '예: 사원', 'e.g. Staff')} maxLength={20} disabled={submitted} />
            </Field>
            <Field label={tr(lang, '성명', 'Name')} wide>
              <input aria-label={tr(lang, '성명', 'Name')} className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder={tr(lang, '이름 또는 별명', 'Name or nickname')} maxLength={20} disabled={submitted} />
            </Field>
            <Field label={tr(lang, '입사일', 'Start date')}>
              <input aria-label={tr(lang, '입사일', 'Start date')} type="date" className={inputClass} value={joined} onChange={(e) => setJoined(e.target.value)} disabled={submitted} />
            </Field>
            <Field label={tr(lang, '퇴사 희망일', 'Last day')}>
              <input aria-label={tr(lang, '퇴사 희망일', 'Last day')} type="date" className={inputClass} value={leaving} onChange={(e) => setLeaving(e.target.value)} disabled={submitted} />
            </Field>
            <Field label={tr(lang, '사직 사유', 'Reason')} wide>
              <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={tr(lang, '사직 사유', 'Reason')}>
                {RESIGN_REASONS.map((r, i) => (
                  <button
                    key={r}
                    type="button"
                    role="radio"
                    aria-checked={reason === r}
                    disabled={submitted}
                    onClick={() => setReason(r)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                      reason === r
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-stone-300 hover:border-emerald-400'
                    }`}
                  >
                    {tr(lang, r, RESIGN_REASONS_EN[i])}
                  </button>
                ))}
              </div>
              <input
                aria-label={tr(lang, '사직 사유 직접 쓰기', 'Write your own reason')}
                className={`${inputClass} mt-2`}
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
                placeholder={tr(lang, '하고 싶은 말이 있다면 한 줄로 (선택)', 'Anything you want to say, in one line (optional)')}
                maxLength={60}
                disabled={submitted}
              />
            </Field>
          </div>

          <p className="mt-6 text-center text-sm md:text-base leading-relaxed text-stone-700 dark:text-stone-200">
            {lang === 'en' ? (
              <>
                For the reason above, I wish to resign
                <br />
                as of {dateLabel(leaving, lang)}. Thank you for your understanding.
              </>
            ) : (
              <>
                위와 같은 사유로 {dateLabel(leaving, lang)}자로
                <br />
                사직하고자 하오니 허락해 주시기 바랍니다.
              </>
            )}
          </p>

          <p className="mt-6 text-center text-sm text-stone-600 dark:text-stone-300">{todayLabel(lang)}</p>

          <p className="mt-3 text-right text-sm text-stone-700 dark:text-stone-200">
            {tr(lang, '제출자', 'Signed,')} <span className="font-bold">{shownName}</span>{' '}
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-rose-400 text-rose-500 text-[11px] font-bold align-middle">
              {tr(lang, '인', '✍')}
            </span>
          </p>

          <p className="mt-5 flex items-center gap-1 text-sm font-semibold text-stone-800 dark:text-stone-100">
            <input
              aria-label={tr(lang, '회사 이름', 'Company name')}
              className={`${inputClass} max-w-[10rem] text-center`}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder={tr(lang, '회사 이름', 'Company name')}
              maxLength={30}
              disabled={submitted}
            />
            <span className="shrink-0">{tr(lang, '대표님 귀하', '— To the CEO')}</span>
          </p>

          {submitted && (
            <div
              role="status"
              className="pointer-events-none absolute right-6 top-16 md:right-10 rotate-[-14deg] animate-in zoom-in-250 fade-in duration-[250ms] ease-in"
            >
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-rose-500/80 text-rose-500/90 flex flex-col items-center justify-center font-extrabold leading-tight">
                <span className="text-xl md:text-2xl tracking-widest">{tr(lang, '수리', 'OK')}</span>
                <span className="text-[10px] tracking-wider">{tr(lang, '마음버블', 'Mind Bubble')}</span>
              </div>
            </div>
          )}
        </div>

        {!submitted ? (
          <div className="mt-5 flex flex-col items-center">
            <button
              type="submit"
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold text-sm md:text-base shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              {tr(lang, '사직서를 제출합니다', 'I hereby resign')}
            </button>
            <p className="mt-2 text-[11px] text-stone-400 dark:text-stone-500">{tr(lang, '*사직서 거절은 거절합니다', '*Rejecting this letter is not accepted')}</p>
          </div>
        ) : (
          <div className="mt-5 text-center animate-in fade-in duration-500">
            <p className="text-base font-bold text-stone-800 dark:text-stone-100">
              {tr(lang, `${shownName}님의 사직서가 (마음속에서) 수리되었어요 🎉`, `${shownName}, your letter has been accepted (in your heart) 🎉`)}
            </p>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
              {tr(lang, '오늘도 버텨 낸 당신, 정말 수고 많았어요. 진짜 결정은 푹 쉬고 나서 천천히 해도 괜찮아요 🍀', 'You made it through another day. Well done. Any real decision can wait until after a good rest 🍀')}
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {tr(lang, '새 사직서 쓰기', 'Write a new one')}
            </button>
          </div>
        )}

        <p className="mt-5 text-center text-[11px] leading-relaxed text-stone-400 dark:text-stone-500 break-keep">
          {tr(lang, '🔒 이 사직서는 어떠한 개인정보도 수집하지 않아요. 적은 내용은 저장되거나 어디로도 보내지지 않고, 화면을 닫으면 사라져요.', '🔒 This letter collects no personal information. Nothing you write is saved or sent anywhere, and it disappears when you close the page.')}
        </p>
      </form>
    </section>
  )
}
