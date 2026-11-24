# AGENTS.md — AI 코딩 에이전트용 지침

이 저장소에서 작업하는 AI 에이전트(Claude Code, Codex, Cursor 등)와 사람 기여자가 따라야 할 규칙입니다.
작업 전에 이 파일과 `docs/PRD.md`를 먼저 읽으세요.

## 1. 프로젝트 한 줄 요약
정적 블로그(`posts/*.md` → `public/`) + 블로그 글만 근거로 답하는 Q&A 챗봇(`/api/chat`, Gemini API).

## 2. 절대 규칙
1. **외부 npm 의존성 추가 금지.** Node 22 내장 기능(`fetch`, `node:test`, `node:fs`)만 사용한다.
   이유: 빌드 단계를 단순하게 유지하고 공급망 위험을 없애기 위함 (DECISION_LOG D-002).
2. **API 키를 코드·로그·커밋에 절대 넣지 않는다.** 키는 Vercel 환경변수 `GEMINI_API_KEY`로만 주입한다.
3. **챗봇은 검색된 블로그 문단만 근거로 답한다.** 프롬프트에서 근거 제한 규칙을 지우거나 약화하지 않는다.
4. 사용자 입력은 항상 `lib/validate.js`를 거친다 (길이 제한, 빈 값, 타입).
5. 기능 변경 시 `tests/`에 단위테스트를 추가하고 `npm test`가 통과해야 커밋한다.

## 3. 폴더 구조
| 경로 | 역할 |
|---|---|
| `posts/` | 블로그 원고 (마크다운 + front-matter) |
| `site/` | 정적 자산 (CSS, 챗봇 위젯 JS) |
| `scripts/build.mjs` | 원고 → HTML + 검색 색인 생성 |
| `scripts/dev.mjs` | 로컬 개발 서버 (API 포함) |
| `lib/` | 공용 로직 (마크다운 변환, 검색, 프롬프트, 검증, Gemini 호출) |
| `api/chat.js` | Vercel 서버리스 함수 |
| `tests/` | `node:test` 단위테스트 |
| `docs/` | PRD, 테스트 보고서, 로그, 스크린샷 |

## 4. 작업 순서
1. `npm run build` → `npm test` → `npm run dev` 로 로컬 확인 (키가 없으면 데모 모드로 동작)
2. 의미 있는 결정을 했다면 `docs/logs/DECISION_LOG.md`에 한 줄 추가
3. 실패/성공 경험은 `docs/logs/SUCCESS_FAILURE_LOG.md`에 기록
4. 커밋 메시지는 Conventional Commits: `feat:`, `fix:`, `docs:`, `test:`, `chore:`, `refactor:`

## 5. 새 글 발행 방법 (운영)
1. `posts/`에 `YYYY-MM-DD-slug.md` 생성, front-matter에 `title`, `date`, `tags`, `summary` 작성
2. `npm run build`로 색인 갱신 확인 → 커밋 → push 하면 Vercel이 자동 재배포
3. 챗봇은 새 글을 즉시 근거로 사용한다 (별도 학습 불필요)

## 6. 챗봇 응답 품질 기준
- 근거 문단이 있으면: 3~5문장 한국어 답변 + 출처 글 링크
- 근거 문단이 없으면: "블로그에 아직 없는 내용"이라고 답하고 지어내지 않음
- 블로그 범위 밖 요청(코드 실행, 개인정보, 다른 사이트 정보)은 정중히 거절
