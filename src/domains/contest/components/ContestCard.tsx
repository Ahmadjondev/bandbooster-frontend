'use client';

import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import {
  BookOpen,
  Clock,
  Users,
  Calendar,
  MoreVertical,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  BarChart3,
  Send,
  Archive,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import type { ContestListItem, ContestStatus, ContestType } from '../models/domain';
import {
  useDeleteContest,
  usePublishContest,
  useArchiveContest,
  useToggleResultsVisible,
} from '../queries/contest.queries';

interface ContestCardProps {
  contest: ContestListItem;
  onRefresh: () => void;
}

const STATUS_COLORS: Record<ContestStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  SCHEDULED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  COMPLETED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  ARCHIVED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const TYPE_ICONS: Record<ContestType, string> = {
  FULL_TEST: '🎯',
  LISTENING: '🎧',
  READING: '📖',
  WRITING: '✍️',
  SPEAKING: '🎤',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: 'text-green-600 dark:text-green-400',
  MEDIUM: 'text-blue-600 dark:text-blue-400',
  HARD: 'text-purple-600 dark:text-purple-400',
  EXPERT: 'text-orange-600 dark:text-orange-400',
};

export default function ContestCard({ contest, onRefresh }: ContestCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const deleteMutation = useDeleteContest();
  const publishMutation = usePublishContest();
  const archiveMutation = useArchiveContest();
  const toggleResultsMutation = useToggleResultsVisible();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this exam?')) return;
    try {
      await deleteMutation.mutateAsync(contest.uuid);
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete exam');
    }
    setShowMenu(false);
  };

  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync(contest.uuid);
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to publish exam');
    }
    setShowMenu(false);
  };

  const handleArchive = async () => {
    if (!confirm('Are you sure you want to archive this exam?')) return;
    try {
      await archiveMutation.mutateAsync(contest.uuid);
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to archive exam');
    }
    setShowMenu(false);
  };

  const handleToggleResults = async () => {
    try {
      await toggleResultsMutation.mutateAsync(contest.uuid);
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to toggle results visibility');
    }
    setShowMenu(false);
  };

  const isActive = contest.status === 'ACTIVE';
  const isCompleted = contest.status === 'COMPLETED';
  const isDraft = contest.status === 'DRAFT';
  const isScheduled = contest.status === 'SCHEDULED';

  return (
    <div className="bg-surface-elevated rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="text-3xl">{TYPE_ICONS[contest.contestType]}</div>
          <div>
            <Link
              href={`/teacher/mock-exams/${contest.uuid}`}
              className="text-lg font-semibold text-text-primary hover:text-primary-600 transition-colors"
            >
              {contest.title}
            </Link>
            <div className="flex items-center gap-3 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[contest.status]}`}>
                {contest.status}
              </span>
              <span className={`text-sm font-medium ${DIFFICULTY_COLORS[contest.difficulty]}`}>
                {contest.difficulty}
              </span>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <MoreVertical className="h-5 w-5 text-text-secondary" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-surface-elevated rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
              <Link
                href={`/teacher/mock-exams/${contest.uuid}`}
                className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Eye className="h-4 w-4" />
                View Details
              </Link>

              {isDraft && (
                <>
                  <Link
                    href={`/teacher/mock-exams/${contest.uuid}/edit`}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Link>
                  <Link
                    href={`/teacher/mock-exams/${contest.uuid}/content`}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <BookOpen className="h-4 w-4" />
                    Edit Content
                  </Link>
                  <button
                    onClick={handlePublish}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800 w-full"
                  >
                    <Send className="h-4 w-4" />
                    Publish
                  </button>
                </>
              )}

              {(isActive || isCompleted) && (
                <>
                  <Link
                    href={`/teacher/mock-exams/${contest.uuid}/leaderboard`}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Leaderboard
                  </Link>
                  <button
                    onClick={handleToggleResults}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-gray-100 dark:hover:bg-gray-800 w-full"
                  >
                    {contest.resultsVisible ? (
                      <>
                        <EyeOff className="h-4 w-4" />
                        Hide Results
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        Show Results
                      </>
                    )}
                  </button>
                </>
              )}

              {!['ARCHIVED', 'ACTIVE'].includes(contest.status) && (
                <button
                  onClick={handleArchive}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 w-full"
                >
                  <Archive className="h-4 w-4" />
                  Archive
                </button>
              )}

              {isDraft && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 w-full"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 mt-4 text-sm text-text-secondary">
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {contest.durationMinutes ? `${contest.durationMinutes} min` : 'No limit'}
        </div>
        <div className="flex items-center gap-1.5">
          <BookOpen className="h-4 w-4" />
          {contest.totalQuestions} questions
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          {contest.participantCount} participants
        </div>
      </div>

      {/* Schedule */}
      <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {format(contest.startTime, 'MMM d, yyyy HH:mm')} - {format(contest.endTime, 'MMM d, yyyy HH:mm')}
        </div>
      </div>

      {/* Results visibility indicator */}
      {(isActive || isCompleted) && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className={`flex items-center gap-2 text-sm ${contest.resultsVisible
              ? 'text-green-600 dark:text-green-400'
              : 'text-gray-500 dark:text-gray-400'
            }`}>
            {contest.resultsVisible ? (
              <>
                <Eye className="h-4 w-4" />
                Results visible to students
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4" />
                Results hidden from students
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
