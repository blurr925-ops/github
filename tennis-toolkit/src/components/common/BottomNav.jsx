import { NavLink } from 'react-router-dom';
import { Home, Target, Swords, ClipboardList, Trophy, Camera } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/patterns', icon: Target, label: 'Patterns' },
  { to: '/points', icon: Swords, label: 'Points' },
  { to: '/match', icon: ClipboardList, label: 'Match' },
  { to: '/goals', icon: Trophy, label: 'Goals' },
  { to: '/photos', icon: Camera, label: 'Photos' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-navy-light border-t border-navy-lighter z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[56px] ${
                isActive
                  ? 'text-tennis scale-105'
                  : 'text-gray-400 hover:text-gray-200'
              }`
            }
          >
            <Icon size={24} strokeWidth={2.5} />
            <span className="text-[11px] font-bold">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
