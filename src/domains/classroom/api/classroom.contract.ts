/**
 * Data Transfer Objects (DTOs) for Classroom API
 * Matches BandBooster backend API schema (snake_case)
 * ALIGNED WITH ACTUAL API RESPONSES - January 2026
 */

// ============================================================================
// ENUMS & TYPES
// ============================================================================

export type ClassroomStatus = 'ACTIVE' | 'ARCHIVED' | 'INACTIVE';
export type EnrollmentStatus = 'active' | 'inactive' | 'removed';
export type AssignmentBundleStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';
export type AssignmentType = 'HOMEWORK' | 'QUIZ' | 'EXAM' | 'PRACTICE' | 'REMEDIAL';
export type BundleItemType = 'MOCK_EXAM' | 'TEACHER_EXAM' | 'WRITING_TASK' | 'SPEAKING_TOPIC' | 'READING_PASSAGE' | 'LISTENING_PART';
export type GradingStatus = 'pending' | 'graded' | 'reviewed';
export type MessageType = 'MESSAGE' | 'ANNOUNCEMENT' | 'REMINDER' | 'UPDATE';
export type GradeAction = 'approve' | 'override' | 'return';

// ============================================================================
// USER SUMMARY DTOs
// ============================================================================

/** Student summary within a classroom context */
export interface StudentSummaryDTO {
  id: number;
  uuid?: string;
  username: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  profile_image?: string | null;
}

/** Teacher summary (from classroom detail endpoint) */
export interface TeacherSummaryDTO {
  id: number;
  username: string;
  name?: string;
  full_name?: string;
  email?: string;
  profile_image?: string | null;
}

/** Author summary (simplified, used in feed items) */
export interface AuthorSummaryDTO {
  id: number;
  name: string;
}

// ============================================================================
// CLASSROOM DTOs
// ============================================================================

/** Classroom DTO from list endpoint */
export interface ClassroomListItemDTO {
  id: number;
  uuid: string;
  name: string;
  description?: string | null;
  teacher_name: string;
  target_band?: number | null;
  status: ClassroomStatus;
  student_count: number;
  assignment_count: number;
  pending_grading: number;
  invite_code: string;
  invite_enabled: boolean;
  created_at: string;
}

/** Classroom detail DTO */
export interface ClassroomDetailDTO {
  id: number;
  uuid: string;
  name: string;
  description?: string | null;
  teacher: TeacherSummaryDTO;
  target_band?: number | null;
  status: ClassroomStatus;
  student_count: number;
  max_students?: number;
  is_full: boolean;
  invite_code: string;
  invite_enabled: boolean;
  magic_link: string;
  assignment_count: number;
  active_assignments: number;
  enrollments: EnrollmentDTO[];
  created_at: string;
  updated_at: string;
}

/** Classroom list response (paginated) */
export interface ClassroomListResponseDTO {
  count: number;
  total_pages: number;
  page: number;
  page_size: number;
  next?: string | null;
  previous?: string | null;
  results: ClassroomListItemDTO[];
}

/** Create classroom request */
export interface CreateClassroomRequestDTO {
  name: string;
  description?: string;
  max_students?: number;
  target_band?: number;
  invite_enabled?: boolean;
}

/** Update classroom request */
export interface UpdateClassroomRequestDTO {
  name?: string;
  description?: string;
  status?: ClassroomStatus;
  max_students?: number;
  target_band?: number;
  invite_enabled?: boolean;
}

/** Regenerate invite code response */
export interface RegenerateInviteResponseDTO {
  invite_code: string;
}

/** Toggle invites response */
export interface ToggleInvitesResponseDTO {
  invite_enabled: boolean;
}

// ============================================================================
// ENROLLMENT DTOs
// ============================================================================

/** Enrollment DTO */
export interface EnrollmentDTO {
  uuid: string;
  student: StudentSummaryDTO;
  classroom: {
    uuid: string;
    name: string;
  };
  status: EnrollmentStatus;
  teacher_notes?: string;
  enrolled_at: string;
  last_activity_at?: string;
  xp?: number;
  current_band?: number;
}

/** Enrollment list response (paginated) */
export interface EnrollmentListResponseDTO {
  count: number;
  next?: string;
  previous?: string;
  results: EnrollmentDTO[];
}

/** Student roster item - from /classrooms/{uuid}/roster/ */
export interface StudentRosterItemDTO {
  uuid: string;
  student: StudentSummaryDTO;
  status: EnrollmentStatus;
  enrolled_at: string;
  last_activity_at?: string;
  xp?: number;
  current_band?: number;
  assignments_completed?: number;
  teacher_notes?: string;
}

