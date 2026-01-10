import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Mic, MicOff, ArrowLeft, Download, Trash2, Volume2 } from "lucide-react";
import { useAccessibility } from "../contexts/AccessibilityContext";

interface LiveCaptioningProps {
  onNavigate: (page: string) => void;
}

export function LiveCaptioning({ onNavigate }: LiveCaptioningProps) {
  const { settings } = useAccessibility();
  const [isListening, setIsListening] = useState(false);
  const [captions, setCaptions] = useState<Array<{ text: string; timestamp: string }>>([]);
  const [currentCaption, setCurrentCaption] = useState("");
  const recognitionRef = useRef<any>(null);
  const captionsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    captionsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [captions, currentCaption]);

  useEffect(() => {
    fetch('http://localhost:3000/api/captions')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCaptions(data);
      })
      .catch(err => console.error("Failed to load captions", err));
  }, []);

  const saveCaption = async (text: string) => {
    try {
      const timestamp = new Date().toLocaleTimeString();
      await fetch('http://localhost:3000/api/captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, timestamp })
      });
    } catch (e) {
      console.error("Failed to save caption", e);
    }
  };

  const startCaptioning = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in your browser");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = settings.language;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        const timestamp = new Date().toLocaleTimeString();
        setCaptions(prev => [...prev, { text: finalTranscript, timestamp }]);
        saveCaption(finalTranscript); // Save to backend
        setCurrentCaption('');
      } else {
        setCurrentCaption(interimTranscript);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        // Auto-restart if still meant to be listening
        recognition.start();
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopCaptioning = () => {
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const exportCaptions = () => {
    const text = captions.map(c => `[${c.timestamp}] ${c.text}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `captions-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 max-w-5xl">
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
              <h1 className="text-xl">Live Captioning</h1>
              <p className="text-sm text-muted-foreground">Real-time speech transcription</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Controls */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-3">
              {!isListening ? (
                <Button
                  size="lg"
                  className="min-h-[56px]"
                  onClick={startCaptioning}
                  aria-label="Start live captioning"
                >
                  <Mic className="mr-2 h-5 w-5" aria-hidden="true" />
                  Start Captioning
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="destructive"
                  className="min-h-[56px] animate-pulse"
                  onClick={stopCaptioning}
                  aria-label="Stop live captioning"
                >
                  <MicOff className="mr-2 h-5 w-5" aria-hidden="true" />
                  Stop Captioning
                </Button>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                variant="outline"
                onClick={exportCaptions}
                disabled={captions.length === 0}
                className="min-h-[56px]"
                aria-label="Export captions as text file"
              >
                <Download className="mr-2 h-5 w-5" aria-hidden="true" />
                Export
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  setCaptions([]);
                  setCurrentCaption('');
                }}
                disabled={captions.length === 0}
                className="min-h-[56px]"
                aria-label="Clear all captions"
              >
                <Trash2 className="mr-2 h-5 w-5" aria-hidden="true" />
                Clear
              </Button>
            </div>
          </div>

          {isListening && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></div>
                <p className="text-sm font-medium">Live captioning active - Audio is being transcribed in real-time</p>
              </div>
            </div>
          )}
        </Card>

        {/* Current Caption (Large Display) */}
        {(isListening || currentCaption) && (
          <Card className="p-8 mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <div className="flex items-center gap-3 mb-4">
              <Volume2 className="h-6 w-6 text-primary" aria-hidden="true" />
              <h2>Current Caption</h2>
            </div>
            <div
              className="text-3xl leading-relaxed min-h-[100px] flex items-center"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {currentCaption || <span className="text-muted-foreground italic">Listening for speech...</span>}
            </div>
          </Card>
        )}

        {/* Caption History */}
        <Card className="p-6">
          <h2 className="mb-4">Caption History</h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {captions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No captions yet. Start captioning to see transcribed text here.</p>
              </div>
            ) : (
              <>
                {captions.map((caption, index) => (
                  <div
                    key={index}
                    className="p-4 bg-muted/50 rounded-lg"
                    role="listitem"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xs text-muted-foreground font-mono min-w-[80px]">
                        {caption.timestamp}
                      </span>
                      <p className="text-lg leading-relaxed flex-1">{caption.text}</p>
                    </div>
                  </div>
                ))}
                <div ref={captionsEndRef} />
              </>
            )}
          </div>
        </Card>

        {/* Instructions */}
        <Card className="p-6 mt-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <h3 className="mb-3">How to Use Live Captioning</h3>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
            <li>Click "Start Captioning" to begin real-time speech-to-text transcription</li>
            <li>The current caption appears in large text for easy reading</li>
            <li>All captions are saved in the history below with timestamps</li>
            <li>Perfect for lectures, videos, meetings, or any audio content</li>
            <li>Export your captions to save them for later review</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
