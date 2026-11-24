// 「클로버에게 물어보기」 챗봇 위젯 (브라우저 전용)
// 핵심 로직은 lib/clover.js 에 있고, 여기서는 화면과 Firebase 연결만 담당해요.
import { askClover } from './lib/clover.js';
import { prepareIndex } from './lib/search.js';
import { createRateLimiter } from './lib/ratelimit.js';
import { escapeHtml } from './lib/markdown.js';
import { featureLink } from './config.js';
import * as fb from './firebase-config.js';

const SUGGESTIONS = ['잠이 안 올 때 뭐 해요?', '내가 적은 걱정은 저장돼요?', '번아웃에 좋은 책 추천해 줘', '4-4 호흡은 어떻게 해요?'];
const limiter = createRateLimiter({ limit: 10, windowMs: 60_000 });

let indexPromise = null;
let firebasePromise = null;

function loadIndex() {
  indexPromise ||= fetch('/search-index.json').then((r) => r.json()).then(prepareIndex);
  return indexPromise;
}

/** Firebase AI Logic 연결 — 설정이 없거나 실패하면 null (데모 모드) */
function loadFirebase() {
  if (firebasePromise) return firebasePromise;
  firebasePromise = (async () => {
    if (!fb.firebaseConfig.apiKey || !fb.firebaseConfig.projectId) return null;
    const base = `https://www.gstatic.com/firebasejs/${fb.FIREBASE_SDK_VERSION}`;
    try {
      const { initializeApp } = await import(`${base}/firebase-app.js`);
      const { getAI, getGenerativeModel, GoogleAIBackend } = await import(`${base}/firebase-ai.js`);
      const app = initializeApp(fb.firebaseConfig);
      if (fb.RECAPTCHA_SITE_KEY) {
        const { initializeAppCheck, ReCaptchaEnterpriseProvider } = await import(`${base}/firebase-app-check.js`);
        initializeAppCheck(app, { provider: new ReCaptchaEnterpriseProvider(fb.RECAPTCHA_SITE_KEY), isTokenAutoRefreshEnabled: true });
      }
      const ai = getAI(app, { backend: new GoogleAIBackend() });
      const models = new Map();
      const generate = async ({ system, prompt }) => {
        if (!models.has(system)) {
          models.set(system, getGenerativeModel(ai, {
            model: fb.GEMINI_MODEL,
            systemInstruction: system,
            generationConfig: { temperature: 0.3, maxOutputTokens: 600 },
          }));
        }
        const result = await models.get(system).generateContent(prompt);
        return result.response.text();
      };
      let onGap = () => {};
      if (fb.LOG_CONTENT_GAPS) {
        const { getFirestore, collection, addDoc, serverTimestamp } = await import(`${base}/firebase-firestore.js`);
        const db = getFirestore(app);
        onGap = (q) => addDoc(collection(db, 'content_gaps'), { q, page: location.pathname, createdAt: serverTimestamp() }).catch(() => {});
      }
      return { generate, onGap };
    } catch (err) {
      console.warn('[clover] Firebase 연결 실패, 데모 모드로 동작해요', err);
      return null;
    }
  })();
  return firebasePromise;
}

