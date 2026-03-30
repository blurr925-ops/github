export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'font-bold rounded-full px-6 py-3 min-h-[48px] transition-all active:scale-95 flex items-center justify-center gap-2 text-sm';
  const variants = {
    primary: 'bg-tennis text-navy hover:bg-tennis-dark',
    secondary: 'bg-navy-lighter text-gray-200 hover:bg-navy-light border border-gray-600',
    danger: 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
