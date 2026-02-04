/**
 * Universal Practice Results Page
 * Reusable for Reading & Listening practice results
 * URL pattern: /practice/{attempt_uuid}/results
 * 
 * Features:
 * - IELTS-style Answer Sheet with two-column layout
 * - Show/Hide toggle for correct answers
 * - Minimal, exam-focused UI
 * 
 * Scoring Logic:
 * - Multi-content practices (is_multi_content=true OR content_count>1): Show Band Score
 * - Single-content / objective questions: Show Accuracy (X/Y correct)
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { IELTSAnswerSheet, type AnswerResult } from '@/domains/practice/components/exam/IELTSAnswerSheet';

// ============= Types matching ACTUAL API response =============

/** Individual question result from detailed_results */
interface QuestionResult {
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
}

/** API Response structure - matches actual backend response */
interface AttemptResultDTO {
    attempt_uuid: string;
    practice_uuid: string;
    practice_title: string;
    section_type: 'READING' | 'LISTENING' | 'WRITING' | 'SPEAKING';
    test_type: 'FULL_TEST' | 'SECTION_PRACTICE';
    score: number;
    correct_answers: number;
    total_questions: number;
    /** Accuracy as percentage (e.g., 5.0 means 5%) */
    accuracy: number;
    time_spent_seconds: number;
    completed_at: string;
    /** Indicates if practice has multiple content sections */
    is_multi_content?: boolean;
    /** Number of content sections in the practice */
    content_count?: number;
    /** Detailed results keyed by question_id */
    detailed_results: Record<string, QuestionResult>;
}

// ============= Icons (Minimal, Clean) =============

const CheckIcon = ({ className }: { className?: string }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const XIcon = ({ className }: { className?: string }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const ArrowLeftIcon = ({ className }: { className?: string }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m15 18-6-6 6-6" />
    </svg>
);

const RefreshIcon = ({ className }: { className?: string }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M8 16H3v5" />
    </svg>
);

const HomeIcon = ({ className }: { className?: string }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

// ============= Helpers =============

function formatDuration(seconds: number): string {
    if (seconds === 0) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins >= 60) {
        const hours = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        return `${hours}h ${remainingMins}m`;
    }
    if (mins === 0) return `${secs}s`;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}

/**
 * Convert accuracy percentage to IELTS band score
 * Based on standard IELTS conversion table
 */
function getBandFromAccuracy(accuracy: number): number {
    if (accuracy >= 89) return 9.0;
    if (accuracy >= 87) return 8.5;
    if (accuracy >= 82) return 8.0;
    if (accuracy >= 77) return 7.5;
    if (accuracy >= 72) return 7.0;
    if (accuracy >= 67) return 6.5;
    if (accuracy >= 60) return 6.0;
    if (accuracy >= 52) return 5.5;
    if (accuracy >= 45) return 5.0;
    if (accuracy >= 37) return 4.5;
    if (accuracy >= 30) return 4.0;
    if (accuracy >= 22) return 3.5;
    if (accuracy >= 15) return 3.0;
    return 2.5;
}

function getSectionLabel(sectionType: string): string {
    const labels: Record<string, string> = {
        READING: 'Reading',
        LISTENING: 'Listening',
        WRITING: 'Writing',
        SPEAKING: 'Speaking',
    };
    return labels[sectionType] || sectionType;
}

// ============= Loading Component =============

function LoadingScreen() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
            <div className="text-center">
                <div className="w-10 h-10 border-2 border-neutral-200 dark:border-neutral-700 border-t-neutral-600 dark:border-t-neutral-400 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-neutral-500 dark:text-neutral-400 text-sm">Loading results...</p>
            </div>
        </div>
    );
}

// ============= Error Component =============

function ErrorScreen({ error, onRetry }: { error: string; onRetry?: () => void }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 p-4">
            <div className="text-center max-w-sm">
                <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XIcon className="w-6 h-6 text-red-500 dark:text-red-400" />
                </div>
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                    Failed to Load Results
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">{error}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="px-4 py-2 text-sm font-medium text-white bg-neutral-800 dark:bg-neutral-700 rounded-lg hover:bg-neutral-700 dark:hover:bg-neutral-600 transition-colors"
                    >
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
}

// ============= Score Display Component =============

interface ScoreDisplayProps {
    showBandScore: boolean;
    bandScore: number;
    correctAnswers: number;
    totalQuestions: number;
    accuracy: number;
}

function ScoreDisplay({ showBandScore, bandScore, correctAnswers, totalQuestions, accuracy }: ScoreDisplayProps) {
    if (showBandScore && bandScore != null) {
        return (
            <div className="text-center">
                <div className="text-6xl font-bold text-neutral-900 dark:text-white tracking-tight">
                    {bandScore.toFixed(1)}
                </div>
                <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-1">
                    Band Score
                </div>
                <div className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                    {correctAnswers} / {totalQuestions} correct ({accuracy.toFixed(0)}%)
                </div>
            </div>
        );
    }

    return (
        <div className="text-center">
            <div className="text-5xl font-bold text-neutral-900 dark:text-white tracking-tight">
                {correctAnswers}
                <span className="text-2xl text-neutral-400 dark:text-neutral-500 font-normal">
                    /{totalQuestions}
                </span>
            </div>
            <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-1">
                Correct Answers
            </div>
            <div className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mt-1">
                {accuracy.toFixed(0)}% Accuracy
            </div>
        </div>
    );
}

// ============= Main Results Page =============

