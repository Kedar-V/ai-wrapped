export type Cell = 'A' | 'R' | 'X' | 'U';

export const MXN = [
  'Individual listening history',
  'Inferred personal characteristics',
  'Plain-language explanation',
  'Feature contributions',
  'Full model rules',
  'Data provenance',
  'Ad-targeting criteria',
  'Business performance',
  'Governance and audit records',
  'Correction authority',
  'Deployment authority',
];

const parse = (rows: string[]): Cell[][] => rows.map((r) => r.split('') as Cell[]);

/** Columns: Listener, Engineer, Executive, Auditor */
export const MXC: Cell[][] = parse(['ARUX', 'RARX', 'RAAA', 'UAUX', 'UARX', 'UARX', 'RRAX', 'URAX', 'URAX', 'RRAU', 'URAU']);
export const MXP: Cell[][] = parse(['ARUR', 'AARA', 'AAAA', 'RARA', 'UARA', 'RAAA', 'ARAA', 'UAAA', 'RRAA', 'ARAR', 'URAR']);

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
      'Their own listening history and a fun personality card; sensitive inferences are mostly hidden',
      'Pseudonymized listening data, the rule and its inputs',
      'Business performance dashboards and governance reports',
      'Only what the platform hands over once an audit is authorized',
    ],
  },
  {
    layer: '2 · Exists but is not disclosed to them',
    cells: [
      'The sensitive label, the rule, the weights, the segment export and the buyer',
      'How the segment is used and what it earns once it leaves the platform',
      'Individual inferences, feature contributions and the full rule',
      'Live model internals and raw histories outside the agreed audit scope',
    ],
  },
  {
    layer: '3 · Understandable to the recipient',
    cells: [
      'Would read the label easily, but cannot evaluate the claim',
      'Fully understands the mechanism; limited view of consequences',
      'Understands revenue and risk reports; weak on how the inference is produced',
      'Understands the records; needs engineering help to read the rule',
    ],
  },
  {
    layer: '4 · Authority to change the system',
    cells: [
      'Dispute own label; request access or deletion',
      'Change the model through review',
      'Approve deployment; order corrections and purges',
      'Recommend only; cannot block',
    ],
  },
];
