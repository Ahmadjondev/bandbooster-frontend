/**
 * Note Completion (NC) Component
 * 
 * Renders IELTS Note Completion questions with exact visual match to reference.
 * 
 * Reference Image Structure (The Lontar Palm):
 * - Title at top (e.g., "The Lontar Palm")
 * - Section headers in bold (e.g., "The tree", "People climbing the trees")
 * - Bullet points with inline inputs at exact positions
 * - Sub-sections with proper indentation (e.g., "The leaf is used:")
 * - Text flows naturally with inputs appearing inline
 * 
 * API Structure:
 * question_data: {
 *   title: string,
 *   items: (string | { prefix?: string, items: (string | NCNoteItem)[] })[]
 * }
 */

'use client';

import React, { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { BlankInput } from './shared';
import type { AnswerState, ExamMode } from '@/domains/practice/models/question-types';

// ============= Types =============

/**
 * NCNoteItem supports both 'title' and 'prefix' for section headers.
 * - 'title' is the preferred property (matches standard IELTS format)
 * - 'prefix' is kept for backward compatibility
 * The component will check for 'title' first, then fall back to 'prefix'
 */
export type NCNoteItem = string | {
  readonly title?: string;
  readonly prefix?: string;  // Deprecated: use 'title' instead
  readonly items: NCNoteItem[];
};

export interface NCQuestionData {
  readonly id: number;
  readonly order: number;
  readonly text: string;
}

export interface NCNoteData {
  readonly title?: string;
  readonly items: NCNoteItem[];
}

export interface NCProps {
  readonly title: string;
  readonly description: string;
  readonly noteData: NCNoteData;
  readonly questions: NCQuestionData[];
  readonly userAnswers: AnswerState;
  readonly onAnswer: (questionId: number, answer: string) => void;
  readonly onFocus?: (questionId: number) => void;
  readonly fontSize?: string;
  readonly mode?: ExamMode;
  readonly disabled?: boolean;
  readonly highlightedQuestionId?: number | null;
}

// ============= Helper Functions =============

/**
 * Gets the section header text from an item (supports both 'title' and 'prefix')
 */
function getSectionHeader(item: NCNoteItem): string | undefined {
  if (typeof item === 'string') return undefined;
  return item.title || item.prefix;
}

function buildInputPositionMap(
  items: NCNoteItem[],
  sortedQuestions: NCQuestionData[]
): NCQuestionData[] {
  const positions: NCQuestionData[] = [];
  let currentIndex = 0;

  function processItem(item: NCNoteItem) {
    if (typeof item === 'string') {
      const inputCount = (item.match(/<input>/gi) || []).length;
      for (let i = 0; i < inputCount; i++) {
        if (currentIndex < sortedQuestions.length) {
          positions.push(sortedQuestions[currentIndex]);
          currentIndex++;
        }
      }
    } else if (item && typeof item === 'object') {
      // Process section header (title or prefix) for inputs
      const header = getSectionHeader(item);
      if (header) {
        const headerInputs = (header.match(/<input>/gi) || []).length;
        for (let i = 0; i < headerInputs; i++) {
          if (currentIndex < sortedQuestions.length) {
            positions.push(sortedQuestions[currentIndex]);
            currentIndex++;
          }
        }
      }
      // Process nested items
      if (Array.isArray(item.items)) {
        item.items.forEach(processItem);
      }
    }
  }

  items.forEach(processItem);
  return positions;
}

// ============= Inline Text Renderer =============

interface RenderInlineTextProps {
  text: string;
  inputPositions: NCQuestionData[];
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

// ============= Note Item Renderer =============

interface RenderNoteItemProps {
  item: NCNoteItem;
  inputPositions: NCQuestionData[];
  startIndex: number;
  questionMap: Map<number, { id: number; answer: string }>;
  onAnswer: (questionId: number, answer: string) => void;
  onFocus?: (questionId: number) => void;
  disabled?: boolean;
  fontSize?: string;
  depth?: number;
  itemKey: string | number;
}

interface NoteItemResult {
  element: React.ReactNode;
  inputsConsumed: number;
}

/**
 * Recursively renders note items with proper hierarchy and indentation.
 */
function renderNoteItem({
  item,
  inputPositions,
  startIndex,
  questionMap,
  onAnswer,
  onFocus,
  disabled,
  fontSize,
  depth = 0,
  itemKey,
}: RenderNoteItemProps): NoteItemResult {
  // Handle string items (leaf nodes with text)
  if (typeof item === 'string') {
    const result = renderInlineText({
      text: item,
      inputPositions,
      startIndex,
      questionMap,
      onAnswer,
      onFocus,
      disabled,
      fontSize,
    });

    return {
      element: (
        <li
          key={itemKey}
          className={cn(
            'text-neutral-800 dark:text-neutral-200 leading-relaxed',
            fontSize
          )}
        >
          <span className="inline">{result.elements}</span>
        </li>
      ),
      inputsConsumed: result.inputsConsumed,
    };
  }

  // Handle nested object items with title/prefix
  if (!item || typeof item !== 'object') {
    return { element: null, inputsConsumed: 0 };
  }

  const subItems = Array.isArray(item.items) ? item.items : [];
  let currentIndex = startIndex;
  const content: React.ReactNode[] = [];

  // Get section header (title takes precedence over prefix)
  const sectionHeader = item.title || item.prefix;

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

    // Differentiate styling based on depth:
    // - depth 0: Main section headers (e.g., "General facts", "Habitat")
    // - depth 1+: Sub-section headers (e.g., "Pollution sources:")
    content.push(
      <div
        key={`header-${itemKey}`}
        className={cn(
          'font-bold text-neutral-900 dark:text-neutral-100',
          depth === 0 ? 'mt-4 mb-2 text-base border-b border-neutral-200 dark:border-neutral-700 pb-1' : 'mt-2 mb-0.5',
          fontSize
        )}
      >
        {headerResult.elements}
      </div>
    );
    currentIndex += headerResult.inputsConsumed;
  }

  // Render child items
  if (subItems.length > 0) {
    const childElements: React.ReactNode[] = [];

    subItems.forEach((subItem, i) => {
      const result = renderNoteItem({
        item: subItem,
        inputPositions,
        startIndex: currentIndex,
        questionMap,
        onAnswer,
        onFocus,
        disabled,
        fontSize,
        depth: depth + 1,
        itemKey: `${itemKey}-${i}`,
      });
      childElements.push(result.element);
      currentIndex += result.inputsConsumed;
    });

    content.push(
      <ul
        key={`list-${itemKey}`}
        className={cn(
          'list-disc space-y-1',
          depth === 0 ? 'ml-5 list-inside' : 'ml-4 list-inside'
        )}
      >
        {childElements}
      </ul>
    );
  }

  return {
    element: (
      <div key={itemKey} className="mb-2">
        {content}
      </div>
    ),
    inputsConsumed: currentIndex - startIndex,
  };
}

// ============= Main Component =============

export const NCQuestion = memo(function NCQuestion({
  title,
  description,
  noteData,
  questions,
  userAnswers,
  onAnswer,
  onFocus,
  fontSize = 'text-base',
  disabled = false,
  highlightedQuestionId = null,
}: NCProps) {
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
    const items = Array.isArray(noteData?.items) ? noteData.items : [];
    return buildInputPositionMap(items, sortedQuestions);
  }, [noteData, sortedQuestions]);

  // Render all note content
  const noteContent = useMemo(() => {
    const items = Array.isArray(noteData?.items) ? noteData.items : [];
    let currentIndex = 0;
    const elements: React.ReactNode[] = [];

    items.forEach((item, i) => {
      const result = renderNoteItem({
        item,
        inputPositions,
        startIndex: currentIndex,
        questionMap,
        onAnswer,
        onFocus,
        disabled,
        fontSize,
        depth: 0,
        itemKey: i,
      });
      elements.push(result.element);
      currentIndex += result.inputsConsumed;
    });

    return elements;
  }, [noteData, inputPositions, questionMap, onAnswer, onFocus, disabled, fontSize]);

  return (
    <div className="nc-question-group">
      {/* Section Header - Question Range */}
      <div className="mb-4">
        <h3 className={cn('font-bold text-neutral-900 dark:text-white', 'text-lg')}>
          {title}
        </h3>
      </div>

      {/* Instructions */}
      <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-400 dark:border-amber-500 rounded-r">
        <p className={cn('text-neutral-700 dark:text-neutral-300 leading-relaxed', fontSize)}>
          {description}
        </p>
      </div>

      {/* Note Container - Clean paper-like appearance */}
      <div className={cn(
        'bg-white dark:bg-slate-800',
        'border border-neutral-200 dark:border-neutral-700 rounded-lg',
        'p-6'
      )}>
        {/* Note Title */}
        {noteData?.title && (
          <h4 className={cn(
            'font-bold text-neutral-900 dark:text-white mb-4',
            'text-lg'
          )}>
            {noteData.title}
          </h4>
        )}

        {/* Note Content */}
        <div className="space-y-1">
          {noteContent}
        </div>
      </div>
    </div>
  );
});

export default NCQuestion;
