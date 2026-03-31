import { useState, useCallback } from 'react';
import { Trophy } from 'lucide-react';
import { rallies } from '../data/patterns';
import { useStorage } from '../hooks/useStorage';
import PatternCard from '../components/patterns/PatternCard';
import RallyQuiz from '../components/patterns/PatternQuiz';
import Confetti from '../components/common/Confetti';

export default function Patterns() {
  const [completedIds, setCompletedIds] = useStorage('completedPatterns', []);
  const [activeRally, setActiveRally] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const masteredCount = completedIds.length;

  const handleStart = (rally) => {
    setActiveRally(rally);
  };

  const handleComplete = (won) => {
    if (won && activeRally && !completedIds.includes(activeRally.id)) {
      setCompletedIds((prev) => [...prev, activeRally.id]);
      setShowConfetti(true);
    }
    setActiveRally(null);
  };

  const handleConfettiDone = useCallback(() => setShowConfetti(false), []);

  const handleBack = () => {
    setActiveRally(null);
  };

  if (activeRally) {
    return (
      <RallyQuiz
        rally={activeRally}
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
          Play out rally points — make the right shot each time!
        </p>
      </div>

      {/* Progress */}
      <div className="px-4 mb-5">
        <div className="bg-navy-light rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-tennis/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Trophy className="w-5 h-5 text-tennis" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-base">
              {masteredCount}/{rallies.length} Points Won
            </p>
            <div className="w-full bg-navy-lighter rounded-full h-2 mt-1.5">
              <div
                className="bg-tennis h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${(masteredCount / rallies.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Rally list */}
      <div className="px-4 space-y-3">
        {rallies.map((rally) => (
          <PatternCard
            key={rally.id}
            rally={rally}
            completed={completedIds.includes(rally.id)}
            onStart={handleStart}
          />
        ))}
      </div>

      {/* All done */}
      {masteredCount === rallies.length && (
        <div className="px-4 mt-6">
          <div className="bg-tennis/10 border border-tennis/30 rounded-2xl p-5 text-center">
            <p className="text-tennis text-lg font-bold mb-1">
              All points won! You're a tactician!
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
