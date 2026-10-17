#!/usr/bin/env node
// JARVIS desktop app: a tiny local server (127.0.0.1 only) that runs Claude Code
// headless in the JARVIS folder and serves the app window. No dependencies; Node 18+.
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
const prompts = require('./prompts');

const PORT = Number(process.env.JARVIS_PORT || 4777);
const HOST = '127.0.0.1';
const JARVIS_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const STATE_FILE = path.join(DATA_DIR, 'state.json');
const CLAUDE_BIN = process.env.JARVIS_CLAUDE_BIN || findClaude();
const JOB_TIMEOUT_MS = 8 * 60 * 1000;
const TOKEN = crypto.randomBytes(16).toString('hex');

// Connector tools. Claude Code names claude.ai connectors mcp__claude_ai_<Name>__<tool>.
// Read + draft is allowed; anything that sends, forwards, deletes, trashes or shares is denied
// (deny rules win over allow rules).
const ALLOWED_TOOLS = ['mcp__claude_ai_Gmail', 'mcp__claude_ai_Google_Drive'];
const DISALLOWED_TOOLS = [
  'send_message', 'forward', 'reply', 'trash_message', 'trash_thread', 'delete_draft',
  'delete_label', 'mark_message_spam', 'mark_thread_spam', 'apply_sensitive_message_label',
  'apply_sensitive_thread_label',
].map((t) => 'mcp__claude_ai_Gmail__' + t).concat(
  ['trash_file', 'share_file', 'update_file', 'create_file', 'copy_file']
    .map((t) => 'mcp__claude_ai_Google_Drive__' + t),
  ['Bash', 'Write', 'Edit', 'NotebookEdit', 'WebFetch', 'WebSearch'],
);

fs.mkdirSync(DATA_DIR, { recursive: true });

function findClaude() {
  const home = process.env.HOME || '';
  const candidates = ['/usr/local/bin/claude', '/opt/homebrew/bin/claude',
    path.join(home, '.local/bin/claude'), path.join(home, '.claude/local/claude')];
  return candidates.find((p) => { try { fs.accessSync(p, fs.constants.X_OK); return true; } catch (e) { return false; } }) || 'claude';
}

// ---------- state ----------
function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch (e) { return {}; }
}
let state = loadState(); // { today: {data, at}, bookings: {data, at}, settings: {voice} }
state.settings = Object.assign({ voice: true }, state.settings);
// Start date: JARVIS ignores email before this. Defaults to the day the app was first used.
if (!/^\d{4}-\d{2}-\d{2}$/.test(String(state.settings.since || ''))) {
  state.settings.since = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
}
state.dismissed = state.dismissed || {}; // key -> { at, label }
(function prune() { // forget dismissals after 30 days
  const cutoff = Date.now() - 30 * 24 * 3600 * 1000;
  for (const k of Object.keys(state.dismissed)) if (state.dismissed[k].at < cutoff) delete state.dismissed[k];
})();
function saveState() {
  fs.writeFileSync(STATE_FILE + '.tmp', JSON.stringify(state, null, 2));
  fs.renameSync(STATE_FILE + '.tmp', STATE_FILE);
}

// ---------- jobs ----------
const jobs = new Map(); // id -> job
const running = new Map(); // kind -> job id (one at a time per kind)

