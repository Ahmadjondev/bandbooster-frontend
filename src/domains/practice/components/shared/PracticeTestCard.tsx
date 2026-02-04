'use client';

/**
 * PracticeTestCard - Unified card component for practice test items
 * Used across Listening, Reading, and future exam modes
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    ClockIcon,
    QuestionsIcon,
    TrophyIcon,
    ChartIcon,
    PlayIcon,
    CheckIcon,
    RetryIcon,
} from '@/components/ui/icons';
import type { DifficultyLevel, SectionType, TestType } from '@/domains/practice/models/domain';

// Difficulty configuration with band labels
export const difficultyConfig: Record<DifficultyLevel, { label: string; color: string }> = {
    EASY: {
        label: 'Band 4-5',
        color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    },
    MEDIUM: {
        label: 'Band 5.5-6.5',
        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    HARD: {
        label: 'Band 7-8',
        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    },
    EXPERT: {
        label: 'Band 8-9',
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    },
};

// Section-specific theming
const sectionAccentColors: Record<SectionType, {
    completed: string;
    fullTest: string;
}> = {
    LISTENING: {
        completed: 'bg-blue-100 dark:bg-blue-900/30',
        fullTest: 'bg-primary-100 dark:bg-primary-900/30',
    },
    READING: {
        completed: 'bg-emerald-100 dark:bg-emerald-900/30',
        fullTest: 'bg-primary-100 dark:bg-primary-900/30',
    },
    WRITING: {
        completed: 'bg-purple-100 dark:bg-purple-900/30',
        fullTest: 'bg-primary-100 dark:bg-primary-900/30',
    },
    SPEAKING: {
        completed: 'bg-orange-100 dark:bg-orange-900/30',
        fullTest: 'bg-primary-100 dark:bg-primary-900/30',
    },
};

const sectionCheckColors: Record<SectionType, string> = {
    LISTENING: 'text-blue-600 dark:text-blue-400',
    READING: 'text-emerald-600 dark:text-emerald-400',
    WRITING: 'text-purple-600 dark:text-purple-400',
    SPEAKING: 'text-orange-600 dark:text-orange-400',
};

export interface PracticeTestCardProps {
    readonly uuid: string;
    readonly title: string;
    readonly description?: string;
    readonly sectionType: SectionType;
    readonly testType: TestType;
    readonly difficulty: DifficultyLevel;
    readonly durationMinutes: number;
    readonly totalQuestions: number;
    readonly attemptsCount: number;
    readonly bestScore: number | null;
    readonly lastAttemptUuid?: string | null;
    readonly segmentNumber?: number | null; // Part for Listening, Passage for Reading
    readonly segmentLabel?: 'Part' | 'Passage';
    readonly animationDelay?: number;
    readonly href: string;
}

export function PracticeTestCard({
    uuid,
    title,
    description,
    sectionType,
    testType,
    difficulty,
    durationMinutes,
    totalQuestions,
    attemptsCount,
    bestScore,
    lastAttemptUuid,
    segmentNumber,
    segmentLabel = 'Part',
    animationDelay = 0,
    href,
}: PracticeTestCardProps) {
    const diffConfig = difficultyConfig[difficulty] || difficultyConfig.MEDIUM;
    const isCompleted = attemptsCount > 0;
    const isFullTest = testType === 'FULL_TEST';
    const accentColors = sectionAccentColors[sectionType];
    const checkColor = sectionCheckColors[sectionType];

    return (
        <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ delay: animationDelay, duration: 0.2 }}
            className="group"
        >
            <div
                className={cn(
                    'bg-white dark:bg-neutral-900 rounded-xl',
                    'border border-neutral-200 dark:border-neutral-800',
                    'hover:border-primary-300 dark:hover:border-primary-700',
                    'hover:shadow-lg dark:hover:shadow-neutral-900/50',
                    'transition-all duration-200'
                )}
            >
                <div className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                        {/* Segment Badge
                        <div
                            className={cn(
                                'w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex flex-col items-center justify-center shrink-0',
                                isFullTest
                                    ? accentColors.fullTest
                                    : isCompleted
                                        ? accentColors.completed
                                        : 'bg-neutral-100 dark:bg-neutral-800'
                            )}
                        >
                            {isFullTest ? (
                                <span className="text-xs sm:text-sm font-bold text-primary-600 dark:text-primary-400">
                                    FT
                                </span>
                            ) : isCompleted ? (
                                <CheckIcon className={cn('w-5 h-5 sm:w-6 sm:h-6', checkColor)} />
                            ) : (
                                <>
                                    <span className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-400">
                                        {segmentLabel}
                                    </span>
                                    <span className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-white">
                                        {segmentNumber || '—'}
                                    </span>
                                </>
                            )}
                        </div> */}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            {/* Title Row */}
                            <div className="flex items-start justify-between gap-2 sm:gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3
                                            className={cn(
                                                'text-base sm:text-lg font-semibold',
                                                'text-neutral-900 dark:text-white',
                                                'group-hover:text-primary-600 dark:group-hover:text-primary-400',
                                                'transition-colors truncate'
                                            )}
                                        >
                                            {title}
                                        </h3>

                                    </div>

                                    {/* Description */}
                                    {description && (
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-1">
                                            {description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Meta Info */}
                            <div className="mt-3 sm:mt-4">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-xs sm:text-sm">

                                    {/* Duration */}
                                    <div className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 
                    text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                        <ClockIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        <span>{durationMinutes} minutes</span>
                                    </div>

                                    {/* Questions */}
                                    <div className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 
                    text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                        <CheckIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        <span>{totalQuestions} questions</span>
                                    </div>

                                    {/* Divider */}
                                    <span className="hidden sm:inline-block h-4 w-px bg-neutral-300/60 dark:bg-neutral-700/60" />

                                    {/* Segment */}
                                    {isFullTest ? (
                                        <span
                                            className="rounded-full border border-neutral-200 px-2.5 py-1 
                     text-[10px] sm:text-xs text-neutral-500 
                     dark:border-neutral-700 dark:text-neutral-400"
                                        >
                                            Full Test
                                        </span>
                                    ) : (
                                        <span className="rounded-full border border-neutral-200 px-2.5 py-1 
                     text-[10px] sm:text-xs text-neutral-500 
                     dark:border-neutral-700 dark:text-neutral-400">
                                            {segmentLabel} {segmentNumber || "—"}
                                        </span>
                                    )}
 {/* Difficulty Badge */}
                                        <span
                                            className={cn(
                                                'px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium shrink-0',
                                                diffConfig.color
                                            )}
                                        >
                                            {diffConfig.label}
                                        </span>

                                    {/* Best Score */}
                                    {isCompleted && bestScore !== null && (
                                        <div
                                            className={cn(
                                                "flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium",
                                                checkColor,
                                                "bg-opacity-10"
                                            )}
                                        >
                                            <TrophyIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            <span>Best: {bestScore.toFixed(1)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Action Buttons */}
                        <div className="shrink-0 flex items-center gap-2">
                            {/* Last Result Button */}
                            {lastAttemptUuid && isCompleted && (
                                <Link
                                    href={`/practice/${lastAttemptUuid}/results`}
                                    onClick={(e) => e.stopPropagation()}
                                    className={cn(
                                        'w-9 h-9 sm:w-10 sm:h-10 rounded-lg',
                                        'flex items-center justify-center',
                                        'text-neutral-500 dark:text-neutral-400',
                                        'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                                        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
                                        'transition-colors'
                                    )}
                                    title="View last result"
                                    aria-label="View last result"
                                >
                                    <ChartIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                </Link>
                            )}

                            {/* Start/Retry Button */}
                            <Link
                                href={href}
                                className={cn(
                                    'flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg',
                                    'text-xs sm:text-sm font-medium',
                                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
                                    'transition-all duration-150 active:scale-95',
                                    isCompleted
                                        ? 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-600'
                                        : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'
                                )}
                            >
                                <span>{isCompleted ? 'Retry' : 'Start'}</span>
                                {isCompleted ? (
                                    <RetryIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                ) : (
                                    <PlayIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                )}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </motion.article>
    );
}
