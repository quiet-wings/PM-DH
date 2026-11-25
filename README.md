# 🍀 마음버블 블로그 「마음쉼터 서비스」 — 「포앤에게 물어봐」

걱정을 비눗방울에 담아 터뜨리는 스트레스 해소 서비스 **마음버블**의 블로그입니다.
블로그 오른쪽 아래 **「포앤에게 물어봐」** 버튼에 질문하면, AI 챗봇 **포앤**(Fortune + Angel, 행운을 가져다주는 천사)이 **블로그 글만 근거로** 답하고 출처 글과 바로 해 볼 마음버블 기능을 알려 줍니다.
부기능인 **마음버블 페이지**(걱정 버블·4-4-4 호흡·미니게임·가상 사직서 「퇴사할게요」)와 **마음버블서점**(지금 마음에 맞는 책 추천)으로 이어집니다.

| 제출물 | 위치 |
|---|---|
| 배포된 블로그 | Firebase Hosting **비공개 미리보기 링크**(30일) — 링크는 제출란으로만 공유 ([D-011](docs/logs/DECISION_LOG.md)) |
| PRD 기획서 (v0.1 → v3.3, A4 2쪽) | [`docs/PRD.md`](docs/PRD.md) · 버전별 HTML [`versions/`](versions) · 과정은 `docs: PRD vX` 커밋 |
| 테스트 보고서 (v1.6, A4 2쪽) | [`docs/TEST_REPORT.md`](docs/TEST_REPORT.md) · 스크린샷 [`docs/screenshots/`](docs/screenshots) |
| 에이전트용 지침 | [`AGENTS.md`](AGENTS.md) (`CLAUDE.md`는 import 한 줄) |
| 의사결정 로그 | [`docs/logs/DECISION_LOG.md`](docs/logs/DECISION_LOG.md) (D-001~D-026, 결정자 표기 + 「결정 과정 메모」) |
| 성공·실패 로그 | [`docs/logs/SUCCESS_FAILURE_LOG.md`](docs/logs/SUCCESS_FAILURE_LOG.md) (#1~#32) |
| 제출 체크리스트 | [`docs/SUBMISSION_CHECKLIST.md`](docs/SUBMISSION_CHECKLIST.md) |
| 소스코드 | 블로그: `lib/`(챗봇·검색·안전 규칙), `site/`(화면), `scripts/`(빌드), `posts/`(글), `tests/` · 마음버블 앱·서점: [`maeumbubble-app/`](maeumbubble-app) |
| 마음버블 페이지 | https://maeumbubble-test.pages.dev (Cloudflare Pages) |
| 마음버블서점 | https://maeumbubble-test.pages.dev/bookstore/ — 감정 단어·한 문장으로 책 3권 추천, 「AI에게 물어보기」 ([D-020](docs/logs/DECISION_LOG.md)) |

## 어떤 문제를 푸나요
> **지친 독자는 블로그에 답이 있어도 어느 글에 있는지 몰라 이탈하고, 1인 운영자는 같은 질문에 반복해서 답한다.**

- **독자**: 지친 순간에 긴 글을 다 읽기 어렵고, 답이 어느 글에 있는지 모른다.
- **운영자(1인)**: 같은 질문에 반복해서 답하고, 독자가 뭘 궁금해하는지 데이터가 없다.
- **해결**: 블로그 글 근거 Q&A 챗봇 포앤 → 답 + 출처 + 마음버블 기능 링크. 답하지 못한 질문은 익명으로 모아 다음 글 주제로 쓴다.

## 만든 방식 (사람 + AI 에이전트)
기획자 **quiet-wings**와 AI 코딩 에이전트 **Claude**가 함께 만들었습니다. 의사결정 로그의 결정자는 세 가지로 적습니다.

| 결정자 | 뜻 | 예 |
|---|---|---|
| quiet-wings | 기획자가 직접 내린 결정 | D-003 마음버블 연결, D-008 병원 타깃 |
| Claude(AI 에이전트) + quiet-wings 공동 | quiet-wings가 방향·요구사항 초안을 주고, 중간 수정과 최종 결정은 함께 | D-001 챗봇 집중, D-007 Firebase + 무료 AI Logic |
| Claude(AI 에이전트) | 에이전트의 기술 판단 | D-002 외부 의존성 없음, D-005 키워드 검색 |

공동 결정이 어떤 순서로 이루어졌는지는 로그 아래 「결정 과정 메모」에 있습니다. 비밀키는 사람이 직접 만들어 GitHub Secret·Cloudflare 비밀값에 넣고, 저장소에는 이름만 적습니다(성공·실패 #23).

## 동작 흐름
```
질문 → 입력 검증 → 위기·의료 질문 검사(규칙) → 블로그 문단 검색(BM25 + 핵심어 일치율)
     → Cloudflare 중계 서버(/api/ask) → Claude API가 근거 문단만으로 답변 → 답변 + 출처 글 + 마음버블 기능
     ↘ 근거 없음: "아직 블로그에 없는 내용" + Firestore content_gaps 기록
     ↘ 위기 표현: AI 없이 109 · 1577-0199 · 119 안내

마음버블서점: 감정 버튼 또는 한 문장 → (AI에게 물어보기) Cloudflare /api/bookstore/recommend → Claude가
     서버에 고정된 책 100권 안에서만 3권과 추천 이유를 고름 → 책 카드(표지·이유·교보문고 연결)
```

## 로컬에서 실행
```bash
npm test        # 블로그 단위테스트 69개
npm run dev     # 빌드 후 http://localhost:5173 (Firebase 설정이 비어 있으면 데모 모드)
```
외부 npm 패키지가 없어 `npm install`이 필요 없습니다 (Node 22 이상).
마음버블 앱은 `maeumbubble-app/`에서 `npx vitest run`(단위테스트 10개, 테스트 보고서 v1.6과 동일)으로 확인합니다.

## 보안·개인정보
- **보안 헤더**(`firebase.json`): CSP로 이 사이트·Firebase SDK(gstatic)·Claude 중계 서버·Firestore 주소만 허용, 클릭재킹 차단(`frame-ancestors 'none'`), HSTS, COOP, Permissions-Policy. 테스트가 CSP 필수 항목과 인라인 스크립트 금지를 검사해요.
- **AI 키**: Claude API 키는 Cloudflare 비밀값에만 있어요. 코드·GitHub·브라우저에는 없어요. 중계 서버는 허용된 주소에서 온 요청만 받고 호출 횟수를 제한해요(포앤 분당 30·하루 600회, 서점 분당 20·하루 300회).
- **개인정보**: 회원가입·추적 쿠키 없음. 포앤 질문 원문은 저장하지 않고, 답하지 못한 질문만 전화번호·이메일·주민번호를 가려 기록(최대 90일). 서점에 물어본 문장은 저장하지 않고 별점·한마디만 이름 없이 30일 보관. 자세한 내용은 `/privacy`.

## 수정한 내용 저장하기 (커밋 + GitHub 올리기)
```bash
npm run save -- "fix: 마음버블 실제 주소로 변경"
```
메시지 형식 검사 → 최신 내용 받기 → 테스트 → 커밋 → push를 한 번에 합니다. 테스트가 실패하면 커밋하지 않아요.
메시지 종류: `feat`(기능) `fix`(수정) `docs`(문서) `test`(테스트) `chore`(설정) `refactor` `style`. 연습: 끝에 `--dry`.
Windows에서는 [Git for Windows](https://git-scm.com)가 필요해요 (GitHub Desktop만으로는 `git` 명령이 없음).

## 배포
**블로그 (Firebase Hosting, 처음 한 번 설정)**
1. [Firebase 콘솔](https://console.firebase.google.com)에서 프로젝트 만들기 (무료 Spark 요금제)
2. 프로젝트 설정 → 내 앱 → 웹 앱 추가 → `firebaseConfig` 값을 확인. **저장소의 [`site/firebase-config.js`](site/firebase-config.js)에는 샘플 키(`YOUR_…`)만 둡니다.** 내 컴퓨터에서 AI까지 보려면 이 파일을 `site/firebase-config.local.js`로 복사해 실제 값을 넣으세요(커밋되지 않음)
3. **Firestore Database** 만들기 → 규칙 탭에 [`firestore.rules`](firestore.rules) 내용 붙여 넣기
4. 프로젝트 설정 → 서비스 계정 → 새 비공개 키 생성(JSON)
5. GitHub 저장소 → Settings → Secrets and variables → Actions
   - Secret `FIREBASE_SERVICE_ACCOUNT` = JSON 파일 내용 전체
   - Secret `FIREBASE_WEB_CONFIG` = 웹 앱 설정 JSON (없으면 배포를 건너뜀)
   - Variable `FIREBASE_PROJECT_ID` = 프로젝트 ID
6. `main`에 push → Actions가 테스트·빌드 후 **미리보기 채널 `share`(30일)**에 배포. 공개 주소로 바꾸려면 `deploy.yml`의 `channelId`를 `live`로

**AI 중계·마음버블 페이지·서점 (Cloudflare Pages)**
- Claude API 키 등록: `npx wrangler pages secret put ANTHROPIC_API_KEY --project-name maeumbubble-test`
- 중계 코드: [`ask.js`](maeumbubble-app/cloudflare/functions/api/ask.js)(포앤) · [`bookstore/recommend.js`](maeumbubble-app/cloudflare/functions/api/bookstore/recommend.js)(서점 추천) · [`bookstore/feedback.js`](maeumbubble-app/cloudflare/functions/api/bookstore/feedback.js)(서점 별점)
- 앱을 정적 빌드한 뒤 배포 폴더에서 `배포하기.ps1`을 실행합니다. 서점은 `maeumbubble-app/public/bookstore/`에 있고, 예전 `/books` 주소는 `/bookstore/`로 넘어가요.
- 홈·서점 배경음 `maeumbubble-app/public/audio/rain-mind.mp3`는 라이선스상 저장소에 올리지 않아요. [Pixabay 「Rain Mind」](https://pixabay.com/music/meditationspiritual-rain-mind-195496/)를 받아 앞 8분을 이 이름으로 넣은 뒤 빌드하세요 ([D-021](docs/logs/DECISION_LOG.md)). 뽁뽁이 효과음 `public/audio/wrap-pop-1.wav`·`wrap-pop-2.wav`(CC0 영상에서 잘라 낸 소리)와 네잎클로버 효과음 `clover-rustle.wav`([OpenGameArt 「20 rustles dry leaves」](https://opengameart.org/content/20-rustles-dry-leaves) 17번, CC0)도 같은 이유로 저장소에 없고, 없으면 예전 합성 소리로 대신 나요 (성공·실패 #26·#28).

## 새 글 쓰기
`posts/YYYY-MM-DD-slug.md`를 만들고 front-matter(`title`, `date`, `tags`, `summary`, `feature`)를 채워 push하면 끝. 포앤이 새 글을 바로 근거로 씁니다.

## 배포 주소에서 확인한 내용 (2026-11-25 기준 · 테스트 보고서 v1.6)

| 영역 | 반영 내용 | 확인 |
|---|---|---|
| 포앤 AI | Cloudflare 중계(`/api/ask`) → Claude 실제 답변, 근거 번호와 출처 목록 번호 일치 | 답변 4.6~5.1초 |
| 안전 | 범위 밖 질문 "아직 블로그에 없는 내용", 진단·약 질문 의료진 권유, 위기 표현 109·1577-0199·119 안내 (AI 미호출) | 테스트 통과 |
| 남용 방지 | 허용된 주소에서 온 요청만 받음, 호출 횟수 제한, 키는 Cloudflare 비밀값에만 | 타 도메인 요청 403 |
| 마음버블서점 | 감정 단어·한 문장 책 추천, AI 추천 이유 한 줄, 작가 쪽지·BGM·다크 모드·한국어/English | AI 추천 4.6~6.9초 |
| 개인정보·보안 | `/privacy` 처리방침(모든 페이지 하단·챗봇 안내문 링크), 보안 헤더(CSP·HSTS·COOP 등) | CSP 위반 0건 |
| 모바일 | 360·390px에서 홈·글·처리방침·404 가로 넘침·콘솔 오류 없음 | 실제 Chrome 점검 |
| 단위테스트 | 블로그 `npm test` 69개 · 마음버블 앱 `npx vitest run` 10개 | 69/69 · 10/10 통과 |
| 마음버블 연결 | 글 하단·포앤 답변·헤더 버튼 → 마음버블 페이지·서점 (UTM `utm_source=maeum-blog`) | 링크 정상 |

**기술**: 정적 사이트 생성기·검색 엔진·마크다운 변환기를 **외부 라이브러리 없이** 직접 구현(Node 22) · Firebase Hosting · Firestore · GitHub Actions · Cloudflare Pages Functions(중계) + Claude API · 마음버블 앱 TanStack Start + React