function friendlyStep(name, input) {
  const tool = String(name || '').replace(/^mcp__[^_]+(?:_[^_]+)*?__/, '');
  input = input || {};
  const q = input.query ? String(input.query) : '';
  if (/search_threads/.test(tool)) {
    const label = (q.match(/label:\s*"?([^"\s)]+)/i) || [])[1];
    if (label) return 'Checking ' + label.replace(/-/g, ' ').replace(/^OB /, 'OB/');
    if (/newer_than:1d|after:/i.test(q)) return 'Checking the last 24 hours';
    if (/deadline|renew|expir|due|closing/i.test(q)) return 'Looking for deadlines';
    if (/clubspark|booking/i.test(q)) return 'Finding booking confirmations';
    return 'Searching Gmail';
  }
  if (/get_thread|get_message/.test(tool)) return 'Reading a thread';
  if (/list_drafts|get_draft/.test(tool)) return 'Looking through your drafts';
  if (/create_draft|update_draft/.test(tool)) return 'Writing the draft';
  if (/list_labels/.test(tool)) return 'Checking your labels';
  if (/search_files/.test(tool)) return 'Finding the playbook on Drive';
  if (/read_file_content|download_file/.test(tool)) return 'Reading the playbook';
  if (tool === 'Agent' || tool === 'Task') return 'Delegating the legwork';
  if (tool === 'Read' || tool === 'Grep' || tool === 'Glob') return 'Reading notes';
  return 'Working';
}

function extractJson(text) {
  if (!text) return null;
  const cleaned = String(text).replace(/```(?:json)?/g, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try { return JSON.parse(cleaned.slice(start, end + 1)); } catch (e) { return null; }
}

function speak(text, force) {
  if ((!state.settings.voice && !force) || !text) return;
  const sentence = String(text).replace(/[*_`#>|]/g, '').replace(/\s+/g, ' ').trim()
    .replace(/^(.*?[.!?])(\s.*)?$/, '$1').slice(0, 220);
  const say = fs.existsSync('/usr/bin/say') ? '/usr/bin/say' : 'say';
  const run = (args, onFail) => {
    let err = '';
    let p;
    try { p = spawn(say, args, { stdio: ['ignore', 'ignore', 'pipe'] }); } catch (e) { console.error('voice: ' + e.message); return; }
    p.stderr.on('data', (c) => { err += c; });
    p.on('error', (e) => console.error('voice: cannot run say (' + e.message + ')'));
    p.on('close', (code) => { if (code) { console.error('voice: say exited ' + code + ' ' + err.trim()); if (onFail) onFail(); } });
  };
  // Try the British voice first; if it isn't installed, use the Mac's default voice.
  run(['-v', process.env.JARVIS_VOICE_NAME || 'Daniel', sentence], () => run([sentence]));
}

function claudeEnv() {
  const binDir = path.dirname(process.execPath);
  return Object.assign({}, process.env, {
    PATH: [binDir, '/usr/local/bin', '/opt/homebrew/bin', process.env.PATH || '/usr/bin:/bin'].join(':'),
    DISABLE_AUTOUPDATER: '1',
    JARVIS_VOICE: 'off', // the app speaks for itself; keep the Stop hook quiet
  });
}

// ---------- connection check ----------
// Starts Claude Code, reads the start-up line that lists each connector's status, then stops it
// before it asks the model anything (so it costs nothing). Also keeps the sign-in fresh.
const NEEDED = [{ key: 'gmail', label: 'Gmail', match: /gmail/i }, { key: 'drive', label: 'Google Drive', match: /google drive|drive/i }];
let health = null; // { at, ok, login, servers: [{name,status}], problems: [..] }
let healthRun = null;
function checkHealth(force) {
  if (!force && health && Date.now() - health.at < 2 * 60 * 1000) return Promise.resolve(health);
  if (healthRun) return healthRun;
  healthRun = new Promise((resolve) => {
    let child; let buf = ''; let out = ''; let done = false;
    const finishHealth = (h) => {
      if (done) return; done = true;
      clearTimeout(timer);
      try { child && child.kill('SIGTERM'); } catch (e) {}
      health = Object.assign({ at: Date.now() }, h);
      healthRun = null;
      resolve(health);
    };
    const timer = setTimeout(() => finishHealth({ ok: false, servers: [], problems: ['Claude Code took too long to start.'], login: false }), 45000);
    try {
      child = spawn(CLAUDE_BIN, ['-p', '--output-format', 'stream-json', '--verbose', '--max-turns', '1'], { cwd: JARVIS_DIR, env: claudeEnv() });
    } catch (e) { return finishHealth({ ok: false, servers: [], problems: ['Claude Code could not start: ' + e.message], login: false }); }
    child.on('error', (e) => finishHealth({ ok: false, servers: [], login: false,
      problems: [e.code === 'ENOENT' ? 'Claude Code was not found at ' + CLAUDE_BIN + '.' : 'Claude Code could not start: ' + e.message] }));
    child.stdin.end('Reply with OK.');
    const onText = (chunk) => {
      const t = chunk.toString('utf8'); out += t; if (out.length > 20000) out = out.slice(-20000);
      buf += t;
      let nl;
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl).trim(); buf = buf.slice(nl + 1);
        let ev; try { ev = JSON.parse(line); } catch (e) { continue; }
        if (ev.type === 'system' && ev.subtype === 'init') {
          const servers = (ev.mcp_servers || []).map((m) => ({ name: m.name, status: m.status }));
          const problems = [];
          for (const n of NEEDED) {
            const sv = servers.find((m) => n.match.test(m.name || ''));
            if (!sv) problems.push(n.label + ' isn’t connected to Claude.');
            else if (sv.status !== 'connected') problems.push(n.label + (/auth/i.test(sv.status) ? ' needs you to sign in again.' : ' isn’t working (' + sv.status + ').'));
          }
          return finishHealth({ ok: !problems.length, servers, problems, login: false });
        }
      }
    };
    child.stdout.on('data', onText);
    child.stderr.on('data', onText);
    child.on('close', () => {
      const login = /401|invalid api key|oauth|log ?in|authenticat/i.test(out);
      finishHealth({ ok: false, servers: [], login, problems: [login ? 'Claude Code needs you to log in again.' : 'Claude Code stopped before connecting: ' + out.trim().split('\n').slice(-2).join(' ').slice(0, 300)] });
    });
  });
  return healthRun;
}
// Check every 30 minutes while JARVIS is running; starting Claude Code keeps its sign-in fresh.
setInterval(() => { checkHealth(true).catch(() => {}); }, 30 * 60 * 1000);

