// 위기 표현 감지 — AI보다 먼저 규칙으로 처리한다 (DECISION_LOG D-006)
// 스트레스 서비스 특성상 놓치면 안 되므로, 애매하면 안전 안내 쪽으로 기운다.

// 책 제목처럼 위기 표현을 포함하지만 위기 상황이 아닌 문구 (판단 전에 지움)
const SAFE_PHRASES = ['죽고 싶지만 떡볶이는 먹고 싶어'];

const CRISIS_PATTERNS = [
  /죽고\s*싶/,
  /죽을\s*것\s*같/,
  /죽어\s*버리/,
  /자살/,
  /자해/,
  /극단(적)?\s*(인\s*)?선택/,
  /목숨을?\s*끊/,
  /살기\s*싫/,
  /살고\s*싶지\s*않/,
  /사라지고\s*싶/,
  /없어지고\s*싶/,
  /생을\s*마감/,
  /뛰어\s*내리/,
  /손목을?\s*긋/,
  /suicid/i,
  /kill\s*myself/i,
  /self[-\s]?harm/i,
];

export function detectCrisis(text) {
  let t = String(text || '');
  for (const p of SAFE_PHRASES) t = t.split(p).join(' ');
  return CRISIS_PATTERNS.some((re) => re.test(t));
}

export const CRISIS_RESPONSE = {
  answer:
    '지금 많이 힘드신 것 같아요. 이야기해 줘서 고마워요. 이런 마음은 혼자 견디지 않아도 돼요.\n\n' +
    '📞 자살예방 상담전화 109 (24시간)\n' +
    '📞 정신건강 위기상담전화 1577-0199 (24시간)\n' +
    '🚑 지금 위험한 상황이라면 119\n\n' +
    '전화가 어렵다면 가까운 사람에게 "지금 좀 힘들어"라고 한 줄만 보내 보세요. 클로버는 블로그 글 안내만 할 수 있어서, 지금은 사람의 도움을 먼저 받으셨으면 해요.',
  links: [
    { label: '109 전화하기', url: 'tel:109' },
    { label: '1577-0199 전화하기', url: 'tel:15770199' },
  ],
};

// 진단·약·치료 판단을 요구하는 질문 — 블로그 범위 밖이며 의료진 영역 (PRD 3.3, D-008)
const MEDICAL_PATTERNS = [
  /(무슨|어떤|먹어야\s*할?|먹는)\s*약/, /약을?\s*(먹|끊|줄|늘)/, /약\s*(뭐|무엇|어떤|이름|추천)/, /약.{0,6}먹어야/, /복용/, /처방/, /진단/, /부작용/,
  /(우울증|공황장애|불안장애|조울|양극성|adhd|불면증)\s*(인가|일까|맞|이에요|인지|같아|치료)/i,
];

export function detectMedical(text) {
  return MEDICAL_PATTERNS.some((re) => re.test(String(text || '')));
}

export const MEDICAL_RESPONSE =
  '진단이나 약, 치료에 관한 건 클로버가 판단할 수 없어요. 🍀 지금 느끼는 증상과 궁금한 점을 메모해서 정신건강의학과 의사나 전문 상담사에게 꼭 물어보세요.\n' +
  '진료를 기다리는 동안 잠깐 숨을 고르고 싶다면 "4-4 호흡법"이나 "번아웃이 올 때 쉬는 법" 글을 읽어 보셔도 좋아요.';
