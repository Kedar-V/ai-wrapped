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
          <tfoot>
            <tr>
              <td><b>Where power and understanding come apart</b></td>
              {matrixGaps(M).map((g) => <td key={g.who} className={g.cls} style={{ verticalAlign: 'top', fontSize: 12 }}>{g.t}</td>)}
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="small muted">Gap row: red = open gap · orange = partly closed · green = closed. Switch to proposed access to see which gaps close.</div>
    </div>
  );
}

/** One gap box per role, computed from the visible matrix. */
export function matrixGaps(M: Cell[][]) {
  const lv = (v: Cell) => ({ A: 'available', R: 'restricted', X: 'behind authorization', U: 'unavailable' }[v]);
  const g: { who: string; cls: string; t: string }[] = [];
  // Columns: 0 Listener, 1 Engineer, 2 Executive, 3 Auditor
  const lFix = M[9][0] === 'A';
  const lProv = M[5][0] !== 'U';
  const lVoice = M[10][0] !== 'U';
  if (!lFix) {
    g.push({
      who: 'Listener',
      cls: 'gap p',
      t: 'Affected without power: can dispute the label but not stop its downstream use'
        + (lProv ? '' : ', cannot see where the conclusion came from')
        + (lVoice ? '.' : ', and has no say in whether the system is deployed.'),
    });
  } else if (!lVoice) {
    g.push({ who: 'Listener', cls: 'gap d', t: 'Can now correct the label and its downstream copies, but still has no say in whether the system is deployed.' });
  } else {
    g.push({ who: 'Listener', cls: 'gap g', t: 'Can correct the label downstream and has a voice in deployment.' });
  }

  const eOut = M[7][1] === 'A';
  const eGov = M[8][1] === 'A';
  if (!eOut && !eGov) {
    g.push({ who: 'ML Engineer', cls: 'gap p', t: `Understands the mechanism without seeing its consequences: business outcomes are ${lv(M[7][1])} and governance records are ${lv(M[8][1])}. Builds what it cannot fully judge.` });
  } else if (!eOut || !eGov) {
    g.push({
      who: 'ML Engineer',
      cls: 'gap d',
      t: `Understands the mechanism and now sees ${eOut ? 'business outcomes' : 'governance records'}, but ${eOut ? 'governance records are ' + lv(M[8][1]) : 'business outcomes are ' + lv(M[7][1])}. Sees only part of the impact.`,
    });
  } else {
    g.push({ who: 'ML Engineer', cls: 'gap g', t: 'Understands the mechanism and can see its consequences.' });
  }

  const exU = [2, 3, 4, 5].filter((r) => M[r][2] !== 'A').length;
  if (M[10][2] === 'U') {
    g.push({ who: 'Executive', cls: 'gap d', t: 'Holds no deployment authority in this configuration, so someone else must answer for the decision.' });
  } else if (exU >= 2) {
    g.push({ who: 'Executive', cls: 'gap p', t: `Decides without understanding: holds deployment authority (${lv(M[10][2])}) but lacks full access to ${exU} of 4 understanding layers (explanation, features, rules, provenance).` });
  } else if (exU === 1) {
    g.push({ who: 'Executive', cls: 'gap d', t: `Holds deployment authority (${lv(M[10][2])}) and lacks full access to 1 of 4 understanding layers.` });
  } else {
    g.push({ who: 'Executive', cls: 'gap g', t: 'Deployment decisions are backed by full access to how the inference works.' });
  }

  const aSee = M[8][3] === 'A';
  const aAct = M[9][3] !== 'U' || M[10][3] !== 'U';
  const aFull = M[9][3] === 'A' || M[10][3] === 'A';
  if (aSee && aFull) {
    g.push({ who: 'Auditor', cls: 'gap g', t: 'Can inspect the evidence and has real authority to act on it.' });
  } else if (aSee && aAct) {
    g.push({ who: 'Auditor', cls: 'gap d', t: `Can inspect the records, but authority to act is limited (correction ${lv(M[9][3])}, deployment ${lv(M[10][3])}). Can push back, not block.` });
  } else if (aSee) {
    g.push({ who: 'Auditor', cls: 'gap p', t: 'Understanding without power: can see what evidence is missing but can only recommend, not block.' });
  } else if (aAct) {
    g.push({ who: 'Auditor', cls: 'gap d', t: `Has some authority but audit records are ${lv(M[8][3])}: could act without seeing the evidence.` });
  } else {
    g.push({ who: 'Auditor', cls: 'gap p', t: `Oversight in name only: audit records are ${lv(M[8][3])} and it has no authority to correct or block anything.` });
  }

  return g;
}
