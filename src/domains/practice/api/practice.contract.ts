/**
 * Data Transfer Objects (DTOs) from the backend API
 * Contract-first approach - mirrors exact backend responses
 */

// ============= Enums =============

export type SectionType = 'READING' | 'LISTENING' | 'WRITING' | 'SPEAKING';
export type TestType = 'FULL_TEST' | 'SECTION_PRACTICE';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
export type AttemptStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

// Writing specific
export type ChartType = 'LINE_GRAPH' | 'BAR_CHART' | 'PIE_CHART' | 'TABLE' | 'MAP' | 'PROCESS' | 'MIXED';
export type TaskType = 'TASK_1' | 'TASK_2';

// Question types
export type QuestionType = 
  | 'MCQ'    // Multiple Choice
  | 'MCMA'   // Multiple Choice Multiple Answer
  | 'SA'     // Short Answer
  | 'SC'     // Sentence Completion
  | 'SUC'    // Summary Completion
  | 'NC'     // Note Completion
  | 'FC'     // Form Completion
  | 'TC'     // Table Completion
  | 'FCC'    // Flow Chart Completion
  | 'TFNG'   // True/False/Not Given
  | 'YNNG'   // Yes/No/Not Given
  | 'MH'     // Matching Headings
  | 'MI'     // Matching Information
  | 'MF'     // Matching Features
  | 'ML'     // Matching List
  | 'DL';    // Diagram Labeling

// ============= Overview DTOs =============

export interface SectionOverviewDTO {
  section_type: SectionType;
  display_name: string;
  icon: string;
  color: string;
  total_practices: number;
  free_practices: number;
  completed_practices: number;
  total_attempts: number;
  best_score: number | null;
  progress_percentage: number;
}

// ============= Practice List DTOs =============

export interface PracticeListItemDTO {
  uuid: string;
  title: string;
  description: string;
  section_type: SectionType;
  section_type_display: string;
  test_type: TestType;
  difficulty: DifficultyLevel;
  difficulty_display: string;
  duration: number;
  total_questions: number;
  is_premium: boolean;
  content_count: number;
  attempts_count: number;
  best_score: number | null;
  last_attempt_date: string | null;
  last_attempt: string | null;
  created_at: string;
  // Reading specific
  reading_passage_number?: number | null;
  // Listening specific
  listening_part_number?: number | null;
  // Writing specific
  writing_task_type?: TaskType | null;
  writing_chart_type?: ChartType | null;
  writing_prompt_preview?: string | null;
  // Speaking specific
  speaking_part?: number | null;
  speaking_topic_name?: string | null;
  // Access control
  user_has_access: boolean;
  requires_payment: boolean;
}

