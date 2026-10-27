import { Fragment } from 'react';
import {
  NEG_LEAN,
  NEG_WHO,
  NEG_WHY,
  POLICIES,
  PRINCIPLES,
  bestFor,
  leanMeta,
  leanTally,
  type NegWho,
  type PolicyId,
} from '../data/policies';
import { useAppStore } from '../store/useAppStore';
import { BeforeAfterBars } from './BeforeAfterBars';
import { FinalVotePoll } from './FinalVotePoll';
import { GroupPriorities } from './GroupPriorities';

const STEPS = ['1 Principles', '2 Policy', '3 Negotiation', '4 Final vote', '5 Before and after'] as const;

export function EthicsCouncil() {
  const { cStep: stp, cPri, cDef, cPol, cNegSel, cFinal, cBefore, cls, vote, pollLocked, set } = useAppStore();
  const pol = POLICIES.find((p) => p.id === cPol);
  const sel = cNegSel ?? { who: 'Listener' as NegWho, pid: 'B' as PolicyId };
  const selPol = POLICIES.find((p) => p.id === sel.pid)!;
  const selLean = leanMeta(NEG_LEAN[sel.pid][sel.who]);
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
              <button
                key={p.id}
                className={'vote' + (cPol === p.id ? ' on' : '')}
                aria-pressed={cPol === p.id}
                onClick={() => set({ cPol: p.id, cNeg: p.id, cNegSel: { who: bestFor(p.id), pid: p.id } })}
              >
                <b style={{ fontSize: 20 }}>{p.name}</b>
                <span>{p.desc}</span>
                <span className="small muted">Rooted in three principles:</span>
                {p.sup.map((name, i) => (
                  <span key={name} className="small">
                    <b>{name}</b> <span className="mono" style={{ color: '#1DF08A' }}>✓</span>
                    <br />
                    <span className="muted">{p.why[i]}</span>
                  </span>
                ))}
              </button>
            ))}
          </div>
        </>
      )}

      {stp === 3 && (
        <>
          <h2 className="disp h2">Who gains and who pays under each policy?</h2>
          <p className="lead">Each policy is built to serve one stakeholder best and costs the others. Tap any cell to hear that stakeholder’s case.</p>
          <div className="row small" style={{ flexWrap: 'wrap', gap: 10 }}>
            <span className="tag t-low">▲ Helps</span><span className="muted">good for them</span>
            <span className="tag t-med">◆ Trade-off</span><span className="muted">gains and loses</span>
            <span className="tag t-high">▼ Hurts</span><span className="muted">worse off · illustrative judgments, not scores</span>
          </div>
          <div className="scroll">
            <div className="hgrid" role="grid" aria-label="Policy impact by stakeholder">
              <div />
              {POLICIES.map((p) => (
                <div key={p.id} className="hhead" style={cPol === p.id ? { background: 'rgba(29,240,138,.12)' } : undefined}>
                  <b>{p.short}</b>
                  <span style={{ color: '#1DF08A' }}>★ Best for {bestFor(p.id)}</span>
                  {cPol === p.id && <span style={{ color: '#1DF08A' }}>← your pick</span>}
                </div>
              ))}
              {NEG_WHO.map((who) => (
                <Fragment key={who}>
                  <div className="hrow">{who}</div>
                  {POLICIES.map((p) => {
                    const L = leanMeta(NEG_LEAN[p.id][who]);
                    const on = sel.who === who && sel.pid === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        className={'hcell ' + L.k + (on ? ' sel' : '')}
                        onClick={() => set({ cNegSel: { who, pid: p.id }, cNeg: p.id })}
                      >
                        <b>{L.label}</b>
                        <span className="small">{NEG_WHY[p.id][who]}</span>
                      </button>
                    );
                  })}
                </Fragment>
              ))}
              <div className="hrow" style={{ color: '#C4B5E3' }}>Tally ▲ ◆ ▼</div>
              {POLICIES.map((p) => {
                const t = leanTally(p.id);
                return <div key={p.id} className="hsum">▲ {t.H} · ◆ {t.T} · ▼ {t.X}</div>;
              })}
            </div>
          </div>
          <div className="card pop" style={{ borderColor: '#1DF08A' }}>
            <div className="eyebrow">Selected</div>
            <div className="h3">{sel.who} under {selPol.short}</div>
            <span className={'tag ' + selLean.tag} style={{ alignSelf: 'flex-start' }}>{selLean.label}</span>
            <div className="gap g"><b>The case for</b> {selPol.neg[sel.who][0]}</div>
            <div className="gap p"><b>The case against</b> {selPol.neg[sel.who][1]}</div>
          </div>
          <div className="small muted">Every policy has exactly one clear winner, and no policy wins for everyone. Choosing a policy means choosing who bears the cost.</div>
        </>
      )}

      {stp === 4 && (
        <>
          <h2 className="disp h2">Final vote: should this system ship?</h2>
          <FinalVotePoll />
        </>
      )}

      {stp === 5 && (
        <>
          <h2 className="disp h2">How your view moved.</h2>
          <div className="g2">
            <div className="card">
              <div className="eyebrow">Your path</div>
              <div>1. Before (gut check): <b>{cBefore || 'not voted'}</b></div>
              <div>2. Classified “emotionally vulnerable”: <b>{cls.vuln || 'not answered'}</b></div>
              <div>3. Trap vote: <b>{vote || 'not voted'}</b></div>
              <div>4. Priorities: <b>{cPri.length ? cPri.join(', ') : 'none chosen'}</b></div>
              <div>5. Policy: <b>{pol ? pol.name : 'none chosen'}</b></div>
              <div>6. Final decision: <b>{cFinal || 'not decided'}</b></div>
              {cBefore && cFinal && (
                <div className="gap g">
                  {cBefore === cFinal
                    ? 'Your before and after votes match.'
                    : `You moved: ${cBefore} → ${cFinal}.`}
                </div>
              )}
              <div className={'gap ' + covCls}><b>Policy-to-principle check:</b> {covMsg}</div>
            </div>
            <BeforeAfterBars />
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
