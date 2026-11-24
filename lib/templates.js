import { escapeHtml } from './markdown.js';
import { SITE, featureLink, appLink } from '../site/config.js';

const ASSET_VERSION = '1';

export function layout({ title, description, body, path = '/' }) {
  const fullTitle = title ? `${title} | ${SITE.name}` : SITE.name;
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(fullTitle)}</title>
<meta name="description" content="${escapeHtml(description || SITE.tagline)}">
<meta property="og:title" content="${escapeHtml(fullTitle)}">
<meta property="og:description" content="${escapeHtml(description || SITE.tagline)}">
<meta property="og:type" content="${path === '/' ? 'website' : 'article'}">
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍀</text></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Dodum&display=swap">
<link rel="stylesheet" href="/assets/style.css?v=${ASSET_VERSION}">
</head>
<body>
<div class="deco" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
<header class="top">
  <a class="brand" href="/"><span class="brand-icon">🍀</span><span>${escapeHtml(SITE.name)}</span></a>
  <nav>
    <a class="nav-list" href="/">글 목록</a>
    <a class="go-app" href="${escapeHtml(appLink('/', 'header'))}" target="_blank" rel="noopener">마음버블 열기 ↗</a>
  </nav>
</header>
<main>
${body}
</main>
<footer class="foot">
  <p>이곳에 두고 간 걱정은 맑은 바람이 멀리 가져갔어요 🍃</p>
  <p class="small">마음버블은 쉼터일 뿐 상담·치료를 대신하지 않아요. 많이 힘들 땐 자살예방 상담전화 <strong>109</strong>, 정신건강 위기상담 <strong>1577-0199</strong> (24시간)</p>
</footer>
<div id="clover-chat"></div>
<script type="module" src="/assets/chat.js?v=${ASSET_VERSION}"></script>
</body>
</html>
`;
}

function formatDate(d) {
  const [y, m, day] = String(d).split('-');
  return `${y}년 ${Number(m)}월 ${Number(day)}일`;
}

function tagList(tags) {
  return `<ul class="tags">${tags.map((t) => `<li>#${escapeHtml(t)}</li>`).join('')}</ul>`;
}

export function renderIndex(posts) {
  const cards = posts
    .map(
      (p) => `<article class="card">
  <a href="/posts/${p.slug}">
    <time datetime="${p.date}">${formatDate(p.date)}</time>
    <h2>${escapeHtml(p.title)}</h2>
    <p>${escapeHtml(p.summary)}</p>
    ${tagList(p.tags)}
  </a>
</article>`,
    )
    .join('\n');
  return layout({
    title: '',
    description: SITE.tagline,
    path: '/',
    body: `<section class="hero">
  <div class="bubble-hero" aria-hidden="true">🍀</div>
  <h1>마음이 무거운 날, 쉬어 가는 글</h1>
  <p>${escapeHtml(SITE.tagline)}</p>
  <button type="button" class="ask-cta" data-open-chat>🍀 클로버에게 물어보기</button>
  <p class="hint">"잠이 안 올 때 뭐 해요?"처럼 편하게 물어보면, 블로그 글을 찾아 답해 드려요.</p>
</section>
<section class="list" aria-label="글 목록">
${cards}
</section>`,
  });
}

export function renderPost(post, others) {
  const f = featureLink(post.feature, 'post');
  const more = others
    .slice(0, 3)
    .map((o) => `<li><a href="/posts/${o.slug}">${escapeHtml(o.title)}</a></li>`)
    .join('');
  return layout({
    title: post.title,
    description: post.summary,
    path: `/posts/${post.slug}`,
    body: `<article class="post">
  <a class="back" href="/">← 글 목록</a>
  <header>
    <time datetime="${post.date}">${formatDate(post.date)}</time>
    <h1>${escapeHtml(post.title)}</h1>
    ${tagList(post.tags)}
  </header>
  <div class="content">
${post.html}
  </div>
  <aside class="try">
    <p>읽기만 하지 말고 지금 바로 해 볼까요?</p>
    <a class="try-btn" href="${escapeHtml(f.url)}" target="_blank" rel="noopener" data-feature="${f.key}">${f.emoji} ${escapeHtml(f.label)}</a>
  </aside>
  <nav class="more"><h2>다른 글</h2><ul>${more}</ul></nav>
</article>`,
  });
}

export function render404() {
  return layout({
    title: '페이지를 찾을 수 없어요',
    body: `<section class="hero"><div class="bubble-hero">🫧</div><h1>이 버블은 이미 날아갔어요</h1><p>주소를 확인하거나 <a class="nav-list" href="/">글 목록</a>으로 돌아가 주세요.</p></section>`,
  });
}
