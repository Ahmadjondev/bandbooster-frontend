'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Users,
  Calendar,
  Edit,
  Trash2,
  Send,
  Archive,
  Eye,
  EyeOff,
  BarChart3,
  Loader2,
  ClipboardCheck,
  Headphones,
  PenTool,
  Mic,
  AlertCircle,
} from 'lucide-react';

import {
  useContestDetail,
  useContestLeaderboard,
  useContestAttempts,
  useDeleteContest,
  usePublishContest,
  useArchiveContest,
  useToggleResultsVisible,
} from '@/domains/contest/queries/contest.queries';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  SCHEDULED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  COMPLETED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  ARCHIVED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const TYPE_ICONS: Record<string, string> = {
  FULL_TEST: '🎯',
  LISTENING: '🎧',
  READING: '📖',
  WRITING: '✍️',
  SPEAKING: '🎤',
};

export default function ContestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contestUuid = params.uuid as string;

  const { data: contest, isLoading, refetch } = useContestDetail(contestUuid);
  const { data: leaderboard } = useContestLeaderboard(contestUuid, contest?.status !== 'DRAFT');
  const { data: attempts = [] } = useContestAttempts(contestUuid, contest?.status !== 'DRAFT');

  const deleteMutation = useDeleteContest();
  const publishMutation = usePublishContest();
  const archiveMutation = useArchiveContest();
  const toggleResultsMutation = useToggleResultsVisible();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this exam?')) return;
    try {
      await deleteMutation.mutateAsync(contestUuid);
      router.push('/teacher/mock-exams');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete exam');
    }
  };

  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync(contestUuid);
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to publish exam');
    }
  };

  const handleArchive = async () => {
    if (!confirm('Are you sure you want to archive this exam?')) return;
    try {
      await archiveMutation.mutateAsync(contestUuid);
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to archive exam');
    }
  };

  const handleToggleResults = async () => {
    try {
      await toggleResultsMutation.mutateAsync(contestUuid);
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to toggle results visibility');
    }
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

  const isDraft = contest.status === 'DRAFT';
  const isActive = contest.status === 'ACTIVE';
  const isCompleted = contest.status === 'COMPLETED';
  const pendingGrading = attempts.filter(a => a.status === 'SUBMITTED');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-surface-elevated border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/teacher/mock-exams"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-text-secondary" />
            </Link>
          </div>

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{TYPE_ICONS[contest.contestType]}</span>
                <h1 className="text-3xl font-bold text-text-primary">{contest.title}</h1>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[contest.status]}`}>
                  {contest.status}
                </span>
                <span className="text-text-secondary">
                  {contest.contestType.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isDraft && (
                <>
                  <Link
                    href={`/teacher/mock-exams/${contestUuid}/edit`}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Link>
                  <Link
                    href={`/teacher/mock-exams/${contestUuid}/content`}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    Edit Content
                  </Link>
                  <button
                    onClick={handlePublish}
                    disabled={publishMutation.isPending || contest.totalQuestions === 0}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    Publish
                  </button>
                </>
              )}

              {(isActive || isCompleted) && (
                <button
                  onClick={handleToggleResults}
                  disabled={toggleResultsMutation.isPending}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${contest.resultsVisible
                      ? 'bg-gray-100 dark:bg-gray-800 text-text-secondary hover:bg-gray-200 dark:hover:bg-gray-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
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
              )}

              {!['ARCHIVED', 'ACTIVE'].includes(contest.status) && (
                <button
                  onClick={handleArchive}
                  disabled={archiveMutation.isPending}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <Archive className="h-4 w-4" />
                  Archive
                </button>
              )}

              {isDraft && (
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {contest.description && (
              <div className="bg-surface-elevated rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-3">Description</h2>
                <p className="text-text-secondary whitespace-pre-wrap">{contest.description}</p>
              </div>
            )}

            {/* Content Summary */}
            <div className="bg-surface-elevated rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Exam Content</h2>

              <div className="space-y-4">
                {contest.listeningParts && contest.listeningParts.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-text-secondary mb-2">
                      <Headphones className="h-5 w-5" />
                      <span className="font-medium">Listening ({contest.listeningParts.length} parts)</span>
                    </div>
                    <div className="pl-7 space-y-1">
                      {contest.listeningParts.map((part) => (
                        <div key={part.id} className="text-sm text-text-muted">
                          Part {part.partNumber}: {part.title} ({part.questionCount} questions)
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {contest.readingPassages && contest.readingPassages.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-text-secondary mb-2">
                      <BookOpen className="h-5 w-5" />
                      <span className="font-medium">Reading ({contest.readingPassages.length} passages)</span>
                    </div>
                    <div className="pl-7 space-y-1">
                      {contest.readingPassages.map((passage) => (
                        <div key={passage.id} className="text-sm text-text-muted">
                          Passage {passage.passageNumber}: {passage.title} ({passage.questionCount} questions)
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {contest.writingTasks && contest.writingTasks.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-text-secondary mb-2">
                      <PenTool className="h-5 w-5" />
                      <span className="font-medium">Writing ({contest.writingTasks.length} tasks)</span>
                    </div>
                    <div className="pl-7 space-y-1">
                      {contest.writingTasks.map((task) => (
                        <div key={task.id} className="text-sm text-text-muted">
                          {task.taskTypeDisplay}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {contest.speakingTopics && contest.speakingTopics.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 text-text-secondary mb-2">
                      <Mic className="h-5 w-5" />
                      <span className="font-medium">Speaking ({contest.speakingTopics.length} topics)</span>
                    </div>
                    <div className="pl-7 space-y-1">
                      {contest.speakingTopics.map((topic) => (
                        <div key={topic.id} className="text-sm text-text-muted">
                          Part {topic.partNumber}: {topic.topicName}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {contest.totalQuestions === 0 && (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-text-secondary mb-4">No content added yet</p>
                    <Link
                      href={`/teacher/mock-exams/${contestUuid}/content`}
                      className="text-primary-600 hover:underline"
                    >
                      Add content to this exam
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Pending Grading */}
            {pendingGrading.length > 0 && (
              <div className="bg-surface-elevated rounded-xl border border-orange-200 dark:border-orange-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-orange-500" />
                    <h2 className="text-lg font-semibold text-text-primary">
                      Pending Grading ({pendingGrading.length})
                    </h2>
                  </div>
                  <Link
                    href={`/teacher/mock-exams/${contestUuid}/grading`}
                    className="text-primary-600 hover:underline text-sm"
                  >
                    View all
                  </Link>
                </div>
                <div className="space-y-2">
                  {pendingGrading.slice(0, 5).map((attempt) => (
                    <div
                      key={attempt.uuid}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-text-primary">
                          {attempt.contest.title}
                        </p>
                        <p className="text-sm text-text-muted">
                          Submitted {attempt.submittedAt ? format(attempt.submittedAt, 'MMM d, HH:mm') : '-'}
                        </p>
                      </div>
                      <Link
                        href={`/teacher/mock-exams/${contestUuid}/grading/${attempt.uuid}`}
                        className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
                      >
                        Grade
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Leaderboard Preview */}
            {leaderboard && leaderboard.entries.length > 0 && (
              <div className="bg-surface-elevated rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary-500" />
                    <h2 className="text-lg font-semibold text-text-primary">Top Performers</h2>
                  </div>
                  <Link
                    href={`/teacher/mock-exams/${contestUuid}/leaderboard`}
                    className="text-primary-600 hover:underline text-sm"
                  >
                    View full leaderboard
                  </Link>
                </div>
                <div className="space-y-2">
                  {leaderboard.entries.slice(0, 5).map((entry) => (
                    <div
                      key={entry.student.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full text-sm font-medium">
                          {entry.rank}
                        </span>
                        <span className="font-medium text-text-primary">{entry.student.fullName}</span>
                      </div>
                      <span className="text-lg font-bold text-primary-600">
                        {entry.overallScore?.toFixed(1) || '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-surface-elevated rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Details</h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-text-muted" />
                  <div>
                    <p className="text-sm text-text-muted">Duration</p>
                    <p className="font-medium text-text-primary">
                      {contest.durationMinutes ? `${contest.durationMinutes} minutes` : 'No limit'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-text-muted" />
                  <div>
                    <p className="text-sm text-text-muted">Questions</p>
                    <p className="font-medium text-text-primary">{contest.totalQuestions} total</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-text-muted" />
                  <div>
                    <p className="text-sm text-text-muted">Participants</p>
                    <p className="font-medium text-text-primary">{contest.participantCount} students</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-text-muted" />
                  <div>
                    <p className="text-sm text-text-muted">Schedule</p>
                    <p className="font-medium text-text-primary text-sm">
                      {format(contest.startTime, 'MMM d, yyyy HH:mm')}
                    </p>
                    <p className="text-sm text-text-muted">
                      to {format(contest.endTime, 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Visibility */}
            {(isActive || isCompleted) && (
              <div className={`rounded-xl border p-6 ${contest.resultsVisible
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                }`}>
                <div className="flex items-center gap-3 mb-3">
                  {contest.resultsVisible ? (
                    <Eye className="h-5 w-5 text-green-600" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-text-muted" />
                  )}
                  <h3 className="font-semibold text-text-primary">
                    {contest.resultsVisible ? 'Results Visible' : 'Results Hidden'}
                  </h3>
                </div>
                <p className="text-sm text-text-secondary mb-4">
                  {contest.resultsVisible
                    ? 'Students can see their exam results.'
                    : 'Results are hidden from students until you publish them.'}
                </p>
                <button
                  onClick={handleToggleResults}
                  disabled={toggleResultsMutation.isPending}
                  className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${contest.resultsVisible
                      ? 'bg-gray-100 dark:bg-gray-700 text-text-secondary hover:bg-gray-200'
                      : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                >
                  {contest.resultsVisible ? 'Hide Results' : 'Publish Results'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
