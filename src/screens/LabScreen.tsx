import { AuditorDashboard } from '../components/AuditorDashboard';
import { EngineerDashboard } from '../components/EngineerDashboard';
import { ExecutiveDashboard } from '../components/ExecutiveDashboard';
import { ListenerDashboard } from '../components/ListenerDashboard';
import { StakeholderSwitcher } from '../components/StakeholderSwitcher';
import { STK } from '../data/stakeholders';
import { useAppStore } from '../store/useAppStore';

export function LabScreen() {
  const stk = useAppStore((s) => s.stk);
  const s = STK.find((x) => x.id === stk)!;
  return (
    <section className="main">
      <div className="eyebrow">Act III · Stakeholder Lab · 6 min · Q1 · Q2 · Q3</div>
      <h2 className="disp h2">One profile. Four people. Four different truths.</h2>
      <StakeholderSwitcher />
      <div className="card" style={{ borderColor: s.col }}><div className="eyebrow">{s.role}</div><div className="disp h2">{s.head}</div></div>
      {stk === 'listener' && <ListenerDashboard />}
      {stk === 'engineer' && <EngineerDashboard />}
      {stk === 'executive' && <ExecutiveDashboard />}
      {stk === 'auditor' && <AuditorDashboard />}
    </section>
  );
}
