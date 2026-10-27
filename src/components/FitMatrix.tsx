import { useState } from 'react';
import { FIT_LABELS, FORMATS, STK } from '../data/stakeholders';
import { useAppStore } from '../store/useAppStore';

const ALPHA = [0.05, 0.16, 0.32, 0.56];
const dots = (n: number) => '●'.repeat(n) + '○'.repeat(3 - n);

/** Explanation formats × stakeholders in one heatmap; details for the picked format sit underneath. */
export function FitMatrix() {
  const { xStk, set } = useAppStore();
  const [sel, setSel] = useState(3);
  const stk = STK.find((x) => x.id === xStk)!;
  const f = FORMATS[sel];
  const spread = FORMATS.map((x) => Math.max(...x.fit) - Math.min(...x.fit));
  const widest = spread.indexOf(Math.max(...spread));
  const cols = `minmax(170px,1.5fr) repeat(${STK.length}, minmax(96px,1fr))`;

  return (
    <div className="card pop">
      <div className="eyebrow">Q2 · who needs which explanation · more detail is not always better</div>
      <div className="small muted">Read across a row to see who a format serves. Read down a column to see what one stakeholder needs. Tap a stakeholder or a format for details.</div>

      <div className="scroll">
        <div role="table" aria-label="Explanation format fit by stakeholder" style={{ display: 'grid', gridTemplateColumns: cols, gap: 6, minWidth: 620 }}>
          <div />
          {STK.map((x) => (
            <button
              key={x.id}
              className={'chip' + (xStk === x.id ? ' on' : '')}
              style={{ borderColor: x.col, justifyContent: 'center', borderRadius: 12 }}
              aria-pressed={xStk === x.id}
              onClick={() => set({ xStk: x.id })}
            >
              {x.label}
            </button>
          ))}

          {FORMATS.map((fm, r) => (
            <div key={fm.f} style={{ display: 'contents' }}>
              <button
                className={'chip' + (sel === r ? ' on' : '')}
                style={{ textAlign: 'left', borderRadius: 12, justifyContent: 'flex-start' }}
                aria-pressed={sel === r}
                onClick={() => setSel(r)}
              >
                <b>{fm.f}</b>
              </button>
              {STK.map((x, c) => {
                const v = fm.fit[c];
                return (
                  <button
                    key={x.id}
                    className="cellb"
                    style={{
                      background: `${x.col}${Math.round(ALPHA[v] * 255).toString(16).padStart(2, '0')}`,
                      borderColor: xStk === x.id ? x.col : 'rgba(255,255,255,.14)',
                      color: '#F6F1FF',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                    }}
                    aria-label={`${fm.f} for ${x.label}: ${FIT_LABELS[v]}`}
                    onClick={() => { set({ xStk: x.id }); setSel(r); }}
                  >
                    <span className="mono" style={{ color: x.col }} aria-hidden="true">{dots(v)}</span>
                    <span className="small">{FIT_LABELS[v]}</span>
                  </button>
                );
              })}
            </div>
          ))}

          <div className="small muted" style={{ alignSelf: 'center' }}>Best fit for</div>
          {STK.map((x, c) => (
            <div key={x.id} className="small" style={{ textAlign: 'center' }}>
              {FORMATS.map((fm) => (fm.fit[c] === 3 ? fm.f.split(' · ')[0] : '')).filter(Boolean).join(' · ') || 'none'}
            </div>
          ))}
        </div>
      </div>

      <div className="g2">
        <div className="gap g"><b>{stk.label} needs:</b> {stk.need}</div>
        <div className="gap d"><b>Biggest disagreement:</b> {FORMATS[widest].f} is rated from “{FIT_LABELS[Math.min(...FORMATS[widest].fit)]}” to “{FIT_LABELS[Math.max(...FORMATS[widest].fit)]}” depending on who reads it.</div>
      </div>

      <div className="card" style={{ borderColor: '#A78BFA' }}>
        <div className="h3">{f.f}</div>
        <div className="g2" style={{ gap: 12 }}>
          <div><div className="small muted">Reveals</div>{f.rev}</div>
          <div><div className="small muted">Does not reveal</div>{f.hide}</div>
          <div><div className="small muted">Supports action?</div>{f.act}</div>
          <div><div className="small muted">Fit for {stk.label}</div><span className="mono" style={{ color: stk.col }} aria-hidden="true">{dots(f.fit[STK.indexOf(stk)])}</span> {FIT_LABELS[f.fit[STK.indexOf(stk)]]}</div>
        </div>
      </div>
    </div>
  );
}
