/**
 * IELTS Reading Practice Page
 * Split-panel layout: Left panel for passage, Right panel for questions
 * No audio controls - reading specific behavior
 * Features: Timer, Theme Toggle, Question Highlighting, Text Highlighting, API Submission
 */

'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { IELTSHeader } from '@/domains/practice/components/exam/IELTSHeader';
import { ReadingPassage } from '@/domains/practice/components/exam/ReadingPassage';
import { ReadingSplitter } from '@/domains/practice/components/exam/ReadingSplitter';
import { BottomNav, type SectionInfo as ReadingPassageInfo, type QuestionInfo } from '@/domains/practice/components/exam/BottomNav';
import { NavigationControls } from '@/domains/practice/components/exam/NavigationControls';
import { QuestionTypeFactory, type APITestHead } from '@/domains/practice/components/exam/question-types';
import { HighlightProvider, HighlightToolbar, HighlightableQuestions, useHighlightContext } from '@/domains/practice/components/exam/highlight';
import { cn, scrollToQuestionInContainer } from '@/lib/utils';

// Types matching API response
interface APIReadingContent {
    id: number;
    passage_number: number;
    title: string;
    content: string;
    word_count?: number;
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
    contents: APIReadingContent[];
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
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-xl text-center">
                <div className="w-10 h-10 border-4 border-gray-200 dark:border-gray-700 border-t-primary-500 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-700 dark:text-gray-300 font-medium">Submitting answers...</p>
            </div>
        </div>
    );
}

// Highlight duration in ms
const HIGHLIGHT_DURATION = 1500;

