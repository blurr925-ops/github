import React, { useState } from 'react';

const FRIENDS = [
  { id: 1, name: 'Alex Chen',    handle: '@alex_c',    avatar: '🎯', status: 'done',    score: 'Nailed', streak: 14, mutual: 3 },
  { id: 2, name: 'Maya Patel',   handle: '@mayap',     avatar: '🎨', status: 'done',    score: 'Almost', streak: 7,  mutual: 5 },
  { id: 3, name: 'Jordan Kim',   handle: '@jkim',      avatar: '🎵', status: 'pending', score: null,     streak: 21, mutual: 2 },
  { id: 4, name: 'Sam Torres',   handle: '@samtorres', avatar: '🏄', status: 'pending', score: null,     streak: 3,  mutual: 8 },
  { id: 5, name: 'Riley Zhao',   handle: '@rileyZ',    avatar: '🌟', status: 'done',    score: 'Nailed', streak: 45, mutual: 1 },
  { id: 6, name: 'Casey Park',   handle: '@caseyp',    avatar: '🔥', status: 'pending', score: null,     streak: 9,  mutual: 4 },
];

const SUGGESTIONS = [
  { id: 10, name: 'Devon Walsh',  handle: '@devonw',   avatar: '🎸', mutual: 12, followers: '2.3k' },
  { id: 11, name: 'Quinn Osei',   handle: '@quinno',   avatar: '🏆', mutual: 7,  followers: '891' },
  { id: 12, name: 'Nico Ferrer',  handle: '@nicofer',  avatar: '🎪', mutual: 15, followers: '4.1k' },
  { id: 13, name: 'Jade Nguyen',  handle: '@jadeN',    avatar: '🌊', mutual: 3,  followers: '672' },
];

const STATUS_COLORS = { nailed: '#06FFA5', almost: '#FFD23F', failed: '#FF6B35' };

