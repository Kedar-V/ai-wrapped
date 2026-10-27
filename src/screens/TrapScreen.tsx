import { FlagGate } from '../components/FlagGate';
import { RevealController } from '../components/RevealController';
import { TRAP_TABS, trapPhase } from '../data/scripts';
import { useProfile } from '../hooks';
import { useAppStore } from '../store/useAppStore';

export function TrapScreen() {
  const { flagged } = useProfile();
  const trapStep = useAppStore((s) => s.trapStep);
  const trapAsk = useAppStore((s) => s.trapAsk);
  const tab = TRAP_TABS[trapPhase(trapStep, trapAsk)];
  return (
    <section className="main">
      <div className="eyebrow" style={{ color: '#FF9DC6' }}>Act IV · The Explanation Trap · 5 min · {tab.q.map((n) => 'Q' + n).join(' · ')}</div>
      {!flagged && <FlagGate variant="card" />}
      {flagged && (
        <>
          <h2 className="disp h2">Everything was disclosed. Something is still wrong.</h2>
          <p className="lead">Reveal in pairs. After each pair, use <b>Reveal discussion question</b> for a full-screen pause before continuing.</p>
          <RevealController />
        </>
      )}
    </section>
  );
}
