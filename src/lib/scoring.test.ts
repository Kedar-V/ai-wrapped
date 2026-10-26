import { describe, expect, it } from 'vitest';
import { featuresOf, PERSONAS } from '../data/personas';
import { hourShares } from './hours';
import { scoreOf } from './scoring';
import { initState, useAppStore } from '../store/useAppStore';

describe('scoreOf', () => {
  it('Persona A scores 99 and is flagged', () => {
    const r = scoreOf(featuresOf(PERSONAS.A));
    expect(Math.round(r.total)).toBe(99);
    expect(r.flag).toBe(true);
  });

  it('Persona A with night = 15 scores 73 and is still flagged', () => {
    const r = scoreOf({ ...featuresOf(PERSONAS.A), night: 15 });
    expect(Math.round(r.total)).toBe(73);
    expect(r.flag).toBe(true);
  });

  it.each(['B', 'C', 'D'] as const)('Persona %s is below 70', (id) => {
    const r = scoreOf(featuresOf(PERSONAS[id]));
    expect(r.total).toBeLessThan(70);
    expect(r.flag).toBe(false);
  });
});

describe('hoursOf', () => {
  it.each(['A', 'B', 'C', 'D'] as const)('night share matches persona %s night %', (id) => {
    const v = hourShares(PERSONAS[id]);
    const night = v.filter((_, h) => h >= 22 || h < 6).reduce((a, b) => a + b, 0);
    expect(night).toBeCloseTo(PERSONAS[id].night, 6);
    expect(v.reduce((a, b) => a + b, 0)).toBeCloseTo(100, 6);
  });
});

describe('store reset', () => {
  it('restores the initial state', () => {
    const s = useAppStore.getState();
    s.set({ screen: 'trap', persona: 'C', corrected: true, restricted: true, delReq: true, purged: true, trapStep: 4, vote: 'No', cPri: ['Privacy'], present: true });
    s.reset();
    const state = Object.fromEntries(Object.entries(useAppStore.getState()).filter(([, v]) => typeof v !== 'function'));
    expect(state).toEqual(initState());
  });
});
