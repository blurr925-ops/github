import React, { useState, useEffect, useRef, useCallback } from 'react';

const CHALLENGE = {
  title: 'Finger Drumming',
  subtitle: 'Trap Hi-Hat Pattern',
  category: 'Music',
  emoji: '🥁',
  difficulty: 'Medium',
  description: 'Match the 4-bar hi-hat pattern: open-closed-open-closed on every 8th note.',
  proTip: 'Keep your wrist loose. Relax your elbow and let gravity do the work.',
  participants: 14832,
  nailed: 31,
  tag: '#FingerDrumming',
};

const TOTAL_SECS = 60;
const CIRCUMFERENCE = 2 * Math.PI * 90; // r=90

function pad(n) { return String(n).padStart(2, '0'); }

function getSecondsUntil9am() {
  const now = new Date();
  const next9 = new Date(now);
  next9.setHours(9, 0, 0, 0);
  if (now >= next9) return 0;
  return Math.floor((next9 - now) / 1000);
}

function formatCountdown(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return { h: pad(h), m: pad(m), s: pad(s) };
}

export default function Today({ colors: c }) {
  const isUnlocked = getSecondsUntil9am() === 0;

  const [phase, setPhase] = useState(isUnlocked ? 'challenge' : 'locked');
  // locked | challenge | countdown | recording | result

  const [lockSecs,    setLockSecs]    = useState(getSecondsUntil9am());
  const [countNum,    setCountNum]    = useState(3);
  const [recSecs,     setRecSecs]     = useState(TOTAL_SECS);
  const [result,      setResult]      = useState(null); // 'nailed'|'almost'|'failed'
  const [showShare,   setShowShare]   = useState(false);
  const [confetti,    setConfetti]    = useState([]);

  const recTimer  = useRef(null);
  const lockTimer = useRef(null);

  // Lock countdown
  useEffect(() => {
    if (phase !== 'locked') return;
    lockTimer.current = setInterval(() => {
      setLockSecs(s => {
        const next = s - 1;
        if (next <= 0) {
          clearInterval(lockTimer.current);
          setPhase('challenge');
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(lockTimer.current);
  }, [phase]);

  // 3-2-1 countdown
  useEffect(() => {
    if (phase !== 'countdown') return;
    setCountNum(3);
    let n = 3;
    const id = setInterval(() => {
      n--;
      if (n <= 0) {
        clearInterval(id);
        setPhase('recording');
        setRecSecs(TOTAL_SECS);
      } else {
        setCountNum(n);
      }
    }, 900);
    return () => clearInterval(id);
  }, [phase]);

  // Recording timer
  useEffect(() => {
    if (phase !== 'recording') return;
    recTimer.current = setInterval(() => {
      setRecSecs(s => {
        if (s <= 1) {
          clearInterval(recTimer.current);
          endRecording('auto');
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(recTimer.current);
  }, [phase]);

  const endRecording = useCallback((how) => {
    clearInterval(recTimer.current);
    // Simulate result based on remaining time
    const leftover = recSecs;
    let r = 'nailed';
    if (how === 'auto') r = 'failed';
    else if (leftover < 10) r = 'almost';
    else r = 'nailed';
    setResult(r);

    // spawn confetti if nailed
    if (r === 'nailed') {
      const pieces = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: [c.coral, c.pink, c.green, c.gold, c.purple][i % 5],
        size: 6 + Math.random() * 8,
      }));
      setConfetti(pieces);
      setTimeout(() => setConfetti([]), 2500);
    }
    setPhase('result');
  }, [recSecs, c]);

  const handleStopRecording = () => endRecording('manual');

  const handleRetry = () => {
    setResult(null);
    setShowShare(false);
    setRecSecs(TOTAL_SECS);
    setPhase('challenge');
  };

  const s = styles(c);

  // ─── LOCKED ───────────────────────────────────────────────────────────────
  if (phase === 'locked') {
    const cd = formatCountdown(lockSecs);
    return (
      <div style={s.scroll}>
        <div style={s.lockedWrap}>
          {/* Sneak peek blurred */}
          <div style={s.sneakWrap}>
            <div style={s.sneakBlur}>
              <div style={s.sneakEmoji}>{CHALLENGE.emoji}</div>
              <div style={s.sneakTitle}>{CHALLENGE.title}</div>
            </div>
            <div style={s.lockOverlay}>
              <div style={s.lockIcon}>🔒</div>
              <div style={s.lockLabel}>UNLOCKS AT</div>
              <div style={s.lockTime}>9:00 AM</div>
            </div>
          </div>

          {/* Countdown */}
          <div style={s.cdBox}>
            <div style={s.cdLabel}>Challenge drops in</div>
            <div style={s.cdDigits}>
              <DigitBlock val={cd.h} label="HRS"  c={c} />
              <span style={s.cdColon}>:</span>
              <DigitBlock val={cd.m} label="MIN"  c={c} />
              <span style={s.cdColon}>:</span>
              <DigitBlock val={cd.s} label="SEC"  c={c} blink />
            </div>
          </div>

          <div style={s.lockedHint}>
            Set a reminder not to miss today's challenge ⚡
          </div>
          <button style={s.notifyBtn}>🔔 Remind Me</button>
        </div>
      </div>
    );
  }

  // ─── CHALLENGE CARD ───────────────────────────────────────────────────────
  if (phase === 'challenge') {
    return (
      <div style={s.scroll}>
        <div style={s.challengeWrap}>
          {/* Hero card */}
          <div style={s.heroCard}>
            <div style={s.heroGradient} />
            <div style={s.heroBadge}>{CHALLENGE.category}</div>
            <div style={s.heroEmoji}>{CHALLENGE.emoji}</div>
            <h1 style={s.heroTitle}>{CHALLENGE.title}</h1>
            <p style={s.heroSubtitle}>{CHALLENGE.subtitle}</p>
            <div style={s.heroStats}>
              <Stat label="Attempting" val={CHALLENGE.participants.toLocaleString()} c={c} />
              <div style={s.statDivider} />
              <Stat label="Nailed it" val={`${CHALLENGE.nailed}%`} c={c} color={c.green} />
              <div style={s.statDivider} />
              <Stat label="Difficulty" val={CHALLENGE.difficulty} c={c} color={c.gold} />
            </div>
          </div>

          {/* Pro clip section */}
          <div style={s.proSection}>
            <div style={s.sectionHeader}>
              <span style={s.sectionTitle}>⚡ Watch the Pro</span>
              <span style={s.sectionSub}>12 sec clip</span>
            </div>
            <div style={s.proClip}>
              <div style={s.proClipInner}>
                <div style={s.proAvatar}>🎬</div>
                <div style={s.playBtn}>▶</div>
                <div style={s.proBar}>
                  <div style={s.proBarFill} />
                </div>
                <div style={s.proLabel}>@drumgod · 12s</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={s.descCard}>
            <p style={s.descText}>{CHALLENGE.description}</p>
            <div style={s.proTipRow}>
              <span style={s.proTipIcon}>💡</span>
              <span style={s.proTipText}>{CHALLENGE.proTip}</span>
            </div>
          </div>

          {/* CTA */}
          <button style={s.recordBtn} onClick={() => setPhase('countdown')}>
            <span style={s.recordBtnIcon}>🔴</span>
            <span>Start 60-Second Challenge</span>
          </button>

          <div style={s.tag}>{CHALLENGE.tag}</div>
        </div>
      </div>
    );
  }

  // ─── COUNTDOWN (3-2-1) ────────────────────────────────────────────────────
  if (phase === 'countdown') {
    return (
      <div style={s.countdownFullscreen}>
        <div style={s.countdownBg} />
        <div style={s.countNumWrap} key={countNum}>
          <div style={s.countNum}>{countNum}</div>
        </div>
        <div style={s.countLabel}>GET READY…</div>
      </div>
    );
  }

  // ─── RECORDING ────────────────────────────────────────────────────────────
  if (phase === 'recording') {
    const isRed    = recSecs <= 10;
    const progress = recSecs / TOTAL_SECS;
    const dashOff  = CIRCUMFERENCE * (1 - progress);
    const timerColor = isRed ? c.coral : c.green;

    return (
      <div style={s.recordingScreen}>
        {/* Camera placeholder */}
        <div style={s.cameraView}>
          <div style={s.cameraFeed}>
            <div style={s.scanline} />
            <div style={s.recDot} />
            <div style={s.cameraHint}>Camera Preview</div>
          </div>
        </div>

        {/* Circular timer overlay */}
        <div style={s.timerOverlay}>
          <svg width={200} height={200} style={{ transform: 'rotate(-90deg)' }}>
            {/* Track */}
            <circle cx={100} cy={100} r={90}
              fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={8} />
            {/* Progress */}
            <circle cx={100} cy={100} r={90}
              fill="none"
              stroke={timerColor}
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOff}
              style={{
                transition: 'stroke-dashoffset 0.9s linear, stroke 0.5s',
                filter: `drop-shadow(0 0 8px ${timerColor})`,
              }}
            />
          </svg>
          <div style={{ ...s.timerCenter, color: timerColor, animation: isRed ? 'timerPulse 0.5s ease-in-out infinite' : 'none' }}>
            <div style={s.timerNum}>{recSecs}</div>
            <div style={s.timerUnit}>SEC</div>
          </div>
        </div>

        {/* Controls */}
        <div style={s.recControls}>
          <div style={s.recChallengeName}>{CHALLENGE.emoji} {CHALLENGE.title}</div>
          <button style={{ ...s.stopBtn, boxShadow: `0 0 30px ${c.coral}60` }}
            onClick={handleStopRecording}>
            <div style={s.stopIcon} />
          </button>
          <div style={s.recHint}>Tap to submit your attempt</div>
        </div>
      </div>
    );
  }

  // ─── RESULT ───────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const RESULTS = {
      nailed: { emoji: '🔥', label: 'NAILED IT!',  color: c.green,  sub: 'You crushed it! Share and challenge a friend.' },
      almost: { emoji: '😤', label: 'SO CLOSE!',   color: c.gold,   sub: "Almost had it. One more try?" },
      failed: { emoji: '💀', label: 'FAILED',       color: c.coral,  sub: "Time ran out. Shake it off and retry!" },
    };
    const r = RESULTS[result];

    return (
      <div style={s.scroll}>
        {/* Confetti */}
        {confetti.map(p => (
          <div key={p.id} style={{
            position: 'fixed', left: `${p.left}%`, top: '-10px',
            width: p.size, height: p.size, borderRadius: 2,
            background: p.color, zIndex: 100, pointerEvents: 'none',
            animation: `confettiFall 1.8s ease-in ${p.delay}s forwards`,
          }} />
        ))}

        <div style={s.resultWrap}>
          {/* Badge */}
          <div style={{ ...s.resultBadge, animation: 'resultBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
            <div style={s.resultEmoji}>{r.emoji}</div>
            <div style={{ ...s.resultLabel, color: r.color }}>{r.label}</div>
            <div style={s.resultSub}>{r.sub}</div>
          </div>

          {/* Share card */}
          <div style={s.shareCard}>
            <div style={s.shareCardHeader}>
              <span style={s.shareCardTitle}>⚡ Side-by-Side</span>
              <span style={s.shareCardTag}>{CHALLENGE.tag}</span>
            </div>
            <div style={s.shareVs}>
              <div style={s.shareSlot}>
                <div style={s.shareSlotVid}>🎬<br/>Pro</div>
                <div style={s.shareSlotName}>@drumgod</div>
              </div>
              <div style={s.vsLabel}>VS</div>
              <div style={s.shareSlot}>
                <div style={{ ...s.shareSlotVid, background: `linear-gradient(135deg, ${c.purple}40, ${c.pink}30)` }}>
                  😎<br/>You
                </div>
                <div style={s.shareSlotName}>@zara_k</div>
              </div>
            </div>
            <div style={s.shareFooter}>
              <span style={{ color: r.color }}>{r.emoji} {r.label}</span>
              <span style={s.shareDate}>Today · Spark</span>
            </div>
          </div>

          {/* Actions */}
          <div style={s.resultActions}>
            <button style={s.reelBtn}>
              <span>📲</span> Export as Reel
            </button>
            <div style={s.shareRow}>
              <ShareChip icon="📸" label="Instagram" c={c} />
              <ShareChip icon="💬" label="iMessage"  c={c} />
              <ShareChip icon="🟢" label="WhatsApp"  c={c} />
            </div>
          </div>

          <button style={s.retryBtn} onClick={handleRetry}>↩ Retry</button>
        </div>
      </div>
    );
  }

  return null;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DigitBlock({ val, label, c, blink }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 42, fontWeight: 700, color: '#fff',
        background: 'rgba(255,255,255,0.05)',
        padding: '8px 14px', borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.1)',
        minWidth: 70, textAlign: 'center',
        animation: blink ? 'blink 1s step-start infinite' : 'none',
        letterSpacing: 2,
      }}>{val}</div>
      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 9, letterSpacing: 3, color: 'rgba(255,255,255,0.35)',
      }}>{label}</div>
    </div>
  );
}

function Stat({ label, val, c, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: color || '#fff' }}>{val}</div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function ShareChip({ icon, label, c }) {
  return (
    <button style={{
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 50, padding: '8px 16px',
      display: 'flex', alignItems: 'center', gap: 6,
      color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {icon} {label}
    </button>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
function styles(c) {
  return {
    scroll: {
      height: '100%', overflowY: 'auto', overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
    },

    // LOCKED
    lockedWrap: {
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '20px 20px 40px', gap: 20, animation: 'slideUp 0.4s ease-out',
    },
    sneakWrap: {
      width: '100%', borderRadius: 20, overflow: 'hidden',
      position: 'relative', height: 200,
    },
    sneakBlur: {
      width: '100%', height: '100%',
      background: `linear-gradient(135deg, ${c.purple}30, ${c.pink}20)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      filter: 'blur(12px)', transform: 'scale(1.05)',
    },
    sneakEmoji: { fontSize: 60 },
    sneakTitle: { fontSize: 24, fontWeight: 800, color: '#fff', marginTop: 8 },
    lockOverlay: {
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(5,5,8,0.5)',
      backdropFilter: 'blur(4px)',
    },
    lockIcon: { fontSize: 36, marginBottom: 6 },
    lockLabel: {
      fontFamily: "'Space Mono', monospace",
      fontSize: 10, letterSpacing: 4, color: 'rgba(255,255,255,0.5)', marginBottom: 4,
    },
    lockTime: {
      fontFamily: "'Space Mono', monospace",
      fontSize: 36, fontWeight: 700, color: '#fff',
      textShadow: `0 0 20px ${c.coral}`,
    },
    cdBox: {
      width: '100%', background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20, padding: '24px 16px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
    },
    cdLabel: {
      fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)',
      letterSpacing: 2, textTransform: 'uppercase',
    },
    cdDigits: { display: 'flex', alignItems: 'flex-start', gap: 8 },
    cdColon: {
      fontFamily: "'Space Mono', monospace",
      fontSize: 42, color: 'rgba(255,255,255,0.3)', lineHeight: '58px',
      animation: 'blink 1s step-start infinite',
    },
    lockedHint: { fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center' },
    notifyBtn: {
      background: `linear-gradient(135deg, ${c.coral}, ${c.pink})`,
      border: 'none', borderRadius: 50, padding: '14px 32px',
      color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
      boxShadow: `0 8px 30px ${c.coral}50`,
      fontFamily: "'DM Sans', sans-serif",
      animation: 'glow 2s ease-in-out infinite',
    },

    // CHALLENGE
    challengeWrap: {
      display: 'flex', flexDirection: 'column', gap: 14,
      padding: '16px 16px 30px', animation: 'slideUp 0.35s ease-out',
    },
    heroCard: {
      borderRadius: 22, overflow: 'hidden', position: 'relative',
      padding: '28px 20px 22px', minHeight: 220,
      background: `linear-gradient(145deg, #1a0a2e, #0d0d1a)`,
      border: `1px solid rgba(120,75,160,0.3)`,
    },
    heroGradient: {
      position: 'absolute', inset: 0,
      background: `radial-gradient(ellipse at 30% 30%, ${c.purple}20 0%, transparent 60%),
                   radial-gradient(ellipse at 70% 70%, ${c.pink}15 0%, transparent 60%)`,
    },
    heroBadge: {
      position: 'relative', display: 'inline-block',
      background: `${c.purple}30`, border: `1px solid ${c.purple}50`,
      borderRadius: 20, padding: '4px 12px',
      fontSize: 11, fontWeight: 700, color: c.purple,
      letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10,
      animation: 'badgePop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both',
    },
    heroEmoji: {
      position: 'relative', fontSize: 52,
      animation: 'float 3s ease-in-out infinite',
      display: 'block', marginBottom: 8,
    },
    heroTitle: {
      position: 'relative', margin: 0, fontSize: 28, fontWeight: 800,
      color: '#fff', letterSpacing: -0.5,
    },
    heroSubtitle: {
      position: 'relative', margin: '4px 0 16px',
      fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: 500,
    },
    heroStats: {
      position: 'relative', display: 'flex', alignItems: 'center',
      gap: 16, background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: '10px 16px',
    },
    statDivider: { width: 1, height: 24, background: 'rgba(255,255,255,0.1)' },

    proSection: { display: 'flex', flexDirection: 'column', gap: 10 },
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2px' },
    sectionTitle: { fontSize: 15, fontWeight: 700, color: '#fff' },
    sectionSub: { fontSize: 12, color: 'rgba(255,255,255,0.35)' },
    proClip: {
      borderRadius: 16, overflow: 'hidden',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
    },
    proClipInner: {
      height: 120, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', gap: 8,
    },
    proAvatar: { fontSize: 32 },
    playBtn: {
      position: 'absolute',
      width: 44, height: 44, borderRadius: '50%',
      background: `linear-gradient(135deg, ${c.coral}, ${c.pink})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 18, color: '#fff', boxShadow: `0 0 20px ${c.coral}60`,
      cursor: 'pointer', animation: 'pulseSlow 2s ease-in-out infinite',
    },
    proBar: {
      position: 'absolute', bottom: 12, left: 12, right: 12,
      height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2,
    },
    proBarFill: {
      width: '35%', height: '100%', borderRadius: 2,
      background: `linear-gradient(90deg, ${c.coral}, ${c.pink})`,
    },
    proLabel: {
      position: 'absolute', top: 10, right: 12,
      fontSize: 11, color: 'rgba(255,255,255,0.4)',
      fontFamily: "'Space Mono', monospace",
    },

    descCard: {
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10,
    },
    descText: { margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 },
    proTipRow: {
      display: 'flex', gap: 8, alignItems: 'flex-start',
      background: `${c.gold}10`, borderRadius: 10, padding: '8px 12px',
    },
    proTipIcon: { fontSize: 14, flexShrink: 0 },
    proTipText: { fontSize: 13, color: c.gold, lineHeight: 1.5, fontWeight: 500 },

    recordBtn: {
      width: '100%', padding: '16px',
      background: `linear-gradient(135deg, ${c.coral}, ${c.pink})`,
      border: 'none', borderRadius: 16, cursor: 'pointer',
      fontSize: 16, fontWeight: 700, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      boxShadow: `0 8px 30px ${c.coral}50`,
      fontFamily: "'DM Sans', sans-serif",
      animation: 'glow 2.5s ease-in-out infinite',
    },
    recordBtnIcon: { fontSize: 18 },
    tag: { textAlign: 'center', fontSize: 13, color: c.purple, fontWeight: 600 },

    // COUNTDOWN
    countdownFullscreen: {
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    },
    countdownBg: {
      position: 'absolute', inset: 0,
      background: `radial-gradient(circle at 50% 50%, ${c.coral}20 0%, transparent 70%)`,
    },
    countNumWrap: {
      animation: 'countPop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards',
    },
    countNum: {
      fontFamily: "'Space Mono', monospace",
      fontSize: 160, fontWeight: 700, lineHeight: 1,
      background: `linear-gradient(135deg, ${c.coral}, ${c.pink})`,
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      filter: `drop-shadow(0 0 30px ${c.coral}80)`,
    },
    countLabel: {
      fontFamily: "'Space Mono', monospace",
      fontSize: 14, letterSpacing: 6, color: 'rgba(255,255,255,0.4)',
      marginTop: 16, animation: 'pulse 1s ease-in-out infinite',
    },

    // RECORDING
    recordingScreen: {
      height: '100%', display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    },
    cameraView: { flex: 1, position: 'relative', overflow: 'hidden' },
    cameraFeed: {
      position: 'absolute', inset: 0,
      background: 'linear-gradient(180deg, #0a0a14 0%, #050508 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    },
    scanline: {
      position: 'absolute', left: 0, right: 0, height: 2,
      background: `linear-gradient(90deg, transparent, ${c.green}40, transparent)`,
      animation: 'scanline 3s linear infinite',
      pointerEvents: 'none',
    },
    recDot: {
      position: 'absolute', top: 16, left: 16,
      width: 10, height: 10, borderRadius: '50%', background: '#ff0000',
      animation: 'blink 1s step-start infinite',
      boxShadow: '0 0 8px #ff0000',
    },
    cameraHint: { fontSize: 14, color: 'rgba(255,255,255,0.2)', fontWeight: 500 },
    timerOverlay: {
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    timerCenter: {
      position: 'absolute', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
    },
    timerNum: {
      fontFamily: "'Space Mono', monospace",
      fontSize: 52, fontWeight: 700, lineHeight: 1,
    },
    timerUnit: {
      fontFamily: "'Space Mono', monospace",
      fontSize: 10, letterSpacing: 3, opacity: 0.6,
    },
    recControls: {
      padding: '16px 24px 24px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      background: 'linear-gradient(0deg, rgba(5,5,8,0.95) 0%, transparent 100%)',
    },
    recChallengeName: { fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.7)' },
    stopBtn: {
      width: 70, height: 70, borderRadius: '50%',
      background: `linear-gradient(135deg, ${c.coral}, ${c.pink})`,
      border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    stopIcon: {
      width: 22, height: 22, background: '#fff', borderRadius: 4,
    },
    recHint: { fontSize: 12, color: 'rgba(255,255,255,0.3)' },

    // RESULT
    resultWrap: {
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '24px 16px 40px', gap: 20, animation: 'slideUp 0.4s ease-out',
    },
    resultBadge: {
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      opacity: 0,
    },
    resultEmoji: { fontSize: 72, lineHeight: 1 },
    resultLabel: {
      fontFamily: "'Space Mono', monospace",
      fontSize: 28, fontWeight: 700, letterSpacing: 2,
    },
    resultSub: { fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center', maxWidth: 260 },

    shareCard: {
      width: '100%', borderRadius: 20,
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      overflow: 'hidden', animation: 'cardReveal 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.3s both',
    },
    shareCardHeader: {
      padding: '12px 16px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
    },
    shareCardTitle: { fontSize: 14, fontWeight: 700, color: '#fff' },
    shareCardTag: { fontSize: 12, color: c.purple, fontWeight: 600 },
    shareVs: {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 12, padding: '16px',
    },
    shareSlot: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 },
    shareSlotVid: {
      width: '100%', height: 110, borderRadius: 12,
      background: `linear-gradient(135deg, ${c.purple}30, ${c.pink}20)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontSize: 24, color: 'rgba(255,255,255,0.6)', gap: 4,
    },
    shareSlotName: { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: "'Space Mono', monospace" },
    vsLabel: {
      fontFamily: "'Space Mono', monospace",
      fontSize: 18, fontWeight: 700,
      background: `linear-gradient(135deg, ${c.coral}, ${c.pink})`,
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      flexShrink: 0,
    },
    shareFooter: {
      padding: '10px 16px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      fontSize: 12, fontWeight: 600,
    },
    shareDate: { color: 'rgba(255,255,255,0.3)' },

    resultActions: { width: '100%', display: 'flex', flexDirection: 'column', gap: 12 },
    reelBtn: {
      width: '100%', padding: '15px',
      background: `linear-gradient(135deg, ${c.coral}, ${c.pink})`,
      border: 'none', borderRadius: 14, cursor: 'pointer',
      fontSize: 15, fontWeight: 700, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      boxShadow: `0 8px 30px ${c.coral}50`,
      fontFamily: "'DM Sans', sans-serif",
    },
    shareRow: { display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' },
    retryBtn: {
      background: 'none', border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: 50, padding: '10px 28px',
      color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
      fontFamily: "'DM Sans', sans-serif",
    },
  };
}
