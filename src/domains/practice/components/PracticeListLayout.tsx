'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { DifficultyLevel, SectionType } from '@/domains/practice/models/domain';
import { useState, useCallback, useMemo } from 'react';

// Icons
const icons = {
  filter: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ),
  grid: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  ),
  list: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" x2="21" y1="6" y2="6" />
      <line x1="8" x2="21" y1="12" y2="12" />
      <line x1="8" x2="21" y1="18" y2="18" />
      <line x1="3" x2="3.01" y1="6" y2="6" />
      <line x1="3" x2="3.01" y1="12" y2="12" />
      <line x1="3" x2="3.01" y1="18" y2="18" />
    </svg>
  ),
  chevronLeft: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  ),
  chevronRight: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
  x: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  ),
  search: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  book: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  headphones: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
    </svg>
  ),
};

export const sectionConfig: Record<SectionType, {
  icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
  title: string;
  subtitle: string;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  READING: {
    icon: icons.book,
    title: 'Reading Practice',
    subtitle: 'Improve your reading comprehension with real IELTS passages',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
  },
  LISTENING: {
    icon: icons.headphones,
    title: 'Listening Practice',
    subtitle: 'Sharpen your listening skills with authentic audio materials',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  WRITING: {
    icon: icons.book,
    title: 'Writing Practice',
    subtitle: 'Master your writing skills',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
  SPEAKING: {
    icon: icons.book,
    title: 'Speaking Practice',
    subtitle: 'Practice your speaking skills',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    borderColor: 'border-orange-200 dark:border-orange-800',
  },
};

export interface FilterState {
  difficulty: DifficultyLevel | null;
  partNumber?: number | null;
  passageNumber?: number | null;
  search: string;
}

interface PracticeListHeaderProps {
  sectionType: SectionType;
  totalCount: number;
  isLoading: boolean;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  showPartFilter?: boolean;
  showPassageFilter?: boolean;
  maxParts?: number;
  maxPassages?: number;
}

const difficulties: DifficultyLevel[] = ['EASY', 'MEDIUM', 'HARD', 'EXPERT'];

const difficultyLabels: Record<DifficultyLevel, { label: string; color: string }> = {
  EASY: { label: 'Easy', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  MEDIUM: { label: 'Medium', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  HARD: { label: 'Hard', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  EXPERT: { label: 'Expert', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
};

export function PracticeListHeader({
  sectionType,
  totalCount,
  isLoading,
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
  showPartFilter,
  showPassageFilter,
  maxParts = 4,
  maxPassages = 3,
}: PracticeListHeaderProps) {
  const config = sectionConfig[sectionType];
  const [showFilters, setShowFilters] = useState(false);
  const IconComponent = config.icon;

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.difficulty) count++;
    if (filters.partNumber) count++;
    if (filters.passageNumber) count++;
    if (filters.search) count++;
    return count;
  }, [filters]);

  const clearFilters = useCallback(() => {
    onFilterChange({
      difficulty: null,
      partNumber: null,
      passageNumber: null,
      search: '',
    });
  }, [onFilterChange]);

  return (
    <div className="mb-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'relative overflow-hidden rounded-2xl p-6 md:p-8 mb-6',
          config.bgColor,
          'border',
          config.borderColor
        )}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative flex items-start md:items-center justify-between flex-col md:flex-row gap-4">
          <div className="flex items-center gap-4">
            <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center', 'bg-white dark:bg-neutral-800 ')}>
              <IconComponent className={cn('w-7 h-7', config.color)} />
            </div>
            <div>
              <h1 className={cn('text-2xl font-bold', config.color)}>{config.title}</h1>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-0.5">{config.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className={cn('text-2xl font-bold', config.color)}>
                {isLoading ? '—' : totalCount}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">practice tests</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between"
      >
        {/* Search & Filters */}
        <div className="flex items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search practices..."
              value={filters.search}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              className={cn(
                'w-full pl-9 pr-4 py-2.5 rounded-xl text-sm',
                'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800',
                'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
                'placeholder:text-neutral-400'
              )}
            />
          </div>

          {/* Filter Toggle */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
              showFilters
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800'
            )}
          >
            <icons.filter className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </motion.button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
          <button
            onClick={() => onViewModeChange('grid')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              viewMode === 'grid'
                ? 'bg-white dark:bg-neutral-700  text-primary-600 dark:text-primary-400'
                : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            )}
          >
            <icons.grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={cn(
              'p-2 rounded-lg transition-colors',
              viewMode === 'list'
                ? 'bg-white dark:bg-neutral-700  text-primary-600 dark:text-primary-400'
                : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            )}
          >
            <icons.list className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 flex flex-wrap gap-4 items-center">
              {/* Difficulty Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-500 dark:text-neutral-400">Difficulty:</span>
                <div className="flex gap-1">
                  {difficulties.map((diff) => (
                    <button
                      key={diff}
                      onClick={() => onFilterChange({
                        ...filters,
                        difficulty: filters.difficulty === diff ? null : diff,
                      })}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                        filters.difficulty === diff
                          ? difficultyLabels[diff].color
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                      )}
                    >
                      {difficultyLabels[diff].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Part Filter (for Listening) */}
              {showPartFilter && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">Part:</span>
                  <div className="flex gap-1">
                    {Array.from({ length: maxParts }, (_, i) => i + 1).map((part) => (
                      <button
                        key={part}
                        onClick={() => onFilterChange({
                          ...filters,
                          partNumber: filters.partNumber === part ? null : part,
                        })}
                        className={cn(
                          'w-8 h-8 rounded-lg text-xs font-medium transition-all',
                          filters.partNumber === part
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                        )}
                      >
                        {part}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Passage Filter (for Reading) */}
              {showPassageFilter && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">Passage:</span>
                  <div className="flex gap-1">
                    {Array.from({ length: maxPassages }, (_, i) => i + 1).map((passage) => (
                      <button
                        key={passage}
                        onClick={() => onFilterChange({
                          ...filters,
                          passageNumber: filters.passageNumber === passage ? null : passage,
                        })}
                        className={cn(
                          'w-8 h-8 rounded-lg text-xs font-medium transition-all',
                          filters.passageNumber === passage
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                        )}
                      >
                        {passage}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  <icons.x className="w-3.5 h-3.5" />
                  Clear all
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Pagination Component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function Pagination({ currentPage, totalPages, onPageChange, isLoading }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = useMemo(() => {
    const result: (number | 'ellipsis')[] = [];
    const showPages = 5;

    if (totalPages <= showPages + 2) {
      for (let i = 1; i <= totalPages; i++) result.push(i);
    } else {
      result.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        end = Math.min(showPages, totalPages - 1);
      } else if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - showPages + 1);
      }

      if (start > 2) result.push('ellipsis');
      for (let i = start; i <= end; i++) result.push(i);
      if (end < totalPages - 1) result.push('ellipsis');

      result.push(totalPages);
    }

    return result;
  }, [currentPage, totalPages]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center gap-2 mt-8"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className={cn(
          'p-2 rounded-lg transition-colors',
          currentPage === 1 || isLoading
            ? 'text-neutral-300 dark:text-neutral-600 cursor-not-allowed'
            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
        )}
      >
        <icons.chevronLeft className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-1">
        {pages.map((page, index) =>
          page === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-neutral-400">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              disabled={isLoading}
              className={cn(
                'w-10 h-10 rounded-lg text-sm font-medium transition-colors',
                page === currentPage
                  ? 'bg-primary-600 text-white'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              )}
            >
              {page}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        className={cn(
          'p-2 rounded-lg transition-colors',
          currentPage === totalPages || isLoading
            ? 'text-neutral-300 dark:text-neutral-600 cursor-not-allowed'
            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
        )}
      >
        <icons.chevronRight className="w-5 h-5" />
      </button>
    </motion.div>
  );
}

// Empty State Component
interface EmptyStateProps {
  sectionType: SectionType;
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function EmptyState({ sectionType, hasFilters, onClearFilters }: EmptyStateProps) {
  const config = sectionConfig[sectionType];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16"
    >
      <div className={cn('w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center', config.bgColor)}>
        <config.icon className={cn('w-10 h-10', config.color)} />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
        No practices found
      </h3>
      <p className="text-neutral-500 dark:text-neutral-400 mb-4 max-w-md mx-auto">
        {hasFilters
          ? "We couldn't find any practices matching your filters. Try adjusting your search criteria."
          : "There are no practice tests available in this section yet. Check back soon!"}
      </p>
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
        >
          Clear all filters
        </button>
      )}
    </motion.div>
  );
}
