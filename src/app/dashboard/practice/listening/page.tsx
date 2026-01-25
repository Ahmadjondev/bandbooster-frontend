'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePracticesBySection } from '@/domains/practice/queries/practice.queries';
import type { DifficultyLevel } from '@/domains/practice/models/domain';
import { cn } from '@/lib/utils';

// Icons as inline components for better performance
const HeadphonesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
  </svg>
);

const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const QuestionsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </svg>
);

const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const TrophyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const ITEMS_PER_PAGE = 12;

const difficultyConfig: Record<string, { label: string; color: string }> = {
  EASY: { label: 'Band 4-5', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  MEDIUM: { label: 'Band 5.5-6.5', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  HARD: { label: 'Band 7-8', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  EXPERT: { label: 'Band 8-9', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export default function ListeningPracticePage() {
  const [page, setPage] = useState(1);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | null>(null);
  const [selectedPart, setSelectedPart] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const queryParams = useMemo(() => ({
    page,
    pageSize: ITEMS_PER_PAGE,
    difficulty: selectedDifficulty ?? undefined,
    partNumber: selectedPart ?? undefined,
    search: searchQuery || undefined,
  }), [page, selectedDifficulty, selectedPart, searchQuery]);

  const { data, isLoading, isError, error } = usePracticesBySection('LISTENING', queryParams);

  const practices = data?.practices ?? [];
  const totalCount = data?.pagination?.totalCount ?? 0;
  const totalPages = data?.pagination?.totalPages ?? 1;
  const availableFilters = data?.availableFilters;

  const handleFilterChange = useCallback((type: 'difficulty' | 'part', value: DifficultyLevel | number | null) => {
    if (type === 'difficulty') {
      setSelectedDifficulty(value as DifficultyLevel | null);
    } else {
      setSelectedPart(value as number | null);
    }
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedDifficulty(null);
    setSelectedPart(null);
    setSearchQuery('');
    setPage(1);
  }, []);

  const hasActiveFilters = selectedDifficulty || selectedPart || searchQuery;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <HeadphonesIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                IELTS Listening Practice
              </h1>
              <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                Practice with real Cambridge IELTS-style listening tests
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4">
              <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                {totalCount}
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">Total Tests</div>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {data?.stats?.totalAttempts ?? 0}
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">Attempts</div>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {data?.stats?.averageScore ? `${Math.round(data.stats.averageScore)}%` : '—'}
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">Avg Score</div>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {data?.stats?.bestScore ? `${Math.round(data.stats.bestScore)}%` : '—'}
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">Best Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-50 max-w-xs">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search tests..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 rounded-lg text-sm bg-neutral-100 dark:bg-neutral-800 border-0 focus:ring-2 focus:ring-primary-500 text-neutral-900 dark:text-white placeholder:text-neutral-400"
              />
            </div>

            {/* Difficulty Filter */}
            {availableFilters?.difficulties && availableFilters.difficulties.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">Difficulty:</span>
                <div className="flex gap-1">
                  {availableFilters.difficulties.map((diff) => (
                    <button
                      key={diff.value}
                      onClick={() => handleFilterChange('difficulty', selectedDifficulty === diff.value ? null : diff.value)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                        selectedDifficulty === diff.value
                          ? 'bg-primary-600 text-white'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                      )}
                    >
                      {diff.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Part Filter */}
            {availableFilters?.partNumbers && availableFilters.partNumbers.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">Part:</span>
                <div className="flex gap-1">
                  {availableFilters.partNumbers.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => handleFilterChange('part', selectedPart === p.value ? null : p.value)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                        selectedPart === p.value
                          ? 'bg-primary-600 text-white'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
                  <div className="flex-1">
                    <div className="h-5 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded mb-2" />
                    <div className="h-4 w-1/2 bg-neutral-200 dark:bg-neutral-700 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
              Failed to Load Tests
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">
              {error instanceof Error ? error.message : 'Something went wrong'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && practices.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <HeadphonesIcon className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
              No Tests Found
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-4">
              {hasActiveFilters ? 'Try adjusting your filters' : 'No listening tests available yet'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Practice List */}
        {!isLoading && !isError && practices.length > 0 && (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {practices.map((practice, index) => {
                const diffConfig = difficultyConfig[practice.difficulty] || difficultyConfig.MEDIUM;
                const isCompleted = practice.attemptsCount > 0;

                return (
                  <motion.div
                    key={practice.uuid}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/practice/listening/${practice.uuid}`}>
                      <div className={cn(
                        'bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800',
                        'hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-lg',
                        'transition-all duration-200 cursor-pointer group'
                      )}>
                        <div className="p-6">
                          <div className="flex items-start gap-4">
                            {/* Part Number/Icon */}
                            <div className={cn(
                              'w-16 h-16 rounded-xl flex flex-col items-center justify-center shrink-0',
                              isCompleted
                                ? 'bg-blue-100 dark:bg-blue-900/30'
                                : 'bg-neutral-100 dark:bg-neutral-800'
                            )}>
                              {isCompleted ? (
                                <CheckIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                              ) : (
                                <>
                                  <span className="text-xs text-neutral-500 dark:text-neutral-400">Part</span>
                                  <span className="text-xl font-bold text-neutral-900 dark:text-white">
                                    {practice.listeningPartNumber || '—'}
                                  </span>
                                </>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                                    {practice.title}
                                  </h3>
                                  {practice.description && (
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-1">
                                      {practice.description}
                                    </p>
                                  )}
                                </div>

                                {/* Difficulty Badge */}
                                <span className={cn(
                                  'px-3 py-1 rounded-full text-xs font-medium shrink-0',
                                  diffConfig.color
                                )}>
                                  {diffConfig.label}
                                </span>
                              </div>

                              {/* Meta Info */}
                              <div className="flex items-center gap-6 mt-4">
                                <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                                  <ClockIcon className="w-4 h-4" />
                                  <span>{practice.durationMinutes} mins</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                                  <QuestionsIcon className="w-4 h-4" />
                                  <span>{practice.totalQuestions || 10} questions</span>
                                </div>
                                {practice.attemptsCount > 0 && (
                                  <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                                    <TrophyIcon className="w-4 h-4" />
                                    <span>Best: {practice.bestScore}%</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Action Button */}
                            <div className="shrink-0">
                              <div className={cn(
                                'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
                                isCompleted
                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                  : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 group-hover:bg-primary-600 group-hover:text-white'
                              )}>
                                <PlayIcon className="w-5 h-5" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className={cn(
                'p-2 rounded-lg transition-colors',
                page === 1
                  ? 'text-neutral-300 dark:text-neutral-600 cursor-not-allowed'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              )}
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={cn(
                      'w-10 h-10 rounded-lg text-sm font-medium transition-colors',
                      page === pageNum
                        ? 'bg-primary-600 text-white'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={cn(
                'p-2 rounded-lg transition-colors',
                page === totalPages
                  ? 'text-neutral-300 dark:text-neutral-600 cursor-not-allowed'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              )}
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Results Summary */}
        {!isLoading && practices.length > 0 && (
          <div className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-4">
            Showing {(page - 1) * ITEMS_PER_PAGE + 1} - {Math.min(page * ITEMS_PER_PAGE, totalCount)} of {totalCount} tests
          </div>
        )}
      </div>
    </div>
  );
}
