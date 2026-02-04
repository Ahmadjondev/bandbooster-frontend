'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format, formatDistanceToNow, isPast, isFuture } from 'date-fns';
import {
  Search,
  Filter,
  Clock,
  Users,
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  Target,
  Loader2,
  AlertCircle,
  Lock,
  PlayCircle,
  CheckCircle2,
  Trophy,
} from 'lucide-react';

import {
  useAvailableContests,
  useMyContestAttempts,
  useStartContestAttempt,
  useJoinContest,
} from '@/domains/contest/queries/contest.queries';
import type { ContestListItem, ContestAttemptListItem } from '@/domains/contest/models/domain';

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  FULL_TEST: Target,
  LISTENING: Headphones,
  READING: BookOpen,
  WRITING: PenTool,
  SPEAKING: Mic,
};

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  MEDIUM: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  HARD: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  EXPERT: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
};

type FilterType = 'all' | 'available' | 'in-progress' | 'completed';

export default function StudentExamsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [selectedContest, setSelectedContest] = useState<ContestListItem | null>(null);

  const { data: contests = [], isLoading: loadingContests } = useAvailableContests();
  const { data: myAttempts = [], isLoading: loadingAttempts } = useMyContestAttempts();
  const startAttemptMutation = useStartContestAttempt();
  const joinContestMutation = useJoinContest();

  // Combine contests with attempt info
  const contestsWithAttempts = contests.map((contest) => {
    const attempt = myAttempts.find((a) => a.contest.uuid === contest.uuid);
    return { contest, attempt };
  });

  // Filter contests
  const filteredContests = contestsWithAttempts.filter(({ contest, attempt }) => {
    // Search filter
    if (searchQuery && !contest.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Type filter
    switch (filterType) {
      case 'available':
        return !attempt && !isPast(contest.endTime);
      case 'in-progress':
        return attempt?.status === 'IN_PROGRESS' || attempt?.status === 'NOT_STARTED';
      case 'completed':
        return attempt?.status === 'SUBMITTED' || attempt?.status === 'GRADED';
      default:
        return true;
    }
  });

  const isLoading = loadingContests || loadingAttempts;

  // Handle starting an exam (without access code)
  const handleStartExam = async (contest: ContestListItem) => {
    try {
      const response = await startAttemptMutation.mutateAsync(contest.uuid);
      router.push(`/exam/${response.uuid}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to start exam');
    }
  };

  // Handle starting an exam with access code
  const handleStartExamWithAccessCode = async (contest: ContestListItem, accessCode: string) => {
    try {
      // First join with access code
      await joinContestMutation.mutateAsync({ contestUuid: contest.uuid, accessCode });
      // Then start the attempt
      const response = await startAttemptMutation.mutateAsync(contest.uuid);
      router.push(`/exam/${response.uuid}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to start exam');
    }
  };

  // Handle continue/view
  const handleContinueExam = (attempt: ContestAttemptListItem) => {
    if (attempt.status === 'SUBMITTED' || attempt.status === 'GRADED') {
      router.push(`/exam/${attempt.uuid}/results`);
    } else {
      router.push(`/exam/${attempt.uuid}`);
    }
  };

  // Get contest status
  const getContestStatus = (contest: ContestListItem, attempt?: ContestAttemptListItem) => {
    if (attempt) {
      return attempt.status;
    }
    if (isPast(contest.endTime)) {
      return 'EXPIRED';
    }
    if (isFuture(contest.startTime)) {
      return 'UPCOMING';
    }
    return 'AVAILABLE';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-surface-elevated border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-text-primary">Mock Exams</h1>
          <p className="text-text-secondary mt-1">
            Take IELTS mock exams to practice and improve your score
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-surface-elevated text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg p-1 bg-surface-elevated">
            <Filter className="h-4 w-4 text-text-muted ml-2" />
            {(['all', 'available', 'in-progress', 'completed'] as FilterType[]).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filterType === type
                    ? 'bg-primary-600 text-white'
                    : 'text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Contests Grid */}
        {filteredContests.length === 0 ? (
          <div className="bg-surface-elevated rounded-xl border border-gray-200 dark:border-gray-700 p-16 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-text-secondary mb-2">
              {searchQuery ? 'No exams match your search' : 'No exams available'}
            </p>
            <p className="text-sm text-text-muted">
              Check back later for new mock exams
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContests.map(({ contest, attempt }) => {
              const status = getContestStatus(contest, attempt);
              const Icon = TYPE_ICONS[contest.contestType] || Target;
              const isExpired = status === 'EXPIRED';
              const isUpcoming = status === 'UPCOMING';

              return (
                <div
                  key={contest.uuid}
                  className={`bg-surface-elevated rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${isExpired ? 'opacity-60' : ''
                    }`}
                >
                  {/* Header */}
                  <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${DIFFICULTY_COLORS[contest.difficulty]}`}>
                        {contest.difficulty}
                      </span>
                    </div>
                    <h3 className="font-semibold text-text-primary mb-1">{contest.title}</h3>
                    <p className="text-sm text-text-muted line-clamp-2">{contest.description || 'No description'}</p>
                  </div>

                  {/* Stats */}
                  <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-text-muted">
                      <Clock className="h-4 w-4" />
                      {contest.durationMinutes ? `${contest.durationMinutes} min` : 'No limit'}
                    </div>
                    <div className="flex items-center gap-1 text-text-muted">
                      <BookOpen className="h-4 w-4" />
                      {contest.totalQuestions} questions
                    </div>
                    <div className="flex items-center gap-1 text-text-muted">
                      <Users className="h-4 w-4" />
                      {contest.participantCount}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-5">
                    {/* Status Badge */}
                    {attempt && (
                      <div className="mb-3">
                        {attempt.status === 'IN_PROGRESS' && (
                          <div className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            In progress
                          </div>
                        )}
                        {(attempt.status === 'SUBMITTED' || attempt.status === 'GRADED') && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4" />
                              Completed
                            </span>
                            {attempt.overallScore !== null && (
                              <span className="text-lg font-bold text-primary-600">
                                Band {attempt.overallScore.toFixed(1)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Schedule Info */}
                    {isUpcoming && (
                      <p className="text-sm text-text-muted mb-3">
                        Starts {formatDistanceToNow(contest.startTime, { addSuffix: true })}
                      </p>
                    )}
                    {isExpired && (
                      <p className="text-sm text-red-500 mb-3">
                        Ended {formatDistanceToNow(contest.endTime, { addSuffix: true })}
                      </p>
                    )}

                    {/* Action Button */}
                    {isExpired ? (
                      <button
                        disabled
                        className="w-full py-2.5 bg-gray-100 dark:bg-gray-800 text-text-muted rounded-lg cursor-not-allowed"
                      >
                        Exam Ended
                      </button>
                    ) : isUpcoming ? (
                      <button
                        disabled
                        className="w-full py-2.5 bg-gray-100 dark:bg-gray-800 text-text-muted rounded-lg cursor-not-allowed"
                      >
                        Coming Soon
                      </button>
                    ) : attempt ? (
                      <button
                        onClick={() => handleContinueExam(attempt)}
                        className="w-full py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                      >
                        {attempt.status === 'SUBMITTED' || attempt.status === 'GRADED' ? (
                          <>
                            <Trophy className="h-4 w-4" />
                            View Results
                          </>
                        ) : (
                          <>
                            <PlayCircle className="h-4 w-4" />
                            Continue
                          </>
                        )}
                      </button>
                    ) : contest.hasAccessCode ? (
                      <button
                        onClick={() => setSelectedContest(contest)}
                        className="w-full py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Lock className="h-4 w-4" />
                        Enter Access Code
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartExam(contest)}
                        disabled={startAttemptMutation.isPending}
                        className="w-full py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {startAttemptMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <PlayCircle className="h-4 w-4" />
                            Start Exam
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Access Code Modal */}
        {selectedContest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-surface-elevated rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Enter Access Code
              </h3>
              <p className="text-sm text-text-muted mb-4">
                This exam requires an access code. Enter the code provided by your teacher.
              </p>
              <input
                type="text"
                value={accessCodeInput}
                onChange={(e) => setAccessCodeInput(e.target.value)}
                placeholder="Enter access code..."
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setSelectedContest(null);
                    setAccessCodeInput('');
                  }}
                  className="px-4 py-2 text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleStartExamWithAccessCode(selectedContest, accessCodeInput);
                    setSelectedContest(null);
                    setAccessCodeInput('');
                  }}
                  disabled={!accessCodeInput || startAttemptMutation.isPending || joinContestMutation.isPending}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {(startAttemptMutation.isPending || joinContestMutation.isPending) ? 'Starting...' : 'Start Exam'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
