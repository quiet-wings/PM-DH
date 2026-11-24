// 테스트 버전2 배포 폴더 만들기 (Cloudflare Pages + 고민 저장 기능)
// 실행 순서: npm run build:static → node scripts/make-test-deploy.mjs
// 결과: ../마음버블_테스트공개_v2/
//   site/        ← 사이트 파일 (dist-static/client)
//   functions/   ← 서버 기능 (고민 저장·관리자 조회)
//   wrangler.toml, package.json, 배포하기.ps1, 읽어주세요.txt
// - wrangler.toml 에 이미 저장소(KV) 번호가 적혀 있으면 그대로 유지해요.
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const sourceDir = resolve(here, '..')
const projectDir = resolve(sourceDir, '..')
const out = resolve(projectDir, '마음버블_테스트공개_v2')
const built = resolve(sourceDir, 'dist-static', 'client')
const keyFile = resolve(projectDir, '테스트관리자_암호키.json')

if (!existsSync(built)) throw new Error('먼저 npm run build:static 을 실행해 주세요.')
if (!existsSync(keyFile)) throw new Error('먼저 node scripts/make-test-keys.mjs 를 실행해 주세요.')
const { adminAuthHash } = JSON.parse(readFileSync(keyFile, 'utf8'))

// 기존 저장소 번호 유지
let kvId = 'REPLACE_WITH_KV_ID'
const oldToml = resolve(out, 'wrangler.toml')
if (existsSync(oldToml)) {
  const m = readFileSync(oldToml, 'utf8').match(/^id\s*=\s*"([^"]+)"/m)
  if (m) kvId = m[1]
}

mkdirSync(out, { recursive: true })
for (const name of ['site', 'functions']) rmSync(resolve(out, name), { recursive: true, force: true })
// 예전 방식(폴더 바로 아래 사이트 파일)으로 만든 파일 정리
for (const name of ['index.html', 'assets', 'books', 'game', 'typing', 'admin', 'img', 'favicon.ico', '_headers', 'robots.txt']) {
  rmSync(resolve(out, name), { recursive: true, force: true })
}

cpSync(built, resolve(out, 'site'), { recursive: true })
cpSync(resolve(sourceDir, 'cloudflare', 'functions'), resolve(out, 'functions'), { recursive: true })
for (const name of ['배포하기.ps1', 'deploy.ps1', '읽어주세요.txt']) {
  cpSync(resolve(sourceDir, 'cloudflare', name), resolve(out, name))
}

writeFileSync(
  resolve(out, 'site', '_headers'),
  [
    '/*',
    '  X-Robots-Tag: noindex, nofollow',
    '  X-Content-Type-Options: nosniff',
    '  X-Frame-Options: DENY',
    '  Referrer-Policy: no-referrer',
    '  Permissions-Policy: camera=(), microphone=(), geolocation=()',
    '  Strict-Transport-Security: max-age=31536000',
    '',
    '/admin/*',
    '  Cache-Control: no-store',
    '',
  ].join('\n'),
)
writeFileSync(resolve(out, 'site', 'robots.txt'), 'User-agent: *\nDisallow: /\n')

writeFileSync(
  resolve(out, 'wrangler.toml'),
  `# Cloudflare Pages 설정 (테스트 버전2)
name = "maeumbubble-test"
pages_build_output_dir = "./site"
compatibility_date = "2025-09-01"

[vars]
# 관리자 로그인 확인값 (비밀번호에서 만든 값의 해시예요. 비밀번호 자체가 아니에요)
ADMIN_AUTH_HASH = "${adminAuthHash}"

# 고민 저장소 (처음 배포할 때 배포하기.ps1 이 자동으로 만들어 번호를 적어요)
[[kv_namespaces]]
binding = "WORRIES"
id = "${kvId}"
`,
)

writeFileSync(
  resolve(out, 'package.json'),
  JSON.stringify(
    { name: 'maeumbubble-test-deploy', private: true, devDependencies: { wrangler: '^4.0.0' } },
    null,
    2,
  ),
)

console.log('배포 폴더를 만들었어요:', out)
