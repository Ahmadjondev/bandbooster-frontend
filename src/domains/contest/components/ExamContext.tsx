'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { SectionName, ContestAttemptDetail } from '@/domains/contest/models/domain';

// ============= Types =============

interface ExamAnswer {
  questionKey: string;
  answer: string | string[];
}

interface ExamContextValue {
  // Attempt data
  attempt: ContestAttemptDetail | null;
  currentSection: SectionName | null;

  // Timer
  timeRemainingSeconds: number;
  isTimeWarning: boolean;

  // Answers
  answers: Record<string, ExamAnswer>;
  setAnswer: (questionKey: string, answer: string | string[]) => void;
  getAnswer: (questionKey: string) => string | string[] | undefined;

  // Navigation
  currentQuestionIndex: number;
  setCurrentQuestionIndex: (index: number) => void;
  totalQuestions: number;

  // Section state
  isSectionCompleted: (section: SectionName) => boolean;
  completeSection: (section: SectionName) => void;

  // Submission
  isSubmitting: boolean;
  submitSection: () => Promise<void>;
  submitExam: () => Promise<void>;
}

// ============= Context =============

const ExamContext = createContext<ExamContextValue | null>(null);

export function useExamContext(): ExamContextValue {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExamContext must be used within an ExamProvider');
  }
  return context;
}

// ============= Provider Props =============

interface ExamProviderProps {
  children: ReactNode;
  attempt: ContestAttemptDetail;
  currentSection: SectionName;
  onSectionComplete?: () => void;
  onExamSubmit?: () => void;
}

// ============= Provider Component =============

export function ExamProvider({
  children,
  attempt,
  currentSection,
  onSectionComplete,
  onExamSubmit,
}: ExamProviderProps) {
  // Answers state - keyed by questionKey
  const [answers, setAnswers] = useState<Record<string, ExamAnswer>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(attempt.timeRemainingSeconds);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSections, setCompletedSections] = useState<SectionName[]>(attempt.sectionsCompleted);

  // Initialize answers from attempt
  useEffect(() => {
    if (attempt.questions) {
      const initialAnswers: Record<string, ExamAnswer> = {};
      attempt.questions
        .filter((q) => q.section === currentSection)
        .forEach((q) => {
          if (q.userAnswer) {
            initialAnswers[q.questionKey] = {
              questionKey: q.questionKey,
              answer: q.userAnswer,
            };
          }
        });
      setAnswers(initialAnswers);
    }
  }, [attempt.questions, currentSection]);

  // Timer countdown
  useEffect(() => {
    if (timeRemainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemainingSeconds]);

  // Time warning threshold (5 minutes)
  const isTimeWarning = timeRemainingSeconds < 300;

  // Get section questions count
  const sectionQuestions = attempt.questions?.filter((q) => q.section === currentSection) ?? [];
  const totalQuestions = sectionQuestions.length;

  // Answer management
  const setAnswer = useCallback((questionKey: string, answer: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionKey]: { questionKey, answer },
    }));
  }, []);

  const getAnswer = useCallback(
    (questionKey: string): string | string[] | undefined => {
      return answers[questionKey]?.answer;
    },
    [answers]
  );

  // Section completion check
  const isSectionCompleted = useCallback(
    (section: SectionName): boolean => {
      return completedSections.includes(section);
    },
    [completedSections]
  );

  const completeSection = useCallback((section: SectionName) => {
    setCompletedSections((prev) => [...new Set([...prev, section])]);
    onSectionComplete?.();
  }, [onSectionComplete]);

  // Submit current section
  const submitSection = useCallback(async () => {
    setIsSubmitting(true);
    try {
      // TODO: Call API to submit section answers
      // await contestApi.submitSectionAnswers(attempt.uuid, currentSection, Object.values(answers));

      completeSection(currentSection);
    } finally {
      setIsSubmitting(false);
    }
  }, [attempt.uuid, currentSection, answers, completeSection]);

  // Submit entire exam
  const submitExam = useCallback(async () => {
    setIsSubmitting(true);
    try {
      // TODO: Call API to submit exam
      // await contestApi.submitContest(attempt.uuid);

      onExamSubmit?.();
    } finally {
      setIsSubmitting(false);
    }
  }, [attempt.uuid, onExamSubmit]);

  const contextValue: ExamContextValue = {
    attempt,
    currentSection,
    timeRemainingSeconds,
    isTimeWarning,
    answers,
    setAnswer,
    getAnswer,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    totalQuestions,
    isSectionCompleted,
    completeSection,
    isSubmitting,
    submitSection,
    submitExam,
  };

  return (
    <ExamContext.Provider value={contextValue}>
      {children}
    </ExamContext.Provider>
  );
}

// ============= Hooks =============

/**
 * Hook to track answer changes and sync with server
 */
export function useExamAnswerSync(debounceMs = 1000) {
  const { answers, attempt, currentSection } = useExamContext();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // Debounced sync
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (Object.keys(answers).length === 0 || !attempt) return;

      setIsSyncing(true);
      try {
        // TODO: Call API to save draft answers
        // await contestApi.saveDraftAnswers(attempt.uuid, currentSection, Object.values(answers));
        setLastSyncedAt(new Date());
      } catch (error) {
        console.error('Failed to sync answers:', error);
      } finally {
        setIsSyncing(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [answers, attempt, currentSection, debounceMs]);

  return { isSyncing, lastSyncedAt };
}

/**
 * Hook to handle time-based auto-submission
 */
export function useExamAutoSubmit() {
  const { timeRemainingSeconds, submitExam, isSubmitting } = useExamContext();

  useEffect(() => {
    if (timeRemainingSeconds === 0 && !isSubmitting) {
      // Auto-submit when time runs out
      submitExam().catch(console.error);
    }
  }, [timeRemainingSeconds, submitExam, isSubmitting]);
}
