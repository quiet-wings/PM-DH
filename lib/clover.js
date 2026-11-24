// 챗봇 핵심 흐름 — UI·Firebase와 분리해 단위테스트가 가능하게 했다.
// 검증 → 위기 감지 → 검색 → (근거 없으면 갭 기록) → AI 생성 → 실패 시 데모 답변
import { validateQuestion, maskPersonalInfo } from './validate.js';
import { detectCrisis, CRISIS_RESPONSE, detectMedical, MEDICAL_RESPONSE } from './safety.js';
import { search, isRelevant } from './search.js';
import { SYSTEM_INSTRUCTION, buildPrompt, parseAnswer } from './prompt.js';

export const NO_CONTEXT_ANSWER =
  '아쉽지만 그 내용은 아직 블로그에 없어요. 🍀 남겨 주신 질문은 다음 글 주제로 참고할게요.\n' +
  '대신 "잠이 안 올 때", "번아웃", "책 추천", "기록 저장"처럼 물어보시면 블로그 글로 답해 드릴 수 있어요.';

function uniqueSources(passages, max = 3) {
  const seen = new Set();
  const out = [];
  for (const p of passages) {
    if (seen.has(p.slug)) continue;
    seen.add(p.slug);
    out.push({ title: p.title, heading: p.heading, url: p.url });
    if (out.length >= max) break;
  }
  return out;
}

/** AI 답변의 근거 번호([1]…)를 그대로 살려 출처 목록을 만든다. 번호가 없으면 상위 글 목록 */
export function citedSources(answer, passages) {
  const nums = [...new Set([...String(answer).matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1])))]
    .filter((n) => n >= 1 && n <= passages.length)
    .sort((a, b) => a - b);
  if (!nums.length) return uniqueSources(passages).map((s, i) => ({ ...s, n: i + 1 }));
  return nums.map((n) => ({ title: passages[n - 1].title, heading: passages[n - 1].heading, url: passages[n - 1].url, n }));
}

/** AI 없이 검색된 문단으로 만드는 답 (데모 모드·장애 시 대체) */
export function extractiveAnswer(passages, maxLen = 230) {
  const top = passages[0];
  let text = top.text.replace(/\s*(·|\d\))\s/g, '\n$1 ').trim();
  if (text.length > maxLen) text = `${text.slice(0, maxLen).replace(/\s+\S*$/, '')}…`;
  return `「${top.title}」 글의 '${top.heading}' 부분에 이런 내용이 있어요.\n\n${text}`;
}

/**
 * @param {object} p
 * @param {string} p.question
 * @param {object} p.index  prepareIndex() 결과
 * @param {(req:{system:string,prompt:string})=>Promise<string>} [p.generate]  AI 호출 함수 (없으면 데모 모드)
 * @param {(masked:string)=>void} [p.onGap]  근거 없는 질문 기록
 * @param {(key:string)=>object} p.featureLink
 */
export async function askClover({ question, index, generate, onGap = () => {}, featureLink, timeoutMs = 15000 }) {
  const v = validateQuestion(question);
  if (!v.ok) return { type: 'invalid', answer: v.error, sources: [] };
  const q = v.value;

  if (detectCrisis(q)) return { type: 'crisis', answer: CRISIS_RESPONSE.answer, links: CRISIS_RESPONSE.links, sources: [] };

  if (detectMedical(q)) return { type: 'medical', answer: MEDICAL_RESPONSE, sources: [] };

  const passages = search(index, q, 4);
  if (!isRelevant(q, passages)) {
    onGap(maskPersonalInfo(q));
    return { type: 'no_context', answer: NO_CONTEXT_ANSWER, sources: [] };
  }

  const sources = uniqueSources(passages);
  const feature = featureLink(passages[0].feature);

  if (generate) {
    try {
      const raw = await Promise.race([
        generate({ system: SYSTEM_INSTRUCTION, prompt: buildPrompt(q, passages) }),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), timeoutMs)),
      ]);
      const answer = parseAnswer(raw);
      if (!answer) {
        onGap(maskPersonalInfo(q));
        return { type: 'no_context', answer: NO_CONTEXT_ANSWER, sources: [] };
      }
      return { type: 'ai', answer, sources: citedSources(answer, passages), feature };
    } catch (err) {
      return { type: 'fallback', answer: extractiveAnswer(passages), sources, feature, error: String(err?.message || err) };
    }
  }
  return { type: 'demo', answer: extractiveAnswer(passages), sources, feature };
}
