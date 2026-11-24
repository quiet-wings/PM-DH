// 위로 문장을 예쁜 카드 이미지(PNG)로 만들어 저장해요.
// 외부 라이브러리 없이 브라우저 캔버스로 직접 그려요.

const W = 1080
const H = 1350
const FONT = "'Gowun Dodum', 'Plus Jakarta Sans', sans-serif"

const PALETTES: [string, string, string][] = [
  ['#d1fae5', '#e0f2fe', '#ede9fe'],
  ['#fef3c7', '#ffe4e6', '#fae8ff'],
  ['#e0f2fe', '#ccfbf1', '#fef9c3'],
  ['#ffe4e6', '#fef3c7', '#d1fae5'],
]

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  // 띄어쓰기 단위로 줄을 나누고, 한 단어가 너무 길면 글자 단위로 나눠요
  const words = text.split(' ')
  let line = ''
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (ctx.measureText(candidate).width <= maxWidth) {
      line = candidate
      continue
    }
    if (line) lines.push(line)
    line = ''
    let chunk = ''
    for (const ch of word) {
      if (ctx.measureText(chunk + ch).width > maxWidth) {
        lines.push(chunk)
        chunk = ch
      } else {
        chunk += ch
      }
    }
    line = chunk
  }
  if (line) lines.push(line)
  return lines
}

function drawBubble(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r)
  g.addColorStop(0, 'rgba(255,255,255,0.95)')
  g.addColorStop(0.45, 'rgba(255,255,255,0.35)')
  g.addColorStop(1, 'rgba(255,255,255,0.6)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'
  ctx.lineWidth = 3
  ctx.stroke()
}

export async function renderAffirmationCard(
  text: string,
  subtext: string | undefined,
  footer: string,
): Promise<Blob | null> {
  if (typeof document === 'undefined') return null
  try {
    await document.fonts.load(`700 64px ${FONT}`, text)
  } catch {}

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  // 배경
  const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)]
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, palette[0])
  bg.addColorStop(0.55, palette[1])
  bg.addColorStop(1, palette[2])
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // 버블 장식
  drawBubble(ctx, 170, 210, 110)
  drawBubble(ctx, 930, 150, 60)
  drawBubble(ctx, 900, 1130, 130)
  drawBubble(ctx, 140, 1180, 70)
  drawBubble(ctx, 560, 110, 34)

  // 가운데 흰 카드
  const pad = 90
  ctx.fillStyle = 'rgba(255,255,255,0.78)'
  ctx.beginPath()
  ctx.roundRect(pad, 290, W - pad * 2, H - 580, 56)
  ctx.fill()

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // 본문
  const maxWidth = W - pad * 2 - 120
  let size = 68
  ctx.font = `700 ${size}px ${FONT}`
  let lines = wrapText(ctx, text, maxWidth)
  while (lines.length > 5 && size > 44) {
    size -= 6
    ctx.font = `700 ${size}px ${FONT}`
    lines = wrapText(ctx, text, maxWidth)
  }
  const lineHeight = size * 1.5

  ctx.font = `400 38px ${FONT}`
  const subLines = subtext ? wrapText(ctx, subtext, maxWidth) : []
  const subHeight = subLines.length ? 60 + subLines.length * 56 : 0

  const blockHeight = lines.length * lineHeight + subHeight
  let y = H / 2 - blockHeight / 2 + lineHeight / 2

  ctx.fillStyle = '#064e3b'
  ctx.font = `700 ${size}px ${FONT}`
  for (const line of lines) {
    ctx.fillText(line, W / 2, y)
    y += lineHeight
  }

  if (subLines.length) {
    y += 60 - lineHeight / 2 + 28
    ctx.fillStyle = '#57534e'
    ctx.font = `400 38px ${FONT}`
    for (const line of subLines) {
      ctx.fillText(line, W / 2, y)
      y += 56
    }
  }

  // 아래 서명
  ctx.fillStyle = '#047857'
  ctx.font = `700 40px ${FONT}`
  ctx.fillText(`🍀 ${footer}`, W / 2, H - 150)

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'))
}

export async function downloadAffirmationCard(
  text: string,
  subtext: string | undefined,
  footer: string,
): Promise<boolean> {
  const blob = await renderAffirmationCard(text, subtext, footer)
  if (!blob) return false
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `mind-bubble-card-${Date.now()}.png`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return true
}
