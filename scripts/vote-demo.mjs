#!/usr/bin/env node
/**
 * Live-demo helper: local vote server + ngrok HTTPS tunnel.
 * Students use GitHub Pages; only the API runs on your laptop.
 *
 * Requires: ngrok installed and logged in (`ngrok config add-authtoken …`).
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';

const PORT = Number(process.env.PORT || 8787);
const PAGES =
  process.env.PAGES_URL || 'https://kedar-v.github.io/ai-wrapped/';
const NGROK_API = 'http://127.0.0.1:4040/api/tunnels';

function run(cmd, args, opts = {}) {
  const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], ...opts });
  child.stdout.on('data', (d) => process.stdout.write(d));
  child.stderr.on('data', (d) => process.stderr.write(d));
  return child;
}

async function waitForHealth(ms = 15_000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/health`);
      if (r.ok) return;
    } catch { /* not up yet */ }
    await sleep(200);
  }
  throw new Error(`Vote server did not become healthy on :${PORT}`);
}

async function waitForNgrokUrl(ms = 30_000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    try {
      const r = await fetch(NGROK_API);
      if (r.ok) {
        const data = await r.json();
        const https = (data.tunnels || []).find(
          (t) => t.public_url?.startsWith('https://') && t.config?.addr?.includes(String(PORT)),
        ) || (data.tunnels || []).find((t) => t.public_url?.startsWith('https://'));
        if (https?.public_url) return https.public_url.replace(/\/$/, '');
      }
    } catch { /* ngrok API not up */ }
    await sleep(400);
  }
  throw new Error('ngrok tunnel URL not found. Is ngrok installed and authenticated?');
}

const kids = [];
function killAll() {
  for (const c of kids) {
    try { c.kill('SIGTERM'); } catch { /* gone */ }
  }
}
process.on('SIGINT', () => { killAll(); process.exit(0); });
process.on('SIGTERM', () => { killAll(); process.exit(0); });

const server = run(process.execPath, ['index.js'], {
  cwd: fileURLToPath(new URL('../server/', import.meta.url)),
  env: { ...process.env, PORT: String(PORT), CORS_ORIGIN: '*' },
});
kids.push(server);

try {
  await waitForHealth();
} catch (e) {
  console.error(e.message);
  killAll();
  process.exit(1);
}

const ngrok = run('ngrok', ['http', String(PORT), '--log=stdout']);
kids.push(ngrok);
ngrok.on('error', (err) => {
  console.error(`\nFailed to start ngrok (${err.message}).`);
  console.error('Install: https://ngrok.com/download  then: ngrok config add-authtoken <token>\n');
  killAll();
  process.exit(1);
});

let publicUrl;
try {
  publicUrl = await waitForNgrokUrl();
} catch (e) {
  console.error('\n' + e.message);
  console.error('Install ngrok and run: ngrok config add-authtoken <token>\n');
  killAll();
  process.exit(1);
}

const share = `${PAGES.replace(/\/?$/, '/')}?voteApi=${encodeURIComponent(publicUrl)}#/council`;

console.log(`
┌─────────────────────────────────────────────────────────────
│  Vote API (local):  http://127.0.0.1:${PORT}
│  Vote API (public): ${publicUrl}
│
│  Share this with the class (GitHub Pages + your tunnel):
│  ${share}
│
│  Instructor: open the link → Start poll. Class joins automatically.
│  Keep this process running until the demo ends. Ctrl+C to stop.
└─────────────────────────────────────────────────────────────
`);

await new Promise(() => {});
