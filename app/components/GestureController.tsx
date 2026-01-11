import { useEffect, useRef, useState } from "react";
import { GestureRecognizer, FilesetResolver } from "@mediapipe/tasks-vision";
import { Button } from "./ui/button";
import { Camera, Loader2, Video, X } from "lucide-react";
import { Card } from "./ui/card";

interface GestureControllerProps {
    onGesture: (gesture: string) => void;
    onClose: () => void;
}

export function GestureController({ onGesture, onClose }: GestureControllerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [gestureRecognizer, setGestureRecognizer] = useState<GestureRecognizer | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [detectedGesture, setDetectedGesture] = useState<string>("");
    const requestRef = useRef<number>(0);

    // Load MediaPipe Gesture Recognizer
    useEffect(() => {
        const loadGestureRecognizer = async () => {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
            );
            const recognizer = await GestureRecognizer.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numHands: 1
            });
            setGestureRecognizer(recognizer);
            setIsLoaded(true);
        };

        loadGestureRecognizer();

        return () => {
            if (gestureRecognizer) {
                // MediaPipe cleanup if necessary
            }
        }
    }, []);

    // Start Video and Prediction Loop
    useEffect(() => {
        if (!isLoaded || !videoRef.current) return;

        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadeddata = predictWebcam;
                }
            } catch (err) {
                console.error("Error accessing webcam:", err);
                alert("Could not access webcam for gestures.");
            }
        };

        startCamera();

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [isLoaded, gestureRecognizer]);

    const predictWebcam = () => {
        if (videoRef.current && gestureRecognizer) {
            let startTimeMs = performance.now();

            // Only predict if video is playing
            if (videoRef.current.currentTime > 0 && !videoRef.current.paused && !videoRef.current.ended) {
                const results = gestureRecognizer.recognizeForVideo(videoRef.current, startTimeMs);

                if (results.gestures.length > 0) {
                    const gesture = results.gestures[0][0]; // Top gesture
                    if (gesture && gesture.score > 0.5) {
                        const name = gesture.categoryName;
                        setDetectedGesture(name);

                        // Debounce or map gestures
                        if (name === "Thumb_Up") {
                            onGesture("play");
                        } else if (name === "Open_Palm") {
                            onGesture("pause");
                        }
                    }
                } else {
                    setDetectedGesture("");
                }
            }

            requestRef.current = requestAnimationFrame(predictWebcam);
        }
    };

    return (
        <Card className="fixed bottom-4 right-4 p-4 z-50 w-64 shadow-2xl border-primary/20 bg-background/95 backdrop-blur">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Camera className="h-4 w-4" /> Gesture Control
                </h3>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="relative rounded-lg overflow-hidden bg-black aspect-video mb-3">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
                {!isLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                )}
                {detectedGesture && (
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        {detectedGesture}
                    </div>
                )}
            </div>

            <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">👍 Thumb Up</span> to Play
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">✋ Open Palm</span> to Pause
                </div>
            </div>
        </Card>
    );
}
