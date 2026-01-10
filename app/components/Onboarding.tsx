import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccessibility, ContrastMode } from '../contexts/AccessibilityContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Check, User, Eye, Ear, Brain, ArrowRight } from 'lucide-react';

interface Persona {
    id: string;
    title: string;
    icon: React.ElementType;
    description: string;
    settings: {
        contrastMode: ContrastMode;
        dyslexiaFont: boolean;
        speechRate: number;
        captionsEnabled: boolean;
        inputMode: 'voice' | 'text' | 'mixed';
        fontSize: number;
        demoMode: boolean;
    };
}

const personas: Persona[] = [
    {
        id: 'general',
        title: 'General Learner',
        icon: User,
        description: 'Standard interface with balanced accessibility features.',
        settings: {
            contrastMode: 'light',
            dyslexiaFont: false,
            speechRate: 1,
            captionsEnabled: true,
            inputMode: 'mixed',
            fontSize: 16,
            demoMode: false,
        },
    },
    {
        id: 'visual',
        title: 'Visual Focus',
        icon: Eye,
        description: 'High contrast, larger text, and simplified layouts.',
        settings: {
            contrastMode: 'high-contrast',
            dyslexiaFont: false,
            speechRate: 1,
            captionsEnabled: true,
            inputMode: 'mixed',
            fontSize: 20,
            demoMode: false,
        },
    },
    {
        id: 'auditory',
        title: 'Auditory Learner',
        icon: Ear,
        description: 'Optimized for screen readers and voice navigation.',
        settings: {
            contrastMode: 'dark',
            dyslexiaFont: false,
            speechRate: 0.8,
            captionsEnabled: true,
            inputMode: 'voice',
            fontSize: 18,
            demoMode: false,
        },
    },
    {
        id: 'dyslexia',
        title: 'Dyslexia Support',
        icon: Brain,
        description: 'Specialized fonts and spacing to improve readability.',
        settings: {
            contrastMode: 'light',
            dyslexiaFont: true,
            speechRate: 1,
            captionsEnabled: true,
            inputMode: 'mixed',
            fontSize: 18,
            demoMode: false,
        },
    },
    {
        id: 'motor',
        title: 'Motor Accessibility',
        icon: User, // Or a better icon if available, e.g., Hand
        description: 'Larger click targets and optimized for keyboard navigation.',
        settings: {
            contrastMode: 'light',
            dyslexiaFont: false,
            speechRate: 1,
            captionsEnabled: true,
            inputMode: 'mixed',
            fontSize: 18,
            demoMode: false
        }
    }
];

export function Onboarding({ onComplete }: { onComplete: () => void }) {
    const { updateSettings } = useAccessibility();
    const [step, setStep] = useState<'welcome' | 'persona' | 'demo'>('welcome');
    const [selectedPersona, setSelectedPersona] = useState<string | null>(null);

    const handlePersonaSelect = (persona: Persona) => {
        setSelectedPersona(persona.id);
        updateSettings({ ...persona.settings, activePersona: persona.id });
    };

    const handleDemoModeToggle = (enableDemo: boolean) => {
        updateSettings({ demoMode: enableDemo });
        onComplete();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
            >
                <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl border-2">
                    {step === 'welcome' && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center space-y-8"
                        >
                            <div className="space-y-4">
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                                    Welcome to Inclusive Learning
                                </h1>
                                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                                    A personalized learning companion that adapts to your unique needs using multimodal AI interaction.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
                                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900">
                                    <Eye className="w-8 h-8 mb-3 text-blue-600" />
                                    <h3 className="font-semibold mb-2">Visual & Text</h3>
                                    <p className="text-sm text-muted-foreground">Smart object recognition and flexible reading modes.</p>
                                </div>
                                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900">
                                    <Ear className="w-8 h-8 mb-3 text-purple-600" />
                                    <h3 className="font-semibold mb-2">Speech & Audio</h3>
                                    <p className="text-sm text-muted-foreground">Advanced text-to-speech and voice controls.</p>
                                </div>
                                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900">
                                    <Brain className="w-8 h-8 mb-3 text-green-600" />
                                    <h3 className="font-semibold mb-2">Cognitive Support</h3>
                                    <p className="text-sm text-muted-foreground">Dyslexia fonts and simplified summaries.</p>
                                </div>
                            </div>

                            <Button size="lg" className="w-full md:w-auto text-lg px-8 py-6" onClick={() => setStep('persona')}>
                                Get Started <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </motion.div>
                    )}

                    {step === 'persona' && (
                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="space-y-8"
                        >
                            <div className="text-center">
                                <h2 className="text-3xl font-bold mb-4">Choose Your Experience</h2>
                                <p className="text-muted-foreground">
                                    Select a profile to automatically configure the best accessibility settings for you.
                                    You can change this later.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {personas.map((persona) => (
                                    <button
                                        key={persona.id}
                                        onClick={() => handlePersonaSelect(persona)}
                                        className={`p-6 rounded-xl border-2 text-left transition-all hover:scale-[1.02] ${selectedPersona === persona.id
                                                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                                : 'border-border hover:border-primary/50'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className={`p-2 rounded-lg ${selectedPersona === persona.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                                    <persona.icon className="w-6 h-6" />
                                                </div>
                                                <h3 className="font-bold text-lg">{persona.title}</h3>
                                            </div>
                                            {selectedPersona === persona.id && (
                                                <Check className="w-6 h-6 text-primary" />
                                            )}
                                        </div>
                                        <p className="text-muted-foreground">{persona.description}</p>
                                        {persona.id === 'dyslexia' && (
                                            <p className="mt-2 text-sm font-medium text-primary font-dyslexic">
                                                Sample text in Dyslexic font.
                                            </p>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-between items-center pt-4">
                                <Button variant="ghost" onClick={() => setStep('welcome')}>
                                    Back
                                </Button>
                                <Button
                                    size="lg"
                                    disabled={!selectedPersona}
                                    onClick={() => setStep('demo')}
                                    className="px-8"
                                >
                                    Continue
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 'demo' && (
                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="space-y-8 text-center max-w-2xl mx-auto"
                        >
                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold">Hackathon Demo Mode</h2>
                                <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                                    <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">For Judges & Presenters</h3>
                                    <p className="text-yellow-700 dark:text-yellow-300">
                                        Would you like to enable <strong>Demo Mode</strong>?
                                        This uses pre-loaded mock data and bypasses backend servers to ensure a
                                        perfect, crash-free presentation even without internet.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                <Button size="lg" className="w-full text-lg py-6" onClick={() => handleDemoModeToggle(true)}>
                                    🚀 Enable Demo Mode
                                    <span className="block text-xs font-normal ml-2 opacity-80">(Stable, Fast, Mock Data)</span>
                                </Button>
                                <Button variant="outline" size="lg" className="w-full" onClick={() => handleDemoModeToggle(false)}>
                                    Connect to Real Backend
                                    <span className="block text-xs font-normal ml-2 opacity-80">(Requires running local server)</span>
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </Card>
            </motion.div>
        </AnimatePresence>
    );
}
