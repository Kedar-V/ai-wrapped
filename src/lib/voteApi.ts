export interface LiveTallyRow {
  name: string;
  count: number;
  pct: number;
}

export interface LiveDefense {
  principle: string;
  text: string;
}

export interface LiveSnapshot {
  open: boolean;
  votes: number;
  tally: LiveTallyRow[];
  defenses?: LiveDefense[];
}

const DEFAULT = 'http://localhost:8787';
const ROOM_KEY = 'aiw.voteRoom';
const VOTED_KEY = 'aiw.votedCode';

export function readVotedCode(): string | null {
  try { return sessionStorage.getItem(VOTED_KEY); } catch { return null; }
}

export function writeVotedCode(code: string | null) {
  try {
    if (code) sessionStorage.setItem(VOTED_KEY, code);
    else sessionStorage.removeItem(VOTED_KEY);
  } catch { /* ignore */ }
}

export function voteApiBase(): string {
  const fromEnv = (import.meta.env.VITE_VOTE_API as string | undefined)?.replace(/\/$/, '');
  try {
    return (fromEnv || window.localStorage.getItem('aiw.voteApi') || DEFAULT).replace(/\/$/, '');
  } catch {
    return fromEnv || DEFAULT;
  }
}

export function setVoteApiBase(url: string) {
  try { window.localStorage.setItem('aiw.voteApi', url.replace(/\/$/, '')); } catch { /* ignore */ }
}

/** Read ?voteApi=&room= from the Pages URL (and hash query). Call once at boot. */
export function applyVoteApiFromLocation(
  search = typeof window !== 'undefined' ? window.location.search : '',
  hash = typeof window !== 'undefined' ? window.location.hash : '',
): { api?: string; room?: string } {
  const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const qi = hash.indexOf('?');
  if (qi >= 0) {
    const hq = new URLSearchParams(hash.slice(qi + 1));
    for (const [k, v] of hq) if (!q.has(k)) q.set(k, v);
  }
  const api = (q.get('voteApi') || q.get('api') || '').trim();
  const room = (q.get('room') || '').trim().toUpperCase();
  if (api) setVoteApiBase(api);
  if (room.length === 4) {
    try { sessionStorage.setItem(ROOM_KEY, room); } catch { /* ignore */ }
  }
  return { api: api || undefined, room: room.length === 4 ? room : undefined };
}

export function takePendingRoom(): string | null {
  try {
    const r = sessionStorage.getItem(ROOM_KEY);
    if (r) sessionStorage.removeItem(ROOM_KEY);
    return r;
  } catch {
    return null;
  }
}

/** Class join link for GitHub Pages + ngrok (or any public vote API). */
export function classJoinUrl(code?: string): string {
  const base = `${window.location.origin}${window.location.pathname}`;
  const q = new URLSearchParams({ voteApi: voteApiBase() });
  if (code) q.set('room', code.toUpperCase());
  return `${base}?${q}#/council`;
}

function isNgrok(url: string) {
  return /\.ngrok(?:-free)?\.(?:app|dev|io)\b/i.test(url);
}

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const base = voteApiBase();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  };
  // Free ngrok shows an interstitial unless this header is set.
  if (isNgrok(base)) headers['ngrok-skip-browser-warning'] = '1';
  const res = await fetch(base + path, { ...init, headers });
  const body = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
  return body;
}

export const createRoom = () => json<{ code: string }>('/rooms', { method: 'POST' });
export const getActiveRoom = () => json<{ code: string; open: boolean }>('/active');
export const getRoom = (code: string) => json<LiveSnapshot>(`/rooms/${code.toUpperCase()}`);
export const postVote = (code: string, principles: string[], defenses?: Record<string, string>) =>
  json<LiveSnapshot>(`/rooms/${code.toUpperCase()}/votes`, {
    method: 'POST',
    body: JSON.stringify({ principles, defenses: defenses || {} }),
  });
export const stopRoom = (code: string) =>
  json<LiveSnapshot>(`/rooms/${code.toUpperCase()}/stop`, { method: 'POST' });
export const clearRoom = (code: string) =>
  json<LiveSnapshot>(`/rooms/${code.toUpperCase()}/clear`, { method: 'POST' });

/** Subscribe to live room updates. Returns an unsubscribe function. */
export function streamRoom(code: string, onSnap: (s: LiveSnapshot) => void, onErr?: (e: Error) => void): () => void {
  const base = voteApiBase();
  const url = new URL(`${base}/rooms/${code.toUpperCase()}/stream`);
  // EventSource cannot set headers; query param skips free-ngrok interstitial.
  if (isNgrok(base)) url.searchParams.set('ngrok-skip-browser-warning', '1');
  const es = new EventSource(url.toString());
  es.onmessage = (ev) => {
    try { onSnap(JSON.parse(ev.data) as LiveSnapshot); }
    catch (e) { onErr?.(e instanceof Error ? e : new Error(String(e))); }
  };
  es.onerror = () => onErr?.(new Error('Live connection lost. Is the vote server / ngrok tunnel running?'));
  return () => es.close();
}
