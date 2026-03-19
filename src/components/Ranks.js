import React, { useState } from 'react';

const DAILY_LEADERS = [
  { rank: 1,  name: 'Riley Zhao',   handle: '@rileyZ',    avatar: '🌟', score: 'Nailed', time: '4.2s', streak: 45, points: 2840, badge: '👑' },
  { rank: 2,  name: 'Devon Walsh',  handle: '@devonw',    avatar: '🎸', score: 'Nailed', time: '5.1s', streak: 21, points: 2610, badge: '🥈' },
  { rank: 3,  name: 'Quinn Osei',   handle: '@quinno',    avatar: '🏆', score: 'Nailed', time: '7.8s', streak: 33, points: 2410, badge: '🥉' },
  { rank: 4,  name: 'Zara K',       handle: '@zara_k',    avatar: '😎', score: 'Nailed', time: '9.0s', streak: 14, points: 2180, badge: null, isMe: true },
  { rank: 5,  name: 'Jade Nguyen',  handle: '@jadeN',     avatar: '🌊', score: 'Almost', time: '11s',  streak: 15, points: 1950, badge: null },
  { rank: 6,  name: 'Alex Chen',    handle: '@alex_c',    avatar: '🎯', score: 'Almost', time: '13s',  streak: 12, points: 1820, badge: null },
  { rank: 7,  name: 'Maya Patel',   handle: '@mayap',     avatar: '🎨', score: 'Almost', time: '18s',  streak: 7,  points: 1640, badge: null },
  { rank: 8,  name: 'Nico Ferrer',  handle: '@nicofer',   avatar: '🎪', score: 'Almost', time: '22s',  streak: 9,  points: 1510, badge: null },
  { rank: 9,  name: 'Sam Torres',   handle: '@samtorres', avatar: '🏄', score: 'Failed', time: '60s',  streak: 3,  points: 920,  badge: null },
  { rank: 10, name: 'Casey Park',   handle: '@caseyp',    avatar: '🔥', score: 'Failed', time: '60s',  streak: 9,  points: 840,  badge: null },
];

const WEEKLY_LEADERS = [
  { rank: 1,  name: 'Quinn Osei',   handle: '@quinno',    avatar: '🏆', streak: 33, points: 19200, badge: '👑' },
  { rank: 2,  name: 'Riley Zhao',   handle: '@rileyZ',    avatar: '🌟', streak: 45, points: 18750, badge: '🥈' },
  { rank: 3,  name: 'Devon Walsh',  handle: '@devonw',    avatar: '🎸', streak: 21, points: 17300, badge: '🥉' },
  { rank: 4,  name: 'Jade Nguyen',  handle: '@jadeN',     avatar: '🌊', streak: 15, points: 15100, badge: null },
  { rank: 5,  name: 'Zara K',       handle: '@zara_k',    avatar: '😎', streak: 14, points: 14800, badge: null, isMe: true },
];

const SCORE_COLORS = { Nailed: '#06FFA5', Almost: '#FFD23F', Failed: '#FF6B35' };

