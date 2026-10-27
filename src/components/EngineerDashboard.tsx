import { FE, FL, TH } from '../data/model';
import { useProfile } from '../hooks';
import { scoreOf } from '../lib/scoring';
import { useAppStore } from '../store/useAppStore';

const CHECKS = [
  { name: 'Implementation correctness', status: 'Verified', cls: 'g', note: 'Code computes exactly the written rule; unit tests pass.' },
  { name: 'Explanation faithfulness', status: 'Verified', cls: 'g', note: 'The explanation shown is the computation that ran.' },
  { name: 'Empirical validity', status: 'Not established', cls: 'p', note: 'No labeled ground truth; weights and threshold are unvalidated guesses.' },
  { name: 'Ethical acceptability', status: 'Unresolved', cls: 'd', note: 'Correct code can implement an unjustified inference.' },
];

export function EngineerDashboard() {
  const { P, F, score } = useProfile();
  const eng = useAppStore((s) => s.eng);
  const set = useAppStore((s) => s.set);
  const eV = { ...F, ...(eng ?? {}) };
  const EB = scoreOf(eV);
  const eScore = Math.round(EB.total);
  const delta = eScore === score ? `Same as baseline (${score}).` : `Baseline ${score}, now ${eScore} (${eScore > score ? '+' : ''}${eScore - score}).`;
  return (
    <div className="g2">
      <div className="card pop">
        <div className="h3">Sensitivity testing · change a feature, watch the prediction</div>
        {FE.map((f) => (
          <div key={f}>
            <label htmlFor={'eng-' + f} className="row" style={{ justifyContent: 'space-between' }}><span>{FL[f]}</span><span className="mono">{eV[f]}%</span></label>
            <input id={'eng-' + f} type="range" min={0} max={100} value={eV[f]} onChange={(e) => set({ eng: { ...eV, [f]: Number(e.target.value) } })} />
          </div>
        ))}
        <button className="btn ghost sm" style={{ alignSelf: 'flex-start' }} onClick={() => set({ eng: null })}>Reset to {P.name}</button>
        <div className="row" aria-live="polite">
          <span className="stat" style={{ color: EB.flag ? '#FF8A1F' : '#1DF08A' }}>{eScore}</span>
          <span>score · threshold {TH} · <b>{EB.flag ? 'label applied' : 'no label'}</b><br /><span className="small muted">{delta}</span></span>
        </div>
        {EB.c.map((c) => (
          <div key={c.k}>
            <div className="row small" style={{ justifyContent: 'space-between' }}><span>{FL[c.k]}</span><span className="mono">{(Math.round(c.pts * 10) / 10).toFixed(1)} pts</span></div>
            <div className="bar"><i className="b-o" style={{ width: Math.round((c.pts / 35) * 100) + '%' }} /></div>
          </div>
        ))}
        <pre className="code" style={{ margin: 0 }}>{'score = 100 x (0.35n + 0.30l + 0.20r + 0.15p)\nflag if score >= 70'}</pre>
        <div className="small muted">Sandbox only: the live model and every other view are unchanged.</div>
      </div>
      <div className="card">
        <div className="h3">Four checks</div>
        {CHECKS.map((c) => <div key={c.name} className={'gap ' + c.cls}><b>{c.name}:</b> {c.status}<div className="small">{c.note}</div></div>)}
        <div className="small muted">Diagnostics: unit tests 14/14 pass · calibration against labeled ground truth: <b>not available</b></div>
      </div>
    </div>
  );
}
