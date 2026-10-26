import { PersonaSelector } from '../components/PersonaSelector';
import { useProfile } from '../hooks';
import { useAppStore } from '../store/useAppStore';

export function PersonaScreen() {
  const { P } = useProfile();
  const go = useAppStore((s) => s.go);
  return (
    <section className="main">
      <div className="eyebrow">Act I · Select persona</div>
      <h2 className="disp h2">Whose year do you want to unwrap?</h2>
      <p className="lead">Choose a listener. Every screen after this is derived from their listening data, one shared model, no hardcoded one-offs.</p>
      <PersonaSelector />
      <div className="row"><button className="btn pri" onClick={() => go('wrapped')}>Reveal my Wrapped</button><span className="muted">Selected: <b>{P.name}</b></span></div>
    </section>
  );
}
