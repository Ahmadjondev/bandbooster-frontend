/**
 * Domain models for the Manager module
 * Simplified 3-step workflow: Extract → Save → Practice
 */

// ============================================================================
// ENUMS
// ============================================================================

export type ContentType = 'LISTENING' | 'READING';

export type PracticeMode = 'SECTION_PRACTICE' | 'FULL_TEST';

export type QuestionType =
  | 'MCQ'   // Multiple Choice
  | 'MCMA'  // Multiple Choice Multi-Answer
  | 'TFNG'  // True/False/Not Given
  | 'YNNG'  // Yes/No/Not Given
  | 'SC'    // Sentence Completion
  | 'SUC'   // Summary Completion
  | 'NC'    // Note Completion
  | 'TC'    // Table Completion
  | 'FC'    // Form Completion
  | 'FCC'   // Flow Chart Completion
  | 'MH'    // Matching Headings
  | 'MI'    // Matching Information
  | 'MF'    // Matching Features
  | 'SA'    // Short Answer
  | 'ML'    // Map Labelling
  | 'DL';   // Diagram Labelling

export type Difficulty = 'easy' | 'medium' | 'hard' | 'EASY' | 'MEDIUM' | 'HARD';

// ============================================================================
// VALIDATION ERROR
// ============================================================================

export interface ValidationError {
  readonly code: string;
  readonly message: string;
  readonly path: string;
  readonly severity: 'error' | 'warning';
}

// ============================================================================
// STATS
// ============================================================================

export interface ExtractStats {
  readonly parts?: number;
  readonly passages?: number;
  readonly questions: number;
  readonly questionTypes: QuestionType[];
}

// ============================================================================
// QUESTION STRUCTURES
// ============================================================================

/**
 * Choice/Option interface for all question types
 * - MCQ/MCMA: key = "A", "B", "C", text = option content
 * - Matching (MH, MI, MF): key = "i", "A", etc., text = heading/feature description
 * - Word lists (SUC): key = "A", "B", text = word option
 */
export interface Choice {
  readonly key: string;
  readonly text: string;
}

export interface Question {
  order: number;
  text: string;
  correctAnswer: string;
  choices?: Choice[];
}

/**
 * Schema for ML/DL labels in question_data
 */
export interface Label {
  readonly name: string;
  readonly correctAnswer: string;
}

/**
 * Schema for FCC flow chart steps
 */
export interface Step {
  readonly stepNumber: number;
  readonly text: string;
}

/**
 * Schema for example question with answer
 */
export interface Example {
  readonly question: string;
  readonly answer: string;
  readonly explanation?: string;
}

/**
 * Flexible schema for question_data field.
 * Fields used by type:
 * - SUC/NC/FC/TC: title, text, items, blankCount
 * - SUC with word bank: wordList (key/text pairs)
 * - MH/MI/MF: options (key/text pairs)
 * - ML/DL: labels, labelCount, visualDescription
 * - FCC: steps, flowDescription
 * - TC: rows (2D array - first row is headers)
 */
export interface QuestionData {
  // Common fields
  readonly title?: string;
  readonly text?: string;
  readonly items?: (string | Record<string, unknown>)[];
  readonly blankCount?: number;
  readonly note?: string;

  // SUC with word bank
  readonly wordList?: Choice[];

  // Matching types (MH, MI, MF)
  readonly options?: Choice[];

  // TC (Table Completion)
  readonly rows?: string[][];
  readonly headers?: string[];

  // ML/DL (Map/Diagram Labelling)
  readonly labels?: Label[];
  readonly labelCount?: number;
  readonly description?: string;
  readonly visualDescription?: string;

  // FCC (Flow Chart Completion)
  readonly steps?: Step[];
  readonly flowDescription?: string;
}

export interface QuestionGroup {
  title: string;
  questionType: QuestionType;
  description: string;
  questionStart: number;
  questionEnd: number;
  questionData: QuestionData;
  questions: Question[];
  example?: Example;
  hasVisual?: boolean;
}

// ============================================================================
// LISTENING STRUCTURES
// ============================================================================

export interface ListeningPart {
  partNumber: number;
  title: string;
  description: string;
  scenario?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  speakerCount: number;
  transcript?: string;
  questionGroups: QuestionGroup[];
}

export interface ListeningContent {
  parts: ListeningPart[];
}

// ============================================================================
// READING STRUCTURES
// ============================================================================

export interface ReadingPassage {
  passageNumber: number;
  title: string;
  content: string;
  summary?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  paragraphCount: number;
  testHeads: QuestionGroup[];
}

export interface ReadingContent {
  passages: ReadingPassage[];
}

// ============================================================================
// EXTRACT RESPONSE
// ============================================================================

export interface ExtractResponse {
  readonly isValid: boolean;
  readonly contentType: ContentType | null;
  readonly errors: ValidationError[];
  readonly warnings: ValidationError[];
  readonly stats: ExtractStats | null;
  readonly preview: ListeningContent | ReadingContent | null;
}

// ============================================================================
// SAVE RESPONSE
// ============================================================================

export interface SaveResult {
  readonly contentType: ContentType;
  readonly partsCreated?: number;
  readonly passagesCreated?: number;
  readonly testHeadsCreated: number;
  readonly questionsCreated: number;
  readonly choicesCreated: number;
  readonly partIds?: number[];
  readonly passageIds?: number[];
}

export interface SaveResponse {
  readonly message: string;
  readonly result: SaveResult;
}

// ============================================================================
// PRACTICE INPUT & RESPONSE
// ============================================================================

