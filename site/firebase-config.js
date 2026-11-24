// Firebase 웹 앱 설정
// Firebase 콘솔 → 프로젝트 설정 → 일반 → 내 앱(웹) → "SDK 설정 및 구성"의 firebaseConfig 값을 붙여 넣으세요.
// 이 값들은 공개돼도 괜찮은 식별자예요(비밀번호가 아님). 대신 App Check로 내 사이트에서만 호출되게 막아요.
// 값이 비어 있으면 챗봇은 AI 없이 "데모 모드"(블로그 문단 요약)로 동작해요.

export const firebaseConfig = {
  apiKey: 'AIzaSyA9lF4TPWXSht1g0WAGEIVassqSB_c1Uy4',
  authDomain: 'mindbubble-wings.firebaseapp.com',
  projectId: 'mindbubble-wings',
  storageBucket: 'mindbubble-wings.firebasestorage.app',
  messagingSenderId: '57471046972',
  appId: '1:57471046972:web:9282d07a98ef2b09ab3a39',
};

// Firebase AI Logic에서 쓸 Gemini 모델 (콘솔에서 지원 모델 확인 후 바꿀 수 있어요)
export const GEMINI_MODEL = 'gemini-3.8-flash';

// App Check(reCAPTCHA Enterprise) 사이트 키 — 콘솔 App Check에서 발급. 비워 두면 App Check 없이 동작
export const RECAPTCHA_SITE_KEY = '';

// 답하지 못한 질문을 Firestore `content_gaps`에 남길지 여부
export const LOG_CONTENT_GAPS = true;

export const FIREBASE_SDK_VERSION = '13.1.0';
