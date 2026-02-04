/**
 * Form Completion (FC) Component
 * 
 * Renders IELTS Form Completion questions with exact visual match to reference.
 * 
 * Reference Image Structure:
 * - Bold title at top (e.g., "Building Work")
 * - Optional subtitle (e.g., "Address: 15 Hill Street")
 * - Section headers in bold (e.g., "Contact Information", "Kitchen")
 * - Bullet points with inline inputs
 * - Inputs appear exactly where <input> placeholders are in the text
 * 
 * API Structure:
 * question_data: {
 *   title: string,
 *   items: (string[] | { prefix?: string; items: string[] })[]
 * }
 */

'use client';

import React, { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { BlankInput } from './shared';
import type { AnswerState, ExamMode } from '@/domains/practice/models/question-types';

// ============= Types =============

export interface FCQuestionData {
  readonly id: number;
  readonly order: number;
  readonly text: string;
}

export interface FCFormData {
  readonly title: string;
  readonly items: (string[] | { title?: string; prefix?: string; items: string[] })[];
}

export interface FCExample {
  readonly question: string;
  readonly answer: string;
  readonly explanation?: string;
}

export interface FCProps {
  readonly title: string;
  readonly description: string;
  readonly formData: FCFormData;
  readonly questions: FCQuestionData[];
  readonly userAnswers: AnswerState;
  readonly onAnswer: (questionId: number, answer: string) => void;
  readonly onFocus?: (questionId: number) => void;
  readonly fontSize?: string;
  readonly mode?: ExamMode;
  readonly disabled?: boolean;
  readonly example?: FCExample;
  readonly highlightedQuestionId?: number | null;
}

// ============= Helper Functions =============

function isArrayRow(item: unknown): item is string[] {
  return Array.isArray(item) && item.every(i => typeof i === 'string');
}

function isObjectRow(item: unknown): item is { title?: string; prefix?: string; items: string[] } {
  return item !== null && typeof item === 'object' && 'items' in item && Array.isArray((item as { items: unknown }).items);
}

/**
 * Gets the section header text from an item (supports both 'title' and 'prefix')
 * 'title' takes precedence over 'prefix' for consistency
 */
function getSectionHeader(item: { title?: string; prefix?: string }): string | undefined {
  return item.title || item.prefix;
}

function countInputs(text: string): number {
  return (text.match(/<input>/gi) || []).length;
}

function buildInputPositions(
  items: FCFormData['items'],
  sortedQuestions: FCQuestionData[]
): FCQuestionData[] {
  const positions: FCQuestionData[] = [];
  let currentIndex = 0;

  for (const item of items) {
    if (isArrayRow(item)) {
      const value = item[1] || '';
      const inputCount = countInputs(value);
      for (let i = 0; i < inputCount; i++) {
        if (currentIndex < sortedQuestions.length) {
          positions.push(sortedQuestions[currentIndex]);
          currentIndex++;
        }
      }
    } else if (isObjectRow(item)) {
      // Check section header (title or prefix) for inputs
      const header = getSectionHeader(item);
      if (header) {
        const headerInputs = countInputs(header);
        for (let i = 0; i < headerInputs; i++) {
          if (currentIndex < sortedQuestions.length) {
            positions.push(sortedQuestions[currentIndex]);
            currentIndex++;
          }
        }
      }
      // Check each field item
      for (const field of item.items) {
        const inputCount = countInputs(field);
        for (let i = 0; i < inputCount; i++) {
          if (currentIndex < sortedQuestions.length) {
            positions.push(sortedQuestions[currentIndex]);
            currentIndex++;
          }
        }
      }
    }
  }

  return positions;
}

// ============= Inline Text Renderer =============

interface RenderInlineTextProps {
  text: string;
  inputPositions: FCQuestionData[];
  startIndex: number;
  questionMap: Map<number, { id: number; answer: string }>;
  onAnswer: (questionId: number, answer: string) => void;
  onFocus?: (questionId: number) => void;
  disabled?: boolean;
  fontSize?: string;
}

interface RenderResult {
  elements: React.ReactNode[];
  inputsConsumed: number;
}

/**
 * Renders text with inline inputs exactly where <input> placeholders appear.
 * The input sits on the same baseline as surrounding text.
 */
function renderInlineText({
  text,
  inputPositions,
  startIndex,
  questionMap,
  onAnswer,
  onFocus,
  disabled,
  fontSize,
}: RenderInlineTextProps): RenderResult {
  if (!text.includes('<input>')) {
    return {
      elements: [<span key="text" dangerouslySetInnerHTML={{ __html: text }} />],
      inputsConsumed: 0,
    };
  }

  const parts = text.split(/<input>/gi);
  const elements: React.ReactNode[] = [];
  let localIndex = startIndex;

  parts.forEach((part, index) => {
    if (part) {
      elements.push(
        <span key={`text-${index}`} dangerouslySetInnerHTML={{ __html: part }} />
      );
    }

    if (index < parts.length - 1) {
      const question = inputPositions[localIndex];
      if (question) {
        const data = questionMap.get(question.order);
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
        localIndex++;
      }
    }
  });

  return {
    elements,
    inputsConsumed: localIndex - startIndex,
  };
}

// ============= Main Component =============

export const FCQuestion = memo(function FCQuestion({
  title,
  description,
  formData,
  questions,
  userAnswers,
  onAnswer,
  onFocus,
  fontSize = 'text-base',
  disabled = false,
  example,
  highlightedQuestionId = null,
}: FCProps) {
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

  const sortedQuestions = useMemo(() => {
    return [...questions].sort((a, b) => a.order - b.order);
  }, [questions]);

  const inputPositions = useMemo(() => {
    const items = Array.isArray(formData.items) ? formData.items : [];
    return buildInputPositions(items, sortedQuestions);
  }, [formData.items, sortedQuestions]);

  // Render form content
  const formContent = useMemo(() => {
    const items = Array.isArray(formData.items) ? formData.items : [];
    const sections: React.ReactNode[] = [];
    let currentIndex = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (isArrayRow(item)) {
        // [label, value] format - render as "label: value" or just value
        const [label, value] = item;
        const hasLabel = label && label.trim() !== '';
        const hasValue = value && value.trim() !== '';

        // Check if this is a title row (no value, just label)
        if (hasLabel && !hasValue) {
          // This could be a subtitle like "Address: 15 Hill Street"
          sections.push(
            <div key={`row-${i}`} className={cn('text-neutral-900 dark:text-neutral-100', fontSize)}>
              <span dangerouslySetInnerHTML={{ __html: label }} />
            </div>
          );
        } else if (hasLabel || hasValue) {
          const textToRender = hasLabel && hasValue ? `${label}: ${value}` : (value || label);
          const result = renderInlineText({
            text: textToRender,
            inputPositions,
            startIndex: currentIndex,
            questionMap,
            onAnswer,
            onFocus,
            disabled,
            fontSize,
          });

          sections.push(
            <div
              key={`row-${i}`}
              className={cn(
                'flex items-baseline gap-1',
                'text-neutral-900 dark:text-neutral-100 leading-relaxed',
                fontSize
              )}
            >
              {hasLabel && !textToRender.includes(label + ':') && (
                <>
                  <span className="font-medium">{label}:</span>
                  <span className="inline">{result.elements}</span>
                </>
              )}
              {(textToRender.includes(label + ':') || !hasLabel) && result.elements}
            </div>
          );
          currentIndex += result.inputsConsumed;
        }
      } else if (isObjectRow(item)) {
        // Section with title/prefix and items
        const sectionItems: React.ReactNode[] = [];

        // Get section header (title takes precedence over prefix)
        const sectionHeader = getSectionHeader(item);

        // Render section header if present
        if (sectionHeader) {
          const headerResult = renderInlineText({
            text: sectionHeader,
            inputPositions,
            startIndex: currentIndex,
            questionMap,
            onAnswer,
            onFocus,
            disabled,
            fontSize,
          });

          sectionItems.push(
            <div
              key={`header-${i}`}
              className={cn(
                'font-bold text-neutral-900 dark:text-neutral-100 mt-4 mb-2',
                'border-b border-neutral-200 dark:border-neutral-700 pb-1',
                fontSize
              )}
            >
              {headerResult.elements}
            </div>
          );
          currentIndex += headerResult.inputsConsumed;
        }

        // Section items as bullet list
        const bulletItems: React.ReactNode[] = [];
        for (let j = 0; j < item.items.length; j++) {
          const fieldText = item.items[j];
          const result = renderInlineText({
            text: fieldText,
            inputPositions,
            startIndex: currentIndex,
            questionMap,
            onAnswer,
            onFocus,
            disabled,
            fontSize,
          });

          bulletItems.push(
            <li
              key={`item-${i}-${j}`}
              className={cn(
                'text-neutral-800 dark:text-neutral-200 leading-relaxed',
                fontSize
              )}
            >
              <span className="inline">{result.elements}</span>
            </li>
          );
          currentIndex += result.inputsConsumed;
        }

        if (bulletItems.length > 0) {
          sectionItems.push(
            <ul
              key={`list-${i}`}
              className="list-disc list-inside space-y-1.5 ml-1"
            >
              {bulletItems}
            </ul>
          );
        }

        sections.push(
          <div key={`section-${i}`} className="mb-3">
            {sectionItems}
          </div>
        );
      }
    }

    return sections;
  }, [formData.items, inputPositions, questionMap, onAnswer, onFocus, disabled, fontSize]);

  return (
    <div className="fc-question-group">
      {/* Section Header - Question Range */}
      <div className="mb-4">
        <h3 className={cn('font-bold text-neutral-900 dark:text-white', 'text-lg')}>
          {title}
        </h3>
      </div>

      {/* Instructions */}
      <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-400 dark:border-amber-500 rounded-r">
        <p
          className={cn('text-neutral-700 dark:text-neutral-300 leading-relaxed', fontSize)}
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </div>

      {/* Example (if provided) */}
      {example && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded">
          <p className={cn('font-semibold text-blue-800 dark:text-blue-200 mb-2', fontSize)}>
            Example:
          </p>
          <p className={cn('text-blue-700 dark:text-blue-300', fontSize)}>
            <span className="font-medium">Q:</span> {example.question}
          </p>
          <p className={cn('text-blue-700 dark:text-blue-300', fontSize)}>
            <span className="font-medium">A:</span>{' '}
            <span className="font-bold underline">{example.answer}</span>
          </p>
        </div>
      )}

      {/* Form Container - Clean paper-like appearance */}
      <div className={cn(
        'bg-white dark:bg-slate-800',
        'border border-neutral-200 dark:border-neutral-700 rounded-lg',
        'p-6'
      )}>
        {/* Form Title */}
        {formData.title && (
          <h4 className={cn(
            'font-bold text-neutral-900 dark:text-white mb-4',
            'text-lg'
          )}>
            {formData.title}
          </h4>
        )}

        {/* Form Content */}
        <div className="space-y-1">
          {formContent}
        </div>
      </div>
    </div>
  );
});

export default FCQuestion;
