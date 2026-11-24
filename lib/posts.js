import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseFrontMatter, markdownToHtml } from './markdown.js';
export { chunkPost } from './chunk.js';

/** 파일명 YYYY-MM-DD-slug.md 에서 slug 추출 */
export function slugFromFilename(filename) {
  return filename.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

/** 원고 하나를 파싱해 글 객체로 만든다 */
export function parsePost(filename, source) {
  const { data, body } = parseFrontMatter(source);
  if (!data.title) throw new Error(`${filename}: front-matter에 title이 없습니다`);
  const tags = Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [];
  return {
    slug: slugFromFilename(filename),
    title: data.title,
    date: data.date || filename.slice(0, 10),
    tags,
    summary: data.summary || '',
    feature: data.feature || 'home',
    body,
    html: markdownToHtml(body),
  };
}

export function loadPosts(dir) {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => parsePost(f, readFileSync(join(dir, f), 'utf8')))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

