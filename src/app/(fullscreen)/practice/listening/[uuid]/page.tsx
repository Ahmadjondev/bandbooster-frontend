/**
 * Listening Practice Page (Redesigned)
 * Modern, clean listening practice with audio player and questions
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayDialog } from '@/domains/practice/components/exam/PlayDialog';
import { QuestionRenderer, TestHead } from '@/domains/practice/components/exam/QuestionRenderer';
import { cn } from '@/lib/utils';

// Types matching API response
interface APIListeningContent {
    id: number;
    section_number: number;
    part_number: number;
    title: string;
    description: string;
    audio_url: string;
    test_heads: Array<{
        id: number;
        title: string;
        description: string;
        question_type: string;
        question_range: string;
        instruction: string;
        matching_options: Array<{ value: string; label: string }>;
        allow_duplicates: boolean;
        select_count: number | null;
        picture: string | null;
        picture_url: string | null;
        view_type: string;
        answer_format: string | null;
        question_data: Record<string, unknown>;
        example: string | null;
        questions: Array<{
            id: number;
            question_text: string;
            order: number;
            question_type: string;
            options: Array<{
                id: number;
                choice_text: string;
                key: string;
            }>;
            user_answer: string;
            max_selections: number | string | null;
        }>;
    }>;
    total_questions: number;
}

interface APIPracticeDetail {
    uuid: string;
    title: string;
    description: string;
    section_type: string;
    section_type_display: string;
    test_type: string;
    difficulty: string;
    difficulty_display: string;
    duration: number;
    total_questions: number;
    is_premium: boolean;
    is_multi_content: boolean;
    content_count: number;
    contents: APIListeningContent[];
    user_attempts: unknown[];
    created_at: string;
}

// Icons
const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
);

const PauseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="4" width="4" height="16" />
        <rect x="14" y="4" width="4" height="16" />
    </svg>
);

const VolumeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
);

const VolumeMuteIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
);

const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18M6 6l12 12" />
    </svg>
);

const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m15 18-6-6 6-6" />
    </svg>
);

const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 18 6-6-6-6" />
    </svg>
);

// Confirmation Dialog
function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
    variant = 'default',
}: {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'default' | 'danger';
}) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700"
                >
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">{message}</p>
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onCancel}
                            className="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                            {cancelLabel || 'Cancel'}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={cn(
                                'px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors',
                                variant === 'danger'
                                    ? 'bg-red-500 hover:bg-red-600'
                                    : 'bg-primary-600 hover:bg-primary-700'
                            )}
                        >
                            {confirmLabel || 'Confirm'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// Loading Screen
function LoadingScreen() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full bg-primary-500/20 animate-ping" />
                    <div className="relative w-20 h-20 rounded-full bg-linear-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                        <div className="w-10 h-10 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 font-medium">Loading practice...</p>
            </motion.div>
        </div>
    );
}

// Error Screen
function ErrorScreen({ error, onRetry }: { error: string; onRetry?: () => void }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-md mx-auto"
            >
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <CloseIcon className="w-10 h-10 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Failed to Load</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="px-6 py-3 text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors font-semibold"
                    >
                        Try Again
                    </button>
                )}
            </motion.div>
        </div>
    );
}

// Modern Audio Player Component
function ModernAudioPlayer({
    src,
    partNumber,
    onEnded,
    autoPlay = false,
}: {
    src: string;
    partNumber: number;
    onEnded?: () => void;
    autoPlay?: boolean;
}) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(80);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const formatTime = (seconds: number): string => {
        if (isNaN(seconds) || seconds === 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${String(secs).padStart(2, '0')}`;
    };

    const togglePlay = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
            setIsPlaying(false);
        } else {
            audio.play().then(() => setIsPlaying(true)).catch(console.error);
        }
    }, [isPlaying]);

    const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const audio = audioRef.current;
        if (!audio || duration === 0) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const percentage = (e.clientX - rect.left) / rect.width;
        audio.currentTime = percentage * duration;
    }, [duration]);

    const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseInt(e.target.value);
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
        if (audioRef.current) {
            audioRef.current.volume = newVolume / 100;
        }
    }, []);

    const toggleMute = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isMuted) {
            audio.volume = volume / 100;
            setIsMuted(false);
        } else {
            audio.volume = 0;
            setIsMuted(true);
        }
    }, [isMuted, volume]);

    useEffect(() => {
        if (autoPlay && !isLoading && audioRef.current) {
            setTimeout(() => {
                audioRef.current?.play().then(() => setIsPlaying(true)).catch(console.error);
            }, 500);
        }
    }, [autoPlay, isLoading]);

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50">
            <audio
                ref={audioRef}
                src={src}
                onLoadedMetadata={(e) => {
                    setDuration(e.currentTarget.duration);
                    setIsLoading(false);
                }}
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onEnded={() => {
                    setIsPlaying(false);
                    onEnded?.();
                }}
                onCanPlay={() => setIsLoading(false)}
                preload="auto"
            />

            <div className="flex items-center gap-4">
                {/* Play Button */}
                <button
                    onClick={togglePlay}
                    disabled={isLoading}
                    className={cn(
                        'shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all',
                        isLoading
                            ? 'bg-slate-200 dark:bg-slate-700 cursor-not-allowed'
                            : 'bg-linear-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg shadow-primary-500/25'
                    )}
                >
                    {isLoading ? (
                        <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                    ) : isPlaying ? (
                        <PauseIcon className="w-6 h-6" />
                    ) : (
                        <PlayIcon className="w-6 h-6 ml-0.5" />
                    )}
                </button>

                {/* Progress Section */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded-lg">
                            Part {partNumber}
                        </span>
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div
                        onClick={handleSeek}
                        className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full cursor-pointer group overflow-hidden"
                    >
                        <motion.div
                            className="absolute inset-y-0 left-0 bg-linear-to-r from-primary-500 to-primary-400 rounded-full"
                            style={{ width: `${progress}%` }}
                            layout
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary-500 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ left: `calc(${progress}% - 8px)` }}
                        />
                    </div>
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleMute}
                        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        {isMuted || volume === 0 ? (
                            <VolumeMuteIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                        ) : (
                            <VolumeIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                        )}
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-primary-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md"
                    />
                </div>
            </div>
        </div>
    );
}

