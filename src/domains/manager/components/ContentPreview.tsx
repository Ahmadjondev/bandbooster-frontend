'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import type {
  ExtractResponse,
  ListeningContent,
  ReadingContent,
  ListeningPart,
  ReadingPassage,
  QuestionGroup,
  Question,
  QuestionType,
  QuestionData,
} from '../models/domain';
import {
  isListeningContent,
  QUESTION_TYPE_LABELS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
} from '../models/domain';

// ============================================================================
// QUESTION TYPE COLORS
// ============================================================================

const QUESTION_TYPE_CONFIG: Record<QuestionType, { color: string; bg: string }> = {
  MCQ: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/20' },
  MCMA: { color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/20' },
  TFNG: { color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/20' },
  YNNG: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/20' },
  SC: { color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-500/20' },
  SUC: { color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-500/20' },
  NC: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/20' },
  TC: { color: 'text-lime-600 dark:text-lime-400', bg: 'bg-lime-500/20' },
  FC: { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/20' },
  FCC: { color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/20' },
  MH: { color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/20' },
  MI: { color: 'text-fuchsia-600 dark:text-fuchsia-400', bg: 'bg-fuchsia-500/20' },
  MF: { color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-500/20' },
  SA: { color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/20' },
  ML: { color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/20' },
  DL: { color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-500/20' },
};

// ============================================================================
// TYPES
// ============================================================================

interface ContentPreviewProps {
  extractResponse: ExtractResponse;
  content: ListeningContent | ReadingContent;
  onContentChange: (content: ListeningContent | ReadingContent) => void;
  isEditing?: boolean;
}

// ============================================================================
// PRACTICE-STYLE QUESTION RENDERERS
// ============================================================================

// Helper to find question by order number
function findQuestionByOrder(questions: Question[], order: number): Question | undefined {
  return questions.find((q) => q.order === order);
}

// Inline blank renderer - tracks input index and maps to correct question
function renderWithBlanks(text: string, startOrder: number, questions: Question[]): React.ReactNode {
  if (!text.includes('<input>')) {
    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  }

  const parts = text.split(/(<input>)/);
  let inputCount = 0;

  return (
    <>
      {parts.map((part, idx) => {
        if (part === '<input>') {
          const currentOrder = startOrder + inputCount;
          const q = findQuestionByOrder(questions, currentOrder);
          const answer = q?.correctAnswer || '___';
          inputCount++;
          return (
            <span
              key={idx}
              className="inline-flex items-center mx-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded text-green-700 dark:text-green-300 font-medium text-sm"
            >
              <span className="text-xs font-bold mr-1.5 text-green-600 dark:text-green-400">
                {currentOrder}
              </span>
              {answer}
            </span>
          );
        }
        return <span key={idx} dangerouslySetInnerHTML={{ __html: part }} />;
      })}
    </>
  );
}

// Question Badge
function QuestionBadge({ order, hasAnswer }: { order: number; hasAnswer: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center min-w-7 h-7 px-1.5 text-sm font-semibold rounded border shrink-0',
        hasAnswer
          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700'
          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-600'
      )}
    >
      {order}
    </span>
  );
}

// ============================================================================
// MCQ/MCMA RENDERER
// ============================================================================

function MCQRenderer({ questions }: { questions: Question[] }) {
  return (
    <div className="space-y-6">
      {questions.map((q) => (
        <div key={q.order} className="space-y-3">
          <div className="flex items-start gap-3">
            <QuestionBadge order={q.order} hasAnswer={!!q.correctAnswer} />
            <p className="text-text-primary leading-relaxed" dangerouslySetInnerHTML={{ __html: q.text }} />
          </div>
          {q.choices && (
            <div className="ml-10 space-y-2">
              {q.choices.map((choice) => {
                const isCorrect = q.correctAnswer.includes(choice.key);
                return (
                  <div
                    key={choice.key}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-colors',
                      isCorrect
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                        : 'bg-surface border-border'
                    )}
                  >
                    <span
                      className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                        isCorrect ? 'bg-green-500 text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
                      )}
                    >
                      {choice.key}
                    </span>
                    <span className={cn('flex-1', isCorrect ? 'text-green-700 dark:text-green-300 font-medium' : 'text-text-secondary')}>
                      {choice.text}
                    </span>
                    {isCorrect && (
                      <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// TFNG/YNNG RENDERER
// ============================================================================

function TFNGRenderer({ questions, type }: { questions: Question[]; type: 'TFNG' | 'YNNG' }) {
  const options = type === 'TFNG' ? ['TRUE', 'FALSE', 'NOT GIVEN'] : ['YES', 'NO', 'NOT GIVEN'];
  const colors = {
    TRUE: 'bg-green-500', FALSE: 'bg-red-500', 'NOT GIVEN': 'bg-gray-500',
    YES: 'bg-green-500', NO: 'bg-red-500',
  };

  return (
    <div className="space-y-4">
      {questions.map((q) => (
        <div key={q.order} className="flex items-start gap-4 p-4 bg-surface rounded-lg border border-border">
          <QuestionBadge order={q.order} hasAnswer={!!q.correctAnswer} />
          <p className="flex-1 text-text-primary" dangerouslySetInnerHTML={{ __html: q.text }} />
          <div className="flex gap-2">
            {options.map((opt) => (
              <span
                key={opt}
                className={cn(
                  'px-3 py-1 rounded text-xs font-bold',
                  q.correctAnswer === opt
                    ? `${colors[opt as keyof typeof colors]} text-white`
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                )}
              >
                {opt}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// SC/SA RENDERER (Simple completion/answer)
// ============================================================================

function SCRenderer({ questions }: { questions: Question[] }) {
  return (
    <div className="space-y-4">
      {questions.map((q) => (
        <div key={q.order} className="flex items-start gap-4 p-4 bg-surface rounded-lg border border-border">
          <QuestionBadge order={q.order} hasAnswer={!!q.correctAnswer} />
          <div className="flex-1">
            <p className="text-text-primary">{renderWithBlanks(q.text, q.order, [q])}</p>
          </div>
          {!q.text.includes('<input>') && (
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded font-medium text-sm">
              {q.correctAnswer}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// SUC RENDERER (Summary Completion)
// ============================================================================

function SUCRenderer({ group }: { group: QuestionGroup }) {
  const { questionData, questions } = group;
  
  // Check for word list - can be in wordList (new) or options (legacy)
  const wordList = questionData?.wordList || questionData?.options;
  const hasWordList = wordList && wordList.length > 0;
  
  // Check for summary text - can be in text (new) or items (legacy)
  const summaryText = questionData?.text;
  const summaryItems = questionData?.items;

  // Track input index across all paragraphs
  let currentInputIndex = 0;

  return (
    <div className="space-y-4">
      {/* Word List Box */}
      {hasWordList && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">Word List</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {wordList!.map((item) => (
              <div key={item.key} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 rounded border border-neutral-200 dark:border-neutral-700">
                <span className="font-bold text-primary-600 dark:text-primary-400">{item.key}</span>
                <span className="text-neutral-700 dark:text-neutral-300">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Text (single text field with <input> placeholders) */}
      {summaryText && (
        <div className="p-4 bg-surface rounded-lg border border-border prose prose-sm dark:prose-invert max-w-none">
          {questionData?.title && <h4 className="font-semibold mb-3">{questionData.title}</h4>}
          <div className="leading-relaxed whitespace-pre-wrap">
            {renderWithBlanks(summaryText, group.questionStart, questions)}
          </div>
        </div>
      )}

      {/* Summary Items (array of paragraphs with blanks) - legacy format */}
      {!summaryText && summaryItems && summaryItems.length > 0 && (
        <div className="p-4 bg-surface rounded-lg border border-border prose prose-sm dark:prose-invert max-w-none">
          {questionData?.title && <h4 className="font-semibold mb-3">{questionData.title}</h4>}
          {summaryItems.map((item, idx) => {
            if (typeof item !== 'string') return null;
            const itemInputs = countInputsInText(item);
            const itemStartOrder = group.questionStart + currentInputIndex;
            currentInputIndex += itemInputs;
            return (
              <p key={idx} className="mb-2 leading-relaxed">
                {renderWithBlanks(item, itemStartOrder, questions)}
              </p>
            );
          })}
        </div>
      )}

      {/* Questions list if no text or items */}
      {!summaryText && (!summaryItems || summaryItems.length === 0) && (
        <SCRenderer questions={questions} />
      )}
    </div>
  );
}

// ============================================================================
// NC RENDERER (Note Completion)
// ============================================================================

interface NCItem {
  title?: string;
  prefix?: string;
  items?: (string | NCItem)[];
}

// Count <input> tags in text
function countInputsInText(text: string): number {
  return (text.match(/<input>/g) || []).length;
}

// Count all inputs in NC items recursively
function countInputsInNCItems(items: (string | NCItem)[]): number {
  let count = 0;
  for (const item of items) {
    if (typeof item === 'string') {
      count += countInputsInText(item);
    } else {
      if (item.title) count += countInputsInText(item.title);
      if (item.prefix) count += countInputsInText(item.prefix);
      if (item.items) count += countInputsInNCItems(item.items);
    }
  }
  return count;
}

function NCRenderer({ group }: { group: QuestionGroup }) {
  const { questionData, questions } = group;
  const items = questionData?.items || [];

  // Use a ref-like counter that persists across renders of nested items
  let currentInputIndex = 0;

  const renderNCItem = (item: string | NCItem, depth: number = 0): React.ReactNode => {
    if (typeof item === 'string') {
      const inputsInThis = countInputsInText(item);
      const startOrder = group.questionStart + currentInputIndex;
      currentInputIndex += inputsInThis;
      return (
        <li className="ml-4">
          {renderWithBlanks(item, startOrder, questions)}
        </li>
      );
    }

    const header = item.title || item.prefix;
    const headerInputs = header ? countInputsInText(header) : 0;
    const headerStartOrder = group.questionStart + currentInputIndex;
    currentInputIndex += headerInputs;

    return (
      <div className={cn('mt-2', depth > 0 && 'ml-4')}>
        {header && (
          <p className="font-semibold text-text-primary">
            {renderWithBlanks(header, headerStartOrder, questions)}
          </p>
        )}
        {item.items && (
          <ul className="list-disc ml-4 space-y-1">
            {item.items.map((subItem, idx) => (
              <div key={idx}>{renderNCItem(subItem, depth + 1)}</div>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 bg-surface rounded-lg border border-border">
      {questionData?.title && (
        <h4 className="font-bold text-lg text-text-primary mb-4 pb-2 border-b border-border">
          {questionData.title}
        </h4>
      )}
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx}>{renderNCItem(item as string | NCItem)}</div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// TC RENDERER (Table Completion)
// ============================================================================

function TCRenderer({ group }: { group: QuestionGroup }) {
  const { questionData, questions } = group;
  const tableItems = questionData?.items || [];

  if (!Array.isArray(tableItems) || tableItems.length === 0) {
    return <SCRenderer questions={questions} />;
  }

  // Track input index across all cells
  let currentInputIndex = 0;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-border rounded-lg overflow-hidden">
        <tbody>
          {tableItems.map((row, rowIdx) => (
            <tr key={rowIdx} className={rowIdx === 0 ? 'bg-surface-elevated' : ''}>
              {Array.isArray(row) &&
                row.map((cell, cellIdx) => {
                  const isHeader = rowIdx === 0;
                  const Tag = isHeader ? 'th' : 'td';
                  const cellInputs = typeof cell === 'string' ? countInputsInText(cell) : 0;
                  const cellStartOrder = group.questionStart + currentInputIndex;
                  currentInputIndex += cellInputs;
                  return (
                    <Tag
                      key={cellIdx}
                      className={cn(
                        'border border-border px-4 py-3 text-left',
                        isHeader ? 'font-semibold text-text-primary' : 'text-text-secondary'
                      )}
                    >
                      {typeof cell === 'string' ? renderWithBlanks(cell, cellStartOrder, questions) : cell}
                    </Tag>
                  );
                })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// FC RENDERER (Form Completion)
// ============================================================================

function FCRenderer({ group }: { group: QuestionGroup }) {
  const { questionData, questions } = group;
  const items = questionData?.items || [];

  // Track input index across all items
  let currentInputIndex = 0;

  return (
    <div className="p-4 bg-surface rounded-lg border border-border">
      {questionData?.title && (
        <h4 className="font-bold text-lg text-text-primary mb-4 pb-2 border-b border-border">
          {questionData.title}
        </h4>
      )}
      <div className="space-y-3">
        {items.map((item, idx) => {
          if (typeof item === 'string') {
            const itemInputs = countInputsInText(item);
            const itemStartOrder = group.questionStart + currentInputIndex;
            currentInputIndex += itemInputs;
            return (
              <div key={idx} className="flex items-center gap-4">
                <p className="text-text-secondary">{renderWithBlanks(item, itemStartOrder, questions)}</p>
              </div>
            );
          } else if (Array.isArray(item)) {
            const labelInputs = countInputsInText(item[0] || '');
            const valueInputs = countInputsInText(item[1] || '');
            const labelStartOrder = group.questionStart + currentInputIndex;
            currentInputIndex += labelInputs;
            const valueStartOrder = group.questionStart + currentInputIndex;
            currentInputIndex += valueInputs;
            return (
              <div key={idx} className="flex items-center gap-4">
                <span className="font-medium text-text-primary min-w-30">
                  {renderWithBlanks(item[0] || '', labelStartOrder, questions)}
                </span>
                <span className="flex-1">{renderWithBlanks(item[1] || '', valueStartOrder, questions)}</span>
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

// ============================================================================
// FCC RENDERER (Flow Chart Completion)
// ============================================================================

function FCCRenderer({ group }: { group: QuestionGroup }) {
  const { questionData, questions } = group;

  return (
    <div className="p-4 bg-surface rounded-lg border border-border">
      {questionData?.title && <h4 className="font-bold text-lg text-text-primary mb-4">{questionData.title}</h4>}
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <div key={q.order} className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-sm">
              {idx + 1}
            </div>
            <div className="flex-1 p-3 bg-surface-elevated rounded-lg border border-border">
              {renderWithBlanks(q.text, q.order, [q])}
            </div>
            {idx < questions.length - 1 && (
              <svg className="w-6 h-6 text-primary-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MATCHING RENDERER (MH, MI, MF, ML)
// ============================================================================

function MatchingRenderer({ group }: { group: QuestionGroup }) {
  const { questionData, questions, questionType } = group;
  const options = questionData?.options || [];

  const typeLabels: Record<string, string> = {
    MH: 'List of Headings',
    MI: 'List of Paragraphs',
    MF: 'List of Features',
    ML: 'List of Locations',
  };
  console.log('Rendering MatchingRenderer with options:', options);
  return (
    <div className="space-y-4">
      {/* Options Box */}
      {options.length > 0 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">
            {typeLabels[questionType] || 'Options'}
          </h4>
          <div className="space-y-2">
            {options.map((opt) => (
              <div key={opt.key} className="flex items-start gap-3">
                <span className="font-bold text-primary-600 dark:text-primary-400 min-w-6">{opt.key}</span>
                <span className="text-neutral-700 dark:text-neutral-300">{opt.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-3">
        {questions.map((q) => (
          <div key={q.order} className="flex items-start gap-4 p-4 bg-surface rounded-lg border border-border">
            <QuestionBadge order={q.order} hasAnswer={!!q.correctAnswer} />
            <p className="flex-1 text-text-primary" dangerouslySetInnerHTML={{ __html: q.text }} />
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded font-bold">
              {q.correctAnswer}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// DL RENDERER (Diagram Labelling)
// ============================================================================

function DLRenderer({ group }: { group: QuestionGroup }) {
  const { questionData, questions } = group;

  return (
    <div className="space-y-4">
      {questionData?.title && (
        <h4 className="font-bold text-lg text-text-primary">{questionData.title}</h4>
      )}
      <div className="space-y-3">
        {questions.map((q) => (
          <div key={q.order} className="flex items-center gap-4 p-3 bg-surface rounded-lg border border-border">
            <QuestionBadge order={q.order} hasAnswer={!!q.correctAnswer} />
            <p className="flex-1 text-text-secondary">{q.text || `Label ${q.order}`}</p>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded font-medium">
              {q.correctAnswer}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// QUESTION GROUP RENDERER - Routes to appropriate renderer
// ============================================================================

function QuestionGroupRenderer({ group }: { group: QuestionGroup }) {
  const config = QUESTION_TYPE_CONFIG[group.questionType];

  const renderQuestions = () => {
    switch (group.questionType) {
      case 'MCQ':
      case 'MCMA':
        return <MCQRenderer questions={group.questions} />;
      case 'TFNG':
        return <TFNGRenderer questions={group.questions} type="TFNG" />;
      case 'YNNG':
        return <TFNGRenderer questions={group.questions} type="YNNG" />;
      case 'SC':
      case 'SA':
        return <SCRenderer questions={group.questions} />;
      case 'SUC':
        return <SUCRenderer group={group} />;
      case 'NC':
        return <NCRenderer group={group} />;
      case 'TC':
        return <TCRenderer group={group} />;
      case 'FC':
        return <FCRenderer group={group} />;
      case 'FCC':
        return <FCCRenderer group={group} />;
      case 'MH':
      case 'MI':
      case 'MF':
      case 'ML':
        return <MatchingRenderer group={group} />;
      case 'DL':
        return <DLRenderer group={group} />;
      default:
        return <SCRenderer questions={group.questions} />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-border">
        <span className={cn('px-2.5 py-1 text-xs font-bold rounded', config?.bg, config?.color)}>
          {group.questionType}
        </span>
        <h3 className="font-semibold text-text-primary">{group.title}</h3>
        <span className="text-sm text-text-muted ml-auto">
          Questions {group.questionStart}-{group.questionEnd}
        </span>
      </div>

      {/* Description */}
      {group.description && (
        <p className="text-sm text-text-secondary italic" dangerouslySetInnerHTML={{ __html: group.description }} />
      )}

      {/* Questions */}
      {renderQuestions()}
    </div>
  );
}

// ============================================================================
// PART/PASSAGE CONTENT PANEL
// ============================================================================

interface PartPanelProps {
  part: ListeningPart;
}

function ListeningPartPanel({ part }: PartPanelProps) {
  const [activeGroupIdx, setActiveGroupIdx] = useState(0);
  const totalQuestions = part.questionGroups.reduce((sum, g) => sum + g.questions.length, 0);

  return (
    <div className="space-y-6">
      {/* Part Info */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-surface-elevated rounded-lg">
        <div className="flex items-center gap-2">
          <span className={cn('px-2 py-1 rounded text-xs font-bold', DIFFICULTY_COLORS[part.difficulty])}>
            {DIFFICULTY_LABELS[part.difficulty]}
          </span>
        </div>
        <span className="text-sm text-text-muted">{part.speakerCount} Speaker{part.speakerCount > 1 ? 's' : ''}</span>
        <span className="text-sm text-text-muted">{totalQuestions} Questions</span>
        {part.scenario && <span className="text-sm text-text-secondary ml-auto">{part.scenario}</span>}
      </div>

      {/* Question Group Tabs (if multiple) */}
      {part.questionGroups.length > 1 && (
        <div className="flex gap-2 border-b border-border">
          {part.questionGroups.map((g, idx) => {
            const gConfig = QUESTION_TYPE_CONFIG[g.questionType];
            return (
              <button
                key={idx}
                onClick={() => setActiveGroupIdx(idx)}
                className={cn(
                  'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                  activeGroupIdx === idx
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-text-muted hover:text-text-primary'
                )}
              >
                <span className={cn('px-1.5 py-0.5 rounded text-xs mr-2', gConfig?.bg, gConfig?.color)}>
                  {g.questionType}
                </span>
                Q{g.questionStart}-{g.questionEnd}
              </button>
            );
          })}
        </div>
      )}

      {/* Active Question Group */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeGroupIdx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
        >
          <QuestionGroupRenderer group={part.questionGroups[activeGroupIdx]} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

interface PassagePanelProps {
  passage: ReadingPassage;
}

function ReadingPassagePanel({ passage }: PassagePanelProps) {
  const [activeGroupIdx, setActiveGroupIdx] = useState(0);
  const totalQuestions = passage.testHeads.reduce((sum, g) => sum + g.questions.length, 0);

  return (
    <div className="space-y-4">
      {/* Passage Info */}
      <div className="flex flex-wrap items-center gap-4 p-3 bg-surface-elevated rounded-lg">
        <span className={cn('px-2 py-1 rounded text-xs font-bold', DIFFICULTY_COLORS[passage.difficulty])}>
          {DIFFICULTY_LABELS[passage.difficulty]}
        </span>
        <span className="text-sm text-text-muted">{passage.paragraphCount} Paragraphs</span>
        <span className="text-sm text-text-muted">{totalQuestions} Questions</span>
      </div>

      {/* Split View Layout - Like Practice Reading */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-125">
        {/* Left Panel - Reading Passage */}
        <div className="border border-border rounded-xl overflow-hidden flex flex-col bg-surface">
          <div className="px-4 py-3 bg-surface-elevated border-b border-border flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
            <span className="font-semibold text-text-primary">{passage.title}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 prose prose-sm dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: passage.content }} />
          </div>
        </div>

        {/* Right Panel - Questions */}
        <div className="border border-border rounded-xl overflow-hidden flex flex-col bg-surface">
          {/* Question Group Tabs */}
          <div className="flex gap-1 p-2 bg-surface-elevated border-b border-border overflow-x-auto">
            {passage.testHeads.map((g, idx) => {
              const gConfig = QUESTION_TYPE_CONFIG[g.questionType];
              return (
                <button
                  key={idx}
                  onClick={() => setActiveGroupIdx(idx)}
                  className={cn(
                    'shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                    activeGroupIdx === idx
                      ? 'bg-primary-500 text-white'
                      : 'bg-surface text-text-muted hover:text-text-primary hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  )}
                >
                  <span className={cn(
                    'px-1.5 py-0.5 rounded text-[10px] mr-1.5',
                    activeGroupIdx === idx ? 'bg-white/20 text-white' : cn(gConfig?.bg, gConfig?.color)
                  )}>
                    {g.questionType}
                  </span>
                  Q{g.questionStart}-{g.questionEnd}
                </button>
              );
            })}
          </div>

          {/* Active Question Group */}
          <div className="flex-1 overflow-y-auto p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeGroupIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <QuestionGroupRenderer group={passage.testHeads[activeGroupIdx]} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ContentPreview({
  extractResponse,
  content,
}: ContentPreviewProps) {
  const { contentType, stats } = extractResponse;
  const [activeTabIdx, setActiveTabIdx] = useState(0);

  const items = isListeningContent(content) ? content.parts : content.passages;
  const isListening = isListeningContent(content);

  return (
    <div className="space-y-4">
      {/* Top Tab Navigation */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="flex border-b border-border overflow-x-auto bg-surface-elevated">
          {items.map((item, idx) => {
            const part = isListening ? (item as ListeningPart) : null;
            const passage = !isListening ? (item as ReadingPassage) : null;
            const number = part?.partNumber || passage?.passageNumber || idx + 1;
            const title = part?.title || passage?.title || '';

            return (
              <button
                key={idx}
                onClick={() => setActiveTabIdx(idx)}
                className={cn(
                  'shrink-0 px-6 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                  activeTabIdx === idx
                    ? 'border-primary-500 text-primary-500 bg-surface'
                    : 'border-transparent text-text-muted hover:text-text-primary'
                )}
              >
                <span className="font-bold">{isListening ? 'Part' : 'Passage'} {number}</span>
                {title && <span className="ml-2 text-xs opacity-60 truncate max-w-25">{title}</span>}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTabIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {isListening ? (
                <ListeningPartPanel part={(content as ListeningContent).parts[activeTabIdx]} />
              ) : (
                <ReadingPassagePanel passage={(content as ReadingContent).passages[activeTabIdx]} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
