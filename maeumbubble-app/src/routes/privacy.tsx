import { createFileRoute, Link } from '@tanstack/react-router'
import { ShieldCheck } from 'lucide-react'
import { SubPageHeader } from '../components/SubPageHeader'
import { BottomNav } from '../components/BottomNav'

// 개인정보 처리방침 — 실제 코드가 저장·전송하는 항목만 적어요.
// 문의 이메일이 정해지면 아래 값만 채우면 화면에 나타나요.
const PRIVACY_CONTACT = ''
const EFFECTIVE_DATE = '2026-11-25'

export const Route = createFileRoute('/privacy')({
  head: () => ({
    meta: [
      { title: '개인정보 처리방침 | 마음 버블' },
      { name: 'description', content: '마음 버블이 어떤 정보를 저장하고, 어떤 정보를 저장하지 않는지 안내해요.' },
    ],
  }),
  component: PrivacyPage,
})

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-white/85 dark:bg-zinc-900/80 border border-emerald-100/80 dark:border-zinc-800 p-5 shadow-2xs">
      <h2 className="text-sm md:text-base font-bold text-emerald-800 dark:text-emerald-300 mb-2 break-keep">{title}</h2>
      <div className="text-[13px] md:text-sm text-stone-700 dark:text-stone-300 leading-relaxed break-keep space-y-1.5">
        {children}
      </div>
    </section>
  )
}

function PrivacyPage() {
  return (
    <div className="relative min-h-screen flex flex-col pb-20 md:pb-8">
      <SubPageHeader emoji="🔒" title="개인정보 처리방침" />
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-start gap-3 rounded-3xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-900 p-5">
          <ShieldCheck className="w-6 h-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm text-emerald-900 dark:text-emerald-100 leading-relaxed break-keep">
            마음 버블은 <strong>회원가입 없이</strong> 쓰는 서비스예요. 이름·이메일·전화번호를 받지 않고,
            적은 걱정은 <strong>기본적으로 어디에도 저장되지 않아요.</strong>
          </p>
        </div>

        <Section title="1. 이 기기(브라우저)에만 남는 정보">
          <p>아래 값은 내 브라우저 저장공간에만 남고, 서버로 보내지 않아요. 브라우저 설정에서 사이트 데이터를 지우면 함께 사라져요.</p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li>언어·화면 테마·배경음 켜짐 여부</li>
            <li>미니게임 최고 기록, 뽁뽁이·네잎클로버 누적 수</li>
            <li>마음버블서점의 언어·화면 테마·글자 크기·배경음 설정</li>
          </ul>
        </Section>

        <Section title="2. 내가 동의했을 때만 보내는 정보 (선택)">
          <p>
            걱정을 적을 때 <strong>'(선택) 익명으로 운영자에게 보내기'</strong>를 체크한 경우에만 아래를 보내요. 기본은 꺼져 있어요.
          </p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li>보내는 것: 걱정 내용, 걱정 분류, 언어</li>
            <li>보내기 전에 내 브라우저에서 <strong>암호화</strong>되어, 운영자의 비밀번호로만 열 수 있어요</li>
            <li>이름·이메일·IP 주소는 저장하지 않아요</li>
            <li>보관 기간: <strong>30일 뒤 자동 삭제</strong> (운영자가 그 전에 지울 수 있어요)</li>
            <li>목적: 서비스 개선과 위로 문장·글 주제 참고</li>
          </ul>
          <p>체크하지 않아도 모든 기능을 똑같이 쓸 수 있어요. 나를 알아볼 수 있는 내용은 적지 말아 주세요.</p>
        </Section>

        <Section title="3. 마음버블서점 AI 추천과 별점">
          <ul className="list-disc pl-5 space-y-0.5">
            <li>
              <strong>'AI에게 물어보기'</strong>에 적은 문장은 중계 서버(Cloudflare)를 거쳐 <strong>Anthropic(Claude)</strong>으로 보내
              서점 책 목록 안에서 책 3권과 추천 이유를 고르는 데만 써요. 문장은 <strong>저장하지 않아요.</strong>
            </li>
            <li>
              추천 뒤 남기는 <strong>별점과 한마디</strong>는 이름·이메일·IP 주소 없이 <strong>30일</strong> 보관 후 자동 삭제돼요 (목적: 추천 품질 개선).
            </li>
            <li>감정 버튼으로 찾기는 AI를 쓰지 않고 화면 안에서만 책을 골라요.</li>
          </ul>
          <p>나를 알아볼 수 있는 내용은 적지 말아 주세요.</p>
        </Section>

        <Section title="4. 함께 날려 보낸 걱정 수">
          <p>버블을 날려 보내면 전체 숫자만 1 올라가요. 누가, 어떤 걱정을 날렸는지는 기록하지 않아요.</p>
        </Section>

        <Section title="5. 외부 서비스">
          <ul className="list-disc pl-5 space-y-0.5">
            <li>
              <strong>Cloudflare</strong>: 사이트를 전달하는 호스팅 업체로, 보안·장애 대응을 위해 접속 기록을 짧게 처리할 수 있어요.
            </li>
            <li>
              <strong>Google Fonts</strong>: 글꼴을 불러올 때 접속 주소가 Google에 전달될 수 있어요. 차단되어도 기본 글꼴로 정상 동작해요.
            </li>
            <li>
              <strong>Anthropic(Claude API)</strong>: 서점 AI 추천을 만드는 AI 서비스예요. 위 3번처럼 적은 문장만 전달되고, 운영자는 저장하지 않아요.
            </li>
            <li>
              <strong>교보문고 링크</strong>: 서점에서 책을 누르면 교보문고 사이트로 이동하며, 그 뒤로는 교보문고의 방침을 따라요.
            </li>
          </ul>
          <p>광고·분석 도구나 추적 쿠키는 쓰지 않아요.</p>
        </Section>

        <Section title="6. 안전을 위한 안내">
          <p>마음 버블은 진단·치료를 대신하지 않아요. 위급하거나 마음이 많이 힘들 때는 아래로 연락해 주세요.</p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li>
              자살예방 상담전화 <a className="underline font-semibold" href="tel:109">109</a> (24시간)
            </li>
            <li>
              정신건강 위기상담전화 <a className="underline font-semibold" href="tel:15770199">1577-0199</a>
            </li>
            <li>
              긴급 상황 <a className="underline font-semibold" href="tel:119">119</a>
            </li>
          </ul>
        </Section>

        <Section title="7. 문의·변경">
          {PRIVACY_CONTACT ? (
            <p>
              개인정보 관련 문의: <a className="underline" href={`mailto:${PRIVACY_CONTACT}`}>{PRIVACY_CONTACT}</a>
            </p>
          ) : (
            <p>지금은 테스트 버전이에요. 정식 출시 때 문의처를 이곳에 안내할게요.</p>
          )}
          <p>방침이 바뀌면 이 페이지에 먼저 알려 드려요. 시행일: {EFFECTIVE_DATE}</p>
        </Section>

        <p className="text-center">
          <Link to="/" className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 underline underline-offset-2">
            홈으로 돌아가기
          </Link>
        </p>
      </main>
      <BottomNav lang="ko" />
    </div>
  )
}
