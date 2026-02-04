'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  PlusCircle,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  BarChart3,
} from 'lucide-react';

import { useTeacherContests, useContestStatistics } from '@/domains/contest/queries/contest.queries';
import { ContestCard } from '@/domains/contest/components';
import type { ContestStatus, ContestType } from '@/domains/contest/models/domain';

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'FULL_TEST', label: 'Full Test' },
  { value: 'LISTENING', label: 'Listening' },
  { value: 'READING', label: 'Reading' },
  { value: 'WRITING', label: 'Writing' },
  { value: 'SPEAKING', label: 'Speaking' },
];

export default function TeacherMockExamsPage() {
  const [filters, setFilters] = useState({
    status: '',
    contestType: '',
    search: '',
  });

  const {
    data: contests = [],
    isLoading,
    refetch,
  } = useTeacherContests(filters);

  const { data: stats } = useContestStatistics();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 via-accent-600 to-primary-700 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-black/10">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="h-10 w-10" />
                <h1 className="text-4xl font-bold">Mock Exams</h1>
              </div>
              <p className="text-primary-100 text-lg">
                Create and manage IELTS mock exams for your students
              </p>
            </div>
            <Link
              href="/teacher/mock-exams/create"
              className="flex items-center gap-2 px-6 py-3 bg-white text-primary-600 rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all shadow-lg"
            >
              <PlusCircle className="h-5 w-5" />
              Create Mock Exam
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 border-2 border-blue-200 dark:border-blue-800 p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Exams</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.totalContests}</p>
                </div>
                <BookOpen className="h-12 w-12 text-blue-600 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 border-2 border-green-200 dark:border-green-800 p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.activeContests}</p>
                </div>
                <CheckCircle2 className="h-12 w-12 text-green-600 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/10 border-2 border-orange-200 dark:border-orange-800 p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Scheduled</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.scheduledContests}</p>
                </div>
                <Calendar className="h-12 w-12 text-orange-600 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/10 border-2 border-purple-200 dark:border-purple-800 p-6 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Attempts</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.totalAttempts}</p>
                </div>
                <BarChart3 className="h-12 w-12 text-purple-600 opacity-80" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-surface-elevated rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search exams..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-surface dark:bg-gray-800 text-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-surface dark:bg-gray-800 text-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={filters.contestType}
              onChange={(e) => setFilters({ ...filters, contestType: e.target.value })}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-surface dark:bg-gray-800 text-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Contest List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : contests.length === 0 ? (
          <div className="bg-surface-elevated rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No mock exams yet</h3>
            <p className="text-text-secondary mb-6">
              Create your first mock exam to start testing your students.
            </p>
            <Link
              href="/teacher/mock-exams/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              <PlusCircle className="h-5 w-5" />
              Create Mock Exam
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {contests.map((contest) => (
              <ContestCard key={contest.uuid} contest={contest} onRefresh={refetch} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