// Opens Terminal in the JARVIS folder with Claude Code ready to reconnect (a .command file needs no extra permissions).
function openFixTerminal() {
  const file = path.join(DATA_DIR, 'Reconnect JARVIS.command');
  const q = (x) => "'" + String(x).replace(/'/g, "'\\''") + "'";
  fs.writeFileSync(file, '#!/bin/bash\ncd ' + q(JARVIS_DIR) + '\nclear\n' +
    'echo "JARVIS reconnect: type /mcp, choose claude.ai Gmail (and Google Drive) and pick Authenticate."\n' +
    'echo "If Claude asks you to log in, type /login and choose your claude.ai account. Then type /exit."\necho\n' +
    q(CLAUDE_BIN) + '\n', { mode: 0o755 });
  const p = spawn('open', ['-a', 'Terminal', file], { stdio: 'ignore', detached: true });
  p.on('error', () => {}); p.unref();
  health = null; // re-check after the fix
}

function startJob(kind, params, onDone) {
  if (kind === 'today') return startToday();
  if (running.has(kind)) return jobs.get(running.get(kind));
  const prompt = prompts.build(kind, Object.assign({}, params || {}, /^today:/.test(kind) ? { dismissed: state.dismissed, since: state.settings.since } : {}));
  if (!prompt) throw new Error('Unknown job: ' + kind);
  const id = crypto.randomBytes(6).toString('hex');
  const job = { id, kind, status: 'running', steps: [], startedAt: Date.now(), result: null, data: null, error: null, log: [], stderr: '', onDone };
  jobs.set(id, job);
  running.set(kind, id);

  const env = claudeEnv();
  const args = ['-p', '--output-format', 'stream-json', '--verbose',
    '--allowedTools', ALLOWED_TOOLS.join(','), '--disallowedTools', DISALLOWED_TOOLS.join(',')];
  let child;
  try {
    child = spawn(CLAUDE_BIN, args, { cwd: JARVIS_DIR, env });
  } catch (e) {
    finish(job, 'Could not start Claude Code: ' + e.message);
    return job;
  }
  job.child = child;
  child.stdin.end(prompt);

  let buf = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => {
    buf += chunk.toString('utf8');
    let nl;
    while ((nl = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (line) handleEvent(job, line);
    }
  });
  child.stderr.on('data', (c) => { stderr += c.toString('utf8'); if (stderr.length > 8000) stderr = stderr.slice(-8000); job.stderr = stderr; });
  child.on('error', (e) => finish(job, e.code === 'ENOENT'
    ? 'Claude Code was not found at ' + CLAUDE_BIN + '. Rebuild Jarvis.app or set JARVIS_CLAUDE_BIN.'
    : 'Claude Code failed to start: ' + e.message));
  child.on('close', (code) => {
    if (buf.trim()) handleEvent(job, buf.trim());
    if (job.status === 'running') {
      const hint = /login|auth|401/i.test(stderr) ? ' Open Terminal, run `claude`, then type /login.' : '';
      finish(job, (stderr.trim().split('\n').slice(-3).join(' ') || 'Claude Code stopped (exit ' + code + ').') + hint);
    }
  });
  job.timer = setTimeout(() => {
    if (job.status === 'running') { try { child.kill('SIGTERM'); } catch (e) {} finish(job, 'That took too long, so I stopped it. Try again in a moment.'); }
  }, JOB_TIMEOUT_MS);
  return job;
}

function handleEvent(job, line) {
  job.log.push(line.length > 2000 ? line.slice(0, 2000) + '…' : line);
  if (job.log.length > 200) job.log.shift();
  let ev;
  try { ev = JSON.parse(line); } catch (e) { return; }
  if (ev.type === 'assistant' && ev.message && Array.isArray(ev.message.content)) {
    for (const c of ev.message.content) {
      if (c.type === 'text' && c.text) job.lastText = String(c.text).slice(0, 400);
      if (c.type === 'tool_use') {
        const label = friendlyStep(c.name, c.input);
        const last = job.steps[job.steps.length - 1];
        if (!last || last.label !== label) job.steps.push({ label, at: Date.now() });
        else last.count = (last.count || 1) + 1;
      }
    }
  } else if (ev.type === 'result') {
    if (ev.is_error || (ev.subtype && ev.subtype !== 'success')) {
      // Say what actually went wrong: errors, blocked tools, or the last thing Claude said.
      const parts = [];
      if (ev.result) parts.push(String(ev.result));
      if (Array.isArray(ev.errors) && ev.errors.length) parts.push(ev.errors.map(String).join(' | '));
      const denied = Array.isArray(ev.permission_denials) ? ev.permission_denials.map((d) => d && d.tool_name).filter(Boolean) : [];
      if (denied.length) parts.push('Blocked tools: ' + Array.from(new Set(denied)).join(', '));
      if (ev.subtype === 'error_max_turns') parts.push('It ran out of steps.');
      if (!parts.length && job.lastText) parts.push('Last message: ' + job.lastText);
      finish(job, 'Claude Code stopped (' + ev.subtype + '). ' + (parts.join(' ') || 'No details given.'));
    } else {
      finish(job, null, ev.result || '');
    }
  }
}

function finish(job, error, resultText) {
  if (job.status !== 'running') return;
  clearTimeout(job.timer);
  running.delete(job.kind);
  job.finishedAt = Date.now();
  if (error) {
    job.status = 'error'; job.error = String(error).slice(0, 900);
    const logText = 'JARVIS ' + job.kind + ' job ' + new Date().toISOString() + '\nERROR: ' + job.error +
      '\n\n--- stderr ---\n' + (job.stderr || '') + '\n--- stream (last lines) ---\n' + job.log.join('\n');
    try { fs.writeFileSync(path.join(DATA_DIR, 'last-error.log'), logText); } catch (e) {}
    job.raw = ((job.stderr || '').trim() + '\n' + job.log.slice(-4).join('\n')).trim().slice(-3000) + '\n\n(Full log: app/data/last-error.log in the JARVIS folder)';
    if (job.onDone) job.onDone(job);
    return;
  }
  job.result = resultText;
  if (job.kind === 'ask') {
    job.data = { text: resultText };
  } else {
    job.data = extractJson(resultText);
    if (job.data && job.data.error) { // Claude couldn't reach Gmail/Drive: never treat that as "nothing to do"
      job.status = 'error';
      job.error = (/gmail|drive|connector|unavailable/i.test(job.data.error + ' ' + (job.data.detail || '')) ? 'Gmail or Drive isn’t connected. ' : '') + String(job.data.detail || job.data.error).slice(0, 300);
      job.data = null;
      health = null; // re-check the connection
      if (job.onDone) job.onDone(job);
      return;
    }
    if (!job.data) {
      job.status = 'error'; job.error = 'JARVIS replied in an unexpected format.'; job.raw = String(resultText).slice(0, 4000);
      if (job.onDone) job.onDone(job);
      return;
    }
  }
  job.status = 'done';
  if (job.onDone) job.onDone(job);
  if (job.kind === 'today' || job.kind === 'bookings') {
    state[job.kind] = { data: job.data, at: job.finishedAt };
    saveState();
  }
  if (job.kind === 'draft') speak(job.data.draftSaved ? 'Draft saved, sir.' : 'The draft needs your attention, sir.');
}

// "Today" runs as three Claude Code sessions in parallel (inbox, drafts, radar) and
// fills in as each finishes, so the wait is the slowest part, not the sum of them.
const TODAY_PARTS = ['inbox', 'drafts', 'radar'];
function startToday() {
  if (running.has('today')) return jobs.get(running.get('today'));
  const id = crypto.randomBytes(6).toString('hex');
  const job = { id, kind: 'today', composite: true, status: 'running', startedAt: Date.now(), data: {}, parts: {}, partErrors: {}, subs: [], error: null };
  jobs.set(id, job);
  running.set('today', id);
  TODAY_PARTS.forEach((part) => { job.parts[part] = 'running'; });
  TODAY_PARTS.forEach((part) => {
    job.subs.push(startJob('today:' + part, {}, (sub) => {
      job.parts[part] = sub.status;
      if (sub.status === 'done') Object.assign(job.data, sub.data);
      else job.partErrors[part] = sub.error;
      if (TODAY_PARTS.every((p) => job.parts[p] !== 'running')) finishToday(job);
    }));
  });
  return job;
}
function finishToday(job) {
  if (job.status !== 'running') return;
  running.delete('today');
  job.finishedAt = Date.now();
  if (!TODAY_PARTS.some((p) => job.parts[p] === 'done')) {
    job.status = 'error';
    job.error = TODAY_PARTS.map((p) => job.partErrors[p]).filter(Boolean)[0] || 'Nothing came back.';
    job.raw = job.subs.map((s) => s.raw).filter(Boolean)[0];
    return;
  }
  // A part that failed keeps its last good results.
  job.data = Object.assign({}, (state.today && state.today.data) || {}, job.data);
  job.status = 'done';
  state.today = { data: job.data, at: job.finishedAt };
  saveState();
  speak(job.data.headline);
}

function publicJob(job) {
  if (!job) return null;
  const { id, kind, status, startedAt, finishedAt, data, error, raw, parts, partErrors } = job;
  let steps = job.steps;
  if (job.composite) {
    steps = [].concat.apply([], job.subs.map((s) => s.steps || [])).sort((a, b) => a.at - b.at);
  }
  return { id, kind, status, steps, startedAt, finishedAt, data, error, raw, parts, partErrors };
}

// ---------- http ----------
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png' };

function send(res, code, body, type) {
  res.writeHead(code, {
    'Content-Type': type || 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => { data += c; if (data.length > 20000) { reject(new Error('too large')); req.destroy(); } });
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch (e) { reject(e); } });
  });
}

