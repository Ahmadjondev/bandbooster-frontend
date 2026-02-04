'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Loader2, AlertCircle, ArrowRight, Clock, Headphones, Check, Play, Pause, Volume2 } from 'lucide-react';
import Link from 'next/link';

import {
  useAttemptSectionData,
  useSubmitContestAttempt,
  useAttemptDetail,
} from '@/domains/contest/queries/contest.queries';
import type { ListeningPartData, TestHead, SectionQuestion } from '@/domains/contest/models/domain';
import { cn } from '@/lib/utils';

// Simple Audio Player Component
interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  onEnded?: () => void;
}

function SimpleAudioPlayer({ audioUrl, title, onEnded }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
        onEnded={() => {
          setIsPlaying(false);
          onEnded?.();
        }}
      />
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-colors"
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Volume2 className="h-4 w-4 text-text-muted" />
            <span className="text-sm font-medium text-text-primary">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">{formatTime(currentTime)}</span>
            <div className="flex-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 transition-all"
                style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
              />
            </div>
            <span className="text-xs text-text-muted">{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Question Component
interface SimpleQuestionProps {
  question: SectionQuestion;
  testHead: TestHead;
  userAnswer: string | string[] | undefined;
  onAnswer: (answer: string | string[]) => void;
}

function SimpleQuestion({ question, testHead, userAnswer, onAnswer }: SimpleQuestionProps) {
  const questionType = question.questionType.toUpperCase();
  const isAnswered = userAnswer !== undefined && userAnswer !== '';

  // MCQ / TFNG / YNNG - Single choice
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

  // MCMA - Multiple choice
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

  // Text input for other question types
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

export default function ExamListeningSectionPage() {
  const params = useParams();
  const router = useRouter();
  const attemptUuid = params.attemptUuid as string;

  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [startTime] = useState<Date>(new Date());
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [activePart, setActivePart] = useState(1);

  // Fetch section data
  const { data: sectionData, isLoading, error } = useAttemptSectionData(attemptUuid, 'LISTENING');
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

  // Sort parts by number
  const sortedParts = useMemo(() => {
    if (!sectionData?.parts) return [];
    return [...sectionData.parts].sort((a, b) => a.partNumber - b.partNumber);
  }, [sectionData?.parts]);

  // Get active part
  const activePartData = useMemo(() => {
    return sortedParts.find((p) => p.partNumber === activePart) || sortedParts[0];
  }, [sortedParts, activePart]);

  // Calculate total questions
  const totalQuestions = useMemo(() => {
    let count = 0;
    sortedParts.forEach((part: ListeningPartData) => {
      part.testHeads?.forEach((th: TestHead) => {
        count += th.questions?.length || 0;
      });
    });
    return count;
  }, [sortedParts]);

  // Initialize answers from existing user answers
  useEffect(() => {
    if (sectionData?.parts) {
      const existingAnswers: Record<number, string | string[]> = {};
      sectionData.parts.forEach((part: ListeningPartData) => {
        part.testHeads?.forEach((th: TestHead) => {
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
  }, [sectionData?.parts]);

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
          <p className="text-text-muted">Loading listening section...</p>
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
            <Headphones className="h-5 w-5 text-blue-600" />
            <div>
              <h1 className="font-semibold text-text-primary">
                {attemptDetail?.contest.title || 'IELTS Listening'}
              </h1>
              <p className="text-xs text-text-muted">Listening Section</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Part Navigation */}
            <div className="flex items-center gap-1">
              {sortedParts.map((part: ListeningPartData) => (
                <button
                  key={part.partNumber}
                  onClick={() => setActivePart(part.partNumber)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                    activePart === part.partNumber
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-text-secondary hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
                  )}
                >
                  Part {part.partNumber}
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

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {/* Audio Player */}
        {activePartData?.audioUrl && (
          <div className="mb-6">
            <SimpleAudioPlayer
              audioUrl={activePartData.audioUrl}
              title={`Part ${activePartData.partNumber}: ${activePartData.title}`}
            />
          </div>
        )}

        {/* Part Description */}
        {activePartData?.description && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-200">{activePartData.description}</p>
          </div>
        )}

        {/* Questions */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-6">
            Part {activePartData?.partNumber}: {activePartData?.title}
          </h2>

          <div className="space-y-6">
            {activePartData?.testHeads?.map((testHead: TestHead) => (
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
      </main>

      {/* Finish Confirmation Modal */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface-elevated rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Finish Listening Section?
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
