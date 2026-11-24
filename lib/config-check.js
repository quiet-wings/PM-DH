// Firebase 웹 설정이 샘플(YOUR_…)인지 실제 값인지 판단 (브라우저·Node 공용, D-016)
export function isRealConfig(cfg) {
  return Boolean(cfg && cfg.apiKey && cfg.projectId && !/^YOUR_/.test(cfg.apiKey) && !/^YOUR_/.test(cfg.projectId));
}
