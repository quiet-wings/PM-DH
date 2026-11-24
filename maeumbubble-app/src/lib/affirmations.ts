import { Language } from './i18n'

export interface Affirmation {
  id: string
  text: string
  textEn?: string
  author?: string
  subtext?: string
  subtextEn?: string
  /** 특정 걱정 종류(work, people, love, future, burnout, thoughts)에 맞춘 위로일 때만 적어요 */
  category?: string
}

export const COMFORT_AFFIRMATIONS: Affirmation[] = [
  {
    id: '1',
    text: '훌훌 털어버려요. 당신은 이미 충분히 잘하고 있어요.',
    textEn: 'Let it go. You are already doing wonderfully well.',
    subtext: '지금 이 순간에도 당신은 한 걸음씩 나아가고 있어요.',
    subtextEn: 'Even in this very moment, you are moving forward one step at a time.',
  },
  {
    id: '2',
    text: '이 걱정은 이제 바람 속으로 흩어졌어요.',
    textEn: 'This worry has now scattered into the wind.',
    subtext: '내일의 걱정은 내일에게 맡기고, 오늘은 푹 쉬어요.',
    subtextEn: 'Leave tomorrow’s worries to tomorrow, and rest deeply today.',
  },
  {
    id: '3',
    text: '모든 걸 혼자 짊어지지 않아도 괜찮아요.',
    textEn: 'It is okay not to carry everything all by yourself.',
    subtext: '때로는 내려놓는 것이 가장 용기 있는 선택이에요.',
    subtextEn: 'Sometimes letting go is the bravest choice you can make.',
  },
  {
    id: '4',
    text: '마음의 무게가 1g 가벼워졌어요.',
    textEn: 'Your heart is now a little bit lighter.',
    subtext: '한 번에 하나씩, 천천히 비워가면 돼요.',
    subtextEn: 'One burden at a time, release them slowly and gently.',
  },
  {
    id: '5',
    text: '당신의 가치는 타인의 시선이나 결과로 정해지지 않아요.',
    textEn: 'Your worth is never defined by others’ opinions or outcomes.',
    subtext: '존재하는 것만으로도 소중한 사람이에요.',
    subtextEn: 'You are infinitely precious simply for being who you are.',
  },
  {
    id: '6',
    text: '깊은 숨을 들이쉬고 내쉬어보세요.',
    textEn: 'Take a slow, deep breath in and gently let it out.',
    subtext: '이 또한 지나가고, 평온한 계절이 찾아올 거예요.',
    subtextEn: 'This too shall pass, and a peaceful season will find you.',
  },
  {
    id: '7',
    text: '실수해도 괜찮아요. 배움의 과정일 뿐이에요.',
    textEn: 'It is completely fine to make mistakes; it is simply part of learning.',
    subtext: '스스로에게 조금만 더 다정해지기로 해요.',
    subtextEn: 'Let us choose to be a little kinder to ourselves.',
  },
  {
    id: '8',
    text: '오늘 하루도 정말 고생 많았어요.',
    textEn: 'You worked so hard today. Thank you for your efforts.',
    subtext: '따뜻한 차 한 잔과 함께 편안한 저녁을 보내세요.',
    subtextEn: 'Enjoy a warm cup of tea and have a soothing, gentle evening.',
  },
  {
    id: '9',
    text: '당신은 생각보다 훨씬 더 단단하고 유연한 사람입니다.',
    textEn: 'You are so much stronger and more resilient than you think.',
    subtext: '지금까지 수많은 파도를 넘어왔잖아요.',
    subtextEn: 'Look back at all the turbulent waves you have already crossed.',
  },
  {
    id: '10',
    text: '완벽하지 않아도 아름다워요.',
    textEn: 'You are beautiful without needing to be flawless.',
    subtext: '있는 그대로의 당신의 모습을 사랑해주세요.',
    subtextEn: 'Embrace and cherish yourself just as you are right now.',
  },
  {
    id: '11',
    text: '마음의 뜰에 잠시 쉼표를 찍어주세요.',
    textEn: 'Place a gentle pause in the garden of your mind.',
    subtext: '쉬어가는 시간은 낭비가 아니라 다시 채우는 시간이에요.',
    subtextEn: 'Taking time to rest is never wasted; it is how you replenish.',
  },
  {
    id: '12',
    text: '불안은 그림자일 뿐, 당신이라는 빛을 가릴 수 없어요.',
    textEn: 'Anxiety is only a shadow; it can never dim your light.',
    subtext: '마음의 햇살을 천천히 켜보세요.',
    subtextEn: 'Slowly invite the warm sunshine back into your heart.',
  },

  // ───────── 누구에게나 건네는 위로 ─────────
  {
    id: '13',
    text: '지금 느끼는 감정은 틀린 게 아니에요.',
    textEn: 'What you are feeling right now is not wrong.',
    subtext: '어떤 마음이든 느껴도 괜찮아요.',
    subtextEn: 'Whatever is in your heart, you are allowed to feel it.',
  },
  {
    id: '14',
    text: '오늘 못 한 일보다, 오늘 해낸 일을 세어봐요.',
    textEn: 'Count what you did today, not what you did not.',
    subtext: '생각보다 많은 걸 해냈을 거예요.',
    subtextEn: 'You have done more than you think.',
  },
  {
    id: '15',
    text: '천천히 가도 괜찮아요. 방향만 잃지 않으면 돼요.',
    textEn: 'Going slowly is fine, as long as you keep your direction.',
    subtext: '꽃마다 피는 계절이 달라요.',
    subtextEn: 'Every flower has its own season to bloom.',
  },
  {
    id: '16',
    text: '울고 싶을 땐 울어도 돼요.',
    textEn: 'When you want to cry, it is okay to cry.',
    subtext: '눈물은 마음이 스스로를 씻어내는 방법이에요.',
    subtextEn: 'Tears are how the heart washes itself clean.',
  },
  {
    id: '17',
    text: '당신이 여기까지 온 것만으로도 대단한 일이에요.',
    textEn: 'Simply making it this far is something remarkable.',
    subtext: '스스로에게 박수를 보내주세요.',
    subtextEn: 'Give yourself a round of applause.',
  },
  {
    id: '18',
    text: '오늘의 나를 어제의 나와만 비교해요.',
    textEn: 'Compare today’s you only with yesterday’s you.',
    subtext: '남의 속도는 내 것이 아니니까요.',
    subtextEn: 'Someone else’s pace was never yours to keep.',
  },
  {
    id: '19',
    text: '작은 기쁨 하나가 하루를 바꾸기도 해요.',
    textEn: 'One small joy can change a whole day.',
    subtext: '좋아하는 것 하나를 오늘 나에게 선물해요.',
    subtextEn: 'Gift yourself one thing you love today.',
  },
  {
    id: '20',
    text: '괜찮지 않아도 괜찮아요.',
    textEn: 'It is okay to not be okay.',
    subtext: '늘 씩씩할 필요는 없어요.',
    subtextEn: 'You do not have to be brave all the time.',
  },
  {
    id: '21',
    text: '마음에도 환기가 필요해요.',
    textEn: 'Your heart needs fresh air too.',
    subtext: '창문을 열듯, 생각을 잠시 내보내요.',
    subtextEn: 'Let your thoughts out for a while, like opening a window.',
  },
  {
    id: '22',
    text: '지금 이 순간, 당신은 안전해요.',
    textEn: 'Right now, in this moment, you are safe.',
    subtext: '발바닥이 닿은 바닥을 가만히 느껴보세요.',
    subtextEn: 'Gently feel the ground beneath your feet.',
  },

  // ───────── 💼 일 & 학업 ─────────
  {
    id: 'w1',
    category: 'work',
    text: '일은 당신의 일부일 뿐, 당신의 전부가 아니에요.',
    textEn: 'Work is one part of you, not all of you.',
    subtext: '퇴근한 뒤의 나도 소중히 챙겨주세요.',
    subtextEn: 'Take good care of the you that exists after hours.',
  },
  {
    id: 'w2',
    category: 'work',
    text: '마감은 지나가고, 당신은 남아요.',
    textEn: 'Deadlines pass. You remain.',
    subtext: '할 수 있는 만큼만 해도 충분해요.',
    subtextEn: 'Doing what you can is enough.',
  },
  {
    id: 'w3',
    category: 'work',
    text: '한 번에 하나씩만 해도 결국 다 끝나요.',
    textEn: 'One thing at a time, and it all gets done in the end.',
    subtext: '가장 작은 일 하나부터 시작해봐요.',
    subtextEn: 'Start with the very smallest task.',
  },
  {
    id: 'w4',
    category: 'work',
    text: '성적과 성과가 당신을 설명하지 못해요.',
    textEn: 'Grades and results cannot describe who you are.',
    subtext: '숫자에 담기지 않는 당신이 훨씬 커요.',
    subtextEn: 'The you that numbers cannot hold is far greater.',
  },
  {
    id: 'w5',
    category: 'work',
    text: '모르는 건 부끄러운 게 아니라 배울 자리예요.',
    textEn: 'Not knowing is not a shame; it is room to learn.',
    subtext: '물어보는 용기가 가장 빠른 길이에요.',
    subtextEn: 'The courage to ask is the fastest road.',
  },
  {
    id: 'w6',
    category: 'work',
    text: '오늘 다 못 끝내도 세상은 무너지지 않아요.',
    textEn: 'The world will not fall apart if you do not finish today.',
    subtext: '내일의 나에게 조금 남겨둬도 괜찮아요.',
    subtextEn: 'It is fine to leave a little for tomorrow’s you.',
  },

  // ───────── 👥 인간관계 ─────────
  {
    id: 'p1',
    category: 'people',
    text: '모두에게 좋은 사람일 필요는 없어요.',
    textEn: 'You do not need to be a good person to everyone.',
    subtext: '나에게 먼저 좋은 사람이 되어주세요.',
    subtextEn: 'Be a good person to yourself first.',
  },
  {
    id: 'p2',
    category: 'people',
    text: '그 사람의 말은 그 사람의 것이에요.',
    textEn: 'Their words belong to them.',
    subtext: '당신의 마음에 오래 둘 필요 없어요.',
    subtextEn: 'You do not have to keep them in your heart for long.',
  },
  {
    id: 'p3',
    category: 'people',
    text: '거절해도 관계는 무너지지 않아요.',
    textEn: 'Saying no does not break a relationship.',
    subtext: '건강한 선은 서로를 지켜줘요.',
    subtextEn: 'Healthy boundaries protect you both.',
  },
  {
    id: 'p4',
    category: 'people',
    text: '멀어진 인연에도 고마웠던 순간은 남아요.',
    textEn: 'Even with those who drifted away, the grateful moments remain.',
    subtext: '보내주는 것도 다정함이에요.',
    subtextEn: 'Letting go is also a form of kindness.',
  },
  {
    id: 'p5',
    category: 'people',
    text: '당신을 있는 그대로 좋아하는 사람이 분명 있어요.',
    textEn: 'There are people who like you just as you are.',
    subtext: '애써 꾸미지 않아도 괜찮아요.',
    subtextEn: 'You do not have to try so hard to be someone else.',
  },
  {
    id: 'p6',
    category: 'people',
    text: '오해는 당신의 잘못만으로 생기지 않아요.',
    textEn: 'A misunderstanding is never built by you alone.',
    subtext: '혼자 다 책임지려 하지 말아요.',
    subtextEn: 'Do not try to carry all the blame yourself.',
  },

  // ───────── ❤️ 사랑 ─────────
  {
    id: 'l1',
    category: 'love',
    text: '누군가를 진심으로 아끼고 사랑할 줄 아는 당신의 마음이 참 예뻐요.',
    textEn: 'Your heart, capable of loving and cherishing so deeply, is truly beautiful.',
    subtext: '그 따뜻한 마음을 가장 먼저 나 자신에게도 나눠주세요.',
    subtextEn: 'Remember to share that warm affection with yourself first.',
  },
  {
    id: 'l2',
    category: 'love',
    text: '사랑이 마음 같지 않아 아픈 날에도, 당신의 가치는 조금도 줄어들지 않아요.',
    textEn: 'Even on days when love hurts, your worth never diminishes.',
    subtext: '당신은 있는 그대로 충분히 사랑받을 자격이 있는 사람이에요.',
    subtextEn: 'You deserve to be loved completely, just as you are.',
  },
  {
    id: 'l3',
    category: 'love',
    text: '서툰 마음도, 흔들리는 설렘도 모두 당신이 살아있다는 따뜻한 증거예요.',
    textEn: 'Even clumsy feelings and wavering heartbeats are warm proof that you are alive.',
    subtext: '내 감정을 다그치지 말고 가만히 토닥여 주세요.',
    subtextEn: 'Do not rush your feelings; gently pat your heart instead.',
  },
  {
    id: 'l4',
    category: 'love',
    text: '맞지 않는 구두에 발을 억지로 맞출 필요는 없어요.',
    textEn: 'You never have to force your heart into a love that hurts.',
    subtext: '당신을 편안하게 웃게 해주는 다정한 사랑이 분명 찾아올 거예요.',
    subtextEn: 'A gentle love that lets you smile at ease will surely find you.',
  },
  {
    id: 'l5',
    category: 'love',
    text: '기다림에 지친 마음을 이제 잠시 내려놓아도 괜찮아요.',
    textEn: 'It is okay to set down a heart grown tired from waiting.',
    subtext: '상대의 속도보다 내 마음의 평온이 언제나 더 소중해요.',
    subtextEn: 'Your inner peace always matters more than someone else’s pace.',
  },
  {
    id: 'l6',
    category: 'love',
    text: '지나간 사랑의 아픔은 결국 더 깊은 다정함으로 자라날 거예요.',
    textEn: 'The ache of past love will eventually bloom into deeper tenderness.',
    subtext: '오늘만큼은 상처받은 내 마음을 가장 따뜻하게 안아주세요.',
    subtextEn: 'Tonight, hold your own tender heart in the warmest embrace.',
  },

  // ───────── 🌫️ 미래 & 불안 ─────────
  {
    id: 'f1',
    category: 'future',
    text: '아직 오지 않은 일은 아직 일어나지 않은 일이에요.',
    textEn: 'What has not come has not happened yet.',
    subtext: '걱정의 대부분은 실제로 오지 않아요.',
    subtextEn: 'Most of what we fear never actually arrives.',
  },
  {
    id: 'f2',
    category: 'future',
    text: '길을 잃은 게 아니라, 길을 찾는 중이에요.',
    textEn: 'You are not lost. You are finding your way.',
    subtext: '헤매는 시간도 지도가 돼요.',
    subtextEn: 'Even the wandering becomes part of your map.',
  },
  {
    id: 'f3',
    category: 'future',
    text: '정답이 없으니, 당신이 고른 길이 답이 돼요.',
    textEn: 'There is no right answer, so the path you choose becomes one.',
    subtext: '선택한 뒤에 잘 걸어가면 돼요.',
    subtextEn: 'All you need is to walk it well after choosing.',
  },
  {
    id: 'f4',
    category: 'future',
    text: '미래의 나는 지금의 나보다 조금 더 지혜로울 거예요.',
    textEn: 'The future you will be a little wiser than the present you.',
    subtext: '그때의 일은 그때의 나를 믿어봐요.',
    subtextEn: 'Trust that version of you to handle what comes.',
  },
  {
    id: 'f5',
    category: 'future',
    text: '불안하다는 건, 그만큼 잘하고 싶다는 뜻이에요.',
    textEn: 'Feeling anxious means you care about doing well.',
    subtext: '그 마음을 기특하게 봐주세요.',
    subtextEn: 'Look kindly on the part of you that cares.',
  },
  {
    id: 'f6',
    category: 'future',
    text: '안개는 걷히기 마련이에요.',
    textEn: 'Fog always lifts in time.',
    subtext: '한 걸음 앞만 보여도 걸을 수 있어요.',
    subtextEn: 'You can keep walking even if you only see one step ahead.',
  },

  // ───────── 🔋 피로 & 번아웃 ─────────
  {
    id: 'b1',
    category: 'burnout',
    text: '쉬는 것도 해야 할 일이에요.',
    textEn: 'Resting is also something on your to-do list.',
    subtext: '죄책감 없이 푹 쉬어도 돼요.',
    subtextEn: 'You can rest deeply, without any guilt.',
  },
  {
    id: 'b2',
    category: 'burnout',
    text: '방전된 건 그만큼 열심히 썼다는 증거예요.',
    textEn: 'Running empty is proof of how much you have given.',
    subtext: '이제 충전할 차례예요.',
    subtextEn: 'Now it is your turn to recharge.',
  },
  {
    id: 'b3',
    category: 'burnout',
    text: '아무것도 안 하는 시간이 가장 필요한 시간일 수 있어요.',
    textEn: 'Time spent doing nothing may be the time you need most.',
    subtext: '멍하니 있는 것도 회복이에요.',
    subtextEn: 'Spacing out is a kind of healing too.',
  },
  {
    id: 'b4',
    category: 'burnout',
    text: '몸이 보내는 신호를 들어주세요.',
    textEn: 'Listen to the signals your body is sending.',
    subtext: '오늘은 일찍 불을 꺼도 좋아요.',
    subtextEn: 'It is fine to turn the lights off early tonight.',
  },
  {
    id: 'b5',
    category: 'burnout',
    text: '당신은 기계가 아니라 사람이에요.',
    textEn: 'You are a person, not a machine.',
    subtext: '지치는 게 당연해요.',
    subtextEn: 'Of course you get tired.',
  },
  {
    id: 'b6',
    category: 'burnout',
    text: '잠깐 멈춰도 뒤처지지 않아요.',
    textEn: 'Pausing for a moment does not leave you behind.',
    subtext: '쉼은 다음 걸음을 위한 숨이에요.',
    subtextEn: 'Rest is the breath before your next step.',
  },

  // ───────── 💭 사소한 생각 ─────────
  {
    id: 't1',
    category: 'thoughts',
    text: '생각은 생각일 뿐, 사실이 아니에요.',
    textEn: 'A thought is only a thought, not a fact.',
    subtext: '구름처럼 흘러가게 두세요.',
    subtextEn: 'Let it drift by like a cloud.',
  },
  {
    id: 't2',
    category: 'thoughts',
    text: '그 일을 기억하는 사람은 아마 당신뿐일 거예요.',
    textEn: 'You are probably the only one who still remembers it.',
    subtext: '다들 자기 일로 바쁘거든요.',
    subtextEn: 'Everyone else is busy with their own lives.',
  },
  {
    id: 't3',
    category: 'thoughts',
    text: '지나간 말은 다시 주울 수 없어도, 다음 말은 고를 수 있어요.',
    textEn: 'You cannot take back past words, but you can choose the next ones.',
    subtext: '그걸로 충분해요.',
    subtextEn: 'And that is enough.',
  },
  {
    id: 't4',
    category: 'thoughts',
    text: '밤에 드는 생각은 실제보다 크게 보여요.',
    textEn: 'Thoughts at night look bigger than they are.',
    subtext: '아침이 되면 한결 작아져 있을 거예요.',
    subtextEn: 'By morning, they will have grown much smaller.',
  },
  {
    id: 't5',
    category: 'thoughts',
    text: '머릿속이 복잡할 땐 손을 움직여봐요.',
    textEn: 'When your head is crowded, move your hands.',
    subtext: '설거지, 산책, 낙서. 뭐든 좋아요.',
    subtextEn: 'Washing dishes, a walk, a doodle. Anything works.',
  },
  {
    id: 't6',
    category: 'thoughts',
    text: '사소한 걱정이 든다는 건 마음이 섬세하다는 뜻이에요.',
    textEn: 'Worrying over small things means your heart is delicate.',
    subtext: '그 섬세함이 당신의 장점이에요.',
    subtextEn: 'That delicacy is one of your strengths.',
  },
]

