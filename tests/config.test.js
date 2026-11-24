import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, injectFirebaseConfig } from '../scripts/build.mjs';
import { isRealConfig } from '../lib/config-check.js';
import { firebaseConfig } from '../site/firebase-config.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const built = join(root, 'public', 'assets', 'firebase-config.js');
const local = join(root, 'site', 'firebase-config.local.js');

test('저장소의 Firebase 설정은 샘플 키만 담고, 실제 키 형식(AIza…)이 없다', () => {
  assert.equal(isRealConfig(firebaseConfig), false);
  assert.ok(!/AIza[0-9A-Za-z_-]{20,}/.test(readFileSync(join(root, 'site', 'firebase-config.js'), 'utf8')));
});

test('샘플·빈 값은 데모 모드, 실제 값만 연결 대상', () => {
  assert.equal(isRealConfig({ apiKey: '', projectId: 'p' }), false);
  assert.equal(isRealConfig({ apiKey: 'YOUR_FIREBASE_API_KEY', projectId: 'YOUR_PROJECT_ID' }), false);
  assert.equal(isRealConfig({ apiKey: 'abc', projectId: 'real-project' }), true);
});

test('빌드: 환경변수 FIREBASE_WEB_CONFIG가 있으면 결과물에만 실제 값을 넣는다', () => {
  build();
  const cfg = { apiKey: 'test-key-123', projectId: 'demo-proj', appId: '1:2:web:3' };
  assert.equal(injectFirebaseConfig({ FIREBASE_WEB_CONFIG: JSON.stringify(cfg) }), 'env');
  const out = readFileSync(built, 'utf8');
  assert.match(out, /"apiKey": "test-key-123"/);
  assert.match(out, /export const GEMINI_MODEL/); // 나머지 설정은 유지
  assert.match(readFileSync(join(root, 'site', 'firebase-config.js'), 'utf8'), /YOUR_FIREBASE_API_KEY/); // 원본은 그대로
});

test('빌드: 잘못된 JSON이나 필수 값 누락은 배포 전에 실패시킨다', () => {
  build();
  assert.throws(() => injectFirebaseConfig({ FIREBASE_WEB_CONFIG: '{bad' }), /JSON/);
  assert.throws(() => injectFirebaseConfig({ FIREBASE_WEB_CONFIG: '{"apiKey":"a"}' }), /projectId/);
});

test('빌드: 환경변수가 없으면 local 파일, 그것도 없으면 샘플 그대로', () => {
  build();
  assert.equal(injectFirebaseConfig({}), 'sample');
  writeFileSync(local, "export const firebaseConfig = { apiKey: 'local-key', projectId: 'p' };");
  try {
    assert.equal(injectFirebaseConfig({}), 'local');
    assert.match(readFileSync(built, 'utf8'), /local-key/);
  } finally {
    rmSync(local, { force: true });
    build();
  }
});
