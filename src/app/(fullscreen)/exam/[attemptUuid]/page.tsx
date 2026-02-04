'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Clock,
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  AlertCircle,
  Loader2,
  ChevronRight,
  PlayCircle,
  CheckCircle2,
  Target,
} from 'lucide-react';

import {
  useAttemptDetail,
} from '@/domains/contest/queries/contest.queries';
import type { SectionName } from '@/domains/contest/models/domain';

const SECTION_ORDER: SectionName[] = ['LISTENING', 'READING', 'WRITING', 'SPEAKING'];

const SECTION_CONFIG: Record<SectionName, {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  duration: string;
  color: string;
}> = {
  LISTENING: {
    icon: Headphones,
    title: 'Listening',
    description: '4 parts, 40 questions',
    duration: '~40 minutes',
    color: 'blue',
  },
  READING: {
    icon: BookOpen,
    title: 'Reading',
    description: '3 passages, 40 questions',
    duration: '~60 minutes',
    color: 'green',
  },
  WRITING: {
    icon: PenTool,
    title: 'Writing',
    description: '2 tasks',
    duration: '~60 minutes',
    color: 'purple',
  },
  SPEAKING: {
    icon: Mic,
    title: 'Speaking',
    description: '3 parts',
    duration: '~15 minutes',
    color: 'orange',
  },
};

export default function ExamAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const attemptUuid = params.attemptUuid as string;

  const { data: attempt, isLoading, refetch } = useAttemptDetail(attemptUuid);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Update time remaining
  useEffect(() => {
    if (attempt?.timeRemainingSeconds) {
      setTimeRemaining(attempt.timeRemainingSeconds);
    }
  }, [attempt?.timeRemainingSeconds]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  // Format time remaining
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get sections available for this exam type
  const getAvailableSections = (): SectionName[] => {
    if (!attempt) return [];
    const type = attempt.contest.contestType;

    switch (type) {
      case 'FULL_TEST':
        return SECTION_ORDER;
      case 'LISTENING':
        return ['LISTENING'];
      case 'READING':
        return ['READING'];
      case 'WRITING':
        return ['WRITING'];
      case 'SPEAKING':
        return ['SPEAKING'];
      default:
        return [];
    }
  };

  // Check if section is completed
  const isSectionCompleted = (section: SectionName): boolean => {
    return attempt?.sectionsCompleted.includes(section) ?? false;
  };

  // Check if section is current
  const isSectionCurrent = (section: SectionName): boolean => {
    return attempt?.currentSection === section;
  };

  // Check if section is available (current or completed)
  const isSectionAvailable = (section: SectionName): boolean => {
    const availableSections = getAvailableSections();
    const sectionIndex = availableSections.indexOf(section);
    const completedCount = attempt?.sectionsCompleted.length ?? 0;

    // Section is available if it's completed or it's the next one
    return sectionIndex <= completedCount;
  };

  // Get next section to take
  const getNextSection = (): SectionName | null => {
    const availableSections = getAvailableSections();
    for (const section of availableSections) {
      if (!isSectionCompleted(section)) {
        return section;
      }
    }
    return null;
  };

  // Handle section click
  const handleSectionClick = (section: SectionName) => {
    if (!isSectionAvailable(section)) return;
    router.push(`/exam/${attemptUuid}/${section.toLowerCase()}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-text-secondary">Loading your exam...</p>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Exam not found</h2>
          <Link href="/dashboard" className="text-primary-600 hover:underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const availableSections = getAvailableSections();
  const nextSection = getNextSection();
  const isExamComplete = attempt.status === 'SUBMITTED' || attempt.status === 'GRADED';
  const completedCount = attempt.sectionsCompleted.length;
  const progressPercent = (completedCount / availableSections.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-surface-elevated border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{attempt.contest.title}</h1>
              <p className="text-text-secondary mt-1">
                {attempt.contest.contestType.replace('_', ' ')} • {attempt.contest.difficulty}
              </p>
            </div>

            {/* Timer */}
            {timeRemaining !== null && timeRemaining > 0 && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeRemaining < 300
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  : 'bg-gray-100 dark:bg-gray-800 text-text-primary'
                }`}>
                <Clock className="h-5 w-5" />
                <span className="font-mono text-lg font-semibold">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-text-muted mb-2">
              <span>Progress</span>
              <span>{completedCount} / {availableSections.length} sections</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Exam Status */}
        {isExamComplete ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-green-800 dark:text-green-300 mb-2">
              Exam Submitted
            </h2>
            <p className="text-green-700 dark:text-green-400 mb-4">
              Your exam has been submitted successfully.
              {attempt.contest.resultsVisible
                ? ' You can view your results now.'
                : ' Results will be available when your teacher publishes them.'}
            </p>
            {attempt.contest.resultsVisible && (
              <Link
                href={`/exam/${attemptUuid}/results`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Target className="h-5 w-5" />
                View Results
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Quick Start Card */}
            {nextSection && (
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-primary-800 dark:text-primary-300 mb-1">
                      Continue Your Exam
                    </h2>
                    <p className="text-primary-700 dark:text-primary-400">
                      Next section: {SECTION_CONFIG[nextSection].title}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSectionClick(nextSection)}
                    className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <PlayCircle className="h-5 w-5" />
                    Start Section
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Sections List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Exam Sections</h2>

          {availableSections.map((section, index) => {
            const config = SECTION_CONFIG[section];
            const Icon = config.icon;
            const completed = isSectionCompleted(section);
            const available = isSectionAvailable(section);
            const current = isSectionCurrent(section);

            return (
              <button
                key={section}
                onClick={() => handleSectionClick(section)}
                disabled={!available || isExamComplete}
                className={`w-full text-left p-6 rounded-xl border transition-all ${completed
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : current
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700'
                      : available
                        ? 'bg-surface-elevated border-gray-200 dark:border-gray-700 hover:border-primary-500 cursor-pointer'
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${completed
                        ? 'bg-green-100 dark:bg-green-800/50'
                        : `bg-${config.color}-100 dark:bg-${config.color}-900/30`
                      }`}>
                      {completed ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                      ) : (
                        <Icon className={`h-6 w-6 text-${config.color}-600 dark:text-${config.color}-400`} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-text-muted">Section {index + 1}</span>
                        {completed && (
                          <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 rounded">
                            Completed
                          </span>
                        )}
                        {current && !completed && (
                          <span className="text-xs px-2 py-0.5 bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-300 rounded">
                            In Progress
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-text-primary">{config.title}</h3>
                      <p className="text-sm text-text-muted">{config.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-text-muted">Duration</p>
                      <p className="font-medium text-text-primary">{config.duration}</p>
                    </div>
                    {available && !isExamComplete && (
                      <ChevronRight className="h-5 w-5 text-text-muted" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Submit Button */}
        {!isExamComplete && completedCount === availableSections.length && (
          <div className="mt-8 p-6 bg-surface-elevated border border-gray-200 dark:border-gray-700 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">All sections completed!</h3>
                <p className="text-text-muted">
                  Review your answers or submit the exam.
                </p>
              </div>
              <Link
                href={`/exam/${attemptUuid}/submit`}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Submit Exam
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
