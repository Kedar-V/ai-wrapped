export const PRINCIPLES: [string, string][] = [
  ['Privacy', 'Keep personal data from unnecessary exposure.'],
  ['Autonomy', 'People control how they are profiled and treated.'],
  ['Fairness', 'Avoid unjustified differences in treatment.'],
  ['Transparency', 'Disclose how the system and its data work.'],
  ['Validity', 'Inferences must be justified by evidence.'],
  ['Accountability', 'Someone can answer for, and stop, the system.'],
  ['Meaningful consent', 'Informed, specific, revocable permission.'],
  ['Human oversight', 'People review consequential automated decisions.'],
  ['User correction rights', 'Individuals can fix and contest conclusions.'],
  ['Data minimization', 'Collect and infer only what is needed.'],
];

/** Core demo stakeholders. */
export const NEG_WHO = ['Listener', 'Engineer', 'Executive', 'Auditor'] as const;
export type NegWho = (typeof NEG_WHO)[number];
export type PolicyId = 'A' | 'B' | 'C' | 'D';
export type LeanCode = 'H' | 'T' | 'X';

export interface Policy {
  id: PolicyId;
  name: string;
  short: string;
  desc: string;
  /** Three principles this policy is rooted in. */
  sup: string[];
  /** One-line why for each rooted principle (same order as sup). */
  why: string[];
  neg: Record<NegWho, [string, string]>;
}

export const POLICIES: Policy[] = [
  {
    id: 'A',
    name: 'Policy A · Full profiling + maximum disclosure',
    short: 'A · Full profiling + disclosure',
    desc: 'Continue profiling and disclose extensive explanations to everyone.',
    sup: ['Transparency', 'Autonomy', 'Accountability'],
    why: [
      'Disclose everything about the model and how it is used.',
      'Informed people can decide for themselves.',
      'Open scrutiny lets outsiders hold the platform to account.',
    ],
    neg: {
      Listener: ['Gets full explanations and keeps personalized recommendations.', 'Still profiled and targeted; knowing is not controlling.'],
      Engineer: ['The model keeps running and can be inspected.', 'Publishing the rule invites gaming; validity stays unproven.'],
      Executive: ['Highest engagement and ad revenue.', 'Complaint and regulatory exposure rise, but this is the smallest cost of any policy for them.'],
      Auditor: ['Everything is visible.', 'Visibility without authority to stop use is not oversight.'],
    },
  },
  {
    id: 'B',
    name: 'Policy B · Privacy-first personalization',
    short: 'B · Privacy-first',
    desc: 'Allow music-preference recommendations; prohibit unsupported sensitive psychological targeting.',
    sup: ['Privacy', 'Data minimization', 'Validity'],
    why: [
      'Keep emotional inference out of ad targeting.',
      'Infer only what music recommendations actually need.',
      'Drop inferences nobody has shown to be true.',
    ],
    neg: {
      Listener: ['Music recommendations continue.', 'The system learns less about you, and wellness-style content gets less personal.'],
      Engineer: ['A cleaner, defensible objective.', 'Loses a feature the team spent months building.'],
      Executive: ['Lower complaint and regulatory risk.', 'Ad revenue is forgone.'],
      Auditor: ['A clear, checkable boundary.', 'Needs ongoing checks that the ban holds.'],
    },
  },
  {
    id: 'C',
    name: 'Policy C · Opt-in psychological profiling',
    short: 'C · Opt-in profiling',
    desc: 'Allow specified sensitive inferences only when valid, lawful, explicitly authorized, independently reviewed and revocable.',
    sup: ['Meaningful consent', 'Human oversight', 'Validity'],
    why: [
      'Sensitive inference only with explicit, revocable permission.',
      'Independent review before and after any use.',
      'Allowed only where evidence supports the inference.',
    ],
    neg: {
      Listener: ['Choice, plus wellness features if wanted.', 'Consent screens are easy to click through, so protection is thin.'],
      Engineer: ['A path to build a validated model with oversight.', 'Review slows shipping, but the work stays legitimate.'],
      Executive: ['A differentiated product with defensible governance.', 'Costly review and revocation infrastructure.'],
      Auditor: ['Review and revocation could give leverage.', 'Per-person consent is hard to audit without authority and protected access.'],
    },
  },
  {
    id: 'D',
    name: 'Policy D · Prohibit sensitive profiling',
    short: 'D · Prohibit sensitive profiling',
    desc: 'Remove sensitive psychological inferences entirely.',
    sup: ['Privacy', 'Fairness', 'Autonomy'],
    why: [
      'Sensitive psychological data is never created.',
      'No one is treated differently on an emotional label they cannot verify.',
      'No ads aimed at emotional states people cannot check.',
    ],
    neg: {
      Listener: ['No emotional profile exists to misuse.', 'Loses opt-in wellness features some would value.'],
      Engineer: ['Eliminates the hardest validity problem.', 'Removes legitimate research and product value.'],
      Executive: ['Lowest risk profile.', 'Biggest revenue sacrifice.'],
      Auditor: ['Absence is easy to check.', 'Must check that proxies do not recreate the inference.'],
    },
  },
];

