// 블로그 전체를 HTML 파일 하나로 묶은 오프라인 미리보기 (챗봇은 데모 모드)
// 실행: node scripts/preview.mjs [출력 경로]  → 기본: preview/maeum-bubble-blog-preview.html
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from './build.mjs';
import { loadPosts, chunkPost } from '../lib/posts.js';
import { escapeHtml } from '../lib/markdown.js';
import { SITE, featureLink, appLink } from '../site/config.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = process.argv[2] || join(root, 'preview', 'maeum-bubble-blog-preview.html');
build();

const posts = loadPosts(join(root, 'posts'));
const chunks = posts.flatMap((p) => chunkPost(p)).map((c) => ({ ...c, url: `#post-${c.slug}` }));
const index = { posts: posts.map(({ slug, title }) => ({ slug, title })), chunks };

// ES 모듈들을 하나의 스크립트로 합치기 (import 줄 제거, export 키워드 제거)
const strip = (src) => src.replace(/^import[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '').replace(/^export\s+(?=(const|function|async|class|let))/gm, '').replace(/^export\s*\{[^}]*\}.*$/gm, '');
const mods = ['lib/markdown.js', 'lib/config-check.js', 'lib/validate.js', 'lib/safety.js', 'lib/search.js', 'lib/prompt.js', 'lib/ratelimit.js', 'lib/clover.js', 'site/config.js']
  .map((f) => `// ── ${f}\n${strip(readFileSync(join(root, f), 'utf8'))}`).join('\n');
let chat = strip(readFileSync(join(root, 'site', 'chat.js'), 'utf8'))
  .replace("fetch('/search-index.json').then((r) => r.json()).then(prepareIndex)", 'Promise.resolve(prepareIndex(__INDEX__))')
  .replace(/function loadFirebase\(\) \{[\s\S]*?\n\}\n/, 'function loadFirebase() { return Promise.resolve(null); }\n');

const css = readFileSync(join(root, 'site', 'style.css'), 'utf8');
const date = (d) => { const [y, m, day] = d.split('-'); return `${y}년 ${+m}월 ${+day}일`; };
const tags = (t) => `<ul class="tags">${t.map((x) => `<li>#${escapeHtml(x)}</li>`).join('')}</ul>`;

const home = `<section class="page" id="home">
<section class="hero"><div class="bubble-hero" aria-hidden="true">🍀</div><h1>마음이 무거운 날, 쉬어 가는 글</h1><p>${escapeHtml(SITE.tagline)}</p>
<button type="button" class="ask-cta" data-open-chat>🍀 클로버에게 물어보기</button><p class="hint">오프라인 미리보기예요. 챗봇은 AI 없이 블로그 문단으로 답하는 데모 모드로 동작해요.</p></section>
<section class="list">${posts.map((p) => `<article class="card"><a href="#post-${p.slug}"><time>${date(p.date)}</time><h2>${escapeHtml(p.title)}</h2><p>${escapeHtml(p.summary)}</p>${tags(p.tags)}</a></article>`).join('')}</section></section>`;
const pages = posts.map((p) => {
  const f = featureLink(p.feature, 'post');
  return `<section class="page" id="post-${p.slug}" hidden><article class="post"><a class="back" href="#home">← 글 목록</a><header><time>${date(p.date)}</time><h1>${escapeHtml(p.title)}</h1>${tags(p.tags)}</header>
<div class="content">${p.html}</div><aside class="try"><p>읽기만 하지 말고 지금 바로 해 볼까요?</p><a class="try-btn" href="${f.url}" target="_blank" rel="noopener">${f.emoji} ${escapeHtml(f.label)}</a></aside></article></section>`;
}).join('\n');

const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${SITE.name} (미리보기)</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Dodum&display=swap"><style>${css}</style></head><body>
<div class="deco" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
<header class="top"><a class="brand" href="#home"><span class="brand-icon">🍀</span><span>${SITE.name}</span></a><nav><a class="nav-list" href="#home">글 목록</a><a class="go-app" href="${appLink('/', 'header')}" target="_blank" rel="noopener">마음버블 열기 ↗</a></nav></header>
<main>${home}${pages}</main>
<footer class="foot"><p>이곳에 두고 간 걱정은 맑은 바람이 멀리 가져갔어요 🍃</p><p class="small">마음버블은 쉼터일 뿐 상담·치료를 대신하지 않아요. 많이 힘들 땐 자살예방 상담전화 <strong>109</strong>, 정신건강 위기상담 <strong>1577-0199</strong> (24시간)</p></footer>
<div id="clover-chat"></div>
<script>
function route(){const id=(location.hash||'#home').slice(1).split('#')[0];const pageId=document.getElementById(id)?id:'home';document.querySelectorAll('.page').forEach(s=>s.hidden=s.id!==pageId);window.scrollTo(0,0);}
addEventListener('hashchange',route);route();
const __INDEX__=${JSON.stringify(index)};
${mods}
${chat}
</script></body></html>`;

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html);
console.log(`✅ 미리보기 파일: ${out} (${Math.round(html.length / 1024)}KB)`);
