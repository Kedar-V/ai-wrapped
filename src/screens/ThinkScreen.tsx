import { InferenceCard } from '../components/InferenceCard';
import { useProfile } from '../hooks';
import { useAppStore } from '../store/useAppStore';

export function ThinkScreen() {
  const { P, score } = useProfile();
  const cls = useAppStore((s) => s.cls);
  const n = P.infs.filter((i) => cls[i.id]).length;
  return (
    <section className="main">
      <div className="eyebrow">Act I · What the AI thinks it knows</div>
      <h2 className="disp h2">Four things we now believe about you.</h2>
      <p className="lead">Which of these assumptions should the platform be allowed to make? Classify each. Your answers stay in this prototype only.</p>
      <div className="g2">{P.infs.map((i) => <InferenceCard key={i.id} inf={i} score={score} />)}</div>
      <div className="small muted">{n} of 4 classified · sample cohort bars are labeled, illustrative values, not real classroom votes.</div>
    </section>
  );
}
