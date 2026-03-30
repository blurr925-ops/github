import { Calendar, User } from 'lucide-react';
import Card from '../common/Card';

export default function MatchHistory({ matches, onSelect }) {
  const sorted = [...matches].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  if (sorted.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg mb-1">No matches yet</p>
        <p className="text-gray-500 text-sm">
          Start a new match to begin tracking your progress!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map((match) => {
        const isWon = match.result === 'won';
        const hasResult = match.result != null;

        return (
          <Card key={match.id} onClick={() => onSelect(match.id)}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-white font-semibold">
                    {match.opponentName || 'Unknown Opponent'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {new Date(match.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  {match.score && (
                    <>
                      <span className="text-gray-600">|</span>
                      <span>{match.score}</span>
                    </>
                  )}
                </div>
              </div>
              {hasResult && (
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
              {!hasResult && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400">
                  In Progress
                </span>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
