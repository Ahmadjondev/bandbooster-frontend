/**
 * MCMA (Multiple Choice Multiple Answer) Component
 * CD-IELTS authentic multiple-answer multiple choice
 * Commonly used: "Choose THREE letters, A-G"
 */

'use client';

import { memo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { AnswerState, QuestionChoice, ExamMode } from '@/domains/practice/models/question-types';

// ============= Types =============

export interface MCMAQuestionData {
  readonly id: number;
  readonly order: number;
  readonly text: string;
  readonly choices: QuestionChoice[];
  readonly maxSelections?: number;
}

export interface MCMAProps {
  readonly title: string;
  readonly description: string;
  readonly questions: MCMAQuestionData[];
  readonly userAnswers: AnswerState;
  readonly onAnswer: (questionId: number, answer: string[]) => void;
  readonly onFocus?: (questionId: number) => void;
  readonly fontSize?: string;
  readonly mode?: ExamMode;
  readonly disabled?: boolean;
  readonly highlightedQuestionId?: number | null;
}

// ============= Icons =============

const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

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

interface CheckboxIndicatorProps {
  isSelected: boolean;
}

const CheckboxIndicator = memo(function CheckboxIndicator({ isSelected }: CheckboxIndicatorProps) {
  return (
    <span
      className={cn(
        'w-5 h-5 shrink-0 rounded border-2',
        'flex items-center justify-center',
        'transition-colors duration-150',
        isSelected
          ? 'border-primary-500 bg-primary-500'
          : 'border-neutral-400 dark:border-neutral-500'
      )}
    >
      {isSelected && (
        <CheckIcon className="w-3 h-3 text-white" />
      )}
    </span>
  );
});

interface MCMAOptionProps {
  option: QuestionChoice;
  isSelected: boolean;
  onToggle: () => void;
  disabled?: boolean;
  canSelect: boolean;
  fontSize?: string;
}

const MCMAOption = memo(function MCMAOption({
  option,
  isSelected,
  onToggle,
  disabled,
  canSelect,
  fontSize,
}: MCMAOptionProps) {
  const isDisabledByLimit = !isSelected && !canSelect;

  return (
    <label
      className={cn(
        'flex items-start gap-3 p-3',
        'border rounded cursor-pointer',
        'transition-colors duration-150',
        isSelected
          ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 dark:border-primary-400'
          : 'bg-white dark:bg-slate-800 border-neutral-200 dark:border-neutral-700',
        !isDisabledByLimit && !disabled && 'hover:bg-neutral-50 dark:hover:bg-slate-700/50',
        (disabled || isDisabledByLimit) && 'opacity-60 cursor-not-allowed'
      )}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggle}
        disabled={disabled || isDisabledByLimit}
        className="sr-only"
      />
      <CheckboxIndicator isSelected={isSelected} />
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

interface SelectionCounterProps {
  current: number;
  max: number;
}

const SelectionCounter = memo(function SelectionCounter({ current, max }: SelectionCounterProps) {
  const isComplete = current === max;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium',
        isComplete
          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
          : 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
      )}
    >
      {isComplete ? (
        <>
          <CheckIcon className="w-4 h-4" />
          {current}/{max} selected
        </>
      ) : (
        <>Select {max - current} more</>
      )}
    </span>
  );
});

interface MCMAQuestionItemProps {
  question: MCMAQuestionData;
  selectedAnswers: string[];
  onAnswer: (answers: string[]) => void;
  onFocus?: () => void;
  fontSize?: string;
  disabled?: boolean;
  isHighlighted?: boolean;
}

const MCMAQuestionItem = memo(function MCMAQuestionItem({
  question,
  selectedAnswers,
  onAnswer,
  onFocus,
  fontSize,
  disabled,
  isHighlighted,
}: MCMAQuestionItemProps) {
  const maxSelections = question.maxSelections ?? 3;
  const canSelectMore = selectedAnswers.length < maxSelections;

  const handleToggle = useCallback((key: string) => {
    if (disabled) return;

    let newAnswers: string[];
    if (selectedAnswers.includes(key)) {
      // Deselect
      newAnswers = selectedAnswers.filter(a => a !== key);
    } else if (canSelectMore) {
      // Select
      newAnswers = [...selectedAnswers, key].sort();
    } else {
      return;
    }

    onAnswer(newAnswers);
    onFocus?.();
  }, [selectedAnswers, canSelectMore, onAnswer, onFocus, disabled]);

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
          isAnswered={selectedAnswers.length === maxSelections}
        />
        <div className="flex-1">
          <span
            className="text-neutral-900 dark:text-white font-medium leading-relaxed"
            dangerouslySetInnerHTML={{ __html: question.text }}
          />
          <div className="mt-2">
            <SelectionCounter current={selectedAnswers.length} max={maxSelections} />
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="ml-10 space-y-2">
        {question.choices.map((option) => (
          <MCMAOption
            key={option.key}
            option={option}
            isSelected={selectedAnswers.includes(option.key)}
            onToggle={() => handleToggle(option.key)}
            disabled={disabled}
            canSelect={canSelectMore}
            fontSize={fontSize}
          />
        ))}
      </div>
    </div>
  );
});

// ============= Main Component =============

export const MCMAQuestion = memo(function MCMAQuestion({
  title,
  description,
  questions,
  userAnswers,
  onAnswer,
  onFocus,
  fontSize = 'text-base',
  disabled = false,
  highlightedQuestionId = null,
}: MCMAProps) {
  const handleAnswer = useCallback((questionId: number, answers: string[]) => {
    onAnswer(questionId, answers);
  }, [onAnswer]);

  return (
    <div className="mcma-question-group">
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
        {questions.map((question) => {
          const answers = userAnswers[question.id];
          const selectedAnswers = Array.isArray(answers) ? answers : (answers ? [answers] : []);

          return (
            <MCMAQuestionItem
              key={question.id}
              question={question}
              selectedAnswers={selectedAnswers}
              onAnswer={(answers) => handleAnswer(question.id, answers)}
              onFocus={() => onFocus?.(question.id)}
              fontSize={fontSize}
              disabled={disabled}
              isHighlighted={highlightedQuestionId === question.id}
            />
          );
        })}
      </div>
    </div>
  );
});

export default MCMAQuestion;
