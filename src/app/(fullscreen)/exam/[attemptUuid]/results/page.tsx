'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Trophy,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  Headphones,
  BookOpen,
  PenTool,
  Mic,
  Download,
  BarChart3,
} from 'lucide-react';

import {
  useAttemptResult,
} from '@/domains/contest/queries/contest.queries';
import type {
  ListeningResult,
  ReadingResult,
  WritingResult,
  QuestionResult,
} from '@/domains/contest/models/domain';

const SECTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LISTENING: Headphones,
  READING: BookOpen,
  WRITING: PenTool,
  SPEAKING: Mic,
};

function getBandColor(score: number): string {
  if (score >= 8) return 'text-green-600 dark:text-green-400';
  if (score >= 7) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 6) return 'text-blue-600 dark:text-blue-400';
  if (score >= 5) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

function getBandBgColor(score: number): string {
  if (score >= 8) return 'bg-green-100 dark:bg-green-900/30';
  if (score >= 7) return 'bg-emerald-100 dark:bg-emerald-900/30';
  if (score >= 6) return 'bg-blue-100 dark:bg-blue-900/30';
  if (score >= 5) return 'bg-yellow-100 dark:bg-yellow-900/30';
  return 'bg-red-100 dark:bg-red-900/30';
}

export default function ExamResultsPage() {
  const params = useParams();
  const attemptUuid = params.attemptUuid as string;

  const { data: result, isLoading } = useAttemptResult(attemptUuid);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Results not available</h2>
          <p className="text-text-muted mb-4">
            Results may not be published yet or the exam was not submitted.
          </p>
          <Link href="/dashboard/exams" className="text-primary-600 hover:underline">
            Back to exams
          </Link>
        </div>
      </div>
    );
  }

  // Check if results are visible
  if (!result.contest.resultsVisible) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md">
          <Clock className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Results Pending</h2>
          <p className="text-text-muted mb-4">
            Your exam has been submitted successfully. Results will be available once your teacher publishes them.
          </p>
          <Link href="/dashboard/exams" className="text-primary-600 hover:underline">
            Back to exams
          </Link>
        </div>
      </div>
    );
  }

  const { scores, statistics, detailedResults } = result;
  const listeningResults = detailedResults?.listening;
  const readingResults = detailedResults?.reading;
  const writingResults = detailedResults?.writing;
  const overallScore = scores.overallScore ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-surface-elevated border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/dashboard/exams"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-text-secondary" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{result.contest.title}</h1>
              <p className="text-text-secondary">
                {result.contest.contestType.replace('_', ' ')} • {result.contest.difficulty}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Score Card */}
        <div className={`rounded-2xl p-8 mb-8 ${getBandBgColor(overallScore)} text-center`}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className={`h-10 w-10 ${getBandColor(overallScore)}`} />
            <span className="text-lg font-medium text-text-secondary">Overall Band Score</span>
          </div>
          <p className={`text-7xl font-bold ${getBandColor(overallScore)} mb-4`}>
            {overallScore.toFixed(1)}
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-text-muted">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              {statistics.correctAnswers} correct
            </span>
            <span className="flex items-center gap-1">
              <XCircle className="h-4 w-4 text-red-500" />
              {statistics.totalQuestions - statistics.correctAnswers} incorrect
            </span>
            <span className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              {((statistics.correctAnswers / statistics.totalQuestions) * 100).toFixed(0)}% accuracy
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {Math.round(statistics.timeSpentSeconds / 60)} min
            </span>
          </div>
        </div>

        {/* Section Scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {scores.listeningScore !== null && (
            <SectionScoreCard
              section="LISTENING"
              score={scores.listeningScore}
            />
          )}
          {scores.readingScore !== null && (
            <SectionScoreCard
              section="READING"
              score={scores.readingScore}
            />
          )}
          {scores.writingScore !== null && (
            <SectionScoreCard
              section="WRITING"
              score={scores.writingScore}
            />
          )}
          {scores.speakingScore !== null && (
            <SectionScoreCard
              section="SPEAKING"
              score={scores.speakingScore}
            />
          )}
        </div>

        {/* Detailed Results */}
        <div className="space-y-6">
          {/* Listening Results */}
          {listeningResults && listeningResults.length > 0 && (
            <div className="bg-surface-elevated rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                <Headphones className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-text-primary">Listening Results</h2>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {listeningResults.map((part: ListeningResult) => (
                  <div key={part.partNumber} className="px-6 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-text-primary">Part {part.partNumber}: {part.title}</h3>
                      </div>
                      <div className="text-sm text-text-muted">
                        {part.questions.filter((q: QuestionResult) => q.isCorrect).length} / {part.questions.length} correct
                      </div>
                    </div>
                    <div className="grid grid-cols-10 gap-2">
                      {part.questions.map((q: QuestionResult, qIndex: number) => (
                        <div
                          key={q.questionKey}
                          className={`w-full aspect-square rounded-lg flex items-center justify-center text-sm font-medium ${q.isCorrect
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            }`}
                        >
                          {qIndex + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reading Results */}
          {readingResults && readingResults.length > 0 && (
            <div className="bg-surface-elevated rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-semibold text-text-primary">Reading Results</h2>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {readingResults.map((passage: ReadingResult) => (
                  <div key={passage.passageNumber} className="px-6 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-text-primary">Passage {passage.passageNumber}: {passage.title}</h3>
                      </div>
                      <div className="text-sm text-text-muted">
                        {passage.questions.filter((q: QuestionResult) => q.isCorrect).length} / {passage.questions.length} correct
                      </div>
                    </div>
                    <div className="grid grid-cols-10 gap-2">
                      {passage.questions.map((q: QuestionResult, qIndex: number) => (
                        <div
                          key={q.questionKey}
                          className={`w-full aspect-square rounded-lg flex items-center justify-center text-sm font-medium ${q.isCorrect
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            }`}
                        >
                          {qIndex + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Writing Results */}
          {writingResults && writingResults.length > 0 && (
            <div className="bg-surface-elevated rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                <PenTool className="h-5 w-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-text-primary">Writing Results</h2>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {writingResults.map((task: WritingResult, index: number) => (
                  <div key={index} className="px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-text-primary">{task.taskTypeDisplay}</h3>
                        <p className="text-sm text-text-muted">{task.wordCount} words</p>
                      </div>
                      {task.score !== null && (
                        <div className={`text-2xl font-bold ${getBandColor(task.score)}`}>
                          {task.score.toFixed(1)}
                        </div>
                      )}
                    </div>

                    {/* Feedback */}
                    {task.feedback && (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-3">
                        {task.feedback.taskResponseOrAchievement && (
                          <div>
                            <p className="text-xs font-medium text-text-muted uppercase mb-1">Task Response</p>
                            <p className="text-sm text-text-primary">{task.feedback.taskResponseOrAchievement}</p>
                          </div>
                        )}
                        {task.feedback.coherenceAndCohesion && (
                          <div>
                            <p className="text-xs font-medium text-text-muted uppercase mb-1">Coherence & Cohesion</p>
                            <p className="text-sm text-text-primary">{task.feedback.coherenceAndCohesion}</p>
                          </div>
                        )}
                        {task.feedback.lexicalResource && (
                          <div>
                            <p className="text-xs font-medium text-text-muted uppercase mb-1">Lexical Resource</p>
                            <p className="text-sm text-text-primary">{task.feedback.lexicalResource}</p>
                          </div>
                        )}
                        {task.feedback.grammaticalRangeAndAccuracy && (
                          <div>
                            <p className="text-xs font-medium text-text-muted uppercase mb-1">Grammar</p>
                            <p className="text-sm text-text-primary">{task.feedback.grammaticalRangeAndAccuracy}</p>
                          </div>
                        )}
                        {task.feedback.overall && task.feedback.overall.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-text-muted uppercase mb-1">Overall Feedback</p>
                            {task.feedback.overall.map((comment: string, i: number) => (
                              <p key={i} className="text-sm text-text-primary">{comment}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/dashboard/exams"
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-text-primary rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Back to Exams
          </Link>
        </div>
      </div>
    </div>
  );
}

// Section Score Card Component
function SectionScoreCard({
  section,
  score,
}: {
  section: 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING';
  score: number;
}) {
  const Icon = SECTION_ICONS[section];
  const sectionNames: Record<string, string> = {
    LISTENING: 'Listening',
    READING: 'Reading',
    WRITING: 'Writing',
    SPEAKING: 'Speaking',
  };

  return (
    <div className="bg-surface-elevated rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-5 w-5 text-text-muted" />
        <span className="text-sm font-medium text-text-secondary">{sectionNames[section]}</span>
      </div>
      <p className={`text-3xl font-bold ${getBandColor(score)}`}>
        {score.toFixed(1)}
      </p>
    </div>
  );
}
