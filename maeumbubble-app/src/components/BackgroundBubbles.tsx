// 모든 페이지 뒤에 은은하게 떠다니는 장식
// - 라이트 모드: 반투명 거품(구름) 일러스트
// - 다크 모드: 잔잔하게 반짝이는 작은 별빛
// PRD 6장 단순화: 화면이 덜 복잡하도록 장식 거품을 6개 → 3개로 줄였어요
const BUBBLES = [
  { left: '4%', top: '16%', size: 120, delay: '0s', duration: '9s' },
  { left: '72%', top: '48%', size: 140, delay: '0.8s', duration: '11s' },
  { left: '46%', top: '82%', size: 112, delay: '1.1s', duration: '10s' },
]

// 서버와 브라우저에서 항상 같은 위치가 나오도록 고정된 규칙으로 별 위치를 만들어요.
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

const rand = seeded(20261112)
const STARS = Array.from({ length: 28 }, () => {
  const r = rand()
  return {
    left: `${(rand() * 100).toFixed(2)}%`,
    top: `${(rand() * 100).toFixed(2)}%`,
    // 대부분은 아주 작은 점, 가끔 조금 큰 별
    size: r > 0.9 ? 3 : r > 0.6 ? 2 : 1.5,
    delay: `${(rand() * 6).toFixed(2)}s`,
    duration: `${(3 + rand() * 4).toFixed(2)}s`,
  }
})

// 십자 모양으로 반짝이는 조금 큰 별 몇 개
const SPARKLES = [
  { left: '14%', top: '22%', size: 10, delay: '0.5s' },
  { left: '78%', top: '30%', size: 8, delay: '2.4s' },
  { left: '58%', top: '68%', size: 9, delay: '4.1s' },
  { left: '26%', top: '84%', size: 7, delay: '1.7s' },
]

export function BackgroundBubbles() {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* 라이트 모드: 거품 구름 */}
      <div className="dark:hidden">
        {BUBBLES.map((b, i) => (
          <img
            key={i}
            src="/img/foam-bubble.png"
            alt=""
            draggable={false}
            className="animate-float-slow absolute object-contain opacity-55 select-none"
            style={{
              left: b.left,
              top: b.top,
              width: b.size,
              height: Math.round(b.size * 0.85),
              animationDelay: b.delay,
              animationDuration: b.duration,
            }}
          />
        ))}
      </div>

      {/* 다크 모드: 작은 별빛 */}
      <div className="hidden dark:block">
        {STARS.map((s, i) => (
          <span
            key={i}
            className="night-star"
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              animationDelay: s.delay,
              animationDuration: s.duration,
            }}
          />
        ))}
        {SPARKLES.map((s, i) => (
          <span
            key={`sp-${i}`}
            className="night-sparkle"
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              animationDelay: s.delay,
            }}
          />
        ))}
      </div>
    </div>
  )
}