/** Per-policy lean for each stakeholder: H helps, T trade-off, X hurts. */
export const NEG_LEAN: Record<PolicyId, Record<NegWho, LeanCode>> = {
  A: { Listener: 'X', Engineer: 'T', Executive: 'H', Auditor: 'X' },
  B: { Listener: 'T', Engineer: 'X', Executive: 'X', Auditor: 'H' },
  C: { Listener: 'X', Engineer: 'H', Executive: 'T', Auditor: 'X' },
  D: { Listener: 'H', Engineer: 'X', Executive: 'X', Auditor: 'T' },
};

/** Short cell captions on the negotiation grid. */
export const NEG_WHY: Record<PolicyId, Record<NegWho, string>> = {
  A: { Listener: 'Still targeted', Engineer: 'Gameable, unproven', Executive: 'Most revenue', Auditor: 'Sees, cannot stop' },
  B: { Listener: 'System knows you less', Engineer: 'Feature lost', Executive: 'Revenue forgone', Auditor: 'Clear boundary' },
  C: { Listener: 'Consent is thin', Engineer: 'Path to build', Executive: 'Costly governance', Auditor: 'Hard to audit' },
  D: { Listener: 'No emotional profile', Engineer: 'Research removed', Executive: 'Biggest revenue hit', Auditor: 'Proxy checks needed' },
};

export function leanMeta(code: LeanCode) {
  if (code === 'H') return { k: 'gain' as const, label: '▲ Helps', tag: 't-low' };
  if (code === 'T') return { k: 'mixed' as const, label: '◆ Trade-off', tag: 't-med' };
  return { k: 'cost' as const, label: '▼ Hurts', tag: 't-high' };
}

export function bestFor(pid: PolicyId): NegWho {
  return NEG_WHO.find((w) => NEG_LEAN[pid][w] === 'H')!;
}

export function leanTally(pid: PolicyId) {
  const c = { H: 0, T: 0, X: 0 };
  for (const w of NEG_WHO) c[NEG_LEAN[pid][w]]++;
  return c;
}

/** Illustrative sample cohort results. Never real classroom data. */
export const TRAPVOTES: [string, number][] = [['Yes', 8], ['No', 31], ['Only with safeguards', 44], ['Need more information', 17]];
export const FINALS: [string, number][] = [['Deploy', 6], ['Deploy with restrictions', 38], ['Redesign', 31], ['Do not deploy', 25]];
export const BEFORE: [string, number][] = [['Deploy', 54], ['Deploy with restrictions', 30], ['Redesign', 11], ['Do not deploy', 5]];
export const AFTER: [string, number][] = FINALS.map((f) => [f[0], f[1]]);
export const CLS_DIST: Record<string, number[]> = { Low: [78, 18, 4], Medium: [34, 46, 20], High: [8, 32, 60] };
export const CLS_NAMES = ['Acceptable', 'Questionable', 'Inappropriate'];
