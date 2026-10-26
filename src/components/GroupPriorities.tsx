import { useEffect, useRef, useState } from 'react';
import { clearImported, clearMine, loadImported, loadMine, mergeSubmissions, parseCsv, saveImported, saveMine, tally, toCsv, type Submission } from '../lib/classroom';
import { useAppStore } from '../store/useAppStore';

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Group priorities for the Ethics Council. No backend: results come from this browser,
 * CSV files the instructor imports, and an optional cohort.csv published with the site.
 */
export function GroupPriorities() {
  const cPri = useAppStore((s) => s.cPri);
  const [mine, setMine] = useState<Submission | null>(loadMine);
  const [imported, setImported] = useState<Submission[]>(loadImported);
  const [published, setPublished] = useState<Submission[]>([]);
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // Save my picks once exactly three are chosen.
  useEffect(() => {
    if (cPri.length === 3) {
      saveMine(cPri);
      setMine(loadMine());
    }
  }, [cPri]);

  // Optional published cohort file (static, committed to the repo).
  useEffect(() => {
    let live = true;
    fetch(import.meta.env.BASE_URL + 'cohort.csv')
      .then((r) => (r.ok ? r.text() : ''))
      .then((t) => { if (live) setPublished(parseCsv(t)); })
      .catch(() => undefined);
    return () => { live = false; };
  }, []);

  const all = mergeSubmissions(published, imported, mine ? [mine] : []);
  const rows = tally(all);
  const max = Math.max(1, ...rows.map((r) => r.count));

  const onImport = async (files: FileList | null) => {
    if (!files?.length) return;
    const parsed = (await Promise.all([...files].map((f) => f.text()))).flatMap(parseCsv);
    const merged = mergeSubmissions(imported, parsed);
    saveImported(merged);
    setImported(merged);
    setMsg(`Imported ${parsed.length} valid submission${parsed.length === 1 ? '' : 's'} from ${files.length} file${files.length === 1 ? '' : 's'}.`);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="card" aria-labelledby="gp-title">
      <div className="eyebrow">Group priorities · classroom results</div>
      <div className="h3" id="gp-title">Which principles is the room choosing?</div>
      <div className="small muted">
        Based on <b>{all.length}</b> submission{all.length === 1 ? '' : 's'}: {published.length} from the published cohort file, {imported.length} imported, {mine ? 1 : 0} from this browser.
        Not a live classroom feed: results only include picks that were exported and imported here. Anonymous; no names are collected.
      </div>
      {all.length === 0 ? (
        <div className="gap d">No results yet. Choose three principles, or import students’ CSV files.</div>
      ) : (
        <div role="list" aria-label="Number of participants who chose each principle">
          {rows.map((r) => (
            <div key={r.name} role="listitem">
              <div className="row small" style={{ justifyContent: 'space-between' }}><span>{r.name}</span><span className="mono">{r.count} of {all.length} · {r.pct}%</span></div>
              <div className="bar"><i className="b-o" style={{ width: Math.round((r.count / max) * 100) + '%' }} /></div>
            </div>
          ))}
        </div>
      )}
      <div className="row">
        <button className="btn ghost sm" disabled={!mine} onClick={() => mine && download('my-principles.csv', toCsv([mine]))}>Export my picks (CSV)</button>
        <button className="btn ghost sm" onClick={() => fileRef.current?.click()}>Import CSV files</button>
        <input ref={fileRef} className="sr" type="file" accept=".csv,text/csv" multiple tabIndex={-1} aria-label="Import CSV files" onChange={(e) => void onImport(e.target.files)} />
        <button className="btn ghost sm" disabled={all.length === 0} onClick={() => download('cohort.csv', toCsv(all))}>Export combined (cohort.csv)</button>
        <button className="btn ghost sm" disabled={!imported.length && !mine} onClick={() => { clearImported(); clearMine(); setImported([]); setMine(null); setMsg('Cleared results stored in this browser.'); }}>Clear results in this browser</button>
      </div>
      {msg && <div className="small muted" role="status">{msg}</div>}
      <div className="small muted">Instructor: commit the combined file as <span className="mono">public/cohort.csv</span> to publish it with the site.</div>
    </div>
  );
}
