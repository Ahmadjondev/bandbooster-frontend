'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Loader2, AlertCircle, ArrowRight, Clock, BookOpen, Check } from 'lucide-react';
import Link from 'next/link';

import {
  useAttemptSectionData,
  useSubmitContestAttempt,
  useAttemptDetail,
} from '@/domains/contest/queries/contest.queries';
import { ReadingPassage } from '@/domains/practice/components/exam/ReadingPassage';
import { ReadingSplitter } from '@/domains/practice/components/exam/ReadingSplitter';
import type { ReadingPassageData, TestHead, SectionQuestion } from '@/domains/contest/models/domain';
import { cn } from '@/lib/utils';

// Simple Question Components for Exam Mode
interface SimpleQuestionProps {
  question: SectionQuestion;
  testHead: TestHead;
  userAnswer: string | string[] | undefined;
  onAnswer: (answer: string | string[]) => void;
}

function SimpleQuestion({ question, testHead, userAnswer, onAnswer }: SimpleQuestionProps) {
  const questionType = question.questionType.toUpperCase();
  const isAnswered = userAnswer !== undefined && userAnswer !== '';

  // MCQ / TFNG / YNNG - Single choice from options
  if (['MCQ', 'TFNG', 'YNNG'].includes(questionType)) {
    const options = question.options || testHead.options || [];
    return (
      <div id={`question-${question.id}`} className="mb-4">
        <div className="flex items-start gap-2 mb-2">
          <span className={cn(
            'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
            isAnswered ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          )}>
            {question.orderIndex}
          </span>
          <p className="text-text-primary" dangerouslySetInnerHTML={{ __html: question.questionText }} />
        </div>
        <div className="ml-8 space-y-2">
          {options.map((opt) => (
            <label
              key={opt}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                userAnswer === opt
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              )}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                checked={userAnswer === opt}
                onChange={() => onAnswer(opt)}
                className="sr-only"
              />
              <span className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                userAnswer === opt ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
              )}>
                {userAnswer === opt && <Check className="w-3 h-3 text-white" />}
              </span>
              <span className="text-text-primary">{opt}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  // MCMA - Multiple choice multiple answer
  if (questionType === 'MCMA') {
    const options = question.options || testHead.options || [];
    const selectedAnswers = Array.isArray(userAnswer) ? userAnswer : [];

    return (
      <div id={`question-${question.id}`} className="mb-4">
        <div className="flex items-start gap-2 mb-2">
          <span className={cn(
            'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
            isAnswered ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          )}>
            {question.orderIndex}
          </span>
          <p className="text-text-primary" dangerouslySetInnerHTML={{ __html: question.questionText }} />
        </div>
        <div className="ml-8 space-y-2">
          {options.map((opt) => (
            <label
              key={opt}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                selectedAnswers.includes(opt)
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              )}
            >
              <input
                type="checkbox"
                checked={selectedAnswers.includes(opt)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onAnswer([...selectedAnswers, opt]);
                  } else {
                    onAnswer(selectedAnswers.filter((a) => a !== opt));
                  }
                }}
                className="sr-only"
              />
              <span className={cn(
                'w-5 h-5 rounded border-2 flex items-center justify-center',
                selectedAnswers.includes(opt) ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
              )}>
                {selectedAnswers.includes(opt) && <Check className="w-3 h-3 text-white" />}
              </span>
              <span className="text-text-primary">{opt}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  // SA / SC / NC / TC / FC / FCC / SUC / MH / MI / MF / ML / DL - Text input
  return (
    <div id={`question-${question.id}`} className="mb-4">
      <div className="flex items-center gap-2">
        <span className={cn(
          'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
          isAnswered ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        )}>
          {question.orderIndex}
        </span>
        <span className="text-text-primary" dangerouslySetInnerHTML={{ __html: question.questionText }} />
        <input
          type="text"
          value={typeof userAnswer === 'string' ? userAnswer : ''}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder="Your answer..."
          className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
    </div>
  );
}

export default function ExamReadingSectionPage() {
  const params = useParams();
  const router = useRouter();
  const attemptUuid = params.attemptUuid as string;

  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [startTime] = useState<Date>(new Date());
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [activePassage, setActivePassage] = useState(1);
  const [leftWidthPercent, setLeftWidthPercent] = useState(50);
  const [fontSize, setFontSize] = useState('text-base');
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch section data
  const { data: sectionData, isLoading, error } = useAttemptSectionData(attemptUuid, 'READING');
  const { data: attemptDetail } = useAttemptDetail(attemptUuid);
  const submitMutation = useSubmitContestAttempt();

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

  // Sort passages by number
  const sortedPassages = useMemo(() => {
    if (!sectionData?.passages) return [];
    return [...sectionData.passages].sort((a, b) => a.passageNumber - b.passageNumber);
  }, [sectionData?.passages]);

  // Get active passage
  const activePassageData = useMemo(() => {
    return sortedPassages.find((p) => p.passageNumber === activePassage) || sortedPassages[0];
  }, [sortedPassages, activePassage]);

  // Calculate total questions
  const totalQuestions = useMemo(() => {
    let count = 0;
    sortedPassages.forEach((passage: ReadingPassageData) => {
      passage.testHeads?.forEach((th: TestHead) => {
        count += th.questions?.length || 0;
      });
    });
    return count;
  }, [sortedPassages]);

  // Initialize answers from existing user answers
  useEffect(() => {
    if (sectionData?.passages) {
      const existingAnswers: Record<number, string | string[]> = {};
      sectionData.passages.forEach((passage: ReadingPassageData) => {
        passage.testHeads?.forEach((th: TestHead) => {
          th.questions?.forEach((q: SectionQuestion) => {
            if (q.userAnswer) {
              existingAnswers[q.id] = q.userAnswer;
            }
          });
        });
      });
      if (Object.keys(existingAnswers).length > 0) {
        setAnswers(existingAnswers);
      }
    }
  }, [sectionData?.passages]);

  const handleAnswer = useCallback((questionId: number, answer: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  }, []);

  const handleAutoSubmit = useCallback(async () => {
    // Convert answers to API format
    const formattedAnswers: Record<string, string> = {};
    Object.entries(answers).forEach(([id, answer]) => {
      formattedAnswers[id] = Array.isArray(answer) ? answer.join(',') : answer;
    });

    try {
      await submitMutation.mutateAsync({
        attemptUuid,
        request: {
          answers: formattedAnswers,
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
  }, [answers, attemptUuid, startTime, submitMutation, sectionData, router]);

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

  // Count answered questions
  const answeredCount = Object.keys(answers).filter((id) => {
    const val = answers[parseInt(id)];
    if (Array.isArray(val)) return val.length > 0;
    return val?.toString().trim() !== '';
  }).length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-text-muted">Loading reading section...</p>
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
            <BookOpen className="h-5 w-5 text-green-600" />
            <div>
              <h1 className="font-semibold text-text-primary">
                {attemptDetail?.contest.title || 'IELTS Reading'}
              </h1>
              <p className="text-xs text-text-muted">Reading Section</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Passage Navigation */}
            <div className="flex items-center gap-1">
              {sortedPassages.map((passage: ReadingPassageData) => (
                <button
                  key={passage.passageNumber}
                  onClick={() => setActivePassage(passage.passageNumber)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                    activePassage === passage.passageNumber
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-text-secondary hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
                  )}
                >
                  Passage {passage.passageNumber}
                </button>
              ))}
            </div>

            {/* Progress */}
            <div className="text-sm text-text-secondary">
              <span className="font-medium text-primary-600">{answeredCount}</span>
              <span className="text-text-muted">/{totalQuestions} answered</span>
            </div>

            {/* Timer */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-sm ${timeRemaining < 300
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

      {/* Main Content - Split View */}
      <main className="flex-1 flex" ref={containerRef}>
        {/* Passage Panel */}
        <div
          className="h-[calc(100vh-64px)] overflow-hidden"
          style={{ width: `${leftWidthPercent}%` }}
        >
          {activePassageData && (
            <ReadingPassage
              title={activePassageData.title}
              content={activePassageData.content}
              passageNumber={activePassageData.passageNumber}
              wordCount={activePassageData.wordCount}
            />
          )}
        </div>

        {/* Splitter */}
        <ReadingSplitter
          leftWidthPercent={leftWidthPercent}
          onWidthChange={setLeftWidthPercent}
          containerRef={containerRef}
        />

        {/* Questions Panel */}
        <div
          className="h-[calc(100vh-64px)] overflow-y-auto bg-white dark:bg-slate-900"
          style={{ width: `${100 - leftWidthPercent}%` }}
        >
          <div className="p-6">
            {/* Font Size Controls */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-text-primary">
                Questions for Passage {activePassage}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">Font:</span>
                {(['text-sm', 'text-base', 'text-lg'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setFontSize(size)}
                    className={cn(
                      'px-2 py-1 text-xs rounded transition-colors',
                      fontSize === size
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                    )}
                  >
                    {size === 'text-sm' ? 'S' : size === 'text-base' ? 'M' : 'L'}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions */}
            <div className={cn('space-y-6', fontSize)}>
              {activePassageData?.testHeads?.map((testHead: TestHead) => (
                <div key={testHead.id} className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="font-medium text-text-primary mb-2">{testHead.title}</h3>
                    <div
                      className="text-sm text-text-secondary prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: testHead.instructions }}
                    />
                  </div>

                  {testHead.questions?.map((question: SectionQuestion) => (
                    <SimpleQuestion
                      key={question.id}
                      question={question}
                      testHead={testHead}
                      userAnswer={answers[question.id]}
                      onAnswer={(answer) => handleAnswer(question.id, answer)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Finish Confirmation Modal */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface-elevated rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Finish Reading Section?
            </h3>
            <p className="text-text-muted mb-4">
              You have answered {answeredCount} out of {totalQuestions} questions.
              {answeredCount < totalQuestions && (
                <span className="text-orange-500 block mt-2">
                  Warning: You have {totalQuestions - answeredCount} unanswered questions.
                </span>
              )}
            </p>
            <p className="text-sm text-text-secondary mb-4">
              {sectionData.nextSectionName
                ? `You will proceed to the ${sectionData.nextSectionName} section.`
                : 'This is the last section. Your exam will be submitted.'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="px-4 py-2 text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Continue Exam
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
