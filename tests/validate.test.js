import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateQuestion, maskPersonalInfo, MAX_QUESTION_LENGTH } from '../lib/validate.js';
import { createRateLimiter } from '../lib/ratelimit.js';

test('빈 값·공백·숫자는 거절', () => {
  assert.equal(validateQuestion('').ok, false);
  assert.equal(validateQuestion('   ').ok, false);
  assert.equal(validateQuestion(123).ok, false);
});

test('공백을 정리하고 길이 제한을 지킨다', () => {
  assert.deepEqual(validateQuestion('  잠이   안 와요 '), { ok: true, value: '잠이 안 와요' });
  assert.equal(validateQuestion('가'.repeat(MAX_QUESTION_LENGTH)).ok, true);
  assert.equal(validateQuestion('가'.repeat(MAX_QUESTION_LENGTH + 1)).ok, false);
});

test('로그 전 개인정보 마스킹', () => {
  const m = maskPersonalInfo('010-1234-5678로 연락, test@a.com, 900101-1234567, 02-123-4567');
  assert.ok(!/\d{4}/.test(m.replace(/\[.+?\]/g, '')), m);
  assert.match(m, /\[전화번호\].*\[이메일\].*\[주민번호\]/);
});

test('호출 제한: 분당 10회를 넘으면 막고, 1분 뒤 풀린다', () => {
  let t = 0;
  const rl = createRateLimiter({ limit: 10, windowMs: 60_000, now: () => t });
  for (let i = 0; i < 10; i++) assert.equal(rl.tryHit().ok, true);
  const blocked = rl.tryHit();
  assert.equal(blocked.ok, false);
  assert.equal(blocked.retryInSec, 60);
  t = 60_001;
  assert.equal(rl.tryHit().ok, true);
});
