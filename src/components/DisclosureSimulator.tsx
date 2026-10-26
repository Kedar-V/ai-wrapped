import { cloneGrid, DIMS, DPRE, DPRESET_LABELS, ITEMS, RECS, type Grid, type ItemKey, type RecipientKey } from '../data/disclosure';
import { useAppStore } from '../store/useAppStore';

export function DisclosureSimulator() {
  const { dGrid, dPre, set } = useAppStore();
  const grid: Grid = dGrid ?? DPRE.current;
  const has = (r: RecipientKey, i: ItemKey) => grid[r].includes(i);
  const cnt = (k: RecipientKey) => grid[k].length;

  const toggle = (r: RecipientKey, i: ItemKey) => {
    const g = cloneGrid(grid);
    g[r] = has(r, i) ? g[r].filter((z) => z !== i) : [...g[r], i];
    set({ dGrid: g, dPre: '' });
  };

  const sums = DIMS.map(() => 0), maxs = DIMS.map(() => 0);
  ITEMS.forEach((it) => RECS.forEach((r) => DIMS.forEach((_, j) => {
    const v = it.w[j] * r.m[j];
    if (v > 0) maxs[j] += v;
    if (has(r.k, it.k)) sums[j] += v;
  })));
  const meters = DIMS.map((d, j) => {
    const x = Math.max(0, sums[j]) / maxs[j];
    const level = d.risk ? (x < 0.12 ? 'Low' : x < 0.35 ? 'Moderate' : 'High') : x < 0.12 ? 'Little' : x < 0.35 ? 'Some' : 'Strong';
    return { name: d.n, level, w: Math.round(x * 100), bar: d.risk ? 'b-o' : 'b-g' };
  });

  const notes: { cls: string; t: string }[] = [];
  const N = (cls: string, t: string) => notes.push({ cls: 'gap ' + cls, t });
  if (has('pub', 'rule')) N('d', 'Publishing exact rules lets anyone game the model and exposes proprietary logic. It also supports outside scrutiny. Role-restricted and auditor access often achieves most of the accountability with less risk.');
  if (has('pub', 'inf') || has('pub', 'raw')) N('p', 'Public release of personal inferences or histories is a privacy harm regardless of intent.');
  if (has('pub', 'agg')) N('g', 'Aggregate validation metrics carry low privacy risk and high accountability value: a good candidate for public disclosure.');
  if (cnt('adt') === 0) N('d', 'Without protected access, independent auditors cannot verify the platform’s claims. Oversight becomes self-attestation.');
  if (cnt('pub') + cnt('lis') + cnt('adt') === 0) N('d', 'Restricting all external access protects individual data, but nobody outside the company can check the system.');
  if (!has('lis', 'cor')) N('p', 'The listener cannot challenge a label. Affected without recourse.');
  if (has('lis', 'inf') && !has('lis', 'rule')) N('d', 'The listener sees the conclusion but not the logic. Disclosure is not the same as understanding.');
  if (has('lis', 'del')) N('g', 'The listener can request erasure downstream: strongest recourse, but requires the platform to build propagation to partners.');
  if (!has('stf', 'del') && !has('lis', 'del')) N('p', 'No one holds authority to delete from downstream systems: label corrections never reach exported segments.');
  if (has('adt', 'aud')) N('g', 'Auditors can inspect audit records under protected access: independent oversight without public release.');
  if (!notes.length) N('g', 'No flagged trade-offs in this configuration. Compare with the other presets.');

  const modes = [
    { name: 'Public disclosure', n: cnt('pub') },
    { name: 'Individual access', n: cnt('lis') },
    { name: 'Role-restricted professional access', n: cnt('stf') },
    { name: 'Independent oversight access', n: cnt('adt') },
  ];

  return (
    <>
      <div className="row" role="group" aria-label="Presets">
        {DPRESET_LABELS.map(([id, l]) => (
          <button key={id} className={'chip' + (dPre === id ? ' on' : '')} aria-pressed={dPre === id} onClick={() => set({ dGrid: cloneGrid(DPRE[id]), dPre: id })}>{l}</button>
        ))}
      </div>
      <div className="card">
        <div className="scroll">
          <table className="tbl">
            <thead><tr><th>Information</th>{RECS.map((c) => <th key={c.k}>{c.label}<br /><span style={{ textTransform: 'none', letterSpacing: 0 }}>{c.kind}</span></th>)}</tr></thead>
            <tbody>
              {ITEMS.map((it) => (
                <tr key={it.k}>
                  <td>{it.n}</td>
                  {RECS.map((r) => {
                    const on = has(r.k, it.k);
                    return <td key={r.k}><button className={'cellb ' + (on ? 'ca' : 'cu')} aria-pressed={on} aria-label={`${it.n} for ${r.label}: ${on ? 'Open' : 'Closed'}`} onClick={() => toggle(r.k, it.k)}>{on ? 'Open' : 'Closed'}</button></td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="g2">
        <div className="card">
          <div className="h3">Trade-off indicators (explanatory, not an ethics score)</div>
          {meters.map((m) => (
            <div key={m.name}>
              <div className="row small" style={{ justifyContent: 'space-between' }}><span>{m.name}</span><b>{m.level}</b></div>
              <div className="bar"><i className={m.bar} style={{ width: m.w + '%' }} /></div>
            </div>
          ))}
          <div className="h3">Four kinds of disclosure</div>
          {modes.map((m) => <div key={m.name} className="small"><b>{m.name}:</b> {m.n} items open</div>)}
        </div>
        <div className="card" aria-live="polite">
          <div className="h3">What your choices mean</div>
          {notes.map((n) => <div key={n.t} className={n.cls}>{n.t}</div>)}
        </div>
      </div>
    </>
  );
}
