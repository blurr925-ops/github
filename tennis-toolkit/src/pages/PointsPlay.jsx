import { useState, useMemo } from 'react';
import { Swords, Lock, CheckCircle } from 'lucide-react';
import { levels } from '../data/pointsPlay';
import { useStorage } from '../hooks/useStorage';
import PointsGame from '../components/points/PointsGame';

export default function PointsPlay() {
  const [completedIds, setCompletedIds] = useStorage('completedPoints', []);
  const [activeLevel, setActiveLevel] = useState(null);

  const handleStart = (level) => {
    setActiveLevel(level);
  };

  const handleComplete = (won) => {
    if (won && activeLevel && !completedIds.includes(activeLevel.id)) {
      setCompletedIds((prev) => [...prev, activeLevel.id]);
    }
    setActiveLevel(null);
  };

  const handleBack = () => {
    setActiveLevel(null);
  };

  if (activeLevel) {
    return (
      <PointsGame
        level={activeLevel}
        onComplete={handleComplete}
        onBack={handleBack}
      />
    );
  }

  const completedCount = completedIds.length;

  return (
    <div className="min-h-screen bg-navy pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-white text-2xl font-bold mb-1">
          Points Play ♟️
        </h1>
        <p className="text-gray-400 text-sm">
          Read the scouting report, pick the right shots, and win the point!
        </p>
      </div>

      {/* Progress */}
      <div className="px-4 mb-5">
        <div className="bg-navy-light rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-tennis/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Swords className="w-5 h-5 text-tennis" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-base">
              {completedCount}/{levels.length} Levels Complete
            </p>
            <div className="w-full bg-navy-lighter rounded-full h-2 mt-1.5">
              <div
                className="bg-tennis h-2 rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / levels.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Level list */}
      <div className="px-4 space-y-3">
        {levels.map((level, index) => {
          const isCompleted = completedIds.includes(level.id);
          const isLocked = index > 0 && !completedIds.includes(levels[index - 1].id);

          return (
            <button
              key={level.id}
              onClick={() => !isLocked && handleStart(level)}
              disabled={isLocked}
              className={`w-full text-left rounded-2xl p-4 transition-all ${
                isLocked
                  ? 'bg-navy-lighter/50 opacity-50'
                  : isCompleted
                  ? 'bg-navy-light border border-green-500/20'
                  : 'bg-navy-light active:scale-[0.98]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isCompleted ? 'bg-green-500/20' : isLocked ? 'bg-white/5' : 'bg-tennis/20'
                }`}>
                  {isLocked ? (
                    <Lock className="w-5 h-5 text-gray-500" />
                  ) : isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <span className="text-tennis font-black text-sm">{level.id}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className={`font-bold text-base truncate ${isLocked ? 'text-gray-500' : 'text-white'}`}>
                      {level.name}
                    </h3>
                    <span className="bg-white/10 text-gray-300 text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0">
                      {level.movesToWin} moves
                    </span>
                  </div>
                  <p className={`text-xs truncate ${isLocked ? 'text-gray-600' : 'text-gray-400'}`}>
                    vs {level.brief.opponent} — {level.brief.tactic}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* All done */}
      {completedCount === levels.length && (
        <div className="px-4 mt-6">
          <div className="bg-tennis/10 border border-tennis/30 rounded-2xl p-5 text-center">
            <p className="text-tennis text-lg font-bold mb-1">
              All levels complete! You're a tactician!
            </p>
            <p className="text-gray-400 text-sm">
              You've mastered reading opponents and choosing the right shots.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
