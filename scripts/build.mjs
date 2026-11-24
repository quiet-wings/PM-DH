// 원고(posts/*.md) → 정적 사이트(public/) + 챗봇 검색 색인
// 실행: node scripts/build.mjs
import { mkdirSync, writeFileSync, cpSync, rmSync, readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPosts, chunkPost } from '../lib/posts.js';
import { renderIndex, renderPost, render404, renderPrivacy, setAssetVersion } from '../lib/templates.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public');

export function build() {
  const version = process.env.GITHUB_SHA ? process.env.GITHUB_SHA.slice(0, 8) : Date.now().toString(36);
  setAssetVersion(version);
  const posts = loadPosts(join(root, 'posts'));
  rmSync(out, { recursive: true, force: true });
  mkdirSync(join(out, 'posts'), { recursive: true });
  mkdirSync(join(out, 'assets', 'lib'), { recursive: true });

  writeFileSync(join(out, 'index.html'), renderIndex(posts));
  for (const post of posts) {
    const others = posts.filter((p) => p.slug !== post.slug);
    writeFileSync(join(out, 'posts', `${post.slug}.html`), renderPost(post, others));
  }
  writeFileSync(join(out, '404.html'), render404());
  writeFileSync(join(out, 'privacy.html'), renderPrivacy());

  // 챗봇 검색 색인: 글을 문단 조각으로 나눠 JSON으로 저장
  const chunks = posts.flatMap((p) => chunkPost(p));
  const index = {
    builtAt: new Date().toISOString(),
    posts: posts.map(({ slug, title, date, tags, summary, feature }) => ({ slug, title, date, tags, summary, feature })),
    chunks,
  };
  writeFileSync(join(out, 'search-index.json'), JSON.stringify(index));

  // 정적 자산 + 브라우저에서도 쓰는 순수 로직(lib) 복사
  cpSync(join(root, 'site'), join(out, 'assets'), { recursive: true });
  const browserLibs = readdirSync(join(root, 'lib')).filter((f) => f.endsWith('.js') && !['posts.js', 'templates.js'].includes(f));
  for (const f of browserLibs) cpSync(join(root, 'lib', f), join(out, 'assets', 'lib', f));

  injectFirebaseConfig();
  versionImports(join(out, 'assets'), version);
  return { posts: posts.length, chunks: chunks.length, version };
}

/**
 * 실제 Firebase 웹 설정을 빌드 결과물에만 넣는다 (저장소에는 샘플 키만, D-016)
 * 우선순위: 환경변수 FIREBASE_WEB_CONFIG(JSON) → site/firebase-config.local.js → 샘플 그대로(데모 모드)
 */
export function injectFirebaseConfig(env = process.env) {
  const target = join(out, 'assets', 'firebase-config.js');
  const local = join(root, 'site', 'firebase-config.local.js');
  if (env.FIREBASE_WEB_CONFIG) {
    let cfg;
    try { cfg = JSON.parse(env.FIREBASE_WEB_CONFIG); } catch { throw new Error('FIREBASE_WEB_CONFIG가 올바른 JSON이 아니에요'); }
    for (const k of ['apiKey', 'projectId', 'appId']) if (!cfg[k]) throw new Error(`FIREBASE_WEB_CONFIG에 ${k}가 없어요`);
    const src = readFileSync(target, 'utf8').replace(/export const firebaseConfig = \{[\s\S]*?\};/, `export const firebaseConfig = ${JSON.stringify(cfg, null, 2)};`);
    writeFileSync(target, src);
    return 'env';
  }
  if (existsSync(local)) { cpSync(local, target); return 'local'; }
  return 'sample';
}

/** 자산 JS 안의 상대 import에도 ?v=버전을 붙여, 연결된 모듈까지 새 주소로 받게 한다 (성공·실패 #18) */
export function versionImports(dir, version) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) { versionImports(p, version); continue; }
    if (!entry.name.endsWith('.js')) continue;
    const src = readFileSync(p, 'utf8');
    const next = src.replace(/(from\s+['"])(\.{1,2}\/[^'"?]+\.js)(['"])/g, `$1$2?v=${version}$3`);
    if (next !== src) writeFileSync(p, next);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const r = build();
  console.log(`✅ 빌드 완료: 글 ${r.posts}편, 검색 조각 ${r.chunks}개 → public/`);
}