export default function ReadingPracticePage() {
    const params = useParams();
    const router = useRouter();
    const practiceUuid = params.uuid as string;
    const questionsContainerRef = useRef<HTMLDivElement>(null);
    const passageContainerRef = useRef<HTMLDivElement>(null);
    const mainContainerRef = useRef<HTMLDivElement>(null);

    // State
    const [rawData, setRawData] = useState<APIPracticeDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activePassage, setActivePassage] = useState(1);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<number, string | string[]>>({});

    // Enhanced feature state
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [highlightedQuestionId, setHighlightedQuestionId] = useState<number | null>(null);
    const [startedAt, setStartedAt] = useState<Date | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Splitter state - left panel width as percentage
    const [leftPanelWidthPercent, setLeftPanelWidthPercent] = useState(50);

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

    // Sort contents by passage number
    const sortedContents = useMemo(() => {
        if (!rawData?.contents) return [];
        return [...rawData.contents].sort((a, b) => a.passage_number - b.passage_number);
    }, [rawData]);

    // Get active content
    const activeContent = useMemo(() => {
        return sortedContents.find(c => c.passage_number === activePassage) || sortedContents[0];
    }, [sortedContents, activePassage]);

    // Check if user has any answers (for submit validation)
    const hasAnswers = useMemo(() => {
        return Object.values(userAnswers).some(answer => {
            if (Array.isArray(answer)) {
                return answer.length > 0 && answer.some(a => a && String(a).trim() !== '');
            }
            return answer !== undefined && answer !== null && String(answer).trim() !== '';
        });
    }, [userAnswers]);

    // Build passages info for bottom nav
    const passagesInfo: ReadingPassageInfo[] = useMemo(() => {
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
            return { sectionNumber: content.passage_number, title: content.title, questions };
        });
    }, [sortedContents, userAnswers]);

    // Flatten all questions across all passages for prev/next navigation
    const allQuestions = useMemo(() => {
        const questions: { id: number; order: number; passageNumber: number }[] = [];
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
                            questions.push({ id: q.id, order: q.order + i, passageNumber: content.passage_number });
                        }
                    } else {
                        questions.push({ id: q.id, order: q.order, passageNumber: content.passage_number });
                    }
                });
            });
        });
        return questions.sort((a, b) => a.order - b.order);
    }, [sortedContents]);

    // Current question index in allQuestions array
    const currentQuestionIndex = useMemo(() => {
        const activePassageQuestions = passagesInfo.find(p => p.sectionNumber === activePassage)?.questions || [];
        if (activePassageQuestions.length === 0) return 0;
        const currentQuestionId = activePassageQuestions[activeQuestionIndex]?.id;
        return allQuestions.findIndex(q => q.id === currentQuestionId);
    }, [passagesInfo, activePassage, activeQuestionIndex, allQuestions]);

    // Get current active question ID
    const activeQuestionId = useMemo(() => {
        const activePassageQuestions = passagesInfo.find(p => p.sectionNumber === activePassage)?.questions || [];
        return activePassageQuestions[activeQuestionIndex]?.id ?? null;
    }, [passagesInfo, activePassage, activeQuestionIndex]);

    // Auto-scroll to top when passage changes
    useEffect(() => {
        if (questionsContainerRef.current) {
            questionsContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
        if (passageContainerRef.current) {
            passageContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [activePassage]);

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
    const handleBack = useCallback(() => {
        router.push('/dashboard/practice/reading');
    }, [router]);

    const handleAnswer = useCallback((questionId: number, answer: string | string[]) => {
        setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
    }, []);

    const handlePassageChange = useCallback((passageNumber: number) => {
        setActivePassage(passageNumber);
        setActiveQuestionIndex(0); // Reset to first question of the passage
    }, []);

    const handleQuestionClick = useCallback((questionId: number) => {
        // Find the question's index in the current passage
        const activePassageQuestions = passagesInfo.find(p => p.sectionNumber === activePassage)?.questions || [];
        const questionIdx = activePassageQuestions.findIndex(q => q.id === questionId);
        if (questionIdx >= 0) {
            setActiveQuestionIndex(questionIdx);
        }
        // Scroll and highlight
        scrollToQuestion(questionId);
        highlightQuestion(questionId);
    }, [passagesInfo, activePassage, scrollToQuestion, highlightQuestion]);

    const handlePrev = useCallback(() => {
        if (currentQuestionIndex <= 0) return;

        const prevQuestion = allQuestions[currentQuestionIndex - 1];
        if (prevQuestion) {
            // If different passage, switch passages and set correct question index
            if (prevQuestion.passageNumber !== activePassage) {
                setActivePassage(prevQuestion.passageNumber);
                const prevPassageQuestions = passagesInfo.find(p => p.sectionNumber === prevQuestion.passageNumber)?.questions || [];
                const questionIdx = prevPassageQuestions.findIndex(q => q.id === prevQuestion.id);
                setActiveQuestionIndex(questionIdx >= 0 ? questionIdx : 0);
            } else {
                // Same passage, just decrement index
                setActiveQuestionIndex(prev => Math.max(0, prev - 1));
            }
            // Scroll to question and highlight
            setTimeout(() => {
                scrollToQuestion(prevQuestion.id);
                highlightQuestion(prevQuestion.id);
            }, 100);
        }
    }, [currentQuestionIndex, allQuestions, activePassage, passagesInfo, scrollToQuestion, highlightQuestion]);

    const handleNext = useCallback(() => {
        if (currentQuestionIndex >= allQuestions.length - 1) return;

        const nextQuestion = allQuestions[currentQuestionIndex + 1];
        if (nextQuestion) {
            // If different passage, switch passages and set correct question index
            if (nextQuestion.passageNumber !== activePassage) {
                setActivePassage(nextQuestion.passageNumber);
                const nextPassageQuestions = passagesInfo.find(p => p.sectionNumber === nextQuestion.passageNumber)?.questions || [];
                const questionIdx = nextPassageQuestions.findIndex(q => q.id === nextQuestion.id);
                setActiveQuestionIndex(questionIdx >= 0 ? questionIdx : 0);
            } else {
                // Same passage, just increment index
                setActiveQuestionIndex(prev => prev + 1);
            }
            // Scroll to question and highlight
            setTimeout(() => {
                scrollToQuestion(nextQuestion.id);
                highlightQuestion(nextQuestion.id);
            }, 100);
        }
    }, [currentQuestionIndex, allQuestions, activePassage, passagesInfo, scrollToQuestion, highlightQuestion]);

    // Keyboard navigation handler
    useEffect(() => {
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
    }, [handlePrev, handleNext]);

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

    // Loading state
    if (isLoading) {
        return <LoadingScreen />;
    }

    // Error state
    if (error || !rawData?.contents?.length) {
        return (
            <ErrorScreen
                error={error || 'No reading content available'}
                onRetry={() => window.location.reload()}
            />
        );
    }

    return (
        <HighlightProvider options={{ sessionKey: practiceUuid }}>
            <ReadingPracticeContent
                rawData={rawData}
                practiceUuid={practiceUuid}
                isDarkMode={isDarkMode}
                isSubmitting={isSubmitting}
                userAnswers={userAnswers}
                activePassage={activePassage}
                activeQuestionIndex={activeQuestionIndex}
                leftPanelWidthPercent={leftPanelWidthPercent}
                highlightedQuestionId={highlightedQuestionId}
                hasAnswers={hasAnswers}
                sortedContents={sortedContents}
                activeContent={activeContent}
                passagesInfo={passagesInfo}
                allQuestions={allQuestions}
                currentQuestionIndex={currentQuestionIndex}
                activeQuestionId={activeQuestionId}
                questionsContainerRef={questionsContainerRef}
                passageContainerRef={passageContainerRef}
                mainContainerRef={mainContainerRef}
                onBack={handleBack}
                onAnswer={handleAnswer}
                onPassageChange={handlePassageChange}
                onQuestionClick={handleQuestionClick}
                onPrev={handlePrev}
                onNext={handleNext}
                onTimeUp={handleTimeUp}
                onTimerStart={handleTimerStart}
                onThemeToggle={handleThemeToggle}
                onSubmit={handleSubmit}
                setLeftPanelWidthPercent={setLeftPanelWidthPercent}
            />
        </HighlightProvider>
    );
}

// Extracted content component to use highlight context
interface ReadingPracticeContentProps {
    rawData: APIPracticeDetail;
    practiceUuid: string;
    isDarkMode: boolean;
    isSubmitting: boolean;
    userAnswers: Record<number, string | string[]>;
    activePassage: number;
    activeQuestionIndex: number;
    leftPanelWidthPercent: number;
    highlightedQuestionId: number | null;
    hasAnswers: boolean;
    sortedContents: APIReadingContent[];
    activeContent: APIReadingContent | undefined;
    passagesInfo: ReadingPassageInfo[];
    allQuestions: { id: number; order: number; passageNumber: number }[];
    currentQuestionIndex: number;
    activeQuestionId: number | null;
    questionsContainerRef: React.RefObject<HTMLDivElement | null>;
    passageContainerRef: React.RefObject<HTMLDivElement | null>;
    mainContainerRef: React.RefObject<HTMLDivElement | null>;
    onBack: () => void;
    onAnswer: (questionId: number, answer: string | string[]) => void;
    onPassageChange: (passageNumber: number) => void;
    onQuestionClick: (questionId: number) => void;
    onPrev: () => void;
    onNext: () => void;
    onTimeUp: () => void;
    onTimerStart: (startTime: Date) => void;
    onThemeToggle: (isDark: boolean) => void;
    onSubmit: () => void;
    setLeftPanelWidthPercent: (percent: number) => void;
}

function ReadingPracticeContent({
    rawData,
    isDarkMode,
    isSubmitting,
    userAnswers,
    activePassage,
    leftPanelWidthPercent,
    highlightedQuestionId,
    hasAnswers,
    activeContent,
    passagesInfo,
    allQuestions,
    currentQuestionIndex,
    activeQuestionId,
    questionsContainerRef,
    passageContainerRef,
    mainContainerRef,
    onBack,
    onAnswer,
    onPassageChange,
    onQuestionClick,
    onPrev,
    onNext,
    onTimeUp,
    onTimerStart,
    onThemeToggle,
    onSubmit,
    setLeftPanelWidthPercent,
}: ReadingPracticeContentProps) {
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

            {/* Header - Fixed at top with timer, theme toggle, and submit button */}
            <IELTSHeader
                onBack={onBack}
                timerMinutes={rawData.duration || 60}
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

            {/* Main Content - Split Panel Layout with Independent Scrolling */}
            {/* Height: 100vh - header(56px) - bottom nav(56px) = calc(100vh - 112px) */}
            <div
                ref={mainContainerRef}
                className="fixed top-14 bottom-14 left-0 right-0 flex overflow-hidden"
            >
                {/* Left Panel - Reading Passage (Independent Scroll) */}
                <div
                    className="h-full overflow-hidden flex flex-col"
                    style={{ width: `${leftPanelWidthPercent}%` }}
                >
                    <ReadingPassage
                        ref={passageContainerRef}
                        title={activeContent?.title || ''}
                        content={activeContent?.content || ''}
                        passageNumber={activeContent?.passage_number}
                        wordCount={activeContent?.word_count}
                        className="h-full overflow-y-auto"
                        enableHighlighting={true}
                    />
                </div>

                {/* Vertical Reading Splitter - Drag to resize */}
                <ReadingSplitter
                    leftWidthPercent={leftPanelWidthPercent}
                    onWidthChange={setLeftPanelWidthPercent}
                    containerRef={mainContainerRef}
                />

                {/* Right Panel - Questions (Independent Scroll) */}
                <div
                    ref={questionsContainerRef}
                    className="h-full overflow-y-auto bg-gray-50 dark:bg-slate-800/50"
                    style={{ width: `${100 - leftPanelWidthPercent}%` }}
                >
                    {/* Questions Content with Highlighting */}
                    <HighlightableQuestions
                        groupId={`reading-questions-${activeContent?.passage_number || 1}`}
                        className="px-6 py-6 space-y-10"
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
                                    mode="reading"
                                    highlightedQuestionId={highlightedQuestionId}
                                />
                            </div>
                        ))}
                    </HighlightableQuestions>
                </div>
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
                sections={passagesInfo}
                activeSection={activePassage}
                activeQuestionId={activeQuestionId}
                onSectionChange={onPassageChange}
                onQuestionClick={onQuestionClick}
                mode="reading"
            />
        </div>
    );
}
