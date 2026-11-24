// 긍정 글귀 타이핑에서 따라 쓰는 문장들
// 문장을 더하려면 아래 배열에 한 줄을 추가하면 돼요.

export const TYPING_PHRASES: string[] = [
  '나는 지금 이대로도 충분히 괜찮은 사람이다.',
  '오늘의 나는 어제보다 한 뼘 더 자랐다.',
  '천천히 가도 나는 결국 도착한다.',
  '내 마음은 내가 가장 먼저 안아준다.',
  '실수는 내가 노력하고 있다는 증거다.',
  '나는 쉬어도 되는 사람이다.',
  '좋은 일은 생각보다 가까이에 있다.',
  '나는 나의 속도로 걷는다.',
  '오늘 하루도 잘 버텨낸 나를 칭찬한다.',
  '걱정은 내려놓고 숨을 크게 쉬어 본다.',
  '나는 사랑받을 자격이 충분하다.',
  '작은 기쁨을 알아보는 내가 좋다.',
  '지나간 일은 흘려보내고 지금에 머문다.',
  '나는 생각보다 훨씬 단단하다.',
  '내일의 나는 오늘의 나에게 고마워할 것이다.',
  '완벽하지 않아도 나는 빛난다.',
  '힘들 땐 도움을 청해도 괜찮다.',
  '나는 내 편이 되어 주기로 했다.',
  '오늘 웃을 일을 하나 찾아본다.',
  '모든 감정은 지나가고 나는 남는다.',
  '내가 걸어온 길에는 이유가 있다.',
  '나는 오늘도 조금씩 나아지고 있다.',
  '비 온 뒤에 하늘은 더 맑아진다.',
  '나를 믿는 마음이 가장 큰 힘이다.',
]

/** 한글 한 글자를 치는 데 필요한 타수(초성·중성·종성)를 세요 */
export function countKeystrokes(text: string): number {
  let total = 0
  for (const ch of text) {
    const code = ch.charCodeAt(0)
    if (code >= 0xac00 && code <= 0xd7a3) {
      const hasFinal = (code - 0xac00) % 28 !== 0
      total += hasFinal ? 3 : 2
    } else {
      total += 1
    }
  }
  return total
}

export function shuffled<T>(list: T[]): T[] {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
