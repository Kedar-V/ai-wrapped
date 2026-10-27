import { useEffect, useState } from 'react';
import { TRAPVOTES } from '../data/policies';
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

/** Live Yes / No / safeguards / more info poll for the Explanation Trap. */
export function TrapVotePoll() {
  const vote = useAppStore((s) => s.vote);
  const locked = useAppStore((s) => s.trapLocked);
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
        const a = await getActiveRoom('trap');
        if (!stop && a.code) setCode(a.code);
      } catch { /* no poll yet */ }
    };
    void tick();
    const id = window.setInterval(() => { void tick(); }, 2000);
    return () => { stop = true; window.clearInterval(id); };
  }, [code]);

  useEffect(() => {
    if (!code) return;
    set({ trapLocked: readVotedCode('trap') === code });
  }, [code, set]);

  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    const accept = (s: LiveSnapshot) => {
      setLive(s);
      if (s.kind && s.kind !== 'trap') {
        setMsg('This room is a “' + s.kind + '” poll, not trap. Restart the vote server, then New poll on this screen.');
      } else {
        setMsg('');
      }
    };
    void getRoom(code)
      .then((s) => { if (!cancelled) accept(s); })
      .catch((e: Error) => { if (!cancelled) setMsg(e.message); });
    const stop = streamRoom(
      code,
      (s) => { if (!cancelled) accept(s); },
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
      const r = await createRoom(password.trim(), 'trap');
      if (r.kind && r.kind !== 'trap') {
        setMsg('Vote server is outdated (got kind “' + r.kind + '”). Stop it and run npm run vote:demo again, then Start poll.');
        return;
      }
      try { sessionStorage.setItem('aiw.pollPassword', password.trim()); } catch { /* ignore */ }
      writeVotedCode(null, 'trap');
      set({ trapLocked: false });
      setCode(r.code);
      setMsg('Trap poll open — pick one option, then Submit vote.');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!code || locked || live?.open === false) return;
    const pick = useAppStore.getState().vote;
    if (!pick) {
      setMsg('Pick one option above, then Submit.');
      return;
    }
    setBusy(true);
    setMsg('');
    try {
      const s = await postFinalVote(code, pick);
      setLive(s);
      writeVotedCode(code, 'trap');
      set({ trapLocked: true });
      setMsg('Submitted — your trap vote is locked.');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const liveRows = live?.tally ?? [];
  const voteCount = live?.votes ?? 0;
  const canSubmit = !!code && live?.open !== false && !!vote && !locked && !busy;

  return (
    <div className="card hi pop" style={{ borderColor: '#FF4F7A' }} aria-labelledby="trap-vote-title">
      <div className="eyebrow" style={{ color: '#FF9DC6' }}>Trap vote · live poll</div>
      <div className="disp h2" id="trap-vote-title" style={{ fontSize: 'clamp(32px,5vw,64px)' }}>
        The algorithm was transparent. The explanation was faithful. Was the system ethical?
      </div>

      <div className="g4" role="group" aria-label="Trap ethics vote">
        {TRAPVOTES.map(([name]) => {
          const row = liveRows.find((r) => r.name === name);
          const count = voteCount > 0 ? (row?.count ?? 0) : 0;
          const pct = voteCount > 0 ? (row?.pct ?? 0) : 0;
          return (
            <button
              key={name}
              className={'vote' + (vote === name ? ' on' : '')}
              aria-pressed={vote === name}
              disabled={locked}
              onClick={() => set({ vote: name })}
            >
              <b>{name}</b>
              <span className="bar"><i className="b-p" style={{ width: pct + '%' }} /></span>
              <span className="mono small">{count} · {pct}%</span>
            </button>
          );
        })}
      </div>

      <div className="row" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
        <label className="sr" htmlFor="trap-poll-password">Instructor password</label>
        <input
          id="trap-poll-password"
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
            {locked ? (
              <span className="tag t-obs">Submitted</span>
            ) : (
              <button className="btn pri" disabled={!canSubmit} onClick={() => void submit()}>Submit vote</button>
            )}
            <button className="btn ghost sm" disabled={busy} onClick={() => void startPoll()}>New poll</button>
          </>
        )}
      </div>
      <div className="small muted">
        {voteCount > 0
          ? `${voteCount} live vote${voteCount === 1 ? '' : 's'} — bars update for the room.`
          : code
            ? 'Pick one option, then Submit vote. Bars stay at 0 until the first submit.'
            : 'Instructor: password + Start poll. Students join automatically and submit once.'}
      </div>
      {locked && <div className="gap g">Your trap vote is locked for this poll.</div>}
      {msg && <div className="small muted" role="status">{msg}</div>}
    </div>
  );
}
