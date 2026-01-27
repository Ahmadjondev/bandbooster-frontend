/**
 * IELTS Bottom Navigation Component
 * Pixel-perfect footer navigation matching official IELTS test interface
 * Shows Parts with question progress
 * Full width, flexible layout
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

export interface IELTSBottomNavProps {
    parts: PartInfo[];
    activePart: number;
    activeQuestionId?: number | null;
    onPartChange: (partNumber: number) => void;
    onQuestionClick: (questionId: number) => void;
}

export function IELTSBottomNav({
    parts,
    activePart,
    activeQuestionId,
    onPartChange,
    onQuestionClick,
}: IELTSBottomNavProps) {
    // Get stats per part
    const partStats = useMemo(() => {
        return parts.reduce((acc, part) => {
            acc[part.partNumber] = {
                answered: part.questions.filter(q => q.isAnswered).length,
                total: part.questions.length,
            };
            return acc;
        }, {} as Record<number, { answered: number; total: number }>);
    }, [parts]);

    // Get questions for active part
    const activePartQuestions = useMemo(() => {
        return parts.find(p => p.partNumber === activePart)?.questions ?? [];
    }, [parts, activePart]);

    return (
        <nav className="fixed bottom-0 left-0 right-0 w-screen h-14 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-700 flex items-stretch z-40">
            {/* Parts Section - Full width, evenly distributed */}
            <div className="flex items-stretch h-full flex-1 min-w-0">
                {parts.map((part, index) => {
                    const isActive = activePart === part.partNumber;
                    const stats = partStats[part.partNumber];
                    const isLast = index === parts.length - 1;

                    return (
                        <div
                            key={part.partNumber}
                            className={cn(
                                'h-full flex items-center justify-center flex-1 transition-colors',
                                !isLast && 'border-r border-gray-200 dark:border-gray-700',
                                isActive
                                    ? 'bg-gray-100 dark:bg-slate-800'
                                    : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'
                            )}
                        >
                            {/* Part Label Button */}
                            <button
                                onClick={() => onPartChange(part.partNumber)}
                                className={cn(
                                    'h-full px-2 sm:px-3 flex items-center gap-1 sm:gap-2 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'text-gray-900 dark:text-white'
                                        : 'text-gray-600 dark:text-gray-400'
                                )}
                            >
                                <span className="whitespace-nowrap">Part {part.partNumber}</span>
                                {!isActive && stats && (
                                    <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">
                                        {stats.answered}/{stats.total}
                                    </span>
                                )}
                            </button>

                            {/* Question Numbers (only for active part) */}
                            {isActive && activePartQuestions.length > 0 && (
                                <div className="flex items-center gap-0.5 pr-2 sm:pr-3 overflow-x-auto">
                                    {activePartQuestions.map((q) => (
                                        <button
                                            key={q.id}
                                            onClick={() => onQuestionClick(q.id)}
                                            className={cn(
                                                'w-6 h-6 sm:w-7 sm:h-7 text-xs font-medium rounded transition-all shrink-0',
                                                q.isAnswered
                                                    ? 'bg-gray-700 dark:bg-gray-600 text-white'
                                                    : 'bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600',
                                                activeQuestionId === q.id && 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-900'
                                            )}
                                        >
                                            {q.order}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </nav>
    );
}