/** Student roster response (paginated) */
export interface StudentRosterResponseDTO {
  count: number;
  total_pages?: number;
  page?: number;
  page_size?: number;
  next?: string | null;
  previous?: string | null;
  results: StudentRosterItemDTO[];
}

/** Join classroom request */
export interface JoinClassroomRequestDTO {
  invite_code: string;
}

/** Join classroom response */
export interface JoinClassroomResponseDTO {
  enrollment: EnrollmentDTO;
  classroom: ClassroomDetailDTO;
}

/** Check invite code response */
export interface CheckInviteCodeResponseDTO {
  valid: boolean;
  classroom?: {
    uuid: string;
    name: string;
    teacher_name: string;
    student_count: number;
  };
}

/** Remove student request */
export interface RemoveStudentRequestDTO {
  student_id: number;
}

/** Update teacher notes request */
export interface UpdateTeacherNotesRequestDTO {
  notes: string;
}

/** My classrooms response (for students) */
export interface MyClassroomsResponseDTO {
  classrooms: Array<{
    enrollment: EnrollmentDTO;
    classroom: ClassroomListItemDTO;
  }>;
}

// ============================================================================
// CONTENT OBJECT DTOs
// ============================================================================

/** Base content object in assignment item */
export interface ContentObjectDTO {
  id: number;
  uuid?: string;
  title: string;
  exam_type?: string;
  exam_type_display?: string;
  difficulty_level?: string;
  difficulty?: string;
  passage_number?: number;
}

/** Reading passage content */
export interface ReadingPassageContentDTO {
  id: number;
  passage_number: number;
  title: string;
  difficulty: string;
}

/** Writing task content */
export interface WritingTaskContentDTO {
  id: number;
  uuid?: string;
  title: string;
  task_type?: string;
  difficulty?: string;
}

/** Listening part content */
export interface ListeningPartContentDTO {
  id: number;
  part_number: number;
  title: string;
  difficulty?: string;
}

/** Speaking topic content */
export interface SpeakingTopicContentDTO {
  id: number;
  uuid?: string;
  title: string;
  part?: number;
  difficulty?: string;
}

/** Mock exam content */
export interface MockExamContentDTO {
  id: number;
  uuid: string;
  title: string;
  exam_type: string;
  exam_type_display: string;
  difficulty_level: string;
}

// ============================================================================
// ASSIGNMENT BUNDLE DTOs
// ============================================================================

/** Assignment item DTO */
export interface AssignmentItemDTO {
  id: number;
  uuid: string;
  item_type: BundleItemType;
  content_type: BundleItemType;
  content_id: number;
  content_title: string;
  content_object?: ContentObjectDTO;
  item_instructions?: string | null;
  order: number;
  points: number;
  is_required: boolean;
  created_at: string;
}

/** Assignment bundle list item DTO */
export interface AssignmentBundleListItemDTO {
  id: number;
  uuid: string;
  title: string;
  classroom_name: string;
  assignment_type: AssignmentType;
  status: AssignmentBundleStatus;
  due_date?: string | null;
  total_items: number;
  is_available: boolean;
  is_overdue: boolean;
  created_at: string;
}

/** Assignment bundle detail DTO */
export interface AssignmentBundleDetailDTO {
  id: number;
  uuid: string;
  classroom: ClassroomListItemDTO;
  created_by: TeacherSummaryDTO;
  title: string;
  description?: string | null;
  assignment_type: AssignmentType;
  teacher_instructions?: string | null;
  available_from?: string | null;
  due_date?: string | null;
  allow_late_submission: boolean;
  time_limit_minutes?: number | null;
  target_min_band?: number | null;
  target_max_band?: number | null;
  status: AssignmentBundleStatus;
  require_teacher_approval: boolean;
  auto_release_results: boolean;
  allow_multiple_attempts: boolean;
  max_attempts: number;
  items: AssignmentItemDTO[];
  total_items: number;
  is_available: boolean;
  is_overdue: boolean;
  submission_count: number;
  pending_review_count: number;
  created_at: string;
  updated_at: string;
  published_at?: string | null;
}

/** Assignment bundle list response */
export interface AssignmentBundleListResponseDTO {
  count: number;
  total_pages: number;
  page: number;
  page_size: number;
  next?: string | null;
  previous?: string | null;
  results: AssignmentBundleListItemDTO[];
}

/** Create assignment bundle request */
export interface CreateAssignmentBundleRequestDTO {
  classroom_uuid: string;
  title: string;
  description?: string;
  assignment_type?: AssignmentType;
  teacher_instructions?: string;
  available_from?: string;
  due_date?: string;
  allow_late_submission?: boolean;
  time_limit_minutes?: number;
  target_min_band?: number;
  target_max_band?: number;
  require_teacher_approval?: boolean;
  auto_release_results?: boolean;
  allow_multiple_attempts?: boolean;
  max_attempts?: number;
}

