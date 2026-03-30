export default function Badge({ children, active, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all min-h-[36px] ${
        active
          ? 'bg-tennis/20 text-tennis border border-tennis/40'
          : 'bg-navy-lighter text-gray-400 border border-gray-600 hover:border-gray-400'
      } ${className}`}
    >
      {children}
    </button>
  );
}
