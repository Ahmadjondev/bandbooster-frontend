'use client';

/**
 * PracticeFilters - Reusable filter bar component for practice list pages
 * Provides search, difficulty, test type, and segment filters
 */

import { useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { SearchIcon, XIcon } from '@/components/ui/icons';
import type { DifficultyLevel, TestType, FilterOption } from '@/domains/practice/models/domain';

// Filter chip component
interface FilterChipProps {
    readonly label: string;
    readonly isActive: boolean;
    readonly onClick: () => void;
}

function FilterChip({ label, isActive, onClick }: FilterChipProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
                'active:scale-95',
                isActive
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            )}
        >
            {label}
        </button>
    );
}

// Filter group with label
interface FilterGroupProps {
    readonly label: string;
    readonly children: React.ReactNode;
    readonly className?: string;
}

function FilterGroup({ label, children, className }: FilterGroupProps) {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            <span className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                {label}:
            </span>
            <div className="flex gap-1 flex-wrap">
                {children}
            </div>
        </div>
    );
}

// Available filter options
export interface AvailableFilters {
    readonly difficulties?: readonly FilterOption<DifficultyLevel>[];
    readonly partNumbers?: readonly FilterOption<number>[];
    readonly passageNumbers?: readonly FilterOption<number>[];
}

// Filter state
export interface FilterState {
    readonly difficulty: DifficultyLevel | null;
    readonly testType: TestType | null;
    readonly segmentNumber: number | null; // Generic for part/passage number
    readonly search: string;
}

interface PracticeFiltersProps {
    readonly filters: FilterState;
    readonly onFiltersChange: (filters: FilterState) => void;
    readonly availableFilters?: AvailableFilters;
    readonly segmentLabel?: 'Part' | 'Passage'; // Listening uses Part, Reading uses Passage
    readonly searchPlaceholder?: string;
    readonly className?: string;
}

export function PracticeFilters({
    filters,
    onFiltersChange,
    availableFilters,
    segmentLabel = 'Part',
    searchPlaceholder = 'Search tests...',
    className,
}: PracticeFiltersProps) {
    // Compute active filter count for clear button
    const hasActiveFilters = useMemo(() => {
        return (
            filters.difficulty !== null ||
            filters.testType !== null ||
            filters.segmentNumber !== null ||
            filters.search.length > 0
        );
    }, [filters]);

    // Filter change handlers
    const handleSearchChange = useCallback((value: string) => {
        onFiltersChange({ ...filters, search: value });
    }, [filters, onFiltersChange]);

    const handleDifficultyChange = useCallback((value: DifficultyLevel | null) => {
        onFiltersChange({ ...filters, difficulty: value });
    }, [filters, onFiltersChange]);

    const handleTestTypeChange = useCallback((value: TestType | null) => {
        // Clear segment filter when selecting full test
        const newSegmentNumber = value === 'FULL_TEST' ? null : filters.segmentNumber;
        onFiltersChange({ ...filters, testType: value, segmentNumber: newSegmentNumber });
    }, [filters, onFiltersChange]);

    const handleSegmentChange = useCallback((value: number | null) => {
        // Clear full test filter when selecting a segment
        const newTestType = value !== null ? null : filters.testType;
        onFiltersChange({ ...filters, segmentNumber: value, testType: newTestType });
    }, [filters, onFiltersChange]);

    const handleClearFilters = useCallback(() => {
        onFiltersChange({
            difficulty: null,
            testType: null,
            segmentNumber: null,
            search: '',
        });
    }, [onFiltersChange]);

    // Get segment numbers based on section type
    const segmentNumbers = segmentLabel === 'Passage'
        ? availableFilters?.passageNumbers
        : availableFilters?.partNumbers;

    return (
        <div className={cn(
            'bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800',
            'sticky top-0 z-10',
            className
        )}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-45 max-w-xs">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={filters.search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className={cn(
                                'w-full pl-9 pr-4 py-2 rounded-lg text-sm',
                                'bg-neutral-100 dark:bg-neutral-800 border-0',
                                'focus:ring-2 focus:ring-primary-500 focus:outline-none',
                                'text-neutral-900 dark:text-white placeholder:text-neutral-400',
                                'transition-shadow duration-150'
                            )}
                        />
                    </div>

                    {/* Difficulty Filter */}
                    {availableFilters?.difficulties && availableFilters.difficulties.length > 0 && (
                        <FilterGroup label="Difficulty" className="hidden sm:flex">
                            {availableFilters.difficulties.map((diff) => (
                                <FilterChip
                                    key={diff.value}
                                    label={diff.label}
                                    isActive={filters.difficulty === diff.value}
                                    onClick={() => handleDifficultyChange(
                                        filters.difficulty === diff.value ? null : diff.value
                                    )}
                                />
                            ))}
                        </FilterGroup>
                    )}

                    {/* Test Type Filter */}
                    <FilterGroup label="Type">
                        <FilterChip
                            label="Full Test"
                            isActive={filters.testType === 'FULL_TEST'}
                            onClick={() => handleTestTypeChange(
                                filters.testType === 'FULL_TEST' ? null : 'FULL_TEST'
                            )}
                        />
                        <FilterChip
                            label="Section"
                            isActive={filters.testType === 'SECTION_PRACTICE'}
                            onClick={() => handleTestTypeChange(
                                filters.testType === 'SECTION_PRACTICE' ? null : 'SECTION_PRACTICE'
                            )}
                        />
                    </FilterGroup>

                    {/* Segment (Part/Passage) Filter - Hidden when Full Test selected */}
                    {filters.testType !== 'FULL_TEST' && segmentNumbers && segmentNumbers.length > 0 && (
                        <FilterGroup label={segmentLabel} className="hidden md:flex">
                            {segmentNumbers.map((segment) => (
                                <FilterChip
                                    key={segment.value}
                                    label={segment.label}
                                    isActive={filters.segmentNumber === segment.value}
                                    onClick={() => handleSegmentChange(
                                        filters.segmentNumber === segment.value ? null : segment.value
                                    )}
                                />
                            ))}
                        </FilterGroup>
                    )}

                    {/* Clear Filters Button */}
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={handleClearFilters}
                            className={cn(
                                'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium',
                                'text-red-600 dark:text-red-400',
                                'hover:bg-red-50 dark:hover:bg-red-900/20',
                                'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1',
                                'transition-colors duration-150'
                            )}
                        >
                            <XIcon className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Clear All</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
