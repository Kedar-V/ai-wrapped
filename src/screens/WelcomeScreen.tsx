import { PERSONAS } from '../data/personas';
import { ACTS } from '../data/scripts';
import { useAppStore } from '../store/useAppStore';

export function WelcomeScreen() {
  const roadmap = useAppStore((s) => s.roadmap);
  const set = useAppStore((s) => s.set);
  const go = useAppStore((s) => s.go);
  const A = PERSONAS.A;
  const previews = [
    { cls: 'pv a', delay: '0s', title: 'Minutes listened', big: A.min.toLocaleString('en-US'), sub: 'Your year in sound' },
    { cls: 'pv b', delay: '.6s', title: 'Your AI persona', big: A.name, sub: 'Fun, until you ask how it knows' },
    { cls: 'pv c', delay: '1.2s', title: 'Night owl', big: A.night + '%', sub: 'of your minutes after 10 pm' },
  ];
  return (
    <section className="main">
      <div className="hero">
        <div className="col" style={{ gap: 24 }}>
          <div className="eyebrow">Wavelength presents · a fictional streaming platform</div>
          <h1 className="disp h1">AI Wrapped <span style={{ color: '#1DF08A' }}>2026</span></h1>
          <p className="lead"><em>We know what you listen to. But how much do we think we know about you?</em></p>
          <div className="row">
            <button className="btn pri big" onClick={() => go('wrapped')}>Discover My AI Persona</button>
            <button className="btn ghost big" onClick={() => set({ roadmap: !roadmap })} aria-expanded={roadmap}>Explore the Experience</button>
          </div>
          {roadmap && (
            <div className="card pop">
              <div className="eyebrow">25 minutes · five acts</div>
              {ACTS.map((r) => (
                <div key={r.id} className="row" style={{ justifyContent: 'space-between', gap: 8 }}>
                  <span><b>{r.id} · {r.label}</b></span><span className="muted small">{r.time} · {r.q}</span>
                </div>
              ))}
              <p className="small muted" style={{ margin: 0 }}>All listeners, labels, scores and metrics are fictional and produced by one shared data model.</p>
            </div>
          )}
        </div>
        <div className="col" style={{ gap: 16 }} aria-hidden="true">
          {previews.map((p) => (
            <div key={p.title} className={p.cls} style={{ animationDelay: p.delay }}>
              <div className="pt">{p.title}</div><div className="pb">{p.big}</div><div>{p.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