function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function mount(root) {
  const fab = el(`<button type="button" class="chat-fab" aria-haspopup="dialog" aria-controls="clover-panel">🍀 클로버에게 물어보기</button>`);
  const panel = el(`<section class="chat-panel" id="clover-panel" role="dialog" aria-label="클로버에게 물어보기" hidden>
    <div class="chat-head">
      <span class="avatar" aria-hidden="true">🍀</span>
      <div><strong>클로버에게 물어보기</strong><small>마음버블 블로그 글을 찾아 답해 드려요</small></div>
      <button type="button" class="close" aria-label="닫기">×</button>
    </div>
    <div class="chat-log" aria-live="polite"></div>
    <form class="chat-form">
      <input name="q" type="text" maxlength="300" autocomplete="off" placeholder="예: 잠이 안 올 때 뭐 해요?" aria-label="질문 입력">
      <button type="submit">보내기</button>
    </form>
    <p class="chat-note">AI 답변은 틀릴 수 있어요 · 질문 원문은 저장하지 않아요 · 위급하면 109</p>
  </section>`);
  root.append(fab, panel);

  const log = panel.querySelector('.chat-log');
  const form = panel.querySelector('.chat-form');
  const input = form.querySelector('input');
  const sendBtn = form.querySelector('button');

  const addMsg = (cls, html) => {
    const m = el(`<div class="msg ${cls}"></div>`);
    m.innerHTML = html;
    log.append(m);
    log.scrollTop = log.scrollHeight;
    return m;
  };

  const greet = () => {
    addMsg('bot', '안녕하세요, 클로버예요 🍀 마음버블 블로그에 있는 글을 찾아서 답해 드릴게요. 무엇이 궁금하세요?');
    const chips = el(`<div class="chips"></div>`);
    for (const s of SUGGESTIONS) {
      const b = el(`<button type="button"></button>`);
      b.textContent = s;
      b.addEventListener('click', () => { input.value = s; form.requestSubmit(); });
      chips.append(b);
    }
    log.append(chips);
  };

  const open = () => {
    panel.hidden = false;
    fab.hidden = true;
    if (!log.childElementCount) greet();
    loadIndex(); loadFirebase();
    setTimeout(() => input.focus(), 50);
  };
  const close = () => { panel.hidden = true; fab.hidden = false; fab.focus(); };

  fab.addEventListener('click', open);
  document.querySelectorAll('[data-open-chat]').forEach((b) => b.addEventListener('click', open));
  panel.querySelector('.close').addEventListener('click', close);
  panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const question = input.value;
    if (!question.trim()) return;
    const gate = limiter.tryHit();
    addMsg('user', escapeHtml(question));
    input.value = '';
    if (!gate.ok) {
      addMsg('bot', `질문이 너무 빨라요. ${gate.retryInSec}초 뒤에 다시 물어봐 주세요 🍃`);
      return;
    }
    sendBtn.disabled = true;
    const typing = addMsg('bot typing', '클로버가 블로그 글을 찾고 있어요…');
    try {
      const [index, firebase] = await Promise.all([loadIndex(), loadFirebase()]);
      const res = await askClover({
        question, index, featureLink,
        generate: firebase?.generate,
        onGap: (q) => { console.info('[content-gap]', q); firebase?.onGap(q); },
      });
      typing.remove();
      renderAnswer(res);
    } catch (err) {
      typing.remove();
      addMsg('bot', '앗, 답을 만들다가 문제가 생겼어요. 잠시 뒤에 다시 시도해 주세요.');
      console.error(err);
    } finally {
      sendBtn.disabled = false;
      input.focus();
    }
  });

  function renderAnswer(res) {
    let html = escapeHtml(res.answer);
    if (res.links?.length) {
      html += `<div class="sources">${res.links.map((l) => `<a href="${escapeHtml(l.url)}">📞 ${escapeHtml(l.label)}</a>`).join('')}</div>`;
    }
    if (res.sources?.length) {
      html += `<div class="sources"><strong>📖 근거가 된 글</strong>${res.sources
        .map((s, i) => `<a href="${escapeHtml(s.url)}">[${i + 1}] ${escapeHtml(s.title)} · ${escapeHtml(s.heading)}</a>`).join('')}</div>`;
    }
    if (res.feature) {
      html += `<a class="feature-link" href="${escapeHtml(res.feature.url)}" target="_blank" rel="noopener" data-feature="${res.feature.key}">${res.feature.emoji} 마음버블에서 ${escapeHtml(res.feature.label)}</a>`;
    }
    if (res.type === 'demo' || res.type === 'fallback') {
      html += `<span class="mode">데모 모드: AI 대신 블로그 문단을 그대로 보여 드렸어요</span>`;
    }
    addMsg(`bot ${res.type === 'crisis' ? 'crisis' : ''}`, html);
  }
}

const root = document.getElementById('clover-chat');
if (root) mount(root);
