// Firebase 웹 앱 설정
// 저장소에는 샘플 값(YOUR_…)만 둡니다. 실제 값은 빌드할 때 넣어요 (D-016).
//   - 배포: GitHub Secret FIREBASE_WEB_CONFIG(JSON) → 빌드가 public/assets/firebase-config.js에 주입
//   - 내 컴퓨터: 이 파일을 site/firebase-config.local.js로 복사해 실제 값 입력 (커밋 안 됨, .gitignore)
// 값이 샘플이거나 비어 있으면 챗봇은 AI 없이 "데모 모드"(블로그 문단 요약)로 동작해요.

export const firebaseConfig = {
  apiKey: 'YOUR_FIREBASE_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.firebasestorage.app',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

// AI 중계 주소 (Cloudflare Pages Functions → Claude API, 키는 Cloudflare 비밀값에만 있음, D-016)
// 값이 있으면 이 주소로 답변을 만들고, 비우면 Firebase AI Logic(Gemini)을 써요.
export const AI_PROXY_URL = 'https://maeumbubble-test.pages.dev/api/ask';

// Firebase AI Logic에서 쓸 Gemini 모델 (콘솔에서 지원 모델 확인 후 바꿀 수 있어요)
export const GEMINI_MODEL = 'gemini-3.8-flash';

// App Check(reCAPTCHA Enterprise) 사이트 키 — 콘솔 App Check에서 발급. 비워 두면 App Check 없이 동작
export const RECAPTCHA_SITE_KEY = '';

// 답하지 못한 질문을 Firestore `content_gaps`에 남길지 여부
export const LOG_CONTENT_GAPS = true;

export const FIREBASE_SDK_VERSION = '13.1.0';
