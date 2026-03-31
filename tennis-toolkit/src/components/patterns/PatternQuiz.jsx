import { useState, useCallback } from 'react';
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react';
import CourtFirstPerson from '../court/CourtFirstPerson';
import { isInZone } from '../../utils/courtGeometry';

export default function RallyQuiz({ rally, onComplete, onBack }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState(null); // 'correct' | 'wrong' | 'won'
  const [tapPosition, setTapPosition] = useState(null);

  const step = rally.steps[stepIndex];
  const isLastStep = stepIndex === rally.steps.length - 1;
  const stepNumber = stepIndex + 1;
  const totalSteps = rally.steps.length;

  const handleTap = useCallback(
    (point) => {
      if (result) return;

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
    },
    [step, result, isLastStep]
  );

  const handleNextStep = useCallback(() => {
    setStepIndex((i) => i + 1);
    setResult(null);
    setTapPosition(null);
  }, []);

  const handleRestart = useCallback(() => {
    setStepIndex(0);
    setResult(null);
    setTapPosition(null);
  }, []);

  const handleFinish = useCallback(() => {
    onComplete(true);
  }, [onComplete]);

  const handleLose = useCallback(() => {
    onComplete(false);
  }, [onComplete]);

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

      {/* Rally score bar */}
      <div className="px-4 mb-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-gray-400">Shot {stepNumber} of {totalSteps}</span>
          {result !== 'wrong' && (
            <span className="text-tennis">
              {stepIndex > 0 ? `${stepIndex} shot${stepIndex !== 1 ? 's' : ''} played` : 'Your serve'}
            </span>
          )}
        </div>
      </div>

      {/* Scenario description */}
      <div className="px-4 mb-3">
        <div className="bg-navy-light rounded-2xl p-3.5">
          <p className="text-white text-[15px] leading-relaxed font-medium">
            {step.description}
          </p>
          {result === null && (
            <p className="text-tennis text-sm mt-1.5 font-bold">
              👆 Tap where you hit!
            </p>
          )}
        </div>
      </div>

      {/* Court */}
      <div className="px-4 mb-3">
        <CourtFirstPerson
          ballPosition={step.ballPosition}
          targetZone={step.correctZone}
          showTarget={result === 'correct' || result === 'won'}
          onTap={result ? null : handleTap}
          result={result === 'wrong' ? 'wrong' : result ? 'correct' : null}
          tapPosition={tapPosition}
          swipeLine={
            result
              ? { start: step.ballPosition, end: result === 'wrong' ? tapPosition : { x: step.correctZone.x, y: step.correctZone.y } }
              : null
          }
        />
      </div>

      {/* Feedback */}
      <div className="px-4">
        {/* Correct - advance to next step */}
        {result === 'correct' && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 text-center">
            <p className="text-green-400 text-lg font-extrabold mb-1">
              {step.correctLabel} ✓
            </p>
            <p className="text-gray-300 text-sm mb-3">
              {step.explanation}
            </p>
            <button
              onClick={handleNextStep}
              className="w-full bg-tennis text-navy font-bold py-3 rounded-full text-base active:scale-[0.98] transition-transform min-h-[48px]"
            >
              Next Shot →
            </button>
          </div>
        )}

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
            <div className="text-3xl mb-1">😤</div>
            <p className="text-red-400 text-lg font-extrabold mb-1">
              Point Lost!
            </p>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              {step.wrongExplanation}
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
    </div>
  );
}
