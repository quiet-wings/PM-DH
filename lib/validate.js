// 사용자 입력 검증 + 개인정보 마스킹 (브라우저·Node 공용)

export const MAX_QUESTION_LENGTH = 300;

/** @returns {{ok: true, value: string} | {ok: false, error: string}} */
export function validateQuestion(input) {
  if (typeof input !== 'string') return { ok: false, error: '질문을 글자로 입력해 주세요.' };
  const value = input.replace(/\s+/g, ' ').trim();
  if (!value) return { ok: false, error: '궁금한 걸 한 줄 적어 주세요.' };
  if (value.length > MAX_QUESTION_LENGTH) {
    return { ok: false, error: `질문은 ${MAX_QUESTION_LENGTH}자 이내로 줄여 주세요.` };
  }
  return { ok: true, value };
}

/** 로그에 남기기 전에 전화번호·이메일·주민번호 형태를 가린다 */
export function maskPersonalInfo(text) {
  return String(text)
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[이메일]')
    .replace(/\d{6}\s*-\s*[1-4]\d{6}/g, '[주민번호]')
    .replace(/01[016789][-\s.]?\d{3,4}[-\s.]?\d{4}/g, '[전화번호]')
    .replace(/0\d{1,2}[-\s.]?\d{3,4}[-\s.]?\d{4}/g, '[전화번호]');
}
