# 다른 AI에 올려서 수정을 부탁할 수 있도록, 프로젝트 코드를 마크다운 파일 하나로 묶어요.
# 실행: source 폴더에서  powershell -ExecutionPolicy Bypass -File scripts\make-ai-bundle.ps1
$ErrorActionPreference = 'Stop'
$src = Split-Path -Parent $PSScriptRoot
$out = Join-Path (Split-Path -Parent $src) '마음버블_AI수정용.md'

$files = @(
  'package.json', 'vite.config.ts', 'vite.static.config.ts', 'netlify.toml', 'tsconfig.json',
  'drizzle.config.ts', 'db/schema.ts', 'db/index.ts',
  'netlify/database/migrations/20261107040613_create_stress_relief_tables/migration.sql',
  'src/router.tsx', 'src/styles.css',
  'src/routes/__root.tsx', 'src/routes/index.tsx', 'src/routes/game.tsx',
  'src/routes/typing.tsx', 'src/routes/books.tsx',
  'src/routes/api.stats.ts', 'src/routes/api.release.ts',
  'src/lib/i18n.ts', 'src/lib/affirmations.ts', 'src/lib/books.ts', 'src/lib/typing-phrases.ts',
  'src/lib/sound.ts', 'src/lib/confetti.ts', 'src/lib/cardImage.ts', 'src/lib/utils.ts',
  'src/components/AffirmationModal.tsx', 'src/components/BackgroundBubbles.tsx',
  'src/components/BottomNav.tsx', 'src/components/BreathingGuide.tsx',
  'src/components/CloverMascot.tsx', 'src/components/FloatingBubbleItem.tsx',
  'src/components/SoundBar.tsx', 'src/components/SubPageHeader.tsx',
  'src/components/ThemeToggle.tsx', 'src/components/error-pages.tsx'
)

$lang = @{ '.ts' = 'ts'; '.tsx' = 'tsx'; '.css' = 'css'; '.json' = 'json'; '.toml' = 'toml'; '.sql' = 'sql' }
$sb = New-Object System.Text.StringBuilder
$today = Get-Date -Format 'yyyy-MM-dd'

[void]$sb.AppendLine(@"
# 마음 버블 (Mind Bubble) — AI 수정용 전체 코드 묶음

> 만든 날짜: $today · 이 파일 하나에 사이트를 고치는 데 필요한 코드가 모두 들어 있어요.

## AI에게: 이 프로젝트에 대해
- 스트레스를 비눗방울에 담아 터뜨리는 한국어/영어 힐링 웹사이트예요.
- 기술: **TanStack Start (React 19) + Vite + Tailwind CSS v4 + TypeScript**, 아이콘은 lucide-react, 알림은 sonner.
- 배포: Netlify (서버 기능 + Netlify Database/Drizzle). 별도로 ``npm run build:static`` 으로 정적 HTML 버전도 만들 수 있어요.
- 페이지: ``/`` 홈(걱정 버블), ``/game`` 미니게임, ``/typing`` 긍정 글귀 타이핑, ``/books`` 마음버블서점.
- 라우팅은 ``src/routes/`` 의 파일 이름으로 자동 생성돼요 (``src/routeTree.gen.ts`` 는 자동 생성 파일이라 뺐어요).
- 디자인 톤: 파스텔 초록·하늘색, 둥근 모서리, 비눗방울 유리 질감, 다크 모드(``.dark`` 클래스) 지원. 글꼴은 Gowun Dodum.

## AI에게: 수정 결과를 돌려줄 때 지켜 주세요
1. 바꾼 파일마다 **파일 경로를 먼저 쓰고, 그 파일의 전체 내용**을 코드 블록으로 주세요. (일부만 주면 사람이 붙여 넣기 어려워요)
2. 새 파일을 만들면 경로와 전체 내용을, 지워야 할 파일이 있으면 경로를 알려 주세요.
3. 새 npm 패키지가 필요하면 ``package.json`` 에 넣고, 설치 명령도 알려 주세요.
4. 다크 모드(``dark:`` 클래스)와 휴대폰 화면(하단 탭 메뉴 ``BottomNav`` 때문에 ``pb-16 md:pb-0``)을 깨뜨리지 마세요.
5. 화면 문구는 한국어로, 쉬운 말로 써 주세요.

## 이 묶음에서 뺀 파일 (원본 폴더에는 있어요)
- ``src/components/ui/*`` — shadcn/ui 기본 부품(버튼, 대화상자 등). 직접 고칠 일이 거의 없어요.
- ``public/img/clover-spirit.png``(마스코트 그림), ``public/favicon.ico`` — 그림 파일
- ``pnpm-lock.yaml``, ``.claude/``, ``docs/``, 테스트 파일, 서식 설정 파일

## 폴더 구조
``````
"@)

foreach ($f in $files) { [void]$sb.AppendLine($f) }
[void]$sb.AppendLine('```')
[void]$sb.AppendLine()
[void]$sb.AppendLine('---')
[void]$sb.AppendLine()

foreach ($f in $files) {
  $path = Join-Path $src $f
  $content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8).TrimEnd()
  $ext = [System.IO.Path]::GetExtension($f)
  $l = $lang[$ext]
  [void]$sb.AppendLine("## 파일: ``$f``")
  [void]$sb.AppendLine()
  [void]$sb.AppendLine('```' + $l)
  [void]$sb.AppendLine($content)
  [void]$sb.AppendLine('```')
  [void]$sb.AppendLine()
}

[System.IO.File]::WriteAllText($out, $sb.ToString(), (New-Object System.Text.UTF8Encoding($false)))
Write-Output $out
