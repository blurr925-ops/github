import React, { useState } from 'react';

const GROUPS = [
  {
    id: 1,
    name: 'Night Owls 🦉',
    emoji: '🌙',
    members: [
      { name: 'Zara K',    avatar: '😎', score: 'Nailed', rank: 1, streak: 14 },
      { name: 'Alex C',    avatar: '🎯', score: 'Nailed', rank: 2, streak: 12 },
      { name: 'Riley Z',   avatar: '🌟', score: 'Almost', rank: 3, streak: 10 },
      { name: 'Maya P',    avatar: '🎨', score: 'Almost', rank: 4, streak: 7  },
      { name: 'Jordan K',  avatar: '🎵', score: null,      rank: 5, streak: 5  },
      { name: 'Sam T',     avatar: '🏄', score: null,      rank: 6, streak: 3  },
    ],
    streak: 18,
    done: 4,
    total: 6,
    type: 'daily',
    color: '#784BA0',
  },
  {
    id: 2,
    name: 'Drum Crew 🥁',
    emoji: '🥁',
    members: [
      { name: 'Zara K',    avatar: '😎', score: 'Nailed', rank: 1, streak: 14 },
      { name: 'Nico F',    avatar: '🎪', score: 'Nailed', rank: 2, streak: 9  },
      { name: 'Quinn O',   avatar: '🏆', score: 'Failed', rank: 3, streak: 6  },
    ],
    streak: 5,
    done: 2,
    total: 3,
    type: 'custom',
    customChallenge: 'Ghost Stroke Rolls',
    color: '#FF6B35',
  },
  {
    id: 3,
    name: 'College Chaos',
    emoji: '🎓',
    members: [
      { name: 'Devon W',   avatar: '🎸', score: 'Almost', rank: 1, streak: 21 },
      { name: 'Jade N',    avatar: '🌊', score: 'Nailed', rank: 2, streak: 15 },
      { name: 'Casey P',   avatar: '🔥', score: 'Nailed', rank: 3, streak: 9  },
      { name: 'Zara K',    avatar: '😎', score: null,      rank: 4, streak: 14 },
      { name: 'Sam T',     avatar: '🏄', score: null,      rank: 5, streak: 3  },
    ],
    streak: 31,
    done: 3,
    total: 5,
    type: 'daily',
    color: '#06FFA5',
  },
];

