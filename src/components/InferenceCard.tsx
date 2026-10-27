import { CLS_DIST, CLS_NAMES } from '../data/policies';
import type { Inference } from '../data/personas';
import { useAppStore } from '../store/useAppStore';

export function InferenceCard({ inf, score }: { inf: Inference; score: number }) {
  const cls = useAppStore((s) => s.cls);
  const set = useAppStore((s) => s.set);
  const go = useAppStore((s) => s.go);
  const v = cls[inf.id];
  const isV = inf.id === 'vuln';
  const conf = isV ? score : (inf.conf as number);
  const d = CLS_DIST[inf.sens];
  const sensCls = inf.sens === 'Low' ? 't-low' : inf.sens === 'Medium' ? 't-med' : 't-high';
  return (
    <div className={'card' + (isV ? ' bad' : '')}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="h3">{inf.name}</span>
        <span className={sensCls + ' tag'}>Sensitivity: {inf.sens}</span>
      </div>
      <div><span className="tag t-spec">Speculative</span> {inf.short}</div>
      <div className="small muted"><span className="tag t-obs">Observed</span> {inf.obs}</div>
      <div>
        <div className="row small" style={{ justifyContent: 'space-between' }}><span>Heuristic score (not a calibrated probability)</span><span className="mono">{conf}/100</span></div>
        <div className="bar"><i className="b-o" style={{ width: conf + '%' }} /></div>
      </div>
      <div className="row" role="group" aria-label={`Classify: ${inf.name}`}>
        {CLS_NAMES.map((x) => (
          <button key={x} className={'chip' + (v === x ? ' on' : '')} aria-pressed={v === x} onClick={() => set({ cls: { ...cls, [inf.id]: x } })}>{x}</button>
        ))}
      </div>
      {v && <div className="small muted pop">Sample cohort (illustrative, n=100): <b>{CLS_NAMES.map((x, j) => `${x} ${d[j]}%`).join(' · ')}</b></div>}
      <button className="btn ghost sm" style={{ alignSelf: 'flex-start' }} onClick={() => go('baseline')}>Request explanation</button>
    </div>
  );
}
