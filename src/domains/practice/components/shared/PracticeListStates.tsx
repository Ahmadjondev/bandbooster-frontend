'use client';

/**
 * PracticeListStates - Reusable loading, error, and empty state components
 * Provides consistent state displays across practice list pages
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { SectionType } from '@/domains/practice/models/domain';
import { sectionThemes } from './PracticePageHeader';

// Loading Skeleton
interface LoadingSkeletonProps {
    readonly count?: number;
}

export function PracticeListSkeleton({ count = 6 }: LoadingSkeletonProps) {
    return (
        <div className="space-y-3 sm:space-y-4" role="status" aria-label="Loading tests">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        'bg-white dark:bg-neutral-900 rounded-xl',
                        'border border-neutral-200 dark:border-neutral-800',
                        'p-4 sm:p-5 animate-pulse'
                    )}
                >
                    <div className="flex items-start gap-3 sm:gap-4">
                        {/* Icon skeleton */}
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-neutral-200 dark:bg-neutral-700 rounded-xl shrink-0" />

                        {/* Content skeleton */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-5 sm:h-6 w-2/3 bg-neutral-200 dark:bg-neutral-700 rounded" />
                                <div className="h-5 w-16 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                            </div>
                            <div className="h-4 w-1/2 bg-neutral-200 dark:bg-neutral-700 rounded mb-3" />
                            <div className="flex gap-4">
                                <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
                                <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded" />
                            </div>
                        </div>

                        {/* Button skeleton */}
                        <div className="w-20 h-9 bg-neutral-200 dark:bg-neutral-700 rounded-lg shrink-0" />
                    </div>
                </div>
            ))}
            <span className="sr-only">Loading practice tests...</span>
        </div>
    );
}

// Error State
interface ErrorStateProps {
    readonly message?: string;
    readonly onRetry?: () => void;
}

export function PracticeListError({ message, onRetry }: ErrorStateProps) {
    return (
        <div className="text-center py-12 sm:py-16" role="alert">
            <div
                className={cn(
                    'w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4',
                    'rounded-full bg-red-100 dark:bg-red-900/30',
                    'flex items-center justify-center'
                )}
            >
                <span className="text-2xl" role="img" aria-label="Warning">
                    ⚠️
                </span>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                Failed to Load Tests
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 max-w-sm mx-auto">
                {message || 'Something went wrong while loading the tests. Please try again.'}
            </p>
            {onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className={cn(
                        'px-4 py-2 bg-primary-600 text-white rounded-lg',
                        'hover:bg-primary-700 active:scale-95',
                        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                        'transition-all duration-150 text-sm font-medium'
                    )}
                >
                    Try Again
                </button>
            )}
        </div>
    );
}

// Empty State
interface EmptyStateProps {
    readonly sectionType: SectionType;
    readonly hasFilters: boolean;
    readonly onClearFilters?: () => void;
}

export function PracticeListEmpty({
    sectionType,
    hasFilters,
    onClearFilters,
}: EmptyStateProps) {
    const theme = sectionThemes[sectionType];
    const Icon = theme.icon;

    const sectionLabels: Record<SectionType, string> = {
        LISTENING: 'listening',
        READING: 'reading',
        WRITING: 'writing',
        SPEAKING: 'speaking',
    };

    return (
        <div className="text-center py-12 sm:py-16">
            <div
                className={cn(
                    'w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4',
                    'rounded-full bg-neutral-100 dark:bg-neutral-800',
                    'flex items-center justify-center'
                )}
            >
                <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-neutral-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                No Tests Found
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 max-w-sm mx-auto">
                {hasFilters
                    ? 'No tests match your current filters. Try adjusting them.'
                    : `No ${sectionLabels[sectionType]} tests available yet. Check back soon!`}
            </p>
            {hasFilters && onClearFilters && (
                <button
                    type="button"
                    onClick={onClearFilters}
                    className={cn(
                        'px-4 py-2 bg-primary-600 text-white rounded-lg',
                        'hover:bg-primary-700 active:scale-95',
                        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                        'transition-all duration-150 text-sm font-medium'
                    )}
                >
                    Clear Filters
                </button>
            )}
        </div>
    );
}