export interface CreatePracticeInput {
  readonly contentType: ContentType;
  readonly contentIds: number[];
  readonly practiceMode: PracticeMode;
  readonly title: string;
  readonly difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  readonly description?: string;
  readonly isPremium?: boolean;
}

export interface CreatePracticeResponse {
  readonly message: string;
  readonly practiceId: number;
  readonly title: string;
  readonly practiceType: ContentType;
}

// ============================================================================
// UI HELPER CONSTANTS
// ============================================================================

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  LISTENING: 'Listening',
  READING: 'Reading',
};

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  MCQ: 'Multiple Choice',
  MCMA: 'Multiple Choice Multi-Answer',
  TFNG: 'True/False/Not Given',
  YNNG: 'Yes/No/Not Given',
  SC: 'Sentence Completion',
  SUC: 'Summary Completion',
  NC: 'Note Completion',
  TC: 'Table Completion',
  FC: 'Form Completion',
  FCC: 'Flow Chart Completion',
  MH: 'Matching Headings',
  MI: 'Matching Information',
  MF: 'Matching Features',
  SA: 'Short Answer',
  ML: 'Map Labelling',
  DL: 'Diagram Labelling',
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'text-green-500',
  medium: 'text-yellow-500',
  hard: 'text-red-500',
  EASY: 'text-green-500',
  MEDIUM: 'text-yellow-500',
  HARD: 'text-red-500',
};

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isListeningContent(content: ListeningContent | ReadingContent): content is ListeningContent {
  return 'parts' in content;
}

export function isReadingContent(content: ListeningContent | ReadingContent): content is ReadingContent {
  return 'passages' in content;
}

// ============================================================================
// READING MANAGEMENT DOMAIN MODELS
// ============================================================================

export type DifficultyLevel = 'EASY' | 'INTERMEDIATE' | 'HARD';

export interface ReadingItem {
  readonly id: number;
  readonly passageNumber: number;
  readonly isAuthentic: boolean;
  readonly isPractice: boolean;
  readonly title: string;
  readonly difficulty: DifficultyLevel;
  readonly wordCount: number;
  readonly questionCount: number;
  readonly createdAt: Date;
}

export interface ReadingDetail {
  readonly id: number;
  readonly passageNumber: number;
  readonly isAuthentic: boolean;
  readonly isPractice: boolean;
  readonly title: string;
  readonly summary: string;
  readonly content: string;
  readonly difficulty: DifficultyLevel;
  readonly wordCount: number;
  readonly questionCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ReadingListResponse {
  readonly count: number;
  readonly results: ReadingItem[];
}

export interface CreateReadingInput {
  readonly passageNumber: number;
  readonly title: string;
  readonly content: string;
  readonly summary?: string;
  readonly difficulty?: DifficultyLevel;
  readonly isAuthentic?: boolean;
  readonly isPractice?: boolean;
}

export interface UpdateReadingInput {
  readonly passageNumber?: number;
  readonly title?: string;
  readonly content?: string;
  readonly summary?: string;
  readonly difficulty?: DifficultyLevel;
  readonly isAuthentic?: boolean;
  readonly isPractice?: boolean;
}

// ============================================================================
// LISTENING MANAGEMENT DOMAIN MODELS
// ============================================================================

export interface ListeningItem {
  readonly id: number;
  readonly partNumber: number;
  readonly isAuthentic: boolean;
  readonly isPractice: boolean;
  readonly title: string;
  readonly difficulty: DifficultyLevel;
  readonly durationSeconds: number | null;
  readonly hasAudio: boolean;
  readonly questionCount: number;
  readonly createdAt: Date;
}

export interface ListeningDetail {
  readonly id: number;
  readonly partNumber: number;
  readonly isAuthentic: boolean;
  readonly isPractice: boolean;
  readonly title: string;
  readonly description: string;
  readonly audioFile: string | null;
  readonly audioUrl: string | null;
  readonly difficulty: DifficultyLevel;
  readonly durationSeconds: number | null;
  readonly transcript: string;
  readonly questionCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ListeningListResponse {
  readonly count: number;
  readonly results: ListeningItem[];
}

export interface CreateListeningInput {
  readonly partNumber: number;
  readonly title: string;
  readonly description?: string;
  readonly transcript?: string;
  readonly difficulty?: DifficultyLevel;
  readonly isAuthentic?: boolean;
  readonly isPractice?: boolean;
}

export interface UpdateListeningInput {
  readonly partNumber?: number;
  readonly title?: string;
  readonly description?: string;
  readonly transcript?: string;
  readonly difficulty?: DifficultyLevel;
  readonly isAuthentic?: boolean;
  readonly isPractice?: boolean;
}

// ============================================================================
// FILTER PARAMS
// ============================================================================

export interface ContentFilterParams {
  readonly difficulty?: DifficultyLevel;
  readonly isAuthentic?: boolean;
  readonly isPractice?: boolean;
  readonly search?: string;
  readonly ordering?: string;
  readonly page?: number;
  readonly pageSize?: number;
}

// ============================================================================
// DIFFICULTY DISPLAY HELPERS
// ============================================================================

export const DIFFICULTY_LEVEL_LABELS: Record<DifficultyLevel, string> = {
  EASY: 'Easy',
  INTERMEDIATE: 'Intermediate',
  HARD: 'Hard',
};

export const DIFFICULTY_LEVEL_COLORS: Record<DifficultyLevel, string> = {
  EASY: 'text-green-500 bg-green-500/10',
  INTERMEDIATE: 'text-yellow-500 bg-yellow-500/10',
  HARD: 'text-red-500 bg-red-500/10',
};

