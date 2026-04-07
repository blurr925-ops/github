import { useState, useCallback, useEffect, useRef } from 'react';
import CourtFirstPerson from '../court/CourtFirstPerson';
import { isInZone } from '../../utils/courtGeometry';

function getAllowedTime(steps) {
  if (steps <= 2) return 5000;
  if (steps <= 3) return 4500;
  return 4000;
}

const SHOT_ICONS = {
  topspin: '🔄',
  slice: '🔪',
  approach: '🏃',
};

export default function PointsGame({ level, onComplete, onBack }) {
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
  const [selectedShot, setSelectedShot] = useState(null);
  const [shotFeedbackText, setShotFeedbackText] = useState(null);
  const [flashText, setFlashText] = useState(null);
  const [racketSwing, setRacketSwing] = useState(false);
  const timerRef = useRef(null);
  const animRef = useRef(null);
  const startRef = useRef(null);
  const pendingFlash = useRef(null);

  const step = level.steps[stepIndex];
  const isLast = stepIndex === level.steps.length - 1;
  const allowed = getAllowedTime(level.steps.length);

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
      else setPhase('select');
    }
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [phase]);

  // Timer starts after shot selection
  useEffect(() => {
    if (phase !== 'play') return;
    startRef.current = performance.now();
    setTimeLeft(1);
    function tick(now) {
      const r = Math.max(0, 1 - (now - startRef.current) / allowed);
      setTimeLeft(r);
      if (r <= 0) {
        setResult('wrong');
        setShotFeedbackText('Too slow! You took too long to place your shot.');
        setPhase('feedback');
        return;
      }
      timerRef.current = requestAnimationFrame(tick);
    }
    timerRef.current = requestAnimationFrame(tick);
    return () => { if (timerRef.current) cancelAnimationFrame(timerRef.current); };
  }, [phase, allowed]);

  // Shot animation
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

  // Shot landed
  useEffect(() => {
    if (phase !== 'shotLanded') return;
    const delay = result === 'correct' ? 400 : 200;
    const t = setTimeout(() => {
      if (result === 'won') {
        setPhase('feedback');
      } else if (result === 'wrong') {
        setPrevOpponentPos(step.opponentPosition);
        const playerSide = tapPosition ? tapPosition.x : 0.5;
        setWinnerTarget({ x: playerSide > 0.5 ? 0.15 : 0.85, y: 0.85 });
        setPhase('opponentWinner');
      } else {
        setPrevOpponentPos(step.opponentPosition);
        setPhase('opponentMove');
      }
    }, delay);
    return () => clearTimeout(t);
  }, [phase, result, step, tapPosition]);

  // Opponent moves
  useEffect(() => {
    if (phase !== 'opponentMove') return;
    setOppMoveAnim(0);
    const dur = 450;
    const start = performance.now();
    const nextStep = level.steps[stepIndex + 1];
    if (!nextStep) { setPhase('feedback'); return; }
    function tick(now) {
      const p = Math.min(1, (now - start) / dur);
      setOppMoveAnim(1 - Math.pow(1 - p, 2));
      if (p < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setStepIndex((i) => i + 1);
        setResult(null);
        setTapPosition(null);
        setSelectedShot(null);
        setShotFeedbackText(null);
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
  }, [phase, stepIndex, level.steps]);

  // Opponent winner
  useEffect(() => {
    if (phase !== 'opponentWinner') return;
    setWinnerAnim(0);
    const totalDur = 900;
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

  const handleShotSelect = useCallback((shotType) => {
    if (phase !== 'select') return;
    const feedback = step.shotFeedback[shotType];
    setSelectedShot(shotType);
    if (!feedback.correct) {
      // Wrong shot type — immediate feedback
      setResult('wrong');
      setShotFeedbackText(feedback.text);
      setPhase('feedback');
    } else {
      // Correct shot type — now tap the court
      setShotFeedbackText(feedback.text);
      setPhase('play');
    }
  }, [phase, step]);

  const handleTap = useCallback((point) => {
    if (phase !== 'play' || result) return;
    // Ignore taps on your own side of the net
    if (point.y > 0.5) return;
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    setTapPosition(point);
    setRacketSwing(true);
    setTimeout(() => setRacketSwing(false), 200);

    if (isInZone(point, step.correctZone)) {
      if (isLast) {
        setResult('won');
        pendingFlash.current = 'POINT WON!';
      } else {
        setResult('correct');
        pendingFlash.current = selectedShot === 'approach' ? 'TO THE NET!' : 'GREAT SHOT!';
      }
    } else {
      setResult('wrong');
      setShotFeedbackText(step.wrongZoneFeedback);
      pendingFlash.current = null;
    }
    setPhase('shotAnim');
  }, [step, result, isLast, phase, selectedShot]);

  const handleRestart = useCallback(() => {
    setStepIndex(0); setResult(null); setTapPosition(null);
    setPhase('brief'); setReadyCount(3); setTimeLeft(1);
    setBallAnim(0); setShotAnim(0); setOppMoveAnim(0); setWinnerAnim(0);
    setSelectedShot(null); setShotFeedbackText(null);
    setFlashText(null); setRacketSwing(false);
    setPrevOpponentPos(null); setWinnerTarget(null); pendingFlash.current = null;
  }, []);

  // Ball position
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
    if (phase === 'opponentMove' && tapPosition) return tapPosition;
    if (phase === 'opponentWinner' && tapPosition && winnerTarget) {
      const movePart = 0.45;
      if (winnerAnim < movePart) return tapPosition;
      const shotProgress = Math.min(1, (winnerAnim - movePart) / (1 - movePart));
      const eased = 1 - Math.pow(1 - shotProgress, 3);
      return {
        x: tapPosition.x + (winnerTarget.x - tapPosition.x) * eased,
        y: (tapPosition.y < 0.5 ? tapPosition.y : 0.2) + (winnerTarget.y - (tapPosition.y < 0.5 ? tapPosition.y : 0.2)) * eased,
      };
    }
    return step?.ballPosition || null;
  };

  // Opponent position
  const getOpponentPos = () => {
    if (phase === 'opponentMove' && prevOpponentPos) {
      const nextStep = level.steps[stepIndex + 1];
      if (nextStep) {
        return {
          x: prevOpponentPos.x + (nextStep.opponentPosition.x - prevOpponentPos.x) * oppMoveAnim,
          y: prevOpponentPos.y + (nextStep.opponentPosition.y - prevOpponentPos.y) * oppMoveAnim,
        };
      }
    }
    if (phase === 'opponentWinner' && prevOpponentPos && tapPosition) {
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
    return step?.opponentPosition;
  };

  // Player position
  const getPlayerPos = () => {
    if (!step) return null;
    if (phase === 'brief' || phase === 'ready') return null;
    return step.ballPosition;
  };

  const timerColor = timeLeft > 0.5 ? '#22c55e' : timeLeft > 0.25 ? '#f59e0b' : '#ef4444';
  const showBall = phase !== 'ready' && phase !== 'brief';
  const animBall = showBall ? getBallPos() : null;
  const displayOpp = getOpponentPos();
  const displayPlayer = getPlayerPos();

  return (
    <div className="fixed inset-0 bg-black overflow-hidden z-[60]">
      {/* Court */}
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
              phase === 'feedback' && result && tapPosition
                ? { start: step.ballPosition, end: result === 'wrong' ? tapPosition : { x: step.correctZone.x, y: step.correctZone.y } }
                : null
            }
            opponentPosition={displayOpp}
            playerPos={displayPlayer}
            dimmed={phase === 'ready' || phase === 'brief'}
            racketSwing={racketSwing}
            shotType={
              (phase === 'shotAnim' || phase === 'shotLanded') ? selectedShot : null
            }
            ballMoving={phase === 'incoming' || phase === 'shotAnim'}
            ballFrom={
              phase === 'incoming' ? (step.opponentPosition || null) :
              phase === 'shotAnim' ? step.ballPosition :
              null
            }
          />
        </div>
      </div>

      {/* HUD */}

      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-3 left-3 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm z-10 active:bg-black/60"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
      </button>

      {/* Step dots */}
      <div className="absolute top-3 right-3 flex gap-2 items-center z-10">
        {level.steps.map((_, i) => (
          <div key={i} className={`rounded-full transition-all duration-200 ${
            i < stepIndex ? 'w-2.5 h-2.5 bg-green-400' :
            i === stepIndex ? (result === 'wrong' ? 'w-3.5 h-3.5 bg-red-500' : result === 'won' ? 'w-3.5 h-3.5 bg-green-400' : 'w-3.5 h-3.5 bg-tennis') :
            'w-2.5 h-2.5 bg-white/25'
          }`} />
        ))}
      </div>

      {/* Timer bar */}
      {phase === 'play' && (
        <div className="absolute top-0 left-0 right-0 h-1 z-10">
          <div className="h-full transition-none" style={{ width: `${timeLeft * 100}%`, backgroundColor: timerColor, boxShadow: `0 0 10px ${timerColor}` }} />
        </div>
      )}

      {/* Description text */}
      {(phase === 'select' || phase === 'play' || phase === 'incoming') && (
        <div className="absolute top-14 left-4 right-4 z-10 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2.5 text-center">
            <p className="text-white text-sm font-medium leading-snug">{step.description}</p>
          </div>
        </div>
      )}

      {/* Shot selection buttons */}
      {phase === 'select' && (
        <div className="absolute bottom-8 left-4 right-4 z-20">
          <p className="text-white/60 text-xs font-bold text-center mb-3 tracking-wider uppercase">Choose your shot</p>
          <div className="flex gap-3">
            {['topspin', 'slice', 'approach'].map((type) => (
              <button
                key={type}
                onClick={() => handleShotSelect(type)}
                className="flex-1 bg-navy-light/90 backdrop-blur-sm border border-white/15 rounded-2xl py-4 px-2 text-center active:scale-95 transition-transform"
              >
                <div className="text-2xl mb-1">{SHOT_ICONS[type]}</div>
                <p className="text-white text-sm font-bold capitalize">{type}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAP prompt after shot selection */}
      {phase === 'play' && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-black/50 backdrop-blur-sm rounded-full px-5 py-2">
            <span className="text-white/70 text-xs font-black tracking-[0.3em] uppercase animate-pulse">
              TAP WHERE TO HIT
            </span>
          </div>
        </div>
      )}

      {/* Flash text */}
      {flashText && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div style={{ animation: 'ppPopIn 0.3s ease-out' }}>
            <span className={`text-3xl font-black tracking-wide ${
              result === 'won' ? 'text-yellow-400' : 'text-tennis'
            }`} style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 0 40px rgba(204,255,0,0.3)' }}>
              {flashText}
            </span>
          </div>
        </div>
      )}

      {/* Screen flash effects */}
      {phase === 'feedback' && (result === 'correct' || result === 'won') && (
        <div className="absolute inset-0 pointer-events-none z-10"
          style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.3) 0%, transparent 60%)', animation: 'ppFlashOut 0.5s ease-out forwards' }}
        />
      )}
      {phase === 'feedback' && result === 'wrong' && (
        <div className="absolute inset-0 pointer-events-none z-10"
          style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.3) 0%, transparent 60%)', animation: 'ppFlashOut 0.5s ease-out forwards' }}
        />
      )}

      {/* Brief screen */}
      {phase === 'brief' && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/80">
          <div className="mx-6 max-w-sm w-full text-center" style={{ animation: 'ppSlideUp 0.4s ease-out' }}>
            <div className="bg-navy-light rounded-2xl p-6 border border-white/10">
              <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 bg-white/10 text-gray-300">
                WIN IN {level.movesToWin} MOVES
              </div>
              <h2 className="text-white text-2xl font-black mb-4">{level.name}</h2>

              {/* Opponent brief */}
              <div className="bg-navy/50 rounded-xl p-4 mb-4 text-left">
                <p className="text-white text-sm font-bold mb-2">
                  🎾 vs {level.brief.opponent}
                  <span className="ml-2 text-xs font-medium text-gray-400">
                    ({level.brief.hand}-handed)
                  </span>
                </p>
                <div className="mb-2">
                  <p className="text-green-400 text-xs font-bold mb-1">STRENGTHS</p>
                  {level.brief.strengths.map((s, i) => (
                    <p key={i} className="text-gray-300 text-xs leading-relaxed">• {s}</p>
                  ))}
                </div>
                <div className="mb-2">
                  <p className="text-red-400 text-xs font-bold mb-1">WEAKNESSES</p>
                  {level.brief.weaknesses.map((w, i) => (
                    <p key={i} className="text-gray-300 text-xs leading-relaxed">• {w}</p>
                  ))}
                </div>
                <div className="border-t border-white/10 pt-2 mt-2">
                  <p className="text-tennis text-xs font-bold">💡 {level.brief.tactic}</p>
                </div>
              </div>

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
              <div className="text-8xl font-black text-white" style={{ animation: 'ppPopIn 0.5s ease-out', textShadow: '0 6px 30px rgba(0,0,0,0.7)' }} key={readyCount}>
                {readyCount}
              </div>
            ) : (
              <div className="text-6xl font-black text-tennis" style={{ animation: 'ppPopIn 0.3s ease-out', textShadow: '0 6px 30px rgba(0,0,0,0.7)' }}>
                GO!
              </div>
            )}
            <p className="text-white/50 text-sm font-bold mt-3 tracking-wide uppercase">vs {level.brief.opponent}</p>
          </div>
        </div>
      )}

      {/* POINT WON */}
      {phase === 'feedback' && result === 'won' && (
        <div className="absolute inset-0 flex items-end justify-center z-20 pb-8">
          <div className="bg-black/70 backdrop-blur-md rounded-2xl p-6 mx-4 w-full max-w-sm text-center border border-green-500/30"
            style={{ animation: 'ppSlideUp 0.3s ease-out' }}
          >
            <div className="text-5xl mb-2">🏆</div>
            <p className="text-green-400 text-2xl font-black mb-1">LEVEL COMPLETE</p>
            <p className="text-gray-300 text-sm mb-1">{shotFeedbackText}</p>
            <button onClick={() => onComplete(true)} className="w-full bg-tennis text-navy font-black py-3.5 rounded-full text-base active:scale-95 transition-transform min-h-[48px] mt-4">
              CONTINUE
            </button>
          </div>
        </div>
      )}

      {/* POINT LOST */}
      {phase === 'feedback' && result === 'wrong' && (
        <div className="absolute inset-0 flex items-end justify-center z-20 pb-8">
          <div className="bg-black/70 backdrop-blur-md rounded-2xl p-5 mx-4 w-full max-w-sm text-center border border-red-500/30"
            style={{ animation: 'ppSlideUp 0.3s ease-out' }}
          >
            <p className="text-red-400 text-xl font-black mb-1">POINT LOST</p>
            <p className="text-gray-400 text-xs leading-relaxed mb-4">
              {shotFeedbackText}
            </p>
            <div className="flex gap-2">
              <button onClick={handleRestart} className="flex-1 bg-white/10 text-white font-bold py-3 rounded-full text-sm active:scale-95 transition-transform min-h-[48px]">
                RETRY
              </button>
              <button onClick={() => onComplete(false)} className="flex-1 bg-white/5 text-gray-500 font-bold py-3 rounded-full text-sm active:scale-95 transition-transform min-h-[48px]">
                QUIT
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes ppPopIn {
          0% { transform: scale(0.3); opacity: 0; }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ppFlashOut {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes ppSlideUp {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
