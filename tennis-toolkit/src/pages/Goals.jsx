import { useState, useCallback } from 'react';
import { Star, Plus, Trophy, Target, Check } from 'lucide-react';
import { useStorage } from '../hooks/useStorage';
import { generateId } from '../utils/storage';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Confetti from '../components/common/Confetti';
import { goalCategories } from '../data/defaultTags';

const tabs = [
  { key: 'short', label: 'This Week' },
  { key: 'medium', label: 'This Season' },
  { key: 'long', label: 'This Year' },
];

const statusFlow = ['not_started', 'in_progress', 'achieved'];

const statusConfig = {
  not_started: { label: 'Not started', color: 'text-gray-400', bg: 'bg-gray-500/20' },
  in_progress: { label: 'In progress', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  achieved: { label: 'Achieved', color: 'text-green-400', bg: 'bg-green-500/20' },
};

const categoryEmoji = {
  technical: '🎾',
  tactical: '🧠',
  physical: '💪',
  mental: '😤',
};

export default function Goals() {
  const [goals, setGoals] = useStorage('goals', []);
  const [activeTab, setActiveTab] = useState('short');
  const [showForm, setShowForm] = useState(false);
  const [celebrating, setCelebrating] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const handleConfettiDone = useCallback(() => setShowConfetti(false), []);

  // Form state
  const [formText, setFormText] = useState('');
  const [formCategory, setFormCategory] = useState('technical');
  const [formTargetDate, setFormTargetDate] = useState('');

  const filteredGoals = goals
    .filter((g) => g.timeframe === activeTab)
    .sort((a, b) => {
      if (a.starred && !b.starred) return -1;
      if (!a.starred && b.starred) return 1;
      return new Date(b.dateSet) - new Date(a.dateSet);
    });

  const achievedCount = filteredGoals.filter((g) => g.status === 'achieved').length;
  const totalCount = filteredGoals.length;
  const progressPercent = totalCount > 0 ? Math.round((achievedCount / totalCount) * 100) : 0;

  const handleAddGoal = () => {
    if (!formText.trim()) return;
    const newGoal = {
      id: generateId(),
      text: formText.trim(),
      category: formCategory,
      timeframe: activeTab,
      status: 'not_started',
      dateSet: new Date().toISOString(),
      targetDate: formTargetDate || null,
      reflection: '',
      starred: false,
    };
    setGoals((prev) => [...prev, newGoal]);
    setFormText('');
    setFormCategory('technical');
    setFormTargetDate('');
    setShowForm(false);
  };

  const cycleStatus = (goalId) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const currentIdx = statusFlow.indexOf(g.status);
        const nextStatus = statusFlow[(currentIdx + 1) % statusFlow.length];
        if (nextStatus === 'achieved') {
          setCelebrating(goalId);
          setShowConfetti(true);
          setTimeout(() => setCelebrating(null), 1200);
        }
        return { ...g, status: nextStatus };
      })
    );
  };

  const toggleStar = (e, goalId) => {
    e.stopPropagation();
    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, starred: !g.starred } : g))
    );
  };

  return (
    <div className="min-h-screen bg-navy p-4 pb-24">
      <Confetti active={showConfetti} onComplete={handleConfettiDone} />
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
          <Target className="w-6 h-6 text-tennis" />
          My Goals
        </h1>
        <p className="text-gray-400 text-sm mt-1">Set goals and crush them!</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-navy-lighter rounded-2xl p-1 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 px-2 rounded-xl text-sm font-bold min-h-[48px] transition-all ${
              activeTab === tab.key
                ? 'bg-tennis text-navy'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <Card className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-300">
              {achievedCount}/{totalCount} goals achieved
            </span>
            <span className="text-sm text-tennis font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-navy-lighter rounded-full h-3 overflow-hidden">
            <div
              className="bg-tennis h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </Card>
      )}

      {/* Add Goal button */}
      <Button onClick={() => setShowForm(!showForm)} className="w-full mb-4">
        <Plus className="w-5 h-5" />
        {showForm ? 'Cancel' : 'Add Goal'}
      </Button>

      {/* Add Goal form */}
      {showForm && (
        <Card className="mb-4 space-y-3">
          <p className="text-white font-bold text-sm">What do you want to achieve?</p>
          <input
            type="text"
            value={formText}
            onChange={(e) => setFormText(e.target.value)}
            placeholder="e.g. Hit 10 forehands in a row"
            className="w-full bg-navy rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 border border-gray-600 focus:border-tennis focus:outline-none min-h-[48px]"
          />
          <p className="text-gray-400 text-xs font-bold">Category</p>
          <div className="flex flex-wrap gap-2">
            {goalCategories.map((cat) => (
              <Badge
                key={cat.value}
                active={formCategory === cat.value}
                onClick={() => setFormCategory(cat.value)}
              >
                {cat.emoji} {cat.label}
              </Badge>
            ))}
          </div>
          <p className="text-gray-400 text-xs font-bold">Target date (optional)</p>
          <input
            type="date"
            value={formTargetDate}
            onChange={(e) => setFormTargetDate(e.target.value)}
            className="w-full bg-navy rounded-xl px-4 py-3 text-white text-sm border border-gray-600 focus:border-tennis focus:outline-none min-h-[48px]"
          />
          <Button onClick={handleAddGoal} className="w-full">
            <Check className="w-5 h-5" />
            Save Goal
          </Button>
        </Card>
      )}

      {/* Goals list */}
      {filteredGoals.length === 0 && !showForm && (
        <div className="text-center py-12">
          <Target className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No goals yet for this timeframe.</p>
          <p className="text-gray-500 text-xs mt-1">Tap "Add Goal" to get started!</p>
        </div>
      )}

      <div className="space-y-3">
        {filteredGoals.map((goal) => {
          const status = statusConfig[goal.status];
          const isCelebrating = celebrating === goal.id;
          return (
            <Card
              key={goal.id}
              onClick={() => cycleStatus(goal.id)}
              className={`relative ${isCelebrating ? 'animate-celebrate' : ''}`}
            >
              <div className="flex items-start gap-3">
                {/* Status indicator */}
                <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${status.bg}`}>
                  {goal.status === 'achieved' ? (
                    <Trophy className={`w-4 h-4 ${status.color}`} />
                  ) : goal.status === 'in_progress' ? (
                    <Target className={`w-4 h-4 ${status.color}`} />
                  ) : (
                    <div className="w-3 h-3 rounded-full border-2 border-gray-500" />
                  )}
                </div>

                {/* Goal content */}
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm ${goal.status === 'achieved' ? 'text-green-400 line-through' : 'text-white'}`}>
                    {goal.text}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                      {status.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {categoryEmoji[goal.category]} {goal.category}
                    </span>
                    {goal.targetDate && (
                      <span className="text-xs text-gray-500">
                        by {new Date(goal.targetDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Star button */}
                <button
                  onClick={(e) => toggleStar(e, goal.id)}
                  className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <Star
                    className={`w-5 h-5 transition-colors ${
                      goal.starred ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
                    }`}
                  />
                </button>
              </div>

              {/* Trophy celebration overlay */}
              {isCelebrating && (
                <div className="absolute inset-0 flex items-center justify-center bg-navy-light/80 rounded-2xl animate-celebrate-overlay">
                  <span className="text-5xl animate-celebrate-trophy">🏆</span>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Celebration animation styles */}
      <style>{`
        @keyframes celebrate {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
        @keyframes celebrateTrophy {
          0% { transform: scale(0); opacity: 0; }
          40% { transform: scale(1.3); opacity: 1; }
          70% { transform: scale(1); }
          100% { transform: scale(1); opacity: 0; }
        }
        .animate-celebrate {
          animation: celebrate 0.4s ease-in-out;
        }
        .animate-celebrate-overlay {
          animation: celebrate 1.2s ease-in-out forwards;
        }
        .animate-celebrate-trophy {
          animation: celebrateTrophy 1.2s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}