export interface PracticeSectionResponseDTO {
  section_type: SectionType;
  practices: PracticeListItemDTO[];
  pagination: {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
  stats: {
    total_attempts: number;
    average_score: number | null;
    best_score: number | null;
    total_time_minutes: number;
  };
  available_filters: {
    difficulties: { value: DifficultyLevel; label: string }[];
    sort_options: { value: string; label: string }[];
    passage_numbers?: { value: number; label: string }[];
    part_numbers?: { value: number; label: string }[];
    chart_types?: { value: ChartType; label: string }[];
    task_types?: { value: TaskType; label: string }[];
    speaking_parts?: { value: number; label: string }[];
  };
}

// ============= Practice Detail DTOs =============

export interface QuestionDTO {
  id: number;
  question_key: string;
  question_text: string;
  question_type: QuestionType;
  options?: string[];
  correct_answer?: string | string[];
  points: number;
  audio_url?: string;
  image_url?: string;
  order_index: number;
}

export interface PassageDTO {
  id: number;
  title: string;
  content: string;
  passage_number: number;
  word_count: number;
  questions: QuestionDTO[];
}

export interface ListeningPartDTO {
  id: number;
  part_number: number;
  title: string;
  description?: string;
  audio_url: string;
  transcript?: string;
  questions: QuestionDTO[];
}

export interface WritingTaskDTO {
  id: number;
  task_type: TaskType;
  prompt: string;
  chart_image_url?: string;
  chart_description?: string;
  sample_answer?: string;
  word_limit: number;
}

export interface SpeakingPartDTO {
  id: number;
  part_number: number;
  title: string;
  description: string;
  cue_card?: string;
  follow_up_questions?: string[];
  preparation_time_seconds: number;
  speaking_time_seconds: number;
  questions: QuestionDTO[];
}

export interface PracticeDetailDTO {
  uuid: string;
  title: string;
  description: string;
  section_type: SectionType;
  test_type: TestType;
  difficulty: DifficultyLevel;
  duration_minutes: number;
  total_questions: number;
  is_premium: boolean;
  is_free: boolean;
  created_at: string;
  updated_at: string;
  // Section specific content
  passages?: PassageDTO[];
  listening_parts?: ListeningPartDTO[];
  writing_tasks?: WritingTaskDTO[];
  speaking_parts?: SpeakingPartDTO[];
  // User specific
  user_attempts_count?: number;
  user_best_score?: number | null;
  user_last_attempt_at?: string | null;
}

// ============= Attempt DTOs =============

export interface AttemptListItemDTO {
  uuid: string;
  practice_uuid: string;
  practice_title: string;
  section_type: SectionType;
  test_type: TestType;
  difficulty: DifficultyLevel;
  status: AttemptStatus;
  score: number | null;
  correct_answers: number;
  total_questions: number;
  accuracy_percentage: number | null;
  time_spent_seconds: number;
  started_at: string;
  completed_at: string | null;
}

export interface AttemptDetailDTO extends AttemptListItemDTO {
  practice: PracticeDetailDTO;
  answers: Record<string, string | string[]>;
}

export interface QuestionResultDTO {
  question_id: number;
  question_key: string;
  user_answer: string | string[] | null;
  correct_answer: string | string[];
  is_correct: boolean;
  points_earned: number;
  max_points: number;
}

export interface AttemptResultDTO {
  attempt_uuid: string;
  practice_uuid: string;
  practice_title: string;
  section_type: SectionType;
  test_type: TestType;
  score: number;
  band_score?: number;
  correct_answers: number;
  total_questions: number;
  accuracy_percentage: number;
  time_spent_seconds: number;
  started_at: string;
  completed_at: string;
  question_results: QuestionResultDTO[];
  section_scores?: Record<SectionType, number>;
}

// ============= Submission DTOs =============

export interface SubmitAnswersRequestDTO {
  answers: Record<string, string | string[]>;
  started_at: string;
  time_spent_seconds: number;
}

export interface SubmitAnswersResponseDTO {
  success: boolean;
  attempt_uuid: string;
  score: number;
  band_score?: number;
  correct_answers: number;
  total_questions: number;
  accuracy_percentage: number;
  time_spent_seconds: number;
  message: string;
}

// ============= Writing Submission DTOs =============

export interface SubmitWritingRequestDTO {
  response: string;
  started_at: string;
  time_spent_seconds: number;
}

export interface WritingEvaluationDTO {
  overall_band_score: number;
  criteria: {
    task_achievement: number;
    coherence_cohesion: number;
    lexical_resource: number;
    grammatical_range: number;
  };
  feedback_summary: string;
  inline_corrections: string;
  corrected_essay: string;
  sentence_feedback: Array<{
    original: string;
    corrected: string;
    feedback: string;
  }>;
}

export interface SubmitWritingResponseDTO {
  success: boolean;
  attempt_uuid: string;
  score: number;
  band_score: number;
  evaluation: WritingEvaluationDTO;
  message: string;
}

// ============= Speaking Submission DTOs =============

export interface SubmitSpeakingAnswerRequestDTO {
  question_key: string;
  audio_file: File;
  session_id: string;
}

export interface SubmitSpeakingAnswerResponseDTO {
  success: boolean;
  message: string;
  question_key: string;
  recording_uuid: string;
}

export interface CompleteSpeakingRequestDTO {
  session_id: string;
  started_at: string;
  time_spent_seconds: number;
}

export interface SpeakingEvaluationDTO {
  overall_band_score: number;
  criteria: {
    fluency_coherence: number;
    lexical_resource: number;
    grammatical_range: number;
    pronunciation: number;
  };
  overall_feedback: string;
  azure_scores: {
    pronunciation_score: number;
    fluency_score: number;
    accuracy_score: number;
  };
  transcripts: Array<{
    question_key: string;
    transcript: string;
    feedback: string;
  }>;
}

export interface CompleteSpeakingResponseDTO {
  success: boolean;
  attempt_uuid: string;
  score: number;
  band_score: number;
  evaluation: SpeakingEvaluationDTO;
  message: string;
}

// ============= Stats DTOs =============

export interface SectionStatsDTO {
  section_type: SectionType;
  total_attempts: number;
  completed_attempts: number;
  average_score: number | null;
  best_score: number | null;
  total_time_spent_seconds: number;
  accuracy_percentage: number | null;
  last_attempt_at: string | null;
}

export interface UserStatsDTO {
  total_attempts: number;
  total_completed: number;
  overall_average_score: number | null;
  total_time_spent_seconds: number;
  section_stats: SectionStatsDTO[];
  recent_activity: AttemptListItemDTO[];
}

export interface SectionAttemptBalanceDTO {
  section_type: SectionType;
  remaining_attempts: number;
  is_unlimited: boolean;
}

export interface AttemptBalanceResponseDTO {
  is_premium: boolean;
  balances: SectionAttemptBalanceDTO[];
}

export interface SectionSpecificStatsDTO {
  section_type: SectionType;
  display_name: string;
  total_practices: number;
  completed_practices: number;
  total_attempts: number;
  average_score: number | null;
  best_score: number | null;
  total_time_spent_seconds: number;
  accuracy_percentage: number | null;
  score_history: Array<{
    date: string;
    score: number;
  }>;
  difficulty_breakdown: Record<DifficultyLevel, {
    completed: number;
    total: number;
    average_score: number | null;
  }>;
}
