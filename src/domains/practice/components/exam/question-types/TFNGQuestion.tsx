/**
 * TFNG/YNNG (True/False/Not Given & Yes/No/Not Given) Component
 * CD-IELTS authentic statement verification questions
 * TFNG: Factual statements - Reading section
 * YNNG: Opinion/view statements - Reading section
 */

'use client';

import { memo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { AnswerState, TFNGAnswer, YNNGAnswer, ExamMode } from '@/domains/practice/models/question-types';

// ============= Types =============

export type StatementType = 'TFNG' | 'YNNG';

export interface TFNGQuestionData {
  readonly id: number;
  readonly order: number;
  readonly text: string;
}

export interface TFNGProps {
  readonly title: string;
  readonly description: string;
  readonly questions: TFNGQuestionData[];
  readonly userAnswers: AnswerState;
  readonly onAnswer: (questionId: number, answer: TFNGAnswer | YNNGAnswer) => void;
  readonly onFocus?: (questionId: number) => void;
  readonly fontSize?: string;
  readonly mode?: ExamMode;
  readonly disabled?: boolean;
  readonly type: StatementType;
  readonly highlightedQuestionId?: number | null;
}

// ============= Constants =============

const TFNG_OPTIONS: { key: TFNGAnswer; label: string; color: 'green' | 'red' | 'gray' }[] = [
  { key: 'TRUE', label: 'TRUE', color: 'green' },
  { key: 'FALSE', label: 'FALSE', color: 'red' },
  { key: 'NOT GIVEN', label: 'NOT GIVEN', color: 'gray' },
];

const YNNG_OPTIONS: { key: YNNGAnswer; label: string; color: 'green' | 'red' | 'gray' }[] = [
  { key: 'YES', label: 'YES', color: 'green' },
  { key: 'NO', label: 'NO', color: 'red' },
  { key: 'NOT GIVEN', label: 'NOT GIVEN', color: 'gray' },
];

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

interface RadioOptionProps {
  option: { key: string; label: string; color: 'green' | 'red' | 'gray' };
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  questionId: number;
  name: string;
}

const RadioOption = memo(function RadioOption({
  option,
  isSelected,
  onSelect,
  disabled,
  questionId,
  name,
}: RadioOptionProps) {
  const getSelectedColorClasses = () => {
    switch (option.color) {
      case 'green':
        return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
      case 'red':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'gray':
        return 'border-neutral-500 bg-neutral-100 dark:bg-neutral-700';
      default:
        return 'border-primary-500 bg-primary-50 dark:bg-primary-900/20';
    }
  };

  const getLabelColorClasses = () => {
    if (!isSelected) {
      return 'text-neutral-600 dark:text-neutral-400';
    }
    switch (option.color) {
      case 'green':
        return 'text-emerald-700 dark:text-emerald-300';
      case 'red':
        return 'text-red-700 dark:text-red-300';
      case 'gray':
        return 'text-neutral-700 dark:text-neutral-300';
      default:
        return 'text-primary-700 dark:text-primary-300';
    }
  };

  // Handle click without causing scroll
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (!disabled) {
      onSelect();
    }
  }, [disabled, onSelect]);

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'flex items-center gap-2.5 px-4 py-2.5',
        'border-2 rounded cursor-pointer',
        'transition-all duration-150',
        'hover:border-neutral-400 dark:hover:border-neutral-500',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
        isSelected
          ? getSelectedColorClasses()
          : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-slate-800',
        disabled && 'opacity-60 cursor-not-allowed'
      )}
    >
      {/* Custom radio indicator */}
      <span
        className={cn(
          'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
          'transition-colors duration-150',
          isSelected
            ? 'border-current'
            : 'border-neutral-400 dark:border-neutral-500'
        )}
      >
        {isSelected && (
          <span className="w-2 h-2 rounded-full bg-current" />
        )}
      </span>
      <span className={cn('text-sm font-semibold', getLabelColorClasses())}>
        {option.label}
      </span>
    </button>
  );
});

