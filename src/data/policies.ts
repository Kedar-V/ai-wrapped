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

export const NEG_WHO = ['Listener', 'Engineer', 'Advertiser', 'Executive', 'Auditor'] as const;
export type NegWho = (typeof NEG_WHO)[number];
export type PolicyId = 'A' | 'B' | 'C' | 'D';

export interface Policy {
  id: PolicyId;
  name: string;
  desc: string;
  sup: string[];
  neg: Record<NegWho, [string, string]>;
}

export const POLICIES: Policy[] = [
  {
    id: 'A', name: 'Policy A · Full profiling + maximum disclosure', desc: 'Continue profiling and disclose extensive explanations to everyone.', sup: ['Transparency'],
    neg: {
      Listener: ['Gets full explanations and keeps personalized recommendations.', 'Disclosure does not stop the targeting; knowing is not controlling.'],
      Engineer: ['The model keeps running and can be inspected.', 'Publishing the rule invites gaming and still does not make the inference valid.'],
      Advertiser: ['Maximum data and targeting flexibility.', 'Unverifiable psychological inputs create brand and legal risk.'],
      Executive: ['Highest engagement and ad revenue.', 'Highest complaint and regulatory exposure.'],
      Auditor: ['Everything is visible.', 'Visibility without authority to stop use is not oversight.'],
    },
  },
  {
    id: 'B', name: 'Policy B · Privacy-first personalization', desc: 'Allow music-preference recommendations; prohibit unsupported sensitive psychological targeting.', sup: ['Privacy', 'Data minimization', 'Validity', 'Autonomy'],
    neg: {
      Listener: ['Keeps useful recommendations without being profiled emotionally.', 'Less personalization on wellness-type content.'],
      Engineer: ['A cleaner, defensible objective.', 'Loses a feature the team spent months building.'],
      Advertiser: ['Stays out of a legal gray area.', 'Loses a high-CTR (estimated) segment.'],
      Executive: ['Lower complaint volume and regulatory risk.', 'Some ad revenue is forgone.'],
      Auditor: ['A clear, checkable boundary.', 'Needs ongoing verification that the ban holds.'],
    },
  },
  {
    id: 'C', name: 'Policy C · Opt-in psychological profiling', desc: 'Allow specified sensitive inferences only when valid, lawful, explicitly authorized, independently reviewed and revocable.', sup: ['Meaningful consent', 'Validity', 'Human oversight', 'Accountability', 'User correction rights', 'Autonomy'],
    neg: {
      Listener: ['Choice, plus real wellness features if wanted.', 'Consent screens are easy to click through without understanding.'],
      Engineer: ['A path to build a validated model with oversight.', 'Validation burden and review slow shipping.'],
      Advertiser: ['Higher-quality, consented audiences.', 'Smaller audiences; strict use limits.'],
      Executive: ['Keeps a differentiated product with defensible governance.', 'Costly review and revocation infrastructure.'],
      Auditor: ['Review and revocation create real leverage.', 'Needs authority and protected access to be real.'],
    },
  },
  {
    id: 'D', name: 'Policy D · Prohibit sensitive profiling', desc: 'Remove sensitive psychological inferences entirely.', sup: ['Privacy', 'Fairness', 'Data minimization', 'Validity'],
    neg: {
      Listener: ['No emotional profile exists to misuse.', 'Loses opt-in wellness features some would value.'],
      Engineer: ['Eliminates the hardest validity problem.', 'Removes an area of legitimate research and product value.'],
      Advertiser: ['Simple, safe rules.', 'Loses sensitive-interest targeting entirely.'],
      Executive: ['Lowest risk profile.', 'Biggest revenue sacrifice.'],
      Auditor: ['Easiest to audit: absence is checkable.', 'Needs checks that proxies do not recreate the same inference.'],
    },
  },
];

/** Illustrative sample cohort results. Never real classroom data. */
export const TRAPVOTES: [string, number][] = [['Yes', 8], ['No', 31], ['Only with safeguards', 44], ['Need more information', 17]];
export const FINALS: [string, number][] = [['Deploy', 6], ['Deploy with restrictions', 38], ['Redesign', 31], ['Do not deploy', 25]];
export const BEFORE: [string, number][] = [['Deploy', 54], ['Deploy with restrictions', 30], ['Redesign', 11], ['Do not deploy', 5]];
export const AFTER: [string, number][] = FINALS.map((f) => [f[0], f[1]]);
export const CLS_DIST: Record<string, number[]> = { Low: [78, 18, 4], Medium: [34, 46, 20], High: [8, 32, 60] };
export const CLS_NAMES = ['Acceptable', 'Questionable', 'Inappropriate'];
