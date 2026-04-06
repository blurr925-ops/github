import { useState, useCallback, useEffect, useRef } from 'react';
import CourtFirstPerson from '../court/CourtFirstPerson';
import { isInZone } from '../../utils/courtGeometry';

// Time allowed per shot based on total steps: shorter patterns = more time
function getAllowedTime(steps) {
  if (steps <= 2) return 4000;
  if (steps <= 4) return 3500;
  return 3000;
}

export default function RallyQuiz({ rally, onComplete, onBack }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [tapPosition, setTapPosition] = useState(null);
  const [phase, setPhase] = useState('brief');
  const [readyCount, setReadyCount] = useState(3);
  const [timeLeft, setTimeLeft] = useState(1);
  const [ballAnim, setBallAnim] = useState(0);
  const [shotAnim, setShotAnim] = useState(0);
  const [oppMoveAnim, setOppMoveAnim] = useState(0);
  const [prevOpponentPos, setPrevOpponentPos] = useState(null);
  const [winnerAnim, setWinnerAnim] = useState(0);
  const [winnerTarget, setWinnerTarget] = useState(null);
  const [combo, setCombo] = useState(0);
  const [flashText, setFlashText] = useState(null);
  const [racketSwing, setRacketSwing] = useState(false);
  const timerRef = useRef(null);
  const animRef = useRef(null);
  const startRef = useRef(null);
  const pendingFlash = useRef(null);

  const step = rally.steps[stepIndex];
  const isLast = stepIndex === rally.steps.length - 1;
  const allowed = getAllowedTime(rally.steps.length);

  // Ready countdown
  useEffect(() => {
    if (phase !== 'ready') return;
    if (readyCount <= 0) { setPhase('incoming'); return; }
    const t = setTimeout(() => setReadyCount((c) => c - 1), 500);
    return () => clearTimeout(t);
  }, [phase, readyCount]);

  // Ball incoming — from opponent to landing position (skip for serve steps)
  useEffect(() => {
    if (phase !== 'incoming') return;
    if (step.isServe) {
      // Serve: ball is already with the player, go straight to play
      setBallAnim(1);
      setPhase('play');
      return;
    }
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
  }, [phase, step.isServe]);

  // Timer
  useEffect(() => {
    if (phase !== 'play') return;
    startRef.current = performance.now();
    setTimeLeft(1);
    function tick(now) {
      const r = Math.max(0, 1 - (now - startRef.current) / allowed);
      setTimeLeft(r);
      if (r <= 0) {
        setResult('wrong');
        setPhase('feedback');
        return;
      }
      timerRef.current = requestAnimationFrame(tick);
    }
    timerRef.current = requestAnimationFrame(tick);
    return () => { if (timerRef.current) cancelAnimationFrame(timerRef.current); };
  }, [phase, allowed]);

  // Shot animation — ball flies from landing spot to where user tapped
  useEffect(() => {
    if (phase !== 'shotAnim') return;
    setShotAnim(0);
    const dur = 350;
    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / dur);
      setShotAnim(1 - Math.pow(1 - p, 3));
      if (p < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        // Shot landed — show flash text
        if (pendingFlash.current) {
          setFlashText(pendingFlash.current);
          pendingFlash.current = null;
        }
        setPhase('shotLanded');
      }
    }
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [phase]);

  // Shot landed — brief pause then decide what happens
  useEffect(() => {
    if (phase !== 'shotLanded') return;
    const delay = result === 'correct' ? 400 : 200;
    const t = setTimeout(() => {
      if (result === 'won') {
        setPhase('feedback');
      } else if (result === 'wrong') {
        // Opponent gets the ball and hits a winner
        setPrevOpponentPos(step.opponentPosition);
        // Winner goes to opposite side from where player is standing
        const playerSide = tapPosition ? tapPosition.x : 0.5;
        setWinnerTarget({
          x: playerSide > 0.5 ? 0.15 : 0.85,
          y: 0.85,
        });
        setPhase('opponentWinner');
      } else {
        // Correct, not last — opponent runs to ball
        setPrevOpponentPos(step.opponentPosition);
        setPhase('opponentMove');
      }
    }, delay);
    return () => clearTimeout(t);
  }, [phase, result, step, tapPosition]);

  // Opponent moves to return ball, then hits it back
  useEffect(() => {
    if (phase !== 'opponentMove') return;
    setOppMoveAnim(0);
    const dur = 450;
    const start = performance.now();
    const nextStep = rally.steps[stepIndex + 1];
    if (!nextStep) { setPhase('feedback'); return; }
    function tick(now) {
      const p = Math.min(1, (now - start) / dur);
      setOppMoveAnim(1 - Math.pow(1 - p, 2));
      if (p < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        // Opponent reached the ball — advance to next step
        setStepIndex((i) => i + 1);
        setResult(null);
        setTapPosition(null);
        setPhase('incoming');
        setBallAnim(0);
        setShotAnim(0);
        setOppMoveAnim(0);
        setRacketSwing(false);
        setPrevOpponentPos(null);
      }
    }
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [phase, stepIndex, rally.steps]);

  // Opponent winner — opponent moves to ball, then smashes a winner past player
  useEffect(() => {
    if (phase !== 'opponentWinner') return;
    setWinnerAnim(0);
    const totalDur = 900; // 400ms move + 500ms winner shot
    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / totalDur);
      setWinnerAnim(p);
      if (p < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setPhase('feedback');
        setWinnerAnim(0);
        setWinnerTarget(null);
      }
    }
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [phase]);

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
        pendingFlash.current = 'POINT WON!';
      } else {
        setResult('correct');
        pendingFlash.current = newCombo >= 2 ? `${newCombo}x COMBO!` : step.correctLabel;
      }
    } else {
      setResult('wrong');
      setCombo(0);
      pendingFlash.current = null;
    }
    setPhase('shotAnim');
  }, [step, result, isLast, phase, combo]);

  const handleRestart = useCallback(() => {
    setStepIndex(0); setResult(null); setTapPosition(null);
    setPhase('brief'); setReadyCount(3); setTimeLeft(1);
    setBallAnim(0); setShotAnim(0); setOppMoveAnim(0); setWinnerAnim(0);
    setCombo(0); setFlashText(null); setRacketSwing(false);
    setPrevOpponentPos(null); setWinnerTarget(null); pendingFlash.current = null;
  }, []);

  // Ball position based on current phase
  const getBallPos = () => {
    if (phase === 'incoming' && step) {
      const sx = step.opponentPosition?.x ?? 0.5;
      const sy = step.opponentPosition?.y ?? 0.1;
      return {
        x: sx + (step.ballPosition.x - sx) * ballAnim,
        y: sy + (step.ballPosition.y - sy) * ballAnim,
      };
    }
    if ((phase === 'shotAnim' || phase === 'shotLanded') && step && tapPosition) {
      const progress = phase === 'shotLanded' ? 1 : shotAnim;
      return {
        x: step.ballPosition.x + (tapPosition.x - step.ballPosition.x) * progress,
        y: step.ballPosition.y + (tapPosition.y - step.ballPosition.y) * progress,
      };
    }
    if (phase === 'opponentMove' && tapPosition) {
      return tapPosition;
    }
    if (phase === 'opponentWinner' && tapPosition && winnerTarget) {
      const movePart = 0.45; // first 45% = opponent moves to ball
      if (winnerAnim < movePart) {
        // Ball stays at tap position while opponent runs to it
        return tapPosition;
      }
      // Ball flies from opponent (near tap position on far side) to winner target
      const shotProgress = Math.min(1, (winnerAnim - movePart) / (1 - movePart));
      const eased = 1 - Math.pow(1 - shotProgress, 3);
      return {
        x: tapPosition.x + (winnerTarget.x - tapPosition.x) * eased,
        y: (tapPosition.y < 0.5 ? tapPosition.y : 0.2) + (winnerTarget.y - (tapPosition.y < 0.5 ? tapPosition.y : 0.2)) * eased,
      };
    }
    return step?.ballPosition || null;
  };

  // Opponent position — smooth slide during opponentMove, opponentWinner, and wrong-foot reactions
  const getOpponentPos = () => {
    // Wrong-foot reaction: opponent dives the wrong way as ball flies behind them
    if ((phase === 'shotAnim' || phase === 'shotLanded') && step?.opponentReaction && (result === 'correct' || result === 'won')) {
      const progress = phase === 'shotLanded' ? 1 : shotAnim;
      const eased = 1 - Math.pow(1 - progress, 2);
      return {
        x: step.opponentPosition.x + (step.opponentReaction.x - step.opponentPosition.x) * eased,
        y: step.opponentPosition.y + (step.opponentReaction.y - step.opponentPosition.y) * eased,
      };
    }
    if (phase === 'opponentMove' && prevOpponentPos) {
      const nextStep = rally.steps[stepIndex + 1];
      if (nextStep) {
        return {
          x: prevOpponentPos.x + (nextStep.opponentPosition.x - prevOpponentPos.x) * oppMoveAnim,
          y: prevOpponentPos.y + (nextStep.opponentPosition.y - prevOpponentPos.y) * oppMoveAnim,
        };
      }
    }
    if (phase === 'opponentWinner' && prevOpponentPos && tapPosition) {
      // Opponent slides toward where the ball landed
      const movePart = 0.45;
      const moveProgress = Math.min(1, winnerAnim / movePart);
      const eased = 1 - Math.pow(1 - moveProgress, 2);
      const targetX = Math.max(0.15, Math.min(0.85, tapPosition.x));
      const targetY = Math.max(0.1, Math.min(0.3, tapPosition.y < 0.5 ? tapPosition.y + 0.05 : 0.2));
      return {
        x: prevOpponentPos.x + (targetX - prevOpponentPos.x) * eased,
        y: prevOpponentPos.y + (targetY - prevOpponentPos.y) * eased,
      };
    }
    // Keep opponent at wrong-foot position during feedback
    if (phase === 'feedback' && step?.opponentReaction && (result === 'correct' || result === 'won')) {
      return step.opponentReaction;
    }
    return step?.opponentPosition;
  };

  // Player position — stays at ball landing spot during play, holds there after hitting
  // IMPORTANT: during shotAnim the ball flies away but the PLAYER must NOT follow it
  const getPlayerPos = () => {
    if (!step) return null;
    if (phase === 'brief' || phase === 'ready') return null;
    // For all active phases, player stays at the step's ball position (where they stand to hit)
    return step.ballPosition;
  };

  const timerColor = timeLeft > 0.5 ? '#22c55e' : timeLeft > 0.25 ? '#f59e0b' : '#ef4444';
  const showBall = phase !== 'ready' && phase !== 'brief';
  const animBall = showBall ? getBallPos() : null;
  const displayOpp = getOpponentPos();
  const displayPlayer = getPlayerPos();

  return (
    <div className="fixed inset-0 bg-black overflow-hidden z-[60]">
      {/* FULL SCREEN COURT — constrained to portrait ratio so it fits on any screen */}
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        <div className="h-full aspect-[9/16] max-w-full">
        <CourtFirstPerson
          ballPosition={animBall}
          targetZone={step.correctZone}
          showTarget={phase === 'feedback' && (result === 'correct' || result === 'won')}
          onTap={phase === 'play' && !result ? handleTap : null}
          result={phase === 'feedback' ? (result === 'wrong' ? 'wrong' : result ? 'correct' : null) : null}
          tapPosition={tapPosition}
          swipeLine={
            phase === 'feedback' && result
              ? { start: step.ballPosition, end: result === 'wrong' ? tapPosition : { x: step.correctZone.x, y: step.correctZone.y } }
              : null
          }
          opponentPosition={displayOpp}
          playerPos={displayPlayer}
          dimmed={phase === 'ready' || phase === 'brief'}
          racketSwing={racketSwing}
          ballMoving={phase === 'incoming' || phase === 'shotAnim'}
          ballFrom={
            phase === 'incoming' ? (step.opponentPosition || null) :
            phase === 'shotAnim' ? step.ballPosition :
            null
          }
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
      {combo >= 2 && phase !== 'ready' && phase !== 'brief' && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="text-tennis text-xs font-black tracking-widest bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full"
            style={{ textShadow: '0 0 10px rgba(204,255,0,0.5)' }}
          >
            {combo}x COMBO
          </span>
        </div>
      )}

      {/* Shot counter — bottom area */}
      {(phase === 'play' || phase === 'incoming') && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <span className="text-white/30 text-xs font-bold tracking-wider uppercase">
            Shot {stepIndex + 1} of {rally.steps.length}
          </span>
        </div>
      )}

      {/* TAP prompt */}
      {phase === 'play' && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <span className="text-white/50 text-xs font-black tracking-[0.3em] uppercase animate-pulse"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
          >
            {step.isServe ? 'TAP TO SERVE' : 'TAP TO HIT'}
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

      {/* Pre-game brief */}
      {phase === 'brief' && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/80">
          <div className="mx-6 max-w-sm w-full text-center" style={{ animation: 'slideUp 0.4s ease-out' }}>
            <div className="bg-navy-light rounded-2xl p-6 border border-white/10">
              <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 bg-white/10 text-gray-300">
                {rally.steps.length} SHOTS
              </div>
              <h2 className="text-white text-2xl font-black mb-3">{rally.name}</h2>
              <p className="text-gray-300 text-sm leading-relaxed mb-6">{rally.description}</p>
              <button
                onClick={() => setPhase('ready')}
                className="w-full bg-tennis text-navy font-black py-3.5 rounded-full text-base active:scale-95 transition-transform min-h-[48px]"
              >
                PLAY POINT
              </button>
            </div>
          </div>
        </div>
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
      {phase === 'feedback' && result === 'won' && (
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
      {phase === 'feedback' && result === 'wrong' && (
        <div className="absolute inset-0 flex items-end justify-center z-20 pb-8">
          <div className="bg-black/70 backdrop-blur-md rounded-2xl p-5 mx-4 w-full max-w-sm text-center border border-red-500/30"
            style={{ animation: 'slideUp 0.3s ease-out' }}
          >
            <p className="text-red-400 text-xl font-black mb-1">
              {timeLeft <= 0 ? 'TOO SLOW' : 'POINT LOST'}
            </p>
            <p className="text-gray-400 text-xs leading-relaxed mb-4">
              {timeLeft <= 0 ? `Time ran out! ${step.wrongExplanation}` : `Your opponent punished that shot! ${step.wrongExplanation}`}
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