interface TFNGQuestionItemProps {
  question: TFNGQuestionData;
  selectedAnswer: string | undefined;
  onAnswer: (answer: string) => void;
  onFocus?: () => void;
  fontSize?: string;
  disabled?: boolean;
  options: typeof TFNG_OPTIONS | typeof YNNG_OPTIONS;
  isHighlighted?: boolean;
}

const TFNGQuestionItem = memo(function TFNGQuestionItem({
  question,
  selectedAnswer,
  onAnswer,
  onFocus,
  fontSize,
  disabled,
  options,
  isHighlighted,
}: TFNGQuestionItemProps) {
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

      {/* Options - Radio buttons with one selectable at a time */}
      <div className="ml-10 flex flex-col gap-3" role="radiogroup" aria-label={`Question ${question.order} options`}>
        {options.map((option) => (
          <RadioOption
            key={option.key}
            option={option}
            isSelected={selectedAnswer === option.key}
            onSelect={() => handleSelect(option.key)}
            disabled={disabled}
            questionId={question.id}
            name={`tfng-question-${question.id}`}
          />
        ))}
      </div>
    </div>
  );
});

// ============= Main Component =============

export const TFNGQuestion = memo(function TFNGQuestion({
  title,
  description,
  questions,
  userAnswers,
  onAnswer,
  onFocus,
  fontSize = 'text-base',
  disabled = false,
  type,
  highlightedQuestionId = null,
}: TFNGProps) {
  const options = type === 'YNNG' ? YNNG_OPTIONS : TFNG_OPTIONS;

  const handleAnswer = useCallback((questionId: number, answer: string) => {
    onAnswer(questionId, answer as TFNGAnswer | YNNGAnswer);
  }, [onAnswer]);

  return (
    <div className="tfng-question-group">
      {/* Section Header */}
      <div className="mb-6 pb-3 border-b border-neutral-200 dark:border-neutral-700">
        <h3 className={cn('font-bold text-neutral-900 dark:text-white', fontSize === 'text-lg' ? 'text-xl' : 'text-lg')}>
          {title}
        </h3>
      </div>

      {/* Instructions */}
      <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-400 dark:border-amber-500 rounded-r">
        <p
          className={cn('text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap', fontSize)}
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </div>

      {/* Legend we don't need this right now that's why it's commented out */}
      {/* <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {options.map((option) => (
            <div key={option.key} className="flex items-start gap-2">
              <span
                className={cn(
                  'px-2 py-0.5 text-xs font-bold rounded',
                  option.color === 'green' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
                  option.color === 'red' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
                  option.color === 'gray' && 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'
                )}
              >
                {option.label}
              </span>
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {type === 'TFNG' ? (
                  option.key === 'TRUE' ? 'if the statement agrees with the information' :
                    option.key === 'FALSE' ? 'if the statement contradicts the information' :
                      'if there is no information on this'
                ) : (
                  option.key === 'YES' ? 'if the statement agrees with the views of the writer' :
                    option.key === 'NO' ? 'if the statement contradicts the views of the writer' :
                      'if it is impossible to say what the writer thinks about this'
                )}
              </span>
            </div>
          ))}
        </div>
      </div> */}

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question) => (
          <TFNGQuestionItem
            key={question.id}
            question={question}
            selectedAnswer={userAnswers[question.id] as string | undefined}
            onAnswer={(answer) => handleAnswer(question.id, answer)}
            onFocus={() => onFocus?.(question.id)}
            fontSize={fontSize}
            disabled={disabled}
            options={options}
            isHighlighted={highlightedQuestionId === question.id}
          />
        ))}
      </div>
    </div>
  );
});

// ============= Convenience Exports =============

export const YNNGQuestion = memo(function YNNGQuestion(props: Omit<TFNGProps, 'type'>) {
  return <TFNGQuestion {...props} type="YNNG" />;
});

export default TFNGQuestion;
