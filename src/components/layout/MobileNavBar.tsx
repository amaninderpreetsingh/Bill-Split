// src/components/MobileNavBar.tsx (with Material Design Icons)

import { Link, useLocation } from 'react-router-dom';
import { MdGroups, MdAccountCircle } from 'react-icons/md';
import { FiAperture} from 'react-icons/fi';

export function MobileNavBar() {
  const location = useLocation();

  const navItems = [
    { name: 'AI Scan', path: '/', icon: FiAperture  }, // Camera icon
    { name: 'Groups', path: '/groups', icon: MdGroups },       // Bolder group icon
    { name: 'Profile', path: '/settings', icon: MdAccountCircle }, // User circle icon
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 md:hidden">
      {/* Backdrop blur and gradient background */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-white/80 backdrop-blur-lg border-t border-gray-200/50" />

      {/* Safe area padding for bottom (for devices with home indicators) */}
      <div className="relative px-6 pt-2 pb-6 safe-bottom">
        <div className="flex justify-around items-start gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`
                  flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl min-w-[72px]
                  transition-all duration-300 ease-out
                  ${
                    isActive
                      ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105'
                      : 'text-gray-600 hover:bg-gray-100 active:scale-95'
                  }
                `}
              >
                <item.icon className={`text-2xl transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className={`text-[10px] font-semibold tracking-wide ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}