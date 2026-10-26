import { useEffect, useState } from 'react';
import { FINALS } from '../data/policies';
import {
  createRoom,
  getActiveRoom,
  getRoom,
  postFinalVote,
  readVotedCode,
  streamRoom,
  writeVotedCode,
  type LiveSnapshot,
} from '../lib/voteApi';
import { useAppStore } from '../store/useAppStore';

/**
 * Live classroom final vote (Deploy / restrictions / Redesign / Do not deploy).
 * Same Start-poll + Submit pattern as principles; separate room kind on the server.
 */
export function FinalVotePoll() {
  const cFinal = useAppStore((s) => s.cFinal);
  const finalLocked = useAppStore((s) => s.finalLocked);
  const set = useAppStore((s) => s.set);
  const [code, setCode] = useState('');
  const [live, setLive] = useState<LiveSnapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [password, setPassword] = useState(() => {
    try { return sessionStorage.getItem('aiw.pollPassword') || ''; } catch { return ''; }
  });

  useEffect(() => {
    if (code) return;
    let stop = false;
    const tick = async () => {
      try {
        const a = await getActiveRoom('final');
        if (!stop && a.code) setCode(a.code);
      } catch { /* no poll yet */ }
    };
    void tick();
    const id = window.setInterval(() => { void tick(); }, 2000);
    return () => { stop = true; window.clearInterval(id); };
  }, [code]);

  useEffect(() => {
    if (!code) return;
    set({ finalLocked: readVotedCode('final') === code });
  }, [code, set]);

  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    void getRoom(code)
      .then((s) => { if (!cancelled) { setLive(s); setMsg(''); } })
      .catch((e: Error) => { if (!cancelled) setMsg(e.message); });
    const stop = streamRoom(
      code,
      (s) => { setLive(s); setMsg(''); },
      (e) => setMsg(e.message),
    );
    return () => { cancelled = true; stop(); };
  }, [code]);

  const startPoll = async () => {
    if (!password.trim()) {
      setMsg('Enter the instructor password, then Start poll.');
      return;
    }
    setBusy(true);
    setMsg('');
    try {
      const r = await createRoom(password.trim(), 'final');
      try { sessionStorage.setItem('aiw.pollPassword', password.trim()); } catch { /* ignore */ }
      writeVotedCode(null, 'final');
      set({ finalLocked: false });
      setCode(r.code);
      setMsg('Final poll open — pick one option, then Submit vote.');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!code || finalLocked || live?.open === false) return;
    const choice = useAppStore.getState().cFinal;
    if (!choice) {
      setMsg('Pick one final option above, then Submit.');
      return;
    }
    setBusy(true);
    setMsg('');
    try {
      const s = await postFinalVote(code, choice);
      setLive(s);
      writeVotedCode(code, 'final');
      set({ finalLocked: true });
      setMsg('Submitted — your final vote is locked.');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const liveRows = live?.tally ?? [];
  const voteCount = live?.votes ?? 0;
  const useLive = !!code && voteCount > 0;
  const canSubmit = !!code && live?.open !== false && !!cFinal && !finalLocked && !busy;

  return (
    <div className="card" aria-labelledby="fv-title">
      <div className="eyebrow">Final vote · live poll</div>
      <div className="h3" id="fv-title">Should this system ship?</div>

      <div className="g4" role="group" aria-label="Final vote">
        {FINALS.map(([name, sample]) => {
          const row = liveRows.find((r) => r.name === name);
          const pct = useLive
            ? (row?.pct ?? 0)
            : Math.round(((sample + (cFinal === name ? 1 : 0)) / (100 + (cFinal ? 1 : 0))) * 100);
          return (
            <button
              key={name}
              className={'vote' + (cFinal === name ? ' on' : '')}
              aria-pressed={cFinal === name}
              disabled={finalLocked}
              onClick={() => set({ cFinal: name })}
            >
              <b>{name}</b>
              <span className="bar"><i className="b-o" style={{ width: pct + '%' }} /></span>
              <span className="mono small">{useLive ? `${row?.count ?? 0} · ${pct}%` : `${pct}%`}</span>
            </button>
          );
        })}
      </div>

      <div className="row" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
        <label className="sr" htmlFor="final-poll-password">Instructor password</label>
        <input
          id="final-poll-password"
          className="inp"
          type="password"
          autoComplete="current-password"
          placeholder="Instructor password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ maxWidth: 200 }}
        />
        {!code ? (
          <button className="btn pink" disabled={busy} onClick={() => void startPoll()}>Start poll</button>
        ) : (
          <>
            <span className={'tag ' + (live?.open !== false ? 't-obs' : 't-fict')}>{live?.open === false ? 'Closed' : 'Live'}</span>
            <span className="stat" style={{ fontSize: 28, color: '#1DF08A' }} aria-live="polite">{code}</span>
            {finalLocked ? (
              <span className="tag t-obs">Submitted</span>
            ) : (
              <button className="btn pri" disabled={!canSubmit} onClick={() => void submit()}>Submit vote</button>
            )}
            <button className="btn ghost sm" disabled={busy} onClick={() => void startPoll()}>New poll</button>
          </>
        )}
      </div>
      <div className="small muted">
        {useLive
          ? `${voteCount} live vote${voteCount === 1 ? '' : 's'} — bars update for the room.`
          : code
            ? 'Pick one option, then Submit vote.'
            : 'Instructor: password + Start poll. Students join automatically and submit once.'}
      </div>
      {finalLocked && <div className="gap g">Your final vote is locked for this poll.</div>}
      {msg && <div className="small muted" role="status">{msg}</div>}
    </div>
  );
}
