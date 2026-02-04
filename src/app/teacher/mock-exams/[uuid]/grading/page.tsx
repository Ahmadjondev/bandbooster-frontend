'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  ArrowLeft,
  ClipboardCheck,
  Loader2,
  AlertCircle,
  Search,
  Filter,
  Clock,
  User,
} from 'lucide-react';
import { useState } from 'react';

import {
  useContestDetail,
  useContestAttempts,
} from '@/domains/contest/queries/contest.queries';

const STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  SUBMITTED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  GRADING_IN_PROGRESS: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  GRADED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  ABANDONED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

type FilterStatus = 'all' | 'SUBMITTED' | 'GRADED';

export default function ContestGradingPage() {
  const params = useParams();
  const contestUuid = params.uuid as string;
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const { data: contest, isLoading: loadingContest } = useContestDetail(contestUuid);
  const { data: attempts = [], isLoading: loadingAttempts } = useContestAttempts(contestUuid, true);

  const isLoading = loadingContest || loadingAttempts;

  const filteredAttempts = attempts.filter((attempt) => {
    const matchesSearch = attempt.contest.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || attempt.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = attempts.filter((a) => a.status === 'SUBMITTED').length;
  const gradedCount = attempts.filter((a) => a.status === 'GRADED').length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Contest not found</h2>
          <Link href="/teacher/mock-exams" className="text-primary-600 hover:underline">
            Back to mock exams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-surface-elevated border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href={`/teacher/mock-exams/${contestUuid}`}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-text-secondary" />
            </Link>
          </div>

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <ClipboardCheck className="h-8 w-8 text-primary-500" />
                <h1 className="text-3xl font-bold text-text-primary">Grading</h1>
              </div>
              <p className="text-text-secondary">{contest.title}</p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <p className="text-sm text-orange-800 dark:text-orange-300">Pending</p>
                <p className="text-2xl font-bold text-orange-800 dark:text-orange-300">{pendingCount}</p>
              </div>
              <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-300">Graded</p>
                <p className="text-2xl font-bold text-green-800 dark:text-green-300">{gradedCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-surface-elevated text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
            <Filter className="h-4 w-4 text-text-muted ml-2" />
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filterStatus === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('SUBMITTED')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filterStatus === 'SUBMITTED'
                  ? 'bg-primary-600 text-white'
                  : 'text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus('GRADED')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filterStatus === 'GRADED'
                  ? 'bg-primary-600 text-white'
                  : 'text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
            >
              Graded
            </button>
          </div>
        </div>

        {/* Submissions List */}
        {filteredAttempts.length === 0 ? (
          <div className="bg-surface-elevated rounded-xl border border-gray-200 dark:border-gray-700 p-16 text-center">
            <ClipboardCheck className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-text-secondary mb-2">
              {filterStatus === 'all'
                ? 'No submissions yet'
                : filterStatus === 'SUBMITTED'
                  ? 'No pending submissions'
                  : 'No graded submissions'}
            </p>
            <p className="text-sm text-text-muted">
              Submissions will appear here when students complete the exam
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAttempts.map((attempt) => (
              <Link
                key={attempt.uuid}
                href={`/teacher/mock-exams/${contestUuid}/grading/${attempt.uuid}`}
                className="block bg-surface-elevated rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-text-muted" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary mb-1">
                        Student Submission
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-text-muted">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {attempt.submittedAt
                            ? format(attempt.submittedAt, 'MMM d, yyyy HH:mm')
                            : 'Not submitted'}
                        </span>
                        {attempt.timeSpentSeconds && (
                          <span>
                            • {Math.round(attempt.timeSpentSeconds / 60)} min spent
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {attempt.overallScore !== null && (
                      <div className="text-right">
                        <p className="text-sm text-text-muted">Score</p>
                        <p className="text-xl font-bold text-primary-600">
                          {attempt.overallScore.toFixed(1)}
                        </p>
                      </div>
                    )}
                    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${STATUS_COLORS[attempt.status]}`}>
                      {attempt.status === 'SUBMITTED' ? 'Pending' : attempt.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
