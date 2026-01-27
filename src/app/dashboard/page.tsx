'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useOverview, useUserStats, useAttempts } from '@/domains/practice/queries/practice.queries';
import type { SectionType } from '@/domains/practice/models/domain';

// Icons
const icons = {
  reading: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      <path d="M8 7h6" />
      <path d="M8 11h8" />
    </svg>
  ),
  listening: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  ),
  writing: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  speaking: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  ),
  arrowRight: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  ),
  clock: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  ),
  target: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
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
  fire: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  ),
  checkCircle: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
};

const sectionConfig: Record<SectionType, { icon: keyof typeof icons; color: string; bgColor: string; hoverColor: string }> = {
  READING: { icon: 'reading', color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30', hoverColor: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20' },
  LISTENING: { icon: 'listening', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30', hoverColor: 'hover:bg-blue-50 dark:hover:bg-blue-900/20' },
  WRITING: { icon: 'writing', color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30', hoverColor: 'hover:bg-purple-50 dark:hover:bg-purple-900/20' },
  SPEAKING: { icon: 'speaking', color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/30', hoverColor: 'hover:bg-orange-50 dark:hover:bg-orange-900/20' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Skeleton Components
function SectionCardSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-neutral-200 dark:bg-neutral-700" />
        <div className="w-16 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700" />
      </div>
      <div className="h-5 w-24 bg-neutral-200 dark:bg-neutral-700 rounded mb-2" />
      <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-700 rounded mb-4" />
      <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full mb-4" />
      <div className="flex justify-between items-center">
        <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded" />
        <div className="h-8 w-24 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-neutral-200 dark:bg-neutral-700" />
        <div>
          <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded mb-2" />
          <div className="h-6 w-16 bg-neutral-200 dark:bg-neutral-700 rounded" />
        </div>
      </div>
    </div>
  );
}

function ActivityItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-700" />
      <div className="flex-1">
        <div className="h-4 w-48 bg-neutral-200 dark:bg-neutral-700 rounded mb-2" />
        <div className="h-3 w-24 bg-neutral-200 dark:bg-neutral-700 rounded" />
      </div>
      <div className="text-right">
        <div className="h-5 w-12 bg-neutral-200 dark:bg-neutral-700 rounded mb-1" />
        <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-700 rounded" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: overview, isLoading: isLoadingOverview } = useOverview();
  const { data: userStats, isLoading: isLoadingStats } = useUserStats();
  const { data: recentAttempts, isLoading: isLoadingAttempts } = useAttempts({ limit: 5 });

  const isLoading = isLoadingOverview || isLoadingStats;

  // Calculate stats
  const totalPracticeTime = userStats?.totalTimeSpentSeconds || 0;
  const totalAttempts = userStats?.totalAttempts || 0;
  const averageScore = userStats?.overallAverageScore || 0;
  const completedPractices = userStats?.totalCompleted || 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Welcome Section */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 dark:text-white">
          Welcome back! 👋
        </h1>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
          Ready to boost your IELTS score? Let&apos;s practice!
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 "
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <icons.target className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Attempts</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{totalAttempts}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 "
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <icons.checkCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Completed</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">{completedPractices}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 "
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <icons.trophy className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Avg. Score</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {averageScore > 0 ? `${averageScore.toFixed(0)}%` : '--'}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 "
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <icons.clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Practice Time</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {formatTime(totalPracticeTime)}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Section Cards */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Practice Sections</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoadingOverview ? (
            <>
              <SectionCardSkeleton />
              <SectionCardSkeleton />
              <SectionCardSkeleton />
              <SectionCardSkeleton />
            </>
          ) : (
            overview?.map((section, index) => {
              const config = sectionConfig[section.sectionType];
              const Icon = icons[config.icon];
              const isAvailable = section.sectionType === 'READING' || section.sectionType === 'LISTENING';
              const href = isAvailable ? `/dashboard/practice/${section.sectionType.toLowerCase()}` : '#';

              return (
                <motion.div
                  key={section.sectionType}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={isAvailable ? { y: -4, scale: 1.02 } : undefined}
                  className={cn(
                    'relative bg-white dark:bg-neutral-900 rounded-2xl p-6',
                    'border border-neutral-200 dark:border-neutral-800',
                    ' transition-shadow',
                    isAvailable && 'hover:shadow-lg cursor-pointer'
                  )}
                >
                  {!isAvailable && (
                    <div className="absolute top-4 right-4 px-2 py-1 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400 text-xs font-medium rounded-full">
                      Coming Soon
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', config.bgColor)}>
                      <Icon className={cn('w-6 h-6', config.color)} />
                    </div>
                    {section.bestScore !== null && (
                      <div className="flex items-center gap-1 text-sm">
                        <icons.trophy className="w-4 h-4 text-amber-500" />
                        <span className="font-medium text-neutral-700 dark:text-neutral-300">
                          {section.bestScore.toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                    {section.displayName}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                    {section.completedPractices} of {section.totalPractices} completed
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full mb-4 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${section.progressPercentage}%` }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      className={cn('h-full rounded-full', config.bgColor.replace('bg-', 'bg-').replace('-100', '-500').replace('-900/30', '-500'))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                      {section.freePractices} free available
                    </span>
                    {isAvailable ? (
                      <Link
                        href={href}
                        className={cn(
                          'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                          config.color,
                          config.hoverColor
                        )}
                      >
                        Practice
                        <icons.arrowRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <span className="text-sm text-neutral-400 dark:text-neutral-500">
                        Soon
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Recent Activity</h2>
          <Link
            href="/dashboard/history"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View all
          </Link>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          {isLoadingAttempts ? (
            <>
              <ActivityItemSkeleton />
              <ActivityItemSkeleton />
              <ActivityItemSkeleton />
            </>
          ) : recentAttempts && recentAttempts.length > 0 ? (
            recentAttempts.map((attempt, index) => {
              const config = sectionConfig[attempt.sectionType];
              const Icon = icons[config.icon];

              return (
                <motion.div
                  key={attempt.uuid}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'flex items-center gap-4 p-4 transition-colors',
                    'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
                    index !== recentAttempts.length - 1 && 'border-b border-neutral-100 dark:border-neutral-800'
                  )}
                >
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', config.bgColor)}>
                    <Icon className={cn('w-5 h-5', config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                      {attempt.practiceTitle}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {attempt.sectionType} • {attempt.difficulty}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={cn(
                      'text-sm font-semibold',
                      attempt.score !== null && attempt.score >= 70
                        ? 'text-green-600 dark:text-green-400'
                        : attempt.score !== null
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-neutral-400'
                    )}>
                      {attempt.score !== null ? `${attempt.score.toFixed(0)}%` : '--'}
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                      {attempt.completedAt ? formatDate(attempt.completedAt) : 'In progress'}
                    </p>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="p-8 text-center">
              <icons.fire className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
              <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                No practice attempts yet. Start your journey!
              </p>
              <Link
                href="/dashboard/practice/reading"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
              >
                Start Practicing
                <icons.arrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Quick Start</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/dashboard/practice/reading">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-4 p-5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl text-white cursor-pointer"
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <icons.reading className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Reading Practice</h3>
                <p className="text-sm text-emerald-100">Improve comprehension skills</p>
              </div>
              <icons.arrowRight className="w-5 h-5" />
            </motion.div>
          </Link>

          <Link href="/dashboard/practice/listening">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-4 p-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl text-white cursor-pointer"
            >
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <icons.listening className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Listening Practice</h3>
                <p className="text-sm text-blue-100">Sharpen your listening skills</p>
              </div>
              <icons.arrowRight className="w-5 h-5" />
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
