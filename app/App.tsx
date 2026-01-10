import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { Onboarding } from './components/Onboarding';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { ReaderInterface } from './components/ReaderInterface';
import { SpeechNotes } from './components/SpeechNotes';
import { LiveCaptioning } from './components/LiveCaptioning';
import { ImageRecognition } from './components/ImageRecognition';
import { SettingsPanel } from './components/SettingsPanel';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasOnboarded = localStorage.getItem('has-onboarded');
    if (!hasOnboarded) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem('has-onboarded', 'true');
    setCurrentPage('dashboard');
  };

  const renderPage = () => {
    let Component;
    switch (currentPage) {
      case 'landing':
        Component = <LandingPage onNavigate={setCurrentPage} />;
        break;
      case 'dashboard':
        Component = <Dashboard onNavigate={setCurrentPage} />;
        break;
      case 'reader':
        Component = <ReaderInterface onNavigate={setCurrentPage} />;
        break;
      case 'speech-notes':
        Component = <SpeechNotes onNavigate={setCurrentPage} />;
        break;
      case 'captions':
        Component = <LiveCaptioning onNavigate={setCurrentPage} />;
        break;
      case 'image-recognition':
        Component = <ImageRecognition onNavigate={setCurrentPage} />;
        break;
      case 'settings':
        Component = <SettingsPanel onNavigate={setCurrentPage} />;
        break;
      default:
        Component = <LandingPage onNavigate={setCurrentPage} />;
    }

    return (
      <motion.div
        key={currentPage}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        {Component}
      </motion.div>
    );
  };

  return (
    <AccessibilityProvider>
      {/* Skip to main content link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg transition-all"
      >
        Skip to main content
      </a>

      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}

      <div id="main-content" className="min-h-screen" tabIndex={-1}>
        <AnimatePresence mode="wait">
          {renderPage()}
        </AnimatePresence>
      </div>
    </AccessibilityProvider>
  );
}