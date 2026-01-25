'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { DifficultyLevel, SectionType } from '@/domains/practice/models/domain';

// Icons
const icons = {
  clock: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  ),
  questions: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  ),
  checkCircle: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  trophy: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  ),
  lock: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  play: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  ),
  arrowRight: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  ),
};

const difficultyColors: Record<DifficultyLevel, { bg: string; text: string; border: string }> = {
  EASY: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
  MEDIUM: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
  HARD: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800' },
  EXPERT: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
};

const sectionColors: Record<SectionType, { primary: string; light: string }> = {
  READING: { primary: 'text-emerald-600 dark:text-emerald-400', light: 'bg-emerald-100 dark:bg-emerald-900/30' },
  LISTENING: { primary: 'text-blue-600 dark:text-blue-400', light: 'bg-blue-100 dark:bg-blue-900/30' },
  WRITING: { primary: 'text-purple-600 dark:text-purple-400', light: 'bg-purple-100 dark:bg-purple-900/30' },
  SPEAKING: { primary: 'text-orange-600 dark:text-orange-400', light: 'bg-orange-100 dark:bg-orange-900/30' },
};

interface PracticeCardProps {
  uuid: string;
  title: string;
  description: string;
  sectionType: SectionType;
  difficulty: DifficultyLevel;
  durationMinutes: number;
  totalQuestions: number;
  isPremium: boolean;
  userHasAccess: boolean;
  bestScore?: number | null;
  attemptsCount?: number;
  readingPassageNumber?: number | null;
  listeningPartNumber?: number | null;
  onHover?: () => void;
}

export function PracticeCard({
  uuid,
  title,
  description,
  sectionType,
  difficulty,
  durationMinutes,
  totalQuestions,
  isPremium,
  userHasAccess,
  bestScore,
  attemptsCount = 0,
  readingPassageNumber,
  listeningPartNumber,
  onHover,
}: PracticeCardProps) {
  const difficultyStyle = difficultyColors[difficulty];
  const sectionColor = sectionColors[sectionType];
  const href = `/dashboard/practice/${sectionType.toLowerCase()}/${uuid}`;
  const isCompleted = attemptsCount > 0 && bestScore !== null;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onMouseEnter={onHover}
      className={cn(
        'relative bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden',
        'border border-neutral-200 dark:border-neutral-800',
        'shadow-sm hover:shadow-lg transition-shadow',
        'group'
      )}
    >
      {/* Top Accent */}
      <div className={cn('h-1', sectionColor.light)} />

      {/* Content */}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Difficulty Badge */}
            <span className={cn(
              'px-2 py-0.5 text-xs font-medium rounded-full',
              difficultyStyle.bg,
              difficultyStyle.text
            )}>
              {difficulty.toLowerCase()}
            </span>

            {/* Passage/Part Number */}
            {readingPassageNumber && (
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Passage {readingPassageNumber}
              </span>
            )}
            {listeningPartNumber && (
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                Part {listeningPartNumber}
              </span>
            )}
          </div>

          {/* Status Badges */}
          <div className="flex items-center gap-2">
            {isCompleted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
                title="Completed"
              >
                <icons.checkCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              </motion.div>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-1 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-4">
          {description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          <div className="flex items-center gap-1.5">
            <icons.clock className="w-4 h-4" />
            <span>{durationMinutes} min</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
            <span>{totalQuestions} questions</span>
          </div>
        </div>

        {/* Best Score & Attempts */}
        {(bestScore !== null && bestScore !== undefined) || attemptsCount > 0 ? (
          <div className="flex items-center justify-between py-3 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              {bestScore !== null && bestScore !== undefined && (
                <div className="flex items-center gap-1.5">
                  <icons.trophy className="w-4 h-4 text-amber-500" />
                  <span className={cn(
                    'text-sm font-medium',
                    bestScore >= 70 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                  )}>
                    {bestScore.toFixed(0)}%
                  </span>
                </div>
              )}
              {attemptsCount > 0 && (
                <span className="text-xs text-neutral-400">
                  {attemptsCount} attempt{attemptsCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        ) : null}

        {/* Action Button */}
        <Link href={href}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'w-full mt-2 py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2',
              isCompleted
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            )}
          >
            {isCompleted ? (
              <>
                Review
                <icons.arrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <icons.play className="w-4 h-4" />
                Start Practice
              </>
            )}
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
}

// Skeleton version for loading states
export function PracticeCardSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 animate-pulse">
      <div className="h-1 bg-neutral-200 dark:bg-neutral-700" />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="h-5 w-16 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
          <div className="h-6 w-6 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
        </div>
        <div className="h-5 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded mb-2" />
        <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-700 rounded mb-1" />
        <div className="h-4 w-2/3 bg-neutral-200 dark:bg-neutral-700 rounded mb-4" />
        <div className="flex gap-4 mb-4">
          <div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-700 rounded" />
          <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
        </div>
        <div className="h-10 w-full bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
      </div>
    </div>
  );
}
