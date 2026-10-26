import { WrappedReveal } from '../components/WrappedReveal';
import { useProfile } from '../hooks';

export function WrappedScreen() {
  const { P } = useProfile();
  return (
    <section className="main">
      <div className="eyebrow">Act I · Your Wrapped · {P.name}</div>
      <h2 className="disp h2">Here is your 2026, counted.</h2>
      <WrappedReveal />
    </section>
  );
}
