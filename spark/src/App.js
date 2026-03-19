import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import Today   from './components/Today';
import Friends from './components/Friends';
import Groups  from './components/Groups';
import Ranks   from './components/Ranks';
import Signup  from './components/Signup';
import Login   from './components/Login';

const COLORS = {
  bg: '#050508', coral: '#FF6B35', pink: '#FF3CAC',
  green: '#06FFA5', gold: '#FFD23F', purple: '#784BA0',
  card: '#0d0d1a', border: 'rgba(255,255,255,0.08)',
};

const TABS = [
  { id: 'today',   label: 'Today',   icon: '⚡' },
  { id: 'friends', label: 'Friends', icon: '👥' },
  { id: 'groups',  label: 'Groups',  icon: '🔥' },
  { id: 'ranks',   label: 'Ranks',   icon: '🏆' },
];

export default function App() {
  // undefined = still checking, null = not logged in, object = Supabase session
  const [session,   setSession]   = useState(undefined);
  const [user,      setUser]      = useState(null);   // profile from DB
  const [activeTab, setActiveTab] = useState('today');
  const [showLogin, setShowLogin] = useState(false);

  // ── Auth bootstrap ────────────────────────────────────────────────────────
  useEffect(() => {
    // 1. Check existing session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s ?? null);
      if (s) fetchProfile(s.user.id);
    });

    // 2. React to future sign-in / sign-out events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ?? null);
      if (s) fetchProfile(s.user.id);
      else   setUser(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles').select('*').eq('id', userId).single();
    if (data) setUser(data);
  };

  // Called by Signup when user finishes onboarding (avoids race with onAuthStateChange)
  const handleSignupComplete = (profile) => setUser(profile);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (session === undefined) return <LoadingScreen />;

  // ── Auth gate ─────────────────────────────────────────────────────────────
  if (!session) {
    return showLogin
      ? <Login onSwitchToSignup={() => setShowLogin(false)} />
      : <Signup onComplete={handleSignupComplete} onSwitchToLogin={() => setShowLogin(true)} />;
  }

  // ── Profile loading ───────────────────────────────────────────────────────
  if (!user) return <LoadingScreen />;

  // ── Main app ──────────────────────────────────────────────────────────────
  const handleTabChange = (id) => {
    if (id === activeTab) return;
    setActiveTab(id);
  };

  const tabContent = {
    today:   <Today   colors={COLORS} user={user} />,
    friends: <Friends colors={COLORS} user={user} />,
    groups:  <Groups  colors={COLORS} />,
    ranks:   <Ranks   colors={COLORS} user={user} />,
  };

  const s = styles(COLORS);

  return (
    <div style={s.root}>
      <div style={s.orb1} />
      <div style={s.orb2} />
      <div style={s.orb3} />

      {/* Header */}
      <header style={s.header}>
        <span style={s.logo}>
          <span style={s.logoSpark}>SPARK</span>
          <span style={s.logoFlash}>⚡</span>
        </span>
        <div style={s.headerRight}>
          <button style={s.iconBtn}>🔔</button>
          <button style={{ ...s.avatar, cursor: 'pointer', border: 'none' }} onClick={handleSignOut} title="Sign out">
            {user.avatar}
          </button>
        </div>
      </header>

      {/* Page content */}
      <main style={s.main} key={activeTab}>
        {tabContent[activeTab]}
      </main>

      {/* Bottom tab bar */}
      <nav style={s.tabBar}>
        {TABS.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              style={{ ...s.tabBtn, ...(active ? s.tabBtnActive : {}) }}
              onClick={() => handleTabChange(tab.id)}
            >
              <span style={{ ...s.tabIcon, ...(active ? s.tabIconActive : {}) }}>{tab.icon}</span>
              <span style={{ ...s.tabLabel, ...(active ? s.tabLabelActive : {}) }}>{tab.label}</span>
              {active && <div style={s.tabIndicator} />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// ── Loading screen ─────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{
      width: '100vw', height: '100vh', background: '#050508',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
    }}>
      <div style={{
        fontFamily: "'Space Mono', monospace", fontSize: 22, fontWeight: 700, letterSpacing: 4,
        background: 'linear-gradient(135deg, #FF6B35, #FF3CAC)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>SPARK ⚡</div>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '3px solid rgba(255,107,53,0.2)',
        borderTopColor: '#FF6B35',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  );
}

function styles(c) {
  return {
    root: {
      width: '100vw', height: '100vh', background: c.bg,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      position: 'relative', fontFamily: "'DM Sans', sans-serif",
    },
    orb1: {
      position: 'absolute', top: '-15%', left: '-10%', width: 300, height: 300, borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(255,107,53,0.12) 0%, transparent 70%)',
      animation: 'orb 8s ease-in-out infinite', pointerEvents: 'none', zIndex: 0,
    },
    orb2: {
      position: 'absolute', top: '20%', right: '-15%', width: 350, height: 350, borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(255,60,172,0.1) 0%, transparent 70%)',
      animation: 'orb 11s ease-in-out infinite reverse', pointerEvents: 'none', zIndex: 0,
    },
    orb3: {
      position: 'absolute', bottom: '10%', left: '20%', width: 250, height: 250, borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(6,255,165,0.08) 0%, transparent 70%)',
      animation: 'orb 14s ease-in-out infinite', pointerEvents: 'none', zIndex: 0,
    },
    header: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 20px 10px', borderBottom: `1px solid ${c.border}`,
      background: 'rgba(5,5,8,0.9)', backdropFilter: 'blur(20px)',
      zIndex: 10, position: 'relative', flexShrink: 0,
    },
    logo: { display: 'flex', alignItems: 'center', gap: 4 },
    logoSpark: {
      fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 22, letterSpacing: 3,
      background: `linear-gradient(135deg, ${c.coral}, ${c.pink})`,
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    },
    logoFlash: { fontSize: 22, animation: 'neonFlicker 4s ease-in-out infinite' },
    headerRight: { display: 'flex', alignItems: 'center', gap: 12 },
    iconBtn: { background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', padding: 4, borderRadius: 8 },
    avatar: {
      width: 34, height: 34, borderRadius: '50%',
      background: `linear-gradient(135deg, ${c.coral}, ${c.pink})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 18, boxShadow: `0 0 12px rgba(255,107,53,0.5)`,
    },
    main: { flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1, animation: 'fadeIn 0.25s ease-out' },
    tabBar: {
      display: 'flex', background: 'rgba(10,10,18,0.95)', backdropFilter: 'blur(20px)',
      borderTop: `1px solid ${c.border}`,
      padding: '6px 0 calc(6px + env(safe-area-inset-bottom))',
      zIndex: 10, position: 'relative', flexShrink: 0,
    },
    tabBtn: {
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'none', border: 'none', cursor: 'pointer', padding: '6px 4px', position: 'relative', gap: 2,
      transition: 'transform 0.15s',
    },
    tabBtnActive: { transform: 'translateY(-2px)' },
    tabIcon: { fontSize: 20, lineHeight: 1, filter: 'grayscale(0.5)', opacity: 0.6, transition: 'all 0.2s' },
    tabIconActive: { filter: 'none', opacity: 1, transform: 'scale(1.15)', animation: 'pulse 2s ease-in-out infinite' },
    tabLabel: { fontSize: 10, fontWeight: 500, color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s' },
    tabLabelActive: { color: c.coral, fontWeight: 700 },
    tabIndicator: {
      position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)',
      width: 20, height: 3, borderRadius: 2,
      background: `linear-gradient(90deg, ${c.coral}, ${c.pink})`,
      boxShadow: `0 0 8px ${c.coral}`,
    },
  };
}
