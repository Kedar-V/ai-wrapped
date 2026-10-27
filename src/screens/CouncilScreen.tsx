import { EthicsCouncil } from '../components/EthicsCouncil';
import { COUNCIL_TABS } from '../data/scripts';
import { useAppStore } from '../store/useAppStore';

export function CouncilScreen() {
  const cStep = useAppStore((s) => s.cStep);
  const tab = COUNCIL_TABS[Math.min(5, Math.max(1, cStep)) as 1 | 2 | 3 | 4 | 5];
  return (
    <section className="main">
      <div className="eyebrow" style={{ color: '#FFB46B' }}>Act V · Ethics Council · 7 min · {tab.q.map((n) => 'Q' + n).join(' · ')}</div>
      <EthicsCouncil />
    </section>
  );
}
