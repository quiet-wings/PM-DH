import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFrontMatter, markdownToHtml, renderInline, escapeHtml, stripMarkdown } from '../lib/markdown.js';

test('front-matter: 제목과 태그 배열을 읽는다', () => {
  const { data, body } = parseFrontMatter('---\ntitle: 안녕\ntags: [호흡, 잠]\n---\n본문');
  assert.equal(data.title, '안녕');
  assert.deepEqual(data.tags, ['호흡', '잠']);
  assert.equal(body, '본문');
});

test('front-matter가 없으면 전체를 본문으로', () => {
  assert.deepEqual(parseFrontMatter('그냥 글').data, {});
});

test('제목·목록·인용·구분선을 HTML로 바꾼다', () => {
  const html = markdownToHtml('## 소제목\n\n- 하나\n- 둘\n\n1. 첫째\n\n> 인용\n\n---');
  assert.match(html, /<h2 id="소제목">소제목<\/h2>/);
  assert.match(html, /<ul><li>하나<\/li><li>둘<\/li><\/ul>/);
  assert.match(html, /<ol><li>첫째<\/li><\/ol>/);
  assert.match(html, /<blockquote><p>인용<\/p><\/blockquote>/);
  assert.match(html, /<hr>/);
});

test('굵게·코드·외부 링크', () => {
  const html = renderInline('**굵게** `코드` [링크](https://example.com)');
  assert.match(html, /<strong>굵게<\/strong>/);
  assert.match(html, /<code>코드<\/code>/);
  assert.match(html, /href="https:\/\/example.com" target="_blank" rel="noopener"/);
});

test('보안: HTML 태그와 javascript: 링크를 무력화한다 (XSS 방지)', () => {
  const html = markdownToHtml('<script>alert(1)</script>\n\n[나쁜 링크](javascript:alert(1))');
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('javascript:'));
  assert.equal(escapeHtml(`"'<>&`), '&quot;&#39;&lt;&gt;&amp;');
});

test('검색용 순수 텍스트에는 마크다운 기호가 없다', () => {
  assert.equal(stripMarkdown('## 제목\n**굵게** [링크](/a)'), '제목 굵게 링크');
});
