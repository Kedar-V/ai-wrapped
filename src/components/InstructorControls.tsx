import { PERSONAS, PERSONA_IDS } from '../data/personas';
import { SCR, SCREENS } from '../data/scripts';
import { useAppStore } from '../store/useAppStore';
import { StakeholderSwitcher } from './StakeholderSwitcher';

export function InstructorControls() {
  const { screen, from, persona, trapStep, discuss, ans, present, set, go, pickPersona, reset } = useAppStore();
  const showing = screen === 'instructor' ? from : screen;
  const m = SCR[showing];
  const qs = [1, 2, 3, 4, 5, 6, 7];
  const togglePresent = () => {
    const n = !present;
    set({ present: n });
    try {
      if (n && document.documentElement.requestFullscreen) void document.documentElement.requestFullscreen();
      else if (!n && document.fullscreenElement && document.exitFullscreen) void document.exitFullscreen();
    } catch {
      /* optional */
    }
  };
  return (
    <>
      <div className="g2">
        <div className="card">
          <div className="h3">Stage navigation · ≈25 minutes</div>
          {SCREENS.map((k) => (
            <button key={k} className={'chip' + (showing === k ? ' on' : '')} aria-pressed={showing === k} style={{ textAlign: 'left', borderRadius: 12 }} onClick={() => set({ screen: k, from: k })}>
              <b>{SCR[k].label}</b> · {SCR[k].time} min · {SCR[k].q.map((n) => 'Q' + n).join(' ')}
            </button>
          ))}
          <div className="small muted">Current stage: <b>{m.label}</b> · approx. {m.mins} min</div>
        </div>
        <div className="card">
          <div className="h3">Controls</div>
          <div className="small muted">Persona</div>
          <div className="row" role="group" aria-label="Persona">
            {PERSONA_IDS.map((k) => <button key={k} className={'chip' + (persona === k ? ' on' : '')} aria-pressed={persona === k} onClick={() => pickPersona(k)}>{PERSONAS[k].name}</button>)}
          </div>
          <div className="small muted">Stakeholder perspective</div>
          <StakeholderSwitcher jump />
          <div className="small muted">Explanation Trap</div>
          <div className="row">
            <button className="btn pink sm" onClick={() => { pickPersona('A'); set({ screen: 'trap', from: 'trap', trapStep: 1 }); }}>Trigger Explanation Trap</button>
            <button className="btn ghost sm" onClick={() => set({ trapStep: Math.min(6, trapStep + 1) })} disabled={trapStep >= 6}>Reveal next</button>
            <button className="btn ghost sm" onClick={() => set({ trapStep: Math.max(0, trapStep - 1) })} disabled={trapStep === 0}>Hide last</button>
            <span className="small muted">at {trapStep} of 6</span>
          </div>
          <div className="small muted">Classroom</div>
          <div className="row">
            <button className={discuss ? 'btn pink sm' : 'btn ghost sm'} aria-pressed={discuss} onClick={() => set({ discuss: !discuss })}>{discuss ? 'Hide discussion question' : 'Launch discussion question'}</button>
            <button className={ans ? 'btn pink sm' : 'btn ghost sm'} aria-pressed={ans} onClick={() => set({ ans: !ans, discuss: discuss || !ans })}>{ans ? 'Hide example answers' : 'Reveal example answers'}</button>
            <button className="btn alt sm" onClick={togglePresent}>{present ? 'Exit classroom view' : 'Classroom view'}</button>
            <button className="btn ghost sm" onClick={reset}>Reset entire demo</button>
          </div>
          <button className="btn ghost sm" style={{ alignSelf: 'flex-start' }} onClick={() => go(from)}>Return to the experience</button>
        </div>
      </div>
      <div className="g2">
        <div className="card hi">
          <div className="eyebrow">Facilitator script · {m.label}</div>
          <div><b>Demonstrate:</b> {m.demo}</div>
          <div><b>Ask:</b> {m.ask}</div>
          <div><b>Anticipate:</b> {m.expect}</div>
          <div><b>Reveal next:</b> {m.reveal}</div>
          <div><b>Principle illustrated:</b> {m.principle}</div>
        </div>
        <div className="card">
          <div className="h3">Stage → course question map</div>
          <div className="scroll">
            <table className="tbl">
              <thead><tr><th>Stage</th>{qs.map((n) => <th key={n}>Q{n}</th>)}</tr></thead>
              <tbody>
                {SCREENS.map((k) => (
                  <tr key={k}><td>{SCR[k].label}</td>{qs.map((n) => { const on = SCR[k].q.includes(n); return <td key={n} style={{ color: '#1DF08A' }}><span aria-hidden="true">{on ? '●' : '·'}</span><span className="sr">{on ? 'covered' : 'not covered'}</span></td>; })}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
