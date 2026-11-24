// 정적 HTML 버전 빌드 설정
// - Netlify 전용 서버 기능 없이, 어떤 웹 서버에도 올릴 수 있는 HTML 파일을 만들어요.
// - 실행: npm run build:static  → 결과물: dist-static/
// - 함께 날려보낸 걱정 수(서버 DB)는 정적 버전에서는 기본값으로 보여요.
// - 관리자 페이지(/admin) 비밀번호: 환경변수 STATIC_ADMIN_PASSWORD 또는
//   프로젝트 폴더의 ../테스트관리자_비밀번호.txt 첫 줄. 비밀번호 자체는 넣지 않고 해시값만 넣어요.
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// 비밀 파일(관리자 비밀번호·암호키) 폴더. 기본은 이 폴더의 상위.
// PM-DH에서 빌드할 때는 MAEUM_SECRET_DIR 환경변수로 실제 위치를 알려 줘요. 비밀 파일은 저장소에 커밋하지 않아요.
const SECRET_DIR = process.env.MAEUM_SECRET_DIR || resolve(__dirname, '..')

function readStaticAdminPassword(): string {
  const fromEnv = process.env.STATIC_ADMIN_PASSWORD?.trim()
  if (fromEnv) return fromEnv
  const file = resolve(SECRET_DIR, '테스트관리자_비밀번호.txt')
  if (!existsSync(file)) return ''
  const first = readFileSync(file, 'utf8').replace(/^﻿/, '').split(/\r?\n/)[0]
  return first.trim()
}

const adminPassword = readStaticAdminPassword()
const adminHash = adminPassword ? createHash('sha256').update(adminPassword).digest('hex') : ''

// 고민 암호화용 공개 열쇠 + 잠긴 개인 열쇠 (scripts/make-test-keys.mjs 로 한 번 만들어요)
function readWorryKeyConfig(): string {
  const file = resolve(SECRET_DIR, '테스트관리자_암호키.json')
  if (!existsSync(file)) return ''
  const parsed = JSON.parse(readFileSync(file, 'utf8').replace(/^﻿/, ''))
  return JSON.stringify(parsed.config)
}
const worryKeyConfig = readWorryKeyConfig()

export default defineConfig({
  resolve: { tsconfigPaths: true },
  build: { outDir: 'dist-static' },
  define: {
    'import.meta.env.VITE_STATIC_BUILD': JSON.stringify('1'),
    __STATIC_ADMIN_HASH__: JSON.stringify(adminHash),
    __WORRY_KEY_CONFIG__: JSON.stringify(worryKeyConfig),
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      pages: [
        { path: '/' },
        { path: '/game' },
        { path: '/typing' },
        { path: '/books' },
        { path: '/admin' },
        { path: '/privacy' },
      ],
      prerender: {
        enabled: true,
        crawlLinks: false,
        autoSubfolderIndex: true,
        failOnError: true,
      },
    }),
    viteReact(),
  ],
})
