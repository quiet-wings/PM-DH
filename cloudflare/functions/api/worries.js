// POST /api/worries — 방문자가 동의(체크)한 고민을 저장해요. (Cloudflare Pages Functions)
// - 브라우저에서 이미 암호화된 글만 받아요. 서버는 내용을 읽을 수 없어요.
// - 이름·이메일·IP 주소는 저장하지 않아요.
// - 30일 뒤 자동으로 지워져요.

const RETENTION_SECONDS = 60 * 60 * 24 * 30
const MAX_BODY = 4096
const MAX_WRITES_PER_MINUTE = 60
const B64 = /^[A-Za-z0-9+/]+={0,2}$/

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

function validEnvelope(b) {
  return (
    b &&
    b.v === 1 &&
    typeof b.epk === 'string' && b.epk.length <= 120 && B64.test(b.epk) &&
    typeof b.iv === 'string' && b.iv.length <= 24 && B64.test(b.iv) &&
    typeof b.ct === 'string' && b.ct.length <= 3000 && B64.test(b.ct)
  )
}

export async function onRequestPost({ request, env }) {
  if (!env.WORRIES) return json({ ok: false, error: 'storage_not_configured' }, 503)

  const declared = Number(request.headers.get('content-length') || 0)
  if (declared > MAX_BODY) return json({ ok: false, error: 'too_large' }, 413)
  const raw = await request.text()
  if (raw.length > MAX_BODY) return json({ ok: false, error: 'too_large' }, 413)

  let body
  try {
    body = JSON.parse(raw)
  } catch {
    return json({ ok: false, error: 'bad_json' }, 400)
  }
  if (!validEnvelope(body)) return json({ ok: false, error: 'bad_envelope' }, 400)

  // 장난 대량 전송 막기 (사이트 전체 기준, 1분에 60개까지 / 개인 정보는 쓰지 않아요)
  const minuteKey = `rl:${Math.floor(Date.now() / 60000)}`
  const used = Number((await env.WORRIES.get(minuteKey)) || 0)
  if (used >= MAX_WRITES_PER_MINUTE) return json({ ok: false, error: 'busy' }, 429)
  await env.WORRIES.put(minuteKey, String(used + 1), { expirationTtl: 120 })

  // 최신 글이 목록 앞에 오도록 시간을 거꾸로 센 열쇠 이름을 써요
  const reverse = String(9999999999999 - Date.now()).padStart(13, '0')
  const id = `w:${reverse}:${crypto.randomUUID().slice(0, 8)}`
  const record = { v: 1, epk: body.epk, iv: body.iv, ct: body.ct, at: new Date().toISOString() }
  await env.WORRIES.put(id, JSON.stringify(record), { expirationTtl: RETENTION_SECONDS })

  return json({ ok: true })
}
