import { AFTER, BEFORE, FINALS, NEG_WHO, POLICIES, PRINCIPLES } from '../data/policies';
import { useAppStore } from '../store/useAppStore';
import { GroupPriorities } from './GroupPriorities';

const STEPS = ['1 Principles', '2 Policy', '3 Negotiation', '4 Final vote', '5 Before and after'];

export function EthicsCouncil() {
  const { cStep: stp, cPri, cDef, cPol, cNeg, cFinal, cls, vote, pollLocked, set } = useAppStore();
  const pol = POLICIES.find((p) => p.id === cPol);
  const neg = POLICIES.find((p) => p.id === cNeg)!;
  const tot = FINALS.reduce((a, b) => a + b[1], 0) + (cFinal ? 1 : 0);
  const covered = pol ? cPri.filter((p) => pol.sup.includes(p)) : [];
  const ok = [cPri.length === 3, !!cPol, true, !!cFinal, true][stp - 1];
  const toggle = (n: string) => {
    if (useAppStore.getState().pollLocked) return;
    const cur = useAppStore.getState().cPri;
    if (cur.includes(n)) set({ cPri: cur.filter((x) => x !== n) });
    else if (cur.length < 3) set({ cPri: [...cur, n] });
  };
  const covMsg = pol && cPri.length === 3
    ? `Your policy serves ${covered.length} of your 3 priorities${covered.length ? ' (' + covered.join(', ') + ')' : ''}. ${covered.length < 2 ? 'Consider whether the policy matches what you said matters most.' : 'Good alignment.'}`
    : 'Choose three priorities and a policy to see how well they align.';
  const covCls = pol && cPri.length === 3 && covered.length >= 2 ? 'g' : 'd';
  const nextLabel = stp === 5 ? 'Done' : ['Choose policy', 'Hear the stakeholders', 'Final vote', 'See how views moved'][stp - 1];

  return (
    <>
      <div className="row" role="group" aria-label="Council steps">
        {STEPS.map((l, i) => <button key={l} className={'chip' + (stp === i + 1 ? ' on' : '')} aria-pressed={stp === i + 1} aria-current={stp === i + 1 ? 'step' : undefined} onClick={() => set({ cStep: i + 1 })}>{l}</button>)}
      </div>

      {stp === 1 && (
        <>
          <h2 className="disp h2">Choose your top three principles.</h2>
          <p className="lead">You can only hold three. Then defend each one in a sentence. {cPri.length} of 3 chosen.</p>
          <div className="g3">
            {PRINCIPLES.map((p) => {
              const on = cPri.includes(p[0]);
              return <button key={p[0]} className={'vote' + (on ? ' on' : '')} aria-pressed={on} disabled={pollLocked || (!on && cPri.length >= 3)} onClick={() => toggle(p[0])}><b>{p[0]}</b><span className="small muted">{p[1]}</span></button>;
            })}
          </div>
          {pollLocked && <div className="small muted">Poll vote submitted — principles are locked.</div>}
          {cPri.length > 0 && (
            <div className="card">
              <div className="h3">Defend your priorities</div>
              {cPri.map((n) => (
                <div key={n}>
                  <label htmlFor={'def-' + n} className="small muted">Why {n} matters most in this case</label>
                  <input id={'def-' + n} className="inp" value={cDef[n] ?? ''} onChange={(e) => set({ cDef: { ...cDef, [n]: e.target.value } })} disabled={pollLocked} />
                </div>
              ))}
            </div>
          )}
          <GroupPriorities />
        </>
      )}

      {stp === 2 && (
        <>
          <h2 className="disp h2">Choose a deployment policy.</h2>
          <div className="g2">
            {POLICIES.map((p) => (
              <button key={p.id} className={'vote' + (cPol === p.id ? ' on' : '')} aria-pressed={cPol === p.id} onClick={() => set({ cPol: p.id, cNeg: p.id })}>
                <b style={{ fontSize: 20 }}>{p.name}</b><span>{p.desc}</span><span className="small muted">Serves: {p.sup.join(', ')}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {stp === 3 && (
        <>
          <h2 className="disp h2">Stakeholder negotiation: {neg.name}</h2>
          <div className="row" role="group" aria-label="Policy">{POLICIES.map((p) => <button key={p.id} className={'chip' + (cNeg === p.id ? ' on' : '')} aria-pressed={cNeg === p.id} onClick={() => set({ cNeg: p.id })}>Policy {p.id}</button>)}</div>
          <div className="g2">
            {NEG_WHO.map((who) => (
              <div key={who} className="card">
                <div className="h3">{who}</div>
                <div className="gap g"><b>Strongest case for:</b> {neg.neg[who][0]}</div>
                <div className="gap p"><b>Strongest case against:</b> {neg.neg[who][1]}</div>
              </div>
            ))}
          </div>
          <div className="small muted">No stakeholder holds one fixed view: each can value the benefit and fear the cost.</div>
        </>
      )}

      {stp === 4 && (
        <>
          <h2 className="disp h2">Final vote: should this system ship?</h2>
          <div className="g4" role="group" aria-label="Final vote">
            {FINALS.map((v) => {
              const pct = Math.round(((v[1] + (cFinal === v[0] ? 1 : 0)) / tot) * 100);
              return <button key={v[0]} className={'vote' + (cFinal === v[0] ? ' on' : '')} aria-pressed={cFinal === v[0]} onClick={() => set({ cFinal: v[0] })}><b>{v[0]}</b><span className="bar"><i className="b-o" style={{ width: pct + '%' }} /></span><span className="mono small">{pct}%</span></button>;
            })}
          </div>
          <div className="small muted">Sample results (illustrative, n=100) plus your local vote.</div>
        </>
      )}

      {stp === 5 && (
        <>
          <h2 className="disp h2">How your view moved.</h2>
          <div className="g2">
            <div className="card">
              <div className="eyebrow">Your path</div>
              <div>1. Classified “emotionally vulnerable”: <b>{cls.vuln || 'not answered'}</b></div>
              <div>2. Trap vote: <b>{vote || 'not voted'}</b></div>
              <div>3. Priorities: <b>{cPri.length ? cPri.join(', ') : 'none chosen'}</b></div>
              <div>4. Policy: <b>{pol ? pol.name : 'none chosen'}</b></div>
              <div>5. Final decision: <b>{cFinal || 'not decided'}</b></div>
              <div className={'gap ' + covCls}><b>Policy-to-principle check:</b> {covMsg}</div>
            </div>
            <div className="card">
              <div className="eyebrow">Sample cohort: persona reveal → governance decision (illustrative)</div>
              {BEFORE.map((b, i) => (
                <div key={b[0]}>
                  <div className="small">{b[0]}</div>
                  <div className="row small"><span style={{ width: 60 }}>Before</span><div className="bar" style={{ flex: 1 }}><i className="b-v" style={{ width: b[1] + '%' }} /></div><span className="mono">{b[1]}%</span></div>
                  <div className="row small"><span style={{ width: 60 }}>After</span><div className="bar" style={{ flex: 1 }}><i className="b-o" style={{ width: AFTER[i][1] + '%' }} /></div><span className="mono">{AFTER[i][1]}%</span></div>
                </div>
              ))}
              <div className="small muted">Not real classroom data; no classroom backend exists.</div>
            </div>
          </div>
          <GroupPriorities />
          <div className="card hi"><div className="disp h2">Who deserves an explanation, and when is an explanation simply not enough?</div></div>
        </>
      )}

      <div className="row">
        <button className="btn ghost" onClick={() => set({ cStep: Math.max(1, stp - 1) })} disabled={stp === 1}>Previous step</button>
        <button className="btn pri" onClick={() => set({ cStep: Math.min(5, stp + 1) })} disabled={stp === 5 || !ok}>{nextLabel}</button>
        {!ok && stp === 1 && <span className="small muted">Pick exactly three principles to continue.</span>}
        {!ok && stp === 2 && <span className="small muted">Choose a policy to continue.</span>}
        {!ok && stp === 4 && <span className="small muted">Cast your vote to continue.</span>}
      </div>
    </>
  );
}
