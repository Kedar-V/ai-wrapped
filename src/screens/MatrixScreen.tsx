import { AccessMatrix } from '../components/AccessMatrix';

export function MatrixScreen() {
  return (
    <section className="main">
      <div className="eyebrow">Act III · Cross-stakeholder view · Q1 · Q3</div>
      <h2 className="disp h2">One Profile. Four Stakeholders. Different Explanations.</h2>
      <AccessMatrix />
    </section>
  );
}
