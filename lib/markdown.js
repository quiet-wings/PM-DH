// 무의존성 마크다운 → HTML 변환기 (블로그 원고에 필요한 문법만 지원)
// 지원: front-matter, 제목(#~###), 문단, 목록(-, 1.), 인용(>), 코드블록(```), 구분선(---),
//       인라인: **굵게**, *기울임*, `코드`, [링크](url)

export function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** front-matter(--- 사이의 key: value)를 분리한다. tags는 [a, b] 형태를 배열로 변환 */
export function parseFrontMatter(source) {
  const text = source.replace(/\r\n/g, '\n');
  const match = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { data: {}, body: text };
  const data = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map((v) => v.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    } else {
      value = value.replace(/^["']|["']$/g, '');
    }
    data[key] = value;
  }
  return { data, body: text.slice(match[0].length) };
}

function safeUrl(url) {
  const u = url.trim();
  // javascript: 같은 위험한 스킴 차단
  if (/^(https?:|mailto:|\/|#|\.\/)/i.test(u)) return u;
  return '#';
}

export function renderInline(text) {
  let out = escapeHtml(text);
  const codes = [];
  out = out.replace(/`([^`]+)`/g, (_, c) => {
    codes.push(`<code>${c}</code>`);
    return `\u0000${codes.length - 1}\u0000`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, url) => {
    const href = safeUrl(url.replace(/&amp;/g, '&'));
    const external = /^https?:/i.test(href);
    return `<a href="${escapeHtml(href)}"${external ? ' target="_blank" rel="noopener"' : ''}>${label}</a>`;
  });
  out = out.replace(/\u0000(\d+)\u0000/g, (_, i) => codes[Number(i)]);
  return out;
}

export function slugifyHeading(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

/** 마크다운 본문을 HTML로 변환 */
export function markdownToHtml(md) {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const html = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^```/.test(line)) {
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++; // 닫는 ```
      html.push(`<pre><code>${escapeHtml(buf.join('\n'))}</code></pre>`);
      continue;
    }
    if (/^\s*$/.test(line)) { i++; continue; }
    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      html.push(`<h${level} id="${escapeHtml(slugifyHeading(h[2]))}">${renderInline(h[2])}</h${level}>`);
      i++;
      continue;
    }
    if (/^(-{3,}|\*{3,})\s*$/.test(line)) { html.push('<hr>'); i++; continue; }
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      html.push(`<blockquote><p>${renderInline(buf.join(' '))}</p></blockquote>`);
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) buf.push(lines[i++].replace(/^\s*[-*]\s+/, ''));
      html.push(`<ul>${buf.map((b) => `<li>${renderInline(b)}</li>`).join('')}</ul>`);
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) buf.push(lines[i++].replace(/^\s*\d+\.\s+/, ''));
      html.push(`<ol>${buf.map((b) => `<li>${renderInline(b)}</li>`).join('')}</ol>`);
      continue;
    }
    const buf = [];
    while (
      i < lines.length &&
      !/^\s*$/.test(lines[i]) &&
      !/^(#{1,3}\s|```|>|\s*[-*]\s+|\s*\d+\.\s+)/.test(lines[i])
    ) buf.push(lines[i++]);
    html.push(`<p>${renderInline(buf.join(' '))}</p>`);
  }
  return html.join('\n');
}

/** 마크다운 기호를 걷어낸 순수 텍스트 (검색 색인용) */
export function stripMarkdown(md) {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_>#]/g, '')
    .replace(/^\s*[-]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}
