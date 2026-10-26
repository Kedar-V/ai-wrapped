export interface LiveTallyRow {
  name: string;
  count: number;
  pct: number;
}

export interface LiveSnapshot {
  open: boolean;
  votes: number;
  tally: LiveTallyRow[];
}

const DEFAULT = 'http://localhost:8787';

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

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(voteApiBase() + path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  const body = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
  return body;
}

export const createRoom = () => json<{ code: string }>('/rooms', { method: 'POST' });
export const getRoom = (code: string) => json<LiveSnapshot>(`/rooms/${code.toUpperCase()}`);
export const postVote = (code: string, principles: string[]) =>
  json<LiveSnapshot>(`/rooms/${code.toUpperCase()}/votes`, {
    method: 'POST',
    body: JSON.stringify({ principles }),
  });
export const stopRoom = (code: string) =>
  json<LiveSnapshot>(`/rooms/${code.toUpperCase()}/stop`, { method: 'POST' });
export const clearRoom = (code: string) =>
  json<LiveSnapshot>(`/rooms/${code.toUpperCase()}/clear`, { method: 'POST' });

/** Subscribe to live room updates. Returns an unsubscribe function. */
export function streamRoom(code: string, onSnap: (s: LiveSnapshot) => void, onErr?: (e: Error) => void): () => void {
  const es = new EventSource(`${voteApiBase()}/rooms/${code.toUpperCase()}/stream`);
  es.onmessage = (ev) => {
    try { onSnap(JSON.parse(ev.data) as LiveSnapshot); }
    catch (e) { onErr?.(e instanceof Error ? e : new Error(String(e))); }
  };
  es.onerror = () => onErr?.(new Error('Live connection lost. Is the vote server running?'));
  return () => es.close();
}
