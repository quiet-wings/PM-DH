// POST /api/bookstore/feedback — 마음버블서점 별점·한마디 (Cloudflare Pages Functions)
// 이름·IP 없이 별점(1~5)과 메시지(1000자 이내)만 WORRIES KV에 30일 보관해요. 키 접두어: bookfb:
import { clientOverLimit } from '../../_lib/client-limit.js'
const ALLOWED_ORIGINS = [
  /^https:\/\/([a-z0-9-]+\.)?maeumbubble-test\.pages\.dev$/,
  /^http:\/\/(localhost|127\.0\.0\.1):(3000|4173|5173|8788)$/,
]
const KEEP_SECONDS = 30 * 24 * 60 * 60
const LIMIT_PER_DAY = 200

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin')
  if (!origin || !ALLOWED_ORIGINS.some((re) => re.test(origin))) return json({ error: 'forbidden_origin' }, 403)
  if (!env.WORRIES) return json({ error: 'not_configured' }, 503)
  if (await clientOverLimit(env.WORRIES, request, 'bookfb', 3)) return json({ error: 'busy' }, 429)

  let body
  try {
    const raw = await request.text()
    if (raw.length > 4000) return json({ error: 'bad_request' }, 413)
    body = JSON.parse(raw)
  } catch {
    return json({ error: 'bad_request' }, 400)
  }
  const rating = Number.isInteger(body?.rating) && body.rating >= 1 && body.rating <= 5 ? body.rating : null
  const message = typeof body?.message === 'string' ? body.message.trim().slice(0, 1000) : ''
  const lang = body?.lang === 'en' ? 'en' : 'ko'
  if (!rating && !message) return json({ error: 'bad_request' }, 400)

  const dayKey = `bookfb:d:${new Date().toISOString().slice(0, 10)}`
  const count = Number((await env.WORRIES.get(dayKey)) || 0)
  if (count >= LIMIT_PER_DAY) return json({ error: 'rate_limited' }, 429)
  await env.WORRIES.put(dayKey, String(count + 1), { expirationTtl: 172800 })

  const id = `bookfb:${Date.now()}:${crypto.randomUUID().slice(0, 8)}`
  await env.WORRIES.put(id, JSON.stringify({ rating, message, lang, at: new Date().toISOString() }), {
    expirationTtl: KEEP_SECONDS,
  })
  return json({ ok: true })
}
