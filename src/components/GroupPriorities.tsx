import { useEffect, useRef, useState } from 'react';
import { clearImported, clearMine, loadImported, loadMine, mergeSubmissions, parseCsv, saveImported, saveMine, tally, toCsv, type Submission } from '../lib/classroom';
import { clearRoom, createRoom, postVote, setVoteApiBase, stopRoom, streamRoom, voteApiBase, type LiveSnapshot } from '../lib/voteApi';
import { useAppStore } from '../store/useAppStore';

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

type Mode = 'local' | 'live';

/**
 * Group priorities for the Ethics Council.
 * Live mode talks to the small vote server (Start voting → room code → SSE chart).
 * Local mode keeps the CSV export/import path for offline / Pages-only demos.
 */
export function GroupPriorities() {
  const cPri = useAppStore((s) => s.cPri);
  const [mode, setMode] = useState<Mode>('live');
  const [code, setCode] = useState('');
  const [joinInput, setJoinInput] = useState('');
  const [live, setLive] = useState<LiveSnapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [apiUrl, setApiUrl] = useState(voteApiBase);
  const lastSent = useRef('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Local / CSV state
  const [mine, setMine] = useState<Submission | null>(loadMine);
  const [imported, setImported] = useState<Submission[]>(loadImported);
  const [published, setPublished] = useState<Submission[]>([]);

  useEffect(() => {
    if (cPri.length === 3) {
      saveMine(cPri);
      setMine(loadMine());
    }
  }, [cPri]);

  useEffect(() => {
    let liveFlag = true;
    fetch(import.meta.env.BASE_URL + 'cohort.csv')
      .then((r) => (r.ok ? r.text() : ''))
      .then((t) => { if (liveFlag) setPublished(parseCsv(t)); })
      .catch(() => undefined);
    return () => { liveFlag = false; };
  }, []);

  // Subscribe when we have a room code
  useEffect(() => {
    if (mode !== 'live' || !code) return;
    const stop = streamRoom(
      code,
      (s) => { setLive(s); setMsg(''); },
      (e) => setMsg(e.message),
    );
    return stop;
  }, [mode, code]);

  // Auto-submit when exactly three principles are chosen and voting is open
  useEffect(() => {
    if (mode !== 'live' || !code || !live?.open || cPri.length !== 3) return;
    const key = cPri.slice().sort().join('|');
    if (key === lastSent.current) return;
    lastSent.current = key;
    void postVote(code, cPri)
      .then((s) => setLive(s))
      .catch((e: Error) => setMsg(e.message));
  }, [mode, code, live?.open, cPri]);

  const startVoting = async () => {
    setBusy(true);
    setMsg('');
    try {
      setVoteApiBase(apiUrl);
      const r = await createRoom();
      lastSent.current = '';
      setCode(r.code);
      setMode('live');
      setMsg(`Voting open. Share code ${r.code} with the room.`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const join = () => {
    const c = joinInput.trim().toUpperCase();
    if (c.length !== 4) { setMsg('Enter the 4-character room code.'); return; }
    setVoteApiBase(apiUrl);
    lastSent.current = '';
    setCode(c);
    setMode('live');
    setMsg(`Joined room ${c}. Pick three principles to cast your vote.`);
  };

  const stop = async () => {
    if (!code) return;
    setBusy(true);
    try {
      setLive(await stopRoom(code));
      setMsg('Voting closed. Chart keeps the final tallies.');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const clear = async () => {
    if (!code) return;
    setBusy(true);
    try {
      lastSent.current = '';
      setLive(await clearRoom(code));
      setMsg('Votes cleared. Room stays open.');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const onImport = async (files: FileList | null) => {
    if (!files?.length) return;
    const parsed = (await Promise.all([...files].map((f) => f.text()))).flatMap(parseCsv);
    const merged = mergeSubmissions(imported, parsed);
    saveImported(merged);
    setImported(merged);
    setMsg(`Imported ${parsed.length} valid submission${parsed.length === 1 ? '' : 's'}.`);
    if (fileRef.current) fileRef.current.value = '';
  };

  const localAll = mergeSubmissions(published, imported, mine ? [mine] : []);
  const localRows = tally(localAll);
  const liveRows = live?.tally ?? [];
  const rows = mode === 'live' && code ? liveRows : localRows;
  const voteCount = mode === 'live' && code ? (live?.votes ?? 0) : localAll.length;
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <div className="card" aria-labelledby="gp-title">
      <div className="eyebrow">Group priorities · classroom results</div>
      <div className="h3" id="gp-title">Which principles is the room choosing?</div>

      <div className="row" role="group" aria-label="Results source">
        <button className={'chip' + (mode === 'live' ? ' on' : '')} aria-pressed={mode === 'live'} onClick={() => setMode('live')}>Live voting</button>
        <button className={'chip' + (mode === 'local' ? ' on' : '')} aria-pressed={mode === 'local'} onClick={() => setMode('local')}>CSV / local</button>
      </div>

      {mode === 'live' && (
        <>
          <div className="small muted">
            Instructor clicks <b>Start voting</b> and shares the 4-letter code. Everyone joins, picks three principles, and the chart updates live.
            Duplicate votes are counted. Needs the vote server (<span className="mono">npm run vote-server</span>).
          </div>
          <label className="small muted" htmlFor="vote-api">Vote server URL</label>
          <input id="vote-api" className="inp" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="http://localhost:8787" />
          <div className="row">
            <button className="btn pink" disabled={busy} onClick={() => void startVoting()}>Start voting</button>
            <label className="sr" htmlFor="join-code">Room code</label>
            <input id="join-code" className="inp" style={{ maxWidth: 120, textTransform: 'uppercase' }} maxLength={4} value={joinInput} onChange={(e) => setJoinInput(e.target.value.toUpperCase())} placeholder="CODE" aria-label="Room code" />
            <button className="btn alt" disabled={busy} onClick={join}>Join</button>
            {code && (
              <>
                <span className="stat" style={{ fontSize: 36, color: '#1DF08A' }} aria-live="polite">{code}</span>
                <span className={'tag ' + (live?.open ? 't-obs' : 't-fict')}>{live?.open ? 'Open' : 'Closed'}</span>
                <button className="btn ghost sm" disabled={busy || !live?.open} onClick={() => void stop()}>Stop voting</button>
                <button className="btn ghost sm" disabled={busy} onClick={() => void clear()}>Clear votes</button>
              </>
            )}
          </div>
          {code && cPri.length === 3 && live?.open && (
            <div className="gap g">Your three picks were sent to room <b>{code}</b>. Change a pick to send another vote (duplicates count).</div>
          )}
          {code && cPri.length < 3 && live?.open && (
            <div className="gap d">Pick exactly three principles above to cast your vote.</div>
          )}
        </>
      )}

      {mode === 'local' && (
        <div className="small muted">
          Offline fallback: based on <b>{localAll.length}</b> submission{localAll.length === 1 ? '' : 's'}
          ({published.length} published, {imported.length} imported, {mine ? 1 : 0} from this browser). Not a live feed.
        </div>
      )}

      {voteCount === 0 ? (
        <div className="gap d">No votes yet.{mode === 'live' ? ' Start or join a room, then pick three principles.' : ' Choose three principles, or import CSV files.'}</div>
      ) : (
        <div role="list" aria-label="Number of votes mentioning each principle" aria-live="polite">
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

      {mode === 'local' && (
        <div className="row">
          <button className="btn ghost sm" disabled={!mine} onClick={() => mine && download('my-principles.csv', toCsv([mine]))}>Export my picks (CSV)</button>
          <button className="btn ghost sm" onClick={() => fileRef.current?.click()}>Import CSV files</button>
          <input ref={fileRef} className="sr" type="file" accept=".csv,text/csv" multiple tabIndex={-1} aria-label="Import CSV files" onChange={(e) => void onImport(e.target.files)} />
          <button className="btn ghost sm" disabled={localAll.length === 0} onClick={() => download('cohort.csv', toCsv(localAll))}>Export combined</button>
          <button className="btn ghost sm" disabled={!imported.length && !mine} onClick={() => { clearImported(); clearMine(); setImported([]); setMine(null); setMsg('Cleared local results.'); }}>Clear local results</button>
        </div>
      )}

      {msg && <div className="small muted" role="status">{msg}</div>}
    </div>
  );
}
