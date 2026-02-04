'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Loader2,
  AlertCircle,
  ArrowRight,
  Clock,
  PenTool,
  Image as ImageIcon,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

import {
  useAttemptSectionData,
  useSubmitContestWriting,
  useAttemptDetail,
} from '@/domains/contest/queries/contest.queries';
import type { WritingTaskData } from '@/domains/contest/models/domain';
import { cn } from '@/lib/utils';

interface WritingAnswer {
  taskId: number;
  answerText: string;
  wordCount: number;
}

export default function ExamWritingSectionPage() {
  const params = useParams();
  const router = useRouter();
  const attemptUuid = params.attemptUuid as string;

  const [writingAnswers, setWritingAnswers] = useState<Record<number, WritingAnswer>>({});
  const [startTime] = useState<Date>(new Date());
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [activeTask, setActiveTask] = useState(1);
  const [showPrompt, setShowPrompt] = useState(true);

  // Fetch section data
  const { data: sectionData, isLoading, error } = useAttemptSectionData(attemptUuid, 'WRITING');
  const { data: attemptDetail } = useAttemptDetail(attemptUuid);
  const submitMutation = useSubmitContestWriting();

  // Calculate time remaining
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    if (sectionData?.timeRemaining) {
      setTimeRemaining(sectionData.timeRemaining);
    }
  }, [sectionData?.timeRemaining]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  // Sort tasks by task type (TASK_1 first, TASK_2 second)
  const sortedTasks = useMemo(() => {
    if (!sectionData?.tasks) return [];
    return [...sectionData.tasks].sort((a, b) => {
      if (a.taskType === 'TASK_1' && b.taskType === 'TASK_2') return -1;
      if (a.taskType === 'TASK_2' && b.taskType === 'TASK_1') return 1;
      return 0;
    });
  }, [sectionData?.tasks]);

  // Get active task
  const activeTaskData = useMemo(() => {
    return sortedTasks[activeTask - 1];
  }, [sortedTasks, activeTask]);

  // Initialize answers from existing user answers
  useEffect(() => {
    if (sectionData?.tasks) {
      const existingAnswers: Record<number, WritingAnswer> = {};
      sectionData.tasks.forEach((task: WritingTaskData) => {
        if (task.userAnswer) {
          existingAnswers[task.id] = {
            taskId: task.id,
            answerText: task.userAnswer,
            wordCount: task.userAnswer.split(/\s+/).filter(Boolean).length,
          };
        } else {
          existingAnswers[task.id] = {
            taskId: task.id,
            answerText: '',
            wordCount: 0,
          };
        }
      });
      setWritingAnswers(existingAnswers);
    }
  }, [sectionData?.tasks]);

  const handleTextChange = useCallback(
    (taskId: number, text: string) => {
      const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
      setWritingAnswers((prev) => ({
        ...prev,
        [taskId]: {
          taskId,
          answerText: text,
          wordCount,
        },
      }));
    },
    []
  );

  const handleAutoSubmit = useCallback(async () => {
    // Convert answers to API format
    const answers = Object.values(writingAnswers).map((wa) => ({
      taskId: wa.taskId,
      answerText: wa.answerText,
    }));

    try {
      await submitMutation.mutateAsync({
        attemptUuid,
        request: {
          writingAnswers: answers,
          startedAt: startTime,
          timeSpentSeconds: Math.floor((Date.now() - startTime.getTime()) / 1000),
        },
      });

      // Navigate to next section or results
      if (sectionData?.nextSectionName) {
        router.push(`/exam/${attemptUuid}/${sectionData.nextSectionName.toLowerCase()}`);
      } else {
        router.push(`/exam/${attemptUuid}/results`);
      }
    } catch (err) {
      console.error('Failed to submit:', err);
      alert('Failed to submit. Please try again.');
    }
  }, [writingAnswers, attemptUuid, startTime, submitMutation, sectionData, router]);

  const handleFinishSection = useCallback(() => {
    setShowFinishConfirm(true);
  }, []);

  const confirmFinish = useCallback(async () => {
    setShowFinishConfirm(false);
    await handleAutoSubmit();
  }, [handleAutoSubmit]);

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if minimum word count is met
  const currentAnswer = activeTaskData ? writingAnswers[activeTaskData.id] : null;
  const wordCountMet = currentAnswer
    ? currentAnswer.wordCount >= (activeTaskData?.minWords || 0)
    : false;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-text-muted">Loading writing section...</p>
        </div>
      </div>
    );
  }

  if (error || !sectionData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Failed to load section</h2>
          <p className="text-text-muted mb-4">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
          <Link href={`/exam/${attemptUuid}`} className="text-primary-600 hover:underline">
            Go back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Exam Header */}
      <header className="bg-surface-elevated border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <PenTool className="h-5 w-5 text-purple-600" />
            <div>
              <h1 className="font-semibold text-text-primary">
                {attemptDetail?.contest.title || 'IELTS Writing'}
              </h1>
              <p className="text-xs text-text-muted">Writing Section</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Task Navigation */}
            <div className="flex items-center gap-1">
              {sortedTasks.map((task: WritingTaskData, index: number) => {
                const answer = writingAnswers[task.id];
                const hasContent = answer?.answerText?.trim().length > 0;
                const meetsMinWords = answer?.wordCount >= task.minWords;

                return (
                  <button
                    key={task.id}
                    onClick={() => setActiveTask(index + 1)}
                    className={cn(
                      'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5',
                      activeTask === index + 1
                        ? 'bg-primary-600 text-white'
                        : hasContent && meetsMinWords
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : hasContent
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-gray-100 text-text-secondary hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
                    )}
                  >
                    <span>Task {index + 1}</span>
                    {hasContent && meetsMinWords && (
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Word Count */}
            <div className="text-sm text-text-secondary">
              <span
                className={cn(
                  'font-medium',
                  wordCountMet ? 'text-green-600' : 'text-orange-600'
                )}
              >
                {currentAnswer?.wordCount || 0}
              </span>
              <span className="text-text-muted">/{activeTaskData?.minWords || 0} words</span>
            </div>

            {/* Timer */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm ${timeRemaining < 600
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  : 'bg-gray-100 text-text-primary dark:bg-gray-800'
                }`}
            >
              <Clock className="h-4 w-4" />
              {formatTime(timeRemaining)}
            </div>

            {/* Finish Button */}
            <button
              onClick={handleFinishSection}
              disabled={submitMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {submitMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Finish Section</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex">
        {/* Prompt Panel */}
        <div
          className={cn(
            'transition-all duration-300 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto',
            showPrompt ? 'w-1/2' : 'w-0'
          )}
        >
          {showPrompt && activeTaskData && (
            <div className="p-6">
              {/* Task Header */}
              <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-gray-500 dark:text-gray-400">
                <FileText className="h-4 w-4" />
                <span>{activeTaskData.taskTypeDisplay}</span>
              </div>

              {/* Task Prompt */}
              <div className="prose prose-gray dark:prose-invert max-w-none mb-6">
                <div
                  dangerouslySetInnerHTML={{ __html: activeTaskData.prompt }}
                />
              </div>

              {/* Image if available */}
              {activeTaskData.picture && (
                <div className="mt-6 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <img
                    src={activeTaskData.picture}
                    alt="Task visual"
                    className="w-full h-auto"
                  />
                </div>
              )}

              {/* Minimum word count reminder */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Minimum word count:</strong> {activeTaskData.minWords} words
                </p>
                {activeTaskData.taskType === 'TASK_1' && (
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                    You should spend about 20 minutes on this task.
                  </p>
                )}
                {activeTaskData.taskType === 'TASK_2' && (
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                    You should spend about 40 minutes on this task.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setShowPrompt(!showPrompt)}
          className="absolute left-1/2 top-1/2 -translate-y-1/2 z-10 p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          style={{ left: showPrompt ? '50%' : '0' }}
        >
          {showPrompt ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>

        {/* Writing Panel */}
        <div className={cn('flex-1 flex flex-col', showPrompt ? 'w-1/2' : 'w-full')}>
          {/* Writing Controls */}
          <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-text-secondary">Your Response</span>
            <div className="flex items-center gap-4">
              <span
                className={cn(
                  'text-sm font-medium',
                  wordCountMet ? 'text-green-600' : 'text-orange-600'
                )}
              >
                {currentAnswer?.wordCount || 0} words
              </span>
              {!wordCountMet && (
                <span className="text-xs text-orange-500">
                  ({(activeTaskData?.minWords || 0) - (currentAnswer?.wordCount || 0)} more needed)
                </span>
              )}
            </div>
          </div>

          {/* Text Area */}
          <div className="flex-1 p-6">
            <textarea
              value={currentAnswer?.answerText || ''}
              onChange={(e) =>
                activeTaskData && handleTextChange(activeTaskData.id, e.target.value)
              }
              placeholder="Start writing your response here..."
              className="w-full h-full min-h-[500px] p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-base leading-relaxed"
              spellCheck
            />
          </div>

          {/* Task Navigation at Bottom */}
          <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between">
            <button
              onClick={() => setActiveTask((prev) => Math.max(1, prev - 1))}
              disabled={activeTask === 1}
              className="flex items-center gap-2 px-4 py-2 text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous Task
            </button>

            <span className="text-sm text-text-muted">
              Task {activeTask} of {sortedTasks.length}
            </span>

            <button
              onClick={() =>
                setActiveTask((prev) => Math.min(sortedTasks.length, prev + 1))
              }
              disabled={activeTask === sortedTasks.length}
              className="flex items-center gap-2 px-4 py-2 text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Task
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Finish Confirmation Modal */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface-elevated rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Finish Writing Section?
            </h3>

            {/* Task Status Summary */}
            <div className="space-y-2 mb-4">
              {sortedTasks.map((task: WritingTaskData, index: number) => {
                const answer = writingAnswers[task.id];
                const hasContent = answer?.answerText?.trim().length > 0;
                const meetsMinWords = answer?.wordCount >= task.minWords;

                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-text-secondary">Task {index + 1}</span>
                    <span
                      className={cn(
                        'font-medium',
                        !hasContent
                          ? 'text-red-500'
                          : meetsMinWords
                            ? 'text-green-600'
                            : 'text-orange-500'
                      )}
                    >
                      {!hasContent
                        ? 'Not started'
                        : meetsMinWords
                          ? `${answer?.wordCount} words ✓`
                          : `${answer?.wordCount}/${task.minWords} words`}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Warnings */}
            {sortedTasks.some((task: WritingTaskData) => {
              const answer = writingAnswers[task.id];
              return !answer?.answerText?.trim() || answer.wordCount < task.minWords;
            }) && (
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-sm text-orange-700 dark:text-orange-300 mb-4">
                  <strong>Warning:</strong> One or more tasks do not meet the minimum word count.
                  Incomplete tasks may affect your score.
                </div>
              )}

            <p className="text-sm text-text-secondary mb-4">
              {sectionData.nextSectionName
                ? `You will proceed to the ${sectionData.nextSectionName} section.`
                : 'This is the last section. Your exam will be submitted for grading.'}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="px-4 py-2 text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Continue Writing
              </button>
              <button
                onClick={confirmFinish}
                disabled={submitMutation.isPending}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {submitMutation.isPending ? 'Submitting...' : 'Finish Section'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
