import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Target, ClipboardList, Trophy, Camera, ChevronRight } from 'lucide-react';
import Card from '../components/common/Card';
import { useStorage } from '../hooks/useStorage';
import { rallies } from '../data/patterns';

const DAILY_TIPS = [
  'Always start your rally cross-court \u2014 it\u2019s the safe play!',
  'When you get a short ball, attack it!',
  'Watch your opponent\u2019s position before you hit',
  'Stay on your toes between shots \u2014 be ready to move!',
  'Take a deep breath before each point to stay focused',
  'Hit to your opponent\u2019s weaker side when you can',
  'After every shot, recover back to the middle of the court',
];

function getRelativeDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfToday - startOfDate) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 0) return 'upcoming';
  return `${diffDays} days ago`;
}

export default function Home() {
  const [profile] = useStorage('profile', { name: '', avatar: '🎾' });
  const [completedPatterns] = useStorage('completedPatterns', []);
  const [matches] = useStorage('matches', []);
  const [goals] = useStorage('goals', []);

  const playerName = profile.name || 'Player';
  const patternsCompleted = completedPatterns.length;
  const totalPatterns = rallies.length;
  const activeGoals = goals.filter((g) => g.status !== 'achieved').length;
  const achievedGoals = goals.filter((g) => g.status === 'achieved').length;
  const lastMatch = matches.length > 0 ? matches[matches.length - 1] : null;

  // Match record
  const wins = matches.filter((m) => m.result === 'won').length;
  const losses = matches.filter((m) => m.result === 'lost').length;
  const totalDecided = wins + losses;
  const winPct = totalDecided > 0 ? Math.round((wins / totalDecided) * 100) : 0;

  // Recent activity feed (last 3 items)
  const recentActivities = useMemo(() => {
    const activities = [];

    // Matches with dates
    for (const match of matches) {
      if (match.date && (match.result === 'won' || match.result === 'lost')) {
        activities.push({
          type: 'match',
          emoji: '\uD83C\uDFF8',
          text: `Played vs ${match.opponentName || 'Unknown'} \u2014 ${match.result === 'won' ? 'Won' : 'Lost'}`,
          date: match.date,
        });
      }
    }

    // Achieved goals (use dateSet as best available timestamp)
    for (const goal of goals) {
      if (goal.status === 'achieved') {
        activities.push({
          type: 'goal',
          emoji: '\u2B50',
          text: `Achieved: ${goal.text}`,
          date: goal.dateSet,
        });
      }
    }

    // Completed patterns (no timestamp available, so show without date)
    const rallyMap = Object.fromEntries(rallies.map((r) => [r.id, r.name]));
    for (const patternId of completedPatterns) {
      const name = rallyMap[patternId];
      if (name) {
        activities.push({
          type: 'pattern',
          emoji: '\uD83C\uDFAF',
          text: `Won ${name} pattern`,
          date: null,
        });
      }
    }

    // Sort by date descending (items without dates go last)
    activities.sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date) - new Date(a.date);
    });

    return activities.slice(0, 3);
  }, [matches, goals, completedPatterns]);

  // Daily tip based on day of week
  const dailyTip = DAILY_TIPS[new Date().getDay()];

  return (
    <div className="p-4 pb-24 space-y-4">
      {/* Header */}
      <div className="text-center py-4">
        <div className="text-5xl mb-2">{profile.avatar || '🎾'}</div>
        <h1 className="text-2xl font-extrabold text-white">
          Hey, {playerName}!
        </h1>
        <p className="text-gray-400 text-sm mt-1">Ready to level up your game?</p>
      </div>

      {/* Name Setup (if no name set) */}
      {!profile.name && <NameSetup />}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/patterns">
          <Card className="text-center">
            <Target size={28} className="text-tennis mx-auto mb-1" />
            <div className="text-2xl font-extrabold text-white">{patternsCompleted}/{totalPatterns}</div>
            <div className="text-xs text-gray-400">Patterns Mastered</div>
          </Card>
        </Link>
        <Link to="/goals">
          <Card className="text-center">
            <Trophy size={28} className="text-yellow-400 mx-auto mb-1" />
            <div className="text-2xl font-extrabold text-white">{achievedGoals}</div>
            <div className="text-xs text-gray-400">Goals Achieved</div>
          </Card>
        </Link>
      </div>

      {/* Match Stats Row */}
      {matches.length > 0 && (
        <Link to="/match">
          <Card className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-tennis/20 flex items-center justify-center">
                <ClipboardList size={20} className="text-tennis" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">Match Record</div>
                <div className="text-xs text-gray-400">
                  {totalDecided > 0
                    ? `${winPct}% win rate`
                    : 'No results yet'}
                </div>
              </div>
            </div>
            <div className="text-2xl font-extrabold text-white">
              <span className="text-green-400">{wins}</span>
              <span className="text-gray-500">-</span>
              <span className="text-red-400">{losses}</span>
            </div>
          </Card>
        </Link>
      )}

      {/* Patterns Progress */}
      <Link to="/patterns">
        <Card className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-tennis/20 flex items-center justify-center">
              <Target size={20} className="text-tennis" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Patterns of Play</div>
              <div className="text-xs text-gray-400">
                {patternsCompleted === totalPatterns
                  ? 'All patterns mastered!'
                  : `${totalPatterns - patternsCompleted} more to go`}
              </div>
            </div>
          </div>
          <ChevronRight size={20} className="text-gray-500" />
        </Card>
      </Link>

      {/* Last Match */}
      <Link to="/match">
        <Card className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky/20 flex items-center justify-center">
              <ClipboardList size={20} className="text-sky" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Match Centre</div>
              <div className="text-xs text-gray-400">
                {lastMatch
                  ? `Last: vs ${lastMatch.opponentName} ${lastMatch.result === 'won' ? '(Won!)' : lastMatch.result === 'lost' ? '(Lost)' : '(In Progress)'}`
                  : 'Plan your next match'}
              </div>
            </div>
          </div>
          <ChevronRight size={20} className="text-gray-500" />
        </Card>
      </Link>

      {/* Goals Summary */}
      <Link to="/goals">
        <Card className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/20 flex items-center justify-center">
              <Trophy size={20} className="text-yellow-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">My Goals</div>
              <div className="text-xs text-gray-400">
                {activeGoals > 0
                  ? `${activeGoals} active goal${activeGoals !== 1 ? 's' : ''}`
                  : 'Set your first goal'}
              </div>
            </div>
          </div>
          <ChevronRight size={20} className="text-gray-500" />
        </Card>
      </Link>

      {/* Photos */}
      <Link to="/photos">
        <Card className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Camera size={20} className="text-purple-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">My Moments</div>
              <div className="text-xs text-gray-400">Your photo journal</div>
            </div>
          </div>
          <ChevronRight size={20} className="text-gray-500" />
        </Card>
      </Link>

      {/* Recent Activity Feed */}
      {recentActivities.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-1">
            Recent Activity
          </h2>
          <Card className="divide-y divide-gray-700/50">
            {recentActivities.map((activity, idx) => {
              const relative = getRelativeDate(activity.date);
              return (
                <div
                  key={`${activity.type}-${idx}`}
                  className="flex items-center gap-3 py-3"
                  style={{ minHeight: 44 }}
                >
                  <span className="text-xl flex-shrink-0 w-8 text-center" aria-hidden="true">
                    {activity.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{activity.text}</div>
                    {relative && (
                      <div className="text-xs text-gray-400">{relative}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      )}

      {/* Daily Tip */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-1">
          Tip of the Day
        </h2>
        <Card className="border border-tennis/30 bg-tennis/10">
          <div className="flex items-start gap-3" style={{ minHeight: 44 }}>
            <span className="text-2xl flex-shrink-0" aria-hidden="true">
              💡
            </span>
            <p className="text-sm text-white font-medium leading-relaxed">
              {dailyTip}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function NameSetup() {
  const [, setProfile] = useStorage('profile', { name: '', avatar: '🎾' });
  const avatars = ['🎾', '🏆', '⭐', '🔥', '💪', '🎯', '🦁', '🐯'];

  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name')?.toString().trim();
    const avatar = formData.get('avatar')?.toString() || '🎾';
    if (name) {
      setProfile({ name, avatar });
    }
  }

  return (
    <Card className="space-y-3">
      <div className="text-sm font-bold text-white">What's your name?</div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="name"
          type="text"
          placeholder="Enter your name..."
          className="w-full bg-navy-lighter rounded-xl px-4 py-3 text-white placeholder-gray-500 border border-gray-600 focus:border-tennis focus:outline-none text-sm"
          autoComplete="off"
        />
        <div>
          <div className="text-xs text-gray-400 mb-2">Pick your avatar:</div>
          <div className="flex gap-2 flex-wrap">
            {avatars.map((emoji, i) => (
              <label key={emoji} className="cursor-pointer">
                <input
                  type="radio"
                  name="avatar"
                  value={emoji}
                  defaultChecked={i === 0}
                  className="sr-only peer"
                />
                <span className="text-2xl p-1.5 rounded-xl block peer-checked:bg-tennis/20 peer-checked:ring-2 peer-checked:ring-tennis opacity-60 peer-checked:opacity-100 min-w-[44px] min-h-[44px] flex items-center justify-center">
                  {emoji}
                </span>
              </label>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-tennis text-navy font-bold rounded-full py-3 min-h-[48px] active:scale-95 transition-transform"
        >
          Let's Go!
        </button>
      </form>
    </Card>
  );
}
