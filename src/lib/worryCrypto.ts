// 고민 내용 암호화 (테스트 버전 전용)
//
// 구조
// - 관리자 열쇠 한 쌍(공개 열쇠 / 개인 열쇠)을 미리 만들어 둬요. (scripts/make-test-keys.mjs)
// - 방문자 브라우저: 공개 열쇠로 고민을 잠근 뒤(암호화) 서버로 보내요. 서버에는 잠긴 글만 저장돼요.
// - 관리자 페이지: 관리자 비밀번호로 개인 열쇠를 풀고, 그 열쇠로 고민을 열어요(복호화).
// - 서버, Cloudflare, 사이트 파일 어디에도 개인 열쇠의 원본이나 비밀번호는 남지 않아요.
//
// 방식: ECDH P-256 + HKDF-SHA256 + AES-GCM-256 (ECIES), 개인 열쇠 보관: PBKDF2-SHA256 + AES-GCM

export interface WorryKeyConfig {
  version: 1
  publicJwk: JsonWebKey
  wrapped: { salt: string; iv: string; data: string; iterations: number }
  auth: { salt: string; iterations: number }
}

export interface WorryEnvelope {
  v: 1
  epk: string // 보낼 때마다 새로 만든 임시 공개 열쇠 (raw, base64)
  iv: string
  ct: string
}

export interface WorryPayload {
  text: string
  category: string
  lang: string
}

const HKDF_INFO = new TextEncoder().encode('mindbubble-worry-v1')

export function b64encode(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let s = ''
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i])
  return btoa(s)
}

export function b64decode(s: string): Uint8Array<ArrayBuffer> {
  const bin = atob(s)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

function hex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function deriveAesFromShared(shared: ArrayBuffer, usage: KeyUsage): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey('raw', shared, 'HKDF', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: HKDF_INFO },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    [usage],
  )
}

/** 방문자 브라우저: 관리자 공개 열쇠로 고민을 잠가요. */
export async function encryptWorry(publicJwk: JsonWebKey, payload: WorryPayload): Promise<WorryEnvelope> {
  const adminPub = await crypto.subtle.importKey(
    'jwk',
    publicJwk,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    [],
  )
  const eph = (await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, [
    'deriveBits',
  ])) as CryptoKeyPair
  const shared = await crypto.subtle.deriveBits({ name: 'ECDH', public: adminPub }, eph.privateKey, 256)
  const aes = await deriveAesFromShared(shared, 'encrypt')
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aes,
    new TextEncoder().encode(JSON.stringify(payload)),
  )
  const epk = await crypto.subtle.exportKey('raw', eph.publicKey)
  return { v: 1, epk: b64encode(epk), iv: b64encode(iv), ct: b64encode(ct) }
}

async function pbkdf2Bits(password: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<ArrayBuffer> {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveBits',
  ])
  return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, base, 256)
}

/** 관리자: 서버에 보여줄 로그인 토큰 (비밀번호 자체는 서버로 보내지 않아요) */
export async function deriveAuthToken(password: string, cfg: WorryKeyConfig): Promise<string> {
  return hex(await pbkdf2Bits(password, b64decode(cfg.auth.salt), cfg.auth.iterations))
}

/** 관리자: 비밀번호로 개인 열쇠를 풀어요. 비밀번호가 틀리면 오류가 나요. */
export async function unlockPrivateKey(password: string, cfg: WorryKeyConfig): Promise<CryptoKey> {
  const bits = await pbkdf2Bits(password, b64decode(cfg.wrapped.salt), cfg.wrapped.iterations)
  const wrapKey = await crypto.subtle.importKey('raw', bits, 'AES-GCM', false, ['decrypt'])
  const pkcs8 = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: b64decode(cfg.wrapped.iv) },
    wrapKey,
    b64decode(cfg.wrapped.data),
  )
  return crypto.subtle.importKey('pkcs8', pkcs8, { name: 'ECDH', namedCurve: 'P-256' }, false, [
    'deriveBits',
  ])
}

/** 관리자: 잠긴 고민을 열어요. */
export async function decryptWorry(privateKey: CryptoKey, env: WorryEnvelope): Promise<WorryPayload> {
  const epk = await crypto.subtle.importKey(
    'raw',
    b64decode(env.epk),
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    [],
  )
  const shared = await crypto.subtle.deriveBits({ name: 'ECDH', public: epk }, privateKey, 256)
  const aes = await deriveAesFromShared(shared, 'decrypt')
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64decode(env.iv) }, aes, b64decode(env.ct))
  return JSON.parse(new TextDecoder().decode(plain)) as WorryPayload
}

// ---- 빌드할 때 넣어 주는 설정 (정적 테스트 버전에서만 있어요) ----
declare const __WORRY_KEY_CONFIG__: string | undefined

export function getWorryKeyConfig(): WorryKeyConfig | null {
  try {
    const raw = typeof __WORRY_KEY_CONFIG__ !== 'undefined' ? __WORRY_KEY_CONFIG__ : ''
    return raw ? (JSON.parse(raw) as WorryKeyConfig) : null
  } catch {
    return null
  }
}
