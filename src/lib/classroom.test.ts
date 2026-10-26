import { describe, expect, it } from 'vitest';
import { mergeSubmissions, parseCsv, tally, toCsv, type Submission } from './classroom';

const a: Submission = { id: 'a', timestamp: 't1', principles: ['Privacy', 'Validity', 'Accountability'] };
const b: Submission = { id: 'b', timestamp: 't2', principles: ['Validity', 'Autonomy', 'Fairness'] };

describe('classroom CSV', () => {
  it('round-trips', () => {
    expect(parseCsv(toCsv([a, b]))).toEqual([a, b]);
  });

  it('ignores invalid rows', () => {
    const csv = 'id,timestamp,principle1,principle2,principle3\nx,t,Privacy,Privacy,Validity\ny,t,Privacy,Nope,Validity\nz,t,Privacy,Validity\n' + 'ok,t,Privacy,Validity,Fairness\n';
    expect(parseCsv(csv).map((s) => s.id)).toEqual(['ok']);
  });

  it('merges by id with later sources winning', () => {
    const a2 = { ...a, principles: ['Fairness', 'Autonomy', 'Privacy'] };
    expect(mergeSubmissions([a, b], [a2])).toHaveLength(2);
    expect(mergeSubmissions([a], [a2]).find((s) => s.id === 'a')?.principles).toEqual(a2.principles);
  });

  it('tallies participants per principle', () => {
    const t = tally([a, b]);
    expect(t[0]).toMatchObject({ name: 'Validity', count: 2, pct: 100 });
    expect(t.find((x) => x.name === 'Privacy')).toMatchObject({ count: 1, pct: 50 });
    expect(t.reduce((n, x) => n + x.count, 0)).toBe(6);
  });
});
