import { useState } from 'react';
import { Save, Trophy, TrendingUp, TrendingDown, MessageCircle } from 'lucide-react';
import Button from '../common/Button';

const moodEmojis = ['😢', '😤', '😐', '😊', '🎉'];

export default function PostMatchForm({ match, onChange, onSave }) {
  const update = (field, value) => {
    onChange({ ...match, [field]: value });
  };

  const result = match.result;
  const gamePlanAdherence = match.gamePlanAdherence;

  return (
    <div className="space-y-6">
      {/* Result toggle */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          <Trophy className="w-4 h-4 inline mr-1.5" />
          Result
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => update('result', 'won')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm min-h-[48px] transition-all ${
              result === 'won'
                ? 'bg-green-500/20 text-green-400 ring-2 ring-green-500'
                : 'bg-navy-lighter text-gray-400 border border-gray-600 hover:border-gray-500'
            }`}
          >
            Won
          </button>
          <button
            type="button"
            onClick={() => update('result', 'lost')}
            className={`flex-1 py-3 rounded-xl font-bold text-sm min-h-[48px] transition-all ${
              result === 'lost'
                ? 'bg-red-500/20 text-red-400 ring-2 ring-red-500'
                : 'bg-navy-lighter text-gray-400 border border-gray-600 hover:border-gray-500'
            }`}
          >
            Lost
          </button>
        </div>
      </div>

      {/* Score */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Score
        </label>
        <input
          type="text"
          value={match.score || ''}
          onChange={(e) => update('score', e.target.value)}
          placeholder="e.g. 6-4, 3-6, 7-5"
          className="w-full bg-navy-lighter text-white rounded-xl px-4 py-3 min-h-[48px] border border-gray-600 focus:border-tennis focus:outline-none placeholder-gray-500"
        />
      </div>

      {/* What went well */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          <TrendingUp className="w-4 h-4 inline mr-1.5" />
          What went well?
        </label>
        <textarea
          value={match.wentWell || ''}
          onChange={(e) => update('wentWell', e.target.value)}
          placeholder="I'm proud of myself for..."
          rows={3}
          className="w-full bg-navy-lighter text-white rounded-xl px-4 py-3 border border-gray-600 focus:border-tennis focus:outline-none placeholder-gray-500 resize-none"
        />
      </div>

      {/* What could I improve */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          <TrendingDown className="w-4 h-4 inline mr-1.5" />
          What could I improve?
        </label>
        <textarea
          value={match.couldImprove || ''}
          onChange={(e) => update('couldImprove', e.target.value)}
          placeholder="Next time I'll work on..."
          rows={3}
          className="w-full bg-navy-lighter text-white rounded-xl px-4 py-3 border border-gray-600 focus:border-tennis focus:outline-none placeholder-gray-500 resize-none"
        />
      </div>

      {/* Did I stick to my game plan? */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          <MessageCircle className="w-4 h-4 inline mr-1.5" />
          Did I stick to my game plan?
        </label>
        <div className="flex gap-3">
          {['Yes', 'Partly', 'No'].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => update('gamePlanAdherence', option)}
              className={`flex-1 py-3 rounded-xl font-bold text-sm min-h-[48px] transition-all ${
                gamePlanAdherence === option
                  ? 'bg-tennis/20 text-tennis ring-2 ring-tennis'
                  : 'bg-navy-lighter text-gray-400 border border-gray-600 hover:border-gray-500'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        {gamePlanAdherence && (
          <textarea
            value={match.gamePlanReflection || ''}
            onChange={(e) => update('gamePlanReflection', e.target.value)}
            placeholder={
              gamePlanAdherence === 'Yes'
                ? 'Great job! What helped you stick to it?'
                : gamePlanAdherence === 'Partly'
                  ? 'What parts did you follow? What changed?'
                  : 'What got in the way? What would help next time?'
            }
            rows={2}
            className="mt-3 w-full bg-navy-lighter text-white rounded-xl px-4 py-3 border border-gray-600 focus:border-tennis focus:outline-none placeholder-gray-500 resize-none"
          />
        )}
      </div>

      {/* Mood after match */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          How do I feel after the match?
        </label>
        <div className="flex justify-between items-center gap-1 py-2">
          {moodEmojis.map((emoji, index) => (
            <button
              key={index}
              type="button"
              onClick={() => update('mood', index + 1)}
              className={`text-3xl p-2 rounded-xl transition-all min-w-[48px] min-h-[48px] flex items-center justify-center ${
                match.mood === index + 1
                  ? 'scale-125 bg-navy-lighter ring-2 ring-tennis'
                  : 'opacity-40 hover:opacity-70'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Key takeaway */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Key Takeaway
        </label>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm whitespace-nowrap">Next time I will...</span>
          <input
            type="text"
            value={match.keyTakeaway || ''}
            onChange={(e) => update('keyTakeaway', e.target.value)}
            placeholder="e.g. serve more to the backhand"
            className="flex-1 bg-navy-lighter text-white rounded-xl px-4 py-3 min-h-[48px] border border-gray-600 focus:border-tennis focus:outline-none placeholder-gray-500"
          />
        </div>
      </div>

      {/* Save button */}
      <Button onClick={onSave} className="w-full">
        <Save className="w-4 h-4" />
        Save Match Review
      </Button>
    </div>
  );
}
