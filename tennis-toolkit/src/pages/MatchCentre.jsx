import { useState } from 'react';
import { PlusCircle, History, ArrowLeft } from 'lucide-react';
import { useStorage } from '../hooks/useStorage';
import { generateId } from '../utils/storage';
import PreMatchForm from '../components/match/PreMatchForm';
import PostMatchForm from '../components/match/PostMatchForm';
import MatchHistory from '../components/match/MatchHistory';

const TABS = [
  { key: 'new', label: 'New Match', icon: PlusCircle },
  { key: 'history', label: 'History', icon: History },
];

function createEmptyMatch() {
  return {
    id: generateId(),
    date: new Date().toISOString(),
    opponentName: '',
    gamePlan: '',
    opponentStrengths: [],
    opponentWeaknesses: [],
    focusPoints: [],
    confidence: 0,
    result: null,
    score: '',
    wentWell: '',
    couldImprove: '',
    gamePlanAdherence: null,
    gamePlanReflection: '',
    mood: 0,
    keyTakeaway: '',
    preMatchSaved: false,
  };
}

export default function MatchCentre() {
  const [matches, setMatches] = useStorage('matches', []);
  const [opponents, setOpponents] = useStorage('opponents', {});
  const [activeTab, setActiveTab] = useState('new');
  const [currentMatch, setCurrentMatch] = useState(createEmptyMatch);
  const [phase, setPhase] = useState('pre'); // 'pre' or 'post'
  const [selectedMatchId, setSelectedMatchId] = useState(null);

  const opponentNames = Object.keys(opponents);

  const handlePreMatchChange = (updated) => {
    setCurrentMatch(updated);
  };

  const handlePreMatchSave = () => {
    const saved = { ...currentMatch, preMatchSaved: true };
    setCurrentMatch(saved);
    setMatches((prev) => [...prev, saved]);

    // Store opponent data for future reference
    if (saved.opponentName) {
      setOpponents((prev) => ({
        ...prev,
        [saved.opponentName]: {
          strengths: saved.opponentStrengths,
          weaknesses: saved.opponentWeaknesses,
          lastPlayed: saved.date,
        },
      }));
    }

    setPhase('post');
  };

  const handlePostMatchChange = (updated) => {
    setCurrentMatch(updated);
  };

  const handlePostMatchSave = () => {
    const saved = { ...currentMatch };
    setMatches((prev) =>
      prev.map((m) => (m.id === saved.id ? saved : m))
    );

    // Update opponent data
    if (saved.opponentName) {
      setOpponents((prev) => ({
        ...prev,
        [saved.opponentName]: {
          ...prev[saved.opponentName],
          strengths: saved.opponentStrengths,
          weaknesses: saved.opponentWeaknesses,
          lastPlayed: saved.date,
        },
      }));
    }

    // Reset for next match
    setCurrentMatch(createEmptyMatch());
    setPhase('pre');
    setActiveTab('history');
  };

  const handleLoadPrevious = (opponentName) => {
    const data = opponents[opponentName];
    if (data) {
      setCurrentMatch((prev) => ({
        ...prev,
        opponentStrengths: data.strengths || [],
        opponentWeaknesses: data.weaknesses || [],
      }));
    }
  };

  const handleSelectMatch = (matchId) => {
    setSelectedMatchId(matchId);
  };

  const selectedMatch = selectedMatchId
    ? matches.find((m) => m.id === selectedMatchId)
    : null;

  const renderMatchDetail = () => {
    if (!selectedMatch) return null;

    const isWon = selectedMatch.result === 'won';

    return (
      <div className="space-y-5">
        <button
          onClick={() => setSelectedMatchId(null)}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to history
        </button>

        <div className="bg-navy-light rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white text-lg font-bold">
              vs {selectedMatch.opponentName || 'Unknown'}
            </h3>
            {selectedMatch.result && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isWon
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {isWon ? 'Won' : 'Lost'}
              </span>
            )}
          </div>

          {selectedMatch.score && (
            <p className="text-gray-300 mb-3">
              <span className="text-gray-500">Score:</span> {selectedMatch.score}
            </p>
          )}

          <p className="text-gray-500 text-sm">
            {new Date(selectedMatch.date).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Pre-match section */}
        {selectedMatch.gamePlan && (
          <div className="bg-navy-light rounded-2xl p-5">
            <h4 className="text-tennis font-semibold mb-3">Pre-Match Plan</h4>
            <p className="text-gray-300 text-sm mb-3">{selectedMatch.gamePlan}</p>
            {selectedMatch.focusPoints?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedMatch.focusPoints.map((tag) => (
                  <span
                    key={tag}
                    className="bg-tennis/10 text-tennis text-xs px-2.5 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Post-match section */}
        {selectedMatch.wentWell && (
          <div className="bg-navy-light rounded-2xl p-5 space-y-3">
            <h4 className="text-tennis font-semibold">Post-Match Reflection</h4>
            {selectedMatch.wentWell && (
              <div>
                <p className="text-gray-500 text-xs mb-1">What went well</p>
                <p className="text-gray-300 text-sm">{selectedMatch.wentWell}</p>
              </div>
            )}
            {selectedMatch.couldImprove && (
              <div>
                <p className="text-gray-500 text-xs mb-1">Could improve</p>
                <p className="text-gray-300 text-sm">{selectedMatch.couldImprove}</p>
              </div>
            )}
            {selectedMatch.keyTakeaway && (
              <div>
                <p className="text-gray-500 text-xs mb-1">Key takeaway</p>
                <p className="text-gray-300 text-sm">
                  Next time I will... {selectedMatch.keyTakeaway}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-navy pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-white text-2xl font-bold mb-1">Match Centre</h1>
        <p className="text-gray-400 text-sm">
          Plan your matches and track your progress
        </p>
      </div>

      {/* Tab bar */}
      <div className="px-4 mb-5">
        <div className="bg-navy-light rounded-2xl p-1 flex">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => {
                setActiveTab(key);
                setSelectedMatchId(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm min-h-[48px] transition-all ${
                activeTab === key
                  ? 'bg-tennis text-navy'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-4">
        {activeTab === 'new' && (
          <div>
            {phase === 'pre' && (
              <>
                <div className="bg-tennis/10 border border-tennis/30 rounded-2xl p-4 mb-5">
                  <p className="text-tennis font-semibold text-sm">
                    Let's get ready for your match!
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Fill in your game plan before you step on court.
                  </p>
                </div>
                <PreMatchForm
                  match={currentMatch}
                  opponents={opponentNames}
                  onChange={handlePreMatchChange}
                  onSave={handlePreMatchSave}
                  onLoadPrevious={handleLoadPrevious}
                />
              </>
            )}
            {phase === 'post' && (
              <>
                <div className="bg-tennis/10 border border-tennis/30 rounded-2xl p-4 mb-5">
                  <p className="text-tennis font-semibold text-sm">
                    Great job completing your match!
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Now let's reflect on how it went.
                  </p>
                </div>
                <PostMatchForm
                  match={currentMatch}
                  onChange={handlePostMatchChange}
                  onSave={handlePostMatchSave}
                />
              </>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            {selectedMatchId ? (
              renderMatchDetail()
            ) : (
              <>
                {(() => {
                  const completed = matches.filter((m) => m.result === 'won' || m.result === 'lost');
                  if (completed.length === 0) return null;

                  const wins = completed.filter((m) => m.result === 'won').length;
                  const losses = completed.length - wins;
                  const winRate = Math.round((wins / completed.length) * 100);

                  // Opponent breakdown
                  const opponentRecord = {};
                  completed.forEach((m) => {
                    const name = m.opponentName || 'Unknown';
                    if (!opponentRecord[name]) opponentRecord[name] = { wins: 0, losses: 0 };
                    if (m.result === 'won') opponentRecord[name].wins += 1;
                    else opponentRecord[name].losses += 1;
                  });

                  // Best win streak
                  let bestStreak = 0;
                  let current = 0;
                  const sorted = [...completed].sort((a, b) => new Date(a.date) - new Date(b.date));
                  sorted.forEach((m) => {
                    if (m.result === 'won') {
                      current += 1;
                      if (current > bestStreak) bestStreak = current;
                    } else {
                      current = 0;
                    }
                  });

                  const winPct = completed.length > 0 ? (wins / completed.length) * 100 : 0;

                  return (
                    <div className="bg-navy-light rounded-2xl p-5 mb-5 space-y-5">
                      {/* Win Rate */}
                      <div className="text-center">
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Win Rate</p>
                        <p className="text-tennis text-4xl font-bold">{winRate}%</p>
                      </div>

                      {/* Overall Record Bar */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-gray-400 text-xs uppercase tracking-wider">Overall Record</p>
                          <p className="text-white text-sm font-semibold">{wins}W - {losses}L</p>
                        </div>
                        <div className="flex h-3 rounded-full overflow-hidden bg-navy">
                          {wins > 0 && (
                            <div
                              className="bg-green-500 transition-all"
                              style={{ width: `${winPct}%` }}
                            />
                          )}
                          {losses > 0 && (
                            <div
                              className="bg-red-500 transition-all"
                              style={{ width: `${100 - winPct}%` }}
                            />
                          )}
                        </div>
                      </div>

                      {/* Best Streak */}
                      <div className="flex items-center justify-between">
                        <p className="text-gray-400 text-xs uppercase tracking-wider">Best Win Streak</p>
                        <p className="text-tennis font-bold text-lg">{bestStreak} {bestStreak === 1 ? 'match' : 'matches'}</p>
                      </div>

                      {/* Opponent Breakdown */}
                      {Object.keys(opponentRecord).length > 0 && (
                        <div>
                          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Opponent Breakdown</p>
                          <div className="space-y-1.5">
                            {Object.entries(opponentRecord)
                              .sort(([, a], [, b]) => (b.wins + b.losses) - (a.wins + a.losses))
                              .map(([name, rec]) => (
                                <div
                                  key={name}
                                  className="flex items-center justify-between min-h-[44px] px-3 py-2 bg-navy rounded-xl"
                                >
                                  <span className="text-white text-sm">vs {name}</span>
                                  <span className="text-gray-400 text-sm font-semibold">
                                    <span className="text-green-400">{rec.wins}</span>
                                    {' - '}
                                    <span className="text-red-400">{rec.losses}</span>
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
                <MatchHistory matches={matches} onSelect={handleSelectMatch} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
