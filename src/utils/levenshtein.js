// Levenshtein Distance implementation to score pronunciation similarity
export function levenshteinDistance(a = '', b = '') {
  const s = a.toLowerCase();
  const t = b.toLowerCase();
  const n = s.length;
  const m = t.length;

  if (n === 0) return m;
  if (m === 0) return n;

  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 0; i <= n; i += 1) dp[i][0] = i;
  for (let j = 0; j <= m; j += 1) dp[0][j] = j;

  for (let i = 1; i <= n; i += 1) {
    for (let j = 1; j <= m; j += 1) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[n][m];
}

export function similarityScore(a = '', b = '') {
  const maxLen = Math.max(a.length, b.length, 1);
  const distance = levenshteinDistance(a, b);
  const score = ((maxLen - distance) / maxLen) * 100;
  return Math.max(0, Math.min(100, Math.round(score)));
}
