import React, { useState } from 'react';

const AVATARS = ['🔥', '⚡', '🎯', '🌟', '🎸', '🥁', '🏄', '🦊', '🐉', '🎮', '🚀', '💎'];

const COLORS = {
  coral:  '#FF6B35',
  pink:   '#FF3CAC',
  green:  '#06FFA5',
  gold:   '#FFD23F',
  purple: '#784BA0',
};

export default function Signup({ onComplete }) {
  const [step, setStep]         = useState(0); // 0=welcome 1=name 2=username 3=avatar 4=done
  const [name, setName]         = useState('');
  const [handle, setHandle]     = useState('');
  const [avatar, setAvatar]     = useState('');
  const [nameErr, setNameErr]   = useState('');
  const [handleErr, setHandleErr] = useState('');

  const goNext = () => setStep(s => s + 1);

  const submitName = () => {
    if (!name.trim()) { setNameErr('Enter your name to continue'); return; }
    setNameErr('');
    goNext();
  };

  const submitHandle = () => {
    const clean = handle.replace(/^@/, '').trim();
    if (!clean) { setHandleErr('Pick a username'); return; }
    if (!/^[a-zA-Z0-9_]{2,20}$/.test(clean)) {
      setHandleErr('2–20 characters, letters/numbers/underscores only');
      return;
    }
    setHandleErr('');
    setHandle(clean);
    goNext();
  };

  const submitAvatar = () => {
    if (!avatar) return;
    setStep(4);
    setTimeout(() => {
      onComplete({ name: name.trim(), handle, avatar });
    }, 1400);
  };

  return (
    <div style={s.root}>
      {/* Ambient orbs */}
      <div style={s.orb1} />
      <div style={s.orb2} />

      {/* Logo */}
      <div style={s.logo}>
        <span style={s.logoText}>SPARK</span>
        <span style={{ fontSize: 28, animation: 'neonFlicker 4s ease-in-out infinite' }}>⚡</span>
      </div>

      {/* ── Step 0: Welcome ── */}
      {step === 0 && (
        <div style={s.card} key="welcome">
          <div style={s.welcomeEmoji}>⚡</div>
          <h1 style={s.welcomeTitle}>Daily 60-second<br />skill challenges</h1>
          <p style={s.welcomeSub}>
            Watch a pro, record your attempt,<br />compete with friends.
          </p>
          <button style={s.primaryBtn} onClick={goNext}>
            Create Your Account
          </button>
          <p style={s.alreadyTxt}>Already have an account? <span style={s.link}>Sign in</span></p>
        </div>
      )}

      {/* ── Step 1: Name ── */}
      {step === 1 && (
        <div style={s.card} key="name">
          <div style={s.stepLabel}>Step 1 of 3</div>
          <h2 style={s.stepTitle}>What's your name?</h2>
          <p style={s.stepSub}>This is how other players will see you.</p>
          <input
            style={{ ...s.input, ...(nameErr ? s.inputErr : {}) }}
            placeholder="e.g. Alex Chen"
            value={name}
            onChange={e => { setName(e.target.value); setNameErr(''); }}
            onKeyDown={e => e.key === 'Enter' && submitName()}
            autoFocus
            maxLength={40}
          />
          {nameErr && <div style={s.errMsg}>{nameErr}</div>}
          <button style={s.primaryBtn} onClick={submitName}>Continue →</button>
        </div>
      )}

      {/* ── Step 2: Username ── */}
      {step === 2 && (
        <div style={s.card} key="handle">
          <div style={s.stepLabel}>Step 2 of 3</div>
          <h2 style={s.stepTitle}>Pick a username</h2>
          <p style={s.stepSub}>Your unique handle on the leaderboard.</p>
          <div style={s.handleRow}>
            <span style={s.atSign}>@</span>
            <input
              style={{ ...s.input, ...s.handleInput, ...(handleErr ? s.inputErr : {}) }}
              placeholder="your_handle"
              value={handle}
              onChange={e => { setHandle(e.target.value.replace(/^@/, '')); setHandleErr(''); }}
              onKeyDown={e => e.key === 'Enter' && submitHandle()}
              autoFocus
              maxLength={20}
            />
          </div>
          {handleErr && <div style={s.errMsg}>{handleErr}</div>}
          <button style={s.primaryBtn} onClick={submitHandle}>Continue →</button>
          <button style={s.ghostBtn} onClick={() => setStep(1)}>← Back</button>
        </div>
      )}

      {/* ── Step 3: Avatar ── */}
      {step === 3 && (
        <div style={s.card} key="avatar">
          <div style={s.stepLabel}>Step 3 of 3</div>
          <h2 style={s.stepTitle}>Choose your avatar</h2>
          <p style={s.stepSub}>Pick the one that fits your vibe.</p>
          <div style={s.avatarGrid}>
            {AVATARS.map(a => (
              <button
                key={a}
                style={{ ...s.avatarBtn, ...(avatar === a ? s.avatarBtnActive : {}) }}
                onClick={() => setAvatar(a)}
              >
                {a}
              </button>
            ))}
          </div>
          <button
            style={{ ...s.primaryBtn, opacity: avatar ? 1 : 0.4, pointerEvents: avatar ? 'auto' : 'none' }}
            onClick={submitAvatar}
          >
            Let's Go 🔥
          </button>
          <button style={s.ghostBtn} onClick={() => setStep(2)}>← Back</button>
        </div>
      )}

      {/* ── Step 4: Done ── */}
      {step === 4 && (
        <div style={{ ...s.card, alignItems: 'center', textAlign: 'center' }} key="done">
          <div style={{ fontSize: 72, animation: 'resultBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
            {avatar}
          </div>
          <h2 style={{ ...s.stepTitle, marginTop: 12 }}>Welcome, {name.split(' ')[0]}!</h2>
          <p style={s.stepSub}>Your account is ready.</p>
          <div style={s.handleBadge}>@{handle}</div>
        </div>
      )}

      {/* Step dots */}
      {step > 0 && step < 4 && (
        <div style={s.dots}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ ...s.dot, ...(step >= i ? s.dotActive : {}) }} />
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  root: {
    width: '100vw', height: '100vh',
    background: '#050508',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '0 24px',
    position: 'relative', overflow: 'hidden',
    fontFamily: "'DM Sans', sans-serif",
  },
  orb1: {
    position: 'absolute', top: '-10%', left: '-15%',
    width: 320, height: 320, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,107,53,0.14) 0%, transparent 70%)',
    animation: 'orb 8s ease-in-out infinite',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute', bottom: '-5%', right: '-10%',
    width: 280, height: 280, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,60,172,0.12) 0%, transparent 70%)',
    animation: 'orb 11s ease-in-out infinite reverse',
    pointerEvents: 'none',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 6,
    marginBottom: 32, position: 'relative', zIndex: 1,
  },
  logoText: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 22, fontWeight: 700, letterSpacing: 4,
    background: `linear-gradient(135deg, ${COLORS.coral}, ${COLORS.pink})`,
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },

  card: {
    width: '100%', maxWidth: 380,
    display: 'flex', flexDirection: 'column', gap: 14,
    animation: 'slideUp 0.35s ease-out',
    position: 'relative', zIndex: 1,
  },

  // Welcome
  welcomeEmoji: {
    fontSize: 64, textAlign: 'center',
    animation: 'float 3s ease-in-out infinite',
  },
  welcomeTitle: {
    margin: 0, fontSize: 30, fontWeight: 800, color: '#fff',
    textAlign: 'center', lineHeight: 1.25, letterSpacing: -0.5,
  },
  welcomeSub: {
    margin: 0, fontSize: 15, color: 'rgba(255,255,255,0.45)',
    textAlign: 'center', lineHeight: 1.6,
  },

  // Steps
  stepLabel: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 10, letterSpacing: 3, color: COLORS.coral,
    textTransform: 'uppercase',
  },
  stepTitle: {
    margin: 0, fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: -0.3,
  },
  stepSub: {
    margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5,
  },

  // Inputs
  input: {
    width: '100%', padding: '14px 16px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 14, color: '#fff',
    fontSize: 16, fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  inputErr: {
    borderColor: COLORS.coral,
  },
  errMsg: {
    fontSize: 12, color: COLORS.coral, fontWeight: 500, marginTop: -6,
  },
  handleRow: {
    display: 'flex', alignItems: 'center',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 14, overflow: 'hidden',
  },
  atSign: {
    padding: '0 4px 0 16px',
    fontSize: 16, color: 'rgba(255,255,255,0.4)',
    fontFamily: "'Space Mono', monospace",
    flexShrink: 0,
  },
  handleInput: {
    background: 'transparent', border: 'none',
    borderRadius: 0, padding: '14px 16px 14px 4px',
    flex: 1,
  },

  // Buttons
  primaryBtn: {
    width: '100%', padding: '15px',
    background: `linear-gradient(135deg, ${COLORS.coral}, ${COLORS.pink})`,
    border: 'none', borderRadius: 16, cursor: 'pointer',
    fontSize: 16, fontWeight: 700, color: '#fff',
    boxShadow: `0 8px 30px rgba(255,107,53,0.45)`,
    fontFamily: "'DM Sans', sans-serif",
    animation: 'glow 2.5s ease-in-out infinite',
    transition: 'opacity 0.2s',
  },
  ghostBtn: {
    width: '100%', padding: '12px',
    background: 'none',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 16, cursor: 'pointer',
    fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.4)',
    fontFamily: "'DM Sans', sans-serif",
  },
  alreadyTxt: {
    margin: 0, textAlign: 'center',
    fontSize: 13, color: 'rgba(255,255,255,0.3)',
  },
  link: {
    color: COLORS.coral, cursor: 'pointer', fontWeight: 600,
  },

  // Avatar grid
  avatarGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10,
  },
  avatarBtn: {
    fontSize: 30, padding: '12px 0',
    background: 'rgba(255,255,255,0.05)',
    border: '2px solid transparent',
    borderRadius: 14, cursor: 'pointer',
    transition: 'all 0.15s',
  },
  avatarBtnActive: {
    background: `rgba(255,107,53,0.15)`,
    border: `2px solid ${COLORS.coral}`,
    boxShadow: `0 0 16px rgba(255,107,53,0.35)`,
    transform: 'scale(1.08)',
  },

  // Done screen
  handleBadge: {
    display: 'inline-block', margin: '0 auto',
    padding: '6px 18px',
    background: `rgba(255,107,53,0.15)`,
    border: `1px solid ${COLORS.coral}40`,
    borderRadius: 50,
    fontFamily: "'Space Mono', monospace",
    fontSize: 14, color: COLORS.coral, fontWeight: 700,
  },

  // Progress dots
  dots: {
    display: 'flex', gap: 6, marginTop: 28, position: 'relative', zIndex: 1,
  },
  dot: {
    width: 6, height: 6, borderRadius: '50%',
    background: 'rgba(255,255,255,0.15)',
    transition: 'all 0.25s',
  },
  dotActive: {
    background: COLORS.coral,
    boxShadow: `0 0 8px ${COLORS.coral}`,
    width: 18, borderRadius: 3,
  },
};
