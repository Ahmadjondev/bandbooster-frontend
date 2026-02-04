/**
 * Data Transfer Objects (DTOs) for Manager API
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

// ============================================================================
// VALIDATION ERROR DTO
// ============================================================================

export interface ValidationErrorDTO {
  code: string;
  message: string;
  path: string;
  severity: 'error' | 'warning';
}

// ============================================================================
// STATS DTO
// ============================================================================

export interface ExtractStatsDTO {
  parts?: number;
  passages?: number;
  questions: number;
  question_types: string[];
}

// ============================================================================
// QUESTION STRUCTURE DTOs
// ============================================================================

export interface ChoiceDTO {
  key: string;
  text: string;
}

export interface QuestionDTO {
  order: number;
  text: string;
  correct_answer: string;
  choices?: ChoiceDTO[];
}

/**
 * Schema for ML/DL labels in question_data
 */
export interface LabelDTO {
  name: string;
  correctAnswer: string;
}

/**
 * Schema for FCC flow chart steps
 */
export interface StepDTO {
  step_number: number;
  text: string;
}

/**
 * Schema for example question with answer
 */
export interface ExampleDTO {
  question: string;
  answer: string;
  explanation?: string;
}

/**
 * Flexible schema for question_data field.
 * Fields used by type:
 * - SUC/NC/FC/TC: title, text, items, blankCount
 * - SUC with word bank: word_list (key/text pairs)
 * - MH/MI/MF: options (key/text pairs)
 * - ML/DL: labels, labelCount, visual_description
 * - FCC: steps, flow_description
 * - TC: rows (2D array - first row is headers)
 */
export interface QuestionDataDTO {
  // Common fields
  title?: string;
  text?: string;
  items?: (string | Record<string, unknown>)[];
  blankCount?: number;
  note?: string;

  // SUC with word bank
  word_list?: ChoiceDTO[];

  // Matching types (MH, MI, MF)
  options?: ChoiceDTO[];

  // TC (Table Completion)
  rows?: string[][];
  headers?: string[];

  // ML/DL (Map/Diagram Labelling)
  labels?: LabelDTO[];
  labelCount?: number;
  description?: string;
  visual_description?: string;

  // FCC (Flow Chart Completion)
  steps?: StepDTO[];
  flow_description?: string;
}

export interface QuestionGroupDTO {
  title: string;
  question_type: QuestionType;
  description: string;
  question_start: number;
  question_end: number;
  question_data: QuestionDataDTO;
  example?: ExampleDTO;
  questions: QuestionDTO[];
  has_visual?: boolean;
}

// ============================================================================
// LISTENING STRUCTURE DTOs
// ============================================================================

export interface ListeningPartDTO {
  part_number: number;
  title: string;
  description: string;
  scenario?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  speaker_count: number;
  transcript?: string;
  question_groups: QuestionGroupDTO[];
}

export interface ListeningContentDTO {
  parts: ListeningPartDTO[];
}

// ============================================================================
// READING STRUCTURE DTOs
// ============================================================================

export interface ReadingPassageDTO {
  passage_number: number;
  title: string;
  content: string;
  summary?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  paragraph_count: number;
  test_heads: QuestionGroupDTO[];
}

export interface ReadingContentDTO {
  passages: ReadingPassageDTO[];
}

// ============================================================================
// EXTRACT REQUEST DTOs
// ============================================================================

export interface ExtractJsonRequestDTO {
  json_content: ListeningContentDTO | ReadingContentDTO;
}

export interface ExtractTextRequestDTO {
  json_text: string;
}

// ============================================================================
// EXTRACT RESPONSE DTO
// ============================================================================

export interface ExtractResponseDTO {
  is_valid: boolean;
  content_type: ContentType | null;
  errors: ValidationErrorDTO[];
  warnings: ValidationErrorDTO[];
  stats: ExtractStatsDTO | null;
  preview: ListeningContentDTO | ReadingContentDTO | null;
}

// ============================================================================
// SAVE REQUEST & RESPONSE DTOs
// ============================================================================

