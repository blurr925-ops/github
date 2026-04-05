import { useState, useCallback, useEffect, useRef } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import CourtFirstPerson from '../court/CourtFirstPerson';
import { isInZone } from '../../utils/courtGeometry';

const DIFFICULTY_TIME = {
  green: 4000,
  orange: 3000,
  red: 2500,
};

export default function RallyQuiz({ rally, onComplete, onBack }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [tapPosition, setTapPosition] = useState(null);
  const [phase, setPhase] = useState('ready');
  const [readyCount, setReadyCount] = useState(3);
  const [timeLeft, setTimeLeft] = useState(1);
  const [ballAnimProgress, setBallAnimProgress] = useState(0);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const animFrameRef = useRef(null);

  const step = rally.steps[stepIndex];
  const isLastStep = stepIndex === rally.steps.length - 1;
  const stepNumber = stepIndex + 1;
  const totalSteps = rally.steps.length;
  const allowedTime = DIFFICULTY_TIME[rally.difficulty] || 3500;

  // Ready countdown
  useEffect(() => {
    if (phase !== 'ready') return;
    if (readyCount <= 0) {
      setPhase('incoming');
      return;
    }
    const t = setTimeout(() => setReadyCount((c) => c - 1), 600);
    return () => clearTimeout(t);
  }, [phase, readyCount]);

  // Ball incoming animation
  useEffect(() => {
    if (phase !== 'incoming') return;
    setBallAnimProgress(0);
    const duration = 450;
    const start = performance.now();

    function animate(now) {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      setBallAnimProgress(1 - Math.pow(1 - progress, 3));
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setPhase('play');
      }
    }
    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [phase]);

  // Play timer countdown
  useEffect(() => {
    if (phase !== 'play') return;
    startTimeRef.current = performance.now();
    setTimeLeft(1);

    function tick(now) {
      const elapsed = now - startTimeRef.current;
      const remaining = Math.max(0, 1 - elapsed / allowedTime);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        setResult('wrong');
        setPhase('feedback');
        return;
      }
      timerRef.current = requestAnimationFrame(tick);
    }
    timerRef.current = requestAnimationFrame(tick);
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [phase, allowedTime]);

  // Auto-advance on correct
  useEffect(() => {
    if (phase !== 'feedback' || result === 'wrong' || result === 'won') return;
    const delay = setTimeout(() => {
      setStepIndex((i) => i + 1);
      setResult(null);
      setTapPosition(null);
      setPhase('incoming');
      setBallAnimProgress(0);
    }, 700);
    return () => clearTimeout(delay);
  }, [phase, result]);

  const handleTap = useCallback(
    (point) => {
      if (phase !== 'play' || result) return;
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
      setTapPosition(point);
      if (isInZone(point, step.correctZone)) {
        setResult(isLastStep ? 'won' : 'correct');
      } else {
        setResult('wrong');
      }
      setPhase('feedback');
    },
    [step, result, isLastStep, phase]
  );

  const handleRestart = useCallback(() => {
    setStepIndex(0);
    setResult(null);
    setTapPosition(null);
    setPhase('ready');
    setReadyCount(3);
    setTimeLeft(1);
    setBallAnimProgress(0);
  }, []);

  const handleFinish = useCallback(() => onComplete(true), [onComplete]);
  const handleLose = useCallback(() => onComplete(false), [onComplete]);

  const getAnimatedBallPosition = () => {
    if (phase === 'incoming' && step) {
      const startY = step.opponentPosition ? step.opponentPosition.y : 0.1;
      const startX = step.opponentPosition ? step.opponentPosition.x : 0.5;
      return {
        x: startX + (step.ballPosition.x - startX) * ballAnimProgress,
        y: startY + (step.ballPosition.y - startY) * ballAnimProgress,
      };
    }
    return step?.ballPosition || null;
  };

  const timerColor =
    timeLeft > 0.5 ? '#22c55e' : timeLeft > 0.25 ? '#f59e0b' : '#ef4444';

  const showBall = phase === 'incoming' || phase === 'play' || phase === 'feedback';
  const animatedBall = showBall ? getAnimatedBallPosition() : null;

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* FULL SCREEN COURT */}
      <div className="w-full relative">
        <CourtFirstPerson
          ballPosition={animatedBall}
          targetZone={step.correctZone}
          showTarget={result === 'correct' || result === 'won'}
          onTap={phase === 'play' && !result ? handleTap : null}
          result={result === 'wrong' ? 'wrong' : result ? 'correct' : null}
          tapPosition={tapPosition}
          swipeLine={
            phase === 'feedback' && result
              ? {
                  start: step.ballPosition,
                  end: result === 'wrong'
                    ? tapPosition
                    : { x: step.correctZone.x, y: step.correctZone.y },
                }
              : null
          }
          opponentPosition={step.opponentPosition}
          dimmed={phase === 'ready'}
        />

        {/* OVERLAY: Top bar - back button + step dots */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 pt-3 pb-2"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)' }}
        >
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm active:bg-black/70"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <div className="flex gap-2 items-center">
            {rally.steps.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all ${
                  i < stepIndex
                    ? 'w-3 h-3 bg-green-400'
                    : i === stepIndex
                    ? result === 'wrong'
                      ? 'w-4 h-4 bg-red-400'
                      : result === 'won'
                      ? 'w-4 h-4 bg-green-400'
                      : 'w-4 h-4 bg-tennis'
                    : 'w-3 h-3 bg-white/30'
                }`}
              />
            ))}
          </div>

          <div className="w-10 h-10 flex items-center justify-center">
            <span className="text-white/80 text-xs font-bold">{stepNumber}/{totalSteps}</span>
          </div>
        </div>

        {/* OVERLAY: Timer bar */}
        {phase === 'play' && (
          <div className="absolute top-14 left-3 right-3">
            <div className="h-1.5 bg-black/30 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="h-full rounded-full transition-none"
                style={{
                  width: `${timeLeft * 100}%`,
                  backgroundColor: timerColor,
                  boxShadow: `0 0 8px ${timerColor}`,
                }}
              />
            </div>
          </div>
        )}

        {/* OVERLAY: Scenario text - floating at top */}
        {(phase === 'play' || phase === 'incoming') && (
          <div className="absolute top-[70px] left-3 right-3">
            <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-3">
              <p className="text-white text-sm font-semibold leading-snug">
                {step.description}
              </p>
              {phase === 'play' && (
                <p className="text-tennis text-xs mt-1 font-bold animate-pulse">
                  TAP WHERE YOU HIT IT!
                </p>
              )}
            </div>
          </div>
        )}

        {/* OVERLAY: Ready countdown */}
        {phase === 'ready' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              {readyCount > 0 ? (
                <div
                  className="text-8xl font-black text-white drop-shadow-2xl"
                  style={{ animation: 'countPop 0.6s ease-out', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                  key={readyCount}
                >
                  {readyCount}
                </div>
              ) : (
                <div
                  className="text-6xl font-black text-tennis drop-shadow-2xl"
                  style={{ animation: 'countPop 0.4s ease-out', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                >
                  GO!
                </div>
              )}
              <p className="text-white/80 text-base mt-3 font-bold drop-shadow-lg">
                {rally.name}
              </p>
            </div>
          </div>
        )}

        {/* OVERLAY: Correct flash */}
        {phase === 'feedback' && result === 'correct' && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(34,197,94,0.4) 0%, transparent 60%)',
              animation: 'flashFade 0.7s ease-out forwards',
            }}
          />
        )}

        {/* OVERLAY: "Great shot" flash text */}
        {phase === 'feedback' && result === 'correct' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ animation: 'flashFade 0.7s ease-out forwards' }}
          >
            <div className="bg-green-500/80 backdrop-blur-sm px-6 py-3 rounded-full">
              <span className="text-white text-xl font-black">{step.correctLabel}</span>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM PANEL: Feedback (outside the court) */}
      <div className="px-4 pb-6">
        {/* Point won */}
        {result === 'won' && (
          <div className="bg-green-500/15 border border-green-500/30 rounded-2xl p-5 text-center mt-2">
            <div className="text-5xl mb-2">🏆</div>
            <p className="text-green-400 text-xl font-extrabold mb-1">Point Won!</p>
            <p className="text-white font-bold text-sm mb-1">{step.correctLabel}</p>
            <p className="text-gray-300 text-sm mb-4">{step.explanation}</p>
            <button
              onClick={handleFinish}
              className="w-full bg-tennis text-navy font-bold py-3.5 rounded-full text-base active:scale-[0.97] transition-transform min-h-[48px]"
            >
              Continue
            </button>
          </div>
        )}

        {/* Point lost */}
        {result === 'wrong' && (
          <div className="bg-red-500/15 border border-red-500/30 rounded-2xl p-4 text-center mt-2">
            <div className="text-4xl mb-1">{timeLeft <= 0 ? '⏰' : '😤'}</div>
            <p className="text-red-400 text-lg font-extrabold mb-1">
              {timeLeft <= 0 ? 'Too Slow!' : 'Point Lost!'}
            </p>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              {timeLeft <= 0
                ? `You ran out of time! ${step.wrongExplanation}`
                : step.wrongExplanation}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleRestart}
                className="flex-1 bg-white/10 text-white font-bold py-3 rounded-full text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-transform min-h-[48px]"
              >
                <RotateCcw className="w-4 h-4" />
                Replay
              </button>
              <button
                onClick={handleLose}
                className="flex-1 bg-white/5 text-gray-400 font-bold py-3 rounded-full text-sm active:scale-[0.97] transition-transform min-h-[48px]"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes countPop {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes flashFade {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