const SCORE_COLORS = { Nailed: '#06FFA5', Almost: '#FFD23F', Failed: '#FF6B35' };
const RANK_MEDALS  = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function Groups({ colors: c }) {
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const s = styles(c);

  // ─── GROUP DETAIL ─────────────────────────────────────────────────────────
  if (selected) {
    const g = GROUPS.find(x => x.id === selected);
    const done    = g.members.filter(m => m.score);
    const waiting = g.members.filter(m => !m.score);

    return (
      <div style={s.scroll}>
        <div style={s.wrap}>
          <div style={s.backRow}>
            <button style={s.backBtn} onClick={() => setSelected(null)}>← Back</button>
          </div>

          {/* Group hero */}
          <div style={{ ...s.groupHero, borderColor: `${g.color}40`, background: `linear-gradient(135deg, ${g.color}15, rgba(13,13,26,0.8))` }}>
            <div style={s.heroEmoji}>{g.emoji}</div>
            <div>
              <div style={s.heroName}>{g.name}</div>
              <div style={s.heroMeta}>{g.members.length} members · 🔥 {g.streak} day streak</div>
            </div>
            <div style={{ ...s.typeBadge, background: `${g.color}20`, borderColor: `${g.color}40`, color: g.color }}>
              {g.type === 'custom' ? '⚡ Custom' : '📅 Daily'}
            </div>
          </div>

          {g.type === 'custom' && (
            <div style={s.customChallengeBox}>
              <div style={s.customLabel}>Today's Custom Challenge</div>
              <div style={s.customName}>🎯 {g.customChallenge}</div>
            </div>
          )}

          {/* Progress bar */}
          <div style={s.progressBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Group progress</span>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: c.green }}>
                {done.length}/{g.members.length} done
              </span>
            </div>
            <div style={s.progressTrack}>
              <div style={{ ...s.progressFill, width: `${(done.length / g.members.length) * 100}%`, background: `linear-gradient(90deg, ${g.color}, ${c.pink})` }} />
            </div>
          </div>

          {/* Leaderboard */}
          <div style={s.sectionLabel}>🏆 Leaderboard</div>
          {g.members.map((m, i) => (
            <MemberRow key={i} m={m} c={c} rank={i + 1} delay={i * 0.05} />
          ))}

          <div style={s.groupActions}>
            <button style={{ ...s.groupBtn, background: `linear-gradient(135deg, ${c.coral}, ${c.pink})` }}>
              ⚡ Challenge Group
            </button>
            <button style={s.groupBtnOut}>👋 Leave Group</button>
          </div>
        </div>
      </div>
    );
  }

  // ─── GROUP LIST ───────────────────────────────────────────────────────────
  return (
    <div style={s.scroll}>
      <div style={s.wrap}>
        <div style={s.topRow}>
          <div>
            <div style={s.pageTitle}>Groups</div>
            <div style={s.pageSub}>{GROUPS.length} active · {GROUPS.reduce((a, g) => a + g.done, 0)} done today</div>
          </div>
          <button style={s.createBtn} onClick={() => setShowCreate(true)}>+ New</button>
        </div>

        {GROUPS.map((g, i) => (
          <GroupCard key={g.id} g={g} c={c} delay={i * 0.07} onClick={() => setSelected(g.id)} />
        ))}

        {/* Create group nudge */}
        <button style={s.createNudge} onClick={() => setShowCreate(true)}>
          <span style={{ fontSize: 24 }}>➕</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Create a Group</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Daily or custom challenges with your crew</div>
          </div>
        </button>
      </div>

      {showCreate && <CreateGroupModal c={c} onClose={() => setShowCreate(false)} />}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function GroupCard({ g, c, delay, onClick }) {
  const pct = (g.done / g.total) * 100;

  return (
    <div style={{
      borderRadius: 18, overflow: 'hidden',
      background: `linear-gradient(135deg, ${g.color}12, rgba(13,13,26,0.95))`,
      border: `1px solid ${g.color}30`,
      padding: '16px',
      animation: `slideUp 0.35s ease-out ${delay}s both`,
      cursor: 'pointer',
    }} onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        {/* Icon */}
        <div style={{
          width: 50, height: 50, borderRadius: 14, fontSize: 24,
          background: `${g.color}20`, border: `1px solid ${g.color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>{g.emoji}</div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {g.name}
            </div>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
              padding: '2px 7px', borderRadius: 20,
              background: `${g.color}20`, border: `1px solid ${g.color}40`, color: g.color,
              flexShrink: 0,
            }}>{g.type === 'custom' ? 'Custom' : 'Daily'}</div>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            👥 {g.members.length} members · 🔥 {g.streak} streak
          </div>
        </div>

        {/* Arrow */}
        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 18 }}>›</div>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`, borderRadius: 3,
            background: `linear-gradient(90deg, ${g.color}, ${c.pink})`,
            transition: 'width 0.8s ease',
          }} />
        </div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: g.color, fontWeight: 700, flexShrink: 0 }}>
          {g.done}/{g.total}
        </div>
      </div>

      {/* Avatars */}
      <div style={{ display: 'flex', marginTop: 10, gap: 2 }}>
        {g.members.slice(0, 5).map((m, i) => (
          <div key={i} style={{
            width: 28, height: 28, borderRadius: '50%', fontSize: 14,
            background: `linear-gradient(135deg, ${g.color}30, ${c.purple}20)`,
            border: `2px solid ${g.color}${m.score ? 'ff' : '40'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginLeft: i > 0 ? -6 : 0, position: 'relative', zIndex: 5 - i,
            filter: m.score ? 'none' : 'grayscale(0.8) opacity(0.5)',
          }}>{m.avatar}</div>
        ))}
        {g.members.length > 5 && (
          <div style={{
            width: 28, height: 28, borderRadius: '50%', fontSize: 10,
            background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.5)', fontWeight: 700,
            marginLeft: -6,
          }}>+{g.members.length - 5}</div>
        )}
      </div>
    </div>
  );
}

function MemberRow({ m, c, rank, delay }) {
  const medal = RANK_MEDALS[rank];
  const scoreColor = m.score ? (SCORE_COLORS[m.score] || c.coral) : null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: rank === 1 ? 'rgba(255,210,63,0.07)' : 'rgba(255,255,255,0.03)',
      border: rank === 1 ? `1px solid rgba(255,210,63,0.2)` : '1px solid rgba(255,255,255,0.06)',
      borderRadius: 14, padding: '10px 14px',
      animation: `rankRow 0.35s ease-out ${delay}s both`,
    }}>
      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: medal ? 20 : 13, fontWeight: 700,
        color: medal ? 'transparent' : 'rgba(255,255,255,0.3)',
        minWidth: 28, textAlign: 'center',
      }}>{medal || `#${rank}`}</div>

      <div style={{
        width: 38, height: 38, borderRadius: '50%', fontSize: 18,
        background: `linear-gradient(135deg, rgba(120,75,160,0.3), rgba(255,60,172,0.2))`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>{m.avatar}</div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{m.name}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>🔥 {m.streak} day streak</div>
      </div>

      {m.score ? (
        <div style={{
          padding: '4px 10px', borderRadius: 20,
          background: `${scoreColor}20`, border: `1px solid ${scoreColor}40`,
          fontSize: 12, fontWeight: 700, color: scoreColor,
        }}>{m.score}</div>
      ) : (
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>Pending…</div>
      )}
    </div>
  );
}

function CreateGroupModal({ c, onClose }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('daily');

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
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Create Group ➕</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12, padding: '14px 16px', color: '#fff',
              fontSize: 15, fontFamily: "'DM Sans', sans-serif", outline: 'none',
            }}
            placeholder="Group name…"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <div style={{ display: 'flex', gap: 8 }}>
            {['daily', 'custom'].map(t => (
              <button key={t} style={{
                flex: 1, padding: '12px',
                background: type === t ? `linear-gradient(135deg, ${c.coral}, ${c.pink})` : 'rgba(255,255,255,0.05)',
                border: type === t ? 'none' : '1px solid rgba(255,255,255,0.09)',
                borderRadius: 12, cursor: 'pointer',
                fontSize: 13, fontWeight: 700, color: '#fff',
                fontFamily: "'DM Sans', sans-serif",
              }} onClick={() => setType(t)}>
                {t === 'daily' ? '📅 Daily Challenge' : '⚡ Custom Challenge'}
              </button>
            ))}
          </div>

          <button style={{
            width: '100%', padding: '15px',
            background: `linear-gradient(135deg, ${c.coral}, ${c.pink})`,
            border: 'none', borderRadius: 14, cursor: 'pointer',
            fontSize: 15, fontWeight: 700, color: '#fff',
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: `0 8px 24px ${c.coral}50`,
          }} onClick={onClose}>
            Create Group 🔥
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
function styles(c) {
  return {
    scroll: { height: '100%', overflowY: 'auto', WebkitOverflowScrolling: 'touch' },
    wrap: { display: 'flex', flexDirection: 'column', gap: 14, padding: '16px 16px 40px', animation: 'slideUp 0.35s ease-out' },
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    pageTitle: { fontSize: 24, fontWeight: 800, color: '#fff' },
    pageSub: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
    createBtn: {
      background: `linear-gradient(135deg, ${c.coral}, ${c.pink})`,
      border: 'none', borderRadius: 20, padding: '8px 18px',
      fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer',
      fontFamily: "'DM Sans', sans-serif",
    },
    createNudge: {
      display: 'flex', alignItems: 'center', gap: 14,
      background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.12)',
      borderRadius: 18, padding: '16px', cursor: 'pointer',
      fontFamily: "'DM Sans', sans-serif",
    },
    backRow: { display: 'flex', alignItems: 'center' },
    backBtn: {
      background: 'none', border: 'none', color: c.coral,
      fontSize: 14, fontWeight: 600, cursor: 'pointer',
      fontFamily: "'DM Sans', sans-serif", padding: 0,
    },
    groupHero: {
      borderRadius: 18, border: '1px solid', padding: '16px',
      display: 'flex', alignItems: 'center', gap: 12,
    },
    heroEmoji: { fontSize: 36, flexShrink: 0 },
    heroName: { fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 2 },
    heroMeta: { fontSize: 12, color: 'rgba(255,255,255,0.45)' },
    typeBadge: {
      marginLeft: 'auto', flexShrink: 0,
      fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
      padding: '4px 10px', borderRadius: 20, border: '1px solid',
    },
    customChallengeBox: {
      background: `${c.coral}12`, border: `1px solid ${c.coral}30`,
      borderRadius: 14, padding: '12px 16px',
    },
    customLabel: { fontSize: 10, letterSpacing: 2, color: c.coral, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 },
    customName: { fontSize: 16, fontWeight: 700, color: '#fff' },
    progressBox: {
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14, padding: '14px 16px',
    },
    progressTrack: { height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 3, transition: 'width 0.8s ease' },
    sectionLabel: {
      fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)',
      letterSpacing: 1, textTransform: 'uppercase', padding: '4px 2px',
    },
    groupActions: { display: 'flex', flexDirection: 'column', gap: 10 },
    groupBtn: {
      width: '100%', padding: '15px', border: 'none', borderRadius: 14, cursor: 'pointer',
      fontSize: 15, fontWeight: 700, color: '#fff',
      fontFamily: "'DM Sans', sans-serif",
      boxShadow: `0 8px 24px ${c.coral}50`,
    },
    groupBtnOut: {
      width: '100%', padding: '13px',
      background: 'none', border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 14, cursor: 'pointer',
      fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.5)',
      fontFamily: "'DM Sans', sans-serif",
    },
  };
}
