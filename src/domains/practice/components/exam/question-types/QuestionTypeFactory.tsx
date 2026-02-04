/**
 * Question Type Factory
 * Unified component that renders the appropriate question type based on API data
 * Single entry point for all IELTS question rendering
 * 
 * API Response Structure for question_data (from backend):
 * - NC: { title?: string, items: NCNoteItem[] }
 * - TC: { items: TCCell[][] } (2D array for table rows/cols)
 * - FC: { title?: string, items: FCFormItem[] }
 * - FCC: { title?: string, flow_description?: string, steps: Array<{step_number, text, blank_position}> }
 * - SUC: { title?: string, text?: string, blankCount?: number, word_list?: Array<{key, text}> }
 * - MH/MI/MF/ML: { options?: MatchingOption[], note?: string }
 * - DL: { title?: string, visual_description?: string, labelCount?: number, labels?: Array<{name, correctAnswer}>, note?: string }
 */

'use client';

import { memo, useMemo } from 'react';
import type {
  AnswerState,
  QuestionTypeCode,
  ExamMode,
  MatchingOption,
  NCNoteItem,
  FCFormItem,
  TCCell,
} from '@/domains/practice/models/question-types';

// ============= API Question Data Type Definitions =============
// These match exact backend response structure (snake_case)

/** Note Completion question_data from API */
interface NCQuestionData {
  title?: string;
  items?: NCNoteItem[];
}

/** Table Completion question_data from API */
interface TCQuestionData {
  items?: TCCell[][];
}

/** Form Completion question_data from API */
interface FCQuestionData {
  title?: string;
  // Items can be 2D array [label, value][] or legacy object format
  items?: (string[] | { prefix?: string; items: string[] })[];
}

/** Flow Chart Completion question_data from API */
interface FCCQuestionData {
  title?: string;
  flow_description?: string;
  steps?: Array<{ step_number: number; text: string; blank_position: number }>;
}

/** Summary Completion question_data from API */
interface SUCQuestionData {
  title?: string;
  text?: string;
  blank_count?: number;
  blankCount?: number; // alternate naming
  word_list?: Array<{ key: string; text: string }>;
}

/** Matching question_data from API (MH, MI, MF, ML) */
interface MatchingQuestionData {
  options?: MatchingOption[];
  note?: string;
}

/** Diagram Labeling question_data from API */
interface DLQuestionData {
  title?: string;
  visual_description?: string;
  label_count?: number;
  labelCount?: number; // alternate naming  
  labels?: Array<{ name: string; text?: string; correctAnswer?: string; correct_answer?: string }>;
  note?: string;
}

// Import all question type components
import { MCQQuestion } from './MCQQuestion';
import { MCMAQuestion } from './MCMAQuestion';
import { TFNGQuestion, YNNGQuestion } from './TFNGQuestion';
import { SCQuestion } from './SCQuestion';
import { SUCQuestion } from './SUCQuestion';
import { SAQuestion } from './SAQuestion';
import { NCQuestion } from './NCQuestion';
import { TCQuestion } from './TCQuestion';
import { FCQuestion } from './FCQuestion';
import { FCCQuestion } from './FCCQuestion';
import { MatchingQuestion, MHQuestion, MIQuestion, MFQuestion, MLQuestion } from './MatchingQuestion';
import { DLQuestion } from './DLQuestion';

// ============= Types =============

// Generic question structure from API
// API returns different fields depending on question type
export interface APIQuestion {
  readonly id: number;
  readonly order: number;
  // Text field can be 'question_text' or 'text' depending on question type
  readonly question_text?: string;
  readonly text?: string;
  // MCQ/MCMA use 'choices' array with {key, text}
  readonly choices?: Array<{
    key: string;
    text: string;
  }>;
  // Legacy support for 'options' with different structure  
  readonly options?: Array<{
    id?: number;
    choice_text?: string;
    key: string;
    text?: string;
  }>;
  readonly max_selections?: number | string | null;
  readonly user_answer?: string;
  readonly correct_answer?: string;
}

// Test head structure from API
export interface APITestHead {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly question_type: QuestionTypeCode | string;
  readonly question_range?: string;
  readonly instruction: string;
  readonly matching_options?: MatchingOption[];
  readonly allow_duplicates?: boolean;
  readonly select_count?: number | null;
  readonly picture?: string | null;
  readonly picture_url?: string | null;
  readonly view_type?: string;
  readonly answer_format?: string | null;
  readonly question_data?: Record<string, unknown>;
  readonly example?: {
    question: string;
    answer: string;
    explanation?: string;
  } | null;
  readonly questions: APIQuestion[];
}

