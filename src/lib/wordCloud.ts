/** Tiny stop list so the cloud surfaces content words from defense sentences. */
const STOP = new Set(`
a an the and or but if in on at to for of as is are was were be been being
it this that these those with from by not no so than then too very can could
should would will just also about into over after before when what which who
whom whose why how all any each few more most other some such only own same
than too very s t don isn aren wasn weren i me my we our you your they them
their he she his her its that matter matters most case cases because
`.trim().split(/\s+/));

export interface CloudWord {
  text: string;
  weight: number;
}

/** Tokenize defense blurbs into weighted words for a simple cloud. */
export function wordsFromDefenses(texts: string[], limit = 48): CloudWord[] {
  const counts = new Map<string, number>();
  for (const raw of texts) {
    const parts = raw.toLowerCase().match(/[a-z][a-z'-]{2,}/g) || [];
    for (const w of parts) {
      if (STOP.has(w)) continue;
      counts.set(w, (counts.get(w) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([text, weight]) => ({ text, weight }))
    .sort((a, b) => b.weight - a.weight || a.text.localeCompare(b.text))
    .slice(0, limit);
}
