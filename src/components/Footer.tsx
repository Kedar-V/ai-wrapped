import { SCREENS, activeScript } from '../data/scripts';
import { useAppStore } from '../store/useAppStore';

const X_BACK = { result: 'predict', predict: 'explain', explain: 'pre' } as const;

export function Footer() {
  const { screen, go, reset, cBefore, vote, xStage, set, trapStep, cStep } = useAppStore();
  const idx = SCREENS.indexOf(screen);
  const meta = activeScript(screen, { trapStep, cStep });
  const nextBlocked = (screen === 'baseline' && !cBefore) || (screen === 'trapVote' && !vote);
  const next = () => {
    if (nextBlocked) return;
    if (screen === 'council') reset();
    else go(SCREENS[idx + 1]);
  };
  const back = () => {
    if (screen === 'explain' && xStage !== 'pre') set({ xStage: X_BACK[xStage] });
    else if (idx > 0) go(SCREENS[idx - 1]);
  };
  return (
    <footer className="foot">
      <div>
        <div className="eyebrow" style={{ fontSize: 12 }}>Discussion prompt</div>
        <div className="q">{meta.prompt}</div>
      </div>
      <div className="row">
        <button className="btn ghost" onClick={back} disabled={screen === 'welcome'}>Back</button>
        <button className="btn pri" onClick={next} disabled={nextBlocked}>{meta.next}</button>
        {nextBlocked && (
          <span className="small muted">
            {screen === 'trapVote' ? 'Pick a trap vote to continue.' : 'Cast your before vote to continue.'}
          </span>
        )}
      </div>
    </footer>
  );
}
