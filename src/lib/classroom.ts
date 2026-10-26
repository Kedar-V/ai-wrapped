import { PRINCIPLES } from '../data/policies';

/** One student's three chosen principles. Anonymous: a random per-browser id, no name. */
export interface Submission {
  id: string;
  timestamp: string;
  principles: string[];
}

const VALID = new Set(PRINCIPLES.map((p) => p[0]));
export const CSV_HEADER = 'id,timestamp,principle1,principle2,principle3';

export function toCsv(subs: Submission[]): string {
  return [CSV_HEADER, ...subs.map((s) => [s.id, s.timestamp, ...s.principles].join(','))].join('\n') + '\n';
}

/** Parse CSV text. Rows with unknown principles, wrong counts or duplicate principles are ignored. */
export function parseCsv(text: string): Submission[] {
  const out: Submission[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line === CSV_HEADER) continue;
    const [id, timestamp, ...rest] = line.split(',').map((c) => c.trim());
    const principles = rest.filter(Boolean);
    if (!id || principles.length !== 3 || new Set(principles).size !== 3 || !principles.every((p) => VALID.has(p))) continue;
    out.push({ id, timestamp: timestamp || '', principles });
  }
  return out;
}

/** Merge by id; later sources win. */
export function mergeSubmissions(...sources: Submission[][]): Submission[] {
  const m = new Map<string, Submission>();
  for (const src of sources) for (const s of src) m.set(s.id, s);
  return [...m.values()];
}

export interface PrincipleCount {
  name: string;
  count: number;
  pct: number;
}

/** Count of participants choosing each principle, descending. pct is share of participants. */
export function tally(subs: Submission[]): PrincipleCount[] {
  const counts = new Map(PRINCIPLES.map((p) => [p[0], 0]));
  for (const s of subs) for (const p of s.principles) counts.set(p, (counts.get(p) ?? 0) + 1);
  const n = subs.length;
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count, pct: n ? Math.round((count / n) * 100) : 0 }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

// ---- Browser storage (per browser only) ----
const K_ID = 'aiw.id';
const K_MINE = 'aiw.mine';
const K_IMPORTED = 'aiw.imported';

const read = (k: string): string | null => {
  try { return window.localStorage.getItem(k); } catch { return null; }
};
const write = (k: string, v: string | null) => {
  try { if (v === null) window.localStorage.removeItem(k); else window.localStorage.setItem(k, v); } catch { /* storage may be blocked */ }
};

export function myId(): string {
  let id = read(K_ID);
  if (!id) {
    id = Math.random().toString(36).slice(2, 10);
    write(K_ID, id);
  }
  return id;
}

export const loadMine = (): Submission | null => parseCsv(read(K_MINE) ?? '')[0] ?? null;
export const saveMine = (principles: string[]) =>
  write(K_MINE, toCsv([{ id: myId(), timestamp: new Date().toISOString(), principles }]));
export const clearMine = () => write(K_MINE, null);

export const loadImported = (): Submission[] => parseCsv(read(K_IMPORTED) ?? '');
export const saveImported = (subs: Submission[]) => write(K_IMPORTED, toCsv(subs));
export const clearImported = () => write(K_IMPORTED, null);
