export type Cell = 'A' | 'R' | 'X' | 'U';

export const MXN = ['Individual listening history', 'Inferred personal characteristics', 'Plain-language explanation', 'Feature contributions', 'Full model rules', 'Data provenance', 'Advertiser targeting criteria', 'Aggregate performance', 'Governance and audit records', 'Correction authority', 'Deployment authority'];

const parse = (rows: string[]): Cell[][] => rows.map((r) => r.split('') as Cell[]);

export const MXC: Cell[][] = parse(['AAUUX', 'AARRX', 'RAUUA', 'UAUUX', 'UAURX', 'UAURX', 'URAAX', 'URRAX', 'URURX', 'RUURU', 'URUAU']);
export const MXP: Cell[][] = parse(['ARUUX', 'ARURX', 'AARAA', 'RAURA', 'UAURX', 'RAURA', 'RRAAA', 'UARAA', 'RRUAA', 'ARUAR', 'URURR']);

export const MXS: Record<Cell, { l: string; c: string }> = {
  A: { l: 'Available', c: 'ca' },
  R: { l: 'Restricted', c: 'cr' },
  X: { l: 'Needs auth', c: 'cx' },
  U: { l: 'Unavailable', c: 'cu' },
};
export const CYCLE: Cell[] = ['A', 'R', 'X', 'U'];

export const ASYM = [
  { layer: '1 · What each sees by default', cells: ['A personality label card', 'The inference rule and its inputs', 'An audience segment: name and size', 'Commercial performance dashboards', 'Data-use and governance record (on request)'] },
  { layer: '2 · Exists but is not disclosed to them', cells: ['The rule, the weights, the segment export, the buyer', 'What happens to users after the segment leaves the platform', 'Why any individual is in the segment; any validity evidence', 'Individual inferences and their explanations', 'Live model internals and raw histories without authorization'] },
  { layer: '3 · Understandable to the recipient', cells: ['Reads the label easily; cannot evaluate the claim', 'Fully understands the mechanism; limited view of consequences', 'Understands reach and CTR; cannot judge the inference', 'Understands revenue; weak on how the inference is produced', 'Understands the record; needs engineering help for the rule'] },
  { layer: '4 · Authority to change the system', cells: ['Edit own label only', 'Change model with review', 'Choose targeting, not the data', 'Approve deployment and strategy', 'Recommend only; cannot block'] },
];
