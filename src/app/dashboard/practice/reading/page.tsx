'use client';

/**
 * Reading Practice Page
 * Clean, mobile-first practice list using shared components
 */

import { useState, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { usePracticesBySection } from '@/domains/practice/queries/practice.queries';
import type { DifficultyLevel, TestType } from '@/domains/practice/models/domain';
import {
  PracticePageHeader,
  PracticeFilters,
  PracticeTestCard,
  PracticeListSkeleton,
  PracticeListError,
  PracticeListEmpty,
  Pagination,
  ResultsSummary,
  type FilterState,
  type StatCard,
} from '@/domains/practice/components/shared';

const ITEMS_PER_PAGE = 12;

export default function ReadingPracticePage() {
  // Filter state
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    difficulty: null,
    testType: null,
    segmentNumber: null,
    search: '',
  });

  // Build query params from filter state
  const queryParams = useMemo(() => ({
    page,
    pageSize: ITEMS_PER_PAGE,
    difficulty: filters.difficulty ?? undefined,
    passageNumber: filters.segmentNumber ?? undefined,
    testType: filters.testType ?? undefined,
    search: filters.search || undefined,
  }), [page, filters]);

  // Fetch data
  const { data, isLoading, isError, error } = usePracticesBySection('READING', queryParams);

  // Extract data with defaults
  const practices = data?.practices ?? [];
  const totalCount = data?.pagination?.totalCount ?? 0;
  const totalPages = data?.pagination?.totalPages ?? 1;
  const availableFilters = data?.availableFilters;
  const stats = data?.stats;

  // Handler for filter changes - reset page to 1
  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      difficulty: null,
      testType: null,
      segmentNumber: null,
      search: '',
    });
    setPage(1);
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => (
    filters.difficulty !== null ||
    filters.testType !== null ||
    filters.segmentNumber !== null ||
    filters.search.length > 0
  ), [filters]);

  // Build stats array for header
  const headerStats: readonly StatCard[] = useMemo(() => [
    { value: totalCount, label: 'Total Tests' },
    { value: stats?.totalAttempts ?? 0, label: 'Attempts', highlight: true },
    { value: stats?.averageScore ? stats.averageScore.toFixed(1) : '—', label: 'Avg Score', color: 'text-blue-600 dark:text-blue-400' },
    { value: stats?.bestScore ? stats.bestScore.toFixed(1) : '—', label: 'Best Score', color: 'text-amber-600 dark:text-amber-400' },
  ], [totalCount, stats]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Page Header with Stats */}
      <PracticePageHeader
        sectionType="READING"
        stats={headerStats}
      />

      {/* Filter Bar */}
      <PracticeFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        availableFilters={{
          difficulties: availableFilters?.difficulties,
          passageNumbers: availableFilters?.passageNumbers,
        }}
        segmentLabel="Passage"
        searchPlaceholder="Search reading tests..."
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Loading State */}
        {isLoading && <PracticeListSkeleton count={6} />}

        {/* Error State */}
        {isError && (
          <PracticeListError
            message={error instanceof Error ? error.message : undefined}
            onRetry={() => window.location.reload()}
          />
        )}

        {/* Empty State */}
        {!isLoading && !isError && practices.length === 0 && (
          <PracticeListEmpty
            sectionType="READING"
            hasFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        )}

        {/* Practice List */}
        {!isLoading && !isError && practices.length > 0 && (
          <>
            <div className="space-y-3 sm:space-y-4">
              <AnimatePresence mode="popLayout">
                {practices.map((practice, index) => (
                  <PracticeTestCard
                    key={practice.uuid}
                    uuid={practice.uuid}
                    title={practice.title}
                    description={practice.description}
                    sectionType="READING"
                    testType={practice.testType}
                    difficulty={practice.difficulty}
                    durationMinutes={practice.durationMinutes}
                    totalQuestions={practice.totalQuestions || 13}
                    attemptsCount={practice.attemptsCount}
                    bestScore={practice.bestScore}
                    lastAttemptUuid={practice.lastAttempt}
                    segmentNumber={practice.readingPassageNumber}
                    segmentLabel="Passage"
                    animationDelay={index * 0.03}
                    href={`/practice/reading/${practice.uuid}`}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            <div className="mt-6 sm:mt-8 space-y-3">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
              <ResultsSummary
                currentPage={page}
                pageSize={ITEMS_PER_PAGE}
                totalCount={totalCount}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
