/**
 * IELTS Listening Practice Page
 * Pixel-perfect implementation matching official IELTS test interface
 * Features: Timer, Theme Toggle, Question Highlighting, Text Highlighting, API Submission, Result Page
 * Keyboard navigation support with Tab/Shift+Tab
 */

'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PlayDialog } from '@/domains/practice/components/exam/PlayDialog';
import { IELTSHeader } from '@/domains/practice/components/exam/IELTSHeader';
import { AudioPlayer, type AudioPlayerHandle } from '@/domains/practice/components/exam/AudioPlayer';
import { BottomNav, type SectionInfo as PartInfo, type QuestionInfo } from '@/domains/practice/components/exam/BottomNav';
import { NavigationControls } from '@/domains/practice/components/exam/NavigationControls';
import { QuestionTypeFactory, type APITestHead } from '@/domains/practice/components/exam/question-types';
import { HighlightProvider, HighlightToolbar, HighlightableQuestions, useHighlightContext } from '@/domains/practice/components/exam/highlight';
import { cn, scrollToQuestionInContainer } from '@/lib/utils';

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
    const audioPlayerRef = useRef<AudioPlayerHandle>(null);

    // State
    const [showPlayDialog, setShowPlayDialog] = useState(true);
    const [hasStarted, setHasStarted] = useState(false);
    const [rawData, setRawData] = useState<APIPracticeDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activePart, setActivePart] = useState(1);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<number, string | string[]>>({});
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [shouldAutoPlay, setShouldAutoPlay] = useState(false);

    // Enhanced feature state
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [highlightedQuestionId, setHighlightedQuestionId] = useState<number | null>(null);
    const [startedAt, setStartedAt] = useState<Date | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize dark mode from localStorage or system preference
    // Use same key as main ThemeProvider for consistency
    useEffect(() => {
        const savedTheme = localStorage.getItem('bandbooster-theme');
        if (savedTheme === 'dark' || savedTheme === 'light') {
            setIsDarkMode(savedTheme === 'dark');
        } else {
            // For 'system' or no value, check system preference
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
        // Sync with main theme provider key
        localStorage.setItem('bandbooster-theme', isDarkMode ? 'dark' : 'light');
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

    // Check if user has any answers (for submit validation)
    const hasAnswers = useMemo(() => {
        return Object.values(userAnswers).some(answer => {
            if (Array.isArray(answer)) {
                return answer.length > 0 && answer.some(a => a && String(a).trim() !== '');
            }
            return answer !== undefined && answer !== null && String(answer).trim() !== '';
        });
    }, [userAnswers]);

    // Build parts info for bottom nav
    const partsInfo: PartInfo[] = useMemo(() => {
        return sortedContents.map(content => {
            const questions: QuestionInfo[] = [];
            content.test_heads.forEach(head => {
                const isMCMA = head.question_type === 'MCMA';
                head.questions.forEach(q => {
                    const answer = userAnswers[q.id];

                    if (isMCMA) {
                        // For MCMA, expand single question into multiple based on maxSelections
                        // Priority: q.max_selections > correct_answer length > head.select_count > 1
                        let maxSelections = 1;
                        if (q.max_selections) {
                            maxSelections = typeof q.max_selections === 'string'
                                ? parseInt(q.max_selections) || 1
                                : q.max_selections;
                        } else if (q.correct_answer && typeof q.correct_answer === 'string') {
                            const letters = q.correct_answer.match(/[A-Z]/g);
                            maxSelections = letters ? letters.length : 1;
                        } else if (head.select_count) {
                            maxSelections = head.select_count;
                        }

                        // Create entries for each question number (order, order+1, etc.)
                        const selectedAnswers = Array.isArray(answer) ? answer : [];
                        for (let i = 0; i < maxSelections; i++) {
                            const isAnswered = selectedAnswers.length > i &&
                                selectedAnswers[i] !== undefined &&
                                String(selectedAnswers[i]).trim() !== '';
                            questions.push({
                                id: q.id,
                                order: q.order + i,
                                isAnswered
                            });
                        }
                    } else {
                        // Regular question - single entry
                        const isAnswered = answer !== undefined &&
                            (Array.isArray(answer) ? answer.length > 0 : String(answer).trim() !== '');
                        questions.push({ id: q.id, order: q.order, isAnswered });
                    }
                });
            });
            return { sectionNumber: content.part_number, questions };
        });
    }, [sortedContents, userAnswers]);

    // Flatten all questions across all parts for prev/next navigation
    const allQuestions = useMemo(() => {
        const questions: { id: number; order: number; partNumber: number }[] = [];
        sortedContents.forEach(content => {
            content.test_heads.forEach(head => {
                const isMCMA = head.question_type === 'MCMA';
                head.questions.forEach(q => {
                    if (isMCMA) {
                        // For MCMA, expand based on maxSelections
                        let maxSelections = 1;
                        if (q.max_selections) {
                            maxSelections = typeof q.max_selections === 'string'
                                ? parseInt(q.max_selections) || 1
                                : q.max_selections;
                        } else if (q.correct_answer && typeof q.correct_answer === 'string') {
                            const letters = q.correct_answer.match(/[A-Z]/g);
                            maxSelections = letters ? letters.length : 1;
                        } else if (head.select_count) {
                            maxSelections = head.select_count;
                        }

                        for (let i = 0; i < maxSelections; i++) {
                            questions.push({ id: q.id, order: q.order + i, partNumber: content.part_number });
                        }
                    } else {
                        questions.push({ id: q.id, order: q.order, partNumber: content.part_number });
                    }
                });
            });
        });
        return questions.sort((a, b) => a.order - b.order);
    }, [sortedContents]);

    // Current question index in allQuestions array
    const currentQuestionIndex = useMemo(() => {
        const activePartQuestions = partsInfo.find(p => p.sectionNumber === activePart)?.questions || [];
        if (activePartQuestions.length === 0) return 0;
        const currentQuestionId = activePartQuestions[activeQuestionIndex]?.id;
        return allQuestions.findIndex(q => q.id === currentQuestionId);
    }, [partsInfo, activePart, activeQuestionIndex, allQuestions]);

    // Get current active question ID
    const activeQuestionId = useMemo(() => {
        const activePartQuestions = partsInfo.find(p => p.sectionNumber === activePart)?.questions || [];
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

    // Scroll to question element within the questions container
    const scrollToQuestion = useCallback((questionId: number) => {
        scrollToQuestionInContainer(questionsContainerRef, questionId, {
            behavior: 'smooth',
            block: 'center',
        });
    }, []);

    // Handlers
    const handleStart = useCallback(() => {
        setShowPlayDialog(false);
        setHasStarted(true);
        // Set flag for auto-play - AudioPlayer will handle it via autoPlay prop
        setShouldAutoPlay(true);
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
        const activePartQuestions = partsInfo.find(p => p.sectionNumber === activePart)?.questions || [];
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
                const prevPartQuestions = partsInfo.find(p => p.sectionNumber === prevQuestion.partNumber)?.questions || [];
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
                const nextPartQuestions = partsInfo.find(p => p.sectionNumber === nextQuestion.partNumber)?.questions || [];
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

        // Validate at least one answer exists
        const hasAnswers = Object.values(userAnswers).some(answer => {
            if (Array.isArray(answer)) {
                return answer.length > 0 && answer.some(a => a && String(a).trim() !== '');
            }
            return answer !== undefined && answer !== null && String(answer).trim() !== '';
        });

        if (!hasAnswers) {
            setError('Please answer at least one question before submitting.');
            return;
        }

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
        // Auto-advance to next part for multi-part/full-test listening
        const nextPart = sortedContents.find(c => c.part_number === activePart + 1);
        if (nextPart) {
            // Switch to next part after a short delay
            setTimeout(() => {
                setActivePart(nextPart.part_number);
                // Set auto-play flag for the next part
                setShouldAutoPlay(true);
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
        <HighlightProvider options={{ sessionKey: practiceUuid }}>
            <ListeningPracticeContent
                rawData={rawData}
                practiceUuid={practiceUuid}
                isDarkMode={isDarkMode}
                isSubmitting={isSubmitting}
                showPlayDialog={showPlayDialog}
                hasStarted={hasStarted}
                userAnswers={userAnswers}
                activePart={activePart}
                activeQuestionIndex={activeQuestionIndex}
                highlightedQuestionId={highlightedQuestionId}
                hasAnswers={hasAnswers}
                sortedContents={sortedContents}
                activeContent={activeContent}
                partsInfo={partsInfo}
                allQuestions={allQuestions}
                currentQuestionIndex={currentQuestionIndex}
                activeQuestionId={activeQuestionId}
                questionsContainerRef={questionsContainerRef}
                audioRef={audioRef}
                audioPlayerRef={audioPlayerRef}
                shouldAutoPlay={shouldAutoPlay}
                onAudioPlay={() => { setIsAudioPlaying(true); setShouldAutoPlay(false); }}
                onAudioPause={() => setIsAudioPlaying(false)}
                onBack={handleBack}
                onAnswer={handleAnswer}
                onPartChange={handlePartChange}
                onQuestionClick={handleQuestionClick}
                onPrev={handlePrev}
                onNext={handleNext}
                onTimeUp={handleTimeUp}
                onTimerStart={handleTimerStart}
                onThemeToggle={handleThemeToggle}
                onSubmit={handleSubmit}
                onStart={handleStart}
                onAudioEnded={handleAudioEnded}
            />
        </HighlightProvider>
    );
}

// Extracted content component to use highlight context
interface ListeningPracticeContentProps {
    rawData: APIPracticeDetail;
    practiceUuid: string;
    isDarkMode: boolean;
    isSubmitting: boolean;
    showPlayDialog: boolean;
    hasStarted: boolean;
    userAnswers: Record<number, string | string[]>;
    activePart: number;
    activeQuestionIndex: number;
    highlightedQuestionId: number | null;
    hasAnswers: boolean;
    sortedContents: APIListeningContent[];
    activeContent: APIListeningContent | undefined;
    partsInfo: PartInfo[];
    allQuestions: { id: number; order: number; partNumber: number }[];
    currentQuestionIndex: number;
    activeQuestionId: number | null;
    questionsContainerRef: React.RefObject<HTMLDivElement | null>;
    audioRef: React.RefObject<HTMLAudioElement | null>;
    audioPlayerRef: React.RefObject<AudioPlayerHandle | null>;
    shouldAutoPlay: boolean;
    onAudioPlay: () => void;
    onAudioPause: () => void;
    onBack: () => void;
    onAnswer: (questionId: number, answer: string | string[]) => void;
    onPartChange: (partNumber: number) => void;
    onQuestionClick: (questionId: number) => void;
    onPrev: () => void;
    onNext: () => void;
    onTimeUp: () => void;
    onTimerStart: (startTime: Date) => void;
    onThemeToggle: (isDark: boolean) => void;
    onSubmit: () => void;
    onStart: () => void;
    onAudioEnded: () => void;
}

function ListeningPracticeContent({
    rawData,
    isDarkMode,
    isSubmitting,
    showPlayDialog,
    hasStarted,
    userAnswers,
    activePart,
    highlightedQuestionId,
    hasAnswers,
    activeContent,
    partsInfo,
    allQuestions,
    currentQuestionIndex,
    activeQuestionId,
    questionsContainerRef,
    audioRef,
    audioPlayerRef,
    shouldAutoPlay,
    onAudioPlay,
    onAudioPause,
    onBack,
    onAnswer,
    onPartChange,
    onQuestionClick,
    onPrev,
    onNext,
    onTimeUp,
    onTimerStart,
    onThemeToggle,
    onSubmit,
    onStart,
    onAudioEnded,
}: ListeningPracticeContentProps) {
    const { state, setActiveColor, clearAllHighlights } = useHighlightContext();

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
            <PlayDialog isOpen={showPlayDialog} onStart={onStart} />

            {/* Main Content (visible after starting) */}
            {hasStarted && (
                <>
                    {/* Header - Fixed at top with timer, theme toggle, and submit button */}
                    <IELTSHeader
                        onBack={onBack}
                        timerMinutes={rawData.duration || 40}
                        onTimeUp={onTimeUp}
                        onTimerStart={onTimerStart}
                        isDarkMode={isDarkMode}
                        onThemeToggle={onThemeToggle}
                        showTimer={true}
                        showThemeToggle={true}
                        onSubmit={onSubmit}
                        showSubmit={true}
                        hasAnswers={hasAnswers}
                    // rightContent={
                    //     <HighlightToolbar
                    //         activeColor={state.activeColor}
                    //         onColorChange={setActiveColor}
                    //         onClearAll={clearAllHighlights}
                    //         compact
                    //         className="mr-2"
                    //     />
                    // }
                    />

                    {/* Hidden Audio Element for programmatic control */}
                    <audio
                        ref={audioRef}
                        src={activeContent?.audio_url}
                        onEnded={onAudioEnded}
                        preload="auto"
                        className="hidden"
                    />

                    {/* Main scrollable content area - accounts for fixed header (h-14 = 56px), nav controls (h-12 = 48px), and bottom nav (h-14 = 56px) */}
                    <div className="pt-14 pb-26 flex-1 overflow-y-auto" ref={questionsContainerRef}>
                        {/* Audio Player - Visible controls for practice mode */}
                        <div className="px-4 pt-4">
                            <AudioPlayer
                                ref={audioPlayerRef}
                                src={activeContent?.audio_url || ''}
                                partNumber={activeContent?.part_number}
                                totalParts={rawData.contents?.length || 1}
                                autoPlay={shouldAutoPlay}
                                onPlay={onAudioPlay}
                                onPause={onAudioPause}
                                onEnded={onAudioEnded}
                                className="mb-4"
                            />
                        </div>

                        {/* Part Title Bar */}
                        <div className="bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 px-6 py-3 mx-4 rounded">
                            <h2 className="text-base font-bold text-gray-900 dark:text-white">Part {activeContent?.part_number}</h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{activeContent?.description || `Listen and answer questions.`}</p>
                        </div>

                        {/* Questions Content with Highlighting - increased spacing between question groups */}
                        <HighlightableQuestions
                            groupId={`listening-questions-${activeContent?.part_number || 1}`}
                            className="max-w-full mx-auto px-6 py-6 space-y-12"
                            enabled={true}
                        >
                            {activeContent?.test_heads.map((group) => (
                                <div
                                    key={group.id}
                                    className="question-group-wrapper"
                                >
                                    <QuestionTypeFactory
                                        group={group}
                                        userAnswers={userAnswers}
                                        onAnswer={onAnswer}
                                        mode="listening"
                                        highlightedQuestionId={highlightedQuestionId}
                                    />
                                </div>
                            ))}
                        </HighlightableQuestions>
                    </div>

                    {/* Navigation Controls - positioned above bottom nav, right-aligned */}
                    <NavigationControls
                        onPrev={onPrev}
                        onNext={onNext}
                        canGoPrev={currentQuestionIndex > 0}
                        canGoNext={currentQuestionIndex < allQuestions.length - 1}
                    />

                    {/* Bottom Navigation */}
                    <BottomNav
                        sections={partsInfo}
                        activeSection={activePart}
                        activeQuestionId={activeQuestionId}
                        onSectionChange={onPartChange}
                        onQuestionClick={onQuestionClick}
                        mode="listening"
                    />
                </>
            )}
        </div>
    );
}
