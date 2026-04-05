import { useState, useCallback, useEffect, useRef } from 'react';
import CourtFirstPerson from '../court/CourtFirstPerson';
import { isInZone } from '../../utils/courtGeometry';

const DIFFICULTY_TIME = { green: 4000, orange: 3200, red: 2500 };

export default function RallyQuiz({ rally, onComplete, onBack }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [tapPosition, setTapPosition] = useState(null);
  const [phase, setPhase] = useState('ready');
  const [readyCount, setReadyCount] = useState(3);
  const [timeLeft, setTimeLeft] = useState(1);
  const [ballAnim, setBallAnim] = useState(0);
  const [combo, setCombo] = useState(0);
  const [flashText, setFlashText] = useState(null);
  const [racketSwing, setRacketSwing] = useState(false);
  const timerRef = useRef(null);
  const startRef = useRef(null);
  const animRef = useRef(null);

  const step = rally.steps[stepIndex];
  const isLast = stepIndex === rally.steps.length - 1;
  const allowed = DIFFICULTY_TIME[rally.difficulty] || 3500;

  // Ready countdown
  useEffect(() => {
    if (phase !== 'ready') return;
    if (readyCount <= 0) { setPhase('incoming'); return; }
    const t = setTimeout(() => setReadyCount((c) => c - 1), 500);
    return () => clearTimeout(t);
  }, [phase, readyCount]);

  // Ball incoming
  useEffect(() => {
    if (phase !== 'incoming') return;
    setBallAnim(0);
    const dur = 400;
    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / dur);
      setBallAnim(1 - Math.pow(1 - p, 3));
      if (p < 1) animRef.current = requestAnimationFrame(tick);
      else setPhase('play');
    }
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [phase]);

  // Timer
  useEffect(() => {
    if (phase !== 'play') return;
    startRef.current = performance.now();
    setTimeLeft(1);
    function tick(now) {
      const r = Math.max(0, 1 - (now - startRef.current) / allowed);
      setTimeLeft(r);
      if (r <= 0) { setResult('wrong'); setPhase('feedback'); return; }
      timerRef.current = requestAnimationFrame(tick);
    }
    timerRef.current = requestAnimationFrame(tick);
    return () => { if (timerRef.current) cancelAnimationFrame(timerRef.current); };
  }, [phase, allowed]);

  // Auto-advance
  useEffect(() => {
    if (phase !== 'feedback' || result === 'wrong' || result === 'won') return;
    const d = setTimeout(() => {
      setStepIndex((i) => i + 1);
      setResult(null);
      setTapPosition(null);
      setPhase('incoming');
      setBallAnim(0);
      setRacketSwing(false);
    }, 600);
    return () => clearTimeout(d);
  }, [phase, result]);

  // Flash text auto-clear
  useEffect(() => {
    if (!flashText) return;
    const t = setTimeout(() => setFlashText(null), 800);
    return () => clearTimeout(t);
  }, [flashText]);

  const handleTap = useCallback((point) => {
    if (phase !== 'play' || result) return;
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    setTapPosition(point);
    setRacketSwing(true);
    setTimeout(() => setRacketSwing(false), 200);

    if (isInZone(point, step.correctZone)) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (isLast) {
        setResult('won');
        setFlashText('POINT WON!');
      } else {
        setResult('correct');
        setFlashText(newCombo >= 2 ? `${newCombo}x COMBO!` : step.correctLabel);
      }
    } else {
      setResult('wrong');
      setCombo(0);
    }
    setPhase('feedback');
  }, [step, result, isLast, phase, combo]);

  const handleRestart = useCallback(() => {
    setStepIndex(0); setResult(null); setTapPosition(null);
    setPhase('ready'); setReadyCount(3); setTimeLeft(1);
    setBallAnim(0); setCombo(0); setFlashText(null); setRacketSwing(false);
  }, []);

  const getBallPos = () => {
    if (phase === 'incoming' && step) {
      const sx = step.opponentPosition?.x ?? 0.5;
      const sy = step.opponentPosition?.y ?? 0.1;
      return { x: sx + (step.ballPosition.x - sx) * ballAnim, y: sy + (step.ballPosition.y - sy) * ballAnim };
    }
    return step?.ballPosition || null;
  };

  const timerColor = timeLeft > 0.5 ? '#22c55e' : timeLeft > 0.25 ? '#f59e0b' : '#ef4444';
  const showBall = phase !== 'ready';
  const animBall = showBall ? getBallPos() : null;

  return (
    <div className="fixed inset-0 bg-black overflow-hidden z-[60]">
      {/* FULL SCREEN COURT — constrained to portrait ratio so it fits on any screen */}
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        <div className="h-full aspect-[9/16] max-w-full">
        <CourtFirstPerson
          ballPosition={animBall}
          targetZone={step.correctZone}
          showTarget={result === 'correct' || result === 'won'}
          onTap={phase === 'play' && !result ? handleTap : null}
          result={result === 'wrong' ? 'wrong' : result ? 'correct' : null}
          tapPosition={tapPosition}
          swipeLine={
            phase === 'feedback' && result
              ? { start: step.ballPosition, end: result === 'wrong' ? tapPosition : { x: step.correctZone.x, y: step.correctZone.y } }
              : null
          }
          opponentPosition={step.opponentPosition}
          dimmed={phase === 'ready'}
          racketSwing={racketSwing}
        />
        </div>
      </div>

      {/* ===== HUD OVERLAYS ===== */}

      {/* Top-left: back button */}
      <button
        onClick={onBack}
        className="absolute top-3 left-3 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm z-10 active:bg-black/60"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
      </button>

      {/* Top-right: step dots */}
      <div className="absolute top-3 right-3 flex gap-2 items-center z-10">
        {rally.steps.map((_, i) => (
          <div key={i} className={`rounded-full transition-all duration-200 ${
            i < stepIndex ? 'w-2.5 h-2.5 bg-green-400' :
            i === stepIndex ? (result === 'wrong' ? 'w-3.5 h-3.5 bg-red-500' : result === 'won' ? 'w-3.5 h-3.5 bg-green-400' : 'w-3.5 h-3.5 bg-tennis') :
            'w-2.5 h-2.5 bg-white/25'
          }`} />
        ))}
      </div>

      {/* Timer bar — thin line across top */}
      {phase === 'play' && (
        <div className="absolute top-0 left-0 right-0 h-1 z-10">
          <div className="h-full transition-none" style={{ width: `${timeLeft * 100}%`, backgroundColor: timerColor, boxShadow: `0 0 10px ${timerColor}` }} />
        </div>
      )}

      {/* Combo counter — top center */}
      {combo >= 2 && phase !== 'ready' && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="text-tennis text-xs font-black tracking-widest bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full"
            style={{ textShadow: '0 0 10px rgba(204,255,0,0.5)' }}
          >
            {combo}x COMBO
          </span>
        </div>
      )}

      {/* Scenario text — bottom area, game notification style */}
      {(phase === 'play' || phase === 'incoming') && (
        <div className="absolute bottom-24 left-4 right-4 z-10"
          style={{ animation: 'slideUp 0.3s ease-out' }}
        >
          <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-3 border-l-4 border-tennis">
            <p className="text-white text-sm font-semibold leading-snug">{step.description}</p>
          </div>
        </div>
      )}

      {/* TAP prompt */}
      {phase === 'play' && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <span className="text-white/50 text-xs font-black tracking-[0.3em] uppercase animate-pulse"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
          >
            TAP TO HIT
          </span>
        </div>
      )}

      {/* Flash text — center screen */}
      {flashText && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div style={{ animation: 'popIn 0.3s ease-out' }}>
            <span className={`text-3xl font-black tracking-wide ${
              result === 'won' ? 'text-yellow-400' : 'text-tennis'
            }`} style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 0 40px rgba(204,255,0,0.3)' }}>
              {flashText}
            </span>
          </div>
        </div>
      )}

      {/* Screen flash — correct */}
      {phase === 'feedback' && (result === 'correct' || result === 'won') && (
        <div className="absolute inset-0 pointer-events-none z-10"
          style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.3) 0%, transparent 60%)', animation: 'flashOut 0.5s ease-out forwards' }}
        />
      )}
      {/* Screen flash — wrong */}
      {phase === 'feedback' && result === 'wrong' && (
        <div className="absolute inset-0 pointer-events-none z-10"
          style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.3) 0%, transparent 60%)', animation: 'flashOut 0.5s ease-out forwards' }}
        />
      )}

      {/* Ready countdown */}
      {phase === 'ready' && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center">
            {readyCount > 0 ? (
              <div className="text-8xl font-black text-white" style={{ animation: 'popIn 0.5s ease-out', textShadow: '0 6px 30px rgba(0,0,0,0.7)' }} key={readyCount}>
                {readyCount}
              </div>
            ) : (
              <div className="text-6xl font-black text-tennis" style={{ animation: 'popIn 0.3s ease-out', textShadow: '0 6px 30px rgba(0,0,0,0.7)' }}>
                GO!
              </div>
            )}
            <p className="text-white/50 text-sm font-bold mt-3 tracking-wide uppercase">{rally.name}</p>
          </div>
        </div>
      )}

      {/* POINT WON */}
      {result === 'won' && (
        <div className="absolute inset-0 flex items-end justify-center z-20 pb-8">
          <div className="bg-black/70 backdrop-blur-md rounded-2xl p-6 mx-4 w-full max-w-sm text-center border border-green-500/30"
            style={{ animation: 'slideUp 0.3s ease-out' }}
          >
            <div className="text-5xl mb-2">🏆</div>
            <p className="text-green-400 text-2xl font-black mb-1">POINT WON</p>
            <p className="text-white font-bold text-sm mb-1">{step.correctLabel}</p>
            <p className="text-gray-400 text-xs mb-4">{step.explanation}</p>
            {combo >= 2 && <p className="text-tennis text-xs font-bold mb-3">{combo}x COMBO STREAK!</p>}
            <button onClick={() => onComplete(true)} className="w-full bg-tennis text-navy font-black py-3.5 rounded-full text-base active:scale-95 transition-transform min-h-[48px]">
              CONTINUE
            </button>
          </div>
        </div>
      )}

      {/* POINT LOST */}
      {result === 'wrong' && (
        <div className="absolute inset-0 flex items-end justify-center z-20 pb-8">
          <div className="bg-black/70 backdrop-blur-md rounded-2xl p-5 mx-4 w-full max-w-sm text-center border border-red-500/30"
            style={{ animation: 'slideUp 0.3s ease-out' }}
          >
            <p className="text-red-400 text-xl font-black mb-1">
              {timeLeft <= 0 ? 'TOO SLOW' : 'OUT'}
            </p>
            <p className="text-gray-400 text-xs leading-relaxed mb-4">
              {timeLeft <= 0 ? `Time ran out! ${step.wrongExplanation}` : step.wrongExplanation}
            </p>
            <div className="flex gap-2">
              <button onClick={handleRestart} className="flex-1 bg-white/10 text-white font-bold py-3 rounded-full text-sm active:scale-95 transition-transform min-h-[48px]">
                REPLAY
              </button>
              <button onClick={() => onComplete(false)} className="flex-1 bg-white/5 text-gray-500 font-bold py-3 rounded-full text-sm active:scale-95 transition-transform min-h-[48px]">
                QUIT
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.3); opacity: 0; }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes flashOut {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes slideUp {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
