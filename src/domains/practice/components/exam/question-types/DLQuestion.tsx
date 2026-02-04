/**
 * Diagram Labeling (DL) Component
 * CD-IELTS authentic diagram labeling questions
 * Fill in labels for diagram parts with word answers
 */

'use client';

import { memo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { BlankInput } from './shared';
import type { AnswerState, ExamMode, DLLabel } from '@/domains/practice/models/question-types';

// ============= Types =============

export interface DLQuestionData {
  readonly id: number;
  readonly order: number;
  readonly text: string;
}

export interface DLDiagramData {
  readonly title: string;
  readonly visualDescription?: string;
  readonly labelCount: number;
  readonly labels: DLLabel[];
  readonly note?: string;
}

export interface DLProps {
  readonly title: string;
  readonly description: string;
  readonly diagramData: DLDiagramData;
  readonly questions: DLQuestionData[];
  readonly userAnswers: AnswerState;
  readonly onAnswer: (questionId: number, answer: string) => void;
  readonly onFocus?: (questionId: number) => void;
  readonly fontSize?: string;
  readonly mode?: ExamMode;
  readonly disabled?: boolean;
  readonly pictureUrl?: string;
  readonly highlightedQuestionId?: number | null;
}

// ============= Icons =============

const ImageIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
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

interface DiagramPlaceholderProps {
  title: string;
  visualDescription?: string;
}

const DiagramPlaceholder = memo(function DiagramPlaceholder({
  title,
  visualDescription,
}: DiagramPlaceholderProps) {
  return (
    <div className="mb-6 p-8 bg-neutral-100 dark:bg-neutral-800 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg text-center">
      <ImageIcon className="w-16 h-16 mx-auto mb-4 text-neutral-400" />
      <p className="text-neutral-600 dark:text-neutral-400 font-medium mb-2">
        {title}
      </p>
      {visualDescription && (
        <p className="text-sm text-neutral-500 dark:text-neutral-500 max-w-lg mx-auto">
          {visualDescription}
        </p>
      )}
      <p className="mt-4 text-xs text-neutral-400 dark:text-neutral-500">
        Diagram image would be displayed here
      </p>
    </div>
  );
});

interface LabelInfoBoxProps {
  labels: DLLabel[];
  fontSize?: string;
}

const LabelInfoBox = memo(function LabelInfoBox({ labels, fontSize }: LabelInfoBoxProps) {
  return (
    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded">
      <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">
        Labels to Complete
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {labels.map((label, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded',
              'bg-white dark:bg-slate-800',
              fontSize
            )}
          >
            <span className="font-bold text-blue-600 dark:text-blue-400">
              •
            </span>
            <span className="text-neutral-700 dark:text-neutral-300">
              {label.name || label.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

interface DLQuestionItemProps {
  question: DLQuestionData;
  answer: string;
  onAnswer: (answer: string) => void;
  onFocus?: () => void;
  fontSize?: string;
  disabled?: boolean;
  isHighlighted?: boolean;
}

const DLQuestionItem = memo(function DLQuestionItem({
  question,
  answer,
  onAnswer,
  onFocus,
  fontSize,
  disabled,
  isHighlighted,
}: DLQuestionItemProps) {
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
          isAnswered={Boolean(answer.trim())}
        />
        <span
          className="text-neutral-900 dark:text-white font-medium leading-relaxed pt-0.5"
          dangerouslySetInnerHTML={{ __html: question.text }}
        />
      </div>

      {/* Answer Input */}
      <div className="ml-10">
        <BlankInput
          value={answer}
          onChange={onAnswer}
          onFocus={onFocus}
          disabled={disabled}
          fontSize={fontSize}
          questionNumber={question.order}
          variant="block"
          placeholder="Type your answer"
        />
      </div>
    </div>
  );
});

// ============= Main Component =============

export const DLQuestion = memo(function DLQuestion({
  title,
  description,
  diagramData,
  questions,
  userAnswers,
  onAnswer,
  onFocus,
  fontSize = 'text-base',
  disabled = false,
  pictureUrl,
  highlightedQuestionId = null,
}: DLProps) {
  const handleAnswer = useCallback((questionId: number, answer: string) => {
    onAnswer(questionId, answer);
  }, [onAnswer]);

  return (
    <div className="dl-question-group">
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

      {/* Diagram Image or Placeholder */}
      {pictureUrl ? (
        <div className="mb-6">
          <img
            src={pictureUrl}
            alt={diagramData.title}
            className="max-w-full h-auto rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-md"
          />
        </div>
      ) : (
        <DiagramPlaceholder
          title={diagramData.title}
          visualDescription={diagramData.visualDescription}
        />
      )}

      {/* Note */}
      {diagramData.note && (
        <div className="mb-6 p-3 bg-neutral-100 dark:bg-neutral-800 rounded border-l-4 border-neutral-400">
          <p className={cn('text-sm text-neutral-600 dark:text-neutral-400 italic')}>
            {diagramData.note}
          </p>
        </div>
      )}

      {/* Label Info */}
      {diagramData.labels && diagramData.labels.length > 0 && (
        <LabelInfoBox labels={diagramData.labels} fontSize={fontSize} />
      )}

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question) => (
          <DLQuestionItem
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

export default DLQuestion;
