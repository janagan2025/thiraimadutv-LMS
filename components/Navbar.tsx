import React from 'react';

interface NavbarProps {
  currentView: 'dashboard' | 'admin';
  setCurrentView: (view: 'dashboard' | 'admin') => void;
  isLoggedIn: boolean;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView, isLoggedIn, onLogout }) => {
  return (
    <nav className="bg-slate-800 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="font-bold text-lg hidden sm:block">TTV LMS</span>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              முகப்பு (Dashboard)
            </button>
            <button
              onClick={() => setCurrentView('admin')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'admin'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              அதிபர் பகுதி (Admin)
            </button>
            {isLoggedIn && currentView === 'admin' && (
              <button
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                வெளியேறு
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};