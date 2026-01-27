/**
 * Flow Chart Completion (FCC) Component
 * CD-IELTS authentic flow chart/process completion
 * Sequential steps with arrows and inputs
 */

'use client';

import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { BlankInput } from './shared';
import type { AnswerState, ExamMode, FCCStep } from '@/domains/practice/models/question-types';

// ============= Types =============

export interface FCCQuestionData {
  readonly id: number;
  readonly order: number;
  readonly text: string;
}

export interface FCCFlowData {
  readonly title: string;
  readonly flowDescription?: string;
  readonly steps: FCCStep[];
}

export interface FCCProps {
  readonly title: string;
  readonly description: string;
  readonly flowData: FCCFlowData;
  readonly questions: FCCQuestionData[];
  readonly userAnswers: AnswerState;
  readonly onAnswer: (questionId: number, answer: string) => void;
  readonly onFocus?: (questionId: number) => void;
  readonly fontSize?: string;
  readonly mode?: ExamMode;
  readonly disabled?: boolean;
  readonly highlightedQuestionId?: number | null;
}

// ============= Icons =============

const ArrowDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </svg>
);

// ============= Sub-Components =============

interface FlowStepProps {
  step: FCCStep;
  stepIndex: number;
  totalSteps: number;
  sortedQuestions: FCCQuestionData[];
  questionMap: Map<number, { id: number; answer: string }>;
  onAnswer: (questionId: number, answer: string) => void;
  onFocus?: (questionId: number) => void;
  disabled?: boolean;
  fontSize?: string;
  isHighlighted?: boolean;
}

const FlowStep = memo(function FlowStep({
  step,
  stepIndex,
  totalSteps,
  sortedQuestions,
  questionMap,
  onAnswer,
  onFocus,
  disabled,
  fontSize,
  isHighlighted,
}: FlowStepProps) {
  // Guard against undefined step
  if (!step) return null;

  // Find the question for this step
  const question = sortedQuestions[stepIndex];
  const data = question ? questionMap.get(question.order) : null;

  const renderStepContent = () => {
    const text = step.text || '';

    if (!text.includes('<input>')) {
      return <span dangerouslySetInnerHTML={{ __html: text }} />;
    }

    const parts = text.split('<input>');
    const elements: React.ReactNode[] = [];

    parts.forEach((part, index) => {
      elements.push(
        <span key={`text-${index}`} dangerouslySetInnerHTML={{ __html: part }} />
      );

      if (index < parts.length - 1 && question) {
        elements.push(
          <BlankInput
            key={`input-${question.id}`}
            value={data?.answer || ''}
            onChange={(v) => onAnswer(question.id, v)}
            onFocus={() => onFocus?.(question.id)}
            disabled={disabled}
            fontSize={fontSize}
            questionNumber={question.order}
            variant="inline"
          />
        );
      }
    });

    return <>{elements}</>;
  };

  const isLastStep = stepIndex === totalSteps - 1;

  return (
    <>
      {/* Step Box */}
      <div
        data-question-order={question?.order}
        data-question-id={question?.id}
        className={cn(
          'flex items-start gap-4 p-4',
          'bg-white dark:bg-slate-800',
          'border border-neutral-200 dark:border-neutral-700 rounded-lg',
          'shadow-sm',
          isHighlighted && 'question-highlight'
        )}
      >
        {/* Step Number */}
        <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-primary-500 text-white rounded-full font-bold text-sm shadow-md">
          {step.stepNumber || stepIndex + 1}
        </div>

        {/* Step Content */}
        <div className={cn('flex-1 text-neutral-800 dark:text-neutral-200 leading-relaxed pt-2', fontSize)}>
          {renderStepContent()}
        </div>
      </div>

      {/* Arrow (except after last step) */}
      {!isLastStep && (
        <div className="flex justify-center my-3">
          <ArrowDownIcon className="w-8 h-8 text-primary-400 dark:text-primary-500" />
        </div>
      )}
    </>
  );
});

// ============= Main Component =============

export const FCCQuestion = memo(function FCCQuestion({
  title,
  description,
  flowData,
  questions,
  userAnswers,
  onAnswer,
  onFocus,
  fontSize = 'text-base',
  disabled = false,
  highlightedQuestionId = null,
}: FCCProps) {
  // Build question map
  const questionMap = useMemo(() => {
    const map = new Map<number, { id: number; answer: string }>();
    questions.forEach(q => {
      map.set(q.order, {
        id: q.id,
        answer: (userAnswers[q.id] as string) || '',
      });
    });
    return map;
  }, [questions, userAnswers]);

  // Sort questions by order
  const sortedQuestions = useMemo(() => {
    return [...questions].sort((a, b) => a.order - b.order);
  }, [questions]);

  return (
    <div className="fcc-question-group">
      {/* Section Header */}
      <div className="mb-6 pb-3 border-b border-neutral-200 dark:border-neutral-700">
        <h3 className={cn('font-bold text-neutral-900 dark:text-white', fontSize === 'text-lg' ? 'text-xl' : 'text-lg')}>
          {title}
        </h3>
      </div>

      {/* Instructions */}
      <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-400 dark:border-amber-500 rounded-r">
        <p className={cn('text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap', fontSize)}>
          {description}
        </p>
      </div>

      {/* Flow Chart Title */}
      {flowData.title && (
        <div className="mb-4 text-center">
          <h4 className={cn('font-bold text-neutral-900 dark:text-white', fontSize === 'text-lg' ? 'text-xl' : 'text-lg')}>
            {flowData.title}
          </h4>
          {flowData.flowDescription && (
            <p className={cn('mt-2 text-neutral-600 dark:text-neutral-400', fontSize)}>
              {flowData.flowDescription}
            </p>
          )}
        </div>
      )}

      {/* Flow Chart Container */}
      <div className="max-w-2xl mx-auto p-6 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-200 dark:border-neutral-700">
        {Array.isArray(flowData.steps) && flowData.steps.map((step, index) => {
          const stepQuestion = sortedQuestions[index];
          return (
            <FlowStep
              key={step?.stepNumber || index}
              step={step}
              stepIndex={index}
              totalSteps={flowData.steps.length}
              sortedQuestions={sortedQuestions}
              questionMap={questionMap}
              onAnswer={onAnswer}
              onFocus={onFocus}
              disabled={disabled}
              fontSize={fontSize}
              isHighlighted={stepQuestion && highlightedQuestionId === stepQuestion.id}
            />
          );
        })}
      </div>
    </div>
  );
});

export default FCCQuestion;
