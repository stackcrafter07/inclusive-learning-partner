import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Slider } from "./ui/slider";
import { Play, Pause, SkipBack, SkipForward, Mic, Volume2, ArrowLeft, Settings } from "lucide-react";
import { useAccessibility } from "../contexts/AccessibilityContext";

interface ReaderInterfaceProps {
  onNavigate: (page: string) => void;
}

const sampleText = `Welcome to the Inclusive Learning Companion. This is a demonstration of our text-to-speech reader with synchronized highlighting. 

Accessibility is not just about compliance; it's about creating an inclusive environment where everyone can learn effectively. When we design with accessibility in mind, we make education better for everyone.

Research shows that multimodal learning approaches benefit all students, not just those with disabilities. Text-to-speech technology helps with comprehension, pronunciation, and retention. Visual highlighting helps maintain focus and track reading progress.

You can adjust the reading speed, choose different voices, and customize the appearance to match your preferences. Try the controls below to experience how flexible accessible learning can be.`;

export function ReaderInterface({ onNavigate }: ReaderInterfaceProps) {
  const { settings } = useAccessibility();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [speechRate, setSpeechRate] = useState(1);
  const [isListening, setIsListening] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const words = sampleText.split(/(\s+)/);

  useEffect(() => {
    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const startSpeech = () => {
    if (!window.speechSynthesis) {
      alert("Text-to-speech is not supported in your browser");
      return;
    }

    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(sampleText);
    utterance.rate = speechRate;
    utterance.lang = settings.language;
    
    let wordCount = 0;
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        wordCount++;
        // Approximate word index (not perfect but works for demo)
        setCurrentWordIndex(wordCount * 2);
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentWordIndex(-1);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const pauseSpeech = () => {
    window.speechSynthesis.pause();
    setIsPlaying(false);
  };

  const resumeSpeech = () => {
    window.speechSynthesis.resume();
    setIsPlaying(true);
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentWordIndex(-1);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseSpeech();
    } else if (window.speechSynthesis.paused) {
      resumeSpeech();
    } else {
      startSpeech();
    }
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in your browser");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = settings.language;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      
      // Voice commands
      if (transcript.includes('play') || transcript.includes('start')) {
        startSpeech();
      } else if (transcript.includes('pause') || transcript.includes('stop')) {
        pauseSpeech();
      } else if (transcript.includes('faster')) {
        setSpeechRate(prev => Math.min(prev + 0.25, 2));
      } else if (transcript.includes('slower')) {
        setSpeechRate(prev => Math.max(prev - 0.25, 0.5));
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 max-w-5xl">
          <div className="flex items-center justify-between">
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
                <h1 className="text-xl">Reader Interface</h1>
                <p className="text-sm text-muted-foreground">Text-to-speech with highlighting</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="lg"
              className="min-h-[48px]"
              onClick={() => onNavigate('settings')}
              aria-label="Open settings"
            >
              <Settings className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Reader Card */}
        <Card className="p-8 mb-6">
          <div 
            className="prose prose-lg max-w-none leading-relaxed"
            role="article"
            aria-label="Reading content"
          >
            {words.map((word, index) => {
              const isCurrentWord = index === currentWordIndex;
              const isWhitespace = word.trim() === '';
              
              return (
                <span
                  key={index}
                  className={`transition-all duration-200 ${
                    isCurrentWord && !isWhitespace
                      ? 'bg-yellow-300 dark:bg-yellow-600 font-semibold px-1 rounded'
                      : ''
                  }`}
                >
                  {word}
                </span>
              );
            })}
          </div>
        </Card>

        {/* Controls */}
        <Card className="p-6">
          <div className="space-y-6">
            {/* Playback Controls */}
            <div>
              <h3 className="mb-4">Playback Controls</h3>
              <div className="flex items-center justify-center gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  className="min-h-[56px] min-w-[56px]"
                  onClick={stopSpeech}
                  disabled={!isPlaying && currentWordIndex === -1}
                  aria-label="Skip to beginning"
                >
                  <SkipBack className="h-6 w-6" aria-hidden="true" />
                </Button>
                
                <Button
                  size="lg"
                  className="min-h-[64px] min-w-[64px]"
                  onClick={handlePlayPause}
                  aria-label={isPlaying ? "Pause reading" : "Play reading"}
                >
                  {isPlaying ? (
                    <Pause className="h-7 w-7" aria-hidden="true" />
                  ) : (
                    <Play className="h-7 w-7 ml-1" aria-hidden="true" />
                  )}
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  className="min-h-[56px] min-w-[56px]"
                  disabled
                  aria-label="Skip forward (not available)"
                >
                  <SkipForward className="h-6 w-6" aria-hidden="true" />
                </Button>

                {(settings.inputMode === 'voice' || settings.inputMode === 'mixed') && (
                  <Button
                    size="lg"
                    variant={isListening ? "default" : "outline"}
                    className="min-h-[56px] ml-4"
                    onClick={startVoiceInput}
                    aria-label="Voice control - say play, pause, faster, or slower"
                  >
                    <Mic className={`h-5 w-5 mr-2 ${isListening ? 'animate-pulse' : ''}`} aria-hidden="true" />
                    {isListening ? 'Listening...' : 'Voice Control'}
                  </Button>
                )}
              </div>
            </div>

            {/* Speed Control */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label htmlFor="speed-slider" className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" aria-hidden="true" />
                  Reading Speed
                </label>
                <span className="text-sm font-medium" aria-live="polite">
                  {speechRate.toFixed(2)}x
                </span>
              </div>
              <Slider
                id="speed-slider"
                min={0.5}
                max={2}
                step={0.25}
                value={[speechRate]}
                onValueChange={(value) => setSpeechRate(value[0])}
                className="cursor-pointer"
                aria-label="Adjust reading speed"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Slower</span>
                <span>Normal</span>
                <span>Faster</span>
              </div>
            </div>

            {/* Instructions */}
            <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <h4 className="text-sm mb-2">How to Use</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Click Play to start reading aloud with word highlighting</li>
                <li>Adjust the speed slider to your preferred reading pace</li>
                <li>Use Voice Control to navigate hands-free (say "play", "pause", "faster", "slower")</li>
                <li>Highlighted words show your current reading position</li>
              </ul>
            </Card>
          </div>
        </Card>
      </div>
    </div>
  );
}
