/**
 * Sentence Completion (SC) Component
 * CD-IELTS authentic sentence completion with inline inputs
 * Each sentence is independent - no pronoun chains
 */

'use client';

import { memo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { BlankInput } from './shared';
import type { AnswerState, ExamMode } from '@/domains/practice/models/question-types';

// ============= Types =============

export interface SCQuestionData {
  readonly id: number;
  readonly order: number;
  readonly text: string; // Contains <input> placeholder
}

export interface SCProps {
  readonly title: string;
  readonly description: string;
  readonly questions: SCQuestionData[];
  readonly userAnswers: AnswerState;
  readonly onAnswer: (questionId: number, answer: string) => void;
  readonly onFocus?: (questionId: number) => void;
  readonly fontSize?: string;
  readonly mode?: ExamMode;
  readonly disabled?: boolean;
  readonly highlightedQuestionId?: number | null;
}

// ============= Sub-Components =============

interface QuestionBadgeProps {
  order: number;
  isAnswered: boolean;
}

const QuestionBadge = memo(function QuestionBadge({ order, isAnswered }: QuestionBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center',
        'min-w-7 h-7 px-1.5',
        'text-sm font-semibold rounded',
        'border shrink-0',
        isAnswered
          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-300 dark:border-primary-700'
          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600'
      )}
    >
      {order}
    </span>
  );
});

interface SCQuestionItemProps {
  question: SCQuestionData;
  answer: string;
  onAnswer: (answer: string) => void;
  onFocus?: () => void;
  fontSize?: string;
  disabled?: boolean;
  isHighlighted?: boolean;
}

const SCQuestionItem = memo(function SCQuestionItem({
  question,
  answer,
  onAnswer,
  onFocus,
  fontSize,
  disabled,
  isHighlighted,
}: SCQuestionItemProps) {
  // Render text with inline input
  const renderTextWithInput = () => {
    const text = question.text;

    if (!text.includes('<input>')) {
      return (
        <span dangerouslySetInnerHTML={{ __html: text }} />
      );
    }

    const parts = text.split(/<input>/gi);

    return (
      <span className="inline">
        {parts.map((part, index) => (
          <span key={index}>
            <span dangerouslySetInnerHTML={{ __html: part }} />
            {index < parts.length - 1 && (
              <BlankInput
                value={answer}
                onChange={onAnswer}
                onFocus={onFocus}
                disabled={disabled}
                fontSize={fontSize}
                questionNumber={question.order}
                variant="inline"
                placeholder="..."
              />
            )}
          </span>
        ))}
      </span>
    );
  };

  return (
    <div
      data-question-order={question.order}
      data-question-id={question.id}
      className={cn('mb-6 last:mb-0', isHighlighted && 'question-highlight')}
    >
      <div className={cn('flex items-start gap-3', fontSize)}>
        <QuestionBadge
          order={question.order}
          isAnswered={Boolean(answer.trim())}
        />
        <div className="flex-1 text-neutral-900 dark:text-white leading-relaxed pt-0.5">
          {renderTextWithInput()}
        </div>
      </div>
    </div>
  );
});

// ============= Main Component =============

export const SCQuestion = memo(function SCQuestion({
  title,
  description,
  questions,
  userAnswers,
  onAnswer,
  onFocus,
  fontSize = 'text-base',
  disabled = false,
  highlightedQuestionId = null,
}: SCProps) {
  const handleAnswer = useCallback((questionId: number, answer: string) => {
    onAnswer(questionId, answer);
  }, [onAnswer]);

  return (
    <div className="sc-question-group">
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

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question) => (
          <SCQuestionItem
            key={question.id}
            question={question}
            answer={(userAnswers[question.id] as string) || ''}
            onAnswer={(answer) => handleAnswer(question.id, answer)}
            onFocus={() => onFocus?.(question.id)}
            fontSize={fontSize}
            disabled={disabled}
            isHighlighted={highlightedQuestionId === question.id}
          />
        ))}
      </div>
    </div>
  );
});

export default SCQuestion;
