import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

const STATUS_COLORS = { nailed: '#06FFA5', almost: '#FFD23F', failed: '#FF6B35' };

export default function Friends({ colors: c, user }) {
  const [screen,    setScreen]    = useState('list');
  const [search,    setSearch]    = useState('');
  const [friends,   setFriends]   = useState([]);   // accepted friends + today's attempt
  const [requests,  setRequests]  = useState([]);   // incoming pending requests
  const [results,   setResults]   = useState([]);   // user-search results
  const [sent,      setSent]      = useState({});   // { userId: true } — request sent this session
  const [loading,   setLoading]   = useState(true);
  const [challenge, setChallenge] = useState(null);

  const s = styles(c);

  // ─── Load accepted friends + their today attempt ─────────────────────────
  const loadFriends = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: rows } = await supabase
      .from('friendships')
      .select(`
        id,
        requester_id,
        addressee_id,
        requester:profiles!friendships_requester_id_fkey(id, display_name, handle, avatar_emoji, streak),
        addressee:profiles!friendships_addressee_id_fkey(id, display_name, handle, avatar_emoji, streak)
      `)
      .eq('status', 'accepted')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

    if (!rows) { setLoading(false); return; }

    const friendProfiles = rows.map(r =>
      r.requester_id === user.id ? r.addressee : r.requester
    );

    if (friendProfiles.length === 0) { setFriends([]); setLoading(false); return; }

    const today = new Date().toISOString().slice(0, 10);
    const { data: todayChallenge } = await supabase
      .from('challenges')
      .select('id')
      .eq('date', today)
      .single();

    let attemptsByUser = {};
    if (todayChallenge) {
      const friendIds = friendProfiles.map(f => f.id);
      const { data: attempts } = await supabase
        .from('attempts')
        .select('user_id, result, duration_ms')
        .eq('challenge_id', todayChallenge.id)
        .in('user_id', friendIds);
      if (attempts) attempts.forEach(a => { attemptsByUser[a.user_id] = a; });
    }

    setFriends(friendProfiles.map(f => ({ ...f, attempt: attemptsByUser[f.id] || null })));
    setLoading(false);
  }, [user]);

  // ─── Load incoming pending requests ──────────────────────────────────────
  const loadRequests = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('friendships')
      .select(`
        id,
        requester:profiles!friendships_requester_id_fkey(id, display_name, handle, avatar_emoji, streak)
      `)
      .eq('addressee_id', user.id)
      .eq('status', 'pending');
    setRequests(data || []);
  }, [user]);

  useEffect(() => { loadFriends(); loadRequests(); }, [loadFriends, loadRequests]);

  // ─── Search users ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== 'add' || search.trim().length < 2) { setResults([]); return; }
    const q = search.trim();
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, handle, avatar_emoji, streak, total_points')
        .or(`handle.ilike.%${q}%,display_name.ilike.%${q}%`)
        .neq('id', user?.id)
        .limit(10);
      setResults(data || []);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, screen, user]);

  // ─── Send friend request ──────────────────────────────────────────────────
  const sendRequest = async (toUserId) => {
    if (!user) return;
    await supabase.from('friendships').insert({
      requester_id: user.id,
      addressee_id: toUserId,
      status: 'pending',
    });
    setSent(prev => ({ ...prev, [toUserId]: true }));
  };

  const acceptRequest = async (friendshipId) => {
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId);
    await loadRequests();
    await loadFriends();
  };

  const done    = friends.filter(f => f.attempt);
  const waiting = friends.filter(f => !f.attempt);
  const filteredDone    = done.filter(f => matchSearch(f, search));
  const filteredWaiting = waiting.filter(f => matchSearch(f, search));

  // ─── FRIEND LIST ──────────────────────────────────────────────────────────
  if (screen === 'list') {
    return (
      <div style={s.scroll}>
        <div style={s.wrap}>
          <div style={s.topRow}>
            <div>
              <div style={s.pageTitle}>Friends</div>
              <div style={s.pageSub}>
                {loading ? 'Loading…' : `${friends.length} buds · ${done.length} done today`}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {requests.length > 0 && (
                <button style={s.reqBadgeBtn} onClick={() => setScreen('requests')}>
                  {requests.length} request{requests.length > 1 ? 's' : ''}
                </button>
              )}
              <button style={s.addBtn} onClick={() => setScreen('add')}>+ Add</button>
            </div>
          </div>

          <div style={s.searchWrap}>
            <span style={s.searchIcon}>🔍</span>
            <input
              style={s.searchInput}
              placeholder="Filter friends…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {!loading && friends.length === 0 && (
            <div style={s.emptyBox}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>👥</div>
              <div style={s.emptyTitle}>No friends yet</div>
              <div style={s.emptySub}>Tap + Add to find people you know</div>
            </div>
          )}

          {filteredDone.length > 0 && (
            <Section title="✅ Completed Today" count={filteredDone.length} c={c}>
              {filteredDone.map((f, i) => (
                <FriendRow key={f.id} f={f} c={c} delay={i * 0.05} onPoke={() => setChallenge(f)} />
              ))}
            </Section>
          )}

          {filteredWaiting.length > 0 && (
            <Section title="⏳ Haven't Done It Yet" count={filteredWaiting.length} c={c}>
              {filteredWaiting.map((f, i) => (
                <FriendRow key={f.id} f={f} c={c} delay={i * 0.05} onPoke={() => setChallenge(f)} />
              ))}
            </Section>
          )}

          <div style={s.inviteNudge}>
            <div style={s.nudgeText}>Bring more friends into the challenge</div>
            <button style={s.nudgeBtn} onClick={() => setScreen('invite')}>
              🎁 Invite &amp; Earn a Streak Shield
            </button>
          </div>
        </div>

        {challenge && (
          <ChallengeModal friend={challenge} c={c} onClose={() => setChallenge(null)} />
        )}
      </div>
    );
  }

  // ─── PENDING REQUESTS ─────────────────────────────────────────────────────
  if (screen === 'requests') {
    return (
      <div style={s.scroll}>
        <div style={s.wrap}>
          <div style={s.backRow}>
            <button style={s.backBtn} onClick={() => setScreen('list')}>← Back</button>
            <div style={s.pageTitle}>Requests</div>
            <div style={{ width: 60 }} />
          </div>

          {requests.length === 0 ? (
            <div style={s.emptyBox}>
              <div style={{ fontSize: 36 }}>✅</div>
              <div style={s.emptyTitle}>All caught up!</div>
            </div>
          ) : requests.map((r, i) => (
            <RequestRow key={r.id} r={r} c={c} delay={i * 0.06}
              onAccept={() => acceptRequest(r.id)} />
          ))}
        </div>
      </div>
    );
  }

  // ─── ADD FRIENDS ──────────────────────────────────────────────────────────
  if (screen === 'add') {
    return (
      <div style={s.scroll}>
        <div style={s.wrap}>
          <div style={s.backRow}>
            <button style={s.backBtn} onClick={() => { setScreen('list'); setSearch(''); }}>← Back</button>
            <div style={s.pageTitle}>Add Friends</div>
            <div style={{ width: 60 }} />
          </div>

          <div style={s.searchWrap}>
            <span style={s.searchIcon}>🔍</span>
            <input
              style={s.searchInput}
              placeholder="Search by name or @handle…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          <div style={s.quickRow}>
            <QuickAction icon="📷" label="QR Code"    c={c} onClick={() => setScreen('qr')} />
            <QuickAction icon="💌" label="Share Link" c={c} onClick={() => setScreen('invite')} />
          </div>

          {search.trim().length < 2 ? (
            <div style={s.searchHint}>Type at least 2 characters to search</div>
          ) : results.length === 0 ? (
            <div style={s.searchHint}>No users found for "{search}"</div>
          ) : (
            <>
              <div style={s.sectionLabel}>Search results</div>
              {results.map((p, i) => (
                <SuggestionRow key={p.id} p={p} c={c} sent={!!sent[p.id]}
                  onAdd={() => sendRequest(p.id)} delay={i * 0.06} />
              ))}
            </>
          )}

          <div style={s.sectionLabel}>Invite via</div>
          <div style={s.shareGrid}>
            {[
              { icon: '🟢', name: 'WhatsApp',  color: '#25D366' },
              { icon: '💬', name: 'iMessage',  color: '#34C759' },
              { icon: '📸', name: 'Instagram', color: c.pink    },
              { icon: '✉️', name: 'Email',     color: c.coral   },
            ].map(opt => <ShareOption key={opt.name} {...opt} c={c} />)}
          </div>
        </div>
      </div>
    );
  }

  // ─── INVITE SCREEN ────────────────────────────────────────────────────────
  if (screen === 'invite') {
    const code = user?.invite_code || '…';
    return (
      <div style={s.scroll}>
        <div style={s.wrap}>
          <button style={s.backBtn} onClick={() => setScreen('list')}>← Back</button>

          <div style={s.inviteHero}>
            <div style={s.inviteShield}>🛡️</div>
            <h2 style={s.inviteTitle}>Invite a Friend,<br/>Earn a Streak Shield</h2>
            <p style={s.inviteSub}>
              Your friend joins Spark and completes their first challenge —
              you both get a <span style={{ color: c.gold, fontWeight: 700 }}>Streak Shield</span> that
              protects your streak for 1 day.
            </p>
          </div>

          <div style={s.inviteCode}>
            <div style={s.inviteCodeLabel}>Your invite code</div>
            <div style={s.inviteCodeVal}>{code}</div>
            <button style={s.copyBtn} onClick={() => navigator.clipboard?.writeText(code)}>
              📋 Copy
            </button>
          </div>

          <div style={s.inviteStats}>
            <InviteStat val={user?.shields ?? 0} label="Shields earned" c={c} color={c.gold} />
          </div>
        </div>
      </div>
    );
  }

  // ─── QR CODE ─────────────────────────────────────────────────────────────
  if (screen === 'qr') {
    return (
      <div style={s.scroll}>
        <div style={s.wrap}>
          <button style={s.backBtn} onClick={() => setScreen('add')}>← Back</button>
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <div style={s.pageTitle}>Your QR Code</div>
            <p style={s.pageSub}>Friends scan this to add you instantly</p>
          </div>
          <div style={s.qrBox}>
            <QRPlaceholder c={c} />
            <div style={s.qrHandle}>@{user?.handle} · {user?.invite_code}</div>
          </div>
          <button style={s.saveQrBtn}>💾 Save to Photos</button>
        </div>
      </div>
    );
  }

  return null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function matchSearch(f, search) {
  if (!search) return true;
  const q = search.toLowerCase();
  return f.display_name.toLowerCase().includes(q) || f.handle.toLowerCase().includes(q);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, count, c, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase' }}>{title}</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{count}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
    </div>
  );
}

