import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { BookOpen, Mic, Captions, Camera, Settings, ChevronRight, Volume2 } from "lucide-react";
import { useAccessibility } from "../contexts/AccessibilityContext";

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { settings, updateSettings } = useAccessibility();

  const modules = [
    {
      id: 'reader',
      icon: BookOpen,
      title: "Read Content",
      description: "Text-to-speech with synchronized highlighting",
      color: "blue",
      bgColor: "bg-blue-100 dark:bg-blue-900",
      iconColor: "text-blue-600 dark:text-blue-300",
    },
    {
      id: 'speech-notes',
      icon: Mic,
      title: "Speech Notes",
      description: "Voice-activated note taking and navigation",
      color: "green",
      bgColor: "bg-green-100 dark:bg-green-900",
      iconColor: "text-green-600 dark:text-green-300",
    },
    {
      id: 'captions',
      icon: Captions,
      title: "Live Captioning",
      description: "Real-time transcription for audio and video",
      color: "purple",
      bgColor: "bg-purple-100 dark:bg-purple-900",
      iconColor: "text-purple-600 dark:text-purple-300",
    },
    {
      id: 'image-recognition',
      icon: Camera,
      title: "Image Description",
      description: "AI-powered visual content analysis",
      color: "orange",
      bgColor: "bg-orange-100 dark:bg-orange-900",
      iconColor: "text-orange-600 dark:text-orange-300",
    },
  ];

  const quickSettings = [
    {
      label: "Font Size",
      value: settings.fontSize,
      min: 12,
      max: 24,
      onChange: (value: number) => updateSettings({ fontSize: value }),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl">Learning Dashboard</h1>
              <p className="text-muted-foreground">Choose a learning tool to get started</p>
            </div>
            <Button
              size="lg"
              variant="outline"
              className="min-h-[48px]"
              onClick={() => onNavigate('settings')}
              aria-label="Open accessibility settings"
            >
              <Settings className="mr-2 h-5 w-5" aria-hidden="true" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Quick Accessibility Panel */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div>
              <h2 className="mb-1">Quick Accessibility</h2>
              <p className="text-muted-foreground">Adjust settings for your current session</p>
            </div>
            
            <div className="flex items-center gap-6 flex-wrap">
              {/* Contrast Mode Toggle */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Theme:</span>
                <div className="flex gap-2">
                  {(['light', 'dark', 'high-contrast'] as const).map((mode) => (
                    <Button
                      key={mode}
                      size="sm"
                      variant={settings.contrastMode === mode ? "default" : "outline"}
                      className="min-w-[80px] min-h-[40px]"
                      onClick={() => updateSettings({ contrastMode: mode })}
                      aria-label={`Switch to ${mode} theme`}
                      aria-pressed={settings.contrastMode === mode}
                    >
                      {mode === 'high-contrast' ? 'High' : mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Input Mode */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Input:</span>
                <div className="flex gap-2">
                  {(['voice', 'text', 'mixed'] as const).map((mode) => (
                    <Button
                      key={mode}
                      size="sm"
                      variant={settings.inputMode === mode ? "default" : "outline"}
                      className="min-w-[70px] min-h-[40px]"
                      onClick={() => updateSettings({ inputMode: mode })}
                      aria-label={`Switch to ${mode} input mode`}
                      aria-pressed={settings.inputMode === mode}
                    >
                      {mode === 'voice' ? <Mic className="h-4 w-4" /> : null}
                      {mode === 'text' ? 'Text' : null}
                      {mode === 'mixed' ? 'Both' : null}
                      {mode === 'voice' && <span className="sr-only">Voice</span>}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Learning Modules */}
        <div>
          <h2 className="mb-6">Learning Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map((module) => (
              <Card
                key={module.id}
                className="p-8 hover:shadow-xl transition-all cursor-pointer group border-2 hover:border-primary"
                onClick={() => onNavigate(module.id)}
                tabIndex={0}
                role="button"
                aria-label={`Open ${module.title}: ${module.description}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onNavigate(module.id);
                  }
                }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 ${module.bgColor} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <module.icon className={`w-8 h-8 ${module.iconColor}`} aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3>{module.title}</h3>
                      <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" aria-hidden="true" />
                    </div>
                    <p className="text-muted-foreground">{module.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <h2 className="mb-6">Recent Activity</h2>
          <div className="space-y-3">
            {[
              { title: "Introduction to Biology", time: "2 hours ago", type: "reader" },
              { title: "Physics Notes - Chapter 5", time: "Yesterday", type: "speech-notes" },
              { title: "History Lecture Captions", time: "2 days ago", type: "captions" },
            ].map((activity, index) => (
              <Card key={index} className="p-4 hover:bg-accent transition-colors cursor-pointer" tabIndex={0}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm mb-1">{activity.title}</h4>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="min-h-[40px]">
                    Continue
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
