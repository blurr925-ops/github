import { useState, useRef } from 'react';
import { User, ClipboardList, Search, Save } from 'lucide-react';
import TagSelector from '../common/TagSelector';
import EmojiSlider from '../common/EmojiSlider';
import Button from '../common/Button';
import { strengthTags, weaknessTags, focusTags } from '../../data/defaultTags';

export default function PreMatchForm({ match, opponents = [], onChange, onSave, onLoadPrevious }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const update = (field, value) => {
    onChange({ ...match, [field]: value });
  };

  const filteredOpponents = opponents.filter(
    (name) => name.toLowerCase().includes((match.opponentName || '').toLowerCase()) && name !== match.opponentName
  );

  const hasPlayedBefore = match.opponentName && opponents.includes(match.opponentName);

  const handleFocusChange = (tags) => {
    if (tags.length <= 3) {
      update('focusPoints', tags);
    }
  };

  return (
    <div className="space-y-6">
      {/* Opponent name */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          <User className="w-4 h-4 inline mr-1.5" />
          Opponent Name
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={match.opponentName || ''}
            onChange={(e) => {
              update('opponentName', e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Who are you playing?"
            className="w-full bg-navy-lighter text-white rounded-xl px-4 py-3 min-h-[48px] border border-gray-600 focus:border-tennis focus:outline-none placeholder-gray-500"
          />
          {showSuggestions && filteredOpponents.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-navy-lighter border border-gray-600 rounded-xl overflow-hidden shadow-xl">
              {filteredOpponents.map((name) => (
                <button
                  key={name}
                  type="button"
                  onMouseDown={() => {
                    update('opponentName', name);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-4 py-3 text-white hover:bg-navy-light transition-colors min-h-[44px]"
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
        {hasPlayedBefore && (
          <button
            type="button"
            onClick={() => onLoadPrevious?.(match.opponentName)}
            className="mt-2 flex items-center gap-1.5 text-tennis text-sm font-medium hover:underline min-h-[44px] px-1"
          >
            <Search className="w-4 h-4" />
            Load previous notes
          </button>
        )}
      </div>

      {/* Game plan */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          <ClipboardList className="w-4 h-4 inline mr-1.5" />
          Game Plan
        </label>
        <textarea
          value={match.gamePlan || ''}
          onChange={(e) => update('gamePlan', e.target.value)}
          placeholder="What am I going to try to do today?"
          rows={3}
          className="w-full bg-navy-lighter text-white rounded-xl px-4 py-3 border border-gray-600 focus:border-tennis focus:outline-none placeholder-gray-500 resize-none"
        />
      </div>

      {/* Opponent strengths */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Their Strengths
        </label>
        <TagSelector
          tags={strengthTags}
          selected={match.opponentStrengths || []}
          onChange={(tags) => update('opponentStrengths', tags)}
        />
      </div>

      {/* Opponent weaknesses */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Their Weaknesses
        </label>
        <TagSelector
          tags={weaknessTags}
          selected={match.opponentWeaknesses || []}
          onChange={(tags) => update('opponentWeaknesses', tags)}
        />
      </div>

      {/* Focus points */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          My Focus Points
          <span className="text-gray-500 font-normal ml-1">(pick up to 3)</span>
        </label>
        <TagSelector
          tags={focusTags}
          selected={match.focusPoints || []}
          onChange={handleFocusChange}
        />
      </div>

      {/* Confidence rating */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          How confident am I feeling?
        </label>
        <EmojiSlider
          value={match.confidence || 0}
          onChange={(val) => update('confidence', val)}
        />
      </div>

      {/* Save button */}
      <Button onClick={onSave} className="w-full">
        <Save className="w-4 h-4" />
        Save Pre-Match Plan
      </Button>
    </div>
  );
}