function FriendRow({ f, c, onPoke, delay }) {
  const result     = f.attempt?.result;
  const scoreColor = result ? (STATUS_COLORS[result] || c.coral) : null;
  const label      = result ? (result.charAt(0).toUpperCase() + result.slice(1)) : null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 14, padding: '10px 14px',
      animation: `slideUp 0.35s ease-out ${delay}s both`,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%', fontSize: 22,
        background: `linear-gradient(135deg, ${c.purple}30, ${c.pink}20)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{f.avatar_emoji}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {f.display_name}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>@{f.handle} · 🔥 {f.streak}</div>
      </div>

      {result ? (
        <div style={{
          padding: '4px 10px', borderRadius: 20,
          background: `${scoreColor}20`, border: `1px solid ${scoreColor}40`,
          fontSize: 12, fontWeight: 700, color: scoreColor,
        }}>{label}</div>
      ) : (
        <button style={{
          padding: '6px 12px', borderRadius: 20,
          background: `linear-gradient(135deg, ${c.coral}, ${c.pink})`,
          border: 'none', fontSize: 11, fontWeight: 700, color: '#fff',
          cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
        }} onClick={onPoke}>⚡ Poke</button>
      )}
    </div>
  );
}

function RequestRow({ r, c, onAccept, delay }) {
  const f = r.requester;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: `${c.purple}10`, border: `1px solid ${c.purple}30`,
      borderRadius: 14, padding: '10px 14px',
      animation: `slideUp 0.35s ease-out ${delay}s both`,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%', fontSize: 22,
        background: `linear-gradient(135deg, ${c.purple}30, ${c.pink}20)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{f.avatar_emoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{f.display_name}</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>@{f.handle} · 🔥 {f.streak}</div>
      </div>
      <button style={{
        padding: '7px 14px', borderRadius: 20, cursor: 'pointer',
        background: `linear-gradient(135deg, ${c.green}, ${c.purple})`,
        border: 'none', fontSize: 12, fontWeight: 700, color: '#fff',
        fontFamily: "'DM Sans', sans-serif",
      }} onClick={onAccept}>Accept</button>
    </div>
  );
}