export interface SaveRequestDTO {
  content: ListeningContentDTO | ReadingContentDTO;
}

export interface SaveResultDTO {
  content_type: ContentType;
  parts_created?: number;
  passages_created?: number;
  test_heads_created: number;
  questions_created: number;
  choices_created: number;
  part_ids?: number[];
  passage_ids?: number[];
}

export interface SaveResponseDTO {
  message: string;
  result: SaveResultDTO;
}

// ============================================================================
// PRACTICE REQUEST & RESPONSE DTOs
// ============================================================================

export interface CreatePracticeRequestDTO {
  content_type: ContentType;
  content_ids: number[];
  practice_mode: PracticeMode;
  title: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  description?: string;
  is_premium?: boolean;
}

export interface CreatePracticeResponseDTO {
  message: string;
  practice_id: number;
  title: string;
  practice_type: ContentType;
}

// ============================================================================
// READING MANAGEMENT DTOs
// ============================================================================

export interface ReadingItemDTO {
  id: number;
  passage_number: number;
  is_authentic: boolean;
  is_practice: boolean;
  title: string;
  difficulty: 'EASY' | 'INTERMEDIATE' | 'HARD';
  word_count: number;
  question_count: number;
  created_at: string;
}

export interface ReadingDetailDTO {
  id: number;
  passage_number: number;
  is_authentic: boolean;
  is_practice: boolean;
  title: string;
  summary: string;
  content: string;
  difficulty: 'EASY' | 'INTERMEDIATE' | 'HARD';
  word_count: number;
  question_count: number;
  created_at: string;
  updated_at: string;
}

export interface ReadingListResponseDTO {
  count: number;
  results: ReadingItemDTO[];
}

export interface CreateReadingRequestDTO {
  passage_number: number;
  title: string;
  content: string;
  summary?: string;
  difficulty?: 'EASY' | 'INTERMEDIATE' | 'HARD';
  is_authentic?: boolean;
  is_practice?: boolean;
}

export interface UpdateReadingRequestDTO {
  passage_number?: number;
  title?: string;
  content?: string;
  summary?: string;
  difficulty?: 'EASY' | 'INTERMEDIATE' | 'HARD';
  is_authentic?: boolean;
  is_practice?: boolean;
}

// ============================================================================
// LISTENING MANAGEMENT DTOs
// ============================================================================

export interface ListeningItemDTO {
  id: number;
  part_number: number;
  is_authentic: boolean;
  is_practice: boolean;
  title: string;
  difficulty: 'EASY' | 'INTERMEDIATE' | 'HARD';
  duration_seconds: number | null;
  has_audio: boolean;
  question_count: number;
  created_at: string;
}

export interface ListeningDetailDTO {
  id: number;
  part_number: number;
  is_authentic: boolean;
  is_practice: boolean;
  title: string;
  description: string;
  audio_file: string | null;
  audio_url: string | null;
  difficulty: 'EASY' | 'INTERMEDIATE' | 'HARD';
  duration_seconds: number | null;
  transcript: string;
  question_count: number;
  created_at: string;
  updated_at: string;
}

export interface ListeningListResponseDTO {
  count: number;
  results: ListeningItemDTO[];
}

export interface CreateListeningRequestDTO {
  part_number: number;
  title: string;
  description?: string;
  transcript?: string;
  difficulty?: 'EASY' | 'INTERMEDIATE' | 'HARD';
  is_authentic?: boolean;
  is_practice?: boolean;
}

export interface UpdateListeningRequestDTO {
  part_number?: number;
  title?: string;
  description?: string;
  transcript?: string;
  difficulty?: 'EASY' | 'INTERMEDIATE' | 'HARD';
  is_authentic?: boolean;
  is_practice?: boolean;
}

// ============================================================================
// FILTER PARAMS
// ============================================================================

export interface ContentFilterParamsDTO {
  difficulty?: 'EASY' | 'INTERMEDIATE' | 'HARD';
  is_authentic?: boolean;
  is_practice?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}
