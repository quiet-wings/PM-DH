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

test('글 페이지에 마음버블 기능 버튼이 있다', () => {
  const html = readFileSync(pub('posts', 'breathing-4-4.html'), 'utf8');
  assert.match(html, /data-feature="breathing"/);
});

test('서비스 계정 키·Gemini 키가 코드에 들어 있지 않다', () => {
  const files = ['site/chat.js', 'lib/clover.js', 'lib/prompt.js', '.github/workflows/deploy.yml'];
  for (const f of files) {
    const s = readFileSync(join(root, f), 'utf8');
    assert.ok(!/"private_key"|BEGIN PRIVATE KEY|GEMINI_API_KEY\s*=/.test(s), f);
  }
});