function SuggestionRow({ p, c, sent, onAdd, delay }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 14, padding: '10px 14px',
      animation: `slideUp 0.35s ease-out ${delay}s both`,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%', fontSize: 22,
        background: `linear-gradient(135deg, ${c.purple}30, ${c.green}20)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{p.avatar_emoji}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{p.display_name}</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
          @{p.handle} · 🔥 {p.streak} · {(p.total_points || 0).toLocaleString()} pts
        </div>
      </div>

      <button style={{
        padding: '7px 16px', borderRadius: 20, cursor: 'pointer',
        background: sent ? 'rgba(6,255,165,0.15)' : `linear-gradient(135deg, ${c.coral}, ${c.pink})`,
        border: sent ? `1px solid ${c.green}` : 'none',
        fontSize: 12, fontWeight: 700, color: sent ? c.green : '#fff',
        fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
      }} onClick={!sent ? onAdd : undefined}>
        {sent ? '✓ Sent' : '+ Add'}
      </button>
    </div>
  );
}

function QuickAction({ icon, label, c, onClick }) {
  return (
    <button style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: 14, padding: '14px 8px', cursor: 'pointer',
      fontFamily: "'DM Sans', sans-serif",
    }} onClick={onClick}>
      <span style={{ fontSize: 24 }}>{icon}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>{label}</span>
    </button>
  );
}

function ShareOption({ icon, name, color }) {
  return (
    <button style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      background: `${color}15`, border: `1px solid ${color}30`,
      borderRadius: 14, padding: '14px 8px', cursor: 'pointer',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontSize: 10, fontWeight: 600, color }}>{name}</span>
    </button>
  );
}

function InviteStat({ val, label, color }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 28, fontWeight: 700, color: color || '#fff' }}>
        {val}
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>{label}</div>
    </div>
  );
}

function QRPlaceholder() {
  const cells = Array.from({ length: 100 }, (_, i) => (i * 7 + 3) % 11 > 5);
  return (
    <div style={{
      width: 200, height: 200, display: 'grid', gridTemplateColumns: 'repeat(10,1fr)',
      gap: 2, padding: 10, background: '#fff', borderRadius: 16, margin: '0 auto',
    }}>
      {cells.map((filled, i) => (
        <div key={i} style={{ background: filled ? '#050508' : '#fff', borderRadius: 1 }} />
      ))}
    </div>
  );
}

function ChallengeModal({ friend, c, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(5,5,8,0.9)',
      display: 'flex', alignItems: 'flex-end', zIndex: 50,
      backdropFilter: 'blur(12px)', animation: 'fadeIn 0.2s ease-out',
    }} onClick={onClose}>
      <div style={{
        width: '100%', background: '#0d0d1a',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px 24px 0 0', padding: '24px 20px 40px',
        animation: 'slideUp 0.3s ease-out',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 44 }}>{friend.avatar_emoji}</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>{friend.display_name}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>@{friend.handle}</div>
        </div>
        <button style={{
          width: '100%', padding: '15px',
          background: `linear-gradient(135deg, ${c.coral}, ${c.pink})`,
          border: 'none', borderRadius: 14, cursor: 'pointer',
          fontSize: 15, fontWeight: 700, color: '#fff',
          fontFamily: "'DM Sans', sans-serif",
          boxShadow: `0 8px 24px ${c.coral}50`,
        }}>
          ⚡ Send Challenge Poke
        </button>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
function styles(c) {
  return {
    scroll: { height: '100%', overflowY: 'auto', WebkitOverflowScrolling: 'touch' },
    wrap: { display: 'flex', flexDirection: 'column', gap: 16, padding: '16px 16px 40px', animation: 'slideUp 0.35s ease-out' },
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    pageTitle: { fontSize: 24, fontWeight: 800, color: '#fff' },
    pageSub: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
    addBtn: {
      background: `linear-gradient(135deg, ${c.coral}, ${c.pink})`,
      border: 'none', borderRadius: 20, padding: '8px 18px',
      fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer',
      fontFamily: "'DM Sans', sans-serif",
    },
    reqBadgeBtn: {
      background: `${c.purple}30`, border: `1px solid ${c.purple}60`,
      borderRadius: 20, padding: '7px 14px',
      fontSize: 12, fontWeight: 700, color: c.purple, cursor: 'pointer',
      fontFamily: "'DM Sans', sans-serif",
    },
    searchWrap: {
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: 12, padding: '10px 14px',
    },
    searchIcon: { fontSize: 16, opacity: 0.5 },
    searchInput: {
      flex: 1, background: 'none', border: 'none', outline: 'none',
      color: '#fff', fontSize: 14, fontFamily: "'DM Sans', sans-serif",
    },
    searchHint: { fontSize: 13, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '12px 0' },
    quickRow: { display: 'flex', gap: 10 },
    sectionLabel: {
      fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)',
      letterSpacing: 1, textTransform: 'uppercase', padding: '4px 2px',
    },
    shareGrid: { display: 'flex', gap: 8 },
    backRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    backBtn: {
      background: 'none', border: 'none', color: c.coral,
      fontSize: 14, fontWeight: 600, cursor: 'pointer',
      fontFamily: "'DM Sans', sans-serif", padding: 0,
    },
    emptyBox: {
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      padding: '40px 20px', textAlign: 'center',
    },
    emptyTitle: { fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.6)' },
    emptySub:  { fontSize: 13, color: 'rgba(255,255,255,0.3)' },
    inviteNudge: {
      background: `linear-gradient(135deg, ${c.gold}15, ${c.coral}10)`,
      border: `1px solid ${c.gold}30`,
      borderRadius: 16, padding: '16px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
    },
    nudgeText: { fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center' },
    nudgeBtn: {
      background: `linear-gradient(135deg, ${c.gold}, ${c.coral})`,
      border: 'none', borderRadius: 50, padding: '10px 20px',
      fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer',
      fontFamily: "'DM Sans', sans-serif",
    },
    inviteHero: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center', padding: '20px 0' },
    inviteShield: { fontSize: 64, animation: 'float 3s ease-in-out infinite' },
    inviteTitle: { margin: 0, fontSize: 26, fontWeight: 800, lineHeight: 1.2 },
    inviteSub: { margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, maxWidth: 300 },
    inviteCode: {
      background: 'rgba(255,255,255,0.05)', border: `1px solid ${c.gold}30`,
      borderRadius: 16, padding: '20px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
    },
    inviteCodeLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase' },
    inviteCodeVal: {
      fontFamily: "'Space Mono', monospace",
      fontSize: 24, fontWeight: 700, color: c.gold,
      letterSpacing: 3, textShadow: `0 0 20px ${c.gold}60`,
    },
    copyBtn: {
      background: `${c.gold}20`, border: `1px solid ${c.gold}40`,
      borderRadius: 20, padding: '7px 20px',
      fontSize: 13, fontWeight: 700, color: c.gold, cursor: 'pointer',
      fontFamily: "'DM Sans', sans-serif",
    },
    inviteStats: {
      display: 'flex', gap: 8,
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16, padding: '16px',
    },
    qrBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '20px' },
    qrHandle: { fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: "'Space Mono', monospace" },
    saveQrBtn: {
      width: '100%', padding: '15px',
      background: `linear-gradient(135deg, ${c.purple}, ${c.pink})`,
      border: 'none', borderRadius: 14, cursor: 'pointer',
      fontSize: 15, fontWeight: 700, color: '#fff',
      fontFamily: "'DM Sans', sans-serif",
    },
  };
}
