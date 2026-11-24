// 사이트 공통 설정 — 브라우저와 빌드 스크립트가 함께 읽어요.

export const SITE = {
  name: '마음버블 블로그',
  tagline: '걱정을 비눗방울에 담아 날려 보내는 쉼터, 마음버블의 이야기',
  // 마음버블 서비스 주소 — 현재 테스트 배포본(D-012). 정식 주소가 생기면 여기만 바꾸면 돼요
  appUrl: 'https://maeumbubble-test.pages.dev',
};

// 글의 front-matter `feature` 값 → 챗봇과 글 하단에서 추천할 마음버블 기능
export const FEATURES = {
  home: { label: '마음버블에서 걱정 버블 띄우기', emoji: '🫧', path: '/' },
  breathing: { label: '마음버블 호흡 쉼터 열기', emoji: '🌬️', path: '/' },
  game: { label: '마음버블 미니게임 하러 가기', emoji: '🎮', path: '/game' },
  typing: { label: '마음버블에서 긍정 글귀 따라 쓰기', emoji: '⌨️', path: '/typing' },
  books: { label: '마음버블서점 둘러보기', emoji: '📚', path: '/books' },
};

// 블로그에서 마음버블로 간 유입을 셀 수 있게 UTM 표시를 붙여요 (PRD 지표: 기능 링크 클릭률)
// medium: chatbot(챗봇 답변) · post(글 하단 버튼) · header(상단 "마음버블 열기")
export function appLink(path = '/', medium = 'chatbot') {
  const url = new URL(path, SITE.appUrl);
  url.searchParams.set('utm_source', 'maeum-blog');
  url.searchParams.set('utm_medium', medium);
  return url.toString();
}

export function featureLink(key, medium = 'chatbot') {
  const f = FEATURES[key] || FEATURES.home;
  return { ...f, key: FEATURES[key] ? key : 'home', url: appLink(f.path, medium) };
}
