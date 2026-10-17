#!/usr/bin/env node
// Test stand-in for `claude -p --output-format stream-json`: emits tool-use events, then a result.
// Usage: JARVIS_CLAUDE_BIN=app/dev/mock-claude.js node app/server.js   (MOCK_DELAY=ms per step)
'use strict';
let prompt = '';
process.stdin.on('data', (c) => { prompt += c; });
process.stdin.on('end', async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const D = Number(process.env.MOCK_DELAY || 500);
  const emit = (o) => process.stdout.write(JSON.stringify(o) + '\n');
  const tool = (name, input) => emit({ type: 'assistant', message: { content: [{ type: 'tool_use', name: 'mcp__claude_ai_Gmail__' + name, input }] } });
  if (process.env.MOCK_LOGIN_EXPIRED) { process.stderr.write('API Error: 401 OAuth access token is invalid. Please run /login\n'); process.exit(1); }
  emit({ type: 'system', subtype: 'init', mcp_servers: [
    { name: 'claude.ai Gmail', status: process.env.MOCK_GMAIL_STATUS || 'connected' },
    { name: 'claude.ai Google Drive', status: 'connected' }, { name: 'claude.ai Stripe', status: 'needs-auth' }] });
  if (prompt.trim() === 'Reply with OK.') { await wait(5000); }
  const u = (id) => 'https://mail.google.com/mail/?authuser=info.obtennis@gmail.com#all/' + id;
  let result;
  if (/Write a reply DRAFT/.test(prompt)) {
    tool('get_thread', {}); await wait(D);
    emit({ type: 'assistant', message: { content: [{ type: 'tool_use', name: 'mcp__claude_ai_Google_Drive__read_file_content', input: {} }] } }); await wait(D);
    tool('create_draft', {}); await wait(D);
    result = JSON.stringify({ to: 'kknight@mowdenhall.org.uk', subject: 'Re: Mowden Hall', draftSaved: true, url: '',
      body: 'Hi Kirsten,\n\nThanks for your patience. Lois and I will be in on Monday at 10am to go through everything, and I\'ll bring my ID then.\n\n[OLLY: confirm anything still outstanding for the end-of-week deadline]\n\nThanks so much,\nOlly',
      flags: ['Needs Olly thread: holding reply only. Check what is still outstanding before sending.'] });
  } else if (/Count new ClubSpark/.test(prompt)) {
    tool('search_threads', { query: 'label:OB-Bookings newer_than:7d' }); await wait(D);
    tool('search_threads', { query: 'from:mail@clubspark.co.uk "Booking Confirmation"' }); await wait(D);
    tool('get_thread', {}); await wait(D);
    result = JSON.stringify({ weekOf: 'Mon 12 Oct', total: 5, quip: 'Stocksfield appears to be having a moment.',
      venues: [
        { venue: 'Stocksfield & District', subtotal: 4, sessions: [{ name: 'October Performance Camps', count: 3, people: ['A. Reed', 'J. Patel', 'M. Owen'] }, { name: 'Sun Red 2.30–3.30pm', count: 1, people: ['E. Hart'] }] },
        { venue: 'Boldon LTC', subtotal: 1, sessions: [{ name: 'Wed Adult Beginners 7–8pm', count: 1, people: ['L. Battle'] }] }],
      notes: ['Three camp bookings arrived without the OB/Bookings label.'] });
  } else if (/typed this into the JARVIS app/.test(prompt)) {
    tool('search_threads', { query: 'Lynda' }); await wait(D);
    result = '**Lynda Sale** wants answers on the STC venue registration.\n\n- Sinking fund, CASC and showers: answered by Jill and Louise\n- The questions **for you** are highlighted in blue in her 13 Oct email\n\nShall I draft a reply, sir?';
  } else if (process.env.MOCK_GMAIL_STATUS && process.env.MOCK_GMAIL_STATUS !== 'connected') {
    await wait(D);
    result = JSON.stringify({ error: 'gmail_unavailable', detail: 'The Gmail connector needs authentication.' });
  } else if (/\[\[part:(inbox|drafts|radar)\]\]/.test(prompt)) {
    // The app's three parallel "today" parts; each returns its slice of the full sample.
    const part = prompt.match(/\[\[part:(\w+)\]\]/)[1];
    const full = JSON.parse(await sample(true));
    const pick = { inbox: ['headline', 'quip', 'oldest', 'needsYou', 'clubAdmin', 'enquiries', 'fyi'], drafts: ['drafts'], radar: ['last24h', 'routine', 'deadlines', 'later'] }[part];
    const steps = { inbox: ['label:OB-Needs-Olly after:2026/10/15', 'label:OB-Club-Admin', 'label:OB-Enquiry'], drafts: [], radar: ['newer_than:1d', 'deadline OR renewal'] }[part];
    if (part === 'drafts') { tool('list_drafts', {}); }
    for (const q of steps) { tool('search_threads', { query: q }); await wait(D); }
    await wait(D * ({ inbox: 2, drafts: 1, radar: 4 }[part]));
    const out = {}; pick.forEach((k) => { out[k] = full[k]; });
    result = JSON.stringify(out);
  } else {
    result = await sample();
  }
  emit({ type: 'result', subtype: 'success', is_error: false, result });

  async function sample(quiet) {
    if (!quiet) {
    for (const q of ['label:OB-Needs-Olly', 'label:OB-Club-Admin', 'label:OB-Enquiry']) { tool('search_threads', { query: q }); await wait(D); }
    tool('get_thread', {}); tool('get_thread', {}); await wait(D);
    tool('list_drafts', {}); await wait(D);
    tool('search_threads', { query: 'newer_than:1d' }); await wait(D);
    tool('search_threads', { query: 'deadline OR renewal' }); await wait(D);
    }
    return JSON.stringify({
      headline: 'Good afternoon, sir. Two things need you, and Mowden Hall wants everything by today.',
      quip: 'The weekend appears to be in hand. The paperwork, less so.', oldest: 'Mowden Hall',
      needsYou: [
        { who: 'Kirsten Knight', subject: 'Mowden Hall', gist: 'Everything must be completed by the end of this week to start in November.', since: '3d', urgent: true, threadId: '1a0d44497c2e2941', url: u('1a0d44497c2e2941') },
        { who: 'Lynda Sale', subject: 'More info for STC venue registration', gist: '"Quite a few questions for Olly", highlighted in blue. No reply yet.', since: '3d', urgent: false, threadId: '1a13730593627654', url: u('1a13730593627654') }],
      drafts: { items: [
        { to: 'Lucy Brain', subject: 'Re: Tennis for a 4 year old', gist: 'No text written yet.', date: '28 Sep', threadId: '1a0e935927b2aa1b', url: '' },
        { to: 'Northumberland Tennis Academy', subject: 'September Invoice', gist: 'Hours breakdown, total £308.40. Ready to send.', date: '24 Sep', threadId: '1a0d4fb256fcc7ab', url: '' },
        { to: 'Vicky Marshall', subject: 'Re: Groups for 8 year olds', gist: 'No text written yet. She chose Boldon.', date: '23 Sep', threadId: '1a0cdf281dafc811', url: '' }], olderCount: 39 },
      clubAdmin: [], enquiries: [],
      fyi: ['LTA Coach Forum confirmed for Fri 23 Oct, 09:30 (LTA and Court Craft).', 'Kirsten: "Many thanks" on Service Provision.'],
      last24h: ['LTA Club Health Survey invitation (optional).'],
      routine: 'Routine: 11 promotions and personal, 0 money, 0 bookings.',
      deadlines: [
        { date: new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' }), when: 'Fri 16 Oct, 7pm', what: 'Boldon Awards Night', from: 'Boldon Cricket & Squash Club', url: '' },
        { date: '2026-10-19', when: 'Mon 19 Oct, 10am', what: 'Mowden Hall meeting with Lois. Bring ID.', from: 'Mowden Hall', url: '' },
        { date: '2026-10-23', when: 'Fri 23 Oct, 09:30', what: 'LTA Coach Forum, Durham & Cleveland', from: 'LTA', url: '' }],
      later: [
        { date: '2026-10-26', when: 'Mon 26 Oct', what: 'October Performance Camps start (STC)', from: 'ClubSpark', url: '' },
        { date: '2026-11-07', when: 'Sat 7 Nov', what: 'SumUp MTD submission (if income over £50k)', from: 'SumUp', url: '' }],
    });
  }
});
