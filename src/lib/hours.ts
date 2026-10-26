import type { Persona } from '../data/personas';

const NIGHT_HOURS = [22, 23, 0, 1, 2, 3, 4, 5];
const NIGHT_W = [1.3, 1.5, 1.4, 1.1, 0.8, 0.5, 0.3, 0.3];
const DAY_HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

/** Share of listening minutes (percent, summing to 100) for each of 24 hours. */
export function hourShares(P: Persona): number[] {
  const ns = NIGHT_W.reduce((a, b) => a + b, 0);
  const dw = DAY_HOURS.map((h) => 1 + P.pk.b * 4 * Math.exp(-Math.pow(h - P.pk.c, 2) / (2 * P.pk.w * P.pk.w)));
  const ds = dw.reduce((a, b) => a + b, 0);
  const out: number[] = [];
  for (let h = 0; h < 24; h++) {
    const ni = NIGHT_HOURS.indexOf(h);
    out.push(ni >= 0 ? (P.night * NIGHT_W[ni]) / ns : ((100 - P.night) * dw[DAY_HOURS.indexOf(h)]) / ds);
  }
  return out;
}

export const isNightHour = (h: number) => h >= 22 || h < 6;

export interface HourBar {
  pct: number;
  col: string;
  tick: string;
  night: boolean;
}

export function hoursOf(P: Persona): HourBar[] {
  const v = hourShares(P);
  const mx = Math.max(...v);
  return v.map((x, h) => ({
    pct: Math.max(4, Math.round((x / mx) * 100)),
    night: isNightHour(h),
    col: isNightHour(h) ? '#FF4FA3' : '#A78BFA',
    tick: h % 6 === 0 ? (h === 0 ? '12a' : h === 12 ? '12p' : h < 12 ? h + 'a' : h - 12 + 'p') : '',
  }));
}
