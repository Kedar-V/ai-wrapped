import { ComprehensionPredict, ComprehensionResult } from '../components/ComprehensionTest';
import { ConfidenceInput } from '../components/ConfidenceInput';
import { ExplanationViewer } from '../components/ExplanationViewer';
import { FlagGate } from '../components/FlagGate';
import { useProfile } from '../hooks';
import { useAppStore } from '../store/useAppStore';

export function ExplainScreen() {
  const { flagged } = useProfile();
  const { xStage, conf0, set } = useAppStore();
  return (
    <section className="main">
      <div className="eyebrow">Act II · Explain my profile · 4 min · Q2 · Q5</div>
      <h2 className="disp h2">Potentially emotionally vulnerable. Why?</h2>
      {!flagged && <FlagGate />}

      {xStage === 'pre' && (
        <div className="card hi pop">
          <div className="eyebrow">Step 1 · Before any explanation</div>
          <div className="disp h2">“Potentially Emotionally Vulnerable”</div>
          <p className="lead">{flagged ? 'Your profile now carries this label. Before we explain it, we ask what you think you know.' : 'Your profile is not flagged by this rule, but the same rule runs on every listener. We will explain how it would evaluate you.'}</p>
          <ConfidenceInput id="c0" label="How confident are you that you understand why this inference was produced?" value={conf0} onChange={(v) => set({ conf0: v })} />
          <button className="btn pri" style={{ alignSelf: 'flex-start' }} onClick={() => set({ xStage: 'explain', conf1: conf0 })}>Show me the explanation</button>
        </div>
      )}

      {xStage === 'explain' && (
        <>
          <ExplanationViewer />
          <div className="row"><button className="btn pri" onClick={() => set({ xStage: 'predict' })}>I have studied it · test my understanding</button></div>
        </>
      )}
      {xStage === 'predict' && <ComprehensionPredict />}
      {xStage === 'result' && <ComprehensionResult />}
    </section>
  );
}
