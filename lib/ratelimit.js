// 브라우저 단위 호출 제한 (서버가 없으므로 1차 방어. 2차 방어는 Firebase App Check)
export function createRateLimiter({ limit = 10, windowMs = 60_000, now = () => Date.now() } = {}) {
  let hits = [];
  return {
    tryHit() {
      const t = now();
      hits = hits.filter((h) => t - h < windowMs);
      if (hits.length >= limit) {
        const retryInSec = Math.ceil((windowMs - (t - hits[0])) / 1000);
        return { ok: false, retryInSec };
      }
      hits.push(t);
      return { ok: true };
    },
  };
}
