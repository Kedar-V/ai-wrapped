import { FE, FL } from '../data/model';
import { useProfile } from '../hooks';
import { hoursOf } from '../lib/hours';
import { useAppStore } from '../store/useAppStore';

export function WrappedReveal() {
  const { P } = useProfile();
  const w = useAppStore((s) => s.wStep);
  const set = useAppStore((s) => s.set);
  const label = w >= 4 ? 'All revealed' : w === 0 ? 'Start the reveal' : 'Reveal next';
  return (
    <>
      <div className="row">
        <button className="btn pri" onClick={() => set({ wStep: Math.min(4, w + 1) })} disabled={w >= 4}>{label}</button>
        <button className="btn ghost" onClick={() => set({ wStep: 0 })}>Replay</button>
        <span className="tag t-obs">Observed counts</span>
        <span className="tag t-spec">Interpretation (speculative)</span>
      </div>
      <div className="g2" aria-live="polite">
        {w >= 1 && (
          <div className="card pop">
            <span className="tag t-obs" style={{ alignSelf: 'flex-start' }}>Observed</span>
            <div className="stat" style={{ color: '#1DF08A' }}>{P.min.toLocaleString('en-US')}</div>
            <div className="h3">minutes listened</div>
            <div className="muted">That is about {Math.round(P.min / 60).toLocaleString('en-US')} hours of sound.</div>
          </div>
        )}
        {w >= 2 && (
          <div className="card pop">
            <span className="tag t-obs" style={{ alignSelf: 'flex-start' }}>Observed</span>
            <div className="h3">Top genres</div>
            {P.genres.map((g) => (
              <div key={g[0]}>
                <div className="row" style={{ justifyContent: 'space-between' }}><span>{g[0]}</span><span className="mono small">{g[1]}%</span></div>
                <div className="bar"><i className="b-v" style={{ width: g[1] * 2.5 + '%' }} /></div>
              </div>
            ))}
          </div>
        )}
        {w >= 3 && (
          <div className="card pop" style={{ gridColumn: '1/-1' }}>
            <span className="tag t-obs" style={{ alignSelf: 'flex-start' }}>Observed</span>
            <div className="h3">When you listen (share of minutes by hour, pink = 22:00–05:59)</div>
            <div className="hours" role="img" aria-label={`Listening by hour: ${P.night}% of minutes fall between 22:00 and 05:59.`}>
              {hoursOf(P).map((h, i) => (
                <div key={i} className="hb"><i style={{ height: h.pct + '%', background: h.col }} /><span>{h.tick}</span></div>
              ))}
            </div>
            <div className="g4">
              {FE.map((k) => (
                <div key={k}><div className="stat" style={{ fontSize: 40 }}>{P[k]}%</div><div className="small muted">{FL[k]}</div></div>
              ))}
            </div>
            <div className="small muted">Workdays {P.work}% of minutes · weekends {P.wknd}% of minutes.</div>
          </div>
        )}
        {w >= 4 && (
          <div className="card hi pop" style={{ gridColumn: '1/-1', background: 'linear-gradient(135deg,rgba(124,58,237,.55),rgba(255,79,164,.35))' }}>
            <span className="tag t-spec" style={{ alignSelf: 'flex-start' }}>AI-generated · speculative</span>
            <div className="eyebrow" style={{ color: '#fff' }}>Your AI personality</div>
            <div className="disp h1" style={{ fontSize: 'clamp(40px,6vw,80px)' }}>{P.name}</div>
            <p className="lead">{P.tag}. Fun, until you ask: <b>how much of this is a count, and how much is a conclusion?</b></p>
          </div>
        )}
      </div>
    </>
  );
}
