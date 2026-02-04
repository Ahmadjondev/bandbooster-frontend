/**
 * Contest API Data Transfer Objects (DTOs)
 * Contract-first approach - mirrors exact backend responses from Contest API
 * 
 * @see CONTEST_API.md for full API documentation
 */

// ============= Enums =============

export type ContestType = 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING' | 'FULL_TEST';
export type ContestDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
export type ContestStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
export type AttemptStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED' | 'ABANDONED';
export type SectionName = 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING';

// ============= Common DTOs =============

export interface StudentDTO {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  full_name?: string;
}

// ============= Contest List DTOs =============

export interface ContestListItemDTO {
  uuid: string;
  title: string;
  description?: string;
  contest_type: ContestType;
  difficulty: ContestDifficulty;
  status: ContestStatus;
  start_time: string; // ISO 8601
  end_time: string; // ISO 8601
  duration_minutes: number | null;
  is_public: boolean;
  has_access_code: boolean;
  total_questions: number;
  participant_count: number;
  created_at: string;
  updated_at: string;
  created_by?: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  // Teacher-specific
  results_visible?: boolean;
  auto_grade_reading?: boolean;
  auto_grade_listening?: boolean;
}

// ============= Contest Detail DTOs =============

export interface ContestDetailDTO extends ContestListItemDTO {
  reading_passages?: ReadingPassageContentDTO[];
  listening_parts?: ListeningPartContentDTO[];
  writing_tasks?: WritingTaskContentDTO[];
  speaking_topics?: SpeakingTopicContentDTO[];
  assigned_students?: StudentDTO[];
}

// ============= Content Selection DTOs =============

export interface ReadingPassageContentDTO {
  id: number;
  title: string;
  passage_number: number;
  word_count: number;
  question_count: number;
  difficulty: string;
}

export interface ListeningPartContentDTO {
  id: number;
  title: string;
  part_number: number;
  duration_seconds: number;
  question_count: number;
}

export interface WritingTaskContentDTO {
  id: number;
  task_type: 'TASK_1' | 'TASK_2';
  task_type_display: string;
  prompt_preview: string;
  chart_type?: string;
  min_words: number;
}

export interface SpeakingTopicContentDTO {
  id: number;
  speaking_type: string;
  topic_name: string;
  part_number: number;
  question_count: number;
}

// ============= Contest Create/Update DTOs =============

export interface CreateContestRequestDTO {
  title: string;
  description?: string;
  contest_type: ContestType;
  difficulty?: ContestDifficulty;
  start_time: string;
  end_time: string;
  duration_minutes?: number;
  is_public?: boolean;
  access_code?: string;
  auto_grade_reading?: boolean;
  auto_grade_listening?: boolean;
  reading_passage_ids?: number[];
  listening_part_ids?: number[];
  writing_task_ids?: number[];
  speaking_topic_ids?: number[];
  assigned_student_ids?: number[];
}

export interface UpdateContestRequestDTO {
  title?: string;
  description?: string;
  difficulty?: ContestDifficulty;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  is_public?: boolean;
  access_code?: string;
  auto_grade_reading?: boolean;
  auto_grade_listening?: boolean;
  results_visible?: boolean;
}

export interface UpdateContestContentRequestDTO {
  reading_passage_ids?: number[];
  listening_part_ids?: number[];
  writing_task_ids?: number[];
  speaking_topic_ids?: number[];
  action: 'add' | 'remove' | 'replace';
}

export interface AssignStudentsRequestDTO {
  student_ids: number[];
  action: 'add' | 'remove' | 'replace';
}

// ============= Statistics DTOs =============

export interface ContestStatisticsDTO {
  total_contests: number;
  active_contests: number;
  scheduled_contests: number;
  completed_contests: number;
  draft_contests: number;
  total_attempts: number;
  submitted_attempts: number;
}

// ============= Leaderboard DTOs =============

export interface LeaderboardEntryDTO {
  rank: number;
  student: StudentDTO;
  overall_score: number | null;
  listening_score: number | null;
  reading_score: number | null;
  writing_score: number | null;
  speaking_score: number | null;
  correct_answers: number;
  total_questions: number;
  time_spent_seconds: number;
  submitted_at: string | null;
}

export interface LeaderboardResponseDTO {
  contest_uuid: string;
  contest_title: string;
  total_participants: number;
  leaderboard: LeaderboardEntryDTO[];
}

// ============= Attempt DTOs =============

export interface ContestAttemptListItemDTO {
  uuid: string;
  contest: {
    uuid: string;
    title: string;
    contest_type: ContestType;
    difficulty: ContestDifficulty;
  };
  status: AttemptStatus;
  current_section: SectionName | null;
  started_at: string | null;
  submitted_at: string | null;
  time_spent_seconds: number | null;
  overall_score: number | null;
}

export interface ContestAttemptDetailDTO extends ContestAttemptListItemDTO {
  contest: ContestDetailDTO;
  questions?: ContestQuestionDTO[];
  time_remaining_seconds: number;
  sections_completed: SectionName[];
}

// ============= Question DTOs for Attempt =============

export interface ContestQuestionDTO {
  id: number;
  question_key: string;
  question_text: string;
  question_type: string;
  options?: string[];
  points: number;
  section: SectionName;
  order_index: number;
  user_answer?: string;
  // Only available after grading
  is_correct?: boolean;
  correct_answer?: string;
}

// ============= Section Data DTOs =============

export interface ListeningPartDataDTO {
  id: number;
  part_number: number;
  title: string;
  description?: string;
  audio_url: string;
  test_heads?: TestHeadDTO[];
}

