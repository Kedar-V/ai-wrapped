export type StakeholderId = 'listener' | 'engineer' | 'advertiser' | 'executive' | 'auditor';

export const STK: { id: StakeholderId; label: string; col: string; role: string; head: string; need: string }[] = [
  { id: 'listener', label: 'Listener', col: '#1DF08A', role: 'Stakeholder A · affected person', head: 'What Does AI Think It Knows About Me?', need: 'to know what was concluded, why, and how to contest it, not the formula.' },
  { id: 'engineer', label: 'ML Engineer', col: '#A78BFA', role: 'Stakeholder B · builds the model', head: 'Is the Profiling Model Actually Working?', need: 'the mechanism, in enough detail to debug and test it.' },
  { id: 'advertiser', label: 'Advertiser', col: '#FF8A1F', role: 'Stakeholder C · buys the audience', head: 'Find Your Ideal Audience', need: 'only what is permissible to target, plus honest evidence of performance.' },
  { id: 'executive', label: 'Executive', col: '#FF4FA3', role: 'Stakeholder D · approves deployment', head: 'Personalization Performance', need: 'risk and accountability alongside revenue, so decisions are made with understanding.' },
  { id: 'auditor', label: 'Auditor', col: '#22D3EE', role: 'Stakeholder E · independent oversight', head: 'What Is the Platform Not Telling Us?', need: 'evidence, provenance and authority to compare the platform’s claims with reality.' },
];

export const FORMATS = [
  { f: '1 · Simple statement', rev: 'The label itself', hide: 'Why, data, rule', who: 'Listener (glance), Executive', act: 'None', fit: [2, 0, 1, 2, 0] },
  { f: '2 · Plain-language rationale', rev: 'The behavior associated with the label', hide: 'Weights, threshold, validity', who: 'Listener, Executive, Auditor (first pass)', act: 'Low: can dispute, cannot test', fit: [3, 1, 1, 2, 1] },
  { f: '3 · Evidence & data lineage', rev: 'Actual values and where they came from', hide: 'How they are combined', who: 'Listener, Auditor', act: 'Medium: fix data errors', fit: [3, 2, 0, 1, 3] },
  { f: '4 · Feature attribution', rev: 'Contribution of each feature to the score', hide: 'Whether those features should count', who: 'Engineer, Auditor', act: 'Medium: tune or challenge', fit: [1, 3, 0, 1, 2] },
  { f: '5 · Exact model rules', rev: 'The complete logic', hide: 'Whether the inference is valid or appropriate', who: 'Engineer, Auditor', act: 'High for professionals, low for lay readers', fit: [0, 3, 0, 1, 3] },
  { f: '6 · Governance & accountability record', rev: 'Purpose, approvals, recipients, limitations, corrections', hide: 'Individual evidence unless linked', who: 'Auditor, Executive, Listener (summary)', act: 'High: enables oversight', fit: [2, 1, 0, 3, 3] },
];

export const FIT_LABELS = ['Poor fit', 'Partial fit', 'Good fit', 'Best fit'];

export const CAMP = [
  { id: 'headphones', label: 'Pulse Buds headphones', base: 2.4, ctr: [0.9, 1.2, 1.5, 1.6] },
  { id: 'concert', label: 'Encore Live concert tickets', base: 1.9, ctr: [1.0, 1.4, 1.9, 2.1] },
  { id: 'wellness', label: 'Calm Harbor wellness subscription', base: 1.6, ctr: [0.8, 1.1, 1.6, 3.4] },
  { id: 'study', label: 'FocusLoop study subscription', base: 1.1, ctr: [0.7, 1.0, 1.4, 1.3] },
];

export type Tone = 'g' | 'd' | 'p';

export const STR: { id: string; label: string; m: number; ev: string; cls: Tone }[] = [
  { id: 'contextual', label: 'Contextual', m: 1, ev: 'Observed aggregate benchmark', cls: 'g' },
  { id: 'interest', label: 'Interest-based', m: 0.72, ev: 'Observed clicks on declared interests', cls: 'g' },
  { id: 'behavioral', label: 'Behavioral', m: 0.5, ev: 'Modeled from listening behavior; not independently verified', cls: 'd' },
  { id: 'sensitive', label: 'Sensitive psychological', m: 0.22, ev: 'Vendor estimate with no holdout test and no way for users to verify the inference. Hypothetical.', cls: 'p' },
];

export const EX: Record<string, { label: string; eng: number; ret: number; rev: number; cmp: number; cor: number; risk: 'High' | 'Medium' | 'Low'; gov: string; gc: Tone }> = {
  engagement: { label: 'Engagement-first', eng: 12, ret: 86.4, rev: 18.2, cmp: 1840, cor: 310, risk: 'High', gov: 'Escalated: no validity evidence; segment exported without clear disclosure.', gc: 'p' },
  satisfaction: { label: 'User satisfaction-first', eng: 5, ret: 88.1, rev: 2.1, cmp: 920, cor: 410, risk: 'Medium', gov: 'Under review: complaint trend flagged.', gc: 'd' },
  privacy: { label: 'Privacy-first', eng: -3, ret: 88.9, rev: -6.4, cmp: 410, cor: 520, risk: 'Low', gov: 'Compliant with review: sensitive targeting disabled.', gc: 'g' },
  control: { label: 'User-controlled personalization', eng: 2, ret: 90.2, rev: -1.8, cmp: 260, cor: 640, risk: 'Low', gov: 'Compliant: opt-in consent records required and audited.', gc: 'g' },
};

export const FINDS: [string, string][] = [
  ['Inference validity', 'The link from listening pattern to emotional vulnerability is unvalidated.'],
  ['Notice and consent', 'The listener was not clearly told the inference would feed wellness advertising.'],
  ['Downstream deletion gap', 'Correcting the label does not remove an exported segment.'],
  ['Data minimization', 'Is an emotional-state inference necessary for music recommendations?'],
];
export const COPTS: [string, string][] = [['ok', 'Acceptable'], ['mit', 'Needs mitigation'], ['inv', 'Invalid inference'], ['pro', 'Prohibited use']];

export const AD_SEGS = [
  { name: 'Evening Reflective · Wellness', size: '412,000', desc: 'Users with frequent late-night, low-energy listening. Individual histories and the rule are hidden from you.' },
  { name: 'Night Listening & Audio Gear', size: '1.1M', desc: 'Heavy after-10pm listeners.' },
  { name: 'Live Events', size: '0.9M', desc: 'Weekend high-energy listeners.' },
  { name: 'Study & Focus', size: '0.8M', desc: 'Workday instrumental listeners.' },
];
export const AD_BLOCKED = ['Raw listening histories', 'Individual user identities', 'The decision rule and weights', 'Evidence that the wellness inference is valid'];
