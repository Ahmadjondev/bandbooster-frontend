'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Trophy,
  Medal,
  Loader2,
  AlertCircle,
  Download,
  Search,
} from 'lucide-react';
import { useState } from 'react';

import {
  useContestDetail,
  useContestLeaderboard,
} from '@/domains/contest/queries/contest.queries';

const RANK_BADGES = [
  { icon: '🥇', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  { icon: '🥈', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
  { icon: '🥉', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
];

export default function ContestLeaderboardPage() {
  const params = useParams();
  const contestUuid = params.uuid as string;
  const [searchQuery, setSearchQuery] = useState('');

  const { data: contest, isLoading: loadingContest } = useContestDetail(contestUuid);
  const { data: leaderboard, isLoading: loadingLeaderboard } = useContestLeaderboard(contestUuid, true);

  const isLoading = loadingContest || loadingLeaderboard;

  const filteredEntries = leaderboard?.entries.filter((entry) =>
    entry.student.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Compute stats from entries
  const scores = leaderboard?.entries
    .map((e) => e.overallScore)
    .filter((s): s is number => s !== null) || [];
  const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
  const highestScore = scores.length > 0 ? Math.max(...scores) : null;
  const lowestScore = scores.length > 0 ? Math.min(...scores) : null;

  const handleExportCSV = () => {
    if (!leaderboard?.entries.length) return;

    const headers = ['Rank', 'Student', 'Listening', 'Reading', 'Writing', 'Speaking', 'Overall', 'Time Spent'];
    const rows = leaderboard.entries.map((entry) => [
      entry.rank,
      entry.student.fullName,
      entry.listeningScore?.toFixed(1) || '-',
      entry.readingScore?.toFixed(1) || '-',
      entry.writingScore?.toFixed(1) || '-',
      entry.speakingScore?.toFixed(1) || '-',
      entry.overallScore?.toFixed(1) || '-',
      entry.timeSpentSeconds ? `${Math.round(entry.timeSpentSeconds / 60)} min` : '-',
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contest?.title || 'leaderboard'}_results.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
                <Trophy className="h-8 w-8 text-yellow-500" />
                <h1 className="text-3xl font-bold text-text-primary">Leaderboard</h1>
              </div>
              <p className="text-text-secondary">{contest.title}</p>
            </div>

            <button
              onClick={handleExportCSV}
              disabled={!leaderboard?.entries.length}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-surface-elevated text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Stats Cards */}
        {leaderboard && leaderboard.entries.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-surface-elevated rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-text-muted mb-1">Total Participants</p>
              <p className="text-2xl font-bold text-text-primary">{leaderboard.totalParticipants}</p>
            </div>
            <div className="bg-surface-elevated rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-text-muted mb-1">Average Score</p>
              <p className="text-2xl font-bold text-text-primary">
                {averageScore?.toFixed(1) || '-'}
              </p>
            </div>
            <div className="bg-surface-elevated rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-text-muted mb-1">Highest Score</p>
              <p className="text-2xl font-bold text-green-600">
                {highestScore?.toFixed(1) || '-'}
              </p>
            </div>
            <div className="bg-surface-elevated rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-sm text-text-muted mb-1">Lowest Score</p>
              <p className="text-2xl font-bold text-red-600">
                {lowestScore?.toFixed(1) || '-'}
              </p>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-surface-elevated rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-16">
              <Medal className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-text-secondary mb-2">
                {searchQuery ? 'No students match your search' : 'No results yet'}
              </p>
              {!searchQuery && (
                <p className="text-sm text-text-muted">
                  Results will appear here once students complete the exam
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider w-16">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Listening
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Reading
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Writing
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Speaking
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Overall
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredEntries.map((entry) => {
                    const rankBadge = RANK_BADGES[entry.rank - 1];
                    return (
                      <tr
                        key={entry.student.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          {rankBadge ? (
                            <span className={`px-2.5 py-1 rounded-full text-sm font-medium ${rankBadge.color}`}>
                              {rankBadge.icon} {entry.rank}
                            </span>
                          ) : (
                            <span className="text-text-secondary font-medium">#{entry.rank}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-text-primary">{entry.student.fullName}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-text-secondary">
                            {entry.listeningScore?.toFixed(1) || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-text-secondary">
                            {entry.readingScore?.toFixed(1) || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-text-secondary">
                            {entry.writingScore?.toFixed(1) || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-text-secondary">
                            {entry.speakingScore?.toFixed(1) || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-lg font-bold text-primary-600">
                            {entry.overallScore?.toFixed(1) || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-text-muted text-sm">
                            {entry.timeSpentSeconds ? `${Math.round(entry.timeSpentSeconds / 60)} min` : '-'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
