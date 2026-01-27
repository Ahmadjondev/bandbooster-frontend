/**
 * Question Palette Component
 * Fixed bottom navigation bar with part tabs and question number buttons
 * Shows answered/unanswered status and allows quick navigation
 */

'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

export interface QuestionInfo {
    id: number;
    order: number;
    isAnswered: boolean;
}

export interface PartInfo {
    partNumber: number;
    questions: QuestionInfo[];
}

export interface QuestionPaletteProps {
    /** Array of parts with their questions */
    parts: PartInfo[];
    /** Currently active part number */
    activePart: number;
    /** Callback when part is changed */
    onPartChange: (partNumber: number) => void;
    /** Callback when question is clicked */
    onQuestionClick: (questionId: number) => void;
    /** Currently focused question ID (optional) */
    focusedQuestionId?: number | null;
    /** Callback when finish is clicked */
    onFinish?: () => void;
    /** Finish button label */
    finishLabel?: string;
    /** Whether to show the finish button */
    showFinish?: boolean;
}

export function QuestionPalette({
    parts,
    activePart,
    onPartChange,
    onQuestionClick,
    focusedQuestionId,
    onFinish,
    finishLabel = 'Finish',
    showFinish = true,
}: QuestionPaletteProps) {
    // Get answered counts per part
    const partStats = useMemo(() => {
        return parts.reduce((acc, part) => {
            acc[part.partNumber] = {
                answered: part.questions.filter(q => q.isAnswered).length,
                total: part.questions.length,
            };
            return acc;
        }, {} as Record<number, { answered: number; total: number }>);
    }, [parts]);

    // Get active part's questions
    const activePartQuestions = useMemo(() => {
        return parts.find(p => p.partNumber === activePart)?.questions ?? [];
    }, [parts, activePart]);

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-600 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.3)] z-40">
            <div className="px-4 py-3 max-w-7xl mx-auto">
                {/* Single Line Layout */}
                <div className="flex items-center justify-between gap-4">
                    {/* Left: Parts and Questions */}
                    <div className="flex items-center gap-3 overflow-x-auto flex-1 custom-scrollbar pb-1">
                        {/* Part Buttons with Separators */}
                        {parts.map((part, index) => (
                            <div key={part.partNumber} className="flex items-center gap-3 shrink-0">
                                {/* Part Button */}
                                <button
                                    onClick={() => onPartChange(part.partNumber)}
                                    className={cn(
                                        'px-3 py-1.5 text-sm font-semibold rounded-lg transition-all whitespace-nowrap ',
                                        activePart === part.partNumber
                                            ? 'bg-primary-600 dark:bg-primary-500 text-white'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-transparent'
                                    )}
                                >
                                    Part {part.partNumber}
                                    {activePart !== part.partNumber && partStats[part.partNumber] && (
                                        <span className="ml-2 text-xs opacity-75">
                                            {partStats[part.partNumber].answered}/{partStats[part.partNumber].total}
                                        </span>
                                    )}
                                </button>

                                {/* Separator (except after last part) */}
                                {index < parts.length - 1 && (
                                    <span className="text-slate-300 dark:text-slate-600 shrink-0">|</span>
                                )}
                            </div>
                        ))}

                        {/* Arrow Separator */}
                        <span className="text-slate-400 dark:text-slate-500 text-lg shrink-0 mx-1">→</span>

                        {/* Active Part Questions */}
                        <div className="flex items-center gap-1.5">
                            {activePartQuestions.map(question => {
                                const isFocused = focusedQuestionId === question.id;

                                return (
                                    <button
                                        key={question.id}
                                        onClick={() => onQuestionClick(question.id)}
                                        className={cn(
                                            'w-8 h-8 shrink-0 rounded-lg text-sm font-semibold transition-all border-2',
                                            isFocused
                                                ? 'bg-slate-200 dark:bg-slate-700 border-primary-300 dark:border-primary-500'
                                                : question.isAnswered
                                                    ? 'bg-primary-600 dark:bg-primary-500 text-white border-primary-600 dark:border-primary-500 hover:bg-primary-700 dark:hover:bg-primary-600'
                                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                                        )}
                                        title={`Question ${question.order}${question.isAnswered ? ' - Answered' : ' - Not answered'}`}
                                    >
                                        {question.order}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right: Finish Button */}
                    {showFinish && (
                        <button
                            onClick={onFinish}
                            className="shrink-0 px-5 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                            {finishLabel}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
