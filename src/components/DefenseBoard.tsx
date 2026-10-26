import type { LiveDefense, LiveTallyRow } from '../lib/voteApi';

/** Live quote board: full defense sentences grouped by principle. */
export function DefenseBoard({
  defenses,
  tally = [],
}: {
  defenses: LiveDefense[];
  /** Sort groups by poll vote count (same order as the bars). */
  tally?: LiveTallyRow[];
}) {
  if (!defenses.length) {
    return (
      <div className="defense-board empty" aria-live="polite">
        <span className="small muted">Reasons appear here as people submit — full sentences, not single words.</span>
      </div>
    );
  }

  const votes = new Map(tally.map((r) => [r.name, r.count]));
  const byPrinciple = new Map<string, string[]>();
  for (const d of defenses) {
    const list = byPrinciple.get(d.principle) || [];
    list.push(d.text);
    byPrinciple.set(d.principle, list);
  }

  const groups = [...byPrinciple.entries()].sort(
    (a, b) => (votes.get(b[0]) || 0) - (votes.get(a[0]) || 0) || a[0].localeCompare(b[0]),
  );

  return (
    <div className="defense-board" aria-label="Defense reasons from the room" aria-live="polite">
      {groups.map(([principle, quotes]) => (
        <section key={principle} className="defense-group">
          <div className="defense-group-h">
            <b>{principle}</b>
            <span className="mono small">{votes.get(principle) || 0} votes · {quotes.length} reason{quotes.length === 1 ? '' : 's'}</span>
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
