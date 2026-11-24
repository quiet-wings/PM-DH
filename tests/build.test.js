import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from '../scripts/build.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = (...p) => join(root, 'public', ...p);

test('빌드 결과: 홈, 글 페이지, 404, 검색 색인, 챗봇 자산', () => {
  const r = build();
  assert.ok(r.posts >= 7 && r.chunks > r.posts);
  for (const f of ['index.html', '404.html', 'search-index.json', 'assets/chat.js', 'assets/style.css', 'assets/lib/clover.js']) {
    assert.ok(existsSync(pub(f)), `${f} 없음`);
  }
  assert.equal(readdirSync(pub('posts')).length, r.posts);
});

test('브라우저용 lib에는 Node 전용 모듈(node:)이 없다', () => {
  for (const f of readdirSync(pub('assets', 'lib'))) {
    assert.ok(!readFileSync(pub('assets', 'lib', f), 'utf8').includes("from 'node:"), f);
  }
});

test('모든 페이지에 챗봇 위젯과 위기 상담 번호가 있다', () => {
  for (const f of ['index.html', ...readdirSync(pub('posts')).map((p) => `posts/${p}`)]) {
    const html = readFileSync(pub(f), 'utf8');
    assert.match(html, /id="clover-chat"/, f);
    assert.match(html, /109/, f);
  }
});

test('개인정보 처리방침 페이지가 있고 모든 페이지 하단에서 연결된다', () => {
  const html = readFileSync(pub('privacy.html'), 'utf8');
  assert.match(html, /개인정보 처리방침/);
  assert.match(html, /전화번호·이메일·주민등록번호를 가린 뒤/);
  for (const f of ['index.html', '404.html', ...readdirSync(pub('posts')).map((p) => `posts/${p}`)]) {
    assert.match(readFileSync(pub(f), 'utf8'), /href="\/privacy"/, f);
  }
});

test('firebase.json에 보안 헤더(CSP)가 있고 챗봇에 필요한 주소만 허용한다', () => {
  const cfg = JSON.parse(readFileSync(join(root, 'firebase.json'), 'utf8'));
  const all = cfg.hosting.headers.flatMap((h) => h.headers);
  const csp = all.find((h) => h.key === 'Content-Security-Policy')?.value || '';
  for (const need of ["default-src 'self'", 'https://www.gstatic.com', 'https://firebasevertexai.googleapis.com', 'https://firestore.googleapis.com', 'https://maeumbubble-test.pages.dev', "frame-ancestors 'none'", "object-src 'none'"]) {
    assert.ok(csp.includes(need), need);
  }
  assert.ok(!/script-src[^;]*'unsafe-inline'/.test(csp), '스크립트 인라인 허용 금지');
});

test('글 페이지에 마음버블 기능 버튼이 있다', () => {
  const html = readFileSync(pub('posts', 'breathing-4-4.html'), 'utf8');
  assert.match(html, /data-feature="breathing"/);
});

test('서비스 계정 키·Gemini 키가 코드에 들어 있지 않다', () => {
  const files = ['site/chat.js', 'site/firebase-config.js', 'lib/clover.js', 'lib/prompt.js', '.github/workflows/deploy.yml', 'maeumbubble-app/cloudflare/functions/api/ask.js'];
  for (const f of files) {
    const s = readFileSync(join(root, f), 'utf8');
    assert.ok(!/"private_key"|BEGIN PRIVATE KEY|GEMINI_API_KEY\s*=|sk-ant-[A-Za-z0-9_-]{10,}/.test(s), f);
  }
});

test('모든 페이지가 같은 앱 아이콘(클로버 요정)과 매니페스트를 쓴다', () => {
  for (const f of ['icons/favicon.ico', 'icons/icon-32.png', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', 'manifest.webmanifest']) {
    assert.ok(existsSync(pub('assets', f)), f);
  }
  for (const f of ['index.html', 'privacy.html', '404.html', ...readdirSync(pub('posts')).map((p) => `posts/${p}`)]) {
    const html = readFileSync(pub(f), 'utf8');
    assert.match(html, /rel="apple-touch-icon"[^>]*icon-180\.png/, f);
    assert.match(html, /rel="manifest"/, f);
    assert.ok(!html.includes('font-size=%2290%22>🍀'), `${f}: 예전 이모지 아이콘`);
  }
});

test('배포마다 자산 주소가 바뀐다: HTML과 JS 상대 import에 같은 ?v=버전', () => {
  const r = build();
  const html = readFileSync(pub('index.html'), 'utf8');
  assert.match(html, new RegExp(`/assets/chat\\.js\\?v=${r.version}`));
  const chat = readFileSync(pub('assets', 'chat.js'), 'utf8');
  assert.match(chat, new RegExp(`from '\\./firebase-config\\.js\\?v=${r.version}'`));
  assert.match(chat, new RegExp(`from '\\./lib/clover\\.js\\?v=${r.version}'`));
  const clover = readFileSync(pub('assets', 'lib', 'clover.js'), 'utf8');
  assert.match(clover, new RegExp(`from '\\./safety\\.js\\?v=${r.version}'`));
});
