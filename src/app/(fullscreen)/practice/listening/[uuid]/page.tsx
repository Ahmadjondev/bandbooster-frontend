/**
 * IELTS Listening Practice Page
 * Pixel-perfect implementation matching official IELTS test interface
 * Features: Timer, Theme Toggle, Question Highlighting, API Submission, Result Page
 * Keyboard navigation support with Tab/Shift+Tab
 */

'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PlayDialog } from '@/domains/practice/components/exam/PlayDialog';
import { IELTSHeader } from '@/domains/practice/components/exam/IELTSHeader';
import { IELTSBottomNav, type PartInfo } from '@/domains/practice/components/exam/IELTSBottomNav';
import { NavigationControls } from '@/domains/practice/components/exam/NavigationControls';
import { QuestionTypeFactory, type APITestHead } from '@/domains/practice/components/exam/question-types';
import { cn } from '@/lib/utils';

// Types matching API response
interface APIListeningContent {
    id: number;
    section_number: number;
    part_number: number;
    title: string;
    description: string;
    audio_url: string;
    test_heads: APITestHead[];
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

interface SubmitResponse {
    success: boolean;
    attempt_uuid: string;
    is_full_test: boolean;
    band_score: number | null;
    percentage_score: number | null;
    correct_answers: number;
    total_questions: number;
    accuracy: number;
    time_spent_seconds: number;
    section_scores: Record<string, { score: number; total: number; band: number }> | null;
}

// Loading Component
function LoadingScreen() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-gray-800 dark:border-t-gray-300 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-sm">Loading practice...</p>
            </div>
        </div>
    );
}

// Error Component
function ErrorScreen({ error, onRetry }: { error: string; onRetry?: () => void }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Failed to Load</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                    >
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
}

// Submitting overlay
function SubmittingOverlay() {
    return (
        <div className="fixed inset-0 z-100 bg-black/50 flex items-center justify-center">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-xl text-center">
                <div className="w-10 h-10 border-4 border-gray-200 dark:border-gray-700 border-t-primary-500 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-700 dark:text-gray-300 font-medium">Submitting answers...</p>
            </div>
        </div>
    );
}

// Highlight duration in ms
const HIGHLIGHT_DURATION = 1500;

