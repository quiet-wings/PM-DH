# 마음버블 테스트 버전2 를 Cloudflare Pages 에 올려요.
# 사용법: 이 폴더에서 PowerShell 을 열고 →  powershell -ExecutionPolicy Bypass -File .\배포하기.ps1
# - 처음 한 번은 브라우저가 열리며 Cloudflare 로그인을 물어봐요. (로그인 후 Allow)
# - 처음 한 번은 고민 저장소(KV)를 자동으로 만들고 wrangler.toml 에 번호를 적어요.

$ErrorActionPreference = 'Continue'
$node = 'C:\Users\USER\AppData\Local\Programs\nodejs-portable\node-v24.22.3-win-x64'
if (Test-Path $node) { $env:Path = "$node;" + $env:Path }
Set-Location $PSScriptRoot

if (-not (Test-Path 'node_modules')) {
  Write-Host '도구(wrangler)를 설치하는 중...'
  npm install --no-audit --no-fund
}

Write-Host 'Cloudflare 로그인 확인 중...'
$who = (npx wrangler whoami 2>&1 | Out-String)
if ($who -match 'not authenticated' -or $who -match 'You are not') {
  npx wrangler login
}

$toml = Get-Content 'wrangler.toml' -Raw -Encoding UTF8
if ($toml -match 'REPLACE_WITH_KV_ID') {
  Write-Host '고민 저장소(KV)를 처음 만드는 중...'
  $out = (npx wrangler kv namespace create WORRIES 2>&1 | Out-String)
  $m = [regex]::Match($out, 'id\s*=\s*"([0-9a-f]{32})"')
  if (-not $m.Success) { $m = [regex]::Match($out, '"id"\s*:\s*"([0-9a-f]{32})"') }
  if (-not $m.Success) { Write-Host $out; throw '저장소 번호를 찾지 못했어요. 위 내용을 캡처해서 알려 주세요.' }
  $toml = $toml.Replace('REPLACE_WITH_KV_ID', $m.Groups[1].Value)
  [IO.File]::WriteAllText((Join-Path $PSScriptRoot 'wrangler.toml'), $toml, (New-Object Text.UTF8Encoding $false))
  Write-Host '저장소를 만들고 wrangler.toml 에 적었어요.'
}

Write-Host '사이트 프로젝트 확인 중...'
try { npx wrangler pages project create maeumbubble-test --production-branch main 2>&1 | Out-Null } catch {}

Write-Host '올리는 중...'
npx wrangler pages deploy --branch main
Write-Host ''
Write-Host '끝났어요! 위에 나온 https://....pages.dev 주소를 지인들에게 보내면 돼요.'
