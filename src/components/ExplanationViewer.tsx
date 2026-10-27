import { FD, FE, FL, REF, W } from '../data/model';
import { useProfile } from '../hooks';
import { useAppStore } from '../store/useAppStore';
import { DataLineageGraph } from './DataLineageGraph';
import { FitMatrix } from './FitMatrix';

const pts = (r: number) => (Math.round(r * 10) / 10).toFixed(1);

const RULE_TEXT = [
  ...FE.map((k, i) => `${'nlrp'[i]} = min(${['night_pct', 'lowenergy_pct', 'romantic_playlist_pct', 'repeat_pct'][i]} / ${REF[k]}, 1)`), '',
  `score = 100 x (${FE.map((k, i) => `${W[k].toFixed(2)}*${'nlrp'[i]}`).join(' + ')})`, '',
  'IF score >= 70 THEN', '  label   = "Potentially Emotionally Vulnerable"', '  segment = "Evening Reflective · Wellness"  (exported)', '  weights chosen by hand; no clinical validation',
].join('\n');

const LEVELS: [1 | 2 | 3 | 4, string][] = [[1, '1 · Plain language'], [2, '2 · Evidence'], [3, '3 · Technical'], [4, '4 · Full transparency']];

export function ExplanationViewer() {
  const { F, B, score, thr } = useProfile();
  const { xMode, level, featSel, set } = useAppStore();
  const fc = B.c.find((c) => c.k === featSel)!;
  return (
    <>
      <div className="row">
        <button className={'chip' + (xMode === 'levels' ? ' on' : '')} aria-pressed={xMode === 'levels'} onClick={() => set({ xMode: 'levels' })}>Explanation levels</button>
        <button className={'chip' + (xMode === 'compare' ? ' on' : '')} aria-pressed={xMode === 'compare'} onClick={() => set({ xMode: 'compare' })}>Compare formats by stakeholder</button>
      </div>

      {xMode === 'levels' && (
        <>
          <div className="row" role="group" aria-label="Explanation level">
            {LEVELS.map(([n, label]) => (
              <button key={n} className={'chip' + (level === n ? ' on' : '')} aria-pressed={level === n} onClick={() => set({ level: n })}>{label}</button>
            ))}
          </div>

          {level === 1 && (
            <div className="g2">
              <div className="card pop"><div className="eyebrow">Level 1 · plain language</div><div className="disp h2">“You frequently listen to low-energy music late at night, which contributed to this classification.”</div></div>
              <div className="card">
                <div className="h3">What this explains</div><div>An association between your listening and a label. Your numbers: {F.night}% night, {F.low}% low-energy.</div>
                <div className="h3">What it does not explain</div><div>It says nothing about your actual emotional state. It names a correlation the platform chose to treat as a conclusion.</div>
              </div>
            </div>
          )}

          {level === 2 && (
            <div className="g2">
              <div className="card pop">
                <div className="eyebrow">Level 2 · supporting evidence (tap a feature)</div>
                <div className="g2" style={{ gap: 12 }}>
                  {FE.map((k) => (
                    <button key={k} className={'ftile' + (featSel === k ? ' on' : '')} aria-pressed={featSel === k} onClick={() => set({ featSel: k })}>
                      <span className="small muted">{FL[k]}</span><span className="stat" style={{ fontSize: 36 }}>{F[k]}%</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="h3">{FL[featSel]}</div>
                <div><span className="tag t-obs">Observed</span> <b>Definition:</b> {FD[featSel]}</div>
                <div><b>Raw value:</b> {F[featSel]}%</div>
                <div><b>Normalized for the rule:</b> {fc.norm.toFixed(2)} of 1.00</div>
                <div><b>Points contributed:</b> {pts(fc.pts)} of {(W[featSel] * 100).toFixed(0)} possible</div>
                <div className="small muted">Observed behavior is accurate. Whether it signals vulnerability is a separate question (<span className="tag t-spec">Speculative</span>).</div>
              </div>
            </div>
          )}

          {level === 3 && (
            <div className="card pop">
              <div className="eyebrow">Level 3 · technical explanation</div>
              <div className="scroll">
                <table className="tbl">
                  <thead><tr><th>Input</th><th>Raw</th><th>Transform</th><th>Normalized</th><th>Weight</th><th>Points</th><th style={{ minWidth: 160 }}>Contribution</th></tr></thead>
                  <tbody>
                    {B.c.map((c) => (
                      <tr key={c.k}>
                        <td>{FL[c.k]}</td><td className="mono">{c.raw}%</td><td className="mono">min(x/{REF[c.k]}, 1)</td><td className="mono">{c.norm.toFixed(2)}</td><td className="mono">x{W[c.k].toFixed(2)}</td><td className="mono">{pts(c.pts)}</td>
                        <td><div className="bar"><i className="b-o" style={{ width: Math.round((c.pts / 35) * 100) + '%' }} /></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="row"><span className="stat" style={{ fontSize: 44, color: '#1DF08A' }}>{score}</span><span>total score vs decision threshold <b>{thr}</b> → <b>{B.flag ? 'label applied' : 'no label'}</b></span></div>
            </div>
          )}

          {level === 4 && (
            <div className="g2">
              <div className="card pop"><div className="eyebrow">Level 4 · the complete rule (fully understandable)</div><pre className="code" style={{ margin: 0 }}>{RULE_TEXT}</pre></div>
              <div className="card">
                <div className="h3">Data lineage</div>
                <DataLineageGraph vertical label="Data lineage" nodes={['Player events', 'Feature extraction (nightly)', 'Scoring rule', 'Profile label', 'Segment export → ad platform'].map((t) => ({ t, cls: 'ok' as const }))} />
                <div className="h3">Intended use</div><div>Content personalization and wellness-category ad targeting.</div>
                <div className="h3">Known limitations</div>
                {['No clinical or empirical validation of the weights or threshold', 'Weights set by hand from product intuition', 'Confounds: shift work, genre taste, playlists made for others, time zone', 'No labeled ground truth exists to test accuracy'].map((l) => <div key={l} className="small">• {l}</div>)}
                <div className="h3">Downstream recipients</div>
                {['Recommendation engine', 'Ad platform segment “Evening Reflective · Wellness”', 'Calm Harbor wellness subscription campaign (fictional)'].map((l) => <div key={l} className="small">→ {l}</div>)}
              </div>
            </div>
          )}
        </>
      )}

      {xMode === 'compare' && <FitMatrix />}
    </>
  );
}
