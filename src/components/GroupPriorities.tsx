import { useEffect, useRef, useState } from 'react';
import { createRoom, getActiveRoom, postVote, streamRoom, takePendingRoom, type LiveSnapshot } from '../lib/voteApi';
import { useAppStore } from '../store/useAppStore';

/**
 * Live classroom poll: instructor hits Start poll; everyone else auto-joins
 * the active room and the chart updates over SSE as picks are submitted.
 */
export function GroupPriorities() {
  const cPri = useAppStore((s) => s.cPri);
  const [code, setCode] = useState('');
  const [live, setLive] = useState<LiveSnapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const lastSent = useRef('');

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

  useEffect(() => {
    if (!code) return;
    const stop = streamRoom(
      code,
      (s) => { setLive(s); setMsg(''); },
      (e) => setMsg(e.message),
    );
    return stop;
  }, [code]);

  // Auto-submit when exactly three principles are chosen and the poll is open
  useEffect(() => {
    if (!code || !live?.open || cPri.length !== 3) return;
    const key = cPri.slice().sort().join('|');
    if (key === lastSent.current) return;
    lastSent.current = key;
    void postVote(code, cPri)
      .then((s) => setLive(s))
      .catch((e: Error) => setMsg(e.message));
  }, [code, live?.open, cPri]);

  const startPoll = async () => {
    setBusy(true);
    setMsg('');
    try {
      const r = await createRoom();
      lastSent.current = '';
      setCode(r.code);
      setMsg('Poll open — picks update live for everyone on this server.');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const rows = live?.tally ?? [];
  const voteCount = live?.votes ?? 0;
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <div className="card" aria-labelledby="gp-title">
      <div className="eyebrow">Group priorities · live poll</div>
      <div className="h3" id="gp-title">Which principles is the room choosing?</div>

      <div className="row">
        {!code || !live?.open ? (
          <button className="btn pink" disabled={busy} onClick={() => void startPoll()}>Start poll</button>
        ) : (
          <>
            <span className="tag t-obs">Live</span>
            <span className="stat" style={{ fontSize: 28, color: '#1DF08A' }} aria-live="polite">{code}</span>
            <span className="small muted">Pick three principles above — the chart updates for everyone.</span>
          </>
        )}
      </div>

      {voteCount === 0 ? (
        <div className="gap d">
          {code ? 'Waiting for votes… pick three principles above.' : 'Instructor: Start poll. Everyone else joins automatically.'}
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

      {msg && <div className="small muted" role="status">{msg}</div>}
    </div>
  );
}
