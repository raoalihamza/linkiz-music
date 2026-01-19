import { useState } from 'react';
import { Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { SubscriptionManager } from './components/SubscriptionManager';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LandingPage } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { PageEditor } from './pages/Editor';
import { PublicPage } from './pages/PublicProfile';
import DownloaderPage from './pages/Downloader';
import PlaylistManager from './pages/PlaylistManager';

// Converters
import YouTubePage from './pages/converters/YouTube';
import InstagramPage from './pages/converters/Instagram';
import FacebookPage from './pages/converters/Facebook';
import TikTokPage from './pages/converters/TikTok';
import SoundCloudPage from './pages/converters/SoundCloud';
import SpotifyPage from './pages/converters/Spotify';
import { DownloadModal } from './components/DownloadModal';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  // State for public page downloads
  const [downloadModalLink, setDownloadModalLink] = useState<{ id: string, fileName: string } | null>(null);

  const openAuth = (mode: 'signin' | 'signup' = 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  // Handle navigation from Header
  const handleNavigation = (view: string) => {
    switch (view) {
      case 'home':
        navigate('/');
        break;
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'converters':
        navigate('/converters');
        break;
      case 'editor':
        navigate('/create');
        break;
      case 'playlists':
        navigate('/playlists');
        break;
      default:
        navigate('/');
    }
  };

  // Determine current view from location
  const getCurrentView = () => {
    if (location.pathname === '/') return 'home';
    if (location.pathname === '/dashboard') return 'dashboard';
    if (location.pathname.startsWith('/converters')) return 'converters';
    if (location.pathname === '/create' || location.pathname.startsWith('/edit')) return 'editor';
    if (location.pathname === '/playlists') return 'playlists';
    return 'home';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header
        onAuthClick={() => openAuth('signup')}
        onNavigate={handleNavigation}
        currentView={getCurrentView() as any}
      />

      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage onGetStarted={() => openAuth('signup')} />} />

          {/* Converter Routes */}
          <Route path="/converters" element={<DownloaderPage />} />
          <Route path="/converters/youtube" element={<YouTubePage onAuthRequired={() => openAuth('signup')} />} />
          <Route path="/converters/instagram" element={<InstagramPage onAuthRequired={() => openAuth('signup')} />} />
          <Route path="/converters/facebook" element={<FacebookPage onAuthRequired={() => openAuth('signup')} />} />
          <Route path="/converters/tiktok" element={<TikTokPage onAuthRequired={() => openAuth('signup')} />} />
          <Route path="/converters/soundcloud" element={<SoundCloudPage onAuthRequired={() => openAuth('signup')} />} />
          <Route path="/converters/spotify" element={<SpotifyPage onAuthRequired={() => openAuth('signup')} />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard
                  onCreatePage={() => navigate('/create')}
                  onUpgrade={() => setIsSubscriptionModalOpen(true)}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <PageEditorWrapper />
              </ProtectedRoute>
            }
          />

          <Route
            path="/playlists"
            element={
              <ProtectedRoute>
                <PlaylistManager />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit/:pageId"
            element={
              <ProtectedRoute>
                <PageEditorWrapper />
              </ProtectedRoute>
            }
          />

          {/* Public Profile - Must be last */}
          <Route
            path="/:slug"
            element={
              <PublicPageWrapper
                onAuthRequired={() => openAuth('signup')}
                onDownload={(id, name) => setDownloadModalLink({ id, fileName: name })}
              />
            }
          />
        </Routes>
      </main>

      {/* Conditionally render Footer: simpler to just always render it, or check location */}
      <FooterWrapper />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />

      <SubscriptionManager
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />

      <DownloadModal
        isOpen={!!downloadModalLink}
        onClose={() => setDownloadModalLink(null)}
        linkId={downloadModalLink?.id || ''}
        fileName={downloadModalLink?.fileName || ''}
        onUpgrade={() => setIsSubscriptionModalOpen(true)}
      />
    </div>
  );
}

// Wrapper to handle params for Editor
function PageEditorWrapper() {
  const { pageId } = useParams();
  const navigate = useNavigate();

  return (
    <PageEditor
      pageId={pageId}
      onSave={() => navigate('/dashboard')}
      onCancel={() => navigate('/dashboard')}
    />
  );
}

// Wrapper for Public Page to handle props
interface PublicPageWrapperProps {
  onAuthRequired: () => void;
  onDownload: (linkId: string, filename: string) => void;
}

function PublicPageWrapper({ onAuthRequired, onDownload }: PublicPageWrapperProps) {
  const { slug } = useParams();
  // Filter out system routes that might fall through if not careful
  const systemRoutes = ['login', 'signup', 'dashboard', 'create'];

  if (!slug || systemRoutes.includes(slug)) return <Navigate to="/" />;

  return (
    <PublicPage
      slug={slug}
      onDownload={onDownload}
      onAuthRequired={onAuthRequired}
    />
  );
}

// Wrapper to hide footer on public pages if desired
function FooterWrapper() {
  const location = useLocation();
  // Crude check for public page (anything not a system route)
  // Better: Only show footer on known pages
  const isSystemPage = ['/', '/dashboard', '/create', '/converters'].some(path =>
    location.pathname === path || location.pathname.startsWith(path + '/')
  );

  if (!isSystemPage) return null; // Hide on public pages

  return <Footer />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
