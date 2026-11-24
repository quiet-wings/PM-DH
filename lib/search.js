// 블로그 문단 검색 (임베딩 없이 키워드 점수로, DECISION_LOG D-005)
// 한국어는 조사가 붙어 단어가 달라지므로 "2글자 조각(bigram)"으로 비교한다.
// 예) "호흡법은" → [호흡, 흡법, 법은]  /  "호흡" → [호흡]  → '호흡'이 겹쳐 점수를 얻는다.

const STOPWORDS = new Set([
  '어떻게', '어떡해', '뭐야', '뭐예요', '뭔가요', '무엇', '알려줘', '알려주세요', '해요', '하나요', '있나요', '있어요',
  '돼요', '되나요', '할까요', '좋을까요', '좋아요', '그리고', '그런데', '근데', '너무', '정말', '진짜', '저는', '제가',
  '나는', '내가', '요즘', '혹시', '그냥', '이거', '그거', '거예요', '건가요', '싶어요', '주세요',
  '뭐', '몇', '왜', '좀', '때', '것', '수', '건', '거', '해줘', '줘', '알려', '어떤', '있어', '있을까', '없어', '하면', '할', '해',
]);

// 일상어 → 블로그에서 쓰는 말 (동의어가 약한 키워드 검색 보완)
const SYNONYMS = {
  잠: ['수면', '잠들기'], 불면: ['잠', '수면'], 숨: ['호흡'], 심호흡: ['호흡'], 긴장: ['불안', '호흡'],
  번아웃: ['피로', '방전', '지쳐'], 지쳐: ['번아웃', '피로'], 피곤: ['피로', '번아웃'], 무기력: ['번아웃', '피로'],
  책: ['서점', '도서'], 추천: ['서점', '골라'], 게임: ['미니게임', '뽁뽁이'], 저장: ['기록', '서버'],
  개인정보: ['저장', '서버', '익명'], 다크모드: ['어두운', '다크'], 영어: ['영어로', '언어'], 회원가입: ['가입', '로그인'],
  걱정: ['버블'], 스트레스: ['걱정', '버블'], 소리: ['효과음', '명상음'], 상담: ['109', '1577-0199'],
};

function normalize(text) {
  return String(text).toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, ' ');
}

// 단어 끝 조사 떼기: "호흡은" → "호흡", "책으로" → "책"
const PARTICLES = /(에서는|에서|으로는|으로|에게|한테|까지|부터|처럼|이랑|이나|이야|예요|이에요|은|는|이|가|을|를|에|로|도|만|과|와|의|요|야)$/;
export function stripParticle(w) {
  if (w.length < 2) return w;
  const s = w.replace(PARTICLES, '');
  return s.length >= 1 ? s : w;
}

export function tokenize(text) {
  const words = normalize(text).split(/\s+/).filter((w) => w && !STOPWORDS.has(w)).map(stripParticle).filter((w) => w && !STOPWORDS.has(w));
  const tokens = [];
  for (const w of words) {
    if (/^[a-z0-9-]+$/.test(w)) { if (w.length > 1) tokens.push(w); continue; }
    if (w.length === 1) { tokens.push(w); continue; }
    for (let i = 0; i < w.length - 1; i++) tokens.push(w.slice(i, i + 2));
  }
  return tokens;
}

export function expandQuery(question) {
  const extra = [];
  for (const [k, vs] of Object.entries(SYNONYMS)) if (question.includes(k)) extra.push(...vs);
  return extra.length ? `${question} ${extra.join(' ')}` : question;
}

/** 색인을 미리 계산 (문서 빈도) */
export function prepareIndex(index) {
  const docs = index.chunks.map((c) => {
    const body = tokenize(c.text);
    const head = tokenize(`${c.title} ${c.heading} ${(c.tags || []).join(' ')}`);
    const tf = new Map();
    for (const t of body) tf.set(t, (tf.get(t) || 0) + 1);
    for (const t of head) tf.set(t, (tf.get(t) || 0) + 2); // 제목·소제목·태그 가중치
    return { chunk: c, tf, len: body.length + head.length };
  });
  const df = new Map();
  for (const d of docs) for (const t of d.tf.keys()) df.set(t, (df.get(t) || 0) + 1);
  const avgLen = docs.reduce((s, d) => s + d.len, 0) / Math.max(docs.length, 1);
  return { docs, df, N: docs.length, avgLen, posts: index.posts };
}

/** BM25 점수로 상위 k개 문단 반환 */
export function search(prepared, question, k = 4) {
  const qTokens = [...new Set(tokenize(expandQuery(question)))];
  if (!qTokens.length) return [];
  const { docs, df, N, avgLen } = prepared;
  const k1 = 1.4, b = 0.6;
  const scored = docs.map((d) => {
    let score = 0;
    for (const t of qTokens) {
      const f = d.tf.get(t);
      if (!f) continue;
      const idf = Math.log(1 + (N - df.get(t) + 0.5) / (df.get(t) + 0.5));
      score += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * d.len) / avgLen)));
    }
    return { ...d.chunk, score: Math.round(score * 100) / 100 };
  });
  return scored.filter((s) => s.score > 0).sort((a, b2) => b2.score - a.score).slice(0, k);
}

function bigrams(w) {
  if (w.length < 2 || /^[a-z0-9-]+$/.test(w)) return [w];
  const out = [];
  for (let i = 0; i < w.length - 1; i++) out.push(w.slice(i, i + 2));
  return out;
}

/** 질문의 핵심 단어 중 몇 %가 해당 문단(또는 동의어)에 나오는지 — 엉뚱한 질문 걸러내기 */
export function coverage(question, passage) {
  const words = [...new Set(normalize(question).split(/\s+/).filter((w) => w && !STOPWORDS.has(w)).map(stripParticle).filter((w) => w && !STOPWORDS.has(w)))];
  if (!words.length) return 0;
  const hay = normalize(`${passage.title} ${passage.heading} ${(passage.tags || []).join(' ')} ${passage.text}`);
  const hayTokens = new Set(tokenize(hay));
  let covered = 0;
  for (const w of words) {
    const cands = [w, ...(SYNONYMS[w] || [])];
    if (cands.some((c) => hay.includes(c) || bigrams(c).some((b) => b.length >= 2 && hayTokens.has(b)))) covered++;
  }
  return covered / words.length;
}

export function isRelevant(question, passages) {
  if (!passages.length) return false;
  const best = Math.max(...passages.slice(0, 2).map((p) => coverage(question, p)));
  return passages[0].score >= MIN_RELEVANCE && best >= MIN_COVERAGE;
}

export const MIN_COVERAGE = 0.5;

/** 이 점수 미만이면 "블로그에 근거 없음"으로 본다 (테스트로 조정한 값) */
export const MIN_RELEVANCE = 2;
