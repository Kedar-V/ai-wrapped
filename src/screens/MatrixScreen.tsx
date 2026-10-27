import { AccessMatrix, matrixGaps } from '../components/AccessMatrix';
import { ASYM, MXC, MXP } from '../data/matrix';
import { STK } from '../data/stakeholders';
import { useAppStore } from '../store/useAppStore';

export function MatrixScreen() {
  const { mView, mProp, asym, set } = useAppStore();
  const M = mView === 'current' ? MXC : (mProp ?? MXP);
  const gaps = matrixGaps(M);
  const label = asym >= 4 ? 'All layers shown' : asym === 0 ? 'Start: what each sees' : 'Reveal next layer';
  return (
    <section className="main">
      <div className="eyebrow">Act III · Cross-stakeholder view · Q1 · Q3</div>
      <h2 className="disp h2">One Profile. Four Stakeholders. Different Explanations.</h2>

      <div className="card pop">
        <div className="h3">Information asymmetry reveal</div>
        <div className="row">
          <button className="btn pri sm" onClick={() => set({ asym: Math.min(4, asym + 1) })} disabled={asym >= 4}>{label}</button>
          <button className="btn ghost sm" onClick={() => set({ asym: 4 })}>Reveal all</button>
          <button className="btn ghost sm" onClick={() => set({ asym: 0 })}>Hide</button>
          <span className="small muted">Layer {asym} of 4</span>
        </div>
        <div className="scroll" aria-live="polite">
          <table className="tbl">
            <thead><tr><th>Layer</th>{STK.map((x) => <th key={x.id}>{x.label}</th>)}</tr></thead>
            <tbody>
              {ASYM.map((r, i) => asym > i && (
                <tr key={r.layer}><td><b>{r.layer}</b></td>{r.cells.map((c) => <td key={c}>{c}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="small muted">Information that exists ≠ disclosed ≠ understandable ≠ authority to change the system.</div>
      </div>

      <AccessMatrix />

      <div className="card">
        <div className="h3">Where power and understanding come apart</div>
        <div className="g2" style={{ gap: 12 }}>
          {gaps.map((g) => (
            <div key={g.who} className={g.cls}>
              <b>{g.who}</b>
              <div>{g.t}</div>
            </div>
          ))}
        </div>
        <div className="small muted">Red: open gap · Orange: partly closed · Green: closed. Switch to the proposed access to see which gaps close.</div>
      </div>
    </section>
  );
}
