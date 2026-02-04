/**
 * Question Type Models
 * Comprehensive type definitions for all IELTS question types
 * Based on API response structure - single source of truth
 */

// ============= Base Types =============

export type QuestionTypeCode =
  | 'MCQ'      // Multiple Choice Question (single answer)
  | 'MCMA'     // Multiple Choice Multiple Answer
  | 'SC'       // Sentence Completion
  | 'SUC'      // Summary Completion (from passage)
  | 'SUC_WITH_WORDLIST' // Summary Completion (with word bank)
  | 'NC'       // Note Completion
  | 'TC'       // Table Completion
  | 'FC'       // Form Completion
  | 'FCC'      // Flow Chart Completion
  | 'TFNG'     // True/False/Not Given
  | 'YNNG'     // Yes/No/Not Given
  | 'MH'       // Matching Headings
  | 'MI'       // Matching Information
  | 'MF'       // Matching Features
  | 'SA'       // Short Answer
  | 'ML'       // Map Labeling
  | 'DL';      // Diagram Labeling

export type ExamMode = 'listening' | 'reading';

// ============= Choice/Option Types =============

export interface QuestionChoice {
  readonly key: string;
  readonly text: string;
}

export interface MatchingOption {
  readonly key: string;
  readonly text: string;
}

export interface WordListItem {
  readonly key: string;
  readonly text: string;
}

// ============= Base Question Interface =============

export interface BaseQuestion {
  readonly id: number;
  readonly order: number;
  readonly text: string;
  readonly questionText?: string;
  readonly userAnswer?: string | string[];
}

// ============= MCQ (Multiple Choice Question) =============

export interface MCQQuestion extends BaseQuestion {
  readonly choices: QuestionChoice[];
  readonly correctAnswer: string; // A, B, C, or D
}

export interface MCQData {
  readonly title: string;
  readonly questionType: 'MCQ';
  readonly description: string;
  readonly questions: MCQQuestion[];
}

// ============= MCMA (Multiple Choice Multiple Answer) =============

export interface MCMAQuestion extends BaseQuestion {
  readonly choices: QuestionChoice[];
  readonly correctAnswer: string; // e.g., "ACE"
  readonly maxSelections?: number;
}

export interface MCMAData {
  readonly title: string;
  readonly questionType: 'MCMA';
  readonly description: string;
  readonly questions: MCMAQuestion[];
}

// ============= SC (Sentence Completion) =============

export interface SCQuestion extends BaseQuestion {
  readonly correctAnswer: string; // word(s) from passage
}

export interface SCData {
  readonly title: string;
  readonly questionType: 'SC';
  readonly description: string;
  readonly questions: SCQuestion[];
}

// ============= SUC (Summary Completion) =============

export interface SUCSummaryData {
  readonly title: string;
  readonly text: string;
  readonly blankCount: number;
}

export interface SUCQuestion extends BaseQuestion {
  readonly questionText: string;
  readonly correctAnswer: string;
}

export interface SUCData {
  readonly title: string;
  readonly questionType: 'SUC' | 'SUC_WITH_WORDLIST';
  readonly description: string;
  readonly questionData: SUCSummaryData & {
    readonly wordList?: WordListItem[];
  };
  readonly questions: SUCQuestion[];
}

// ============= NC (Note Completion) =============

/**
 * NCNoteItem supports both 'title' and 'prefix' for section headers.
 * - 'title' is the preferred property (matches standard IELTS format)
 * - 'prefix' is kept for backward compatibility
 */
export interface NCNoteItem {
  readonly title?: string;
  readonly prefix?: string;  // Deprecated: use 'title' instead
  readonly items: (string | NCNoteItem)[];
}

export interface NCNoteData {
  readonly title: string;
  readonly items: NCNoteItem[];
}

export interface NCQuestion extends BaseQuestion {
  readonly correctAnswer: string;
}

export interface NCData {
  readonly title: string;
  readonly questionType: 'NC';
  readonly description: string;
  readonly questionData: NCNoteData;
  readonly questions: NCQuestion[];
}

// ============= TC (Table Completion) =============

export type TCCell = string | string[];

export interface TCTableData {
  readonly items: TCCell[][];
}

export interface TCQuestion extends BaseQuestion {
  readonly correctAnswer: string;
}

export interface TCData {
  readonly title: string;
  readonly questionType: 'TC';
  readonly description: string;
  readonly questionData: TCTableData;
  readonly questions: TCQuestion[];
}

// ============= FC (Form Completion) =============

/**
 * Form section with header and items.
 * Supports both 'title' and 'prefix' for section headers.
 * - 'title' is the preferred property (matches standard IELTS format)
 * - 'prefix' is kept for backward compatibility
 */
export interface FCFormSection {
  readonly title?: string;
  readonly prefix?: string;  // Deprecated: use 'title' instead
  readonly items: string[];
}

/** @deprecated Use FCFormSection instead */
export interface FCFormItemLegacy {
  readonly prefix?: string;
  readonly title?: string;
  readonly items: string[];
}

/** Form item can be 2D array [label, value] or section object */
export type FCFormItem = string[] | FCFormSection;

export interface FCFormData {
  readonly title: string;
  readonly items: FCFormItem[];
}

export interface FCExample {
  readonly question: string;
  readonly answer: string;
  readonly explanation?: string;
}

export interface FCQuestion extends BaseQuestion {
  readonly correctAnswer: string;
}

export interface FCData {
  readonly title: string;
  readonly questionType: 'FC';
  readonly description: string;
  readonly example?: FCExample;
  readonly questionData: FCFormData;
  readonly questions: FCQuestion[];
}

// ============= FCC (Flow Chart Completion) =============

