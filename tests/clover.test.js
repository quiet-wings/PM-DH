import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from '../scripts/build.mjs';
import { prepareIndex } from '../lib/search.js';
import { askClover, NO_CONTEXT_ANSWER } from '../lib/clover.js';
import { buildPrompt, parseAnswer, SYSTEM_INSTRUCTION, NO_ANSWER_TOKEN } from '../lib/prompt.js';
import { featureLink } from '../site/config.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
build();
const index = prepareIndex(JSON.parse(readFileSync(join(root, 'public', 'search-index.json'), 'utf8')));
const base = { index, featureLink };

test('프롬프트: 근거 제한 규칙과 번호 붙은 근거가 들어간다', () => {
  assert.match(SYSTEM_INSTRUCTION, /근거.*만 사용/);
  assert.match(SYSTEM_INSTRUCTION, /진단/);
  const p = buildPrompt('질문', [{ title: 'T', heading: 'H', text: '본문' }]);
  assert.match(p, /\[1\] 글: T > H\n본문/);
  assert.match(p, /\[질문\]\n질문$/);
  assert.equal(parseAnswer(NO_ANSWER_TOKEN), null);
  assert.equal(parseAnswer('  답 [1] '), '답 [1]');
});

test('AI 정상 응답 → 답변 + 출처 글 + 마음버블 기능 링크', async () => {
  let seen;
  const res = await askClover({ ...base, question: '잠이 안 올 때 뭐 해요?', generate: async (req) => { seen = req; return '누워서 4-4 호흡을 해 보세요 [1]'; } });
  assert.equal(res.type, 'ai');
  assert.equal(res.answer, '누워서 4-4 호흡을 해 보세요 [1]');
  assert.ok(res.sources.length >= 1 && res.sources[0].url.startsWith('/posts/'));
  assert.equal(res.feature.key, 'breathing');
  assert.match(res.feature.url, /^https:\/\//);
  assert.match(res.feature.url, /utm_source=maeum-blog&utm_medium=chatbot/);
  assert.match(seen.prompt, /\[근거\]/);
});

test('위기 질문은 AI를 부르지 않고 안전 안내', async () => {
  let called = false;
  const res = await askClover({ ...base, question: '요즘 죽고 싶어요', generate: async () => { called = true; return 'x'; } });
  assert.equal(res.type, 'crisis');
  assert.equal(called, false);
  assert.match(res.answer, /109/);
});

test('진단·약 질문은 AI를 부르지 않고 의료진 상담 권유', async () => {
  let called = false;
  const res = await askClover({ ...base, question: '우울증 약 뭐 먹어야 해?', generate: async () => { called = true; return 'x'; } });
  assert.equal(res.type, 'medical');
  assert.equal(called, false);
});

test('범위 밖 질문은 AI를 부르지 않고, 마스킹된 질문을 갭 로그로 남긴다', async () => {
  const gaps = [];
  let called = false;
  const res = await askClover({ ...base, question: '치킨 맛집 추천 010-1111-2222', generate: async () => { called = true; return 'x'; }, onGap: (q) => gaps.push(q) });
  assert.equal(res.type, 'no_context');
  assert.equal(res.answer, NO_CONTEXT_ANSWER);
  assert.equal(called, false);
  assert.deepEqual(gaps, ['치킨 맛집 추천 [전화번호]']);
});

test('AI가 근거 없음([[NO_ANSWER]])이라 답하면 지어내지 않고 갭 로그', async () => {
  const gaps = [];
  const res = await askClover({ ...base, question: '4-4 호흡 순서 알려줘', generate: async () => NO_ANSWER_TOKEN, onGap: (q) => gaps.push(q) });
  assert.equal(res.type, 'no_context');
  assert.equal(gaps.length, 1);
});

test('AI 오류 → 데모 답변으로 대체(서비스 유지)', async () => {
  const res = await askClover({ ...base, question: '다크모드 있어요?', generate: async () => { throw new Error('quota exceeded'); } });
  assert.equal(res.type, 'fallback');
  assert.match(res.answer, /자주 묻는 질문/);
  assert.equal(res.error, 'quota exceeded');
});

test('AI 응답 지연 → 시간 초과 후 데모 답변', async () => {
  const res = await askClover({ ...base, question: '다크모드 있어요?', timeoutMs: 50, generate: () => new Promise(() => {}) });
  assert.equal(res.type, 'fallback');
  assert.equal(res.error, 'timeout');
});

test('Firebase 설정이 없으면 데모 모드로 출처와 함께 답한다', async () => {
  const res = await askClover({ ...base, question: '회원가입 해야 하나요?' });
  assert.equal(res.type, 'demo');
  assert.match(res.answer, /가입/);
  assert.ok(res.sources.length >= 1);
});

test('빈 질문은 친절한 오류 문구', async () => {
  const res = await askClover({ ...base, question: '   ' });
  assert.equal(res.type, 'invalid');
});
