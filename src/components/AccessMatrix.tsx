import { CYCLE, MXC, MXN, MXP, MXS, type Cell } from '../data/matrix';
import { STK } from '../data/stakeholders';
import { useAppStore } from '../store/useAppStore';

export function AccessMatrix() {
  const { mView: view, mProp, set } = useAppStore();
  const prop = mProp ?? MXP.map((r) => r.slice());
  const M = view === 'current' ? MXC : prop;
  const views: [typeof view, string][] = [['current', 'Current simulated access'], ['proposed', 'Proposed ethical access'], ['diff', 'Show changes']];

  const cycle = (r: number, c: number) => {
    if (view === 'current') return;
    const np = prop.map((x) => x.slice());
    np[r][c] = CYCLE[(CYCLE.indexOf(np[r][c]) + 1) % 4] as Cell;
    set({ mProp: np, mView: view === 'diff' ? 'proposed' : view });
  };

  return (
    <div className="card">
      <div className="row">
        {views.map(([v, l]) => <button key={v} className={'chip' + (view === v ? ' on' : '')} aria-pressed={view === v} onClick={() => set({ mView: v })}>{l}</button>)}
        <span className="small muted">{view === 'current' ? 'Read-only baseline' : 'Tap a cell to cycle: Available → Restricted → Needs auth → Unavailable'}</span>
      </div>
      <div className="scroll">
        <table className="tbl">
          <thead><tr><th>Information / authority</th>{STK.map((x) => <th key={x.id}>{x.label}</th>)}</tr></thead>
          <tbody>
            {MXN.map((n, r) => (
              <tr key={n}>
                <td>{n}</td>
                {STK.map((x, c) => {
                  const v = M[r][c];
                  const chg = view === 'diff' && MXC[r][c] !== prop[r][c];
                  const text = (chg ? 'Changed: ' : '') + MXS[v].l;
                  return (
                    <td key={x.id}>
                      {view === 'current' ? (
                        <span className={'cellb ' + MXS[v].c} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{MXS[v].l}</span>
                      ) : (
                        <button className={'cellb ' + MXS[v].c + (chg ? ' chg' : '')} onClick={() => cycle(r, c)} aria-label={`${n}, ${x.label}: ${text}. Activate to change.`}>{text}</button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Power-vs-understanding gaps, computed from the visible matrix. */
export function matrixGaps(M: Cell[][]) {
  const g: { cls: string; t: string }[] = [];
  const exU = [2, 3, 4, 5].filter((r) => M[r][3] !== 'A').length;
  if (M[10][3] !== 'U' && exU >= 2) g.push({ cls: 'gap d', t: `Executive can influence deployment but lacks full access to ${exU} of 4 understanding layers (explanation, features, rules, provenance). Decides without understanding.` });
  if (M[6][2] === 'A' && M[2][2] === 'U') g.push({ cls: 'gap d', t: 'Advertisers can set targeting criteria but cannot see why users belong to a segment. Acts on an inference they cannot assess.' });
  if (M[9][0] !== 'A') g.push({ cls: 'gap p', t: `Listener correction authority is “${MXS[M[9][0]].l}”: they can dispute a label but not stop its downstream use.` });
  if (M[5][0] === 'U') g.push({ cls: 'gap p', t: 'Listener cannot see data provenance. Affected without being able to check where the conclusion came from.' });
  if (M[10][0] === 'U') g.push({ cls: 'gap p', t: 'Listener has no voice in deployment of the system that profiles them.' });
  if (!g.length) g.push({ cls: 'gap g', t: 'No major power-versus-understanding gaps in this configuration.' });
  return g;
}
