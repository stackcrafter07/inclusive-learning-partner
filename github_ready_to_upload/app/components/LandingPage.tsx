import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Eye, Ear, Hand, Brain, Volume2, Mic, Captions, ScanEye } from "lucide-react";

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const features = [
    {
      icon: Volume2,
      title: "Text-to-Speech",
      description: "Listen to content with synchronized word highlighting and adjustable speed",
    },
    {
      icon: Mic,
      title: "Speech-to-Text",
      description: "Navigate and take notes using your voice with real-time transcription",
    },
    {
      icon: Captions,
      title: "Live Captioning",
      description: "Real-time captions for audio and video content in multiple languages",
    },
    {
      icon: ScanEye,
      title: "Image Description",
      description: "AI-powered descriptions of visual content for better understanding",
    },
  ];

  const benefits = [
    {
      icon: Eye,
      title: "Visual Support",
      description: "High contrast modes, customizable fonts, and text-to-speech for visually impaired learners",
    },
    {
      icon: Ear,
      title: "Auditory Assistance",
      description: "Live captions, transcriptions, and visual feedback for audio content",
    },
    {
      icon: Hand,
      title: "Motor Accessibility",
      description: "Voice navigation, large touch targets, and keyboard-only operation",
    },
    {
      icon: Brain,
      title: "Cognitive Support",
      description: "Dyslexia-friendly fonts, simplified layouts, and multimodal learning options",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Accessibility Notice */}
      <div className="bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 text-center text-sm" role="banner">
        <p>
          Press <kbd className="px-2 py-1 bg-white/20 rounded">Tab</kbd> to navigate • 
          Press <kbd className="px-2 py-1 bg-white/20 rounded mx-1">Enter</kbd> to select • 
          All features support keyboard and voice navigation
        </p>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl mb-6">
            Inclusive Learning Companion
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Making education accessible for everyone through AI-powered tools and adaptive design. 
            Learn at your own pace with support for visual, auditory, motor, and cognitive needs.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg" 
              className="min-h-[56px] min-w-[200px] text-lg"
              onClick={() => onNavigate('dashboard')}
              aria-label="Start learning - Go to dashboard"
            >
              Start Learning
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="min-h-[56px] min-w-[200px] text-lg"
              onClick={() => onNavigate('settings')}
              aria-label="Customize accessibility settings"
            >
              Customize Accessibility
            </Button>
          </div>
        </div>

        {/* Main Features */}
        <div className="mb-16">
          <h2 className="text-center mb-8">
            Multimodal Learning Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onNavigate('dashboard')}
                tabIndex={0}
                role="button"
                aria-label={`${feature.title}: ${feature.description}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onNavigate('dashboard');
                  }
                }}
              >
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="w-8 h-8 text-blue-600 dark:text-blue-300" aria-hidden="true" />
                </div>
                <h3 className="mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h2 className="text-center mb-8">
            Supporting All Learning Needs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-6 h-6 text-green-600 dark:text-green-300" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-blue-600 dark:bg-blue-700 text-white rounded-2xl p-12">
          <h2 className="text-white mb-4">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg">
            Experience inclusive education designed with accessibility at its core. 
            Customize your learning environment to match your unique needs.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="min-h-[56px] min-w-[200px] text-lg"
            onClick={() => onNavigate('dashboard')}
            aria-label="Get started with Inclusive Learning Companion"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}