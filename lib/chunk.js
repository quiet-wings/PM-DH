// 브라우저와 Node 양쪽에서 쓰는 순수 함수 (fs 사용 금지)
import { stripMarkdown, slugifyHeading } from './markdown.js';

/**
 * 글을 검색용 조각(chunk)으로 나눈다.
 * ## 소제목 단위로 자르고, 너무 길면 maxLen 근처 문장 경계에서 다시 자른다.
 */
export function chunkPost(post, maxLen = 450) {
  const sections = [];
  let current = { heading: post.title, lines: [] };
  for (const line of post.body.split('\n')) {
    const h = line.match(/^#{2,3}\s+(.*)$/);
    if (h) {
      if (current.lines.join('').trim()) sections.push(current);
      current = { heading: h[1].trim(), lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  if (current.lines.join('').trim()) sections.push(current);

  const chunks = [];
  for (const sec of sections) {
    const text = stripMarkdown(sec.lines.join('\n'));
    const pieces = [];
    let rest = text;
    while (rest.length > maxLen) {
      let cut = rest.lastIndexOf('. ', maxLen);
      if (cut < maxLen * 0.5) cut = maxLen;
      else cut += 1;
      pieces.push(rest.slice(0, cut).trim());
      rest = rest.slice(cut).trim();
    }
    if (rest) pieces.push(rest);
    pieces.forEach((p, i) => {
      chunks.push({
        id: `${post.slug}#${slugifyHeading(sec.heading)}${pieces.length > 1 ? `-${i + 1}` : ''}`,
        slug: post.slug,
        title: post.title,
        heading: sec.heading,
        url: `/posts/${post.slug}#${slugifyHeading(sec.heading)}`,
        tags: post.tags,
        feature: post.feature || 'home',
        text: p,
      });
    });
  }
  return chunks;
}
