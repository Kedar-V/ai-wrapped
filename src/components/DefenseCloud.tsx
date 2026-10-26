import { wordsFromDefenses } from '../lib/wordCloud';

const COLORS = ['#1DF08A', '#FF8A1F', '#A78BFA', '#FF4FA3', '#F6F1FF', '#FF4F7A'];

/** Frequency word cloud from live defense sentences — no chart library. */
export function DefenseCloud({ texts }: { texts: string[] }) {
  const words = wordsFromDefenses(texts);
  if (!words.length) {
    return (
      <div className="cloud" aria-live="polite">
        <span className="small muted">Word cloud fills in as people submit their “why” sentences.</span>
      </div>
    );
  }
  const max = words[0]?.weight || 1;
  return (
    <div className="cloud" role="img" aria-label="Word cloud of defense reasons">
      {words.map((w, i) => {
        const t = 0.55 + (w.weight / max) * 0.45;
        const size = 12 + Math.round((w.weight / max) * 28);
        return (
          <span
            key={w.text}
            className="cloud-w"
            style={{
              fontSize: size,
              color: COLORS[i % COLORS.length],
              opacity: t,
              transform: `rotate(${((i * 37) % 11) - 5}deg)`,
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
}
