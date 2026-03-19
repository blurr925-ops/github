import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const SCORE_COLORS = { nailed: '#06FFA5', almost: '#FFD23F', failed: '#FF6B35' };

export default function Ranks({ colors: c, user }) {
  const [tab,      setTab]      = useState('daily');
  const [leaders,  setLeaders]  = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [challenge, setChallenge] = useState(null);

  const s = styles(c);

  // ─── Load daily leaderboard ───────────────────────────────────────────────
  const loadDaily = async () => {
    setLoading(true);

    const today = new Date().toISOString().slice(0, 10);
    const { data: ch } = await supabase
      .from('challenges')
      .select('id, title, skill_category')
      .eq('date', today)
      .single();

    if (ch) setChallenge(ch);

    if (!ch) { setLeaders([]); setLoading(false); return; }

    const { data, count } = await supabase
      .from('attempts')
      .select(`
        user_id,
        result,
        duration_ms,
        points_earned,
        profile:profiles!attempts_user_id_fkey(id, display_name, handle, avatar_emoji, streak, total_points)
      `, { count: 'exact' })
      .eq('challenge_id', ch.id)
      .order('result',      { ascending: true })   // nailed < almost < failed alphabetically — we re-sort below
      .order('duration_ms', { ascending: true });

    setTotal(count || 0);

    if (!data) { setLeaders([]); setLoading(false); return; }

    // Sort: nailed first (by duration), then almost (by duration), then failed
    const ORDER = { nailed: 0, almost: 1, failed: 2 };
    const sorted = [...data].sort((a, b) => {
      const od = ORDER[a.result] - ORDER[b.result];
      if (od !== 0) return od;
      return (a.duration_ms ?? Infinity) - (b.duration_ms ?? Infinity);
    });

    setLeaders(sorted.map((row, i) => ({
      rank:         i + 1,
      id:           row.profile.id,
      name:         row.profile.display_name,
      handle:       row.profile.handle,
      avatar:       row.profile.avatar_emoji,
      streak:       row.profile.streak,
      points:       row.profile.total_points,
      result:       row.result,
      duration_ms:  row.duration_ms,
      isMe:         row.profile.id === user?.id,
    })));
    setLoading(false);
  };

  // ─── Load weekly leaderboard ──────────────────────────────────────────────
  const loadWeekly = async () => {
    setLoading(true);

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Sum points per user over the last 7 days
    const { data } = await supabase
      .from('attempts')
      .select(`
        user_id,
        points_earned,
        profile:profiles!attempts_user_id_fkey(id, display_name, handle, avatar_emoji, streak)
      `)
      .gte('created_at', weekAgo);

    if (!data) { setLeaders([]); setLoading(false); return; }

    const byUser = {};
    data.forEach(row => {
      if (!byUser[row.user_id]) {
        byUser[row.user_id] = { ...row.profile, weeklyPoints: 0 };
      }
      byUser[row.user_id].weeklyPoints += row.points_earned;
    });

    const sorted = Object.values(byUser)
      .sort((a, b) => b.weeklyPoints - a.weeklyPoints);

    setLeaders(sorted.map((p, i) => ({
      rank:   i + 1,
      id:     p.id,
      name:   p.display_name,
      handle: p.handle,
      avatar: p.avatar_emoji,
      streak: p.streak,
      points: p.weeklyPoints,
      isMe:   p.id === user?.id,
    })));
    setLoading(false);
  };

  useEffect(() => {
    if (tab === 'daily') loadDaily();
    else                 loadWeekly();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, user]);

  const champion = leaders[0];
  const me       = leaders.find(l => l.isMe);

  const challengeLabel = challenge
    ? `${challenge.skill_category} · Today`
    : 'Today';

  return (
    <div style={s.scroll}>
      <div style={s.wrap}>
        {/* Header */}
        <div style={s.pageHeader}>
          <div style={s.pageTitle}>Leaderboard</div>
          <div style={s.pageSub}>{challengeLabel}</div>
        </div>

        {/* Period selector */}
        <div style={s.periodRow}>
          {[
            { id: 'daily',  label: '⚡ Today'    },
            { id: 'weekly', label: '📅 This Week' },
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

        {loading ? (
          <div style={s.loadingBox}>Loading rankings…</div>
        ) : leaders.length === 0 ? (
          <div style={s.emptyBox}>
            <div style={{ fontSize: 40 }}>🏁</div>
            <div style={s.emptyTitle}>No attempts yet</div>
            <div style={s.emptySub}>Be the first to complete today's challenge!</div>
          </div>
        ) : (
          <>
            {/* Champion card */}
            {champion && (
              <div style={s.championCard}>
                <div style={s.champGlow} />
                <div style={s.champCrown}>👑</div>
                <div style={s.champAvatar}>{champion.avatar}</div>
                <div style={s.champName}>{champion.name}</div>
                <div style={s.champHandle}>@{champion.handle}</div>

                <div style={s.champStats}>
                  <ChampStat val={(champion.points || 0).toLocaleString()} label="Points" color={c.gold} />
                  <div style={s.champDivider} />
                  <ChampStat val={`🔥 ${champion.streak}`} label="Streak" color={c.coral} />
                  {tab === 'daily' && champion.duration_ms && (
                    <>
                      <div style={s.champDivider} />
                      <ChampStat val={`${(champion.duration_ms / 1000).toFixed(1)}s`} label="Time" color={c.green} />
                    </>
                  )}
                </div>
              </div>
            )}

            {/* My rank callout */}
            {me && (
              <div style={s.myRankCard}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 22, fontWeight: 700, color: c.coral, minWidth: 34 }}>
                  #{me.rank}
                </div>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', fontSize: 20,
                  background: `linear-gradient(135deg, ${c.coral}30, ${c.pink}20)`,
                  border: `2px solid ${c.coral}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>{me.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>You · {me.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                    {(me.points || 0).toLocaleString()} pts · 🔥 {me.streak} streak
                  </div>
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: c.coral,
                  background: `${c.coral}15`, borderRadius: 20, padding: '4px 10px',
                }}>YOUR RANK</div>
              </div>
            )}

            {/* Leaderboard rows */}
            <div style={s.sectionLabel}>All Rankings</div>
            {leaders.map((l, i) => (
              <LeaderRow key={l.id} l={l} c={c} tab={tab} delay={i * 0.04} />
            ))}

            {/* Footer */}
            <div style={s.footer}>
              <div style={s.footerText}>Rankings update in real time</div>
              {tab === 'daily' && total > 0 && (
                <div style={s.footerSub}>{total.toLocaleString()} people attempted today's challenge</div>
              )}
            </div>
          </>
        )}
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

function LeaderRow({ l, c, tab, delay }) {
  const isTop3    = l.rank <= 3;
  const scoreCol  = SCORE_COLORS[l.result] || 'rgba(255,255,255,0.3)';
  const medals    = { 1: '🥇', 2: '🥈', 3: '🥉' };
  const timeLabel = l.duration_ms
    ? `${(l.duration_ms / 1000).toFixed(1)}s left`
    : 'DNF';

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
      animation: `slideUp 0.3s ease-out ${delay}s both`,
    }}>
      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: medals[l.rank] ? 20 : 13,
        fontWeight: 700,
        color: 'rgba(255,255,255,0.3)',
        minWidth: 28, textAlign: 'center',
      }}>{medals[l.rank] || `#${l.rank}`}</div>

      <div style={{
        width: 36, height: 36, borderRadius: '50%', fontSize: 17,
        background: 'rgba(120,75,160,0.3)',
        border: l.isMe ? `2px solid ${c.coral}` : '2px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>{l.avatar}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 700,
          color: l.isMe ? c.coral : '#fff',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {l.name}{l.isMe && <span style={{ fontSize: 10, color: c.coral }}> ·YOU</span>}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
          🔥 {l.streak} · {(l.points || 0).toLocaleString()} pts
        </div>
      </div>

      {tab === 'daily' && l.result && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: scoreCol,
            padding: '3px 8px', borderRadius: 20,
            background: `${scoreCol}15`, border: `1px solid ${scoreCol}30`,
          }}>{l.result.charAt(0).toUpperCase() + l.result.slice(1)}</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
            {l.result === 'failed' ? 'DNF' : timeLabel}
          </div>
        </div>
      )}

      {tab === 'weekly' && (
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700, color: c.gold }}>
          {(l.points || 0).toLocaleString()}
        </div>
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

    loadingBox: { textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.3)', fontSize: 14 },
    emptyBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '40px 20px', textAlign: 'center' },
    emptyTitle: { fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.6)' },
    emptySub: { fontSize: 13, color: 'rgba(255,255,255,0.3)' },

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
    champCrown: { fontSize: 28, position: 'relative', animation: 'float 3s ease-in-out infinite' },
    champAvatar: {
      width: 70, height: 70, borderRadius: '50%', fontSize: 34,
      background: `linear-gradient(135deg, ${c.gold}30, ${c.coral}20)`,
      border: `3px solid ${c.gold}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 0 30px ${c.gold}50`, position: 'relative',
    },
    champName: { fontSize: 20, fontWeight: 800, color: '#fff', position: 'relative', marginTop: 4 },
    champHandle: { fontSize: 13, color: 'rgba(255,255,255,0.4)', position: 'relative' },
    champStats: {
      position: 'relative', display: 'flex', alignItems: 'center', gap: 20,
      background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: '12px 20px', marginTop: 6,
    },
    champDivider: { width: 1, height: 28, background: 'rgba(255,255,255,0.1)' },

    myRankCard: {
      background: `linear-gradient(135deg, ${c.coral}15, ${c.pink}10)`,
      border: `1px solid ${c.coral}40`,
      borderRadius: 16, padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
      animation: 'slideUp 0.4s ease-out 0.1s both',
    },

    sectionLabel: {
      fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)',
      letterSpacing: 1, textTransform: 'uppercase', padding: '4px 2px',
    },

    footer: { textAlign: 'center', padding: '10px 0 4px', display: 'flex', flexDirection: 'column', gap: 4 },
    footerText: { fontSize: 12, color: 'rgba(255,255,255,0.25)' },
    footerSub:  { fontSize: 11, color: 'rgba(255,255,255,0.2)' },
  };
}
