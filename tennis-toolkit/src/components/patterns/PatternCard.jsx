import { CheckCircle, Play } from 'lucide-react';
import Card from '../common/Card';
import { difficultyColors } from '../../data/patterns';

export default function PatternCard({ pattern, completed, onStart }) {
  const colors = difficultyColors[pattern.difficulty] || difficultyColors.green;

  return (
    <Card
      className="flex items-center gap-3"
      onClick={() => onStart(pattern)}
    >
      {/* Completion indicator */}
      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
        {completed ? (
          <CheckCircle className="w-7 h-7 text-green-400" />
        ) : (
          <div className="w-7 h-7 rounded-full border-2 border-navy-lighter" />
        )}
      </div>

      {/* Pattern info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-white font-semibold text-base truncate">
            {pattern.name}
          </h3>
          <span
            className={`${colors.bg} text-white text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0`}
          >
            {colors.label}
          </span>
        </div>
        <p className="text-gray-400 text-sm line-clamp-2">
          {pattern.description}
        </p>
      </div>

      {/* Play button */}
      <button
        className="flex-shrink-0 w-12 h-12 bg-tennis/20 hover:bg-tennis/30 active:bg-tennis/40 rounded-xl flex items-center justify-center transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onStart(pattern);
        }}
        aria-label={`Play ${pattern.name}`}
      >
        <Play className="w-5 h-5 text-tennis fill-tennis" />
      </button>
    </Card>
  );
}