export interface FCCStep {
  readonly stepNumber: number;
  readonly text: string;
  readonly blankPosition: number;
}

export interface FCCFlowData {
  readonly title: string;
  readonly flowDescription?: string;
  readonly steps: FCCStep[];
}

export interface FCCQuestion extends BaseQuestion {
  readonly correctAnswer: string;
}

export interface FCCData {
  readonly title: string;
  readonly questionType: 'FCC';
  readonly description: string;
  readonly questionData: FCCFlowData;
  readonly questions: FCCQuestion[];
}

// ============= TFNG (True/False/Not Given) =============

export type TFNGAnswer = 'TRUE' | 'FALSE' | 'NOT GIVEN';

export interface TFNGQuestion extends BaseQuestion {
  readonly correctAnswer: TFNGAnswer;
}

export interface TFNGData {
  readonly title: string;
  readonly questionType: 'TFNG';
  readonly description: string;
  readonly questions: TFNGQuestion[];
}

// ============= YNNG (Yes/No/Not Given) =============

export type YNNGAnswer = 'YES' | 'NO' | 'NOT GIVEN';

export interface YNNGQuestion extends BaseQuestion {
  readonly correctAnswer: YNNGAnswer;
}

export interface YNNGData {
  readonly title: string;
  readonly questionType: 'YNNG';
  readonly description: string;
  readonly questions: YNNGQuestion[];
}

// ============= MH (Matching Headings) =============

export interface MHQuestion extends BaseQuestion {
  readonly correctAnswer: string; // Roman numeral: i, ii, iii...
}

export interface MHData {
  readonly title: string;
  readonly questionType: 'MH';
  readonly description: string;
  readonly questionData: {
    readonly options: MatchingOption[];
    readonly note?: string;
  };
  readonly questions: MHQuestion[];
  readonly example?: {
    readonly question: string;
    readonly answer: string;
    readonly explanation?: string;
  };
}

// ============= MI (Matching Information) =============

export interface MIQuestion extends BaseQuestion {
  readonly correctAnswer: string; // Paragraph letter: A, B, C...
}

export interface MIData {
  readonly title: string;
  readonly questionType: 'MI';
  readonly description: string;
  readonly questionData: {
    readonly options: MatchingOption[];
  };
  readonly questions: MIQuestion[];
}

// ============= MF (Matching Features) =============

export interface MFQuestion extends BaseQuestion {
  readonly correctAnswer: string; // Person/theory letter: A, B, C...
}

export interface MFData {
  readonly title: string;
  readonly questionType: 'MF';
  readonly description: string;
  readonly questionData: {
    readonly options: MatchingOption[];
  };
  readonly questions: MFQuestion[];
}

// ============= SA (Short Answer) =============

export interface SAQuestion extends BaseQuestion {
  readonly correctAnswer: string;
}

export interface SAData {
  readonly title: string;
  readonly questionType: 'SA';
  readonly description: string;
  readonly questions: SAQuestion[];
}

// ============= ML (Map Labeling) =============

export interface MLLabel {
  readonly name: string;
  readonly correctAnswer: string;
}

export interface MLMapData {
  readonly title: string;
  readonly description?: string;
  readonly labelCount: number;
  readonly labels: MLLabel[];
  readonly note?: string;
}

export interface MLQuestion extends BaseQuestion {
  readonly correctAnswer: string; // Letter: A, B, C...
}

export interface MLData {
  readonly title: string;
  readonly questionType: 'ML';
  readonly description: string;
  readonly hasVisual?: boolean;
  readonly questionData: MLMapData;
  readonly questions: MLQuestion[];
}

// ============= DL (Diagram Labeling) =============

export interface DLLabel {
  readonly name: string;
  readonly text: string;
  readonly correctAnswer: string;
}

export interface DLDiagramData {
  readonly title: string;
  readonly visualDescription?: string;
  readonly labelCount: number;
  readonly labels: DLLabel[];
  readonly note?: string;
}

export interface DLQuestion extends BaseQuestion {
  readonly correctAnswer: string;
}

export interface DLData {
  readonly title: string;
  readonly questionType: 'DL';
  readonly description: string;
  readonly hasVisual: boolean;
  readonly questionData: DLDiagramData;
  readonly questions: DLQuestion[];
}

// ============= Union Types =============

export type QuestionData =
  | MCQData
  | MCMAData
  | SCData
  | SUCData
  | NCData
  | TCData
  | FCData
  | FCCData
  | TFNGData
  | YNNGData
  | MHData
  | MIData
  | MFData
  | SAData
  | MLData
  | DLData;

// ============= Answer State Types =============

export interface QuestionAnswer {
  readonly questionId: number;
  readonly answer: string | string[];
}

export interface AnswerState {
  readonly [questionId: number]: string | string[];
}

// ============= Component Props =============

export interface BaseQuestionProps {
  readonly userAnswers: AnswerState;
  readonly onAnswer: (questionId: number, answer: string | string[]) => void;
  readonly onFocus?: (questionId: number) => void;
  readonly fontSize?: string;
  readonly mode?: ExamMode;
  readonly disabled?: boolean;
}

// ============= Reading Types =============
export const READING_QUESTION_TYPES: QuestionTypeCode[] = [
  'MCQ', 'MCMA', 'TFNG', 'YNNG', 'MH', 'MI', 'MF',
  'SC', 'SUC', 'SUC_WITH_WORDLIST', 'NC', 'TC', 'SA', 'DL'
];

// ============= Listening Types =============
export const LISTENING_QUESTION_TYPES: QuestionTypeCode[] = [
  'MCQ', 'MCMA', 'SA', 'FC', 'NC', 'TC', 'SUC',
  'SUC_WITH_WORDLIST', 'ML', 'DL', 'FCC', 'MF'
];