export interface QuestionTypeFactoryProps {
  /** Test head group containing questions */
  group: APITestHead;
  /** User answers - questionId -> answer */
  userAnswers: AnswerState;
  /** Callback when answer changes */
  onAnswer: (questionId: number, answer: string | string[]) => void;
  /** Callback when question is focused */
  onFocus?: (questionId: number) => void;
  /** Font size class */
  fontSize?: string;
  /** Exam mode - listening or reading */
  mode?: ExamMode;
  /** Whether inputs are disabled */
  disabled?: boolean;
  /** Currently highlighted question ID for visual feedback */
  highlightedQuestionId?: number | null;
}

// ============= Helper Functions =============

/**
 * Calculate max selections for MCMA questions from correct_answer
 * The correct_answer for MCMA is a string like "ACE" (3 selections) or "BD" (2 selections)
 */
function calculateMaxSelections(correctAnswer?: string): number | undefined {
  if (!correctAnswer || typeof correctAnswer !== 'string') return undefined;
  // Count the number of uppercase letters in the correct answer (e.g., "ACE" = 3)
  const letters = correctAnswer.match(/[A-Z]/g);
  return letters ? letters.length : undefined;
}

/**
 * Transform API question to component-specific format
 * Handles both 'choices' (API standard) and 'options' (legacy) formats
 */
function transformQuestion(q: APIQuestion) {
  // Get choices - API uses 'choices' with {key, text}
  // Legacy support for 'options' with {key, choice_text} or {key, text}
  let choices: { key: string; text: string }[] = [];

  if (Array.isArray(q.choices)) {
    choices = q.choices.map(c => ({
      key: c.key || '',
      text: c.text || '',
    }));
  } else if (Array.isArray(q.options)) {
    choices = q.options.map(opt => ({
      key: opt.key || '',
      text: opt.choice_text || opt.text || '',
    }));
  }

  // Calculate maxSelections: prefer explicit max_selections, fallback to correct_answer length
  let maxSelections: number | undefined;
  if (q.max_selections) {
    maxSelections = typeof q.max_selections === 'string'
      ? parseInt(q.max_selections)
      : q.max_selections;
  } else if (q.correct_answer) {
    // For MCMA questions, derive maxSelections from correct_answer length
    maxSelections = calculateMaxSelections(q.correct_answer);
  }

  return {
    id: q.id,
    order: q.order,
    text: q.question_text || q.text || '',
    questionText: q.question_text || q.text || '',
    choices,
    maxSelections,
  };
}

// ============= Main Component =============

