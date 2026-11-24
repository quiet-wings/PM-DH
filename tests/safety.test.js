import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectCrisis, detectMedical, CRISIS_RESPONSE } from '../lib/safety.js';

const CRISIS = ['요즘 죽고 싶다는 생각이 들어요', '자살하고 싶어', '자해를 했어요', '그냥 사라지고 싶어요', '살기 싫다', '극단적인 선택을 생각해', 'I want to kill myself'];
for (const q of CRISIS) test(`위기 감지: "${q}"`, () => assert.equal(detectCrisis(q), true));

const NOT_CRISIS = ['잠이 안 와요', '마감 때문에 죽을 맛이에요', '『죽고 싶지만 떡볶이는 먹고 싶어』는 어떤 책이에요?', '번아웃 책 추천'];
for (const q of NOT_CRISIS) test(`위기 아님: "${q}"`, () => assert.equal(detectCrisis(q), false));

test('위기 안내에는 109, 1577-0199, 119가 모두 들어 있다', () => {
  for (const n of ['109', '1577-0199', '119']) assert.ok(CRISIS_RESPONSE.answer.includes(n));
  assert.ok(CRISIS_RESPONSE.links.some((l) => l.url === 'tel:109'));
});

test('진단·약 질문 감지', () => {
  assert.equal(detectMedical('우울증 약 뭐 먹어야 해?'), true);
  assert.equal(detectMedical('항우울제 복용 중인데 괜찮을까'), true);
  assert.equal(detectMedical('제가 공황장애인가요?'), true);
  assert.equal(detectMedical('호흡법 알려줘'), false);
  assert.equal(detectMedical('약속에 늦을까 걱정돼요'), false);
});
