import { PRINCIPLES, VALID } from './principles.js';

/**
 * Validate a vote: exactly three distinct known principles.
 * @param {unknown} principles
 * @returns {string[] | null}
 */
export function parsePrinciples(principles) {
  if (!Array.isArray(principles) || principles.length !== 3) return null;
  const cleaned = principles.map((p) => String(p).trim());
  if (new Set(cleaned).size !== 3) return null;
  if (!cleaned.every((p) => VALID.has(p))) return null;
  return cleaned;
}

/**
 * Keep defense text for the three chosen principles only; trim, cap length.
 * @param {unknown} defenses
 * @param {string[]} principles
 * @returns {Record<string, string>}
 */
export function parseDefenses(defenses, principles) {
  /** @type {Record<string, string>} */
  const out = {};
  if (!defenses || typeof defenses !== 'object' || Array.isArray(defenses)) return out;
  for (const p of principles) {
    const raw = /** @type {Record<string, unknown>} */ (defenses)[p];
    if (typeof raw !== 'string') continue;
    const t = raw.trim().slice(0, 280);
    if (t) out[p] = t;
  }
  return out;
}

/**
 * Count principle mentions across all votes. Duplicates are intentional:
 * every vote adds +1 for each of its three principles.
 * @param {{ principles: string[] }[]} votes
 */
export function tallyVotes(votes) {
  const counts = Object.fromEntries(PRINCIPLES.map((p) => [p, 0]));
  for (const v of votes) {
    for (const p of v.principles) {
      if (p in counts) counts[p] += 1;
    }
  }
  const n = votes.length;
  return PRINCIPLES.map((name) => ({
    name,
    count: counts[name],
    pct: n ? Math.round((counts[name] / n) * 100) : 0,
  })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** @param {{ principles: string[]; defenses?: Record<string, string> }[]} votes */
export function snapshot(votes, open) {
  return {
    open: !!open,
    votes: votes.length,
    tally: tallyVotes(votes),
    defenses: votes.flatMap((v) =>
      Object.entries(v.defenses || {}).map(([principle, text]) => ({ principle, text })),
    ),
  };
}