export const QuestionTypeFactory = memo(function QuestionTypeFactory({
  group,
  userAnswers,
  onAnswer,
  onFocus,
  fontSize = 'text-base',
  mode = 'reading',
  disabled = false,
  highlightedQuestionId = null,
}: QuestionTypeFactoryProps) {
  const questionType = group.question_type as QuestionTypeCode;
  const questions = useMemo(() => group.questions.map(transformQuestion), [group.questions]);

  // Common props for all components
  const commonProps = {
    title: group.title,
    description: group.instruction || group.description,
    userAnswers,
    onFocus,
    fontSize,
    mode,
    disabled,
    highlightedQuestionId,
  };

  // Render based on question type
  switch (questionType) {
    // Multiple Choice (Single Answer)
    case 'MCQ':
      return (
        <MCQQuestion
          {...commonProps}
          questions={questions}
          onAnswer={(id, answer) => onAnswer(id, answer)}
        />
      );

    // Multiple Choice (Multiple Answers)
    case 'MCMA':
      return (
        <MCMAQuestion
          {...commonProps}
          questions={questions}
          onAnswer={(id, answers) => onAnswer(id, answers)}
          defaultMaxSelections={group.select_count ?? undefined}
        />
      );

    // True/False/Not Given
    case 'TFNG':
      return (
        <TFNGQuestion
          {...commonProps}
          type="TFNG"
          questions={questions}
          onAnswer={(id, answer) => onAnswer(id, answer)}
        />
      );

    // Yes/No/Not Given
    case 'YNNG':
      return (
        <YNNGQuestion
          {...commonProps}
          questions={questions}
          onAnswer={(id, answer) => onAnswer(id, answer)}
        />
      );

    // Sentence Completion
    case 'SC':
      return (
        <SCQuestion
          {...commonProps}
          questions={questions}
          onAnswer={(id, answer) => onAnswer(id, answer)}
        />
      );

    // Summary Completion (from passage or word list)
    case 'SUC':
    case 'SUC_WITH_WORDLIST': {
      const summaryData = (group.question_data || {}) as SUCQuestionData;

      return (
        <SUCQuestion
          {...commonProps}
          questions={questions}
          onAnswer={(id, answer) => onAnswer(id, answer)}
          summaryData={{
            title: summaryData.title || '',
            text: summaryData.text || '',
            blankCount: summaryData.blank_count || summaryData.blankCount || questions.length,
            wordList: summaryData.word_list?.map(w => ({ key: w.key, text: w.text })),
          }}
          hasWordList={questionType === 'SUC_WITH_WORDLIST' || Boolean(summaryData.word_list)}
        />
      );
    }

    // Short Answer
    case 'SA':
      return (
        <SAQuestion
          {...commonProps}
          questions={questions}
          onAnswer={(id, answer) => onAnswer(id, answer)}
        />
      );

    // Note Completion
    case 'NC': {
      const noteData = (group.question_data || {}) as NCQuestionData;

      return (
        <NCQuestion
          {...commonProps}
          questions={questions}
          onAnswer={(id: number, answer: string) => onAnswer(id, answer)}
          noteData={{
            title: noteData.title || '',
            items: noteData.items || [],
          }}
        />
      );
    }

    // Table Completion
    case 'TC': {
      const tableData = (group.question_data || {}) as TCQuestionData;

      return (
        <TCQuestion
          {...commonProps}
          questions={questions}
          onAnswer={(id: number, answer: string) => onAnswer(id, answer)}
          tableData={{
            items: tableData.items || [],
          }}
        />
      );
    }

    // Form Completion
    case 'FC': {
      const formData = (group.question_data || {}) as FCQuestionData;

      return (
        <FCQuestion
          {...commonProps}
          questions={questions}
          onAnswer={(id: number, answer: string) => onAnswer(id, answer)}
          formData={{
            title: formData.title || '',
            items: formData.items || [],
          }}
          example={group.example || undefined}
        />
      );
    }

    // Flow Chart Completion
    case 'FCC': {
      const flowData = (group.question_data || {}) as FCCQuestionData;

      return (
        <FCCQuestion
          {...commonProps}
          questions={questions}
          onAnswer={(id, answer) => onAnswer(id, answer)}
          flowData={{
            title: flowData.title || '',
            flowDescription: flowData.flow_description,
            steps: (flowData.steps || []).map(s => ({
              stepNumber: s.step_number,
              text: s.text,
              blankPosition: s.blank_position,
            })),
          }}
        />
      );
    }

    // Matching Headings
    case 'MH': {
      const matchData = (group.question_data || {}) as MatchingQuestionData;
      return (
        <MHQuestion
          {...commonProps}
          questions={questions}
          onAnswer={(id, answer) => onAnswer(id, answer)}
          options={group.matching_options || matchData.options || []}
          note={matchData.note}
          example={group.example || undefined}
          allowDuplicates={group.allow_duplicates}
        />
      );
    }

    // Matching Information
    case 'MI': {
      const matchData = (group.question_data || {}) as MatchingQuestionData;
      return (
        <MIQuestion
          {...commonProps}
          questions={questions}
          onAnswer={(id, answer) => onAnswer(id, answer)}
          options={group.matching_options || matchData.options || []}
          allowDuplicates={true}
        />
      );
    }

    // Matching Features
    case 'MF': {
      const matchData = (group.question_data || {}) as MatchingQuestionData;
      return (
        <MFQuestion
          {...commonProps}
          questions={questions}
          onAnswer={(id, answer) => onAnswer(id, answer)}
          options={group.matching_options || matchData.options || []}
          allowDuplicates={true}
        />
      );
    }

    // Map Labeling
    case 'ML': {
      const mlData = (group.question_data || {}) as MatchingQuestionData;

      return (
        <MLQuestion
          {...commonProps}
          questions={questions}
          onAnswer={(id, answer) => onAnswer(id, answer)}
          options={group.matching_options || mlData.options || []}
          pictureUrl={group.picture_url || undefined}
          note={mlData.note}
        />
      );
    }

    // Diagram Labeling
    case 'DL': {
      const dlData = (group.question_data || {}) as DLQuestionData;

      return (
        <DLQuestion
          {...commonProps}
          questions={questions}
          onAnswer={(id, answer) => onAnswer(id, answer)}
          diagramData={{
            title: dlData.title || 'Diagram',
            visualDescription: dlData.visual_description,
            labelCount: dlData.label_count || dlData.labelCount || questions.length,
            labels: (dlData.labels || []).map(l => ({
              name: l.name,
              text: l.text || l.name || '',
              correctAnswer: l.correctAnswer || l.correct_answer || '',
            })),
            note: dlData.note,
          }}
          pictureUrl={group.picture_url || undefined}
        />
      );
    }

    // Fallback for unknown types
    default:
      console.warn(`Unknown question type: ${questionType}`);
      return (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded">
          <p className="text-amber-800 dark:text-amber-200">
            Unsupported question type: <code className="font-mono">{questionType}</code>
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
            Please report this issue to the development team.
          </p>
        </div>
      );
  }
});

export default QuestionTypeFactory;
