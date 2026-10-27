import { TH } from '../data/model';
import { COPTS, FINDS } from '../data/stakeholders';
import { useProfile } from '../hooks';
import { useAppStore } from '../store/useAppStore';

export function AuditorDashboard() {
  const { P, F, flagged, score } = useProfile();
  const { audStep, audCls, set } = useAppStore();
  const chain = [
    { l: '1 Raw events', t: 'Raw listening events', text: `Timestamped plays for ${P.name}: ${P.min.toLocaleString('en-US')} minutes.`, have: ['Event logs are retained and complete in the synthetic dataset'], miss: ['Retention and access policy for individual histories'] },
    { l: '2 Features', t: 'Feature extraction', text: `Four features computed nightly: ${F.night}% night, ${F.low}% low-energy, ${F.rom}% romantic, ${F.repeat}% replay.`, have: ['Feature definitions documented', 'Values reproducible from events'], miss: ['Check that “romantic” tagging does not reflect gifts or shared playlists'] },
    { l: '3 Rule', t: 'Scoring rule', text: `Weighted sum scored ${score} against threshold ${TH}.`, have: ['Rule text and unit tests (14/14)'], miss: ['Any clinical or empirical validation', 'Source for the weights and threshold'] },
    { l: '4 Label', t: 'Profile label', text: flagged ? '“Potentially Emotionally Vulnerable” applied.' : 'No label applied for this profile.', have: ['Label is visible to the listener'], miss: ['Evidence the label is true for this person'] },
    { l: '5 Export', t: 'Segment export', text: flagged ? 'Added to “Evening Reflective · Wellness”. The correction records show the label was disputed, but the segment was never updated.' : 'Not exported.', have: ['Export log shows date and recipient'], miss: ['Disclosure to the listener', 'Mechanism that propagates corrections downstream'] },
    { l: '6 Campaign', t: 'Campaign use', text: flagged ? 'Offered to Calm Harbor’s wellness subscription campaign.' : 'Not used.', have: ['Campaign brief exists'], miss: ['Review of whether targeting emotional vulnerability is acceptable for this campaign category'] },
  ];
  const sel = chain[audStep];
  const recs = flagged
    ? [
      'Listener disputed the label; it was removed from their profile.',
      'Listener requested deletion from advertising systems. No automatic mechanism exists; still pending.',
      'No record of the exported segment ever being purged.',
    ]
    : ['No correction records for this listener.'];
  return (
    <div className="g2">
      <div className="card pop">
        <div className="h3">Trace the inference to its origin</div>
        <div className="small muted">You can see this because an audit has been authorized. Without that, almost none of it is visible to you.</div>
        <div className="row" role="group" aria-label="Provenance chain">{chain.map((c, i) => <button key={c.l} className={'chip' + (audStep === i ? ' on' : '')} aria-pressed={audStep === i} onClick={() => set({ audStep: i })}>{c.l}</button>)}</div>
        <div className="h3">{sel.t}</div><div>{sel.text}</div>
        <div className="gap g"><b>Evidence present</b>{sel.have.map((x) => <div key={x} className="small">✓ {x}</div>)}</div>
        <div className="gap p"><b>Evidence missing</b>{sel.miss.map((x) => <div key={x} className="small">✕ {x}</div>)}</div>
      </div>
      <div className="card">
        <div className="h3">Classify the findings</div>
        {FINDS.map((f, i) => (
          <div key={f[0]} className="gap d">
            <b>{f[0]}</b><div className="small">{f[1]}</div>
            <div className="row" style={{ marginTop: 8 }} role="group" aria-label={`Classify: ${f[0]}`}>
              {COPTS.map((o) => <button key={o[0]} className={'chip' + (audCls[i] === o[0] ? ' on' : '')} aria-pressed={audCls[i] === o[0]} onClick={() => set({ audCls: { ...audCls, [i]: o[0] } })}>{o[1]}</button>)}
            </div>
          </div>
        ))}
        <div className="h3">Correction records on file</div>
        {recs.map((r) => <div key={r} className="small">• {r}</div>)}
      </div>
    </div>
  );
}