export default function PracticeResultsPage() {
    const params = useParams();
    const router = useRouter();
    const attemptUuid = params.attempt_uuid as string;

    const [result, setResult] = useState<AttemptResultDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Initialize dark mode
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

    // Apply dark mode
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    // Fetch attempt result
    useEffect(() => {
        if (!attemptUuid) return;

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

        fetch(`${API_BASE_URL}/practice/attempts/${attemptUuid}/result/`, {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to load results');
                return res.json();
            })
            .then(data => {
                setResult(data);
                setIsLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setIsLoading(false);
            });
    }, [attemptUuid]);

    /**
     * Auto-detect scoring mode from API data:
     * - Multi-content (is_multi_content=true OR content_count>1): Band Score
     * - Full test: Band Score  
     * - Otherwise: Accuracy (X/Y)
     */
    const shouldShowBandScore = useMemo(() => {
        if (!result) return false;
        if (result.test_type === 'FULL_TEST') return true;
        if (result.is_multi_content === true) return true;
        if (result.content_count && result.content_count > 1) return true;
        return false;
    }, [result]);

    const bandScore = useMemo(() => {
        if (!result) return 0;
        return getBandFromAccuracy(result.accuracy);
    }, [result]);

    // Process detailed_results into answer sheet format
    const answerSheetData: AnswerResult[] = useMemo(() => {
        if (!result?.detailed_results) return [];
        return Object.entries(result.detailed_results)
            .map(([id, data]) => ({
                questionId: id,
                userAnswer: data.user_answer || '',
                correctAnswer: data.correct_answer || '',
                isCorrect: data.is_correct,
            }))
            .sort((a, b) => Number(a.questionId) - Number(b.questionId));
    }, [result]);

    const incorrectAnswers = result ? result.total_questions - result.correct_answers : 0;

    // Navigation handlers
    const handleBackToDashboard = () => {
        if (!result) {
            router.push('/dashboard');
            return;
        }
        const sectionPath = result.section_type.toLowerCase();
        router.push(`/dashboard/practice/${sectionPath}`);
    };

    const handleRetry = () => {
        if (!result) return;
        const sectionPath = result.section_type.toLowerCase();
        router.push(`/practice/${sectionPath}/${result.practice_uuid}`);
    };

    // Loading state
    if (isLoading) {
        return <LoadingScreen />;
    }

    // Error state
    if (error || !result) {
        return (
            <ErrorScreen
                error={error || 'No results available'}
                onRetry={() => window.location.reload()}
            />
        );
    }

    return (
        <div className={cn('min-h-screen bg-neutral-50 dark:bg-neutral-900', isDarkMode ? 'dark' : '')}>
            {/* Minimal Header */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800">
                <div className="max-w-5xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={handleBackToDashboard}
                            className="p-2 -ml-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-white transition-colors rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            aria-label="Back to dashboard"
                        >
                            <ArrowLeftIcon />
                        </button>
                        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                            {getSectionLabel(result.section_type)} Results
                        </span>
                        <div className="w-9" /> {/* Spacer for centering */}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 py-8">
                {/* Practice Title */}
                <h1 className="text-lg font-semibold text-neutral-900 dark:text-white text-center mb-6 line-clamp-2">
                    {result.practice_title}
                </h1>

                {/* Score Summary Section - Compact horizontal layout */}
                <div className="bg-white dark:bg-neutral-800/50 rounded-2xl p-6 mb-8 border border-neutral-200 dark:border-neutral-800">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        {/* Score Display */}
                        <div className="shrink-0">
                            <ScoreDisplay
                                showBandScore={shouldShowBandScore}
                                bandScore={result.score}
                                correctAnswers={result.correct_answers}
                                totalQuestions={result.total_questions}
                                accuracy={result.accuracy}
                            />
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6">
                            {/* Correct */}
                            <div className="text-center">
                                <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-1">
                                    <CheckIcon className="w-5 h-5 text-green-500" />
                                </div>
                                <div className="text-xl font-bold text-neutral-900 dark:text-white">
                                    {result.correct_answers}
                                </div>
                                <div className="text-xs text-neutral-500 dark:text-neutral-400">Correct</div>
                            </div>

                            {/* Incorrect */}
                            <div className="text-center">
                                <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-1">
                                    <XIcon className="w-5 h-5 text-red-500" />
                                </div>
                                <div className="text-xl font-bold text-neutral-900 dark:text-white">
                                    {incorrectAnswers}
                                </div>
                                <div className="text-xs text-neutral-500 dark:text-neutral-400">Incorrect</div>
                            </div>

                            {/* Time */}
                            <div className="text-center">
                                <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center mx-auto mb-1">
                                    <ClockIcon className="w-5 h-5 text-neutral-500" />
                                </div>
                                <div className="text-xl font-bold text-neutral-900 dark:text-white">
                                    {formatDuration(result.time_spent_seconds)}
                                </div>
                                <div className="text-xs text-neutral-500 dark:text-neutral-400">Time</div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={handleRetry}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
                            >
                                <RefreshIcon />
                                Try Again
                            </button>
                            <button
                                onClick={handleBackToDashboard}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
                            >
                                <HomeIcon />
                                Dashboard
                            </button>
                        </div>
                    </div>
                </div>

                {/* IELTS Answer Sheet */}
                {answerSheetData.length > 0 && (
                    <IELTSAnswerSheet
                        answers={answerSheetData}
                        className="mb-8"
                    />
                )}
            </main>

            {/* Minimal Footer */}
            <footer className="py-6 text-center">
                <p className="text-xs text-neutral-400 dark:text-neutral-600">
                    Keep practicing to improve your score
                </p>
            </footer>
        </div>
    );
}
