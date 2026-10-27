import { DisclosureSimulator } from '../components/DisclosureSimulator';
import { SCR } from '../data/scripts';

export function DisclosureScreen() {
  const entry = SCR.disclosure;
  return (
    <section className="main">
      <div className="eyebrow" style={{ color: '#FF9DC6' }}>Act IV · Disclosure simulator · Q3 · Q4</div>
      <div className="card" style={{ borderColor: 'rgba(255,157,198,.35)' }}>
        <div className="eyebrow" style={{ color: '#FF9DC6' }}>Entry · Q4</div>
        <p className="lead" style={{ margin: 0 }}>{entry.prompt}</p>
      </div>
      <h2 className="disp h2">Transparency is not the same as publishing everything.</h2>
      <DisclosureSimulator />
    </section>
  );
}
