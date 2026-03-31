import { useState, useCallback } from 'react';
import { ArrowLeft, Trophy } from 'lucide-react';
import { patterns } from '../data/patterns';
import { useStorage } from '../hooks/useStorage';
import PatternCard from '../components/patterns/PatternCard';
import PatternQuiz from '../components/patterns/PatternQuiz';
import Confetti from '../components/common/Confetti';

export default function Patterns() {
  const [completedIds, setCompletedIds] = useStorage('completedPatterns', []);
  const [activePattern, setActivePattern] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const masteredCount = completedIds.length;

  const handleStart = (pattern) => {
    setActivePattern(pattern);
  };

  const handleComplete = (correct) => {
    if (correct && activePattern && !completedIds.includes(activePattern.id)) {
      setCompletedIds((prev) => [...prev, activePattern.id]);
      setShowConfetti(true);
    }
    setActivePattern(null);
  };

  const handleConfettiDone = useCallback(() => setShowConfetti(false), []);

  const handleBack = () => {
    setActivePattern(null);
  };

  // Show quiz when a pattern is active
  if (activePattern) {
    return (
      <PatternQuiz
        pattern={activePattern}
        onComplete={handleComplete}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="min-h-screen bg-navy pb-24">
      <Confetti active={showConfetti} onComplete={handleConfettiDone} />
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-white text-2xl font-bold mb-1">
          Patterns of Play 🎾
        </h1>
        <p className="text-gray-400 text-sm">
          Learn where to hit the ball in different situations
        </p>
      </div>

      {/* Progress indicator */}
      <div className="px-4 mb-5">
        <div className="bg-navy-light rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-tennis/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Trophy className="w-5 h-5 text-tennis" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-base">
              {masteredCount}/{patterns.length} Mastered
            </p>
            <div className="w-full bg-navy-lighter rounded-full h-2 mt-1.5">
              <div
                className="bg-tennis h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${(masteredCount / patterns.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pattern list */}
      <div className="px-4 space-y-3">
        {patterns.map((pattern) => (
          <PatternCard
            key={pattern.id}
            pattern={pattern}
            completed={completedIds.includes(pattern.id)}
            onStart={handleStart}
          />
        ))}
      </div>

      {/* Encouragement when all done */}
      {masteredCount === patterns.length && (
        <div className="px-4 mt-6">
          <div className="bg-tennis/10 border border-tennis/30 rounded-2xl p-5 text-center">
            <p className="text-tennis text-lg font-bold mb-1">
              Amazing work! You mastered all patterns!
            </p>
            <p className="text-gray-400 text-sm">
              Keep practicing these on the court to make them automatic.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
