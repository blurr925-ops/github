import { Link } from 'react-router-dom';
import { Target, ClipboardList, Trophy, Camera, ChevronRight } from 'lucide-react';
import Card from '../components/common/Card';
import { useStorage } from '../hooks/useStorage';
import { rallies } from '../data/patterns';

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
