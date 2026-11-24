// 수정한 내용을 한 번에 저장(커밋)하고 GitHub에 올리는 명령
// 사용: npm run save -- "fix: 마음버블 실제 주소로 변경"
// 순서: 메시지 형식 검사 → 최신 내용 받기 → 테스트 → 커밋 → GitHub에 올리기
// 연습용: npm run save -- "docs: 메시지" --dry   (커밋·푸시 없이 검사만)
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const message = args.filter((a) => a !== '--dry').join(' ').trim();

const TYPES = ['feat', 'fix', 'docs', 'test', 'chore', 'refactor', 'style'];
const PATTERN = new RegExp(`^(${TYPES.join('|')})(\\([^)]+\\))?: .{2,}`);

function fail(text) {
  console.error(`\n❌ ${text}\n`);
  process.exit(1);
}
function run(cmd, cmdArgs, { quiet = false } = {}) {
  const r = spawnSync(cmd, cmdArgs, { stdio: quiet ? 'pipe' : 'inherit', encoding: 'utf8', shell: process.platform === 'win32' });
  if (r.error) fail(`'${cmd}' 명령을 실행할 수 없어요. ${cmd === 'git' ? 'Git for Windows(https://git-scm.com)를 설치했는지 확인해 주세요.' : ''}`);
  return r;
}

if (!message) {
  fail('커밋 메시지를 적어 주세요.\n   예: npm run save -- "fix: 마음버블 실제 주소로 변경"');
}
if (!PATTERN.test(message)) {
  fail(`메시지는 "종류: 내용" 형식으로 적어 주세요.\n   종류: ${TYPES.join(', ')}\n   예: docs: PRD 성공 지표 수정  /  feat: 새 블로그 글 추가`);
}

console.log('🔎 1/4 바뀐 파일 확인');
const status = run('git', ['status', '--porcelain'], { quiet: true }).stdout.trim();
if (!status) fail('바뀐 파일이 없어요. 파일을 저장(Ctrl+S)했는지 확인해 주세요.');
console.log(status.split('\n').map((l) => `   ${l}`).join('\n'));

console.log('\n⬇️  2/4 GitHub의 최신 내용 받기');
if (!dry && run('git', ['pull', '--rebase', '--autostash']).status !== 0) {
  fail('최신 내용을 받다가 충돌이 났어요. GitHub Desktop을 열어 충돌난 파일을 확인해 주세요.');
}

console.log('\n🧪 3/4 테스트 실행');
if (run('npm', ['test', '--silent']).status !== 0) fail('테스트가 실패해서 커밋하지 않았어요. 위의 not ok 줄을 확인해 주세요.');

if (dry) {
  console.log(`\n✅ 연습 모드: 형식·테스트 통과. 실제로는 "${message}"(으)로 커밋돼요.`);
  process.exit(0);
}

console.log('\n💾 4/4 커밋하고 GitHub에 올리기');
run('git', ['add', '-A']);
if (run('git', ['commit', '-m', message]).status !== 0) fail('커밋에 실패했어요.');
if (run('git', ['push']).status !== 0) fail('GitHub에 올리지 못했어요. 인터넷 연결과 로그인 상태를 확인해 주세요.');
console.log(`\n✅ 완료: "${message}" — GitHub 커밋 기록에서 확인할 수 있어요.`);
