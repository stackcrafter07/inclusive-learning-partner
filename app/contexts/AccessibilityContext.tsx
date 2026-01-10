import React, { createContext, useContext, useState, useEffect } from 'react';

export type ContrastMode = 'light' | 'dark' | 'high-contrast';
export type InputMode = 'voice' | 'text' | 'mixed';

interface AccessibilitySettings {
  fontSize: number;
  contrastMode: ContrastMode;
  dyslexiaFont: boolean;
  inputMode: InputMode;
  speechRate: number;
  captionsEnabled: boolean;
  language: string;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (updates: Partial<AccessibilitySettings>) => void;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 16,
  contrastMode: 'light',
  dyslexiaFont: false,
  inputMode: 'mixed',
  speechRate: 1,
  captionsEnabled: true,
  language: 'en-US',
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('accessibility-settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  // Fetch settings from backend on mount
  useEffect(() => {
    fetch('http://localhost:3000/api/settings')
      .then(res => res.json())
      .then(data => {
        if (Object.keys(data).length > 0) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      })
      .catch(err => console.log('Using local settings only'));
  }, []);

  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));

    // Sync to backend (debounced or save on change)
    // We'll just simple fire and forget here for simplicity
    fetch('http://localhost:3000/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    }).catch(() => { });

    // Apply settings to document
    document.documentElement.style.setProperty('--font-size', `${settings.fontSize}px`);

    // Apply contrast mode
    document.documentElement.classList.remove('light', 'dark', 'high-contrast');
    document.documentElement.classList.add(settings.contrastMode);

    // Apply dyslexia font
    if (settings.dyslexiaFont) {
      document.body.classList.add('dyslexia-font');
    } else {
      document.body.classList.remove('dyslexia-font');
    }
  }, [settings]);

  const updateSettings = (updates: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}
