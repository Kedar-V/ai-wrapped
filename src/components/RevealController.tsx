import { TRAPVOTES } from '../data/policies';
import { useListenerActions, useProfile } from '../hooks';
import { useAppStore } from '../store/useAppStore';
import { Lane, type LaneCls } from './ListenerDashboard';

export function RevealController() {
  const { F, B } = useProfile();
  const { trapStep: t, vote, purged, set } = useAppStore();
  const a = useListenerActions();
  const sc = Math.round(B.total);
  const done = t >= 6;
  const lanes: { name: string; cls: LaneCls; note: string }[] = [
    { name: 'Profile correction', cls: a.corrected ? 'done' : 'todo', note: a.corrected ? 'Done: label removed from the listener’s dashboard.' : 'Available to the listener: remove the label from their own dashboard.' },
    { name: 'Future-use restriction', cls: a.restricted ? 'done' : 'todo', note: a.restricted ? 'Done: opted out of future psychological profiling.' : 'Not set: new exports can still use this inference.' },
    { name: 'Deletion from downstream systems', cls: purged ? 'done' : 'todo', note: purged ? 'Done: segment purged by the platform.' : 'Not automatic: the exported segment persists until someone with authority purges it.' },
    { name: 'Review of the profiling policy', cls: 'todo', note: 'Not triggered by individual action. Needs governance review.' },
  ];
  const cards = [
    { n: 1, title: 'The persona', head: '“Potentially Emotionally Vulnerable”', body: `A polished card, a calm gradient and a gentle explanation: “You listen to low-energy music late at night.” Heuristic score ${sc}/100. It feels like care.`, lanes: false },
    { n: 2, title: 'The evidence', head: 'The observations are accurate', body: `${F.night}% nighttime listening, ${F.low}% low-energy tracks, ${F.rom}% romantic playlists, ${F.repeat}% replays. All true in this dataset. But shift work, taste, a playlist made for someone else or a different time zone produce the same pattern.`, lanes: false },
    { n: 3, title: 'The technical truth', head: 'The model did exactly what it was written to do', body: 'Rule v0.3 was applied correctly. The rule is fully inspectable and the explanation matches the computation. Implementation is correct; the explanation is faithful.', lanes: false },
    { n: 4, title: 'The validity problem', head: 'Nobody established that this measures vulnerability', body: 'The weights and threshold were chosen by hand; there are no clinician-labeled examples. The explanation describes a computation, not a psychological truth.', lanes: false },
    { n: 5, title: 'The downstream consequence', head: 'The label became an advertising audience', body: 'The inferred segment (“Evening Reflective · Wellness”, 412,000 listeners) was offered to Calm Harbor’s wellness subscription campaign. The listener was not clearly told a personal inference would be used this way.', lanes: false },
    { n: 6, title: 'The accountability gap', head: 'Fixing the label does not fix the harm', body: 'The listener can remove the label from their dashboard, but a previously exported advertising segment is not automatically removed. These are four different remedies:', lanes: true },
  ];
  const tot = TRAPVOTES.reduce((x, y) => x + y[1], 0) + (vote ? 1 : 0);
  return (
    <>
      <div className="row">
        <button className="btn pink" onClick={() => set({ trapStep: Math.min(6, t + 1) })} disabled={done}>{done ? 'All reveals shown' : t === 0 ? 'Start the reveal' : 'Reveal next'}</button>
        <button className="btn ghost" onClick={() => set({ trapStep: Math.max(0, t - 1) })} disabled={t === 0}>Hide last reveal</button>
        <button className="btn ghost" onClick={() => set({ trapStep: 0, vote: '' })}>Restart sequence</button>
        <span className="muted small">Reveal {t} of 6 · controlled by the instructor</span>
      </div>
      <div className="col" aria-live="polite">
        {cards.filter((c) => t >= c.n).map((c) => (
          <div key={c.n} className={'rev pop' + (t === c.n ? ' cur' : '')}>
            <div className="rn">Reveal {c.n} · {c.title}</div>
            <div className="h3" style={{ fontSize: 28 }}>{c.head}</div>
            <div>{c.body}</div>
            {c.lanes && (
              <>
                <div className="col">{lanes.map((l) => <Lane key={l.name} {...l} />)}</div>
                <div className="row">
                  <button className="btn sm pink" onClick={a.toggleCorrect}>{a.correctLabel}</button>
                  <button className="btn sm alt" onClick={a.toggleRestrict}>{a.restrictLabel}</button>
                  <span className="small muted">Try them: the exported segment lane stays open until someone with authority purges it (Executive view).</span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      {done && (
        <div className="card hi pop" style={{ borderColor: '#FF4F7A' }}>
          <div className="eyebrow" style={{ color: '#FF9DC6' }}>Final reveal question</div>
          <div className="disp h2" style={{ fontSize: 'clamp(32px,5vw,64px)' }}>The algorithm was transparent. The explanation was faithful. Was the system ethical?</div>
          <div className="g4" role="group" aria-label="Your vote">
            {TRAPVOTES.map((v) => {
              const pct = Math.round(((v[1] + (vote === v[0] ? 1 : 0)) / tot) * 100);
              return (
                <button key={v[0]} className={'vote' + (vote === v[0] ? ' on' : '')} aria-pressed={vote === v[0]} onClick={() => set({ vote: v[0] })}>
                  <b>{v[0]}</b><span className="bar"><i className="b-p" style={{ width: pct + '%' }} /></span><span className="mono small">{pct}%</span>
                </button>
              );
            })}
          </div>
          <div className="small muted">Sample results (illustrative, n=100) plus your local vote. No classroom backend exists in this prototype.</div>
        </div>
      )}
    </>
  );
}
