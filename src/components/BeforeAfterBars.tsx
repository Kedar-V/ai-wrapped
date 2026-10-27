import { useEffect, useState } from 'react';
import { AFTER, BEFORE, FINALS } from '../data/policies';
import { getActiveRoom, getRoom, type LiveTallyRow } from '../lib/voteApi';

/** Room before vs after ship tallies; falls back to illustrative sample when no live polls. */
export function BeforeAfterBars() {
  const [before, setBefore] = useState<LiveTallyRow[] | null>(null);
  const [after, setAfter] = useState<LiveTallyRow[] | null>(null);

  useEffect(() => {
    let stop = false;
    const load = async (kind: 'before' | 'final') => {
      try {
        const a = await getActiveRoom(kind);
        if (!a.code) return null;
        const s = await getRoom(a.code);
        return s.votes > 0 ? s.tally : null;
      } catch {
        return null;
      }
    };
    const tick = async () => {
      const [b, f] = await Promise.all([load('before'), load('final')]);
      if (stop) return;
      if (b) setBefore(b);
      if (f) setAfter(f);
    };
    void tick();
    const id = window.setInterval(() => { void tick(); }, 3000);
    return () => { stop = true; window.clearInterval(id); };
  }, []);

  const live = !!(before || after);
  const names = FINALS.map(([n]) => n);

  return (
    <div className="card">
      <div className="eyebrow">{live ? 'Live room: before → after' : 'Sample cohort: persona reveal → governance decision (illustrative)'}</div>
      {names.map((name, i) => {
        const bPct = before?.find((r) => r.name === name)?.pct ?? BEFORE[i][1];
        const aPct = after?.find((r) => r.name === name)?.pct ?? AFTER[i][1];
        return (
          <div key={name}>
            <div className="small">{name}</div>
            <div className="row small"><span style={{ width: 60 }}>Before</span><div className="bar" style={{ flex: 1 }}><i className="b-v" style={{ width: bPct + '%' }} /></div><span className="mono">{bPct}%</span></div>
            <div className="row small"><span style={{ width: 60 }}>After</span><div className="bar" style={{ flex: 1 }}><i className="b-o" style={{ width: aPct + '%' }} /></div><span className="mono">{aPct}%</span></div>
          </div>
        );
      })}
      <div className="small muted">
        {live
          ? 'Bars use the active before and final polls when each has votes.'
          : 'Start a before poll in Act I and a final poll in step 4 to replace this sample.'}
      </div>
    </div>
  );
}