export default function Ranks({ colors: c }) {
  const [tab, setTab] = useState('daily'); // daily | weekly | alltime

  const leaders = tab === 'daily' ? DAILY_LEADERS : WEEKLY_LEADERS;
  const champion = leaders[0];

  const s = styles(c);

  return (
    <div style={s.scroll}>
      <div style={s.wrap}>
        {/* Page header */}
        <div style={s.pageHeader}>
          <div style={s.pageTitle}>Leaderboard</div>
          <div style={s.pageSub}>Finger Drumming · Today</div>
        </div>

        {/* Period selector */}
        <div style={s.periodRow}>
          {[
            { id: 'daily',  label: '⚡ Today'     },
            { id: 'weekly', label: '📅 This Week'  },
          ].map(p => (
            <button
              key={p.id}
              style={{ ...s.periodBtn, ...(tab === p.id ? s.periodBtnActive : {}) }}
              onClick={() => setTab(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Champion card */}
        <div style={s.championCard}>
          <div style={s.champGlow} />
          <div style={s.champCrown}>👑</div>
          <div style={s.champAvatar}>{champion.avatar}</div>
          <div style={s.champName}>{champion.name}</div>
          <div style={s.champHandle}>{champion.handle}</div>

          <div style={s.champStats}>
            <ChampStat val={champion.points.toLocaleString()} label="Points" color={c.gold} />
            <div style={s.champDivider} />
            <ChampStat val={`🔥 ${champion.streak}`} label="Streak" color={c.coral} />
            {tab === 'daily' && (
              <>
                <div style={s.champDivider} />
                <ChampStat val={champion.time} label="Fastest" color={c.green} />
              </>
            )}
          </div>
        </div>

        {/* Your rank callout */}
        <MyRankCard leaders={leaders} c={c} />

        {/* Leaderboard rows */}
        <div style={s.sectionLabel}>All Rankings</div>
        {leaders.map((l, i) => (
          <LeaderRow key={l.rank} l={l} c={c} tab={tab} delay={i * 0.04} />
        ))}

        {/* Footer */}
        <div style={s.footer}>
          <div style={s.footerText}>Rankings update every 10 minutes</div>
          <div style={s.footerSub}>
            {(14832).toLocaleString()} people attempted today's challenge
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ChampStat({ val, label, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 16, fontWeight: 700, color }}>{val}</div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function MyRankCard({ leaders, c }) {
  const me = leaders.find(l => l.isMe);
  if (!me) return null;

  return (
    <div style={{
      background: `linear-gradient(135deg, ${c.coral}15, ${c.pink}10)`,
      border: `1px solid ${c.coral}40`,
      borderRadius: 16, padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
      animation: 'slideUp 0.4s ease-out 0.1s both',
    }}>
      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 22, fontWeight: 700, color: c.coral, minWidth: 34,
      }}>#{me.rank}</div>
      <div style={{
        width: 40, height: 40, borderRadius: '50%', fontSize: 20,
        background: `linear-gradient(135deg, ${c.coral}30, ${c.pink}20)`,
        border: `2px solid ${c.coral}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>{me.avatar}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>You · {me.name}</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
          {me.points.toLocaleString()} pts · 🔥 {me.streak} streak
        </div>
      </div>
      <div style={{
        fontSize: 11, fontWeight: 700, color: c.coral,
        background: `${c.coral}15`, borderRadius: 20, padding: '4px 10px',
      }}>YOUR RANK</div>
    </div>
  );
}

function LeaderRow({ l, c, tab, delay }) {
  const isTop3   = l.rank <= 3;
  const scoreCol = SCORE_COLORS[l.score] || 'rgba(255,255,255,0.3)';
  const medals   = { 1: '🥇', 2: '🥈', 3: '🥉' };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: l.isMe
        ? `linear-gradient(135deg, ${c.coral}10, ${c.pink}08)`
        : isTop3 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.025)',
      border: l.isMe
        ? `1px solid ${c.coral}30`
        : isTop3 ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(255,255,255,0.05)',
      borderRadius: 14, padding: '10px 12px',
      animation: `rankRow 0.3s ease-out ${delay}s both`,
    }}>
      {/* Rank */}
      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: medals[l.rank] ? 20 : 13,
        fontWeight: 700,
        color: medals[l.rank] ? 'transparent' : 'rgba(255,255,255,0.3)',
        minWidth: 28, textAlign: 'center',
      }}>{medals[l.rank] || `#${l.rank}`}</div>

      {/* Avatar */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%', fontSize: 17,
        background: `linear-gradient(135deg, rgba(120,75,160,0.3), rgba(255,60,172,0.2))`,
        border: l.isMe ? `2px solid ${c.coral}` : '2px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{l.avatar}</div>

      {/* Name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 700,
          color: l.isMe ? c.coral : '#fff',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          {l.name}
          {l.isMe && <span style={{ fontSize: 10, color: c.coral }}>·YOU</span>}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
          🔥 {l.streak} · {l.points.toLocaleString()} pts
        </div>
      </div>

      {/* Score / Time */}
      {tab === 'daily' && l.score && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: scoreCol,
            padding: '3px 8px', borderRadius: 20,
            background: `${scoreCol}15`, border: `1px solid ${scoreCol}30`,
          }}>{l.score}</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
            {l.score === 'Failed' ? 'DNF' : l.time + ' left'}
          </div>
        </div>
      )}

      {tab === 'weekly' && (
        <div style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 13, fontWeight: 700, color: c.gold,
        }}>{l.points.toLocaleString()}</div>
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
function styles(c) {
  return {
    scroll: { height: '100%', overflowY: 'auto', WebkitOverflowScrolling: 'touch' },
    wrap: { display: 'flex', flexDirection: 'column', gap: 14, padding: '16px 16px 40px', animation: 'slideUp 0.35s ease-out' },
    pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
    pageTitle: { fontSize: 24, fontWeight: 800, color: '#fff' },
    pageSub: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },

    periodRow: {
      display: 'flex', gap: 8,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12, padding: 4,
    },
    periodBtn: {
      flex: 1, padding: '9px 8px', background: 'none', border: 'none',
      borderRadius: 9, fontSize: 13, fontWeight: 600,
      color: 'rgba(255,255,255,0.45)', cursor: 'pointer',
      fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
    },
    periodBtnActive: {
      background: `linear-gradient(135deg, ${c.coral}, ${c.pink})`,
      color: '#fff', boxShadow: `0 4px 14px ${c.coral}40`,
    },

    championCard: {
      borderRadius: 22, overflow: 'hidden', position: 'relative',
      background: 'linear-gradient(145deg, #1a0a00, #1a0020, #0d0d1a)',
      border: `1px solid ${c.gold}30`,
      padding: '28px 20px 20px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      animation: 'cardReveal 0.5s cubic-bezier(0.34,1.56,0.64,1) both',
    },
    champGlow: {
      position: 'absolute', inset: 0,
      background: `radial-gradient(ellipse at 50% 0%, ${c.gold}15 0%, transparent 60%)`,
      pointerEvents: 'none',
    },
    champCrown: {
      fontSize: 28, position: 'relative',
      animation: 'float 3s ease-in-out infinite',
    },
    champAvatar: {
      width: 70, height: 70, borderRadius: '50%', fontSize: 34,
      background: `linear-gradient(135deg, ${c.gold}30, ${c.coral}20)`,
      border: `3px solid ${c.gold}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 0 30px ${c.gold}50`,
      position: 'relative',
    },
    champName: { fontSize: 20, fontWeight: 800, color: '#fff', position: 'relative', marginTop: 4 },
    champHandle: { fontSize: 13, color: 'rgba(255,255,255,0.4)', position: 'relative' },
    champStats: {
      position: 'relative', display: 'flex', alignItems: 'center', gap: 20,
      background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: '12px 20px', marginTop: 6,
    },
    champDivider: { width: 1, height: 28, background: 'rgba(255,255,255,0.1)' },

    sectionLabel: {
      fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)',
      letterSpacing: 1, textTransform: 'uppercase', padding: '4px 2px',
    },

    footer: { textAlign: 'center', padding: '10px 0 4px', display: 'flex', flexDirection: 'column', gap: 4 },
    footerText: { fontSize: 12, color: 'rgba(255,255,255,0.25)' },
    footerSub: { fontSize: 11, color: 'rgba(255,255,255,0.2)' },
  };
}
