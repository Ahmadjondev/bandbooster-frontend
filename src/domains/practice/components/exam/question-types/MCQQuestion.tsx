/**
 * MCQ (Multiple Choice Question) Component
 * CD-IELTS authentic single-answer multiple choice
 * Used in both Listening and Reading sections
 */

'use client';

import { memo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { AnswerState, QuestionChoice, ExamMode } from '@/domains/practice/models/question-types';

// ============= Types =============

export interface MCQQuestionData {
  readonly id: number;
  readonly order: number;
  readonly text: string;
  readonly choices: QuestionChoice[];
}

export interface MCQProps {
  readonly title: string;
  readonly description: string;
  readonly questions: MCQQuestionData[];
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

interface OptionLetterProps {
  letter: string;
  isSelected: boolean;
}

const OptionLetter = memo(function OptionLetter({ letter, isSelected }: OptionLetterProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center',
        'w-6 h-6 text-sm font-bold rounded',
        'transition-colors duration-150',
        isSelected
          ? 'bg-primary-500 text-white'
          : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
      )}
    >
      {letter}
    </span>
  );
});

interface RadioIndicatorProps {
  isSelected: boolean;
}

const RadioIndicator = memo(function RadioIndicator({ isSelected }: RadioIndicatorProps) {
  return (
    <span
      className={cn(
        'w-5 h-5 shrink-0 rounded-full border-2',
        'flex items-center justify-center',
        'transition-colors duration-150',
        isSelected
          ? 'border-primary-500 bg-primary-500'
          : 'border-neutral-400 dark:border-neutral-500'
      )}
    >
      {isSelected && (
        <span className="w-2 h-2 bg-white rounded-full" />
      )}
    </span>
  );
});

interface MCQOptionProps {
  option: QuestionChoice;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  fontSize?: string;
}

const MCQOption = memo(function MCQOption({
  option,
  isSelected,
  onSelect,
  disabled,
  fontSize,
}: MCQOptionProps) {
  return (
    <label
      className={cn(
        'flex items-start gap-3 p-3',
        'border rounded cursor-pointer',
        'transition-colors duration-150',
        isSelected
          ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 dark:border-primary-400'
          : 'bg-white dark:bg-slate-800 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-slate-700/50',
        disabled && 'opacity-60 cursor-not-allowed'
      )}
    >
      <input
        type="radio"
        checked={isSelected}
        onChange={onSelect}
        disabled={disabled}
        className="sr-only"
      />
      <RadioIndicator isSelected={isSelected} />
      <span className={cn('flex items-start gap-2 flex-1', fontSize)}>
        <OptionLetter letter={option.key} isSelected={isSelected} />
        <span
          className={cn(
            'text-neutral-800 dark:text-neutral-200 leading-relaxed',
            isSelected && 'text-primary-700 dark:text-primary-300'
          )}
          dangerouslySetInnerHTML={{ __html: option.text }}
        />
      </span>
    </label>
  );
});

interface MCQQuestionItemProps {
  question: MCQQuestionData;
  selectedAnswer: string | undefined;
  onAnswer: (answer: string) => void;
  onFocus?: () => void;
  fontSize?: string;
  disabled?: boolean;
  isHighlighted?: boolean;
}

const MCQQuestionItem = memo(function MCQQuestionItem({
  question,
  selectedAnswer,
  onAnswer,
  onFocus,
  fontSize,
  disabled,
  isHighlighted,
}: MCQQuestionItemProps) {
  const handleSelect = useCallback((key: string) => {
    if (!disabled) {
      onAnswer(key);
      onFocus?.();
    }
  }, [onAnswer, onFocus, disabled]);

  return (
    <div
      data-question-order={question.order}
      data-question-id={question.id}
      className={cn('mb-6 last:mb-0', isHighlighted && 'question-highlight')}
    >
      {/* Question Text */}
      <div className={cn('flex items-start gap-3 mb-4', fontSize)}>
        <QuestionBadge
          order={question.order}
          isAnswered={Boolean(selectedAnswer)}
        />
        <span
          className="text-neutral-900 dark:text-white font-medium leading-relaxed pt-0.5"
          dangerouslySetInnerHTML={{ __html: question.text }}
        />
      </div>

      {/* Options */}
      <div className="ml-10 space-y-2">
        {question.choices.map((option) => (
          <MCQOption
            key={option.key}
            option={option}
            isSelected={selectedAnswer === option.key}
            onSelect={() => handleSelect(option.key)}
            disabled={disabled}
            fontSize={fontSize}
          />
        ))}
      </div>
    </div>
  );
});

// ============= Main Component =============

export const MCQQuestion = memo(function MCQQuestion({
  title,
  description,
  questions,
  userAnswers,
  onAnswer,
  onFocus,
  fontSize = 'text-base',
  disabled = false,
  highlightedQuestionId = null,
}: MCQProps) {
  const handleAnswer = useCallback((questionId: number, answer: string) => {
    onAnswer(questionId, answer);
  }, [onAnswer]);

  return (
    <div className="mcq-question-group">
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
      <div className="space-y-8">
        {questions.map((question) => (
          <MCQQuestionItem
            key={question.id}
            question={question}
            selectedAnswer={userAnswers[question.id] as string | undefined}
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

export default MCQQuestion;
