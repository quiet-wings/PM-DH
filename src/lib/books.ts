// 마음버블서점 추천 도서 목록
// - category 는 affirmations.ts 의 STRESS_CATEGORIES id 와 같아요 (work, people, love, future, burnout, thoughts)
// - 책을 추가하려면 아래 배열에 항목을 하나 더 넣으면 돼요.
// - note(추천 이유)는 책 본문을 옮기지 말고 직접 짧게 써 주세요.

export interface Book {
  id: string
  title: string
  author: string
  category: string
  /** 한 줄 추천 이유 (직접 작성) */
  note: string
  /** 이런 마음일 때 */
  mood: string
  /** 표지 대신 쓰는 색 (Tailwind 그라데이션) */
  cover: string
  emoji: string
}

export const BOOKS: Book[] = [
  // 💼 일 & 학업
  {
    id: 'atomic-habits',
    title: '아주 작은 습관의 힘',
    author: '제임스 클리어',
    category: 'work',
    mood: '해야 할 일이 너무 커 보여서 시작이 안 될 때',
    note: '거창한 결심 대신 1%짜리 작은 변화부터. 부담을 잘게 쪼개는 법을 알려줘요.',
    cover: 'from-amber-300 to-orange-400',
    emoji: '🧱',
  },
  {
    id: 'deep-work',
    title: '딥 워크',
    author: '칼 뉴포트',
    category: 'work',
    mood: '하루 종일 바빴는데 한 게 없는 것 같을 때',
    note: '알림과 산만함에서 벗어나 정말 중요한 일에 집중하는 시간을 되찾게 해줘요.',
    cover: 'from-yellow-300 to-amber-500',
    emoji: '🎯',
  },
  {
    id: 'hamatomyeon',
    title: '하마터면 열심히 살 뻔했다',
    author: '하완',
    category: 'work',
    mood: '열심히 사는데도 늘 뒤처지는 기분일 때',
    note: '"꼭 그렇게까지 해야 하나?" 하고 한숨 돌리게 해주는 유쾌한 에세이예요.',
    cover: 'from-orange-200 to-rose-300',
    emoji: '🛋️',
  },

  // 👥 인간관계
  {
    id: 'courage-to-be-disliked',
    title: '미움받을 용기',
    author: '기시미 이치로 · 고가 후미타케',
    category: 'people',
    mood: '남들의 시선과 기대가 너무 신경 쓰일 때',
    note: '타인의 과제와 나의 과제를 나누는 법. 관계의 무게를 덜어줘요.',
    cover: 'from-rose-300 to-pink-400',
    emoji: '🕊️',
  },
  {
    id: 'i-decided-to-live-as-me',
    title: '나는 나로 살기로 했다',
    author: '김수현',
    category: 'people',
    mood: '누구에게도 맞추느라 내가 사라진 것 같을 때',
    note: '남의 기준이 아닌 나의 기준으로 살아도 괜찮다고 다정하게 말해줘요.',
    cover: 'from-pink-200 to-fuchsia-300',
    emoji: '🌷',
  },
  {
    id: 'you-are-right',
    title: '당신이 옳다',
    author: '정혜신',
    category: 'people',
    mood: '누군가에게 온전히 이해받고 싶을 때',
    note: '충고보다 공감이 사람을 살린다는 이야기. 나와 주변을 대하는 법이 달라져요.',
    cover: 'from-red-200 to-rose-400',
    emoji: '🤝',
  },
  {
    id: 'almond',
    title: '아몬드',
    author: '손원평',
    category: 'people',
    mood: '마음을 표현하는 게 서툴러 외로울 때',
    note: '감정을 잘 느끼지 못하는 소년이 사람을 통해 변해가는 따뜻한 소설이에요.',
    cover: 'from-stone-300 to-rose-300',
    emoji: '🌰',
  },

  // ❤️ 사랑
  {
    id: 'essays-in-love',
    title: '왜 나는 너를 사랑하는가',
    author: '알랭 드 보통',
    category: 'love',
    mood: '사랑의 시작과 흔들림, 이별까지 마음이 복잡할 때',
    note: '사랑에 빠지고 아파하는 우리의 마음을 가장 섬세하고 지적인 언어로 어루만져 줘요.',
    cover: 'from-pink-300 to-rose-400',
    emoji: '❤️',
  },
  {
    id: 'art-of-loving',
    title: '사랑의 기술',
    author: '에리히 프롬',
    category: 'love',
    mood: '나를 잃지 않으면서 건강하게 사랑하고 싶을 때',
    note: '사랑은 감정에만 머무는 게 아니라 나를 먼저 돌보는 단단한 힘에서 시작된다고 말해줘요.',
    cover: 'from-rose-200 to-pink-400',
    emoji: '💌',
  },
  {
    id: 'moments-of-love',
    title: '모든 순간이 너였다',
    author: '하태완',
    category: 'love',
    mood: '지친 연애나 짝사랑 끝에 따뜻한 위로가 필요할 때',
    note: '반짝이던 순간과 아팠던 마음을 다정하게 토닥여 주는 에세이예요.',
    cover: 'from-fuchsia-200 to-rose-300',
    emoji: '🌸',
  },

  // 🌫️ 미래 & 불안
  {
    id: 'tteokbokki',
    title: '죽고 싶지만 떡볶이는 먹고 싶어',
    author: '백세희',
    category: 'future',
    mood: '이유 없이 불안하고 마음이 가라앉을 때',
    note: '가벼운 우울과 불안을 솔직하게 들여다본 상담 기록. "나만 그런 게 아니구나" 싶어져요.',
    cover: 'from-indigo-300 to-purple-400',
    emoji: '🍢',
  },
  {
    id: 'namiya',
    title: '나미야 잡화점의 기적',
    author: '히가시노 게이고',
    category: 'future',
    mood: '어떤 선택을 해야 할지 막막할 때',
    note: '고민 편지에 답장을 해주는 잡화점 이야기. 내 고민에도 답이 올 것 같은 기분이 들어요.',
    cover: 'from-violet-300 to-indigo-500',
    emoji: '✉️',
  },
  {
    id: 'fish-dont-exist',
    title: '물고기는 존재하지 않는다',
    author: '룰루 밀러',
    category: 'future',
    mood: '세상이 정한 정답에서 벗어난 것 같아 두려울 때',
    note: '혼돈 속에서도 의미를 찾아가는 과정. 불확실함을 조금 덜 무섭게 만들어줘요.',
    cover: 'from-sky-300 to-indigo-400',
    emoji: '🐟',
  },

  // 🔋 피로 & 번아웃
  {
    id: 'stop-and-see',
    title: '멈추면, 비로소 보이는 것들',
    author: '혜민',
    category: 'burnout',
    mood: '멈추면 안 될 것 같아서 계속 달리고 있을 때',
    note: '짧은 글들이라 지친 날에도 한 페이지씩 읽기 좋아요. 쉬어도 된다는 허락 같은 책.',
    cover: 'from-emerald-300 to-teal-400',
    emoji: '🍃',
  },
  {
    id: 'dallergut',
    title: '달러구트 꿈 백화점',
    author: '이미예',
    category: 'burnout',
    mood: '잠들기 전까지 머리가 쉬지 않을 때',
    note: '꿈을 사고파는 상점이라는 포근한 상상. 잠들기 전에 읽기 딱 좋은 소설이에요.',
    cover: 'from-teal-200 to-cyan-400',
    emoji: '🌙',
  },
  {
    id: 'convenience-store',
    title: '불편한 편의점',
    author: '김호연',
    category: 'burnout',
    mood: '사람의 온기가 그리운 지친 날',
    note: '동네 편의점에 모인 사람들이 서로를 조금씩 회복시키는 이야기. 읽고 나면 마음이 데워져요.',
    cover: 'from-lime-200 to-emerald-400',
    emoji: '🏪',
  },

  // 💭 사소한 생각
  {
    id: 'temperature-of-language',
    title: '언어의 온도',
    author: '이기주',
    category: 'thoughts',
    mood: '누군가의 말 한마디가 계속 마음에 남을 때',
    note: '말과 글에 담긴 온도를 다룬 에세이. 내가 쓰는 말도, 들은 말도 다시 보게 돼요.',
    cover: 'from-sky-200 to-blue-400',
    emoji: '💬',
  },
  {
    id: 'reasons-for-travel',
    title: '여행의 이유',
    author: '김영하',
    category: 'thoughts',
    mood: '생각이 꼬리를 물어 어디론가 떠나고 싶을 때',
    note: '여행을 통해 나를 돌아보는 산문. 복잡한 머릿속에 창문을 하나 열어주는 느낌이에요.',
    cover: 'from-cyan-200 to-sky-400',
    emoji: '🧳',
  },
  {
    id: 'little-prince',
    title: '어린 왕자',
    author: '앙투안 드 생텍쥐페리',
    category: 'thoughts',
    mood: '어른이 되면서 잊어버린 것이 그리울 때',
    note: '다시 읽을 때마다 다르게 다가오는 책. 정말 중요한 게 무엇인지 조용히 묻게 돼요.',
    cover: 'from-blue-200 to-indigo-300',
    emoji: '🌹',
  },
]

/** 교보문고 검색 링크 (제휴 링크로 바꾸고 싶으면 이 함수만 수정하면 돼요) */
export function getBookStoreUrl(book: Book): string {
  return `https://search.kyobobook.co.kr/search?keyword=${encodeURIComponent(
    `${book.title} ${book.author.split(' · ')[0]}`,
  )}`
}

export function getRandomBook(category?: string): Book {
  const pool = category ? BOOKS.filter((b) => b.category === category) : BOOKS
  const list = pool.length > 0 ? pool : BOOKS
  return list[Math.floor(Math.random() * list.length)]
}