const server = http.createServer(async (req, res) => {
  // Only answer requests addressed to this machine (blocks DNS-rebinding tricks).
  const host = String(req.headers.host || '');
  if (host !== HOST + ':' + PORT && host !== 'localhost:' + PORT) return send(res, 403, { error: 'forbidden' });
  const url = new URL(req.url, 'http://' + host);

  if (url.pathname.startsWith('/api/')) {
    // Every API call must carry the per-launch token (other websites can't read it).
    if (req.headers['x-jarvis-token'] !== TOKEN) return send(res, 403, { error: 'forbidden' });
    try {
      if (req.method === 'GET' && url.pathname === '/api/state') {
        return send(res, 200, {
          today: state.today || null, bookings: state.bookings || null, settings: state.settings, dismissed: state.dismissed,
          running: Array.from(running.entries()).map(([kind, id]) => ({ kind, id })),
        });
      }
      if (req.method === 'GET' && url.pathname === '/api/health') {
        return send(res, 200, await checkHealth(url.searchParams.get('force') === '1'));
      }
      if (req.method === 'POST' && url.pathname === '/api/fix-connection') {
        openFixTerminal();
        return send(res, 200, { ok: true });
      }
      if (req.method === 'POST' && url.pathname === '/api/run') {
        const body = await readBody(req);
        const job = startJob(String(body.kind || ''), body.params || {});
        return send(res, 200, publicJob(job));
      }
      if (req.method === 'GET' && url.pathname.startsWith('/api/job/')) {
        const job = jobs.get(url.pathname.slice('/api/job/'.length));
        return job ? send(res, 200, publicJob(job)) : send(res, 404, { error: 'not found' });
      }
      if (req.method === 'POST' && url.pathname === '/api/settings') {
        const body = await readBody(req);
        if (typeof body.voice === 'boolean') state.settings.voice = body.voice;
        if (typeof body.since === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.since)) state.settings.since = body.since;
        saveState();
        return send(res, 200, state.settings);
      }
      if (req.method === 'POST' && url.pathname === '/api/dismiss') {
        const body = await readBody(req);
        const key = String(body.key || '').slice(0, 300);
        if (!key) return send(res, 400, { error: 'key required' });
        if (body.restore) delete state.dismissed[key];
        else state.dismissed[key] = { at: Date.now(), label: String(body.label || '').slice(0, 200) };
        saveState();
        return send(res, 200, { dismissed: state.dismissed });
      }
      if (req.method === 'POST' && url.pathname === '/api/speak') {
        const body = await readBody(req);
        speak(String(body.text || '').slice(0, 300), body.force === true);
        return send(res, 200, { ok: true });
      }
      return send(res, 404, { error: 'not found' });
    } catch (e) {
      return send(res, 400, { error: e.message });
    }
  }

  // Static files. index.html gets the token baked in.
  let file = url.pathname === '/' ? '/index.html' : url.pathname;
  file = path.normalize(file).replace(/^(\.\.[/\\])+/, '');
  const full = path.join(PUBLIC_DIR, file);
  if (!full.startsWith(PUBLIC_DIR)) return send(res, 403, 'forbidden', 'text/plain');
  fs.readFile(full, (err, buf) => {
    if (err) return send(res, 404, 'not found', 'text/plain');
    const ext = path.extname(full);
    if (ext === '.html') buf = Buffer.from(buf.toString('utf8').replace('__JARVIS_TOKEN__', TOKEN));
    send(res, 200, buf, MIME[ext] || 'application/octet-stream');
  });
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') { console.error('JARVIS is already running on port ' + PORT + '.'); process.exit(0); }
  throw e;
});
server.listen(PORT, HOST, () => {
  console.log('JARVIS running at http://' + HOST + ':' + PORT + ' (claude: ' + CLAUDE_BIN + ')');
  checkHealth(true).then((h) => console.log('connection check: ' + (h.ok ? 'all connected' : h.problems.join(' '))));
});
