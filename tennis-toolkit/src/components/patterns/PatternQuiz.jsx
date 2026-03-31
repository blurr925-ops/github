import { useState, useCallback, useRef } from 'react';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import CourtFirstPerson from '../court/CourtFirstPerson';
import { isInZone } from '../../utils/courtGeometry';

export default function PatternQuiz({ pattern, onComplete, onBack }) {
  const [result, setResult] = useState(null); // 'correct' | 'wrong' | null
  const [tapPosition, setTapPosition] = useState(null);
  const [swipeLine, setSwipeLine] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const swipeStartRef = useRef(null);

  const handleTap = useCallback(
    (point) => {
      if (result === 'correct') return;

      setTapPosition(point);
      setAttempts((a) => a + 1);

      // Show the swipe line from ball to target
      setSwipeLine({
        start: pattern.ballPosition,
        end: point,
      });

      if (isInZone(point, pattern.correctZone)) {
        setResult('correct');
      } else {
        setResult('wrong');
      }
    },
    [pattern.correctZone, pattern.ballPosition, result]
  );

  const handleRetry = useCallback(() => {
    setResult(null);
    setTapPosition(null);
    setSwipeLine(null);
  }, []);

  const handleContinue = useCallback(() => {
    onComplete(true);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-navy pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-navy-light active:bg-navy-lighter transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h2 className="text-white font-bold text-lg truncate">
          {pattern.name}
        </h2>
      </div>

      {/* Scenario description */}
      <div className="px-4 mb-3">
        <div className="bg-navy-light rounded-2xl p-4">
          <p className="text-white text-base leading-relaxed">
            {pattern.description}
          </p>
          {result === null && (
            <p className="text-tennis text-sm mt-2 font-semibold">
              👆 Tap the court where you would hit the ball!
            </p>
          )}
        </div>
      </div>

      {/* First-person court diagram */}
      <div className="px-4 mb-3">
        <CourtFirstPerson
          ballPosition={pattern.ballPosition}
          targetZone={pattern.correctZone}
          showTarget={result === 'correct'}
          onTap={result === 'correct' ? null : handleTap}
          result={result}
          tapPosition={tapPosition}
          swipeLine={result ? swipeLine : null}
        />
      </div>

      {/* Feedback area */}
      <div className="px-4">
        {result === 'correct' && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 text-center">
            <p className="text-green-400 text-2xl font-extrabold mb-2">
              Great job! 🎾
            </p>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              {pattern.explanation}
            </p>
            {attempts > 1 && (
              <p className="text-gray-500 text-xs mb-3">
                Solved in {attempts} {attempts === 1 ? 'attempt' : 'attempts'}
              </p>
            )}
            <button
              onClick={handleContinue}
              className="w-full bg-tennis text-navy font-bold py-3 px-6 rounded-full text-base active:scale-[0.98] transition-transform min-h-[48px]"
            >
              Continue
            </button>
          </div>
        )}

        {result === 'wrong' && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-5 text-center">
            <p className="text-orange-400 text-xl font-extrabold mb-2">
              Not quite! 🤔
            </p>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              {pattern.hint}
            </p>
            <button
              onClick={handleRetry}
              className="w-full bg-navy-lighter text-white font-semibold py-3 px-6 rounded-full text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-transform min-h-[48px]"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
