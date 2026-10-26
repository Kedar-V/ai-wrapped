import { useEffect, useState } from 'react';
import { DefenseCloud } from './DefenseCloud';
import { createRoom, getActiveRoom, postVote, readVotedCode, streamRoom, takePendingRoom, writeVotedCode, type LiveSnapshot } from '../lib/voteApi';
import { useAppStore } from '../store/useAppStore';

/**
 * Live classroom poll: instructor hits Start poll; students pick three principles
 * and press Submit once. After submit, this browser is locked for that room.
 * Defense sentences feed a live word cloud.
 */
export function GroupPriorities() {
  const cPri = useAppStore((s) => s.cPri);
  const cDef = useAppStore((s) => s.cDef);
  const pollLocked = useAppStore((s) => s.pollLocked);
  const set = useAppStore((s) => s.set);
  const [code, setCode] = useState('');
  const [live, setLive] = useState<LiveSnapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  // Deep link (?room=) or wait for instructor's active poll
  useEffect(() => {
    if (code) return;
    const pending = takePendingRoom();
    if (pending) {
      setCode(pending);
      return;
    }
    let stop = false;
    const tick = async () => {
      try {
        const a = await getActiveRoom();
        if (!stop && a.code) setCode(a.code);
      } catch { /* no poll yet */ }
    };
    void tick();
    const id = window.setInterval(() => { void tick(); }, 2000);
    return () => { stop = true; window.clearInterval(id); };
  }, [code]);

  // Restore lock if this browser already voted in this room
  useEffect(() => {
    if (!code) return;
    const locked = readVotedCode() === code;
    set({ pollLocked: locked });
  }, [code, set]);

  useEffect(() => {
    if (!code) return;
    const stop = streamRoom(
      code,
      (s) => { setLive(s); },
      (e) => setMsg(e.message),
    );
    return stop;
  }, [code]);

  const startPoll = async () => {
    setBusy(true);
    setMsg('');
    try {
      const r = await createRoom();
      writeVotedCode(null);
      set({ pollLocked: false });
      setCode(r.code);
      setMsg('Poll open — pick three, write why, then Submit.');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!code || !live?.open || cPri.length !== 3 || pollLocked) return;
    setBusy(true);
    setMsg('');
    try {
      const defenses = Object.fromEntries(cPri.map((p) => [p, (cDef[p] || '').trim()]).filter(([, t]) => t));
      const s = await postVote(code, cPri, defenses);
      setLive(s);
      writeVotedCode(code);
      set({ pollLocked: true });
      setMsg('Submitted — your vote is locked.');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const rows = live?.tally ?? [];
  const voteCount = live?.votes ?? 0;
  const max = Math.max(1, ...rows.map((r) => r.count));
  const canSubmit = !!code && !!live?.open && cPri.length === 3 && !pollLocked && !busy;

  return (
    <div className="card" aria-labelledby="gp-title">
      <div className="eyebrow">Group priorities · live poll</div>
      <div className="h3" id="gp-title">Which principles is the room choosing?</div>

      <div className="row">
        {!code ? (
          <button className="btn pink" disabled={busy} onClick={() => void startPoll()}>Start poll</button>
        ) : (
          <>
            <span className={'tag ' + (live?.open !== false ? 't-obs' : 't-fict')}>{live?.open === false ? 'Closed' : 'Live'}</span>
            <span className="stat" style={{ fontSize: 28, color: '#1DF08A' }} aria-live="polite">{code}</span>
            {pollLocked ? (
              <span className="tag t-obs">Submitted</span>
            ) : live?.open !== false ? (
              <button className="btn pri" disabled={!canSubmit} onClick={() => void submit()}>
                Submit vote
              </button>
            ) : null}
            <button className="btn ghost sm" disabled={busy} onClick={() => void startPoll()}>New poll</button>
          </>
        )}
      </div>

      {code && live?.open && !pollLocked && (
        <div className="small muted">
          {cPri.length === 3
            ? 'Add a one-line defense above, then Submit vote (once per person).'
            : `Pick ${3 - cPri.length} more principle${3 - cPri.length === 1 ? '' : 's'}, defend them, then Submit.`}
        </div>
      )}
      {pollLocked && <div className="gap g">Your vote is in. Picks are locked for this poll.</div>}

      {voteCount === 0 ? (
        <div className="gap d">
          {code ? 'Waiting for votes…' : 'Instructor: Start poll. Everyone else joins automatically.'}
        </div>
      ) : (
        <div role="list" aria-label="Live tally of principle votes" aria-live="polite">
          <div className="small muted" style={{ marginBottom: 8 }}><b>{voteCount}</b> vote{voteCount === 1 ? '' : 's'} counted</div>
          {rows.map((r) => (
            <div key={r.name} role="listitem">
              <div className="row small" style={{ justifyContent: 'space-between' }}>
                <span>{r.name}</span>
                <span className="mono">{r.count} · {r.pct}%</span>
              </div>
              <div className="bar"><i className="b-o" style={{ width: Math.round((r.count / max) * 100) + '%' }} /></div>
            </div>
          ))}
        </div>
      )}

      <div>
        <div className="eyebrow">Why · defense word cloud</div>
        <DefenseCloud texts={(live?.defenses || []).map((d) => d.text)} />
      </div>

      {msg && <div className="small muted" role="status">{msg}</div>}
    </div>
  );
}