/** Update assignment bundle request */
export interface UpdateAssignmentBundleRequestDTO {
  title?: string;
  description?: string;
  assignment_type?: AssignmentType;
  teacher_instructions?: string;
  available_from?: string;
  due_date?: string;
  allow_late_submission?: boolean;
  time_limit_minutes?: number;
  target_min_band?: number;
  target_max_band?: number;
  require_teacher_approval?: boolean;
  auto_release_results?: boolean;
  allow_multiple_attempts?: boolean;
  max_attempts?: number;
}

/** Add item to bundle request - matches actual API */
export interface AddBundleItemRequestDTO {
  item_type: BundleItemType;
  // Content ID fields - only one should be set based on item_type
  mock_exam?: number;
  teacher_exam?: number;
  writing_task?: number;
  speaking_topic?: number;
  reading_passage?: number;
  listening_part?: number;
  // Alternative: generic content fields
  content_type?: string;
  content_id?: number;
  // Item configuration
  item_instructions?: string;
  order?: number;
  points?: number;
  is_required?: boolean;
}

// ============================================================================
// FEED DTOs
// ============================================================================

/** Feed classroom summary */
export interface FeedClassroomDTO {
  id: number;
  uuid: string;
  name: string;
  description?: string | null;
  status: ClassroomStatus;
  invite_code: string;
  invite_enabled: boolean;
  target_band?: number | null;
  student_count: number;
}

/** Feed stats DTO */
export interface FeedStatsDTO {
  total_students: number;
  total_assignments: number;
  pending_grading: number;
  average_completion_rate: number;
  published_assignments: number;
  draft_assignments: number;
  recent_submissions: number;
}

/** Top submission preview in feed assignment */
export interface TopSubmissionDTO {
  student_id: number;
  student_name: string;
  band_score?: number;
  submitted_at: string;
}

/** Feed item preview for assignment items */
export interface FeedAssignmentItemPreviewDTO {
  id: number;
  content_type: BundleItemType;
  content_title: string;
  points: number;
}

/** Feed assignment DTO */
export interface FeedAssignmentDTO {
  id: number;
  uuid: string;
  type: 'ASSIGNMENT';
  title: string;
  description?: string | null;
  assignment_type: AssignmentType;
  item_count: number;
  due_date?: string | null;
  available_from?: string | null;
  status: AssignmentBundleStatus;
  is_available: boolean;
  is_overdue: boolean;
  created_at: string;
  published_at?: string | null;
  created_by: AuthorSummaryDTO;
  // Progress stats
  assigned_count: number;
  completed_count: number;
  pending_review_count: number;
  submitted_count: number;
  completion_percentage: number;
  average_band?: number | null;
  // Submissions preview
  top_submissions: TopSubmissionDTO[];
  total_submissions: number;
  has_more_submissions: boolean;
  // Items preview
  items: FeedAssignmentItemPreviewDTO[];
}

/** Feed message DTO (messages posted in classroom feed) */
export interface FeedMessageDTO {
  id: number;
  uuid: string;
  type: 'MESSAGE';
  message_type: MessageType;
  content: string;
  is_pinned: boolean;
  author: AuthorSummaryDTO;
  created_at: string;
}

/** Union type for feed items (can be either assignment or message) */
export type FeedItemDTO = FeedAssignmentDTO | FeedMessageDTO;

/** Teacher feed response */
export interface TeacherFeedResponseDTO {
  classroom: FeedClassroomDTO;
  assignments: FeedItemDTO[];
  stats: FeedStatsDTO;
  total_count: number;
}

