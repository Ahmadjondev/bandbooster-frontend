'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Save,
  CheckCircle2,
  PenTool,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';

import {
  useAttemptDetail,
  useGradeWritingTask,
} from '@/domains/contest/queries/contest.queries';
import type { WritingFeedback } from '@/domains/contest/models/domain';

interface GradeFormData {
  taskResponseScore: number;
  coherenceCohesionScore: number;
  lexicalResourceScore: number;
  grammaticalRangeScore: number;
  overallFeedback: string;
}

export default function GradeAttemptPage() {
  const params = useParams();
  const contestUuid = params.uuid as string;
  const attemptUuid = params.attemptUuid as string;

  const { data: attempt, isLoading, refetch } = useAttemptDetail(attemptUuid);
  const gradeWritingMutation = useGradeWritingTask();

  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [gradeForm, setGradeForm] = useState<GradeFormData>({
    taskResponseScore: 5,
    coherenceCohesionScore: 5,
    lexicalResourceScore: 5,
    grammaticalRangeScore: 5,
    overallFeedback: '',
  });
  const [saving, setSaving] = useState(false);

  // Get writing answers from attempt
  const writingAnswers = attempt?.questions?.filter(q => q.section === 'WRITING') || [];
  const currentWritingTask = writingAnswers[currentTaskIndex];

  // Reset form when task changes
  useEffect(() => {
    setGradeForm({
      taskResponseScore: 5,
      coherenceCohesionScore: 5,
      lexicalResourceScore: 5,
      grammaticalRangeScore: 5,
      overallFeedback: '',
    });
  }, [currentTaskIndex]);

  const calculateBandScore = (): number => {
    return (
      (gradeForm.taskResponseScore +
        gradeForm.coherenceCohesionScore +
        gradeForm.lexicalResourceScore +
        gradeForm.grammaticalRangeScore) /
      4
    );
  };

  const handleGrade = async () => {
    if (!attempt || !currentWritingTask) return;

    setSaving(true);
    try {
      const bandScore = calculateBandScore();
      const feedback: WritingFeedback = {
        taskResponseOrAchievement: `Score: ${gradeForm.taskResponseScore}/9`,
        coherenceAndCohesion: `Score: ${gradeForm.coherenceCohesionScore}/9`,
        lexicalResource: `Score: ${gradeForm.lexicalResourceScore}/9`,
        grammaticalRangeAndAccuracy: `Score: ${gradeForm.grammaticalRangeScore}/9`,
        overall: gradeForm.overallFeedback ? [gradeForm.overallFeedback] : undefined,
      };

      await gradeWritingMutation.mutateAsync({
        attemptUuid,
        taskId: currentWritingTask.id,
        score: bandScore,
        feedback,
      });

      // Move to next task or refetch
      if (currentTaskIndex < writingAnswers.length - 1) {
        setCurrentTaskIndex(currentTaskIndex + 1);
      } else {
        await refetch();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save grade');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Attempt not found</h2>
          <Link href={`/teacher/mock-exams/${contestUuid}/grading`} className="text-primary-600 hover:underline">
            Back to grading
          </Link>
        </div>
      </div>
    );
  }

  const hasWritingTasks = writingAnswers.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-surface-elevated border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href={`/teacher/mock-exams/${contestUuid}/grading`}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-text-secondary" />
            </Link>
          </div>

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                Grade Writing Submission
              </h1>
              <p className="text-text-secondary">
                {attempt.contest.title} • Submitted{' '}
                {attempt.submittedAt ? format(attempt.submittedAt, 'MMM d, yyyy HH:mm') : '-'}
              </p>
            </div>

            {attempt.overallScore !== null && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="font-semibold text-green-800 dark:text-green-300">
                  Score: {attempt.overallScore.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Header */}
        {hasWritingTasks && (
          <div className="flex items-center gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 px-4 py-3 font-medium text-primary-600 border-b-2 border-primary-600 -mb-px">
              <PenTool className="h-4 w-4" />
              Writing Tasks ({writingAnswers.length})
            </div>
          </div>
        )}

        {!hasWritingTasks ? (
          <div className="bg-surface-elevated rounded-xl border border-gray-200 dark:border-gray-700 p-16 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-text-secondary">No writing tasks to grade</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Student Response */}
            <div className="bg-surface-elevated rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text-primary">
                  Writing Task {currentTaskIndex + 1}
                </h2>
                <span className="text-sm text-text-muted">
                  {currentTaskIndex + 1} of {writingAnswers.length}
                </span>
              </div>

              {/* Task Prompt */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-sm font-medium text-text-muted mb-2">Task Prompt</p>
                <p className="text-text-primary">{currentWritingTask?.questionText}</p>
              </div>

              {/* Student Answer */}
              <div>
                <p className="text-sm font-medium text-text-muted mb-2">Student Response</p>
                <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg min-h-75 overflow-auto">
                  <p className="whitespace-pre-wrap">{currentWritingTask?.userAnswer || 'No response submitted'}</p>
                </div>
              </div>

              {/* Task Navigation */}
              {writingAnswers.length > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setCurrentTaskIndex(Math.max(0, currentTaskIndex - 1))}
                    disabled={currentTaskIndex === 0}
                    className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentTaskIndex(Math.min(writingAnswers.length - 1, currentTaskIndex + 1))}
                    disabled={currentTaskIndex === writingAnswers.length - 1}
                    className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Grading Form */}
            <div className="bg-surface-elevated rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-6">IELTS Writing Criteria</h2>

              <div className="space-y-6">
                <ScoreInput
                  label="Task Response"
                  description="How well the candidate addresses the task requirements"
                  value={gradeForm.taskResponseScore}
                  onChange={(v) => setGradeForm({ ...gradeForm, taskResponseScore: v })}
                />
                <ScoreInput
                  label="Coherence & Cohesion"
                  description="Organization, logical flow, and use of cohesive devices"
                  value={gradeForm.coherenceCohesionScore}
                  onChange={(v) => setGradeForm({ ...gradeForm, coherenceCohesionScore: v })}
                />
                <ScoreInput
                  label="Lexical Resource"
                  description="Range and accuracy of vocabulary"
                  value={gradeForm.lexicalResourceScore}
                  onChange={(v) => setGradeForm({ ...gradeForm, lexicalResourceScore: v })}
                />
                <ScoreInput
                  label="Grammatical Range & Accuracy"
                  description="Variety and correctness of grammar"
                  value={gradeForm.grammaticalRangeScore}
                  onChange={(v) => setGradeForm({ ...gradeForm, grammaticalRangeScore: v })}
                />

                {/* Feedback */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Overall Feedback
                  </label>
                  <textarea
                    value={gradeForm.overallFeedback}
                    onChange={(e) => setGradeForm({ ...gradeForm, overallFeedback: e.target.value })}
                    placeholder="Provide detailed feedback for the student..."
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>

                {/* Calculated Score */}
                <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <p className="text-sm text-text-muted mb-1">Calculated Band Score</p>
                  <p className="text-3xl font-bold text-primary-600">
                    {calculateBandScore().toFixed(1)}
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleGrade}
                  disabled={saving}
                  className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Save Grade
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Score Input Component
function ScoreInput({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-text-primary">{label}</label>
        <span className="text-lg font-bold text-primary-600">{value}</span>
      </div>
      <p className="text-xs text-text-muted mb-2">{description}</p>
      <input
        type="range"
        min={0}
        max={9}
        step={0.5}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
      />
      <div className="flex justify-between text-xs text-text-muted mt-1">
        <span>0</span>
        <span>9</span>
      </div>
    </div>
  );
}