export interface ReadingPassageDataDTO {
  id: number;
  passage_number: number;
  title: string;
  content: string;
  word_count: number;
  test_heads?: TestHeadDTO[];
}

export interface WritingTaskDataDTO {
  id: number;
  task_type: 'TASK_1' | 'TASK_2';
  task_type_display: string;
  prompt: string;
  picture?: string;
  data?: Record<string, unknown>;
  min_words: number;
  user_answer?: string;
  word_count?: number;
}

export interface TestHeadDTO {
  id: number;
  title: string;
  instructions: string;
  question_type: string;
  options?: string[];
  questions?: SectionQuestionDTO[];
}

export interface SectionQuestionDTO {
  id: number;
  question_key: string;
  question_text: string;
  question_type: string;
  options?: string[];
  points: number;
  order_index: number;
  user_answer?: string;
}

export interface SectionDataDTO {
  section_name: SectionName;
  time_remaining: number;
  next_section_name: SectionName | null;
  is_last_section: boolean;
  // Listening
  parts?: ListeningPartDataDTO[];
  // Reading
  passages?: ReadingPassageDataDTO[];
  // Writing
  tasks?: WritingTaskDataDTO[];
}

// ============= Submit DTOs =============

export interface SubmitContestAnswersRequestDTO {
  answers: Record<string, string>; // question_id -> answer
  started_at: string;
  time_spent_seconds: number;
}

export interface WritingAnswerDTO {
  task_id: number;
  answer_text: string;
}

export interface SubmitWritingRequestDTO {
  writing_answers: WritingAnswerDTO[];
  started_at: string;
  time_spent_seconds: number;
}

export interface SubmitContestResponseDTO {
  uuid: string;
  status: AttemptStatus;
  submitted_at: string;
  time_spent_seconds: number;
  listening_score: number | null;
  reading_score: number | null;
  writing_score: number | null;
  speaking_score: number | null;
  overall_score: number | null;
  correct_answers: number;
  total_questions: number;
}

// ============= Result DTOs =============

export interface ContestResultDTO {
  uuid: string;
  contest: {
    uuid: string;
    title: string;
    contest_type: ContestType;
    difficulty: ContestDifficulty;
    results_visible: boolean;
  };
  status: AttemptStatus;
  scores: {
    listening_score: number | null;
    reading_score: number | null;
    writing_score: number | null;
    speaking_score: number | null;
    overall_score: number | null;
  };
  statistics: {
    correct_answers: number;
    total_questions: number;
    percentage: number;
    time_spent_seconds: number;
  };
  detailed_results?: {
    listening?: ListeningResultDTO[];
    reading?: ReadingResultDTO[];
    writing?: WritingResultDTO[];
  };
  submitted_at: string | null;
}

export interface ListeningResultDTO {
  part_number: number;
  title: string;
  questions: QuestionResultDTO[];
}

export interface ReadingResultDTO {
  passage_number: number;
  title: string;
  questions: QuestionResultDTO[];
}

export interface QuestionResultDTO {
  question_key: string;
  question_text: string;
  user_answer: string | null;
  correct_answer: string;
  is_correct: boolean;
  points: number;
}

export interface WritingResultDTO {
  task_type: 'TASK_1' | 'TASK_2';
  task_type_display: string;
  prompt: string;
  user_answer: string;
  word_count: number;
  score: number | null;
  feedback?: WritingFeedbackDTO;
}

export interface WritingFeedbackDTO {
  task_response_or_achievement?: string;
  coherence_and_cohesion?: string;
  lexical_resource?: string;
  grammatical_range_and_accuracy?: string;
  overall?: string[];
}

// ============= Teacher Grading DTOs =============

export interface GradeWritingRequestDTO {
  attempt_uuid: string;
  task_id: number;
  score: number;
  feedback?: WritingFeedbackDTO;
}

export interface ToggleResultsVisibleResponseDTO {
  message: string;
  results_visible: boolean;
}

// ============= Available Content DTOs =============

export interface AvailableReadingPassageDTO {
  id: number;
  title: string;
  passage_number: number;
  word_count: number;
  question_count: number;
  difficulty: string;
  is_premium: boolean;
}

export interface AvailableListeningPartDTO {
  id: number;
  title: string;
  part_number: number;
  duration_seconds: number;
  question_count: number;
  is_premium: boolean;
}

export interface AvailableWritingTaskDTO {
  id: number;
  task_type: 'TASK_1' | 'TASK_2';
  task_type_display: string;
  prompt_preview: string;
  chart_type?: string;
  is_premium: boolean;
}

export interface AvailableSpeakingTopicDTO {
  id: number;
  speaking_type: string;
  topic_name: string;
  part_number: number;
  is_premium: boolean;
}

// ============= Join Contest DTO =============

export interface JoinContestRequestDTO {
  access_code?: string;
}

export interface JoinContestResponseDTO {
  success: boolean;
  message: string;
  contest_uuid?: string;
}

// ============= Start Attempt DTO =============

export interface StartAttemptResponseDTO {
  uuid: string;
  contest: ContestDetailDTO;
  status: AttemptStatus;
  started_at: string;
  questions?: ContestQuestionDTO[];
  time_remaining_seconds: number;
  current_section: SectionName;
}

// ============= Next Section DTO =============

export interface NextSectionResponseDTO {
  success: boolean;
  current_section: SectionName | 'COMPLETED';
  status?: AttemptStatus;
  message?: string;
}
