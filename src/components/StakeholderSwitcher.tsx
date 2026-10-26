import { STK } from '../data/stakeholders';
import { useAppStore } from '../store/useAppStore';

export function StakeholderSwitcher({ jump = false }: { jump?: boolean }) {
  const stk = useAppStore((s) => s.stk);
  const set = useAppStore((s) => s.set);
  const go = useAppStore((s) => s.go);
  return (
    <div className="row" role="group" aria-label="Stakeholder perspective">
      {STK.map((x) => (
        <button key={x.id} className={'chip' + (stk === x.id ? ' on' : '')} aria-pressed={stk === x.id} onClick={() => { set({ stk: x.id }); if (jump) go('lab'); }}>{x.label}</button>
      ))}
    </div>
  );
}
