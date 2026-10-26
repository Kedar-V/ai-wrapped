import { AccessMatrix, matrixGaps } from '../components/AccessMatrix';
import { DataLineageGraph } from '../components/DataLineageGraph';
import { ASYM, MXC, MXP, MXS } from '../data/matrix';
import { STK } from '../data/stakeholders';
import { useAppStore } from '../store/useAppStore';

export function MatrixScreen() {
  const { mView, mProp, asym, set } = useAppStore();
  const M = mView === 'current' ? MXC : (mProp ?? MXP);
  const gaps = matrixGaps(M);
  const corrA = M[9][0] === 'A';
  const nodes = [
    { t: 'Listener', cls: 'ok' as const }, { t: 'Listening history', cls: 'ok' as const }, { t: 'Rule v0.3', cls: 'ok' as const }, { t: 'Profile label', cls: 'ok' as const },
    { t: 'Segment export', cls: corrA ? ('ok' as const) : ('weak' as const) }, { t: 'Advertiser', cls: corrA ? ('ok' as const) : ('weak' as const) },
  ];
  const label = asym >= 4 ? 'All layers shown' : asym === 0 ? 'Start: what each sees' : 'Reveal next layer';
  return (
    <section className="main">
      <div className="eyebrow">Act III · Cross-stakeholder view · Q1 · Q3</div>
      <h2 className="disp h2">One Profile. Five Stakeholders. Different Explanations.</h2>

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

      <div className="g2">
        <div className="card">
          <div className="h3">Where power and understanding come apart</div>
          {gaps.map((g) => <div key={g.t} className={g.cls}>{g.t}</div>)}
        </div>
        <div className="card">
          <div className="h3">Information flow ({mView === 'current' ? 'current' : 'proposed'})</div>
          <DataLineageGraph nodes={nodes} label="Information flow from listener to advertiser" />
          <div className={'gap ' + (corrA ? 'g' : 'p')}><b>Listener dispute reaches:</b> {corrA ? 'Label → segment → partner copies (full recourse path)' : 'Label only. Segment and partner copies are out of reach'}</div>
          <div className="small"><b>ML Engineer</b> reads the rule and features ({MXS[M[4][1]].l}).</div>
          <div className="small"><b>Executive</b> approves deployment ({MXS[M[10][3]].l}) with {MXS[M[4][3]].l} access to rules.</div>
          <div className="small"><b>Auditor</b> reaches governance records ({MXS[M[8][4]].l}); correction authority {MXS[M[9][4]].l}.</div>
        </div>
      </div>
    </section>
  );
}
