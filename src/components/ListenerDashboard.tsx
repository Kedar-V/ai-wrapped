import { useProfile } from '../hooks';
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
  const { labCor, labRes, labDel, labExp, set } = useAppStore();
  const ads = P.ads.map((x) => x[0] + ' → ' + x[1]);
  if (flagged) ads.push('Evening Reflective · Wellness → Calm Harbor wellness subscription (exported)');
  const lanes: { name: string; cls: LaneCls; note: string }[] = [
    { name: 'Profile label', cls: labCor && flagged ? 'done' : 'neutral', note: !flagged ? 'No vulnerability label on this profile.' : labCor ? 'Removed from your dashboard.' : 'Shown on your dashboard.' },
    { name: 'Future-use restriction', cls: labRes ? 'done' : 'todo', note: labRes ? 'You have opted out of future psychological profiling and exports.' : 'Not set. New exports can still use this inference.' },
    {
      name: 'Exported advertising segment',
      cls: !flagged ? 'done' : 'todo',
      note: !flagged
        ? 'No segment membership.'
        : labDel
          ? 'Deletion requested, but nothing removes the segment automatically. Only the platform executive can purge it; you cannot.'
          : 'Still active in the segment “Evening Reflective · Wellness”. Correcting the label does not remove it, and only the platform executive can purge it.',
    },
    { name: 'Underlying profiling policy', cls: 'neutral', note: 'Not affected by any individual action. Needs Ethics Council or executive review.' },
  ];
  return (
    <div className="g2">
      <div className="card pop">
        <div className="h3">Your AI profile · {P.name}</div>
        {P.infs.map((i) => {
          const removed = i.id === 'vuln' && labCor;
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
        <button className="btn pink" onClick={() => set({ labCor: !labCor })} disabled={!flagged}>{labCor ? 'Undo correction' : 'Dispute and correct this label'}</button>
        <button className="btn alt" onClick={() => set({ labRes: !labRes })}>{labRes ? 'Opt-out active (tap to undo)' : 'Opt out of psychological profiling'}</button>
        <button className="btn ghost" onClick={() => set({ labDel: !labDel })} disabled={!flagged}>{labDel ? 'Deletion requested (tap to withdraw)' : 'Request deletion from advertising systems'}</button>
        <button className="btn ghost" onClick={() => set({ labExp: true })} disabled={labExp}>{labExp ? 'Explanation requested' : 'Request explanation'}</button>
        {labExp && (
          <div className="gap d pop">
            <b>Reply from Wavelength:</b> “Thanks for your request. We use your listening activity to personalize recommendations and ads. See our Privacy Policy for more.”
          </div>
        )}
        {!flagged && <div className="small muted">Correction and deletion apply only to flagged profiles. This persona is not flagged.</div>}
        <div className="h3">What each action actually changes</div>
        {lanes.map((l) => <Lane key={l.name} {...l} />)}
      </div>
    </div>
  );
}