export default function ListeningPracticePage() {
    const params = useParams();
    const router = useRouter();
    const practiceUuid = params.uuid as string;
    const questionsContainerRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    // State
    const [showPlayDialog, setShowPlayDialog] = useState(true);
    const [hasStarted, setHasStarted] = useState(true);
    const [rawData, setRawData] = useState<APIPracticeDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activePart, setActivePart] = useState(1);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<number, string | string[]>>({});
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);

    // Enhanced feature state
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [highlightedQuestionId, setHighlightedQuestionId] = useState<number | null>(null);
    const [startedAt, setStartedAt] = useState<Date | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize dark mode from localStorage or system preference
    useEffect(() => {
        const savedTheme = localStorage.getItem('practice-theme');
        if (savedTheme) {
            setIsDarkMode(savedTheme === 'dark');
        } else {
            setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
    }, []);

    // Apply dark mode class to document
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('practice-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    // Fetch practice detail
    useEffect(() => {
        if (!practiceUuid) return;

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
                setIsLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setIsLoading(false);
            });
    }, [practiceUuid]);

    // Sort contents by part number
    const sortedContents = useMemo(() => {
        if (!rawData?.contents) return [];
        return [...rawData.contents].sort((a, b) => a.part_number - b.part_number);
    }, [rawData]);

    // Get active content
    const activeContent = useMemo(() => {
        return sortedContents.find(c => c.part_number === activePart) || sortedContents[0];
    }, [sortedContents, activePart]);

    // Build parts info for bottom nav
    const partsInfo: PartInfo[] = useMemo(() => {
        return sortedContents.map(content => {
            const questions: { id: number; order: number; isAnswered: boolean }[] = [];
            content.test_heads.forEach(head => {
                head.questions.forEach(q => {
                    const answer = userAnswers[q.id];
                    const isAnswered = answer !== undefined &&
                        (Array.isArray(answer) ? answer.length > 0 : String(answer).trim() !== '');
                    questions.push({ id: q.id, order: q.order, isAnswered });
                });
            });
            return { partNumber: content.part_number, questions };
        });
    }, [sortedContents, userAnswers]);

    // Flatten all questions across all parts for prev/next navigation
    const allQuestions = useMemo(() => {
        const questions: { id: number; order: number; partNumber: number }[] = [];
        sortedContents.forEach(content => {
            content.test_heads.forEach(head => {
                head.questions.forEach(q => {
                    questions.push({ id: q.id, order: q.order, partNumber: content.part_number });
                });
            });
        });
        return questions.sort((a, b) => a.order - b.order);
    }, [sortedContents]);

    // Current question index in allQuestions array
    const currentQuestionIndex = useMemo(() => {
        const activePartQuestions = partsInfo.find(p => p.partNumber === activePart)?.questions || [];
        if (activePartQuestions.length === 0) return 0;
        const currentQuestionId = activePartQuestions[activeQuestionIndex]?.id;
        return allQuestions.findIndex(q => q.id === currentQuestionId);
    }, [partsInfo, activePart, activeQuestionIndex, allQuestions]);

    // Get current active question ID
    const activeQuestionId = useMemo(() => {
        const activePartQuestions = partsInfo.find(p => p.partNumber === activePart)?.questions || [];
        return activePartQuestions[activeQuestionIndex]?.id ?? null;
    }, [partsInfo, activePart, activeQuestionIndex]);

    // Auto-scroll to top when part changes
    useEffect(() => {
        if (questionsContainerRef.current) {
            questionsContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [activePart]);

    // Highlight a question with auto-fade
    const highlightQuestion = useCallback((questionId: number) => {
        setHighlightedQuestionId(questionId);
        setTimeout(() => setHighlightedQuestionId(null), HIGHLIGHT_DURATION);
    }, []);

    // Scroll to question element
    const scrollToQuestion = useCallback((questionId: number) => {
        const element = questionsContainerRef.current?.querySelector(`[data-question-id="${questionId}"]`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, []);

    // Handlers
    const handleStart = useCallback(() => {
        setShowPlayDialog(false);
        setHasStarted(true);
        // Start audio playback after dialog closes
        setTimeout(() => {
            if (audioRef.current) {
                audioRef.current.play().then(() => setIsAudioPlaying(true)).catch(console.error);
            }
        }, 300);
    }, []);

    const handleBack = useCallback(() => {
        router.push('/dashboard/practice/listening');
    }, [router]);

    const handleAnswer = useCallback((questionId: number, answer: string | string[]) => {
        setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
    }, []);

    const handlePartChange = useCallback((partNumber: number) => {
        setActivePart(partNumber);
        setActiveQuestionIndex(0); // Reset to first question of the part
    }, []);

    const handleQuestionClick = useCallback((questionId: number) => {
        // Find the question's index in the current part
        const activePartQuestions = partsInfo.find(p => p.partNumber === activePart)?.questions || [];
        const questionIdx = activePartQuestions.findIndex(q => q.id === questionId);
        if (questionIdx >= 0) {
            setActiveQuestionIndex(questionIdx);
        }
        // Scroll and highlight
        scrollToQuestion(questionId);
        highlightQuestion(questionId);
    }, [partsInfo, activePart, scrollToQuestion, highlightQuestion]);

    const handlePrev = useCallback(() => {
        if (currentQuestionIndex <= 0) return;

        const prevQuestion = allQuestions[currentQuestionIndex - 1];
        if (prevQuestion) {
            // If different part, switch parts and set correct question index
            if (prevQuestion.partNumber !== activePart) {
                setActivePart(prevQuestion.partNumber);
                const prevPartQuestions = partsInfo.find(p => p.partNumber === prevQuestion.partNumber)?.questions || [];
                const questionIdx = prevPartQuestions.findIndex(q => q.id === prevQuestion.id);
                setActiveQuestionIndex(questionIdx >= 0 ? questionIdx : 0);
            } else {
                // Same part, just decrement index
                setActiveQuestionIndex(prev => Math.max(0, prev - 1));
            }
            // Scroll to question and highlight
            setTimeout(() => {
                scrollToQuestion(prevQuestion.id);
                highlightQuestion(prevQuestion.id);
            }, 100);
        }
    }, [currentQuestionIndex, allQuestions, activePart, partsInfo, scrollToQuestion, highlightQuestion]);

    const handleNext = useCallback(() => {
        if (currentQuestionIndex >= allQuestions.length - 1) return;

        const nextQuestion = allQuestions[currentQuestionIndex + 1];
        if (nextQuestion) {
            // If different part, switch parts and set correct question index
            if (nextQuestion.partNumber !== activePart) {
                setActivePart(nextQuestion.partNumber);
                const nextPartQuestions = partsInfo.find(p => p.partNumber === nextQuestion.partNumber)?.questions || [];
                const questionIdx = nextPartQuestions.findIndex(q => q.id === nextQuestion.id);
                setActiveQuestionIndex(questionIdx >= 0 ? questionIdx : 0);
            } else {
                // Same part, just increment index
                setActiveQuestionIndex(prev => prev + 1);
            }
            // Scroll to question and highlight
            setTimeout(() => {
                scrollToQuestion(nextQuestion.id);
                highlightQuestion(nextQuestion.id);
            }, 100);
        }
    }, [currentQuestionIndex, allQuestions, activePart, partsInfo, scrollToQuestion, highlightQuestion]);

    // Keyboard navigation handler
    useEffect(() => {
        if (!hasStarted || showPlayDialog) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Only handle Tab navigation when not in an input/textarea
            const activeElement = document.activeElement;
            const isInputFocused = activeElement?.tagName === 'INPUT' ||
                activeElement?.tagName === 'TEXTAREA' ||
                activeElement?.getAttribute('contenteditable') === 'true';

            if (e.key === 'Tab' && !isInputFocused) {
                e.preventDefault();
                if (e.shiftKey) {
                    handlePrev();
                } else {
                    handleNext();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [hasStarted, showPlayDialog, handlePrev, handleNext]);

    // Submit answers to API
    const submitAnswers = useCallback(async () => {
        if (isSubmitting || !rawData) return;

        setIsSubmitting(true);

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001';
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        // Format answers: convert question ID numbers to strings
        const formattedAnswers: Record<string, string> = {};
        Object.entries(userAnswers).forEach(([questionId, answer]) => {
            if (Array.isArray(answer)) {
                formattedAnswers[questionId] = answer.join(',');
            } else {
                formattedAnswers[questionId] = String(answer);
            }
        });

        // Calculate time spent
        const now = new Date();
        const timeSpent = startedAt
            ? Math.floor((now.getTime() - startedAt.getTime()) / 1000)
            : 0;

        const requestBody = {
            answers: formattedAnswers,
            started_at: (startedAt || now).toISOString(),
            time_spent_seconds: timeSpent,
        };

        try {
            const response = await fetch(`${API_BASE_URL}/practice/${practiceUuid}/submit/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Failed to submit answers');
            }

            const result: SubmitResponse = await response.json();

            // Navigate to results page
            router.push(`/practice/${result.attempt_uuid}/results`);
        } catch (err) {
            console.error('Submit error:', err);
            setError(err instanceof Error ? err.message : 'Failed to submit answers');
            setIsSubmitting(false);
        }
    }, [isSubmitting, rawData, userAnswers, startedAt, practiceUuid, router]);

    const handleSubmit = useCallback(() => {
        submitAnswers();
    }, [submitAnswers]);

    // Timer callbacks
    const handleTimeUp = useCallback(() => {
        // Auto-submit when timer reaches zero
        submitAnswers();
    }, [submitAnswers]);

    const handleTimerStart = useCallback((startTime: Date) => {
        setStartedAt(startTime);
    }, []);

    const handleThemeToggle = useCallback((isDark: boolean) => {
        setIsDarkMode(isDark);
    }, []);

    const handleAudioEnded = useCallback(() => {
        setIsAudioPlaying(false);
        // Auto-advance to next part
        const nextPart = sortedContents.find(c => c.part_number === activePart + 1);
        if (nextPart) {
            setTimeout(() => {
                setActivePart(nextPart.part_number);
                // Play next part's audio
                setTimeout(() => {
                    if (audioRef.current) {
                        audioRef.current.play().then(() => setIsAudioPlaying(true)).catch(console.error);
                    }
                }, 500);
            }, 1000);
        }
    }, [activePart, sortedContents]);

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

    return (
        <div className={cn('min-h-screen bg-white dark:bg-slate-900 flex flex-col', isDarkMode ? 'dark' : '')}>
            {/* Submitting Overlay */}
            {isSubmitting && <SubmittingOverlay />}

            {/* Question highlight animation styles */}
            <style jsx global>{`
                @keyframes questionHighlight {
                    0% {
                        background-color: rgba(59, 130, 246, 0.2);
                        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
                    }
                    100% {
                        background-color: transparent;
                        box-shadow: none;
                    }
                }
                .question-highlight {
                    animation: questionHighlight ${HIGHLIGHT_DURATION}ms ease-out;
                    border-radius: 8px;
                }
            `}</style>

            {/* Play Dialog Overlay */}
            <PlayDialog isOpen={showPlayDialog} onStart={handleStart} />

            {/* Main Content (visible after starting) */}
            {hasStarted && (
                <>
                    {/* Header - Fixed at top with timer, theme toggle, and submit button */}
                    <IELTSHeader
                        onBack={handleBack}
                        timerMinutes={rawData.duration || 40}
                        onTimeUp={handleTimeUp}
                        onTimerStart={handleTimerStart}
                        isDarkMode={isDarkMode}
                        onThemeToggle={handleThemeToggle}
                        showTimer={true}
                        showThemeToggle={true}
                        onSubmit={handleSubmit}
                        showSubmit={true}
                    />

                    {/* Hidden Audio Element */}
                    <audio
                        ref={audioRef}
                        src={activeContent?.audio_url}
                        onEnded={handleAudioEnded}
                        preload="auto"
                    />

                    {/* Main scrollable content area - accounts for fixed header (h-14 = 56px), nav controls (h-12 = 48px), and bottom nav (h-14 = 56px) */}
                    <div className="pt-14 pb-26 flex-1 overflow-y-auto" ref={questionsContainerRef}>
                        {/* Part Title Bar */}
                        <div className="bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 px-6 py-3 m-4 rounded">
                            <h2 className="text-base font-bold text-gray-900 dark:text-white">Part {activeContent.part_number}</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{activeContent.description || `Listen and answer questions.`}</p>
                        </div>

                        {/* Questions Content - increased spacing between question groups */}
                        <div className="max-w-full mx-auto px-6 py-6 space-y-12">
                            {activeContent.test_heads.map((group) => (
                                <div
                                    key={group.id}
                                    className="question-group-wrapper"
                                >
                                    <QuestionTypeFactory
                                        group={group}
                                        userAnswers={userAnswers}
                                        onAnswer={handleAnswer}
                                        mode="listening"
                                        highlightedQuestionId={highlightedQuestionId}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Controls - positioned above bottom nav, right-aligned */}
                    <NavigationControls
                        onPrev={handlePrev}
                        onNext={handleNext}
                        canGoPrev={currentQuestionIndex > 0}
                        canGoNext={currentQuestionIndex < allQuestions.length - 1}
                    />

                    {/* Bottom Navigation */}
                    <IELTSBottomNav
                        parts={partsInfo}
                        activePart={activePart}
                        activeQuestionId={activeQuestionId}
                        onPartChange={handlePartChange}
                        onQuestionClick={handleQuestionClick}
                    />
                </>
            )}
        </div>
    );
}
