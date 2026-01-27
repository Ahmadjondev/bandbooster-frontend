/**
 * Practice Result Page Component
 * Minimalistic result display after submission
 * Shows score, accuracy, time spent
 */

'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';

// Types matching API response
export interface PracticeResult {
    attempt_uuid: string;
    practice_uuid: string;
    practice_title: string;
    section_type: 'READING' | 'LISTENING' | 'WRITING' | 'SPEAKING';
    test_type: 'FULL_TEST' | 'SECTION_PRACTICE';
    score: number | null;
    correct_answers: number;
    total_questions: number;
    accuracy: number;
    time_spent_seconds: number;
    section_scores: Record<string, { score: number; total: number; band: number }> | null;
    detailed_results: Record<string, string>;
    completed_at: string | null;
}

export interface SubmitResponse {
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

// Icons
const CheckCircleIcon = () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

const ClockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const TargetIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
    </svg>
);

const CheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const XIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

export interface PracticeResultPageProps {
    result: SubmitResponse;
    practiceTitle: string;
    sectionType: string;
    onViewDetails?: () => void;
    onRetry?: () => void;
    onBackToDashboard?: () => void;
}

// Helper to format time
function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins >= 60) {
        const hours = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        return `${hours}h ${remainingMins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
}

// Get band from percentage for IELTS-style scoring
function getBandFromPercentage(percentage: number): number {
    if (percentage >= 90) return 9.0;
    if (percentage >= 85) return 8.5;
    if (percentage >= 80) return 8.0;
    if (percentage >= 75) return 7.5;
    if (percentage >= 70) return 7.0;
    if (percentage >= 65) return 6.5;
    if (percentage >= 60) return 6.0;
    if (percentage >= 55) return 5.5;
    if (percentage >= 50) return 5.0;
    if (percentage >= 45) return 4.5;
    if (percentage >= 40) return 4.0;
    if (percentage >= 35) return 3.5;
    return 3.0;
}

// Get performance label
function getPerformanceLabel(accuracy: number): { label: string; color: string } {
    if (accuracy >= 80) return { label: 'Excellent', color: 'text-green-600 dark:text-green-400' };
    if (accuracy >= 70) return { label: 'Good', color: 'text-blue-600 dark:text-blue-400' };
    if (accuracy >= 60) return { label: 'Satisfactory', color: 'text-amber-600 dark:text-amber-400' };
    if (accuracy >= 50) return { label: 'Needs Improvement', color: 'text-orange-600 dark:text-orange-400' };
    return { label: 'Keep Practicing', color: 'text-red-600 dark:text-red-400' };
}

export const PracticeResultPage = memo(function PracticeResultPage({
    result,
    practiceTitle,
    sectionType,
    onRetry,
    onBackToDashboard,
}: PracticeResultPageProps) {
    const score = result.band_score ?? result.percentage_score ?? getBandFromPercentage(result.accuracy);
    const isFullTest = result.is_full_test;
    const performance = getPerformanceLabel(result.accuracy);
    const incorrectAnswers = result.total_questions - result.correct_answers;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Practice Completed</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{practiceTitle}</p>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-6 py-8">
                <div className="max-w-3xl mx-auto">
                    {/* Success Icon & Score */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center mb-4">
                            <CheckCircleIcon />
                        </div>

                        {/* Band Score Display */}
                        <div className="mb-2">
                            <span className="text-5xl font-bold text-gray-900 dark:text-white">
                                {isFullTest ? score.toFixed(1) : `${Math.round(result.accuracy)}%`}
                            </span>
                            {isFullTest && (
                                <span className="text-lg text-gray-500 dark:text-gray-400 ml-2">Band</span>
                            )}
                        </div>

                        {/* Performance Label */}
                        <p className={cn('text-base font-medium', performance.color)}>
                            {performance.label}
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {/* Correct Answers */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                                <CheckIcon />
                                <span className="text-xs font-medium uppercase tracking-wider">Correct</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {result.correct_answers}
                            </p>
                        </div>

                        {/* Incorrect Answers */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                                <XIcon />
                                <span className="text-xs font-medium uppercase tracking-wider">Incorrect</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {incorrectAnswers}
                            </p>
                        </div>

                        {/* Accuracy */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                                <TargetIcon />
                                <span className="text-xs font-medium uppercase tracking-wider">Accuracy</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {result.accuracy.toFixed(1)}%
                            </p>
                        </div>

                        {/* Time Spent */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
                                <ClockIcon />
                                <span className="text-xs font-medium uppercase tracking-wider">Time</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {formatDuration(result.time_spent_seconds)}
                            </p>
                        </div>
                    </div>

                    {/* Summary Bar */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 mb-8">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Questions Answered
                            </span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {result.correct_answers} / {result.total_questions}
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-linear-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                                style={{ width: `${result.accuracy}%` }}
                            />
                        </div>

                        {/* Section Type Badge */}
                        <div className="mt-3 flex items-center gap-2">
                            <span className={cn(
                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                sectionType === 'LISTENING'
                                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            )}>
                                {sectionType}
                            </span>
                            {!isFullTest && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                    Section Practice
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        {onRetry && (
                            <button
                                onClick={onRetry}
                                className="px-6 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                Try Again
                            </button>
                        )}
                        {onBackToDashboard && (
                            <button
                                onClick={onBackToDashboard}
                                className="px-6 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                            >
                                Back to Dashboard
                            </button>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="px-6 py-4 text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                    Keep practicing to improve your IELTS score!
                </p>
            </footer>
        </div>
    );
});

export default PracticeResultPage;
