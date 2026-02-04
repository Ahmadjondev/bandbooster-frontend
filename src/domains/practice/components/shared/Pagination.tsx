'use client';

/**
 * Pagination - Reusable pagination component for list pages
 * Provides consistent pagination UI with page numbers and navigation
 */

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icons';

interface PaginationProps {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly onPageChange: (page: number) => void;
    readonly maxVisiblePages?: number;
    readonly className?: string;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    maxVisiblePages = 5,
    className,
}: PaginationProps) {
    // Calculate visible page numbers
    const pageNumbers = useMemo(() => {
        const pages: number[] = [];

        if (totalPages <= maxVisiblePages) {
            // Show all pages if total is within limit
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else if (currentPage <= Math.ceil(maxVisiblePages / 2)) {
            // Near start
            for (let i = 1; i <= maxVisiblePages; i++) {
                pages.push(i);
            }
        } else if (currentPage >= totalPages - Math.floor(maxVisiblePages / 2)) {
            // Near end
            for (let i = totalPages - maxVisiblePages + 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Middle
            const half = Math.floor(maxVisiblePages / 2);
            for (let i = currentPage - half; i <= currentPage + half; i++) {
                pages.push(i);
            }
        }

        return pages;
    }, [currentPage, totalPages, maxVisiblePages]);

    if (totalPages <= 1) return null;

    return (
        <nav
            className={cn('flex items-center justify-center gap-1 sm:gap-2', className)}
            aria-label="Pagination"
        >
            {/* Previous Button */}
            <button
                type="button"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={cn(
                    'p-1.5 sm:p-2 rounded-lg transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
                    currentPage === 1
                        ? 'text-neutral-300 dark:text-neutral-600 cursor-not-allowed'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                )}
                aria-label="Previous page"
            >
                <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-0.5 sm:gap-1">
                {pageNumbers.map((pageNum) => (
                    <button
                        key={pageNum}
                        type="button"
                        onClick={() => onPageChange(pageNum)}
                        className={cn(
                            'w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-colors',
                            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
                            currentPage === pageNum
                                ? 'bg-primary-600 text-white'
                                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        )}
                        aria-label={`Page ${pageNum}`}
                        aria-current={currentPage === pageNum ? 'page' : undefined}
                    >
                        {pageNum}
                    </button>
                ))}
            </div>

            {/* Next Button */}
            <button
                type="button"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={cn(
                    'p-1.5 sm:p-2 rounded-lg transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
                    currentPage === totalPages
                        ? 'text-neutral-300 dark:text-neutral-600 cursor-not-allowed'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                )}
                aria-label="Next page"
            >
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
        </nav>
    );
}

// Results summary component
interface ResultsSummaryProps {
    readonly currentPage: number;
    readonly pageSize: number;
    readonly totalCount: number;
    readonly className?: string;
}

export function ResultsSummary({
    currentPage,
    pageSize,
    totalCount,
    className,
}: ResultsSummaryProps) {
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalCount);

    return (
        <p className={cn('text-center text-xs sm:text-sm text-neutral-500 dark:text-neutral-400', className)}>
            Showing {start} – {end} of {totalCount} tests
        </p>
    );
}
