/**
 * Navigation Controls Component
 * Prev/Next buttons positioned above the bottom navigation
 * Right-aligned for clean layout
 */

'use client';

import { cn } from '@/lib/utils';

// Icons
const ChevronLeftIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m15 18-6-6 6-6" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 18 6-6-6-6" />
    </svg>
);

export interface NavigationControlsProps {
    /** Callback for previous question */
    onPrev: () => void;
    /** Callback for next question */
    onNext: () => void;
    /** Can go to previous question */
    canGoPrev: boolean;
    /** Can go to next question */
    canGoNext: boolean;
}

export function NavigationControls({
    onPrev,
    onNext,
    canGoPrev,
    canGoNext,
}: NavigationControlsProps) {
    return (
        /* Navigation Bar - positioned above bottom nav (bottom-14), right-aligned */
        <div className="fixed bottom-14 right-0 h-12 flex items-center justify-end px-4 z-30">
            {/* Prev Button */}
            <button
                onClick={onPrev}
                disabled={!canGoPrev}
                aria-label="Previous question"
                className={cn(
                    'h-9 py-4 mr-2 px-2 flex items-center font-medium text-sm transition-colors rounded',
                    canGoPrev
                        ? 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600 border border-gray-200 dark:border-gray-600 shadow-sm'
                        : 'bg-gray-100 dark:bg-slate-800/50 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                )}
            >
                <ChevronLeftIcon />
            </button>

            {/* Next Button */}
            <button
                onClick={onNext}
                disabled={!canGoNext}
                aria-label="Next question"
                className={cn(
                    'h-9 py-4 px-2 flex items-center font-medium text-sm transition-colors rounded',
                    canGoNext
                        ? 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600 border border-gray-200 dark:border-gray-600 shadow-sm'
                        : 'bg-gray-100 dark:bg-slate-800/50 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                )}
            >
                <ChevronRightIcon />
            </button>
        </div>
    );
}
