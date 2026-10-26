import { featuresOf, PERSONAS } from '../data/personas';
import { useProfile } from '../hooks';
import { roundScore } from '../lib/scoring';
import { useAppStore } from '../store/useAppStore';

/** Shown when the selected persona is not flagged by the rule. */
export function FlagGate({ variant = 'gap' }: { variant?: 'gap' | 'card' }) {
  const { P, score, thr } = useProfile();
  const pickPersona = useAppStore((s) => s.pickPersona);
  const scoreA = roundScore(featuresOf(PERSONAS.A));
  const btn = <button className="btn sm pink" onClick={() => pickPersona('A')}>Switch to The Midnight Romantic</button>;
  if (variant === 'card') {
    return (
      <div className="card bad" role="status">
        <div className="h3">This walkthrough needs a flagged listener.</div>
        <div>{P.name} scores {score}, below the threshold of {thr}, so this persona is not flagged. The Explanation Trap is built around The Midnight Romantic (score {scoreA}).</div>
        <div style={{ alignSelf: 'flex-start' }}>{btn}</div>
      </div>
    );
  }
  return (
    <div className="gap d" role="status">
      {P.name} scores <b>{score}</b> on this rule, below the threshold of {thr}, so no vulnerability label is created (not flagged). The instructor example is The Midnight Romantic. {btn}
    </div>
  );
}
