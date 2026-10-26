import { FlagGate } from '../components/FlagGate';
import { RevealController } from '../components/RevealController';
import { useProfile } from '../hooks';

export function TrapScreen() {
  const { flagged } = useProfile();
  return (
    <section className="main">
      <div className="eyebrow" style={{ color: '#FF9DC6' }}>Act IV · The Explanation Trap · 5 min · Q3 · Q6</div>
      {!flagged && <FlagGate variant="card" />}
      {flagged && (
        <>
          <h2 className="disp h2">Everything was disclosed. Something is still wrong.</h2>
          <RevealController />
        </>
      )}
    </section>
  );
}
