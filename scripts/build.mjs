// 원고(posts/*.md) → 정적 사이트(public/) + 챗봇 검색 색인
// 실행: node scripts/build.mjs
import { mkdirSync, writeFileSync, cpSync, rmSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPosts, chunkPost } from '../lib/posts.js';
import { renderIndex, renderPost, render404, renderPrivacy } from '../lib/templates.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public');

export function build() {
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

  return { posts: posts.length, chunks: chunks.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const r = build();
  console.log(`✅ 빌드 완료: 글 ${r.posts}편, 검색 조각 ${r.chunks}개 → public/`);
}
