import { useState, useCallback, useMemo } from 'react';
import { Trophy, Lock } from 'lucide-react';
import { rallies } from '../data/patterns';
import { useStorage } from '../hooks/useStorage';
import PatternCard from '../components/patterns/PatternCard';
import RallyQuiz from '../components/patterns/PatternQuiz';
import Confetti from '../components/common/Confetti';

const CATEGORY_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'serve', label: 'Serve' },
  { key: 'return', label: 'Return' },
  { key: 'forehand', label: 'Forehand' },
  { key: 'backhand', label: 'Backhand' },
];

const BADGES = [
  { id: 'first-win', name: 'First Win', emoji: '\u{1F947}', check: ({ wins }) => wins >= 1 },
  { id: 'hot-streak', name: 'Hot Streak', emoji: '\u{1F525}', check: ({ bestStreak }) => bestStreak >= 3 },
  { id: 'tactician', name: 'Tactician', emoji: '\u{1F9E0}', check: ({ completedIds, greenIds }) => greenIds.every((id) => completedIds.includes(id)) },
  { id: 'court-general', name: 'Court General', emoji: '\u2B50', check: ({ completedIds, orangeIds }) => orangeIds.every((id) => completedIds.includes(id)) },
  { id: 'champion', name: 'Champion', emoji: '\u{1F3C6}', check: ({ completedIds, allIds }) => allIds.every((id) => completedIds.includes(id)) },
];

const greenIds = rallies.filter((r) => r.difficulty === 'green').map((r) => r.id);
const orangeIds = rallies.filter((r) => r.difficulty === 'orange').map((r) => r.id);
const allIds = rallies.map((r) => r.id);

export default function Patterns() {
  const [completedIds, setCompletedIds] = useStorage('completedPatterns', []);
  const [stats, setStats] = useStorage('patternStats', { attempts: 0, wins: 0, currentStreak: 0, bestStreak: 0 });
  const [activeRally, setActiveRally] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredRallies = useMemo(
    () => categoryFilter === 'all' ? rallies : rallies.filter((r) => r.category === categoryFilter),
    [categoryFilter],
  );

  const badgeContext = useMemo(
    () => ({ wins: stats.wins, bestStreak: stats.bestStreak, completedIds, greenIds, orangeIds, allIds }),
    [stats.wins, stats.bestStreak, completedIds],
  );

  const masteredCount = completedIds.length;

  const handleStart = (rally) => {
    setActiveRally(rally);
  };

  const handleComplete = (won) => {
    if (won && activeRally && !completedIds.includes(activeRally.id)) {
      setCompletedIds((prev) => [...prev, activeRally.id]);
      setShowConfetti(true);
    }
    setStats((prev) => {
      const newStreak = won ? prev.currentStreak + 1 : 0;
      return {
        attempts: prev.attempts + 1,
        wins: prev.wins + (won ? 1 : 0),
        currentStreak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
      };
    });
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

      {/* Stats */}
      {stats.attempts > 0 && (
        <div className="px-4 mb-5">
          <div className="bg-navy-light rounded-2xl p-4 flex items-center gap-3">
            <div className="flex-1 text-center">
              <p className="text-white text-lg font-bold">
                {Math.round((stats.wins / stats.attempts) * 100)}%
              </p>
              <p className="text-gray-400 text-xs">Win Rate</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-white text-lg font-bold">
                🔥 {stats.currentStreak}
              </p>
              <p className="text-gray-400 text-xs">Current Streak</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-white text-lg font-bold">
                🏆 {stats.bestStreak}
              </p>
              <p className="text-gray-400 text-xs">Best Streak</p>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Badges */}
      <div className="px-4 mb-5">
        <h2 className="text-white text-sm font-semibold mb-2">Achievements</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {BADGES.map((badge) => {
            const unlocked = badge.check(badgeContext);
            return (
              <div
                key={badge.id}
                className={`flex-shrink-0 w-20 rounded-2xl p-3 text-center ${
                  unlocked ? 'bg-navy-light' : 'bg-navy-lighter opacity-50 grayscale'
                }`}
              >
                <div className="text-2xl mb-1">
                  {unlocked ? badge.emoji : <Lock className="w-5 h-5 text-gray-400 mx-auto" />}
                </div>
                <p className={`text-xs font-medium ${unlocked ? 'text-white' : 'text-gray-400'}`}>
                  {badge.name}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORY_FILTERS.map((filter) => {
            const isActive = categoryFilter === filter.key;
            return (
              <button
                key={filter.key}
                onClick={() => setCategoryFilter(filter.key)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-tennis text-navy'
                    : 'bg-navy-lighter text-gray-400'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rally list */}
      <div className="px-4 space-y-3">
        {filteredRallies.map((rally) => (
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
