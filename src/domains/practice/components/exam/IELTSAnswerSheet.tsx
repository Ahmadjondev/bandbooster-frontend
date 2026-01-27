/**
 * IELTS Answer Sheet Component
 * Pixel-perfect two-column answer sheet layout matching official IELTS format
 * Features: Question numbers, user answers, correct/incorrect indicators
 * Show/Hide toggle for correct answers (global state)
 */

'use client';

import { memo, useState } from 'react';
import { cn } from '@/lib/utils';

// ============= Types =============

export interface AnswerResult {
    questionId: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
}

export interface IELTSAnswerSheetProps {
    /** Array of answer results */
    answers: AnswerResult[];
    /** Optional class name */
    className?: string;
}

// ============= Icons =============

const CheckIcon = ({ className }: { className?: string }) => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const XIcon = ({ className }: { className?: string }) => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const EyeIcon = ({ className }: { className?: string }) => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = ({ className }: { className?: string }) => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

// ============= Helper Functions =============

/**
 * Format answer for display
 * Returns 'N/A' if empty/undefined
 */
function formatAnswer(answer: string | null | undefined): string {
    if (answer === null || answer === undefined || answer.trim() === '') {
        return 'N/A';
    }
    return answer.trim();
}

/**
 * Parse correct answer that may contain alternatives (pipe-separated)
 */
function parseCorrectAnswers(answer: string): string[] {
    if (!answer) return [];
    // return answer;
    return answer.split('|').map(a => a.trim()).filter(Boolean);
}

// ============= Answer Row Component =============

interface AnswerRowProps {
    questionNumber: number;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    showCorrectAnswer: boolean;
}

const AnswerRow = memo(function AnswerRow({
    questionNumber,
    userAnswer,
    correctAnswer,
    isCorrect,
    showCorrectAnswer,
}: AnswerRowProps) {
    const formattedUserAnswer = formatAnswer(userAnswer);
    const correctAnswers = parseCorrectAnswers(correctAnswer);
    const displayCorrectAnswer = correctAnswers[0] || '—'; // .map(a => a).join(' | ');
    const isUnanswered = formattedUserAnswer === 'N/A';

    return (
        <div className="flex items-center border-b border-neutral-200 dark:border-neutral-700 last:border-b-0">
            {/* Question Number - Fixed width */}
            <div className="w-12 py-2.5 px-3 text-center border-r border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    {questionNumber}
                </span>
            </div>

            {/* User Answer - Flexible width */}
            <div className="flex-1 py-2.5 px-4 min-w-0 flex items-center gap-2">
                <span
                    className={cn(
                        'text-sm font-medium truncate',
                        isUnanswered
                            ? 'text-neutral-400 dark:text-neutral-500 italic'
                            : 'text-neutral-800 dark:text-neutral-200'
                    )}
                >
                    {formattedUserAnswer}
                </span>

                {showCorrectAnswer && (
                    <span className="text-sm font-medium text-green-500 dark:text-green-500 truncate">
                        ({displayCorrectAnswer})
                    </span>
                )}
            </div>


            {/* Status Indicator */}
            <div className="w-10 py-2.5 flex items-center justify-center border-l border-neutral-200 dark:border-neutral-700">
                {isCorrect ? (
                    <CheckIcon className="text-green-600 dark:text-green-500" />
                ) : (
                    <XIcon className="text-red-600 dark:text-red-500" />
                )}
            </div>

            {/* Correct Answer (conditionally shown) */}
            {/* {showCorrectAnswer && (
                <div className="w-32 py-2.5 px-3 border-l border-neutral-200 dark:border-neutral-700 bg-green-50/50 dark:bg-green-900/10">
                    <span className="text-sm font-medium text-green-700 dark:text-green-400 truncate block">
                        {displayCorrectAnswer}
                    </span>
                </div>
            )} */}
        </div>
    );
});

// ============= Main Component =============

export const IELTSAnswerSheet = memo(function IELTSAnswerSheet({
    answers,
    className,
}: IELTSAnswerSheetProps) {
    const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);

    // Split answers into two columns
    const midpoint = Math.ceil(answers.length / 2);
    const leftColumn = answers.slice(0, midpoint);
    const rightColumn = answers.slice(midpoint);

    return (
        <div className={cn('w-full', className)}>
            {/* Header with Toggle */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                    Answer Sheet
                </h2>
                <button
                    onClick={() => setShowCorrectAnswers(prev => !prev)}
                    className={cn(
                        'inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                        showCorrectAnswers
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    )}
                >
                    {showCorrectAnswers ? (
                        <>
                            <EyeOffIcon />
                            <span>Hide Correct Answers</span>
                        </>
                    ) : (
                        <>
                            <EyeIcon />
                            <span>Show Correct Answers</span>
                        </>
                    )}
                </button>
            </div>

            {/* Two-Column Answer Sheet */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                    {/* Column Header */}
                    <div className="flex items-center border-b border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800">
                        <div className="w-12 py-2 px-3 text-center border-r border-neutral-200 dark:border-neutral-700">
                            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                No.
                            </span>
                        </div>
                        <div className="flex-1 py-2 px-4">
                            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                Your Answer
                            </span>
                        </div>
                        <div className="w-10 py-2 flex items-center justify-center border-l border-neutral-200 dark:border-neutral-700">
                            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                                ✓/✗
                            </span>
                        </div>
                        {/* {showCorrectAnswers && (
                            <div className="w-32 py-2 px-3 border-l border-neutral-200 dark:border-neutral-700 bg-green-50/50 dark:bg-green-900/10">
                                <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">
                                    Correct
                                </span>
                            </div>
                        )} */}
                    </div>
                    {/* Rows */}
                    {leftColumn.map((answer, index) => (
                        <AnswerRow
                            key={answer.questionId}
                            questionNumber={index + 1}
                            userAnswer={answer.userAnswer}
                            correctAnswer={answer.correctAnswer}
                            isCorrect={answer.isCorrect}
                            showCorrectAnswer={showCorrectAnswers}
                        />
                    ))}
                </div>

                {/* Right Column */}
                {rightColumn.length > 0 && (
                    <div className="bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                        {/* Column Header */}
                        <div className="flex items-center border-b border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800">
                            <div className="w-12 py-2 px-3 text-center border-r border-neutral-200 dark:border-neutral-700">
                                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                    No.
                                </span>
                            </div>
                            <div className="flex-1 py-2 px-4">
                                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                    Your Answer
                                </span>
                            </div>
                            <div className="w-10 py-2 flex items-center justify-center border-l border-neutral-200 dark:border-neutral-700">
                                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                                    ✓/✗
                                </span>
                            </div>
                            {/* {showCorrectAnswers && (
                                <div className="w-32 py-2 px-3 border-l border-neutral-200 dark:border-neutral-700 bg-green-50/50 dark:bg-green-900/10">
                                    <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">
                                        Correct
                                    </span>
                                </div>
                            )} */}
                        </div>
                        {/* Rows */}
                        {rightColumn.map((answer, index) => (
                            <AnswerRow
                                key={answer.questionId}
                                questionNumber={midpoint + index + 1}
                                userAnswer={answer.userAnswer}
                                correctAnswer={answer.correctAnswer}
                                isCorrect={answer.isCorrect}
                                showCorrectAnswer={showCorrectAnswers}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});

export default IELTSAnswerSheet;
