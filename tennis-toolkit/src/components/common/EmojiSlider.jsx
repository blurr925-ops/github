const emojis = ['😰', '😟', '😐', '😊', '🔥'];

export default function EmojiSlider({ value, onChange }) {
  return (
    <div className="flex justify-between items-center gap-1 py-2">
      {emojis.map((emoji, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onChange(index + 1)}
          className={`text-3xl p-2 rounded-xl transition-all min-w-[48px] min-h-[48px] flex items-center justify-center ${
            value === index + 1
              ? 'scale-125 bg-navy-lighter ring-2 ring-tennis'
              : 'opacity-40 hover:opacity-70'
          }`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
