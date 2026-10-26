/**
 * Tiny in-memory voting API for the Ethics Council.
 *
 * POST   /rooms                 → start poll; body { password, kind?: 'principles'|'final' }
 * GET    /active?kind=          → { code, open, kind } for that kind, or 404
 * GET    /rooms/:code           → snapshot
 * POST   /rooms/:code/votes     → principles: { principles, defenses } | final: { choice }
 * GET    /rooms/:code/stream    → SSE snapshots
 * POST   /rooms/:code/stop|clear
 * GET    /health
 *
 * Starting/resetting a poll needs POLL_PASSWORD.
 */
import http from 'node:http';
import {
  parseDefenses,
  parseFinalChoice,
  parsePrinciples,
  snapshotRoom,
} from './tally.js';

const PORT = Number(process.env.PORT || 8787);
const CORS = process.env.CORS_ORIGIN || '*';
const POLL_PASSWORD = String(process.env.POLL_PASSWORD || '');
const ROOM_TTL_MS = Number(process.env.ROOM_TTL_MS || 6 * 60 * 60 * 1000);
const CORS_HEADERS = 'Content-Type, ngrok-skip-browser-warning';

/** @typedef {{ kind: 'principles'|'final'; open: boolean; votes: any[]; clients: Set<import('node:http').ServerResponse>; created: number }} Room */

/** @type {Map<string, Room>} */
const rooms = new Map();
/** @type {Record<'principles'|'final', string|null>} */
const active = { principles: null, final: null };

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function makeCode() {
  let c = '';
  for (let i = 0; i < 4; i++) c += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return c;
}

function room(code) {
  return rooms.get(String(code || '').toUpperCase());
}

function ensureRoom(code) {
  const r = room(code);
  if (!r) return null;
  r.created = Date.now();
  return r;
}

function parseKind(v) {
  return v === 'final' ? 'final' : 'principles';
}

function prune() {
  const now = Date.now();
  for (const [k, r] of rooms) {
    if (now - r.created > ROOM_TTL_MS) {
      for (const res of r.clients) res.end();
      rooms.delete(k);
      if (active[r.kind] === k) active[r.kind] = null;
    }
  }
}
setInterval(prune, 60_000).unref();

function sendJson(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': CORS,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': CORS_HEADERS,
    'Cache-Control': 'no-store',
  });
  res.end(data);
}

function broadcast(r) {
  const payload = `data: ${JSON.stringify(snapshotRoom(r))}\n\n`;
  for (const res of r.clients) {
    try { res.write(payload); } catch { /* client gone */ }
  }
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { return null; }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const path = url.pathname.replace(/\/+$/, '') || '/';

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': CORS,
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': CORS_HEADERS,
      'Access-Control-Max-Age': '86400',
    });
    return res.end();
  }

  if (req.method === 'GET' && path === '/health') {
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === 'GET' && path === '/active') {
    prune();
    const kind = parseKind(url.searchParams.get('kind'));
    const code = active[kind];
    const r = code ? room(code) : null;
    if (!r || !r.open) return sendJson(res, 404, { error: 'no active poll' });
    return sendJson(res, 200, { code, open: true, kind, votes: r.votes.length });
  }

  if (req.method === 'POST' && path === '/rooms') {
    if (!POLL_PASSWORD) {
      return sendJson(res, 503, { error: 'POLL_PASSWORD is not set on the vote server' });
    }
    const body = await readBody(req);
    if (body === null) return sendJson(res, 400, { error: 'invalid json' });
    if (String(body.password || '') !== POLL_PASSWORD) {
      return sendJson(res, 403, { error: 'wrong instructor password' });
    }
    const kind = parseKind(body.kind);
    prune();
    let code = makeCode();
    while (rooms.has(code)) code = makeCode();
    rooms.set(code, { kind, open: true, votes: [], clients: new Set(), created: Date.now() });
    active[kind] = code;
    return sendJson(res, 201, { code, open: true, kind, votes: 0 });
  }

  const m = path.match(/^\/rooms\/([A-Za-z0-9]{4})(?:\/(votes|stream|stop|clear))?$/);
  if (!m) return sendJson(res, 404, { error: 'not found' });
  const code = m[1].toUpperCase();
  const action = m[2] || '';
  const r = ensureRoom(code);
  if (!r) return sendJson(res, 404, { error: 'room not found' });

  if (req.method === 'GET' && !action) {
    return sendJson(res, 200, snapshotRoom(r));
  }

  if (req.method === 'GET' && action === 'stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': CORS,
    });
    res.write(`data: ${JSON.stringify(snapshotRoom(r))}\n\n`);
    r.clients.add(res);
    const ping = setInterval(() => {
      try { res.write(': ping\n\n'); } catch { /* closed */ }
    }, 15000);
    req.on('close', () => {
      clearInterval(ping);
      r.clients.delete(res);
    });
    return;
  }

  if (req.method === 'POST' && action === 'votes') {
    if (!r.open) return sendJson(res, 409, { error: 'voting is closed' });
    const body = await readBody(req);
    if (body === null) return sendJson(res, 400, { error: 'invalid json' });

    if (r.kind === 'final') {
      const choice = parseFinalChoice(body.choice);
      if (!choice) return sendJson(res, 400, { error: 'need one valid final choice' });
      r.votes.push({ choice, at: new Date().toISOString() });
    } else {
      const principles = parsePrinciples(body.principles);
      if (!principles) return sendJson(res, 400, { error: 'need exactly 3 distinct known principles' });
      const defenses = parseDefenses(body.defenses, principles);
      r.votes.push({ principles, defenses, at: new Date().toISOString() });
    }
    const snap = snapshotRoom(r);
    broadcast(r);
    return sendJson(res, 201, snap);
  }

  if (req.method === 'POST' && action === 'stop') {
    r.open = false;
    if (active[r.kind] === code) active[r.kind] = null;
    broadcast(r);
    return sendJson(res, 200, snapshotRoom(r));
  }

  if (req.method === 'POST' && action === 'clear') {
    r.votes = [];
    broadcast(r);
    return sendJson(res, 200, snapshotRoom(r));
  }

  return sendJson(res, 404, { error: 'not found' });
});

server.listen(PORT, () => {
  console.log(`AI Wrapped vote server on http://localhost:${PORT}`);
  if (!POLL_PASSWORD) console.warn('POLL_PASSWORD unset — Start/New poll will fail until it is set.');
});
