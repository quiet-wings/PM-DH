// 마음버블서점 ↔ 마음버블 서버(Cloudflare Pages Functions) 연결
// - AI 추천: POST /api/bookstore/recommend  (Claude 키는 Cloudflare 비밀값에만 있어요)
// - 피드백:  POST /api/bookstore/feedback   (별점·메시지를 이름 없이 30일 보관)
// - 방문·검색 기록은 남기지 않아요. 책 목록은 페이지에 들어 있는 목록을 써요.
(() => {
  "use strict";

  const post = async (path, body) => {
    let r;
    try {
      r = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
    } catch {
      throw { code: "other" };
    }
    const data = await r.json().catch(() => null);
    if (!r.ok) throw { code: (data && data.error) || "other" };
    return data;
  };

  window.MB_CLOUD = {
    enabled: true,
    visit() {},
    search() {},
    feedback({ rating, message, lang }) {
      return post("/api/bookstore/feedback", {
        rating: rating || null,
        message: String(message || "").slice(0, 1000) || null,
        lang
      }).then(() => true, () => false);
    },
    async books() {
      return null;
    },
    ai(text, lang) {
      return post("/api/bookstore/recommend", { text: String(text || "").slice(0, 300), lang });
    }
  };
})();
