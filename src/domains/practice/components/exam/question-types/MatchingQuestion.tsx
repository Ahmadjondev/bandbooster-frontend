/**
 * Matching Questions Components (MH, MI, MF, ML)
 * CD-IELTS authentic matching question types:
 * - MH: Matching Headings (Roman numerals)
 * - MI: Matching Information (Paragraph letters)
 * - MF: Matching Features (Person/theory letters)
 * - ML: Map Labeling (Location letters)
 */

'use client';

import { memo, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { AnswerState, ExamMode, MatchingOption } from '@/domains/practice/models/question-types';

// ============= Types =============

export type MatchingType = 'MH' | 'MI' | 'MF' | 'ML';

export interface MatchingQuestionData {
  readonly id: number;
  readonly order: number;
  readonly text: string;
}

export interface MatchingExample {
  readonly question: string;
  readonly answer: string;
  readonly explanation?: string;
}

export interface MatchingProps {
  readonly title: string;
  readonly description: string;
  readonly options: MatchingOption[];
  readonly questions: MatchingQuestionData[];
  readonly userAnswers: AnswerState;
  readonly onAnswer: (questionId: number, answer: string) => void;
  readonly onFocus?: (questionId: number) => void;
  readonly fontSize?: string;
  readonly mode?: ExamMode;
  readonly disabled?: boolean;
  readonly matchingType: MatchingType;
  readonly note?: string;
  readonly example?: MatchingExample;
  readonly allowDuplicates?: boolean;
  readonly pictureUrl?: string;
  readonly highlightedQuestionId?: number | null;
}

// ============= Icons =============

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
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

interface OptionsBoxProps {
  options: MatchingOption[];
  usedValues: string[];
  allowDuplicates?: boolean;
  fontSize?: string;
  matchingType: MatchingType;
}

const OptionsBox = memo(function OptionsBox({
  options,
  usedValues,
  allowDuplicates,
  fontSize,
  matchingType,
}: OptionsBoxProps) {
  // Get title based on matching type
  const getTitle = () => {
    switch (matchingType) {
      case 'MH':
        return 'List of Headings';
      case 'MI':
        return 'Paragraphs';
      case 'MF':
        return 'List of People/Theories';
      case 'ML':
        return 'Locations';
      default:
        return 'Options';
    }
  };

  return (
    <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded">
      <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
        {getTitle()}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {options.map((option, index) => {
          const isUsed = !allowDuplicates && usedValues.includes(option.key);
          return (
            <div
              key={`option-${option.key}-${index}`}
              className={cn(
                'flex items-start gap-2 px-3 py-2 rounded',
                'transition-colors',
                isUsed
                  ? 'bg-neutral-200 dark:bg-neutral-700 opacity-50'
                  : 'bg-white dark:bg-slate-800',
                fontSize
              )}
            >
              <span className="font-bold text-primary-600 dark:text-primary-400 shrink-0">
                {option.key}.
              </span>
              <span className="text-neutral-700 dark:text-neutral-300">
                {option.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

interface ExampleBoxProps {
  example: MatchingExample;
  fontSize?: string;
}

const ExampleBox = memo(function ExampleBox({ example, fontSize }: ExampleBoxProps) {
  return (
    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded">
      <div className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">
        Example
      </div>
      <div className={cn('text-neutral-800 dark:text-neutral-200 mb-2', fontSize)}>
        {example.question}
      </div>
      <div className={cn('font-bold text-primary-600 dark:text-primary-400', fontSize)}>
        Answer: {example.answer}
      </div>
      {example.explanation && (
        <div className={cn('mt-2 text-sm text-neutral-600 dark:text-neutral-400 italic')}>
          {example.explanation}
        </div>
      )}
    </div>
  );
});

interface MatchingQuestionItemProps {
  question: MatchingQuestionData;
  selectedAnswer: string | undefined;
  options: MatchingOption[];
  onAnswer: (answer: string) => void;
  onFocus?: () => void;
  fontSize?: string;
  disabled?: boolean;
  isHighlighted?: boolean;
}

const MatchingQuestionItem = memo(function MatchingQuestionItem({
  question,
  selectedAnswer,
  options,
  onAnswer,
  onFocus,
  fontSize,
  disabled,
  isHighlighted,
}: MatchingQuestionItemProps) {
  const handleSelect = useCallback((value: string) => {
    if (!disabled) {
      onAnswer(value);
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
      <div className={cn('flex items-start gap-3 mb-3', fontSize)}>
        <QuestionBadge
          order={question.order}
          isAnswered={Boolean(selectedAnswer)}
        />
        <span
          className="text-neutral-900 dark:text-white font-medium leading-relaxed pt-0.5"
          dangerouslySetInnerHTML={{ __html: question.text }}
        />
      </div>

      {/* Dropdown */}
      <div className="ml-10">
        <div className="relative inline-block">
          <select
            value={selectedAnswer || ''}
            onChange={(e) => handleSelect(e.target.value)}
            disabled={disabled}
            className={cn(
              'w-full max-w-xs appearance-none',
              'px-4 py-2 pr-10',
              'border-2 rounded',
              'font-medium',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-1',
              'cursor-pointer',
              selectedAnswer
                ? 'border-primary-400 dark:border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-slate-800 text-neutral-900 dark:text-neutral-100',
              'focus:border-primary-500 focus:ring-primary-500',
              disabled && 'opacity-60 cursor-not-allowed',
              fontSize
            )}
          >
            <option value="" className="text-neutral-400">
              Select an answer...
            </option>
            {options.map((option, index) => (
              <option key={`${question.id}-option-${option.key}-${index}`} value={option.key}>
                {option.key}. {option.text}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
});

// ============= Main Component =============

export const MatchingQuestion = memo(function MatchingQuestion({
  title,
  description,
  options,
  questions,
  userAnswers,
  onAnswer,
  onFocus,
  fontSize = 'text-base',
  disabled = false,
  matchingType,
  note,
  example,
  allowDuplicates = false,
  pictureUrl,
  highlightedQuestionId = null,
}: MatchingProps) {
  // Track used values
  const usedValues = useMemo(() => {
    return Object.values(userAnswers)
      .filter((answer): answer is string => typeof answer === 'string' && answer.trim() !== '');
  }, [userAnswers]);

  const handleAnswer = useCallback((questionId: number, answer: string) => {
    onAnswer(questionId, answer);
  }, [onAnswer]);

  return (
    <div className="matching-question-group">
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

      {/* Note */}
      {note && (
        <div className="mb-6 p-3 bg-neutral-100 dark:bg-neutral-800 rounded border-l-4 border-neutral-400">
          <p className={cn('text-sm text-neutral-600 dark:text-neutral-400 italic')}>
            {note}
          </p>
        </div>
      )}

      {/* Example */}
      {example && <ExampleBox example={example} fontSize={fontSize} />}

      {/* Picture (for ML - Map Labeling) */}
      {pictureUrl && (
        <div className="mb-6">
          <img
            src={pictureUrl}
            alt="Map/Diagram"
            className="max-w-full h-auto rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-md"
          />
        </div>
      )}

      {/* Options Box */}
      <OptionsBox
        options={options}
        usedValues={usedValues}
        allowDuplicates={allowDuplicates}
        fontSize={fontSize}
        matchingType={matchingType}
      />

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question) => (
          <MatchingQuestionItem
            key={question.id}
            question={question}
            selectedAnswer={userAnswers[question.id] as string | undefined}
            options={options}
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

// ============= Convenience Exports =============

export const MHQuestion = memo(function MHQuestion(
  props: Omit<MatchingProps, 'matchingType'>
) {
  return <MatchingQuestion {...props} matchingType="MH" />;
});

export const MIQuestion = memo(function MIQuestion(
  props: Omit<MatchingProps, 'matchingType'>
) {
  return <MatchingQuestion {...props} matchingType="MI" allowDuplicates />;
});

export const MFQuestion = memo(function MFQuestion(
  props: Omit<MatchingProps, 'matchingType'>
) {
  return <MatchingQuestion {...props} matchingType="MF" allowDuplicates />;
});

export const MLQuestion = memo(function MLQuestion(
  props: Omit<MatchingProps, 'matchingType'>
) {
  return <MatchingQuestion {...props} matchingType="ML" />;
});

export default MatchingQuestion;
