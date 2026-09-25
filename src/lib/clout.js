// Validation economics. Likes grow with *game* time toward a peak that editing raises.
export const STAR_AT = [100, 1000, 10000, 50000, 250000];
export const starsFor = (n) => STAR_AT.filter((t) => n >= t).length;

export function likesOf(post, now) {
  if (!post.peak) return 0;
  const t = Math.max(0, now - post.createdAt);
  return Math.round(post.peak * (1 - Math.exp(-t / 60)));
}

// More editing = more clout. That's the whole lesson of the app (and of the internet).
export function peakFor({ edited, lens, roast, tags = 0 }) {
  let p = 700 + Math.random() * 900;
  if (edited) p *= 7;
  if (lens) p *= 3;
  if (roast) p *= 4;
  return Math.round(p * (1 + tags * 0.6));
}

export const fmt = (n) =>
  n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e4 ? `${(n / 1e3).toFixed(1)}K` : n.toLocaleString();

if (import.meta.env?.DEV) {
  console.assert(starsFor(0) === 0 && starsFor(1000) === 2 && starsFor(1e6) === 5, 'starsFor');
  console.assert(likesOf({ peak: 1000, createdAt: 0 }, 0) === 0, 'likes start at 0');
  console.assert(likesOf({ peak: 1000, createdAt: 0 }, 6000) === 1000, 'likes converge to peak');
}
