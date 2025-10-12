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
    <nav className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 shadow-lg md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`
                flex flex-col items-center justify-center p-2 text-xs font-medium transition-colors
                ${
                  // Use a vibrant color like 'text-red-600' or 'text-green-600'
                  isActive
                    ? 'text-indigo-600' // Active color
                    : 'text-gray-500 hover:text-indigo-400' // Default color
                }
              `}
            >
              <item.icon className="text-2xl" />
              <span className="mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}