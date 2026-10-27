import { FlagGate } from '../components/FlagGate';
import { RevealController } from '../components/RevealController';
import { TRAP_TABS } from '../data/scripts';
import { useProfile } from '../hooks';
import { useAppStore } from '../store/useAppStore';

export function TrapScreen() {
  const { flagged } = useProfile();
  const trapStep = useAppStore((s) => s.trapStep);
  const phase = trapStep <= 2 ? 'early' : trapStep <= 4 ? 'mid' : 'late';
  const tab = TRAP_TABS[phase];
  return (
    <section className="main">
      <div className="eyebrow" style={{ color: '#FF9DC6' }}>Act IV · The Explanation Trap · 5 min · {tab.q.map((n) => 'Q' + n).join(' · ')}</div>
      {!flagged && <FlagGate variant="card" />}
      {flagged && (
        <>
          <h2 className="disp h2">Everything was disclosed. Something is still wrong.</h2>
          <div className="card" style={{ borderColor: 'rgba(255,157,198,.35)' }}>
            <div className="eyebrow" style={{ color: '#FF9DC6' }}>Entry · {tab.tab}</div>
            <p className="lead" style={{ margin: 0 }}>{tab.prompt}</p>
          </div>
          <RevealController />
        </>
      )}
    </section>
  );
}