export interface StressCategory {
  id: string
  label: string
  labelKo: string
  labelEn: string
  shortLabelKo: string
  shortLabelEn: string
  color: string
}

export const STRESS_CATEGORIES: StressCategory[] = [
  {
    id: 'work',
    label: '💼 일 & 학업',
    labelKo: '💼 일 & 학업',
    labelEn: '💼 Work & Study',
    shortLabelKo: '💼 일',
    shortLabelEn: '💼 Work',
    color: 'from-amber-200/40 to-orange-200/40 border-amber-300/50',
  },
  {
    id: 'people',
    label: '👥 인간관계',
    labelKo: '👥 인간관계',
    labelEn: '👥 Relationships',
    shortLabelKo: '👥 관계',
    shortLabelEn: '👥 People',
    color: 'from-rose-200/40 to-pink-200/40 border-rose-300/50',
  },
  {
    id: 'love',
    label: '❤️ 사랑',
    labelKo: '❤️ 사랑',
    labelEn: '❤️ Love',
    shortLabelKo: '❤️ 사랑',
    shortLabelEn: '❤️ Love',
    color: 'from-pink-200/45 to-rose-200/45 border-pink-300/60',
  },
  {
    id: 'future',
    label: '🌫️ 미래 & 불안',
    labelKo: '🌫️ 미래 & 불안',
    labelEn: '🌫️ Future & Anxiety',
    shortLabelKo: '🌫️ 미래',
    shortLabelEn: '🌫️ Future',
    color: 'from-indigo-200/40 to-purple-200/40 border-indigo-300/50',
  },
  {
    id: 'burnout',
    label: '🔋 피로 & 번아웃',
    labelKo: '🔋 피로 & 번아웃',
    labelEn: '🔋 Burnout & Fatigue',
    shortLabelKo: '🔋 번아웃',
    shortLabelEn: '🔋 Burnout',
    color: 'from-emerald-200/40 to-teal-200/40 border-emerald-300/50',
  },
  {
    id: 'thoughts',
    label: '💭 사소한 생각',
    labelKo: '💭 사소한 생각',
    labelEn: '💭 Overthinking',
    shortLabelKo: '💭 생각',
    shortLabelEn: '💭 Thoughts',
    color: 'from-sky-200/40 to-cyan-200/40 border-sky-300/50',
  },
]

