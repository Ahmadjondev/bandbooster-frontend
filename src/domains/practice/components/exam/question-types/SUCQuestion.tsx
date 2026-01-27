/**
 * Summary Completion (SUC) Component
 * CD-IELTS authentic summary completion questions
 * SUC: From passage words | SUC_WITH_WORDLIST: From word bank
 * 
 * When question_data has word_list:
 * - Uses dropdown selector instead of text input
 * - No free-text input allowed
 * - Dropdown contains only items from word_list
 */

'use client';

import { memo, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { BlankInput, WordListDropdown } from './shared';
import type { AnswerState, WordListItem, ExamMode } from '@/domains/practice/models/question-types';

// ============= Types =============

export interface SUCQuestionData {
  readonly id: number;
  readonly order: number;
  readonly questionText: string; // Contains <input> placeholder
}

export interface SUCSummaryData {
  readonly title: string;
  readonly text: string;
  readonly blankCount: number;
  readonly wordList?: WordListItem[];
}

export interface SUCProps {
  readonly title: string;
  readonly description: string;
  readonly summaryData: SUCSummaryData;
  readonly questions: SUCQuestionData[];
  readonly userAnswers: AnswerState;
  readonly onAnswer: (questionId: number, answer: string) => void;
  readonly onFocus?: (questionId: number) => void;
  readonly fontSize?: string;
  readonly mode?: ExamMode;
  readonly disabled?: boolean;
  readonly hasWordList?: boolean;
  readonly highlightedQuestionId?: number | null;
}

// ============= Sub-Components =============

interface WordListBoxProps {
  wordList: WordListItem[];
  usedLetters: string[];
  fontSize?: string;
}

const WordListBox = memo(function WordListBox({ wordList, usedLetters, fontSize }: WordListBoxProps) {
  return (
    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded">
      <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">
        Word List
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {wordList.map((item) => {
          const isUsed = usedLetters.includes(item.key);
          return (
            <div
              key={item.key}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded',
                'border transition-colors',
                isUsed
                  ? 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 opacity-50'
                  : 'bg-white dark:bg-slate-800 border-neutral-200 dark:border-neutral-700',
                fontSize
              )}
            >
              <span className="font-bold text-primary-600 dark:text-primary-400">
                {item.key}
              </span>
              <span className="text-neutral-700 dark:text-neutral-300">
                {item.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ============= Main Component =============

export const SUCQuestion = memo(function SUCQuestion({
  title,
  description,
  summaryData,
  questions,
  userAnswers,
  onAnswer,
  onFocus,
  fontSize = 'text-base',
  disabled = false,
  hasWordList = false,
  highlightedQuestionId = null,
}: SUCProps) {
  // Determine if we should use dropdown (when word_list is present and has items)
  const useDropdown = hasWordList && summaryData.wordList && summaryData.wordList.length > 0;

  // Track used letters from word list
  const usedLetters = useMemo(() => {
    return Object.values(userAnswers)
      .filter((answer): answer is string => typeof answer === 'string' && answer.trim() !== '')
      .map(a => a.toUpperCase());
  }, [userAnswers]);

  // Build a map of question orders to their answers
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

  // Parse summary text and replace <input> with actual inputs or dropdowns
  const renderSummaryText = useCallback(() => {
    const text = summaryData.text;
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;
    let inputCounter = 0;

    // Sort questions by order to get correct sequence
    const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);

    // Find all <input> positions
    const inputRegex = /<input>/gi;
    let match;

    while ((match = inputRegex.exec(text)) !== null) {
      // Add text before input
      if (match.index > currentIndex) {
        const beforeText = text.slice(currentIndex, match.index);
        parts.push(
          <span key={`text-${currentIndex}`} dangerouslySetInnerHTML={{ __html: beforeText }} />
        );
      }

      // Add input or dropdown based on whether word_list is present
      const question = sortedQuestions[inputCounter];
      if (question) {
        const data = questionMap.get(question.order);

        // If word_list is present, use dropdown instead of text input
        if (useDropdown && summaryData.wordList) {
          parts.push(
            <WordListDropdown
              key={`dropdown-${question.id}`}
              value={data?.answer || ''}
              wordList={summaryData.wordList}
              onChange={(v) => onAnswer(question.id, v)}
              onFocus={() => onFocus?.(question.id)}
              disabled={disabled}
              fontSize={fontSize}
              questionNumber={question.order}
            />
          );
        } else {
          // No word_list - use regular text input
          parts.push(
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
      }

      inputCounter++;
      currentIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (currentIndex < text.length) {
      const remainingText = text.slice(currentIndex);
      parts.push(
        <span key={`text-${currentIndex}`} dangerouslySetInnerHTML={{ __html: remainingText }} />
      );
    }

    return parts;
  }, [summaryData.text, summaryData.wordList, questions, questionMap, onAnswer, onFocus, disabled, fontSize, useDropdown]);

  return (
    <div className="suc-question-group">
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

      {/* Word List (if provided) */}
      {hasWordList && summaryData.wordList && summaryData.wordList.length > 0 && (
        <WordListBox
          wordList={summaryData.wordList}
          usedLetters={usedLetters}
          fontSize={fontSize}
        />
      )}

      {/* Summary Title */}
      {summaryData.title && (
        <div className="mb-4">
          <h4 className={cn('font-semibold text-neutral-900 dark:text-white', fontSize)}>
            {summaryData.title}
          </h4>
        </div>
      )}

      {/* Summary Text with Inputs */}
      <div
        className={cn(
          'p-6 bg-white dark:bg-slate-800',
          'border border-neutral-200 dark:border-neutral-700 rounded',
          'text-neutral-800 dark:text-neutral-200 leading-relaxed',
          fontSize
        )}
      >
        {renderSummaryText()}
      </div>
    </div>
  );
});

export default SUCQuestion;
