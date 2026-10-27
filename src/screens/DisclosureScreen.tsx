import { DisclosureSimulator } from '../components/DisclosureSimulator';

export function DisclosureScreen() {
  return (
    <section className="main">
      <div className="eyebrow" style={{ color: '#FF9DC6' }}>Act IV · Disclosure simulator · Q3 · Q4</div>
      <h2 className="disp h2">Transparency is not the same as publishing everything.</h2>
      <DisclosureSimulator />
    </section>
  );
}
