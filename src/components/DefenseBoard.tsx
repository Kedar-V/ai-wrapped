import type { LiveDefense } from '../lib/voteApi';

/** Live quote board: full defense sentences grouped by principle. */
export function DefenseBoard({ defenses }: { defenses: LiveDefense[] }) {
  if (!defenses.length) {
    return (
      <div className="defense-board empty" aria-live="polite">
        <span className="small muted">Reasons appear here as people submit — full sentences, not single words.</span>
      </div>
    );
  }

  const byPrinciple = new Map<string, string[]>();
  for (const d of defenses) {
    const list = byPrinciple.get(d.principle) || [];
    list.push(d.text);
    byPrinciple.set(d.principle, list);
  }

  // Principles with the most quotes first (matches what the room is arguing for)
  const groups = [...byPrinciple.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));

  return (
    <div className="defense-board" aria-label="Defense reasons from the room" aria-live="polite">
      {groups.map(([principle, quotes]) => (
        <section key={principle} className="defense-group">
          <div className="defense-group-h">
            <b>{principle}</b>
            <span className="mono small">{quotes.length}</span>
          </div>
          <ul className="defense-quotes">
            {quotes.map((text, i) => (
              <li key={i} className="defense-quote">“{text}”</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
