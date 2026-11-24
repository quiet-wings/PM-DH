# AGENTS.md — AI 코딩 에이전트용 지침

이 저장소에서 작업하는 AI 에이전트(Claude Code, Codex, Cursor 등)와 사람 기여자가 따라야 할 규칙입니다.
작업 전에 이 파일과 `docs/PRD.md`를 먼저 읽으세요.

## 1. 프로젝트 한 줄 요약
마음버블 블로그: 정적 사이트(`posts/*.md` → `public/`, Firebase Hosting) + 블로그 글만 근거로 답하는 Q&A 챗봇 「클로버에게 물어보기」(브라우저에서 Firebase AI Logic으로 Gemini 호출).

## 2. 절대 규칙
1. **외부 npm 의존성 추가 금지.** Node 22 내장 기능(`node:test`, `node:fs`)만 사용한다. 브라우저의 Firebase SDK는 gstatic CDN에서 버전 고정으로 불러온다.
   이유: 빌드 단계를 단순하게 유지하고 공급망 위험을 없애기 위함 (DECISION_LOG D-002).
2. **Gemini API 키를 코드·로그·커밋에 절대 넣지 않는다.** Gemini 키는 Firebase AI Logic이 서버 쪽에서 관리한다. `site/firebase-config.js`의 웹 설정값은 공개 식별자라 커밋해도 되지만, 서비스 계정 키(JSON)는 GitHub Secret에만 둔다.
3. **챗봇은 검색된 블로그 문단만 근거로 답한다.** `lib/prompt.js`의 근거 제한 규칙을 지우거나 약화하지 않는다.
4. **위기·의료 질문은 AI보다 먼저 규칙으로 처리한다** (`lib/safety.js`). 패턴을 줄일 때는 반드시 테스트를 함께 고친다.
5. 사용자 입력은 항상 `lib/validate.js`를 거친다 (길이 제한, 빈 값, 타입).
6. `lib/` 파일은 브라우저와 Node가 함께 쓴다. `posts.js`, `templates.js` 외에는 `node:` 모듈을 import하지 않는다.
7. 기능 변경 시 `tests/`에 단위테스트를 추가하고 `npm test`가 통과해야 커밋한다.

## 3. 폴더 구조
| 경로 | 역할 |
|---|---|
| `posts/` | 블로그 원고 (마크다운 + front-matter) |
| `site/` | 정적 자산 (CSS, 챗봇 위젯 `chat.js`, 사이트 설정 `config.js`, `firebase-config.js`) |
| `scripts/build.mjs` | 원고 → HTML + 검색 색인 생성 |
| `scripts/dev.mjs` | 로컬 미리보기 서버 |
| `lib/` | 공용 로직 (마크다운, 문단 나누기, 검색, 안전 규칙, 프롬프트, 검증, 챗봇 흐름 `clover.js`) |
| `firebase.json`, `firestore.rules` | Hosting 설정, 콘텐츠 갭 로그 보안 규칙 |
| `.github/workflows/deploy.yml` | push 시 테스트 → 빌드 → Firebase 배포 |
| `tests/` | `node:test` 단위테스트 |
| `docs/` | PRD, 테스트 보고서, 로그, 스크린샷 |

## 4. 작업 순서
1. `npm run build` → `npm test` → `npm run dev` 로 로컬 확인 (Firebase 설정이 비어 있으면 데모 모드로 동작)
2. 의미 있는 결정을 했다면 `docs/logs/DECISION_LOG.md`에 한 줄 추가
3. 실패/성공 경험은 `docs/logs/SUCCESS_FAILURE_LOG.md`에 기록
4. 커밋은 `npm run save -- "종류: 내용"`으로 한다 (테스트 통과 시에만 커밋·push). 메시지는 Conventional Commits: `feat:`, `fix:`, `docs:`, `test:`, `chore:`, `refactor:`

## 5. 새 글 발행 방법 (운영)
1. `posts/`에 `YYYY-MM-DD-slug.md` 생성, front-matter에 `title`, `date`, `tags`, `summary`, `feature`(home·breathing·game·typing·books) 작성
2. 독자가 쓸 법한 말(예: 잠·수면, 번아웃·지침)을 본문에 함께 써 검색에 걸리게 한다
3. `npm run build`로 색인 갱신 확인 → 커밋 → push 하면 GitHub Actions가 Firebase에 자동 배포
4. 챗봇은 새 글을 즉시 근거로 사용한다 (별도 학습 불필요)

## 6. 챗봇 응답 품질 기준
- 근거 문단이 있으면: 3~5문장 한국어 답변 + 출처 글 링크
- 근거 문단이 없으면: "블로그에 아직 없는 내용"이라고 답하고 지어내지 않음
- 블로그 범위 밖 요청(코드 실행, 개인정보, 다른 사이트 정보)은 정중히 거절
- 위기 표현: AI 호출 없이 109·1577-0199·119 안내 / 진단·약 질문: 의료진 상담 권유
