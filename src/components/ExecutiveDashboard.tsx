import { EX } from '../data/stakeholders';
import { useProfile } from '../hooks';
import { useAppStore } from '../store/useAppStore';

export function ExecutiveDashboard() {
  const { flagged } = useProfile();
  const { exStrat, exPurged, set } = useAppStore();
  const ex = EX[exStrat];
  const open = !flagged
    ? ['No open items for this listener.']
    : exPurged
      ? ['Request resolved: the exported segment was purged.']
      : ['1 pending request: a listener in “Evening Reflective · Wellness” disputed their label and asked to be removed from advertising systems.'];
  const tiles = [
    { l: 'Engagement', v: (ex.eng > 0 ? '+' : '') + ex.eng + '%', sub: 'vs baseline', col: '#1DF08A' },
    { l: 'Retention', v: ex.ret + '%', sub: '12-month', col: '#1DF08A' },
    { l: 'Ad revenue', v: (ex.rev > 0 ? '+' : '') + '$' + ex.rev + 'M', sub: 'annualized, illustrative', col: ex.rev > 0 ? '#FF8A1F' : '#A78BFA' },
    { l: 'Complaints / month', v: String(ex.cmp), sub: 'volume', col: '#FF4FA3' },
    { l: 'Profile corrections', v: String(ex.cor), sub: 'per month', col: '#F6F1FF' },
    { l: 'Privacy risk', v: ex.risk, sub: 'qualitative', col: ex.risk === 'High' ? '#FF4F7A' : ex.risk === 'Medium' ? '#FF8A1F' : '#1DF08A' },
  ];
  const purgeOff = !(flagged && !exPurged);
  return (
    <div className="g2">
      <div className="card pop">
        <div className="h3">Platform strategy</div>
        <div className="row" role="group" aria-label="Platform strategy">{Object.entries(EX).map(([id, e]) => <button key={id} className={'chip' + (exStrat === id ? ' on' : '')} aria-pressed={exStrat === id} onClick={() => set({ exStrat: id })}>{e.label}</button>)}</div>
        <div className="g2" style={{ gap: 12 }}>
          {tiles.map((t) => <div key={t.l}><div className="small muted">{t.l}</div><div className="stat" style={{ fontSize: 36, color: t.col }}>{t.v}</div><div className="small muted">{t.sub}</div></div>)}
        </div>
        <div className="small muted">Illustrative figures for a fictional platform.</div>
      </div>
      <div className="card">
        <div className="h3">Governance status</div>
        <div className={'gap ' + ex.gc}>{ex.gov}</div>
        <div className="h3">Open items from the listener</div>
        {open.map((o) => <div key={o} className="small">• {o}</div>)}
        <button className="btn pink" onClick={() => set({ exPurged: true })} disabled={purgeOff}>{!flagged ? 'No exported segment for this listener' : exPurged ? 'Exported segment purged' : 'Purge exported segment (executive authority)'}</button>
        <div className="small muted">Only the executive role holds authority to purge an exported segment. A listener’s correction does not do this automatically. Purge cannot be undone until Reset demo.</div>
      </div>
    </div>
  );
}
