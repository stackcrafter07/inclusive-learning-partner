import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Camera, Upload, Volume2, ArrowLeft, Image as ImageIcon, Loader2, Sparkles } from "lucide-react";
import { useAccessibility } from "../contexts/AccessibilityContext";

interface ImageRecognitionProps {
  onNavigate: (page: string) => void;
}

export function ImageRecognition({ onNavigate }: ImageRecognitionProps) {
  const { settings } = useAccessibility();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [description, setDescription] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isUsingCamera, setIsUsingCamera] = useState(false);

  const [useGemini, setUseGemini] = useState(true);

  // Mock image descriptions for demo purposes
  const mockDescriptions = [
    "A detailed diagram showing the water cycle, including evaporation from oceans, condensation forming clouds, precipitation as rain, and water flowing back to the ocean through rivers. The diagram uses blue arrows to show the direction of water movement.",
    "A mathematical graph displaying a parabola opening upward with its vertex at the origin. The x-axis ranges from -5 to 5, and the y-axis from 0 to 25. Grid lines are visible for reference.",
    "A historical photograph in black and white showing a crowd of people gathered in front of a large building with classical architecture. The image appears to be from the mid-20th century based on clothing styles.",
    "A scientific illustration of a plant cell with labeled organelles including the nucleus, cell wall, chloroplasts, mitochondria, and vacuole. The cell is shown in cross-section with different colors indicating different structures.",
    "A portrait photograph showing a person wearing glasses and smiling at the camera. The background is blurred with warm, neutral tones. The lighting is soft and evenly distributed.",
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setSelectedImage(imageUrl);
        analyzeImage();
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setDescription("");

    // Demo Mode Interception
    if (settings.demoMode) {
      setTimeout(() => {
        const randomDesc = mockDescriptions[Math.floor(Math.random() * mockDescriptions.length)];
        setDescription(`[DEMO ANALYSIS]: ${randomDesc} (Perfect confidence score: 99.9%)`);
        setIsAnalyzing(false);
      }, 1500);
      return;
    }

    try {
      // Convert base64/blob URL to Blob/File object
      const response = await fetch(selectedImage);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('image', blob, 'image.jpg');
      formData.append('useGemini', useGemini.toString());

      const apiResponse = await fetch('http://localhost:3000/api/analyze-image', {
        method: 'POST',
        body: formData,
      });

      if (!apiResponse.ok) {
        throw new Error('Analysis failed');
      }

      const data = await apiResponse.json();
      const source = data.source === 'gemini' ? "✨ Analysis by Google Gemini" : "🤖 Analysis by TensorFlow.js (Local)";
      setDescription(`${source}\n\n${data.description}`);

    } catch (error) {
      console.error('Error analyzing image:', error);
      setDescription("Sorry, I couldn't analyze this image. Please try again.");
    } finally {
      if (!settings.demoMode) setIsAnalyzing(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsUsingCamera(true);
      }
    } catch (error) {
      alert("Could not access camera. Please check permissions.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageUrl = canvas.toDataURL('image/jpeg');
        setSelectedImage(imageUrl);

        // Stop camera
        const stream = videoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        setIsUsingCamera(false);

        analyzeImage();
      }
    }
  };

  const speakDescription = () => {
    if (!description || !window.speechSynthesis) {
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(description);
    utterance.rate = settings.speechRate;
    utterance.lang = settings.language;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
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
                <h1 className="text-xl">Image Recognition</h1>
                <p className="text-sm text-muted-foreground">Describe visual content with AI</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Sparkles className={`h-4 w-4 ${useGemini ? 'text-purple-500' : 'text-muted-foreground'}`} />
              <label htmlFor="gemini-toggle" className="text-sm font-medium cursor-pointer">
                Pro Analysis (Gemini)
              </label>
              <input
                id="gemini-toggle"
                type="checkbox"
                className="toggle"
                checked={useGemini}
                onChange={(e) => setUseGemini(e.target.checked)}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Upload Controls */}
        <Card className="p-8 mb-6">
          <h2 className="mb-6">Select an Image</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              size="lg"
              className="min-h-[80px] flex-col gap-2"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload an image from your device"
            >
              <Upload className="h-8 w-8" aria-hidden="true" />
              Upload Image
            </Button>

            {settings.demoMode && (
              <Button
                size="lg"
                className="min-h-[80px] flex-col gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                onClick={() => {
                  setSelectedImage("https://picsum.photos/800/600");
                  // Auto-analyze after a short delay to simulate "Magic"
                  setTimeout(() => analyzeImage(), 500);
                }}
              >
                <Sparkles className="h-8 w-8 animate-pulse" />
                Magic Demo Image
              </Button>
            )}

            <Button
              size="lg"
              variant="outline"
              className="min-h-[80px] flex-col gap-2"
              onClick={startCamera}
              disabled={isUsingCamera}
              aria-label="Take a photo with your camera"
            >
              <Camera className="h-8 w-8" aria-hidden="true" />
              Use Camera
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
            aria-label="File input for image upload"
          />
        </Card>

        {/* Camera View */}
        {isUsingCamera && (
          <Card className="p-6 mb-6">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded-lg mb-4"
              aria-label="Camera preview"
            />
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                onClick={capturePhoto}
                className="min-h-[56px]"
                aria-label="Capture photo"
              >
                <Camera className="mr-2 h-5 w-5" aria-hidden="true" />
                Capture Photo
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  const stream = videoRef.current?.srcObject as MediaStream;
                  stream?.getTracks().forEach(track => track.stop());
                  setIsUsingCamera(false);
                }}
                aria-label="Cancel camera"
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Image Display */}
        {selectedImage && !isUsingCamera && (
          <Card className="p-6 mb-6">
            <h2 className="mb-4">Selected Image</h2>
            <img
              src={selectedImage}
              alt="Selected image for analysis"
              className="w-full rounded-lg border mb-4 max-h-[500px] object-contain"
            />
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                setSelectedImage(null);
                setDescription("");
              }}
              className="min-h-[48px]"
              aria-label="Clear image and start over"
            >
              Clear Image
            </Button>
          </Card>
        )}

        {/* Analysis Result */}
        {isAnalyzing && (
          <Card className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" aria-hidden="true" />
            <h3 className="mb-2">Analyzing Image...</h3>
            <p className="text-muted-foreground">Please wait while we process the visual content</p>
          </Card>
        )}

        {description && !isAnalyzing && (
          <Card className="p-8">
            <div className="flex items-center justify-between mb-4">
              <h2>Image Description</h2>
              <Button
                size="lg"
                variant={isSpeaking ? "default" : "outline"}
                className="min-h-[48px]"
                onClick={speakDescription}
                aria-label={isSpeaking ? "Stop speaking description" : "Listen to description"}
              >
                <Volume2 className={`mr-2 h-5 w-5 ${isSpeaking ? 'animate-pulse' : ''}`} aria-hidden="true" />
                {isSpeaking ? 'Stop' : 'Listen'}
              </Button>
            </div>

            <div
              className="prose prose-lg max-w-none p-6 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800"
              role="region"
              aria-live="polite"
              aria-label="Image description"
            >
              <p className="text-foreground">{description}</p>
            </div>

            <Card className="p-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 mt-6">
              <h4 className="text-sm mb-2">Accessibility Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Detailed textual descriptions of visual content</li>
                <li>Audio playback with adjustable speed</li>
                <li>Screen reader compatible output</li>
                <li>Support for diagrams, charts, photos, and illustrations</li>
              </ul>
            </Card>
          </Card>
        )}

        {/* Instructions */}
        {!selectedImage && !isUsingCamera && (
          <Card className="p-8 text-center bg-muted/50">
            <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" aria-hidden="true" />
            <h3 className="mb-2">No Image Selected</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Upload an image or use your camera to get a detailed description of visual content.
              Perfect for understanding diagrams, charts, photos, and other educational materials.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