export function getCategoryLabel(categoryId: string, lang: Language): string {
  const cat = STRESS_CATEGORIES.find((c) => c.id === categoryId)
  if (!cat) return categoryId
  return lang === 'en' ? cat.labelEn : cat.labelKo
}

export function getCategoryShortLabel(categoryId: string, lang: Language): string {
  const cat = STRESS_CATEGORIES.find((c) => c.id === categoryId)
  if (!cat) return categoryId
  return lang === 'en' ? cat.shortLabelEn : cat.shortLabelKo
}

export const PRESET_WORRIES_BY_LANG: Record<Language, string[]> = {
  ko: [
    '내일 해야 할 일들이 머릿속에서 안 떠나요',
    '좋아하는 사람의 마음 때문에 내 마음이 자꾸 흔들려요',
    '남들에게 어떻게 보일지 신경 쓰여요',
    '몸도 마음도 쉬지 못하고 방전된 기분이에요',
    '내가 선택한 길이 맞는 건지 불안해요',
    '그때 했던 말 한마디가 계속 마음에 걸려요',
  ],
  en: [
    "Tomorrow's to-do list won't leave my head",
    'My heart keeps wavering over someone I care about',
    'I keep worrying about what others think of me',
    'My body and mind feel completely drained and unable to rest',
    "I'm anxious about whether I made the right life choices",
    'That one thing I said earlier keeps bothering me',
  ],
}

export const PRESET_WORRIES = PRESET_WORRIES_BY_LANG.ko

function pickRandom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)]
}

/**
 * 위로 문장을 하나 골라요.
 * 걱정 종류(category)를 넘기면 열 번 중 일곱 번은 그 종류에 맞춘 위로가 나와요.
 */
export function getRandomAffirmation(category?: string): Affirmation {
  const matched = category
    ? COMFORT_AFFIRMATIONS.filter((a) => a.category === category)
    : []
  if (matched.length > 0 && Math.random() < 0.7) {
    return pickRandom(matched)
  }
  return pickRandom(COMFORT_AFFIRMATIONS.filter((a) => !a.category))
}

export function getAffirmationText(item: Affirmation, lang: Language): string {
  return lang === 'en' && item.textEn ? item.textEn : item.text
}

export function getAffirmationSubtext(item: Affirmation, lang: Language): string | undefined {
  return lang === 'en' && item.subtextEn ? item.subtextEn : item.subtext
}
