import { escapeHtml } from './markdown.js';
import { SITE, featureLink, appLink } from '../site/config.js';

// 배포마다 바뀌는 자산 버전 — 주소가 바뀌어 브라우저가 예전 파일을 쓰지 않게 함 (성공·실패 #18)
let ASSET_VERSION = '1';
export function setAssetVersion(v) { ASSET_VERSION = String(v); }

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
<link rel="icon" href="/assets/icons/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/icon-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/icons/icon-180.png">
<link rel="manifest" href="/assets/manifest.webmanifest">
<meta name="theme-color" content="#a7d8b8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Dodum&display=swap">
<link rel="stylesheet" href="/assets/style.css?v=${ASSET_VERSION}">
</head>
<body>
<div class="deco" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
<header class="top">
  <a class="brand" href="/"><img class="brand-icon" src="/assets/icons/icon-192.png" alt="" aria-hidden="true" width="34" height="34"><span>${escapeHtml(SITE.name)}</span></a>
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
  <p class="small"><a class="privacy-link" href="/privacy">🔒 개인정보 처리방침</a></p>
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

// 개인정보 처리방침 — 실제 코드가 보내고 저장하는 항목만 적어요 (site/chat.js, lib/clover.js, lib/validate.js)
export const PRIVACY_EFFECTIVE_DATE = '2026-11-24';
export function renderPrivacy() {
  return layout({
    title: '개인정보 처리방침',
    description: '마음버블 블로그와 챗봇 「클로버에게 물어보기」가 어떤 정보를 쓰고 저장하는지 안내해요.',
    path: '/privacy',
    body: `<article class="post privacy">
  <a class="back" href="/">← 글 목록</a>
  <h1>🔒 개인정보 처리방침</h1>
  <p class="lead">마음버블 블로그는 <strong>회원가입·로그인이 없고</strong>, 이름·이메일·전화번호를 받지 않아요. 광고·분석 도구나 추적 쿠키도 쓰지 않아요.</p>
  <h2>1. 챗봇에 질문하면</h2>
  <ul>
    <li>블로그 글 검색은 <strong>내 브라우저 안에서</strong> 이뤄져요.</li>
    <li>답변을 만들기 위해 질문과 검색된 블로그 문단이 <strong>중계 서버(Cloudflare)를 거쳐 Anthropic(Claude API)</strong>으로 전송돼요. 중계 서버와 운영자는 질문 원문을 저장하지 않아요.</li>
    <li>위기 표현이나 진단·약 질문은 AI로 보내지 않고 화면에서 바로 상담 번호를 안내해요.</li>
  </ul>
  <h2>2. 블로그에 답이 없던 질문</h2>
  <ul>
    <li>다음 글 주제를 정하기 위해, 답하지 못한 질문만 <strong>전화번호·이메일·주민등록번호를 가린 뒤</strong> 질문 페이지 주소, 시각과 함께 Firebase(Firestore)에 기록해요.</li>
    <li>누가 물었는지 알 수 있는 정보(이름, 계정, IP 주소)는 함께 저장하지 않아요.</li>
    <li>보관 기간: 글 주제 검토 후 삭제하며 최대 90일을 넘기지 않아요.</li>
    <li>나를 알아볼 수 있는 내용은 질문에 적지 말아 주세요.</li>
  </ul>
  <h2>3. 외부 서비스</h2>
  <ul>
    <li><strong>Firebase Hosting(Google)</strong>: 사이트 전달을 위해 보안·장애 대응용 접속 기록을 처리할 수 있어요.</li>
    <li><strong>Cloudflare · Anthropic</strong>: 챗봇 답변 생성을 위해 질문과 블로그 문단을 처리해요.</li>
    <li><strong>Google Fonts</strong>: 글꼴을 불러올 때 접속 주소가 Google에 전달될 수 있어요. 차단돼도 기본 글꼴로 정상 동작해요.</li>
    <li><strong>마음버블 링크</strong>: 버튼을 누르면 마음버블 사이트로 이동해요. 주소 끝의 <code>utm_source</code> 표시는 "블로그에서 왔다"는 정보만 담아요.</li>
  </ul>
  <h2>4. 안전 안내</h2>
  <p>마음버블은 상담·치료를 대신하지 않아요. 자살예방 상담전화 <a href="tel:109">109</a> · 정신건강 위기상담 <a href="tel:15770199">1577-0199</a> (24시간) · 긴급 <a href="tel:119">119</a></p>
  <h2>5. 변경</h2>
  <p>방침이 바뀌면 이 페이지에 먼저 알려 드려요. 시행일: ${PRIVACY_EFFECTIVE_DATE}</p>
</article>`,
  });
}

export function render404() {
  return layout({
    title: '페이지를 찾을 수 없어요',
    body: `<section class="hero"><div class="bubble-hero">🫧</div><h1>이 버블은 이미 날아갔어요</h1><p>주소를 확인하거나 <a class="nav-list" href="/">글 목록</a>으로 돌아가 주세요.</p></section>`,
  });
}
