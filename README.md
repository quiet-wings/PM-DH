# 🍀 마음버블 블로그 — 「클로버에게 물어보기」

걱정을 비눗방울에 담아 터뜨리는 스트레스 해소 서비스 **마음버블**의 블로그입니다.
블로그 오른쪽 아래 **클로버 버튼**에 질문하면, AI가 **블로그 글만 근거로** 답하고 출처 글과 바로 해 볼 마음버블 기능을 알려 줍니다.

| 제출물 | 위치 |
|---|---|
| 배포된 블로그 | Firebase Hosting **비공개 미리보기 링크**(30일) — 링크는 제출란으로만 공유 ([D-011](docs/logs/DECISION_LOG.md)) |
| PRD 기획서 (v0.1 → v1.5) | [`docs/PRD.md`](docs/PRD.md) · 버전별 HTML [`versions/`](versions) |
| 제출 체크리스트 | [`docs/SUBMISSION_CHECKLIST.md`](docs/SUBMISSION_CHECKLIST.md) |
| 개인정보 처리방침 | 사이트의 `/privacy` 페이지 (모든 페이지 하단·챗봇 안내문에 링크) |
| 테스트 보고서 | [`docs/TEST_REPORT.md`](docs/TEST_REPORT.md) · 스크린샷 [`docs/screenshots/`](docs/screenshots) |
| 에이전트용 지침 | [`AGENTS.md`](AGENTS.md) |
| 의사결정 로그 | [`docs/logs/DECISION_LOG.md`](docs/logs/DECISION_LOG.md) |
| 성공·실패 로그 | [`docs/logs/SUCCESS_FAILURE_LOG.md`](docs/logs/SUCCESS_FAILURE_LOG.md) |
| 소스코드 | 블로그: `lib/`(챗봇·검색·안전 규칙), `site/`(화면), `scripts/`(빌드), `posts/`(글), `tests/` · 마음버블 앱: [`maeumbubble-app/`](maeumbubble-app) |
| 마음버블 앱 | https://maeumbubble-test.pages.dev (Cloudflare Pages) — 배경음·단순화·처리방침·보안 헤더 반영, 동의한 고민만 암호화해 익명 전송(30일 자동 삭제)·운영자 페이지 |

## 어떤 문제를 푸나요
- **독자**: 지친 순간에 긴 글을 다 읽기 어렵고, 답이 어느 글에 있는지 모른다.
- **운영자(1인)**: 같은 질문에 반복해서 답하고, 독자가 뭘 궁금해하는지 데이터가 없다.
- **해결**: 블로그 글 근거 Q&A 챗봇 → 답 + 출처 + 마음버블 기능 링크. 답하지 못한 질문은 익명으로 모아 다음 글 주제로 쓴다(운영 자동화).

## 동작 흐름
```
질문 → 입력 검증 → 위기·의료 질문 검사(규칙) → 블로그 문단 검색(BM25 + 핵심어 일치율)
     → Firebase AI Logic(Gemini)이 근거 문단만으로 답변 → 답변 + 출처 글 + 마음버블 기능
     ↘ 근거 없음: "아직 블로그에 없는 내용" + Firestore content_gaps 기록
     ↘ 위기 표현: AI 없이 109 · 1577-0199 · 119 안내
```

## 로컬에서 실행
```bash
npm test        # 단위테스트 61개
npm run dev     # 빌드 후 http://localhost:5173 (Firebase 설정이 비어 있으면 데모 모드)
```
외부 npm 패키지가 없어 `npm install`이 필요 없습니다 (Node 22 이상).

## 보안·개인정보
- **보안 헤더**(`firebase.json`): CSP로 이 사이트·Firebase SDK(gstatic)·Gemini·Firestore 주소만 허용, 클릭재킹 차단(`frame-ancestors 'none'`), HSTS, COOP, Permissions-Policy. 테스트가 CSP 필수 항목과 인라인 스크립트 금지를 검사해요.
- **개인정보**: 회원가입·추적 쿠키 없음. 질문 원문 미저장, 답 못 한 질문만 전화번호·이메일·주민번호를 가려 기록(최대 90일). 자세한 내용은 `/privacy`.
- 360·390px 모바일과 보안 헤더 적용 상태에서 전 페이지·챗봇을 점검했어요 ([테스트 보고서 4장](docs/TEST_REPORT.md)).

## 수정한 내용 저장하기 (커밋 + GitHub 올리기)
```bash
npm run save -- "fix: 마음버블 실제 주소로 변경"
```
메시지 형식 검사 → 최신 내용 받기 → 테스트 → 커밋 → push를 한 번에 합니다. 테스트가 실패하면 커밋하지 않아요.
메시지 종류: `feat`(기능) `fix`(수정) `docs`(문서) `test`(테스트) `chore`(설정) `refactor` `style`. 연습: 끝에 `--dry`.
Windows에서는 [Git for Windows](https://git-scm.com)가 필요해요 (GitHub Desktop만으로는 `git` 명령이 없음).

## Firebase 배포 (처음 한 번)
1. [Firebase 콘솔](https://console.firebase.google.com)에서 프로젝트 만들기 (무료 Spark 요금제)
2. **AI Logic** → 시작하기 → **Gemini Developer API** 선택
3. 프로젝트 설정 → 내 앱 → 웹 앱 추가 → `firebaseConfig` 값을 확인. **저장소의 [`site/firebase-config.js`](site/firebase-config.js)에는 샘플 키(`YOUR_…`)만 둡니다.** 실제 값은 6번의 Secret으로 넣고, 내 컴퓨터에서 AI까지 보려면 이 파일을 `site/firebase-config.local.js`로 복사해 실제 값을 넣으세요(커밋되지 않음)
4. **Firestore Database** 만들기 → 규칙 탭에 [`firestore.rules`](firestore.rules) 내용 붙여 넣기
5. 프로젝트 설정 → 서비스 계정 → 새 비공개 키 생성(JSON)
6. GitHub 저장소 → Settings → Secrets and variables → Actions
   - Secret `FIREBASE_SERVICE_ACCOUNT` = JSON 파일 내용 전체
   - Secret `FIREBASE_WEB_CONFIG` = 웹 앱 설정 JSON, 예: `{"apiKey":"…","authDomain":"…","projectId":"…","storageBucket":"…","messagingSenderId":"…","appId":"…"}` (없으면 배포를 건너뜀)
   - Variable `FIREBASE_PROJECT_ID` = 프로젝트 ID
7. `main`에 push → Actions가 테스트·빌드 후 **미리보기 채널 `share`(30일)**에 배포. 공개 주소로 바꾸려면 `deploy.yml`의 `channelId`를 `live`로
8. (권장) App Check에서 reCAPTCHA Enterprise 키 발급 → `RECAPTCHA_SITE_KEY`에 입력

## 새 글 쓰기
`posts/YYYY-MM-DD-slug.md`를 만들고 front-matter(`title`, `date`, `tags`, `summary`, `feature`)를 채워 push하면 끝. 챗봇이 새 글을 바로 근거로 씁니다.

## 기술 스택
정적 사이트 생성기·검색 엔진·마크다운 변환기를 **외부 라이브러리 없이** 직접 구현(Node 22) · Firebase Hosting · Firebase AI Logic(Gemini) · Firestore · App Check · GitHub Actions
