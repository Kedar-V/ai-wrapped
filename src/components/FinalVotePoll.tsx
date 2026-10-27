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
  type PollKind,
} from '../lib/voteApi';
import { useAppStore } from '../store/useAppStore';

type ShipKind = Extract<PollKind, 'before' | 'final'>;

const META: Record<ShipKind, { eyebrow: string; locked: string; open: string; done: string }> = {
  before: {
    eyebrow: 'Gut check · live poll',
    locked: 'Your before vote is locked for this poll.',
    open: 'Before poll open — pick one option, then Submit vote.',
    done: 'Submitted — your before vote is locked.',
  },
  final: {
    eyebrow: 'Final vote · live poll',
    locked: 'Your final vote is locked for this poll.',
    open: 'Final poll open — pick one option, then Submit vote.',
    done: 'Submitted — your final vote is locked.',
  },
};

/** Live Deploy / restrictions / Redesign / Do not deploy poll. `before` = Act I baseline; `final` = council. */
export function FinalVotePoll({ kind = 'final' }: { kind?: ShipKind }) {
  const choice = useAppStore((s) => (kind === 'before' ? s.cBefore : s.cFinal));
  const locked = useAppStore((s) => (kind === 'before' ? s.beforeLocked : s.finalLocked));
  const set = useAppStore((s) => s.set);
  const meta = META[kind];
  const [code, setCode] = useState('');
  const [live, setLive] = useState<LiveSnapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [password, setPassword] = useState(() => {
    try { return sessionStorage.getItem('aiw.pollPassword') || 'ethics'; } catch { return 'ethics'; }
  });

  const setChoice = (name: string) =>
    set(kind === 'before' ? { cBefore: name } : { cFinal: name });
  const setLocked = (v: boolean) =>
    set(kind === 'before' ? { beforeLocked: v } : { finalLocked: v });

  useEffect(() => {
    if (code) return;
    let stop = false;
    const tick = async () => {
      try {
        const a = await getActiveRoom(kind);
        if (!stop && a.code) setCode(a.code);
      } catch { /* no poll yet */ }
    };
    void tick();
    const id = window.setInterval(() => { void tick(); }, 2000);
    return () => { stop = true; window.clearInterval(id); };
  }, [code, kind]);

  useEffect(() => {
    if (!code) return;
    setLocked(readVotedCode(kind) === code);
  }, [code, kind]); // eslint-disable-line react-hooks/exhaustive-deps -- setLocked is stable via zustand

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
      const r = await createRoom(password.trim(), kind);
      try { sessionStorage.setItem('aiw.pollPassword', password.trim()); } catch { /* ignore */ }
      writeVotedCode(null, kind);
      setLocked(false);
      setCode(r.code);
      setMsg(meta.open);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!code || locked || live?.open === false) return;
    const pick = kind === 'before'
      ? useAppStore.getState().cBefore
      : useAppStore.getState().cFinal;
    if (!pick) {
      setMsg('Pick one option above, then Submit.');
      return;
    }
    setBusy(true);
    setMsg('');
    try {
      const s = await postFinalVote(code, pick);
      setLive(s);
      writeVotedCode(code, kind);
      setLocked(true);
      setMsg(meta.done);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const liveRows = live?.tally ?? [];
  const voteCount = live?.votes ?? 0;
  const useLive = !!code && voteCount > 0;
  const canSubmit = !!code && live?.open !== false && !!choice && !locked && !busy;
  const pwId = `${kind}-poll-password`;

  return (
    <div className="card" aria-labelledby={`${kind}-vote-title`}>
      <div className="eyebrow">{meta.eyebrow}</div>
      <div className="h3" id={`${kind}-vote-title`}>Should this system ship?</div>

      <div className="g4" role="group" aria-label={meta.eyebrow}>
        {FINALS.map(([name, sample]) => {
          const row = liveRows.find((r) => r.name === name);
          const pct = useLive
            ? (row?.pct ?? 0)
            : Math.round(((sample + (choice === name ? 1 : 0)) / (100 + (choice ? 1 : 0))) * 100);
          return (
            <button
              key={name}
              className={'vote' + (choice === name ? ' on' : '')}
              aria-pressed={choice === name}
              disabled={locked}
              onClick={() => setChoice(name)}
            >
              <b>{name}</b>
              <span className="bar"><i className="b-o" style={{ width: pct + '%' }} /></span>
              <span className="mono small">{useLive ? `${row?.count ?? 0} · ${pct}%` : `${pct}%`}</span>
            </button>
          );
        })}
      </div>

      <div className="row" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
        <label className="sr" htmlFor={pwId}>Instructor password</label>
        <input
          id={pwId}
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
        {useLive
          ? `${voteCount} live vote${voteCount === 1 ? '' : 's'} — bars update for the room.`
          : code
            ? 'Pick one option, then Submit vote.'
            : 'Instructor: password + Start poll. Students join automatically and submit once.'}
      </div>
      {locked && <div className="gap g">{meta.locked}</div>}
      {msg && <div className="small muted" role="status">{msg}</div>}
    </div>
  );
}
