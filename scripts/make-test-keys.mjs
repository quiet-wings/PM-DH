// 테스트 버전 고민 암호화 열쇠 만들기 (한 번만 실행)
// 실행: node scripts/make-test-keys.mjs
// - ../테스트관리자_비밀번호.txt 첫 줄(관리자 비밀번호)로 개인 열쇠를 잠가서
//   ../테스트관리자_암호키.json 에 저장해요. 이 파일에는 잠긴 개인 열쇠만 들어 있어요.
// - 이미 파일이 있으면 덮어쓰지 않아요. (열쇠를 바꾸면 그전에 모은 고민은 다시 열 수 없어요)
// - 서버(Cloudflare)에 넣을 로그인 확인값(ADMIN_AUTH_HASH)도 함께 저장해요.
import { webcrypto as crypto } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const projectDir = resolve(here, '..', '..')
const pwFile = resolve(projectDir, '테스트관리자_비밀번호.txt')
const outFile = resolve(projectDir, '테스트관리자_암호키.json')

if (existsSync(outFile)) {
  console.log('이미 열쇠 파일이 있어요. 그대로 둘게요:', outFile)
  process.exit(0)
}
if (!existsSync(pwFile)) {
  console.error('비밀번호 파일이 없어요:', pwFile)
  process.exit(1)
}
const password = readFileSync(pwFile, 'utf8').replace(/^﻿/, '').split(/\r?\n/)[0].trim()
if (password.length < 10) {
  console.error('비밀번호가 너무 짧아요 (10자 이상).')
  process.exit(1)
}

const ITER = 310000
const enc = new TextEncoder()
const b64 = (buf) => Buffer.from(buf instanceof ArrayBuffer ? new Uint8Array(buf) : buf).toString('base64')
const hex = (buf) => Buffer.from(new Uint8Array(buf)).toString('hex')

async function pbkdf2(salt) {
  const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  return crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITER }, base, 256)
}

const pair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits'])
const publicJwk = await crypto.subtle.exportKey('jwk', pair.publicKey)
const pkcs8 = await crypto.subtle.exportKey('pkcs8', pair.privateKey)

const wrapSalt = crypto.getRandomValues(new Uint8Array(16))
const wrapIv = crypto.getRandomValues(new Uint8Array(12))
const wrapKey = await crypto.subtle.importKey('raw', await pbkdf2(wrapSalt), 'AES-GCM', false, ['encrypt'])
const wrapped = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: wrapIv }, wrapKey, pkcs8)

const authSalt = crypto.getRandomValues(new Uint8Array(16))
const authToken = hex(await pbkdf2(authSalt))
const authHash = hex(await crypto.subtle.digest('SHA-256', enc.encode(authToken)))

const config = {
  version: 1,
  publicJwk: { kty: publicJwk.kty, crv: publicJwk.crv, x: publicJwk.x, y: publicJwk.y },
  wrapped: { salt: b64(wrapSalt), iv: b64(wrapIv), data: b64(wrapped), iterations: ITER },
  auth: { salt: b64(authSalt), iterations: ITER },
}

writeFileSync(outFile, JSON.stringify({ config, adminAuthHash: authHash }, null, 2), 'utf8')
console.log('열쇠 파일을 만들었어요:', outFile)
