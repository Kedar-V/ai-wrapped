export type Cell = 'A' | 'R' | 'X' | 'U';

export const MXN = [
  'Individual listening history',
  'Inferred personal characteristics',
  'Plain-language explanation',
  'Feature contributions',
  'Full model rules',
  'Data provenance',
  'Campaign targeting criteria',
  'Aggregate performance',
  'Governance and audit records',
  'Correction authority',
  'Deployment authority',
];

const parse = (rows: string[]): Cell[][] => rows.map((r) => r.split('') as Cell[]);

/** Columns: Listener, Engineer, Executive, Auditor */
export const MXC: Cell[][] = parse(['AAUX', 'AARX', 'RAUA', 'UAUX', 'UARX', 'UARX', 'URAX', 'URRX', 'UURX', 'RURU', 'URUU']);
export const MXP: Cell[][] = parse(['ARUX', 'ARRX', 'AARA', 'RARA', 'UARX', 'RARA', 'RRAA', 'UARA', 'RRAA', 'ARAR', 'UURR']);

export const MXS: Record<Cell, { l: string; c: string }> = {
  A: { l: 'Available', c: 'ca' },
  R: { l: 'Restricted', c: 'cr' },
  X: { l: 'Needs auth', c: 'cx' },
  U: { l: 'Unavailable', c: 'cu' },
};
export const CYCLE: Cell[] = ['A', 'R', 'X', 'U'];

export const ASYM = [
  {
    layer: '1 · What each sees by default',
    cells: [
      'A personality label card',
      'The inference rule and its inputs',
      'Commercial performance dashboards',
      'Data-use and governance record (on request)',
    ],
  },
  {
    layer: '2 · Exists but is not disclosed to them',
    cells: [
      'The rule, the weights, the segment export, the buyer',
      'What happens to users after the segment leaves the platform',
      'Individual inferences and their explanations',
      'Live model internals and raw histories without authorization',
    ],
  },
  {
    layer: '3 · Understandable to the recipient',
    cells: [
      'Reads the label easily; cannot evaluate the claim',
      'Fully understands the mechanism; limited view of consequences',
      'Understands revenue; weak on how the inference is produced',
      'Understands the record; needs engineering help for the rule',
    ],
  },
  {
    layer: '4 · Authority to change the system',
    cells: [
      'Edit own label only',
      'Change model with review',
      'Approve deployment and strategy',
      'Recommend only; cannot block',
    ],
  },
];
