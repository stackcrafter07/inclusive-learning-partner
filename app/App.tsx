import { useState } from 'react';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { ReaderInterface } from './components/ReaderInterface';
import { SpeechNotes } from './components/SpeechNotes';
import { LiveCaptioning } from './components/LiveCaptioning';
import { ImageRecognition } from './components/ImageRecognition';
import { SettingsPanel } from './components/SettingsPanel';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('landing');

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentPage} />;
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'reader':
        return <ReaderInterface onNavigate={setCurrentPage} />;
      case 'speech-notes':
        return <SpeechNotes onNavigate={setCurrentPage} />;
      case 'captions':
        return <LiveCaptioning onNavigate={setCurrentPage} />;
      case 'image-recognition':
        return <ImageRecognition onNavigate={setCurrentPage} />;
      case 'settings':
        return <SettingsPanel onNavigate={setCurrentPage} />;
      default:
        return <LandingPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <AccessibilityProvider>
      {/* Skip to main content link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
      >
        Skip to main content
      </a>
      
      <div id="main-content" className="min-h-screen" tabIndex={-1}>
        {renderPage()}
      </div>
    </AccessibilityProvider>
  );
}