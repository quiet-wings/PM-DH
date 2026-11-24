// 로컬 미리보기 서버 (Firebase Hosting의 cleanUrls 동작을 흉내 냄)
// 실행: npm run dev → http://localhost:5173
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, dirname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const PORT = Number(process.env.PORT || 5173);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json' };

async function resolveFile(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  const candidates = clean.endsWith('/') ? [join(clean, 'index.html')] : [clean, `${clean}.html`];
  for (const c of candidates) {
    const p = join(root, c);
    if (!p.startsWith(root)) continue;
    try { if ((await stat(p)).isFile()) return p; } catch {}
  }
  return null;
}

createServer(async (req, res) => {
  const file = await resolveFile(req.url);
  if (!file) {
    res.writeHead(404, { 'content-type': TYPES['.html'] });
    return res.end(await readFile(join(root, '404.html')));
  }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
  res.end(await readFile(file));
}).listen(PORT, () => console.log(`🍀 http://localhost:${PORT}`));
