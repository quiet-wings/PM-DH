# 마음 버블 (Mind Bubble) - 스트레스 날려보내기 쉼터

> 마음을 무겁게 짓누르는 걱정과 스트레스를 맑은 생각 방울에 담아 톡 터트려 날려보내는 힐링 웹 애플리케이션입니다.

## ✨ 주요 기능 및 특징

1. **인터랙티브 스트레스 버블 (Interactive Stress Bubbles)**
   - 일/학업, 인간관계, 미래/불안, 피로/번아웃 등 카테고리별로 마음속 스트레스를 버블로 시각화합니다.
   - 유기적인 비눗방울 물성과 부드러운 유영 애니메이션, 감각적인 글래스모피즘 디자인을 적용했습니다.

2. **기분 좋은 터트리기 인터랙션 (Satisfying Pop & Release)**
   - 버블을 톡 누르면 파티클 폭죽(Confetti)과 함께 경쾌하고 맑은 펜타토닉 크리스탈 차임 사운드가 재생됩니다.
   - 버블이 터진 자리에 마음을 다독이는 따뜻한 위로 문장(Affirmation)이 피어납니다.

3. **생각 정리 및 바람으로 날려보내기 (Mind Declutter & Breeze Release)**
   - 여러 개의 복잡한 생각을 카테고리별로 한눈에 정리할 수 있습니다.
   - '바람 불어 모두 날려보내기' 기능을 통해 화면 가득한 모든 걱정을 하늘 위로 한 번에 날려보낼 수 있습니다.

4. **네잎클로버 힐링 정령 마스코트**
   - 넷리파이 AI 게이트웨이(Netlify AI Gateway)의 고화질 일러스트 생성 모델을 활용한 따뜻하고 감성적인 클로버 정령 캐릭터.
   - 유저의 인터랙션에 반응하는 대화 말풍선 및 반응 애니메이션.

5. **자체 합성 힐링 사운드 (Web Audio API Synthesizer)**
   - 외부 오디오 파일 다운로드 없이 브라우저 내장 Web Audio API로 100% 동작하는 경쾌한 팝 사운드, 바람 소리, 174Hz 싱잉볼 명상 드론 사운드.

6. **마음 안정 4-4 호흡 가이드 (Breathing Guide)**
   - 긴장된 신경계를 이완시켜 주는 4초 들이쉼 / 4초 머금음 / 4초 내쉼 시각화 호흡 가이드.

7. **글로벌 선의의 연대 카운터 (Netlify Database)**
   - 방문자들과 함께 날려보낸 걱정의 수를 실시간으로 집계 및 공유하여 "혼자가 아니다"라는 연대감과 위로를 전달합니다.

8. **내가 모은 위로 보관함 (Affirmation Collection)**
   - 버블을 터트려 수집한 따스한 문장들을 모아보고, 친구나 동료에게 응원의 메시지를 공유할 수 있습니다.

---

## 🛠️ 기술 스택

- **Framework**: TanStack Start (React 19)
- **Styling**: Tailwind CSS v4, Lucide Icons, Canvas Confetti
- **Typography**: Google Fonts (Gowun Dodum, Gaegu, Plus Jakarta Sans)
- **Audio**: Web Audio API Procedural Synthesizer
- **Database**: Netlify Database (Managed Postgres) with Drizzle ORM
- **AI / Assets**: Netlify AI Gateway, Netlify Image CDN

---

## 🚀 로컬 개발 환경 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev

# 빌드
pnpm build
```