export default function Friends({ colors: c }) {
  const [screen,    setScreen]    = useState('list'); // list | add | invite | qr
  const [search,    setSearch]    = useState('');
  const [added,     setAdded]     = useState({});
  const [challenge, setChallenge] = useState(null);

  const s = styles(c);

  const filtered = FRIENDS.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.handle.toLowerCase().includes(search.toLowerCase())
  );

  // ─── FRIEND LIST ──────────────────────────────────────────────────────────
  if (screen === 'list') {
    const done    = filtered.filter(f => f.status === 'done');
    const waiting = filtered.filter(f => f.status === 'pending');

    return (
      <div style={s.scroll}>
        <div style={s.wrap}>
          {/* Header row */}
          <div style={s.topRow}>
            <div>
              <div style={s.pageTitle}>Friends</div>
              <div style={s.pageSub}>{FRIENDS.length} buds · {done.length} done today</div>
            </div>
            <button style={s.addBtn} onClick={() => setScreen('add')}>+ Add</button>
          </div>

          {/* Search */}
          <div style={s.searchWrap}>
            <span style={s.searchIcon}>🔍</span>
            <input
              style={s.searchInput}
              placeholder="Search friends…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Done section */}
          {done.length > 0 && (
            <Section title="✅ Completed Today" count={done.length} c={c}>
              {done.map((f, i) => (
                <FriendRow key={f.id} f={f} c={c} delay={i * 0.05}
                  onChallenge={() => setChallenge(f)} />
              ))}
            </Section>
          )}

          {/* Waiting section */}
          {waiting.length > 0 && (
            <Section title="⏳ Haven't Done It Yet" count={waiting.length} c={c}>
              {waiting.map((f, i) => (
                <FriendRow key={f.id} f={f} c={c} delay={i * 0.05}
                  onChallenge={() => setChallenge(f)} />
              ))}
            </Section>
          )}

          {/* Invite nudge */}
          <div style={s.inviteNudge}>
            <div style={s.nudgeText}>Bring more friends into the challenge</div>
            <button style={s.nudgeBtn} onClick={() => setScreen('invite')}>
              🎁 Invite & Earn a Streak Shield
            </button>
          </div>
        </div>

        {/* Challenge modal */}
        {challenge && (
          <ChallengeModal friend={challenge} c={c} onClose={() => setChallenge(null)} />
        )}
      </div>
    );
  }

  // ─── ADD FRIENDS ──────────────────────────────────────────────────────────
  if (screen === 'add') {
    return (
      <div style={s.scroll}>
        <div style={s.wrap}>
          <div style={s.backRow}>
            <button style={s.backBtn} onClick={() => setScreen('list')}>← Back</button>
            <div style={s.pageTitle}>Add Friends</div>
            <div style={{ width: 60 }} />
          </div>

          {/* Search */}
          <div style={s.searchWrap}>
            <span style={s.searchIcon}>🔍</span>
            <input
              style={s.searchInput}
              placeholder="Search by name or @handle…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Quick actions */}
          <div style={s.quickRow}>
            <QuickAction icon="📱" label="Sync Contacts" c={c} />
            <QuickAction icon="📷" label="QR Code"       c={c} onClick={() => setScreen('qr')} />
            <QuickAction icon="💌" label="Share Link"    c={c} />
          </div>

          {/* Suggestions */}
          <div style={s.sectionLabel}>People you might know</div>
          {SUGGESTIONS.map((p, i) => (
            <SuggestionRow
              key={p.id} p={p} c={c}
              added={!!added[p.id]}
              onAdd={() => setAdded(a => ({ ...a, [p.id]: true }))}
              delay={i * 0.06}
            />
          ))}

          {/* Share options */}
          <div style={s.sectionLabel}>Invite via</div>
          <div style={s.shareGrid}>
            {[
              { icon: '🟢', name: 'WhatsApp',  color: '#25D366' },
              { icon: '💬', name: 'iMessage',  color: '#34C759' },
              { icon: '📸', name: 'Instagram', color: c.pink    },
              { icon: '✉️', name: 'Email',     color: c.coral   },
            ].map(s2 => (
              <ShareOption key={s2.name} {...s2} c={c} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── INVITE SCREEN ────────────────────────────────────────────────────────
  if (screen === 'invite') {
    return (
      <div style={s.scroll}>
        <div style={s.wrap}>
          <button style={s.backBtn} onClick={() => setScreen('list')}>← Back</button>

          <div style={s.inviteHero}>
            <div style={s.inviteShield}>🛡️</div>
            <h2 style={s.inviteTitle}>Invite a Friend,<br/>Earn a Streak Shield</h2>
            <p style={s.inviteSub}>
              Your friend joins Spark and completes their first challenge —
              you both get a <span style={{ color: c.gold, fontWeight: 700 }}>Streak Shield</span> that protects your streak for 1 day.
            </p>
          </div>

          <div style={s.inviteCode}>
            <div style={s.inviteCodeLabel}>Your invite code</div>
            <div style={s.inviteCodeVal}>SPARK-ZK42</div>
            <button style={s.copyBtn}>📋 Copy</button>
          </div>

          <div style={s.inviteStats}>
            <InviteStat val="3" label="Friends invited" c={c} />
            <InviteStat val="2" label="Shields earned"  c={c} color={c.gold} />
            <InviteStat val="1" label="Active shield"   c={c} color={c.green} />
          </div>

          <div style={s.shareGridLarge}>
            {[
              { icon: '🟢', name: 'WhatsApp',  msg: "I'm challenging you on Spark! Complete the daily 60-sec skill challenge with me 🔥 Join with my code: SPARK-ZK42" },
              { icon: '💬', name: 'iMessage',  msg: "Yo join Spark and do today's challenge with me ⚡ Code: SPARK-ZK42" },
              { icon: '📸', name: 'Instagram', msg: "Dming you my Spark invite link…" },
            ].map(i => (
              <InviteShareBtn key={i.name} {...i} c={c} />
            ))}
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
            <div style={s.qrHandle}>@zara_k · SPARK-ZK42</div>
          </div>
          <button style={s.saveQrBtn}>💾 Save to Photos</button>
        </div>
      </div>
    );
  }

  return null;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, count, c, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase' }}>{title}</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{count}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {children}
      </div>
    </div>
  );
}

function FriendRow({ f, c, onChallenge, delay }) {
  const scoreColor = f.score ? (STATUS_COLORS[f.score.toLowerCase()] || c.coral) : null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 14, padding: '10px 14px',
      animation: `slideUp 0.35s ease-out ${delay}s both`,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%', fontSize: 20,
        background: `linear-gradient(135deg, ${c.purple}30, ${c.pink}20)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>{f.avatar}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {f.name}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{f.handle} · 🔥 {f.streak}</div>
      </div>

      {f.status === 'done' ? (
        <div style={{
          padding: '4px 10px', borderRadius: 20,
          background: `${scoreColor}20`, border: `1px solid ${scoreColor}40`,
          fontSize: 12, fontWeight: 700, color: scoreColor,
        }}>{f.score}</div>
      ) : (
        <button style={{
          padding: '6px 12px', borderRadius: 20,
          background: `linear-gradient(135deg, ${c.coral}, ${c.pink})`,
          border: 'none', fontSize: 11, fontWeight: 700, color: '#fff',
          cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
        }} onClick={onChallenge}>⚡ Poke</button>
      )}
    </div>
  );
}

function SuggestionRow({ p, c, added, onAdd, delay }) {
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
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>{p.avatar}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{p.name}</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
          {p.handle} · {p.mutual} mutual · {p.followers} followers
        </div>
      </div>

      <button style={{
        padding: '7px 16px', borderRadius: 20, cursor: 'pointer',
        background: added ? 'rgba(6,255,165,0.15)' : `linear-gradient(135deg, ${c.coral}, ${c.pink})`,
        border: added ? `1px solid ${c.green}` : 'none',
        fontSize: 12, fontWeight: 700,
        color: added ? c.green : '#fff',
        fontFamily: "'DM Sans', sans-serif",
        transition: 'all 0.2s',
      }} onClick={onAdd}>
        {added ? '✓ Added' : '+ Add'}
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

function ShareOption({ icon, name, color, c }) {
  return (
    <button style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      background: `${color}15`, border: `1px solid ${color}30`,
      borderRadius: 14, padding: '14px 8px', cursor: 'pointer',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontSize: 10, fontWeight: 600, color: color }}>{name}</span>
    </button>
  );
}

function InviteStat({ val, label, c, color }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 28, fontWeight: 700, color: color || '#fff',
      }}>{val}</div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>{label}</div>
    </div>
  );
}

function InviteShareBtn({ icon, name, msg, c }) {
  return (
    <button style={{
      width: '100%', padding: '14px 16px',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12,
      cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
    }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{name}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{msg.slice(0, 50)}…</div>
      </div>
      <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>›</span>
    </button>
  );
}

function QRPlaceholder({ c }) {
  // Build a simple decorative "QR-like" grid
  const cells = Array.from({ length: 100 }, (_, i) => Math.random() > 0.5);
  return (
    <div style={{
      width: 200, height: 200, display: 'grid', gridTemplateColumns: 'repeat(10,1fr)',
      gap: 2, padding: 10,
      background: '#fff', borderRadius: 16,
      margin: '0 auto',
    }}>
      {cells.map((filled, i) => (
        <div key={i} style={{
          background: filled ? '#050508' : '#fff',
          borderRadius: 1,
        }} />
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
          <div style={{ fontSize: 44 }}>{friend.avatar}</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>{friend.name}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{friend.handle}</div>
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
    quickRow: { display: 'flex', gap: 10 },
    sectionLabel: {
      fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)',
      letterSpacing: 1, textTransform: 'uppercase', padding: '4px 2px',
    },
    shareGrid: { display: 'flex', gap: 8 },
    shareGridLarge: { display: 'flex', flexDirection: 'column', gap: 10 },
    backRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    backBtn: {
      background: 'none', border: 'none', color: c.coral,
      fontSize: 14, fontWeight: 600, cursor: 'pointer',
      fontFamily: "'DM Sans', sans-serif", padding: 0,
    },
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
      borderRadius: 16, padding: '20px', display: 'flex',
      flexDirection: 'column', alignItems: 'center', gap: 10,
    },
    inviteCodeLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase' },
    inviteCodeVal: {
      fontFamily: "'Space Mono', monospace",
      fontSize: 28, fontWeight: 700, color: c.gold,
      letterSpacing: 4, textShadow: `0 0 20px ${c.gold}60`,
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
