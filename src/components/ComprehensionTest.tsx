import { TH } from '../data/model';
import { useProfile } from '../hooks';
import { scoreOf } from '../lib/scoring';
import { useAppStore } from '../store/useAppStore';
import { ConfidenceInput } from './ConfidenceInput';

const pts = (r: number) => (Math.round(r * 10) / 10).toFixed(1);

export function ComprehensionPredict() {
  const { F } = useProfile();
  const { pred, act, conf0, conf1, set } = useAppStore();
  const opts: [typeof pred, string][] = [['yes', 'Yes, the label stays'], ['no', 'No, the label goes away'], ['unsure', 'Cannot tell from the explanation']];
  const acts: [typeof act, string][] = [['a', 'Change my listening habits so the label goes away'], ['b', 'Challenge the rule: its weights and threshold have no validation behind them'], ['c', 'Report a bug in the scoring code']];
  return (
    <div className="card hi pop">
      <div className="eyebrow">Step 3 · Predict the model</div>
      <div className="disp h2">If nighttime listening drops from {F.night}% to 15%, will the model still infer emotional vulnerability?</div>
      <div className="row" role="group" aria-label="Prediction">
        {opts.map(([v, l]) => <button key={v} className={'chip' + (pred === v ? ' on' : '')} aria-pressed={pred === v} onClick={() => set({ pred: v })}>{l}</button>)}
      </div>
      <div className="h3" id="actq">Which is the most actionable issue this explanation reveals?</div>
      <div className="col" role="group" aria-labelledby="actq">
        {acts.map(([v, l]) => <button key={v} className={'vote' + (act === v ? ' on' : '')} aria-pressed={act === v} onClick={() => set({ act: v })}>{l}</button>)}
      </div>
      <ConfidenceInput id="c1" label="Confidence that you now understand the inference" value={conf1} onChange={(v) => set({ conf1: v })} lo={`Before: ${conf0}`} hi="After" />
      <button className="btn pri" style={{ alignSelf: 'flex-start' }} disabled={!(pred !== '' && act !== '')} onClick={() => set({ xStage: 'result' })}>Run the model</button>
    </div>
  );
}

export function ComprehensionResult() {
  const { F, B, score } = useProfile();
  const { pred, act, conf0, conf1, set } = useAppStore();
  const B1 = scoreOf({ ...F, night: 15 });
  const score1 = Math.round(B1.total);
  const predOk = pred !== '' && (pred === 'yes') === B1.flag;
  const actOk = act === 'b';
  const nb = B.c[0].pts, na = B1.c[0].pts, rest = B.total - nb;
  const up = conf1 > conf0;
  let msg: string, cls: string;
  if (up && (!predOk || !actOk)) { msg = 'Your confidence rose but your demonstrated understanding did not match it. The explanation raised perceived understanding more than actual understanding.'; cls = 'p'; }
  else if (predOk && actOk) { msg = 'Confidence and performance line up here: you predicted the model and spotted the real issue, which is the rule, not your habits.'; cls = 'g'; }
  else { msg = 'Mixed result: part of your understanding held up. Use the gap to ask what the explanation did and did not prove.'; cls = 'd'; }
  const good = '#1DF08A', bad = '#FF4F7A';
  return (
    <div className="g2">
      <div className="card pop">
        <div className="eyebrow">Actual model output (same rule, night = 15%)</div>
        <div className="row"><div><div className="small muted">Before</div><div className="stat">{score}</div></div><span className="arrow" aria-hidden="true">→</span><div><div className="small muted">After</div><div className="stat" style={{ color: '#FF8A1F' }}>{score1}</div></div></div>
        <div className="bar"><i className="b-o" style={{ width: score1 + '%' }} /></div>
        <div className={B1.flag ? 'gap p' : 'gap g'}><b>{B1.flag ? `Still labeled: ${score1} ≥ ${TH}` : `Label removed: ${score1} < ${TH}`}</b></div>
        <div className="small">Night listening contributes {pts(nb)} points before and {pts(na)} after. The other three features still contribute {pts(rest)} points, {B1.flag ? 'enough to stay at or above the threshold. The rule is a weighted sum, so one feature does not decide it.' : 'which is not enough to reach the threshold.'}</div>
      </div>
      <div className="card">
        <div className="eyebrow">Perceived vs demonstrated understanding</div>
        <div className="g2" style={{ gap: 12 }}>
          <div><div className="small muted">Confidence before → after</div><div className="stat" style={{ fontSize: 40 }}>{conf0} → {conf1}</div></div>
          <div><div className="small muted">Prediction correct?</div><div className="stat" style={{ fontSize: 40, color: predOk ? good : bad }}>{predOk ? 'Correct' : 'Incorrect'}</div></div>
          <div><div className="small muted">Found the actionable issue?</div><div className="stat" style={{ fontSize: 40, color: actOk ? good : bad }}>{actOk ? 'Yes' : 'No'}</div></div>
        </div>
        <div className={'gap ' + cls}>{msg}</div>
        <div className="small muted">Confidence is a feeling. The prediction and the actionable issue are the evidence. They can diverge.</div>
        <button className="btn ghost sm" style={{ alignSelf: 'flex-start' }} onClick={() => set({ xStage: 'pre', pred: '', act: '', conf0: 50, conf1: 50 })}>Run the experiment again</button>
      </div>
    </div>
  );
}
