// 한 사람(접속 주소)이 짧은 시간에 너무 많이 부르는 걸 막아요. (보안 점검 2026-11-25)
// - 접속 주소(IP)는 저장하지 않아요. 날짜를 섞어 SHA-256으로 바꾼 값의 앞 16자리만, 2분 동안 숫자 세기에만 써요.
// - 사이트 전체 한도는 각 API의 기존 overLimit이 계속 맡아요.
async function clientId(request) {
  const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown'
  const day = new Date().toISOString().slice(0, 10)
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${day}|${ip}`))
  return [...new Uint8Array(digest)].slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function clientOverLimit(kv, request, scope, perMinute) {
  if (!kv) return false
  const key = `cl:${scope}:${await clientId(request)}:${Math.floor(Date.now() / 60000)}`
  const used = Number((await kv.get(key)) || 0)
  if (used >= perMinute) return true
  await kv.put(key, String(used + 1), { expirationTtl: 120 })
  return false
}
