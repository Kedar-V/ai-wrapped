import { SCR } from '../data/scripts';
import { useAppStore } from '../store/useAppStore';

export function DiscussionBanner() {
  const { screen, from, discuss, ans } = useAppStore();
  if (!discuss) return null;
  const meta = SCR[screen];
  const shown = SCR[screen === 'instructor' ? from : screen];
  return (
    <div className="disc" style={{ marginTop: 20 }}>
      <div className="eyebrow">Discussion question · launched from Instructor mode</div>
      <div className="disp h2">{meta.prompt}</div>
      {ans && <p className="lead" style={{ color: '#2A0618' }}>Example answers: {shown.expect}</p>}
    </div>
  );
}