/** Classroom message DTO */
export interface ClassroomMessageDTO {
  id: number;
  uuid: string;
  classroom: number;
  author: TeacherSummaryDTO;
  message_type: MessageType;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

/** Post message request */
export interface PostMessageRequestDTO {
  content: string;
  message_type?: MessageType;
  is_pinned?: boolean;
}

/** Update message request */
export interface UpdateMessageRequestDTO {
  is_pinned?: boolean;
}

// ============================================================================
// STUDENT ASSIGNMENT DTOs
// ============================================================================

/** Student's assignment submission */
export interface StudentAssignmentDTO {
  uuid: string;
  bundle: {
    uuid: string;
    title: string;
    due_date?: string;
  };
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED';
  band_score?: number;
  max_score?: number;
  started_at?: string;
  submitted_at?: string;
  graded_at?: string;
  xp_earned?: number;
}

/** Student assignments list */
export interface StudentAssignmentsListResponseDTO {
  count: number;
  total_pages?: number;
  page?: number;
  page_size?: number;
  next?: string | null;
  previous?: string | null;
  results: StudentAssignmentDTO[];
}

// ============================================================================
// GRADING DTOs
// ============================================================================

/** Grading queue item */
export interface GradingQueueItemDTO {
  uuid: string;
  student: StudentSummaryDTO;
  bundle: {
    uuid: string;
    title: string;
  };
  assignment_type: AssignmentType;
  submitted_at: string;
  status: string;
  band_score?: number;
  ai_score?: number;
  item_count: number;
}

/** Grading queue response */
export interface GradingQueueResponseDTO {
  count: number;
  assignments: GradingQueueItemDTO[];
}

/** Submission detail for grading */
export interface SubmissionDetailDTO {
  uuid: string;
  student: StudentSummaryDTO;
  bundle: AssignmentBundleDetailDTO;
  status: string;
  band_score?: number;
  ai_score?: number;
  ai_feedback?: string;
  teacher_feedback?: string;
  started_at?: string;
  submitted_at?: string;
  graded_at?: string;
  time_spent_seconds?: number;
  item_submissions: ItemSubmissionDTO[];
}

/** Item submission within assignment */
export interface ItemSubmissionDTO {
  uuid: string;
  bundle_item: AssignmentItemDTO;
  status: string;
  score?: number;
  max_score: number;
  ai_score?: number;
  ai_feedback?: string;
  answers?: Record<string, unknown>;
  submitted_at?: string;
}

/** Submission review response with analysis */
export interface SubmissionReviewDTO {
  submission: SubmissionDetailDTO;
  analysis: {
    question_type_accuracy: Record<string, { correct: number; total: number; percentage: number }>;
    strengths: string[];
    weaknesses: string[];
    time_per_item: Record<string, number>;
  };
}

/** Grade submission request */
export interface GradeSubmissionRequestDTO {
  action: GradeAction;
  score?: number;
  feedback?: string;
}

/** Grading stats response */
export interface GradingStatsDTO {
  pending_count: number;
  graded_today: number;
  avg_grade_time_minutes: number;
  override_rate: number;
  total_graded: number;
}

// ============================================================================
// ANALYTICS DTOs
// ============================================================================

/** Classroom analytics response */
export interface ClassroomAnalyticsDTO {
  total_students: number;
  active_students: number;
  average_band: number | null;
  assignments_published: number;
  pending_reviews: number;
  completion_rate: number;
  section_averages: {
    listening: number;
    reading: number;
    writing: number;
    speaking: number;
  };
}

/** Student performance in analytics */
export interface StudentPerformanceDTO {
  student: StudentSummaryDTO;
  assignments_completed: number;
  average_score: number;
  last_activity: string;
  current_band?: number;
}

/** Assignment performance in analytics */
export interface AssignmentPerformanceDTO {
  uuid: string;
  title: string;
  completion_rate: number;
  average_score: number;
}

/** Detailed analytics response */
export interface DetailedAnalyticsDTO extends ClassroomAnalyticsDTO {
  students: StudentPerformanceDTO[];
  assignments: AssignmentPerformanceDTO[];
  top_performers: StudentPerformanceDTO[];
  struggling_students: StudentPerformanceDTO[];
}

// ============================================================================
// CONTENT SEARCH DTOs
// ============================================================================

/** Content search result - reading passage */
export interface ReadingPassageSearchResultDTO {
  id: number;
  passage_number: number;
  title: string;
  difficulty: string;
}

/** Content search result - listening part */
export interface ListeningPartSearchResultDTO {
  id: number;
  part_number: number;
  title: string;
  description?: string;
  difficulty?: string;
}

/** Content search result - writing task */
export interface WritingTaskSearchResultDTO {
  id: number;
  uuid?: string;
  title?: string;
  topic?: string;
  prompt?: string;
  task_type?: string;
  task_type_display?: string;
  difficulty?: string;
}

/** Content search result - speaking topic */
export interface SpeakingTopicSearchResultDTO {
  id: number;
  uuid?: string;
  title?: string;
  topic?: string;
  part?: number;
  speaking_type?: string;
  difficulty?: string;
}

/** Content search result - mock exam */
export interface MockExamSearchResultDTO {
  id: number;
  uuid: string;
  title: string;
  exam_type: string;
  exam_type_display: string;
  difficulty_level: string;
}

/** Content search result - teacher exam */
export interface TeacherExamSearchResultDTO {
  id: number;
  uuid: string;
  title: string;
  exam_type?: string;
  difficulty?: string;
}

/** Generic content search response - array format */
export type ContentSearchResponseDTO =
  | ReadingPassageSearchResultDTO[]
  | ListeningPartSearchResultDTO[]
  | WritingTaskSearchResultDTO[]
  | SpeakingTopicSearchResultDTO[]
  | MockExamSearchResultDTO[]
  | TeacherExamSearchResultDTO[];