export default function ListeningPracticePage() {
    const params = useParams();
    const router = useRouter();
    const practiceUuid = params.uuid as string;

    // State
    const [showPlayDialog, setShowPlayDialog] = useState(true);
    const [hasStarted, setHasStarted] = useState(false);
    const [userAnswers, setUserAnswers] = useState<Record<number, string | string[]>>({});
    const [timeRemaining, setTimeRemaining] = useState(30 * 60);
    const [showExitDialog, setShowExitDialog] = useState(false);
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);
    const [activePart, setActivePart] = useState(1);
    const [rawData, setRawData] = useState<APIPracticeDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const questionsContainerRef = useRef<HTMLDivElement>(null);

    // Fetch practice detail
    useEffect(() => {
        if (practiceUuid) {
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001';
            const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

            fetch(`${API_BASE_URL}/practice/${practiceUuid}/`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            })
                .then(res => {
                    if (!res.ok) throw new Error('Failed to load practice');
                    return res.json();
                })
                .then(data => {
                    setRawData(data);
                    if (data.duration) {
                        setTimeRemaining(data.duration * 60);
                    }
                    setIsLoading(false);
                })
                .catch(err => {
                    setError(err.message);
                    setIsLoading(false);
                });
        }
    }, [practiceUuid]);

    // Timer countdown (only when started)
    useEffect(() => {
        if (!hasStarted) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 0) {
                    clearInterval(timer);
                    handleTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [hasStarted]);

    // Auto-scroll to top when part changes
    useEffect(() => {
        if (questionsContainerRef.current) {
            questionsContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [activePart]);

    // Handlers
    const handleAnswer = useCallback((questionId: number, answer: string | string[]) => {
        setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
    }, []);

    const handleStart = useCallback(() => {
        setShowPlayDialog(false);
        setHasStarted(true);
    }, []);

    const handleBack = useCallback(() => {
        router.push('/dashboard/practice/listening');
    }, [router]);

    const handleExit = useCallback(() => {
        setShowExitDialog(true);
    }, []);

    const confirmExit = useCallback(() => {
        router.push('/dashboard/practice/listening');
    }, [router]);

    const handleFinish = useCallback(() => {
        setShowSubmitDialog(true);
    }, []);

    const confirmSubmit = useCallback(async () => {
        console.log('Submitting answers:', userAnswers);
        router.push('/dashboard/practice/listening');
    }, [userAnswers, router]);

    const handleTimeUp = useCallback(() => {
        confirmSubmit();
    }, [confirmSubmit]);

    const handleAudioEnded = useCallback((partNumber: number) => {
        if (rawData) {
            const nextPart = rawData.contents.find(c => c.part_number === partNumber + 1);
            if (nextPart) {
                setTimeout(() => setActivePart(nextPart.part_number), 1000);
            }
        }
    }, [rawData]);

    // Format time
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${String(secs).padStart(2, '0')}`;
    };

    // Loading state
    if (isLoading) {
        return <LoadingScreen />;
    }

    // Error state
    if (error || !rawData?.contents?.length) {
        return (
            <ErrorScreen
                error={error || 'No listening content available'}
                onRetry={() => window.location.reload()}
            />
        );
    }

    // Sort contents by part number
    const sortedContents = [...rawData.contents].sort((a, b) => a.part_number - b.part_number);
    const activeContent = sortedContents.find(c => c.part_number === activePart) || sortedContents[0];

    // Calculate answered questions per part
    const getPartStats = (content: APIListeningContent) => {
        let answered = 0;
        let total = 0;
        content.test_heads.forEach(head => {
            head.questions.forEach(q => {
                total++;
                const answer = userAnswers[q.id];
                if (answer && (Array.isArray(answer) ? answer.length > 0 : String(answer).trim() !== '')) {
                    answered++;
                }
            });
        });
        return { answered, total };
    };

    const totalAnswered = Object.keys(userAnswers).filter(k => {
        const ans = userAnswers[parseInt(k)];
        return ans && (Array.isArray(ans) ? ans.length > 0 : String(ans).trim() !== '');
    }).length;

    const showWarning = timeRemaining < 300;

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-slate-50 to-primary-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
            {/* Play Dialog */}
            <PlayDialog
                isOpen={showPlayDialog}
                title={rawData.title}
                partsCount={sortedContents.length}
                totalQuestions={rawData.total_questions}
                duration={rawData.duration}
                onStart={handleStart}
                onBack={handleBack}
            />

            {/* Main Content (only visible after starting) */}
            {hasStarted && (
                <>
                    {/* Fixed Header */}
                    <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
                        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                            {/* Left - Exit */}
                            <button
                                onClick={handleExit}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                            >
                                <CloseIcon className="w-4 h-4" />
                                <span className="hidden sm:inline">Exit</span>
                            </button>

                            {/* Center - Title & Timer */}
                            <div className="flex items-center gap-4">
                                <h1 className="text-lg font-bold text-slate-900 dark:text-white hidden md:block">
                                    {rawData.title}
                                </h1>
                                <div
                                    className={cn(
                                        'flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-bold transition-colors',
                                        showWarning
                                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                                    )}
                                >
                                    <ClockIcon className="w-4 h-4" />
                                    {formatTime(timeRemaining)}
                                </div>
                            </div>

                            {/* Right - Submit */}
                            <button
                                onClick={handleFinish}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-linear-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-xl transition-all shadow-lg shadow-primary-500/25"
                            >
                                <CheckIcon className="w-4 h-4" />
                                <span className="hidden sm:inline">Submit</span>
                            </button>
                        </div>
                    </header>

                    {/* Main Layout */}
                    <main className="pt-20 pb-28">
                        <div className="max-w-7xl mx-auto px-4">
                            {/* Audio Player */}
                            <div className="sticky top-20 z-30 py-4 bg-linear-to-b from-slate-50 via-slate-50 to-transparent dark:from-slate-900 dark:via-slate-900">
                                <ModernAudioPlayer
                                    src={activeContent.audio_url}
                                    partNumber={activeContent.part_number}
                                    onEnded={() => handleAudioEnded(activeContent.part_number)}
                                    autoPlay={activeContent.part_number === sortedContents[0]?.part_number}
                                />
                            </div>

                            {/* Part Title */}
                            <motion.div
                                key={activePart}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6"
                            >
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    Part {activeContent.part_number}
                                    <span className="text-slate-400 dark:text-slate-500 font-normal"> — </span>
                                    {activeContent.title}
                                </h2>
                                {activeContent.description && (
                                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                                        {activeContent.description}
                                    </p>
                                )}
                            </motion.div>

                            {/* Questions */}
                            <div ref={questionsContainerRef} className="space-y-6">
                                {activeContent.test_heads.map((group) => (
                                    <motion.div
                                        key={group.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6 sm:p-8"
                                    >
                                        <QuestionRenderer
                                            group={group as TestHead}
                                            userAnswers={userAnswers}
                                            onAnswer={handleAnswer}
                                            fontSize="text-base"
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </main>

                    {/* Fixed Bottom Navigation */}
                    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50">
                        <div className="max-w-7xl mx-auto px-4 py-3">
                            <div className="flex items-center justify-between gap-4">
                                {/* Part Tabs */}
                                <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-1">
                                    {sortedContents.map((content) => {
                                        const stats = getPartStats(content);
                                        const isActive = activePart === content.part_number;

                                        return (
                                            <button
                                                key={content.part_number}
                                                onClick={() => setActivePart(content.part_number)}
                                                className={cn(
                                                    'shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                                                    isActive
                                                        ? 'bg-linear-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                )}
                                            >
                                                Part {content.part_number}
                                                {!isActive && (
                                                    <span className="ml-2 text-xs opacity-70">
                                                        {stats.answered}/{stats.total}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Navigation Arrows */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setActivePart(Math.max(1, activePart - 1))}
                                        disabled={activePart <= 1}
                                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeftIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setActivePart(Math.min(sortedContents.length, activePart + 1))}
                                        disabled={activePart >= sortedContents.length}
                                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRightIcon className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Progress */}
                                <div className="hidden sm:flex items-center gap-3 text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Progress:</span>
                                    <span className="font-bold text-primary-600 dark:text-primary-400">
                                        {totalAnswered}/{rawData.total_questions}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </nav>

                    {/* Exit Confirmation Dialog */}
                    <ConfirmDialog
                        isOpen={showExitDialog}
                        title="Exit Practice?"
                        message="Your progress will be lost. Are you sure you want to exit?"
                        confirmLabel="Exit"
                        cancelLabel="Continue"
                        onConfirm={confirmExit}
                        onCancel={() => setShowExitDialog(false)}
                        variant="danger"
                    />

                    {/* Submit Confirmation Dialog */}
                    <ConfirmDialog
                        isOpen={showSubmitDialog}
                        title="Submit Answers?"
                        message={`You have answered ${totalAnswered} of ${rawData.total_questions} questions. Are you ready to submit?`}
                        confirmLabel="Submit"
                        cancelLabel="Review"
                        onConfirm={confirmSubmit}
                        onCancel={() => setShowSubmitDialog(false)}
                    />
                </>
            )}
        </div>
    );
}
