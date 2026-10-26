import { useListenerActions, useProfile } from '../hooks';
import { useAppStore } from '../store/useAppStore';

export type LaneCls = 'done' | 'todo' | 'neutral';
export function Lane({ name, cls, note }: { name: string; cls: LaneCls; note: string }) {
  const status = cls === 'done' ? 'Done' : cls === 'todo' ? 'Open' : 'Info';
  return (
    <div className={'lane ' + cls}>
      <b>{name} <span className="tag t-fict">{status}</span></b>
      <span className="small">{note}</span>
    </div>
  );
}

export function ListenerDashboard() {
  const { P, F, flagged } = useProfile();
  const purged = useAppStore((s) => s.purged);
  const go = useAppStore((s) => s.go);
  const a = useListenerActions();
  const segYou = flagged && !purged;
  const ads = P.ads.map((x) => x[0] + ' → ' + x[1]);
  if (segYou) ads.push('Evening Reflective · Wellness → Calm Harbor wellness subscription (exported)');
  const lanes: { name: string; cls: LaneCls; note: string }[] = [
    { name: 'Profile label', cls: a.corrected && flagged ? 'done' : 'neutral', note: !flagged ? 'No vulnerability label on this profile.' : a.corrected ? 'Removed from your dashboard.' : 'Shown on your dashboard.' },
    { name: 'Future-use restriction', cls: a.restricted ? 'done' : 'todo', note: a.restricted ? 'You have opted out of future psychological profiling and exports.' : 'Not set. New exports can still use this inference.' },
    { name: 'Exported advertising segment', cls: !flagged || purged ? 'done' : 'todo', note: !flagged ? 'No segment membership.' : purged ? 'Purged by the platform. Your record no longer appears in the segment.' : 'Still active in the segment “Evening Reflective · Wellness”. Your correction did not remove it.' },
    { name: 'Underlying profiling policy', cls: 'neutral', note: 'Not affected by any individual action. Needs Ethics Council or executive review.' },
  ];
  return (
    <div className="g2">
      <div className="card pop">
        <div className="h3">Your AI profile · {P.name}</div>
        {P.infs.map((i) => {
          const removed = i.id === 'vuln' && a.corrected;
          return (
            <div key={i.id} className="row" style={{ justifyContent: 'space-between' }}>
              <span className={removed ? 'muted' : ''} style={removed ? { textDecoration: 'line-through' } : undefined}>{i.name}</span>
              <span className={'tag ' + (removed ? 't-fict' : 't-spec')}>{removed ? 'removed from profile' : 'inferred · speculative'}</span>
            </div>
          );
        })}
        <div className="h3">Supporting behavior <span className="tag t-obs">Observed</span></div>
        <div className="small muted">{F.night}% night · {F.low}% low-energy · {F.rom}% romantic playlists · {F.repeat}% replays</div>
        <div className="h3">Recommendation consequences</div>
        {P.recs.map((r) => <div key={r} className="small">• {r}</div>)}
        <div className="h3">Advertising consequences</div>
        {ads.map((r) => <div key={r} className="small">• {r}</div>)}
      </div>
      <div className="card">
        <div className="h3">Your controls</div>
        <button className="btn pink" onClick={a.toggleCorrect} disabled={!flagged}>{a.correctLabel}</button>
        <button className="btn alt" onClick={a.toggleRestrict}>{a.restrictLabel}</button>
        <button className="btn ghost" onClick={a.toggleDelete} disabled={!flagged}>{a.deleteLabel}</button>
        <button className="btn ghost" onClick={() => go('explain')}>Request explanation</button>
        {!flagged && <div className="small muted">Correction and deletion apply only to flagged profiles. This persona is not flagged.</div>}
        <div className="h3">What each action actually changes</div>
        {lanes.map((l) => <Lane key={l.name} {...l} />)}
      </div>
    </div>
  );
}
