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
  const [result, setResult] = useState(null); // 'correct' | 'wrong' | 'won'
  const [tapPosition, setTapPosition] = useState(null);
  const [phase, setPhase] = useState('ready'); // 'ready' | 'incoming' | 'play' | 'feedback'
  const [readyCount, setReadyCount] = useState(3);
  const [timeLeft, setTimeLeft] = useState(1); // 0-1 fraction
  const [ballAnimProgress, setBallAnimProgress] = useState(0); // 0-1 for ball flying in
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

  // Ball incoming animation (ball flies from opponent to landing spot)
  useEffect(() => {
    if (phase !== 'incoming') return;
    setBallAnimProgress(0);
    const duration = 500; // ms for ball to fly in
    const start = performance.now();

    function animate(now) {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      // Ease out for natural deceleration
      setBallAnimProgress(1 - Math.pow(1 - progress, 2));
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
        // Time's up - point lost
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

  // Auto-advance on correct answer
  useEffect(() => {
    if (phase !== 'feedback' || result === 'wrong') return;
    if (result === 'won') return; // Don't auto-advance on win

    const delay = setTimeout(() => {
      setStepIndex((i) => i + 1);
      setResult(null);
      setTapPosition(null);
      setPhase('incoming');
      setBallAnimProgress(0);
    }, 800);
    return () => clearTimeout(delay);
  }, [phase, result]);

  const handleTap = useCallback(
    (point) => {
      if (phase !== 'play' || result) return;
      // Stop timer
      if (timerRef.current) cancelAnimationFrame(timerRef.current);

      setTapPosition(point);

      if (isInZone(point, step.correctZone)) {
        if (isLastStep) {
          setResult('won');
        } else {
          setResult('correct');
        }
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

  const handleFinish = useCallback(() => {
    onComplete(true);
  }, [onComplete]);

  const handleLose = useCallback(() => {
    onComplete(false);
  }, [onComplete]);

  // Compute animated ball position during 'incoming' phase
  // Ball starts from opponent/net area and flies to landing position
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

  // Timer bar color
  const timerColor =
    timeLeft > 0.5 ? '#22c55e' : timeLeft > 0.25 ? '#f59e0b' : '#ef4444';

  // During ready phase, show the court with countdown overlay
  const showBall = phase === 'incoming' || phase === 'play' || phase === 'feedback';
  const animatedBall = showBall ? getAnimatedBallPosition() : null;

  return (
    <div className="min-h-screen bg-navy pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-navy-light active:bg-navy-lighter transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1">
          <h2 className="text-white font-bold text-base truncate">{rally.name}</h2>
        </div>
        {/* Step indicator */}
        <div className="flex gap-1.5">
          {rally.steps.map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all ${
                i < stepIndex
                  ? 'bg-green-400'
                  : i === stepIndex
                  ? result === 'wrong'
                    ? 'bg-red-400'
                    : result === 'won'
                    ? 'bg-green-400'
                    : 'bg-tennis'
                  : 'bg-navy-lighter'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Timer bar - only during play phase */}
      {phase === 'play' && (
        <div className="px-4 mb-1">
          <div className="h-2 bg-navy-lighter rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-none"
              style={{
                width: `${timeLeft * 100}%`,
                backgroundColor: timerColor,
              }}
            />
          </div>
        </div>
      )}

      {/* Shot info bar */}
      <div className="px-4 mb-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-gray-400">Shot {stepNumber} of {totalSteps}</span>
          {phase === 'play' && (
            <span className="text-tennis animate-pulse">TAP NOW!</span>
          )}
          {phase === 'feedback' && result === 'correct' && (
            <span className="text-green-400">Great shot!</span>
          )}
        </div>
      </div>

      {/* Scenario description */}
      <div className="px-4 mb-3">
        <div className="bg-navy-light rounded-2xl p-3.5">
          <p className="text-white text-[15px] leading-relaxed font-medium">
            {step.description}
          </p>
          {phase === 'play' && (
            <p className="text-tennis text-sm mt-1.5 font-bold animate-pulse">
              Where do you hit it?
            </p>
          )}
        </div>
      </div>

      {/* Court with overlays */}
      <div className="px-4 mb-3 relative">
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
                  end:
                    result === 'wrong'
                      ? tapPosition
                      : { x: step.correctZone.x, y: step.correctZone.y },
                }
              : null
          }
          opponentPosition={step.opponentPosition}
          dimmed={phase === 'ready'}
        />

        {/* Ready countdown overlay */}
        {phase === 'ready' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl mx-0">
            <div className="text-center">
              {readyCount > 0 ? (
                <div
                  className="text-7xl font-black text-white drop-shadow-lg"
                  style={{
                    animation: 'countPop 0.6s ease-out',
                  }}
                  key={readyCount}
                >
                  {readyCount}
                </div>
              ) : (
                <div
                  className="text-5xl font-black text-tennis drop-shadow-lg"
                  style={{ animation: 'countPop 0.4s ease-out' }}
                >
                  GO!
                </div>
              )}
              <p className="text-white/70 text-sm mt-2 font-bold">
                {rally.name}
              </p>
            </div>
          </div>
        )}

        {/* Correct flash overlay */}
        {phase === 'feedback' && result === 'correct' && (
          <div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(34,197,94,0.3) 0%, transparent 70%)',
              animation: 'flashFade 0.8s ease-out forwards',
            }}
          />
        )}
      </div>

      {/* Feedback */}
      <div className="px-4">
        {/* Point won! */}
        {result === 'won' && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 text-center">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-green-400 text-xl font-extrabold mb-1">
              Point Won!
            </p>
            <p className="text-white font-bold text-sm mb-1">
              {step.correctLabel}
            </p>
            <p className="text-gray-300 text-sm mb-4">
              {step.explanation}
            </p>
            <button
              onClick={handleFinish}
              className="w-full bg-tennis text-navy font-bold py-3 rounded-full text-base active:scale-[0.98] transition-transform min-h-[48px]"
            >
              Continue
            </button>
          </div>
        )}

        {/* Wrong - point over */}
        {result === 'wrong' && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-center">
            <div className="text-3xl mb-1">
              {timeLeft <= 0 ? '⏰' : '😤'}
            </div>
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
                className="flex-1 bg-navy-lighter text-white font-bold py-3 rounded-full text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform min-h-[48px]"
              >
                <RotateCcw className="w-4 h-4" />
                Replay
              </button>
              <button
                onClick={handleLose}
                className="flex-1 bg-navy-lighter text-gray-400 font-bold py-3 rounded-full text-sm active:scale-[0.98] transition-transform min-h-[48px]"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes countPop {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.2); }
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
