import React, { useState } from 'react';
import { supabase } from '../supabase';

const C = { coral: '#FF6B35', pink: '#FF3CAC' };

export default function Login({ onSwitchToSignup }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) { setError('Enter your email and password'); return; }
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);
    if (err) setError(err.message);
    // On success App.js onAuthStateChange fires and loads the profile automatically
  };

  return (
    <div style={s.root}>
      <div style={s.orb1} />
      <div style={s.orb2} />

      <div style={s.logo}>
        <span style={s.logoText}>SPARK</span>
        <span style={{ fontSize: 28, animation: 'neonFlicker 4s ease-in-out infinite' }}>⚡</span>
      </div>

      <div style={s.card}>
        <h2 style={s.title}>Welcome back</h2>
        <p style={s.sub}>Sign in to continue your streak 🔥</p>

        <input
          style={s.input}
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          autoFocus
        />
        <input
          style={s.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
        />

        {error && <div style={s.errMsg}>{error}</div>}

        <button
          style={{ ...s.primaryBtn, opacity: loading ? 0.7 : 1 }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        <p style={s.switchTxt}>
          No account?{' '}
          <span style={s.link} onClick={onSwitchToSignup}>Create one free</span>
        </p>
      </div>
    </div>
  );
}

const s = {
  root: {
    width: '100vw', height: '100vh',
    background: '#050508',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '0 24px', position: 'relative', overflow: 'hidden',
    fontFamily: "'DM Sans', sans-serif",
  },
  orb1: {
    position: 'absolute', top: '-10%', left: '-15%',
    width: 320, height: 320, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,107,53,0.14) 0%, transparent 70%)',
    animation: 'orb 8s ease-in-out infinite', pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute', bottom: '-5%', right: '-10%',
    width: 280, height: 280, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,60,172,0.12) 0%, transparent 70%)',
    animation: 'orb 11s ease-in-out infinite reverse', pointerEvents: 'none',
  },
  logo: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 32, position: 'relative', zIndex: 1 },
  logoText: {
    fontFamily: "'Space Mono', monospace",
    fontSize: 22, fontWeight: 700, letterSpacing: 4,
    background: `linear-gradient(135deg, ${C.coral}, ${C.pink})`,
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  card: {
    width: '100%', maxWidth: 380,
    display: 'flex', flexDirection: 'column', gap: 14,
    animation: 'slideUp 0.35s ease-out', position: 'relative', zIndex: 1,
  },
  title: { margin: 0, fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: -0.3 },
  sub: { margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.4)' },
  input: {
    width: '100%', padding: '14px 16px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 14, color: '#fff',
    fontSize: 16, fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
  },
  errMsg: { fontSize: 12, color: C.coral, fontWeight: 500 },
  primaryBtn: {
    width: '100%', padding: '15px',
    background: `linear-gradient(135deg, ${C.coral}, ${C.pink})`,
    border: 'none', borderRadius: 16, cursor: 'pointer',
    fontSize: 16, fontWeight: 700, color: '#fff',
    boxShadow: `0 8px 30px rgba(255,107,53,0.45)`,
    fontFamily: "'DM Sans', sans-serif",
    animation: 'glow 2.5s ease-in-out infinite',
  },
  switchTxt: { margin: 0, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.3)' },
  link: { color: C.coral, cursor: 'pointer', fontWeight: 600 },
};
