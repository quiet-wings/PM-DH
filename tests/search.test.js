import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from '../scripts/build.mjs';
import { tokenize, stripParticle, prepareIndex, search, isRelevant } from '../lib/search.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
build();
const index = prepareIndex(JSON.parse(readFileSync(join(root, 'public', 'search-index.json'), 'utf8')));

test('조사를 떼고 2글자 조각으로 나눈다', () => {
  assert.equal(stripParticle('호흡은'), '호흡');
  assert.equal(stripParticle('책으로'), '책');
  assert.deepEqual(tokenize('호흡법은 어떻게 해요?'), ['호흡', '흡법']);
});

// 블로그에 답이 있는 질문 → 기대하는 글이 상위 2개 안에 있어야 한다
const ANSWERABLE = [
  ['잠이 안 올 때 뭐 해요?', '4-4 호흡법'],
  ['4-4 호흡 순서 알려줘', '4-4 호흡법'],
  ['내가 적은 걱정은 저장돼요?', '자주 묻는 질문'],
  ['다크모드 있어요?', '자주 묻는 질문'],
  ['회원가입 해야 하나요?', '자주 묻는 질문'],
  ['번아웃에 좋은 책 추천해줘', '책 고르기'],
  ['남의 시선이 신경 쓰여요', '책 고르기'],
  ['소리 끄는 법', '자주 묻는 질문'],
  ['지쳐서 아무것도 하기 싫어요', '번아웃'],
  ['챗봇은 어떻게 만들었어?', '개발일지'],
];
for (const [q, expect] of ANSWERABLE) {
  test(`답 있는 질문: "${q}" → ${expect}`, () => {
    const r = search(index, q, 4);
    assert.ok(isRelevant(q, r), '관련 있음으로 판정돼야 함');
    assert.ok(r.slice(0, 2).some((x) => x.title.includes(expect)), `상위 결과: ${r.map((x) => x.title).join(', ')}`);
  });
}

// 블로그 범위 밖 질문 → 근거 없음으로 판정 (지어내지 않기 위해)
const OUT_OF_SCOPE = ['오늘 서울 날씨 알려줘', '파이썬 코드 짜줘', '주식 투자 어떻게 해요?', '치킨 맛집 추천', '비트코인 전망'];
for (const q of OUT_OF_SCOPE) {
  test(`범위 밖 질문: "${q}" → 근거 없음`, () => {
    assert.equal(isRelevant(q, search(index, q, 4)), false);
  });
}
