import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { 
  ArrowLeft, 
  Type, 
  Palette, 
  Mic, 
  Volume2, 
  Languages, 
  Captions,
  Eye,
  Keyboard,
  Check
} from "lucide-react";
import { useAccessibility } from "../contexts/AccessibilityContext";

interface SettingsPanelProps {
  onNavigate: (page: string) => void;
}

export function SettingsPanel({ onNavigate }: SettingsPanelProps) {
  const { settings, updateSettings } = useAccessibility();

  const languages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Spanish' },
    { code: 'fr-FR', name: 'French' },
    { code: 'de-DE', name: 'German' },
    { code: 'it-IT', name: 'Italian' },
    { code: 'pt-BR', name: 'Portuguese' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="lg"
              className="min-h-[48px]"
              onClick={() => onNavigate('dashboard')}
              aria-label="Go back to dashboard"
            >
              <ArrowLeft className="mr-2 h-5 w-5" aria-hidden="true" />
              Back
            </Button>
            <div>
              <h1 className="text-xl">Accessibility Settings</h1>
              <p className="text-sm text-muted-foreground">Customize your learning experience</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          
          {/* Visual Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Eye className="h-5 w-5 text-blue-600 dark:text-blue-300" aria-hidden="true" />
              </div>
              <div>
                <h2>Visual Settings</h2>
                <p className="text-sm text-muted-foreground">Adjust display and readability</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Font Size */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label htmlFor="font-size-slider" className="flex items-center gap-2">
                    <Type className="h-4 w-4" aria-hidden="true" />
                    Font Size
                  </Label>
                  <span className="text-sm font-medium" aria-live="polite">{settings.fontSize}px</span>
                </div>
                <Slider
                  id="font-size-slider"
                  min={12}
                  max={28}
                  step={2}
                  value={[settings.fontSize]}
                  onValueChange={(value) => updateSettings({ fontSize: value[0] })}
                  className="cursor-pointer"
                  aria-label="Adjust base font size"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Small (12px)</span>
                  <span>Medium (16px)</span>
                  <span>Large (28px)</span>
                </div>
              </div>

              {/* Contrast Mode */}
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <Palette className="h-4 w-4" aria-hidden="true" />
                  Contrast Mode
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { mode: 'light' as const, label: 'Light', description: 'Standard light theme' },
                    { mode: 'dark' as const, label: 'Dark', description: 'Dark theme for low light' },
                    { mode: 'high-contrast' as const, label: 'High Contrast', description: 'Maximum readability' },
                  ].map(({ mode, label, description }) => (
                    <button
                      key={mode}
                      onClick={() => updateSettings({ contrastMode: mode })}
                      className={`p-4 rounded-lg border-2 text-left transition-all min-h-[100px] ${
                        settings.contrastMode === mode
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                      aria-label={`Select ${label} contrast mode`}
                      aria-pressed={settings.contrastMode === mode}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{label}</span>
                        {settings.contrastMode === mode && (
                          <Check className="h-5 w-5 text-primary" aria-hidden="true" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dyslexia Font */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <Label htmlFor="dyslexia-font" className="cursor-pointer">
                    Dyslexia-Friendly Font
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Use OpenDyslexic font for improved readability
                  </p>
                </div>
                <Switch
                  id="dyslexia-font"
                  checked={settings.dyslexiaFont}
                  onCheckedChange={(checked) => updateSettings({ dyslexiaFont: checked })}
                  aria-label="Toggle dyslexia-friendly font"
                />
              </div>
            </div>
          </Card>

          {/* Input Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Keyboard className="h-5 w-5 text-green-600 dark:text-green-300" aria-hidden="true" />
              </div>
              <div>
                <h2>Input Settings</h2>
                <p className="text-sm text-muted-foreground">Choose how you interact with content</p>
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-2 mb-3">
                <Mic className="h-4 w-4" aria-hidden="true" />
                Input Mode
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { mode: 'voice' as const, label: 'Voice Only', icon: Mic, description: 'Navigate with speech commands' },
                  { mode: 'text' as const, label: 'Text Only', icon: Keyboard, description: 'Keyboard and mouse input' },
                  { mode: 'mixed' as const, label: 'Mixed', icon: Volume2, description: 'Both voice and text input' },
                ].map(({ mode, label, icon: Icon, description }) => (
                  <button
                    key={mode}
                    onClick={() => updateSettings({ inputMode: mode })}
                    className={`p-4 rounded-lg border-2 text-left transition-all min-h-[120px] ${
                      settings.inputMode === mode
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                    aria-label={`Select ${label} input mode`}
                    aria-pressed={settings.inputMode === mode}
                  >
                    <Icon className="h-6 w-6 mb-3 text-primary" aria-hidden="true" />
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{label}</span>
                      {settings.inputMode === mode && (
                        <Check className="h-5 w-5 text-primary" aria-hidden="true" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Audio Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Volume2 className="h-5 w-5 text-purple-600 dark:text-purple-300" aria-hidden="true" />
              </div>
              <div>
                <h2>Audio Settings</h2>
                <p className="text-sm text-muted-foreground">Configure speech and audio features</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Speech Rate */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label htmlFor="speech-rate-slider" className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" aria-hidden="true" />
                    Speech Rate
                  </Label>
                  <span className="text-sm font-medium" aria-live="polite">{settings.speechRate.toFixed(2)}x</span>
                </div>
                <Slider
                  id="speech-rate-slider"
                  min={0.5}
                  max={2}
                  step={0.25}
                  value={[settings.speechRate]}
                  onValueChange={(value) => updateSettings({ speechRate: value[0] })}
                  className="cursor-pointer"
                  aria-label="Adjust speech playback rate"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Slower (0.5x)</span>
                  <span>Normal (1x)</span>
                  <span>Faster (2x)</span>
                </div>
              </div>

              {/* Captions */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex-1">
                  <Label htmlFor="captions-toggle" className="cursor-pointer flex items-center gap-2">
                    <Captions className="h-4 w-4" aria-hidden="true" />
                    Live Captions
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Show real-time captions for audio content
                  </p>
                </div>
                <Switch
                  id="captions-toggle"
                  checked={settings.captionsEnabled}
                  onCheckedChange={(checked) => updateSettings({ captionsEnabled: checked })}
                  aria-label="Toggle live captions"
                />
              </div>
            </div>
          </Card>

          {/* Language Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <Languages className="h-5 w-5 text-orange-600 dark:text-orange-300" aria-hidden="true" />
              </div>
              <div>
                <h2>Language Settings</h2>
                <p className="text-sm text-muted-foreground">Select your preferred language</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {languages.map(({ code, name }) => (
                <button
                  key={code}
                  onClick={() => updateSettings({ language: code })}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    settings.language === code
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  aria-label={`Select ${name} language`}
                  aria-pressed={settings.language === code}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{name}</span>
                    {settings.language === code && (
                      <Check className="h-5 w-5 text-primary" aria-hidden="true" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Info Card */}
          <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <h3 className="mb-3">Accessibility Information</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                • All settings are automatically saved and will persist across sessions
              </p>
              <p>
                • Keyboard navigation: Use Tab to navigate, Enter/Space to select
              </p>
              <p>
                • Screen reader support: All controls include proper ARIA labels
              </p>
              <p>
                • Voice commands are available when Voice or Mixed input mode is enabled
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
