/**
 * Table Completion (TC) Component
 * CD-IELTS authentic table completion with inline inputs
 * Supports header rows and multi-column tables
 */

'use client';

import React, { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { BlankInput } from './shared';
import type { AnswerState, ExamMode, TCCell } from '@/domains/practice/models/question-types';

// ============= Types =============

export interface TCQuestionData {
  readonly id: number;
  readonly order: number;
  readonly text: string;
}

export interface TCTableData {
  readonly items: TCCell[][];
}

export interface TCProps {
  readonly title: string;
  readonly description: string;
  readonly tableData: TCTableData;
  readonly questions: TCQuestionData[];
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
 * Build a flat array of input positions with their corresponding questions
 * Processes table cells in order: top-left to bottom-right
 * Pure function - no side effects
 */
function buildInputPositionMap(
  rows: TCCell[][],
  sortedQuestions: TCQuestionData[]
): TCQuestionData[] {
  const positions: TCQuestionData[] = [];
  let currentIndex = 0;

  // Guard against undefined or non-array rows
  if (!Array.isArray(rows)) return positions;

  for (const row of rows) {
    // Guard against undefined or non-array row
    if (!Array.isArray(row)) continue;

    for (const cell of row) {
      const content = Array.isArray(cell) ? cell.join('\n') : (typeof cell === 'string' ? cell : '');
      const inputCount = (content.match(/<input>/g) || []).length;
      for (let i = 0; i < inputCount; i++) {
        if (currentIndex < sortedQuestions.length) {
          positions.push(sortedQuestions[currentIndex]);
          currentIndex++;
        }
      }
    }
  }

  return positions;
}

// ============= Sub-Components =============

interface RenderCellResult {
  element: React.ReactNode;
  inputsConsumed: number;
}

interface RenderCellParams {
  content: string;
  inputPositions: TCQuestionData[];
  startIndex: number;
  questionMap: Map<number, { id: number; answer: string }>;
  onAnswer: (questionId: number, answer: string) => void;
  onFocus?: (questionId: number) => void;
  disabled?: boolean;
  fontSize?: string;
}

/**
 * Renders cell content with inline inputs
 * Returns rendered element and count of inputs consumed
 * Pure function - no side effects
 */
function renderCellContent({
  content,
  inputPositions,
  startIndex,
  questionMap,
  onAnswer,
  onFocus,
  disabled,
  fontSize,
}: RenderCellParams): RenderCellResult {
  if (!content.includes('<input>')) {
    return {
      element: <span dangerouslySetInnerHTML={{ __html: content }} />,
      inputsConsumed: 0,
    };
  }

  const parts = content.split('<input>');
  const elements: React.ReactNode[] = [];
  let localIndex = startIndex;

  parts.forEach((part, index) => {
    elements.push(
      <span key={`text-${index}`} dangerouslySetInnerHTML={{ __html: part }} />
    );

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
            placeholder="..."
          />
        );
        localIndex++;
      }
    }
  });

  return {
    element: <>{elements}</>,
    inputsConsumed: localIndex - startIndex,
  };
}

// ============= Main Component =============

export const TCQuestion = memo(function TCQuestion({
  title,
  description,
  tableData,
  questions,
  userAnswers,
  onAnswer,
  onFocus,
  fontSize = 'text-base',
  disabled = false,
  highlightedQuestionId = null,
}: TCProps) {
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

  // Pre-compute input positions
  const inputPositions = useMemo(() => {
    return buildInputPositionMap(tableData.items, sortedQuestions);
  }, [tableData.items, sortedQuestions]);

  // Guard against empty or malformed table data
  const rows = Array.isArray(tableData.items) ? tableData.items : [];
  const headerRow = rows.length > 0 ? rows[0] : [];
  const dataRows = rows.length > 1 ? rows.slice(1) : [];

  // Pre-compute input counts for each cell to determine start indices
  const cellInputCounts = useMemo(() => {
    const counts: number[][] = [];
    for (const row of rows) {
      const rowCounts: number[] = [];
      // Guard against non-array row
      if (!Array.isArray(row)) {
        counts.push([]);
        continue;
      }
      for (const cell of row) {
        const content = Array.isArray(cell) ? cell.join('\n') : (typeof cell === 'string' ? cell : '');
        const inputCount = (content.match(/<input>/g) || []).length;
        rowCounts.push(inputCount);
      }
      counts.push(rowCounts);
    }
    return counts;
  }, [rows]);

  // Calculate start index for each cell
  const getStartIndex = (rowIndex: number, cellIndex: number): number => {
    let index = 0;
    // Sum all inputs from previous rows
    for (let r = 0; r < rowIndex; r++) {
      for (let c = 0; c < cellInputCounts[r].length; c++) {
        index += cellInputCounts[r][c];
      }
    }
    // Sum all inputs from previous cells in current row
    for (let c = 0; c < cellIndex; c++) {
      index += cellInputCounts[rowIndex][c];
    }
    return index;
  };

  // Render table - using pre-computed indices
  const tableContent = useMemo(() => {
    // Guard against empty headerRow
    const headerCells = Array.isArray(headerRow) ? headerRow.map((cell, cellIndex) => {
      const content = Array.isArray(cell) ? cell.join('\n') : (typeof cell === 'string' ? cell : '');
      const startIndex = getStartIndex(0, cellIndex);
      const result = renderCellContent({
        content,
        inputPositions,
        startIndex,
        questionMap,
        onAnswer,
        onFocus,
        disabled,
        fontSize,
      });

      return (
        <th
          key={cellIndex}
          className={cn(
            'px-4 py-3',
            'border border-neutral-300 dark:border-neutral-600',
            'bg-neutral-100 dark:bg-neutral-800 font-semibold text-neutral-900 dark:text-neutral-100',
            fontSize
          )}
        >
          {result.element}
        </th>
      );
    }) : [];

    // Render data rows (starting from index 1)
    const dataRowElements = dataRows.map((row, rowIndex) => {
      // Guard against non-array row
      if (!Array.isArray(row)) return null;

      const actualRowIndex = rowIndex + 1; // Account for header row
      const rowCells = row.map((cell, cellIndex) => {
        const content = Array.isArray(cell) ? cell.join('\n') : (typeof cell === 'string' ? cell : '');
        const startIndex = getStartIndex(actualRowIndex, cellIndex);
        const result = renderCellContent({
          content,
          inputPositions,
          startIndex,
          questionMap,
          onAnswer,
          onFocus,
          disabled,
          fontSize,
        });

        return (
          <td
            key={cellIndex}
            className={cn(
              'px-4 py-3',
              'border border-neutral-300 dark:border-neutral-600',
              'bg-white dark:bg-slate-800 text-neutral-800 dark:text-neutral-200',
              fontSize
            )}
          >
            {result.element}
          </td>
        );
      });

      return <tr key={rowIndex}>{rowCells}</tr>;
    }).filter(Boolean);

    return { headerCells, dataRowElements };
  }, [headerRow, dataRows, inputPositions, questionMap, onAnswer, onFocus, disabled, fontSize, getStartIndex]);

  return (
    <div className="tc-question-group">
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-neutral-300 dark:border-neutral-600">
          {headerRow && (
            <thead>
              <tr>{tableContent.headerCells}</tr>
            </thead>
          )}
          <tbody>
            {tableContent.dataRowElements}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default TCQuestion;
