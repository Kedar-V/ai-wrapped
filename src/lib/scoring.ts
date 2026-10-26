import { FE, REF, TH, W, type FeatureKey, type Features } from '../data/model';

const clamp = (x: number) => Math.min(Math.max(x, 0), 1);

export interface Contribution {
  k: FeatureKey;
  raw: number;
  norm: number;
  w: number;
  pts: number;
}

export interface ScoreResult {
  c: Contribution[];
  total: number;
  flag: boolean;
}

/** The one scoring rule: 100 × (0.35n + 0.30l + 0.20r + 0.15p); flag if ≥ 70. */
export function scoreOf(f: Features): ScoreResult {
  const c = FE.map((k) => {
    const norm = clamp(f[k] / REF[k]);
    return { k, raw: f[k], norm, w: W[k], pts: 100 * W[k] * norm };
  });
  const total = c.reduce((a, b) => a + b.pts, 0);
  return { c, total, flag: total >= TH };
}

export const roundScore = (f: Features) => Math.round(scoreOf(f).total);
