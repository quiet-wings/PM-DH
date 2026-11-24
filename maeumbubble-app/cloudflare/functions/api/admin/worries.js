// /api/admin/worries — 관리자만 쓰는 고민 목록 (Cloudflare Pages Functions)
// GET            : 암호화된 고민 목록 (최신순, 최대 500개)
// DELETE ?id=..  : 하나 지우기
// DELETE ?all=1  : 모두 지우기
// - 관리자 페이지가 비밀번호에서 만든 로그인 토큰을 보내면, 그 해시가 ADMIN_AUTH_HASH 와 같은지 확인해요.
// - 목록에는 잠긴 글만 들어 있어요. 여는 것은 관리자 브라우저에서만 해요.

const MAX_ITEMS = 500

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    },
  })
}

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function sameHex(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

async function authorized(request, env) {
  if (!env.ADMIN_AUTH_HASH) return false
  const auth = request.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!/^[0-9a-f]{64}$/.test(token)) return false
  return sameHex(await sha256Hex(token), env.ADMIN_AUTH_HASH)
}

async function listKeys(env) {
  const keys = []
  let cursor
  do {
    const page = await env.WORRIES.list({ prefix: 'w:', cursor, limit: 1000 })
    keys.push(...page.keys.map((k) => k.name))
    cursor = page.list_complete ? undefined : page.cursor
  } while (cursor && keys.length < MAX_ITEMS)
  return keys.slice(0, MAX_ITEMS)
}

export async function onRequest({ request, env }) {
  if (!env.WORRIES) return json({ ok: false, error: 'storage_not_configured' }, 503)
  if (!(await authorized(request, env))) return json({ ok: false, error: 'unauthorized' }, 401)

  const url = new URL(request.url)

  if (request.method === 'GET') {
    const keys = await listKeys(env)
    const values = await Promise.all(keys.map((k) => env.WORRIES.get(k)))
    const items = []
    keys.forEach((id, i) => {
      if (!values[i]) return
      try {
        const rec = JSON.parse(values[i])
        items.push({ id, at: rec.at, envelope: { v: rec.v, epk: rec.epk, iv: rec.iv, ct: rec.ct } })
      } catch {}
    })
    return json({ ok: true, items })
  }

  if (request.method === 'DELETE') {
    if (url.searchParams.get('all') === '1') {
      const keys = await listKeys(env)
      await Promise.all(keys.map((k) => env.WORRIES.delete(k)))
      return json({ ok: true, deleted: keys.length })
    }
    const id = url.searchParams.get('id') || ''
    if (!/^w:\d{13}:[0-9a-f]{8}$/.test(id)) return json({ ok: false, error: 'bad_id' }, 400)
    await env.WORRIES.delete(id)
    return json({ ok: true, deleted: 1 })
  }

  return json({ ok: false, error: 'method_not_allowed' }, 405)
}
