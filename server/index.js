/**
 * Tiny in-memory voting API for the Ethics Council.
 *
 * POST   /rooms                 → { code, open: true }   start a session (becomes active)
 * GET    /active                → { code, open }         latest open poll, or 404
 * GET    /rooms/:code           → { open, votes, tally }
 * POST   /rooms/:code/votes     → body { principles: [a,b,c] }; appends (duplicates ok)
 * GET    /rooms/:code/stream    → Server-Sent Events of the same snapshot
 * POST   /rooms/:code/stop      → closes the room (votes still readable)
 * POST   /rooms/:code/clear     → empties votes, keeps the room open
 * GET    /health                → { ok: true }
 *
 * No auth, no persistence. Fine for a classroom of ~8. Set CORS_ORIGIN or leave * .
 */
import http from 'node:http';
import { parsePrinciples, snapshot } from './tally.js';

const PORT = Number(process.env.PORT || 8787);
const CORS = process.env.CORS_ORIGIN || '*';
const ROOM_TTL_MS = Number(process.env.ROOM_TTL_MS || 6 * 60 * 60 * 1000);
const CORS_HEADERS = 'Content-Type, ngrok-skip-browser-warning';

/** @typedef {{ open: boolean; votes: { principles: string[]; at: string }[]; clients: Set<import('node:http').ServerResponse>; created: number }} Room */

/** @type {Map<string, Room>} */
const rooms = new Map();
/** @type {string | null} */
let activeCode = null;

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

function prune() {
  const now = Date.now();
  for (const [k, r] of rooms) {
    if (now - r.created > ROOM_TTL_MS) {
      for (const res of r.clients) res.end();
      rooms.delete(k);
      if (activeCode === k) activeCode = null;
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
  const payload = `data: ${JSON.stringify(snapshot(r.votes, r.open))}\n\n`;
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
    const r = activeCode ? room(activeCode) : null;
    if (!r || !r.open) return sendJson(res, 404, { error: 'no active poll' });
    return sendJson(res, 200, { code: activeCode, open: true, votes: r.votes.length });
  }

  // Start poll
  if (req.method === 'POST' && path === '/rooms') {
    prune();
    let code = makeCode();
    while (rooms.has(code)) code = makeCode();
    rooms.set(code, { open: true, votes: [], clients: new Set(), created: Date.now() });
    activeCode = code;
    return sendJson(res, 201, { code, open: true, votes: 0 });
  }

  const m = path.match(/^\/rooms\/([A-Za-z0-9]{4})(?:\/(votes|stream|stop|clear))?$/);
  if (!m) return sendJson(res, 404, { error: 'not found' });
  const code = m[1].toUpperCase();
  const action = m[2] || '';
  const r = ensureRoom(code);
  if (!r) return sendJson(res, 404, { error: 'room not found' });

  if (req.method === 'GET' && !action) {
    return sendJson(res, 200, snapshot(r.votes, r.open));
  }

  if (req.method === 'GET' && action === 'stream') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': CORS,
    });
    res.write(`data: ${JSON.stringify(snapshot(r.votes, r.open))}\n\n`);
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
    const principles = parsePrinciples(body.principles);
    if (!principles) return sendJson(res, 400, { error: 'need exactly 3 distinct known principles' });
    r.votes.push({ principles, at: new Date().toISOString() });
    const snap = snapshot(r.votes, r.open);
    broadcast(r);
    return sendJson(res, 201, snap);
  }

  if (req.method === 'POST' && action === 'stop') {
    r.open = false;
    if (activeCode === code) activeCode = null;
    broadcast(r);
    return sendJson(res, 200, snapshot(r.votes, r.open));
  }

  if (req.method === 'POST' && action === 'clear') {
    r.votes = [];
    broadcast(r);
    return sendJson(res, 200, snapshot(r.votes, r.open));
  }

  return sendJson(res, 404, { error: 'not found' });
});

server.listen(PORT, () => {
  console.log(`AI Wrapped vote server on http://localhost:${PORT}`);
});
