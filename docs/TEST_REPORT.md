# 테스트 보고서 — 마음버블 블로그 「클로버에게 물어보기」

| 항목 | 내용 |
|---|---|
| 버전·일자 | v1.3 (A4 2쪽으로 압축) · 2026-11-24 · 대상 `main` (PRD v1.7) |
| 환경 | Node 22 `node:test` · Chromium(Playwright) 390×844 모바일 / 1280×800 데스크톱 · 배포 주소(Firebase Hosting) |
| 결과 | **단위테스트 69/69 통과** · 유저플로우 11개 화면 정상 · CSP 위반 0건 · **배포 주소에서 실제 AI(Claude) 답변 확인** → P0·P1 통과, **출시 가능** |

## 1. 기능별 단위테스트 (`npm test`)

| 영역 | 파일 | 개수 | 주요 확인 내용 | 결과 |
|---|---|---|---|---|
| 마크다운 변환 | `markdown` | 6 | front-matter, 제목·목록·인용, **XSS 차단**(`<script>`, `javascript:`) | ✅ |
| 원고·문단 | `posts` | 5 | 원고 필수 항목·`feature`, 소제목 단위 조각·출처 URL | ✅ |
| 검색 품질 | `search` | 16 | 조사 제거, **답 있는 질문 10개 → 기대 글 2위 이내**, **범위 밖 5개 → 근거 없음** | ✅ |
| 안전 규칙 | `safety` | 13 | **위기 표현 7개 감지**, 오탐 4개 방지, 109·1577-0199·119, 진단·약 질문 감지 | ✅ |
| 입력·남용 방지 | `validate` | 4 | 빈 값·300자 초과 거절, 전화·이메일·주민번호 마스킹, 분당 10회 제한 | ✅ |
| 챗봇 흐름 | `clover` | 11 | 답변+출처+기능 링크, 위기·의료·범위 밖 **AI 미호출**, `[[NO_ANSWER]]`, 오류·15초 초과 시 데모 답변, 근거 번호=출처 번호 | ✅ |
| 빌드·설정·보안 | `build`·`config` | 14 | 전 페이지 챗봇·109·처리방침, **키 미포함**, CSP·인라인 금지, 샘플 설정만 커밋, 아이콘 통일, 자산 `?v=` | ✅ |

PRD 지표 연결: 위기 대응 100%(13/13) · 범위 밖 정직성 100%(5/5) · 출처 포함 답변 100%(10/10).

## 2. 전체 유저플로우 (화면 스크린샷 — `docs/screenshots/`)

| ① 홈 | ② 글 하단 버튼 | ③ 챗봇 열기 | ④ 답변+출처 |
|---|---|---|---|
| <img src="screenshots/01-home-mobile.png" width="90"> | <img src="screenshots/03-post-cta.png" width="90"> | <img src="screenshots/04-chat-open.png" width="90"> | <img src="screenshots/05-answer-demo.png" width="90"> |
| 글 목록 + 질문 버튼 | 마음버블 유입 | 추천 질문 4개 | 근거 글 + 기능 링크 |

| ⑤ 범위 밖 | ⑥ 진단·약 | ⑦ 위기 표현 | ⑧ AI 답변 |
|---|---|---|---|
| <img src="screenshots/06-out-of-scope.png" width="90"> | <img src="screenshots/07-medical.png" width="90"> | <img src="screenshots/08-crisis.png" width="90"> | <img src="screenshots/09-answer-ai-mock.png" width="90"> |
| 지어내지 않음 + 갭 기록 | 의료진 상담 권유 | 109·1577-0199·119 | 근거 번호 [1][2] |

글 상세·404·데스크톱 화면도 정상. ⑧은 모의 응답 화면이며, 실제 답변은 4장 배포 화면으로 확인.

## 3. 결함과 조치 (자세히: `logs/SUCCESS_FAILURE_LOG.md`)

① 조사 붙은 질문 근거 없음 → 조사 제거 ② 범위 밖 질문에 서점 글 답변 → 핵심어 50% 기준 ③ 의료 질문 말순서 → 패턴 추가 ④ 데모 답변 목록 붙음 → 기호 보존 ⑤ 390px 헤더 깨짐 → 메뉴 정리. **모두 재검증 ✅**

## 4. 배포 후 검증 (11-24, 실제 Chrome 360·390px)

| 항목 | 결과 |
|---|---|
| 홈·글·처리방침·404 / CSP·UTM | ✅ 2개 폭 가로 넘침·콘솔 오류 없음, 챗봇 질문 5종 동작, CSP 위반 0건, UTM 포함 |
| 실제 AI 답변 (Cloudflare 중계 → Claude) | ✅ 근거 번호·출처 표시, 4.6~5.1초, 타 도메인·직접 호출 403 차단 |
| 마음버블 앱(pages.dev) | ✅ 홈·미니게임·타이핑·서점·처리방침 링크 (익명 고민 전송은 별도 확인) |

화면: [출처 답변](screenshots/deploy-02-answer.png) · [범위 밖](screenshots/deploy-04-out-of-scope.png) · [위기](screenshots/deploy-06-crisis.png) · [처리방침](screenshots/deploy-07-privacy.png)
