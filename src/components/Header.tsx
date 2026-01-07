import { Download, Music } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type View = 'home' | 'dashboard' | 'editor' | 'public-page' | 'converter';

interface HeaderProps {
  onAuthClick: () => void;
  onNavigate?: (view: View) => void;
  currentView?: View;
}

export function Header({ onAuthClick, onNavigate, currentView }: HeaderProps) {
  const { user, profile, signOut } = useAuth();

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('home');
    } else {
      window.location.href = '/';
    }
  };

  const handleConverterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('converter');
    } else {
      window.location.href = '/converter';
    }
  };

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('dashboard');
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <a
            href="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2 text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
          >
            <Music className="w-8 h-8 text-blue-600" />
            <span>Linkiz</span>
          </a>

          <nav className="flex items-center gap-6">
            <button
              onClick={handleConverterClick}
              className={`flex items-center gap-2 font-medium transition-colors ${
                currentView === 'converter'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Download className="w-4 h-4" />
              Convertisseur
            </button>

            {user ? (
              <>
                <button
                  onClick={handleDashboardClick}
                  className={`font-medium transition-colors ${
                    currentView === 'dashboard'
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Dashboard
                </button>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-full">
                    <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                      {profile?.plan_type || 'Free'}
                    </span>
                  </div>
                  <button
                    onClick={signOut}
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                  Features
                </a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                  Pricing
                </a>
                <button
                  onClick={onAuthClick}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                >
                  Get Started
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
