# AGENTS.md — AI 코딩 에이전트용 지침

이 저장소에서 작업하는 AI 에이전트(Claude Code, Codex, Cursor 등)와 사람 기여자가 따라야 할 규칙입니다.
작업 전에 이 파일과 `docs/PRD.md`를 먼저 읽으세요.
(Claude Code는 루트 `CLAUDE.md`가 이 파일을 import해서 자동으로 읽습니다. 지침은 이 파일에만 쓰세요.)

## 0. 명령어 (Node 22 이상, `npm install` 불필요)
| 명령 | 하는 일 |
|---|---|
| `npm test` | `node:test` 단위테스트 전체 실행 — 커밋 전에 반드시 통과 |
| `npm run build` | `posts/*.md` → `public/` HTML + 검색 색인 생성 |
| `npm run dev` | 빌드 후 http://localhost:5173 미리보기 (Firebase 설정이 비어 있으면 데모 모드) |
| `node scripts/preview.mjs` | 블로그 전체를 HTML 한 파일(`preview/`)로 묶은 오프라인 미리보기 |
| `npm run save -- "종류: 내용"` | 메시지 검사 → pull → 테스트 → 커밋 → push (실패 시 커밋 안 함, 연습은 끝에 `--dry`) |

## 1. 프로젝트 한 줄 요약
마음버블 블로그 「마음쉼터 서비스」: 정적 사이트(`posts/*.md` → `public/`, Firebase Hosting) + 블로그 글만 근거로 답하는 Q&A 챗봇 「포앤에게 물어봐」(브라우저 → Cloudflare 중계 `/api/ask` → Claude API, D-017). 부기능인 마음버블 앱과 마음버블서점(`maeumbubble-app/public/bookstore/`, AI 추천 `/api/bookstore/recommend`, D-020)으로 연결한다.

## 2. 절대 규칙
1. **외부 npm 의존성 추가 금지.** Node 22 내장 기능(`node:test`, `node:fs`)만 사용한다. 브라우저의 Firebase SDK는 gstatic CDN에서 버전 고정으로 불러온다.
   이유: 빌드 단계를 단순하게 유지하고 공급망 위험을 없애기 위함 (DECISION_LOG D-002).
2. **AI API 키를 코드·로그·커밋에 절대 넣지 않는다.** Claude API 키는 Cloudflare 비밀값 `ANTHROPIC_API_KEY`에만 둔다(중계 서버 `maeumbubble-app/cloudflare/functions/api/ask.js`, 서점 추천 `api/bookstore/recommend.js`). 서점 추천은 서버에 고정한 책 목록 안에서만 고르게 하고, 물어본 문장은 저장하지 않는다. 중계 서버의 허용 주소·호출 제한·근거 제한 지시문을 약화하지 않는다. `site/firebase-config.js`에는 **샘플 값(YOUR_…)만** 커밋한다. 실제 웹 설정은 GitHub Secret `FIREBASE_WEB_CONFIG`(배포) 또는 `site/firebase-config.local.js`(내 컴퓨터, 커밋 금지)로 빌드 때 주입한다 (D-016). 서비스 계정 키(JSON)는 GitHub Secret에만 둔다.
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
| `scripts/preview.mjs` | 오프라인 단일 HTML 미리보기 생성 (결과물 `preview/`는 커밋하지 않음) |
| `scripts/save.mjs` | `npm run save` — 테스트 통과 시에만 커밋·push |
| `lib/` | 공용 로직 (마크다운, 문단 나누기, 검색, 안전 규칙, 프롬프트, 검증, 챗봇 흐름 `clover.js`) |
| `firebase.json`, `firestore.rules` | Hosting 설정, 콘텐츠 갭 로그 보안 규칙 |
| `.github/workflows/deploy.yml` | push 시 테스트 → 빌드 → Firebase 배포 |
| `tests/` | `node:test` 단위테스트 |
| `docs/` | PRD, 테스트 보고서, 로그, 스크린샷 |
| `maeumbubble-app/` | 마음버블 앱(TanStack Start + React, Cloudflare Pages). 자체 `package.json`·테스트(`npx vitest run`)를 쓰며 루트 "외부 의존성 금지" 규칙은 블로그에만 적용. 비밀값(관리자 비밀번호·암호키·`wrangler.toml`)은 커밋 금지 |
| `versions/` | 블로그 HTML·PRD HTML·README의 버전별 스냅샷 (`*_new_vN`). 기존 버전은 고치지 말고 `vN+1` 파일을 새로 추가 |
| `AGENTS.md` / `CLAUDE.md` | 에이전트 지침 (내용은 AGENTS.md에만, CLAUDE.md는 import 한 줄) |
| `README.md` | 사람을 위한 소개·실행·배포 안내 (에이전트 규칙은 넣지 않음) |

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
