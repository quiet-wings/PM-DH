import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parsePost, loadPosts, slugFromFilename, chunkPost } from '../lib/posts.js';
import { FEATURES } from '../site/config.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('파일명에서 날짜를 뺀 slug를 만든다', () => {
  assert.equal(slugFromFilename('2026-11-12-breathing-4-4.md'), 'breathing-4-4');
});

test('title이 없는 원고는 빌드를 멈춘다', () => {
  assert.throws(() => parsePost('x.md', '---\ndate: 2026-01-01\n---\n본문'), /title/);
});

test('실제 원고 7편: 필수 항목과 feature 값이 올바르다', () => {
  const posts = loadPosts(join(root, 'posts'));
  assert.ok(posts.length >= 7);
  for (const p of posts) {
    assert.ok(p.title && p.summary && p.tags.length, `${p.slug} 필수 항목 누락`);
    assert.ok(FEATURES[p.feature], `${p.slug} feature 값 오류: ${p.feature}`);
  }
  // 최신 글이 먼저
  assert.ok(posts[0].date >= posts[posts.length - 1].date);
});

test('글을 소제목 단위 조각으로 나누고, 각 조각에 출처 URL이 있다', () => {
  const post = parsePost('2026-01-01-a.md', `---\ntitle: 테스트\ntags: [t]\nfeature: game\n---\n## 첫 소제목\n가나다.\n## 둘째 소제목\n- 라마\n- 바사`);
  const chunks = chunkPost(post);
  assert.equal(chunks.length, 2);
  assert.equal(chunks[0].url, '/posts/a#첫-소제목');
  assert.equal(chunks[1].feature, 'game');
  assert.match(chunks[1].text, /· 라마 · 바사/);
});

test('긴 문단은 maxLen 근처에서 다시 나눈다', () => {
  const long = '문장입니다. '.repeat(100);
  const post = parsePost('2026-01-01-b.md', `---\ntitle: 긴글\n---\n## 소제목\n${long}`);
  const chunks = chunkPost(post, 200);
  assert.ok(chunks.length > 1);
  assert.ok(chunks.every((c) => c.text.length <= 210));
});
