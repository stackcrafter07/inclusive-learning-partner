import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Mic, MicOff, Save, Trash2, ArrowLeft, Download } from "lucide-react";
import { useAccessibility } from "../contexts/AccessibilityContext";

interface SpeechNotesProps {
  onNavigate: (page: string) => void;
}

export function SpeechNotes({ onNavigate }: SpeechNotesProps) {
  const { settings } = useAccessibility();
  const [notes, setNotes] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
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
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setNotes(prev => prev + finalTranscript);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const saveNotes = () => {
    const blob = new Blob([notes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-${new Date().toISOString().split('T')[0]}.txt`;
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
              <h1 className="text-xl">Speech Notes</h1>
              <p className="text-sm text-muted-foreground">Voice-to-text note taking</p>
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
                  onClick={startListening}
                  aria-label="Start voice recording"
                >
                  <Mic className="mr-2 h-5 w-5" aria-hidden="true" />
                  Start Recording
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="destructive"
                  className="min-h-[56px] animate-pulse"
                  onClick={stopListening}
                  aria-label="Stop voice recording"
                >
                  <MicOff className="mr-2 h-5 w-5" aria-hidden="true" />
                  Stop Recording
                </Button>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                variant="outline"
                onClick={saveNotes}
                disabled={!notes}
                className="min-h-[56px]"
                aria-label="Download notes as text file"
              >
                <Download className="mr-2 h-5 w-5" aria-hidden="true" />
                Download
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setNotes("")}
                disabled={!notes}
                className="min-h-[56px]"
                aria-label="Clear all notes"
              >
                <Trash2 className="mr-2 h-5 w-5" aria-hidden="true" />
                Clear
              </Button>
            </div>
          </div>

          {isListening && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" aria-hidden="true"></div>
                <p className="text-sm font-medium">Recording in progress... Speak clearly into your microphone</p>
              </div>
            </div>
          )}
        </Card>

        {/* Notes Area */}
        <Card className="p-6">
          <h2 className="mb-4">Your Notes</h2>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Your speech will be transcribed here... You can also type directly."
            className="min-h-[400px] text-lg leading-relaxed"
            aria-label="Notes text area"
          />


          <div className="mt-4 text-sm text-muted-foreground">
            Character count: {notes.length}
          </div>
        </Card>

        {/* Saved Notes Actions */}
        <Card className="p-6 mt-6">
          <h2 className="mb-4">Actions</h2>
          <div className="flex gap-4">
            <Button onClick={async () => {
              if (!notes) return;
              try {
                await fetch('http://localhost:3000/api/notes', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ text: notes })
                });
                alert('Note saved to backend!');
              } catch (e) {
                console.error(e);
                alert('Failed to save');
              }
            }}>
              <Save className="mr-2 h-4 w-4" /> Save to Cloud
            </Button>

            <Button variant="outline" onClick={async () => {
              try {
                const res = await fetch('http://localhost:3000/api/notes');
                const savedNotes = await res.json();
                if (savedNotes.length > 0) {
                  const lastNote = savedNotes[savedNotes.length - 1];
                  setNotes(prev => prev + (prev ? '\n\n' : '') + `[Loaded ${new Date(lastNote.date).toLocaleDateString()}]: ${lastNote.text}`);
                } else {
                  alert('No saved notes found.');
                }
              } catch (e) {
                alert('Failed to load notes');
              }
            }}>
              Load Recent Note
            </Button>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="p-6 mt-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <h3 className="mb-3">How to Use Speech Notes</h3>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
            <li>Click "Start Recording" to begin voice transcription</li>
            <li>Speak clearly and naturally - the system will transcribe in real-time</li>
            <li>Click "Stop Recording" when finished, or click again to resume</li>
            <li>You can edit the transcribed text manually in the text area</li>
            <li>Download your notes as a text file for future reference</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
