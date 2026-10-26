export type RecipientKey = 'pub' | 'lis' | 'adv' | 'stf' | 'adt';
export type ItemKey = 'raw' | 'inf' | 'rule' | 'seg' | 'agg' | 'aud' | 'cor' | 'del';
export type Grid = Record<RecipientKey, ItemKey[]>;

export const ITEMS: { k: ItemKey; n: string; w: number[] }[] = [
  { k: 'raw', n: 'Raw listening history', w: [3, 1, 0, 2, 1, 1] },
  { k: 'inf', n: 'Personal inferences', w: [2, 0, 0, 1, 2, 3] },
  { k: 'rule', n: 'Technical decision rules', w: [0, 3, 3, 2, 3, 1] },
  { k: 'seg', n: 'Audience-segment definitions', w: [1, 2, 1, 1, 2, 1] },
  { k: 'agg', n: 'Aggregate validation metrics', w: [0, 1, 1, 0, 3, 1] },
  { k: 'aud', n: 'Audit records', w: [1, 1, 0, 1, 3, 0] },
  { k: 'cor', n: 'Individual correction rights', w: [0, 0, 0, 1, 2, 2] },
  { k: 'del', n: 'Downstream deletion authority', w: [-2, 0, 0, 1, 3, 0] },
];

export const RECS: { k: RecipientKey; label: string; kind: string; m: number[] }[] = [
  { k: 'pub', label: 'Public', kind: 'Public disclosure', m: [3, 3, 3, 3, 1.2, 0.5] },
  { k: 'lis', label: 'Listener', kind: 'Individual access', m: [0.3, 0.5, 0.5, 0.5, 1.5, 2] },
  { k: 'adv', label: 'Advertiser', kind: 'Commercial partner', m: [2, 1, 2, 1.5, 0.3, 0.3] },
  { k: 'stf', label: 'Staff', kind: 'Role-restricted access', m: [1, 0.5, 0.5, 1, 1, 1.2] },
  { k: 'adt', label: 'Auditor', kind: 'Independent oversight', m: [0.5, 0.5, 0.2, 0.5, 2.5, 1] },
];

export const DIMS = [
  { n: 'Privacy exposure', risk: true },
  { n: 'Proprietary exposure', risk: true },
  { n: 'Model-gaming risk', risk: true },
  { n: 'Security risk', risk: true },
  { n: 'Accountability gained', risk: false },
  { n: 'Meaningful user understanding', risk: false },
];

const ALL = ITEMS.map((i) => i.k);

export type PresetId = 'current' | 'public' | 'lock' | 'balanced';

export const DPRE: Record<PresetId, Grid> = {
  current: { pub: [], lis: ['inf', 'cor'], adv: ['seg'], stf: ['raw', 'inf', 'rule', 'agg', 'del'], adt: ['agg'] },
  public: { pub: ALL, lis: ALL, adv: ALL, stf: ALL, adt: ALL },
  lock: { pub: [], lis: [], adv: [], stf: ['raw', 'inf', 'rule', 'agg', 'aud', 'cor', 'del'], adt: [] },
  balanced: { pub: ['agg'], lis: ['inf', 'cor', 'del'], adv: ['seg'], stf: ['inf', 'rule', 'agg', 'cor', 'del'], adt: ['inf', 'rule', 'agg', 'aud'] },
};

export const DPRESET_LABELS: [PresetId, string][] = [
  ['current', 'Current'],
  ['public', 'Maximum public'],
  ['lock', 'Lock everything down'],
  ['balanced', 'Balanced (suggested)'],
];

export const cloneGrid = (g: Grid): Grid => ({ pub: [...g.pub], lis: [...g.lis], adv: [...g.adv], stf: [...g.stf], adt: [...g.adt] });
