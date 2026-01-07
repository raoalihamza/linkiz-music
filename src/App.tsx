import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { PageEditor } from './components/PageEditor';
import { PublicPage } from './components/PublicPage';
import { DownloadModal } from './components/DownloadModal';
import { SubscriptionManager } from './components/SubscriptionManager';
import { Converter } from './components/Converter';

type View = 'home' | 'dashboard' | 'editor' | 'public-page' | 'converter';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<View>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [selectedDownload, setSelectedDownload] = useState<{ linkId: string; fileName: string } | null>(null);
  const [pageSlug, setPageSlug] = useState<string>('');
  const [editingPageId, setEditingPageId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const path = window.location.pathname;

    if (path === '/') {
      setCurrentView('home');
    } else if (path === '/dashboard') {
      setCurrentView('dashboard');
    } else if (path === '/converter') {
      setCurrentView('converter');
    } else if (path === '/create' || path === '/edit') {
      setCurrentView('editor');
    } else if (path.startsWith('/')) {
      const slug = path.substring(1);
      if (slug) {
        setPageSlug(slug);
        setCurrentView('public-page');
      }
    }
  }, []);

  useEffect(() => {
    if (!loading && !user && (currentView === 'dashboard' || currentView === 'editor')) {
      setCurrentView('home');
      setAuthModalOpen(true);
    }
  }, [user, loading, currentView]);

  const handleNavigation = (view: View, slug?: string) => {
    setCurrentView(view);
    if (slug) setPageSlug(slug);

    if (view === 'home') {
      window.history.pushState({}, '', '/');
    } else if (view === 'dashboard') {
      window.history.pushState({}, '', '/dashboard');
    } else if (view === 'converter') {
      window.history.pushState({}, '', '/converter');
    } else if (view === 'editor') {
      window.history.pushState({}, '', '/create');
    } else if (view === 'public-page' && slug) {
      window.history.pushState({}, '', `/${slug}`);
    }
  };

  const handleDownload = (linkId: string, fileName: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setSelectedDownload({ linkId, fileName });
    setDownloadModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {currentView !== 'public-page' && (
        <Header
          onAuthClick={() => setAuthModalOpen(true)}
          onNavigate={handleNavigation}
          currentView={currentView}
        />
      )}

      <main className="flex-1">
        {currentView === 'home' && (
          <LandingPage onGetStarted={() => setAuthModalOpen(true)} />
        )}

        {currentView === 'converter' && (
          <Converter />
        )}

        {currentView === 'dashboard' && user && (
          <Dashboard
            onCreatePage={() => {
              setEditingPageId(undefined);
              handleNavigation('editor');
            }}
            onUpgrade={() => setSubscriptionModalOpen(true)}
          />
        )}

        {currentView === 'editor' && user && (
          <PageEditor
            pageId={editingPageId}
            onSave={() => handleNavigation('dashboard')}
            onCancel={() => handleNavigation('dashboard')}
          />
        )}

        {currentView === 'public-page' && (
          <PublicPage
            slug={pageSlug}
            onDownload={handleDownload}
            onAuthRequired={() => setAuthModalOpen(true)}
          />
        )}
      </main>

      {currentView !== 'public-page' && <Footer />}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <SubscriptionManager
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
      />

      {selectedDownload && (
        <DownloadModal
          isOpen={downloadModalOpen}
          onClose={() => {
            setDownloadModalOpen(false);
            setSelectedDownload(null);
          }}
          linkId={selectedDownload.linkId}
          fileName={selectedDownload.fileName}
          onUpgrade={() => {
            setDownloadModalOpen(false);
            setSubscriptionModalOpen(true);
          }}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
