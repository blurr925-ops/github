(function () {
  'use strict';
  var TOKEN = document.querySelector('meta[name="jarvis-token"]').content;
  var $ = function (id) { return document.getElementById(id); };
  var state = { today: null, bookings: null, settings: { voice: true }, tab: 'today', jobs: {} };

  // ---------- helpers ----------
  function api(method, path, body) {
    return fetch(path, {
      method: method,
      headers: { 'Content-Type': 'application/json', 'X-Jarvis-Token': TOKEN },
      body: body ? JSON.stringify(body) : undefined,
    }).then(function (r) {
      return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || r.statusText); return j; });
    });
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); return n; }
  function safeUrl(u) { return /^https:\/\//i.test(String(u || '')) ? String(u) : null; }
  function link(text, href, cls) {
    var a = el('a', cls || 'chip', text);
    a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer';
    return a;
  }
  function toast(msg) {
    var t = $('toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toast.t); toast.t = setTimeout(function () { t.hidden = true; }, 3200);
  }
  function hue(s) { var h = 0; s = String(s || ''); for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360; return h; }
  function initials(s) {
    var w = String(s || '?').replace(/[^A-Za-z0-9@ .'-]/g, '').split(/[\s@.]+/).filter(Boolean);
    return ((w[0] || '?')[0] + (w[1] ? w[1][0] : '')).toUpperCase();
  }
  function londonNow() { return new Date(); }
  function fmtTime(ts) {
    try { return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London' }); } catch (e) { return ''; }
  }
  function ago(ts) {
    var m = Math.round((Date.now() - ts) / 60000);
    if (m < 1) return 'just now'; if (m < 60) return m + ' min ago';
    var h = Math.round(m / 60); if (h < 24) return h + 'h ago';
    return Math.round(h / 24) + 'd ago';
  }
  function greeting() {
    var h = Number(new Date().toLocaleString('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Europe/London' }));
    return h < 12 ? 'Good morning, sir.' : h < 18 ? 'Good afternoon, sir.' : 'Good evening, sir.';
  }
  function arr(x) { return Array.isArray(x) ? x : []; }

  // ---------- tiny, safe markdown ----------
  function md(text) {
    var root = el('div', 'md');
    var lines = String(text || '').replace(/\r/g, '').split('\n');
    var list = null;
    function inline(parent, s) {
      var re = /(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\)|`[^`]+`|\*[^*]+\*)/g, last = 0, m;
      while ((m = re.exec(s))) {
        if (m.index > last) parent.appendChild(document.createTextNode(s.slice(last, m.index)));
        var t = m[0];
        if (t.slice(0, 2) === '**') parent.appendChild(el('strong', null, t.slice(2, -2)));
        else if (t[0] === '`') parent.appendChild(el('code', null, t.slice(1, -1)));
        else if (t[0] === '[') { var mm = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(t); parent.appendChild(link(mm[1], mm[2], '')); }
        else parent.appendChild(el('em', null, t.slice(1, -1)));
        last = m.index + t.length;
      }
      if (last < s.length) parent.appendChild(document.createTextNode(s.slice(last)));
    }
    lines.forEach(function (line) {
      var h = /^(#{1,3})\s+(.*)$/.exec(line);
      var li = /^\s*(?:[-*•]|\d+[.)])\s+(.*)$/.exec(line);
      if (li) {
        if (!list) { list = el(/^\s*\d/.test(line) ? 'ol' : 'ul'); root.appendChild(list); }
        var item = el('li'); inline(item, li[1]); list.appendChild(item); return;
      }
      list = null;
      if (h) { var hh = el('h3'); inline(hh, h[2]); root.appendChild(hh); return; }
      if (line.trim()) { var p = el('p'); inline(p, line); root.appendChild(p); }
    });
    return root;
  }

  // ---------- jobs ----------
  function run(kind, params) {
    return api('POST', '/api/run', { kind: kind, params: params || {} }).then(function (job) {
      state.jobs[kind] = job; updateBusy(); return poll(job.id, kind);
    });
  }
  function poll(id, kind) {
    return new Promise(function (resolve) {
      (function tick() {
        api('GET', '/api/job/' + id).then(function (job) {
          state.jobs[kind] = job;
          renderSteps(kind, job);
          if (job.status === 'running') return setTimeout(tick, 900);
          delete state.jobs[kind]; updateBusy(); resolve(job);
        }).catch(function () { setTimeout(tick, 2000); });
      })();
    });
  }
  function updateBusy() {
    document.body.classList.toggle('busy', Object.keys(state.jobs).length > 0);
    var busy = state.tab === 'today' ? state.jobs.today : state.jobs.bookings;
    $('refreshBtn').disabled = !!busy;
  }
  function renderSteps(kind, job) {
    var list = kind === 'today' ? $('stepsToday') : kind === 'bookings' ? $('stepsBookings') : null;
    if (!list) return;
    clear(list);
    var steps = arr(job.steps).slice(-7);
    if (!steps.length) steps = [{ label: 'Waking up Claude Code' }];
    steps.forEach(function (s, i) {
      var li = el('li', i === steps.length - 1 && job.status === 'running' ? 'now' : '', s.label);
      if (s.count > 1) li.appendChild(el('span', 'x', '×' + s.count));
      list.appendChild(li);
    });
  }

  // ---------- TODAY ----------
  function refreshToday() {
    var have = !!state.today;
    $('errorToday').hidden = true;
    $('loadingToday').hidden = have; // first run: big loader; later: keep cards, show progress bar
    if (!have) $('todayLayout').hidden = true;
    return run('today').then(function (job) {
      $('loadingToday').hidden = true;
      if (job.status === 'done') { state.today = { data: job.data, at: job.finishedAt }; renderToday(); }
      else showError('errorToday', job);
      if (state.today) $('todayLayout').hidden = false;
    });
  }
  function showError(id, job) {
    var box = clear($(id));
    box.appendChild(el('b', null, 'Something went wrong. '));
    box.appendChild(document.createTextNode(job.error || 'Unknown error.'));
    if (job.raw) box.appendChild(el('pre', null, job.raw));
    box.hidden = false;
  }
  function itemRow(it, opts) {
    opts = opts || {};
    var li = el('li', 'item');
    var who = it.who || it.to || 'Unknown';
    var av = el('div', 'avatar' + (it.urgent ? ' urgent' : ''), initials(who));
    var h = hue(who);
    av.style.background = 'linear-gradient(135deg, hsl(' + h + ',85%,72%), hsl(' + ((h + 40) % 360) + ',80%,58%))';
    li.appendChild(av);
    var body = el('div');
    var w = el('div', 'who', opts.toPrefix ? 'To ' + who : who);
    if (it.subject) { w.appendChild(document.createTextNode(' ')); w.appendChild(el('span', 'subj', '· ' + it.subject)); }
    body.appendChild(w);
    if (it.gist) body.appendChild(el('div', 'gist', it.gist));
    li.appendChild(body);
    var meta = el('div', 'meta');
    var age = it.since || it.date;
    if (age) meta.appendChild(el('span', 'age', age));
    var acts = el('div', 'row-actions');
    if (opts.draft && it.threadId) {
      var b = el('button', 'chip accent', 'Draft reply');
      b.type = 'button';
      b.addEventListener('click', function () { draftReply(it); });
      acts.appendChild(b);
    }
    var u = safeUrl(it.url);
    if (u) acts.appendChild(link('Open ↗', u));
    meta.appendChild(acts);
    li.appendChild(meta);
    return li;
  }
  function fill(listId, countId, items, opts, emptyText) {
    var list = clear($(listId));
    items = arr(items);
    if (countId) $(countId).textContent = items.length;
    if (!items.length) { list.appendChild(el('li', 'empty', emptyText || 'Nothing here.')); return; }
    items.forEach(function (it) { list.appendChild(itemRow(it, opts)); });
  }
  function timeline(listId, items) {
    var list = clear($(listId));
    var todayIso = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
    arr(items).forEach(function (d) {
      var li = el('li', 'tl' + (d.date === todayIso ? ' today' : ''));
      li.appendChild(el('div', 'when', d.date === todayIso ? 'Today · ' + (d.when || '') : (d.when || d.date || '')));
      var what = el('div', 'what', d.what || '');
      li.appendChild(what);
      if (d.from) li.appendChild(el('div', 'from', d.from));
      var u = safeUrl(d.url); if (u) { what.appendChild(document.createTextNode(' ')); what.appendChild(link('↗', u, '')); }
      list.appendChild(li);
    });
    if (!arr(items).length) list.appendChild(el('li', 'empty', 'Nothing on the horizon.'));
  }
  function bullets(listId, items) {
    var list = clear($(listId));
    arr(items).forEach(function (t) { if (t) list.appendChild(el('li', null, t)); });
    return arr(items).length;
  }
  function stat(label, n, accent) {
    var s = el('div', 'stat'); if (accent) s.setAttribute('data-accent', accent);
    s.appendChild(el('b', null, String(n))); s.appendChild(el('span', null, label)); return s;
  }
  function renderToday() {
    var d = (state.today && state.today.data) || {};
    $('greeting').textContent = greeting();
    if (d.headline) $('headline').textContent = d.headline.replace(/^Good (morning|afternoon|evening),? sir\.\s*/i, '') || d.headline;
    var drafts = d.drafts || {};
    fill('list-needs', 'c-needs', d.needsYou, { draft: true }, 'Nothing needs you. Splendid.');
    fill('list-enq', 'c-enq', d.enquiries, { draft: true }, 'No unanswered enquiries.');
    fill('list-club', 'c-club', d.clubAdmin, { draft: true }, 'No questions for you.');
    fill('list-drafts', 'c-drafts', drafts.items, { toPrefix: true }, 'No drafts waiting.');
    $('drafts-older').textContent = drafts.olderCount ? 'Plus ' + drafts.olderCount + ' older drafts.' : '';
    timeline('list-dead', d.deadlines);
    $('c-dead').textContent = arr(d.deadlines).length;
    $('later-wrap').hidden = !arr(d.later).length;
    timeline('list-later', d.later);
    var n24 = bullets('list-24', d.last24h);
    if (!n24) $('list-24').appendChild(el('li', null, 'Nothing of note.'));
    $('routine').textContent = d.routine || '';
    $('fyi-card').hidden = !bullets('list-fyi', d.fyi);
    $('quip').textContent = d.quip || '';
    // Cards with something in them first; empty ones sink to the bottom.
    var col = document.querySelector('.main-col');
    var cards = [['card-needs', d.needsYou], ['card-enq', d.enquiries], ['card-club', d.clubAdmin], ['card-drafts', drafts.items]];
    cards.filter(function (c) { return arr(c[1]).length; }).concat(cards.filter(function (c) { return !arr(c[1]).length; }))
      .forEach(function (c) { col.appendChild($(c[0])); });
    var st = clear($('stats'));
    st.appendChild(stat('need you', arr(d.needsYou).length, 'red'));
    st.appendChild(stat('drafts', arr(drafts.items).length, 'blue'));
    st.appendChild(stat('enquiries', arr(d.enquiries).length, 'green'));
    st.appendChild(stat('coming up', arr(d.deadlines).length, 'amber'));
    $('todayLayout').hidden = false;
    updateStamp();
  }

  // ---------- BOOKINGS ----------
  function refreshBookings() {
    $('errorBookings').hidden = true;
    $('loadingBookings').hidden = !!state.bookings;
    return run('bookings').then(function (job) {
      $('loadingBookings').hidden = true;
      if (job.status === 'done') { state.bookings = { data: job.data, at: job.finishedAt }; renderBookings(); }
      else showError('errorBookings', job);
    });
  }
  function renderBookings() {
    var d = (state.bookings && state.bookings.data) || {};
    $('bk-total').textContent = d.total != null ? d.total : '–';
    if (d.weekOf) $('weekLine').textContent = 'Week of ' + d.weekOf;
    var wrap = clear($('venues'));
    var max = 1;
    arr(d.venues).forEach(function (v) { arr(v.sessions).forEach(function (s) { max = Math.max(max, s.count || 0); }); });
    arr(d.venues).forEach(function (v) {
      var card = el('article', 'card'); card.setAttribute('data-accent', 'cyan');
      var hd = el('header'); hd.appendChild(el('h2', null, v.venue || 'Venue')); hd.appendChild(el('span', 'count', String(v.subtotal || 0)));
      card.appendChild(hd);
      arr(v.sessions).forEach(function (s) {
        var row = el('div', 'session');
        row.appendChild(el('div', 'name', s.name || ''));
        row.appendChild(el('div', 'n', String(s.count || 0)));
        var bar = el('div', 'bar'); var i = el('i'); i.style.width = Math.round(100 * (s.count || 0) / max) + '%'; bar.appendChild(i); row.appendChild(bar);
        if (arr(s.people).length) row.appendChild(el('div', 'people', arr(s.people).join(', ')));
        card.appendChild(row);
      });
      wrap.appendChild(card);
    });
    if (!arr(d.venues).length && state.bookings) wrap.appendChild(el('p', 'empty', 'No new bookings this week yet.'));
    bullets('bk-notes', d.notes);
    $('bk-quip').textContent = d.quip || '';
    updateStamp();
  }

  // ---------- sheet: drafts + ask ----------
  function openSheet(title) {
    $('sheetTitle').textContent = title;
    $('scrim').hidden = false; $('sheet').hidden = false;
    return clear($('sheetBody'));
  }
  function closeSheet() { $('scrim').hidden = true; $('sheet').hidden = true; }
  function miniLoading(parent, text) {
    var m = el('div', 'mini-loading');
    var r = el('div', 'big-reactor'); r.appendChild(el('span')); r.appendChild(el('span')); r.appendChild(el('span')); r.appendChild(el('i'));
    m.appendChild(r);
    var t = el('div', null, text); m.appendChild(t);
    parent.appendChild(m);
    return t;
  }
  function liveSteps(kind, label) {
    var iv = setInterval(function () {
      var j = state.jobs[kind]; var s = j && arr(j.steps); if (s && s.length) label.textContent = s[s.length - 1].label + '…';
    }, 600);
    return function () { clearInterval(iv); };
  }
  function draftReply(it) {
    var body = openSheet('Draft reply · ' + (it.who || ''));
    var lbl = miniLoading(body, 'Reading the thread and the playbook…');
    var stop = liveSteps('draft', lbl);
    run('draft', { threadId: it.threadId, who: it.who, subject: it.subject }).then(function (job) {
      stop(); clear(body);
      if (job.status !== 'done') { body.appendChild(el('div', 'error-card', job.error || 'Could not write the draft.')); return; }
      var d = job.data || {};
      var dl = el('dl', 'draft-meta');
      dl.appendChild(el('dt', null, 'To')); dl.appendChild(el('dd', null, d.to || it.who || ''));
      dl.appendChild(el('dt', null, 'Subject')); dl.appendChild(el('dd', null, d.subject || it.subject || ''));
      dl.appendChild(el('dt', null, 'Status')); dl.appendChild(el('dd', null, d.draftSaved ? 'Saved in Gmail Drafts. Not sent.' : 'Not saved. See notes below.'));
      body.appendChild(dl);
      body.appendChild(el('div', 'draft-body', d.body || ''));
      var flags = arr(d.flags).filter(Boolean);
      if (flags.length) { var ul = el('ul', 'flags'); flags.forEach(function (f) { ul.appendChild(el('li', null, '⚑ ' + f)); }); body.appendChild(ul); }
      var acts = el('div', 'sheet-actions');
      acts.appendChild(link('Open Gmail Drafts ↗', 'https://mail.google.com/mail/u/0/#drafts', 'btn primary'));
      var u = safeUrl(it.url); if (u) acts.appendChild(link('Open thread ↗', u, 'btn'));
      body.appendChild(acts);
      if (d.draftSaved) toast('Draft saved. You send it from Gmail.');
    });
  }
  function ask(q) {
    var body = openSheet('Ask JARVIS');
    body.appendChild(el('p', 'q', '“' + q + '”'));
    var lbl = miniLoading(body, 'Thinking…');
    var stop = liveSteps('ask', lbl);
    run('ask', { question: q }).then(function (job) {
      stop();
      body.removeChild(body.lastChild);
      if (job.status !== 'done') { body.appendChild(el('div', 'error-card', job.error || 'No answer.')); return; }
      body.appendChild(md(job.data && job.data.text));
      if (state.settings.voice) api('POST', '/api/speak', { text: job.data && job.data.text }).catch(function () {});
    });
  }

  // ---------- chrome ----------
  function updateStamp() {
    var s = state.tab === 'today' ? state.today : state.bookings;
    $('updated').textContent = s && s.at ? 'Updated ' + fmtTime(s.at) + ' · ' + ago(s.at) : '';
  }
  function setTab(tab) {
    state.tab = tab;
    Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (b) {
      var on = b.getAttribute('data-tab') === tab; b.classList.toggle('active', on); b.setAttribute('aria-selected', on);
    });
    $('view-today').hidden = tab !== 'today';
    $('view-bookings').hidden = tab !== 'bookings';
    if (tab === 'bookings' && !state.bookings && !state.jobs.bookings) refreshBookings();
    updateBusy(); updateStamp();
  }
  function setVoice(on) {
    state.settings.voice = on;
    $('voiceBtn').classList.toggle('off', !on);
    $('voiceBtn').title = on ? 'Voice on' : 'Voice off';
  }

  $('dateLine').textContent = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/London' });
  $('greeting').textContent = greeting();
  Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (b) {
    b.addEventListener('click', function () { setTab(b.getAttribute('data-tab')); });
  });
  $('refreshBtn').addEventListener('click', function () { state.tab === 'today' ? refreshToday() : refreshBookings(); });
  $('voiceBtn').addEventListener('click', function () {
    setVoice(!state.settings.voice);
    api('POST', '/api/settings', { voice: state.settings.voice }).catch(function () {});
    toast(state.settings.voice ? 'Voice on.' : 'Voice off. Blissful silence.');
  });
  $('askForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var q = $('askInput').value.trim(); if (!q) return;
    $('askInput').value = ''; ask(q);
  });
  $('sheetClose').addEventListener('click', closeSheet);
  $('scrim').addEventListener('click', closeSheet);
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); $('askInput').focus(); }
    if (e.key === 'Escape') closeSheet();
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'r') { e.preventDefault(); $('refreshBtn').click(); }
  });
  setInterval(updateStamp, 30000);

  // Boot: show the last saved results instantly, then refresh if they're stale.
  api('GET', '/api/state').then(function (s) {
    state.today = s.today; state.bookings = s.bookings; setVoice(s.settings ? s.settings.voice !== false : true);
    if (state.today) renderToday();
    if (state.bookings) renderBookings();
    arr(s.running).forEach(function (r) {
      state.jobs[r.kind] = { id: r.id, steps: [] }; updateBusy();
      poll(r.id, r.kind).then(function (job) {
        if (job.status === 'done' && r.kind === 'today') { state.today = { data: job.data, at: job.finishedAt }; renderToday(); }
        if (job.status === 'done' && r.kind === 'bookings') { state.bookings = { data: job.data, at: job.finishedAt }; renderBookings(); }
      });
    });
    var stale = !state.today || (Date.now() - state.today.at > 20 * 60 * 1000);
    if (stale && !state.jobs.today) refreshToday();
  }).catch(function (e) {
    var box = clear($('errorToday')); box.appendChild(el('b', null, 'Can’t reach JARVIS. ')); box.appendChild(document.createTextNode(e.message)); box.hidden = false;
  });
})();
