/**
 * Mappers for Classroom DTOs ↔ Domain models
 * Transforms snake_case backend DTOs to camelCase domain models
 * ALIGNED WITH ACTUAL API RESPONSES - January 2026
 */

import type {
  StudentSummaryDTO,
  TeacherSummaryDTO,
  AuthorSummaryDTO,
  ClassroomListItemDTO,
  ClassroomDetailDTO,
  ClassroomListResponseDTO,
  CreateClassroomRequestDTO,
  UpdateClassroomRequestDTO,
  EnrollmentDTO,
  EnrollmentListResponseDTO,
  JoinClassroomResponseDTO,
  CheckInviteCodeResponseDTO,
  MyClassroomsResponseDTO,
  StudentRosterItemDTO,
  StudentRosterResponseDTO,
  ContentObjectDTO,
  AssignmentItemDTO,
  AssignmentBundleListItemDTO,
  AssignmentBundleDetailDTO,
  AssignmentBundleListResponseDTO,
  CreateAssignmentBundleRequestDTO,
  UpdateAssignmentBundleRequestDTO,
  AddBundleItemRequestDTO,
  StudentAssignmentDTO,
  StudentAssignmentsListResponseDTO,
  FeedClassroomDTO,
  FeedStatsDTO,
  FeedAssignmentDTO,
  FeedMessageDTO,
  FeedItemDTO,
  TeacherFeedResponseDTO,
  ClassroomMessageDTO,
  PostMessageRequestDTO,
  UpdateMessageRequestDTO,
  GradingQueueItemDTO,
  GradingQueueResponseDTO,
  SubmissionDetailDTO,
  ItemSubmissionDTO,
  SubmissionReviewDTO,
  GradeSubmissionRequestDTO,
  GradingStatsDTO,
  ClassroomAnalyticsDTO,
  DetailedAnalyticsDTO,
  StudentPerformanceDTO,
  AssignmentPerformanceDTO,
  ReadingPassageSearchResultDTO,
  ListeningPartSearchResultDTO,
  WritingTaskSearchResultDTO,
  SpeakingTopicSearchResultDTO,
  MockExamSearchResultDTO,
  TeacherExamSearchResultDTO,
  BundleItemType,
} from './classroom.contract';

import type {
  StudentSummary,
  TeacherSummary,
  AuthorSummary,
  Classroom,
  ClassroomDetail,
  ClassroomList,
  CreateClassroomData,
  UpdateClassroomData,
  Enrollment,
  EnrollmentList,
  JoinClassroomResult,
  InviteCodeValidation,
  StudentRosterItem,
  StudentRoster,
  MyEnrolledClassroom,
  ContentObject,
  AssignmentItem,
  AssignmentBundle,
  AssignmentBundleDetail,
  AssignmentBundleList,
  CreateAssignmentBundleData,
  UpdateAssignmentBundleData,
  AddBundleItemData,
  StudentAssignment,
  StudentAssignmentList,
  FeedClassroom,
  FeedStats,
  TopSubmission,
  FeedAssignmentItemPreview,
  FeedAssignment,
  FeedMessage,
  FeedItem,
  ClassroomMessage,
  TeacherFeed,
  PostMessageData,
  UpdateMessageData,
  GradingQueueItem,
  GradingQueue,
  ItemSubmission,
  SubmissionDetail,
  SubmissionReview,
  GradeSubmissionData,
  GradingStats,
  ClassroomAnalytics,
  DetailedAnalytics,
  StudentPerformance,
  AssignmentPerformance,
  ContentSearchResult,
} from '../models/domain';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function parseDate(dateString: string): Date {
  return new Date(dateString);
}

function formatDateToISO(date: Date): string {
  return date.toISOString();
}

// ============================================================================
// USER MAPPERS
// ============================================================================

export function mapStudentSummaryDTOToDomain(dto: StudentSummaryDTO): StudentSummary {
  const firstName = dto.first_name || '';
  const lastName = dto.last_name || '';
  const fullName = dto.full_name || dto.name || `${firstName} ${lastName}`.trim();
  
  return {
    id: dto.id,
    uuid: dto.uuid || '',
    username: dto.username,
    firstName,
    lastName,
    fullName,
    email: dto.email || '',
    avatarUrl: dto.avatar_url || dto.profile_image || undefined,
  };
}

export function mapTeacherSummaryDTOToDomain(dto: TeacherSummaryDTO): TeacherSummary {
  const fullName = dto.full_name || dto.name || '';
  
  return {
    id: dto.id,
    username: dto.username,
    fullName,
    email: dto.email,
    avatarUrl: dto.profile_image || undefined,
  };
}

export function mapAuthorSummaryDTOToDomain(dto: AuthorSummaryDTO): AuthorSummary {
  return {
    id: dto.id,
    name: dto.name,
  };
}

// ============================================================================
// CLASSROOM MAPPERS
// ============================================================================

export function mapClassroomListItemDTOToDomain(dto: ClassroomListItemDTO): Classroom {
  return {
    id: dto.id,
    uuid: dto.uuid,
    name: dto.name,
    description: dto.description || undefined,
    inviteCode: dto.invite_code,
    inviteEnabled: dto.invite_enabled,
    status: dto.status,
    teacherName: dto.teacher_name,
    studentCount: dto.student_count,
    assignmentCount: dto.assignment_count,
    pendingGrading: dto.pending_grading,
    targetBand: dto.target_band || undefined,
    createdAt: parseDate(dto.created_at),
  };
}

export function mapClassroomDetailDTOToDomain(dto: ClassroomDetailDTO): ClassroomDetail {
  return {
    id: dto.id,
    uuid: dto.uuid,
    name: dto.name,
    description: dto.description || undefined,
    inviteCode: dto.invite_code,
    inviteEnabled: dto.invite_enabled,
    status: dto.status,
    teacher: mapTeacherSummaryDTOToDomain(dto.teacher),
    studentCount: dto.student_count,
    maxStudents: dto.max_students,
    isFull: dto.is_full,
    magicLink: dto.magic_link,
    assignmentCount: dto.assignment_count,
    activeAssignments: dto.active_assignments,
    targetBand: dto.target_band || undefined,
    enrollments: dto.enrollments?.map(mapEnrollmentDTOToDomain) || [],
    createdAt: parseDate(dto.created_at),
    updatedAt: parseDate(dto.updated_at),
  };
}

export function mapClassroomListResponseDTOToDomain(dto: ClassroomListResponseDTO): ClassroomList {
  return {
    count: dto.count,
    totalPages: dto.total_pages,
    page: dto.page,
    pageSize: dto.page_size,
    hasNext: !!dto.next,
    hasPrevious: !!dto.previous,
    classrooms: dto.results.map(mapClassroomListItemDTOToDomain),
  };
}

export function mapCreateClassroomDataToDTO(data: CreateClassroomData): CreateClassroomRequestDTO {
  return {
    name: data.name,
    description: data.description,
    max_students: data.maxStudents,
    target_band: data.targetBand,
    invite_enabled: data.inviteEnabled,
  };
}

export function mapUpdateClassroomDataToDTO(data: UpdateClassroomData): UpdateClassroomRequestDTO {
  return {
    name: data.name,
    description: data.description,
    status: data.status,
    max_students: data.maxStudents,
    target_band: data.targetBand,
    invite_enabled: data.inviteEnabled,
  };
}

// ============================================================================
// ENROLLMENT MAPPERS
// ============================================================================

export function mapEnrollmentDTOToDomain(dto: EnrollmentDTO): Enrollment {
  return {
    uuid: dto.uuid,
    student: mapStudentSummaryDTOToDomain(dto.student),
    classroom: {
      uuid: dto.classroom.uuid,
      name: dto.classroom.name,
    },
    status: dto.status,
    teacherNotes: dto.teacher_notes,
    enrolledAt: parseDate(dto.enrolled_at),
    lastActivityAt: dto.last_activity_at ? parseDate(dto.last_activity_at) : undefined,
    xp: dto.xp,
    currentBand: dto.current_band,
  };
}

export function mapEnrollmentListResponseDTOToDomain(dto: EnrollmentListResponseDTO): EnrollmentList {
  return {
    count: dto.count,
    hasNext: !!dto.next,
    hasPrevious: !!dto.previous,
    enrollments: dto.results.map(mapEnrollmentDTOToDomain),
  };
}

export function mapStudentRosterItemDTOToDomain(dto: StudentRosterItemDTO): StudentRosterItem {
  return {
    uuid: dto.uuid,
    student: mapStudentSummaryDTOToDomain(dto.student),
    status: dto.status,
    enrolledAt: parseDate(dto.enrolled_at),
    lastActivityAt: dto.last_activity_at ? parseDate(dto.last_activity_at) : undefined,
    xp: dto.xp,
    currentBand: dto.current_band,
    assignmentsCompleted: dto.assignments_completed,
    teacherNotes: dto.teacher_notes,
  };
}

export function mapStudentRosterResponseDTOToDomain(dto: StudentRosterResponseDTO): StudentRoster {
  return {
    count: dto.count,
    totalPages: dto.total_pages,
    page: dto.page,
    pageSize: dto.page_size,
    hasNext: !!dto.next,
    hasPrevious: !!dto.previous,
    students: dto.results.map(mapStudentRosterItemDTOToDomain),
  };
}

/** Map student roster from array (simplified API response) */
export function mapStudentRosterArrayToDomain(enrollments: EnrollmentDTO[]): StudentRoster {
  return {
    count: enrollments.length,
    hasNext: false,
    hasPrevious: false,
    students: enrollments.map((e) => ({
      uuid: e.uuid,
      student: mapStudentSummaryDTOToDomain(e.student),
      status: e.status,
      enrolledAt: parseDate(e.enrolled_at),
      lastActivityAt: e.last_activity_at ? parseDate(e.last_activity_at) : undefined,
      xp: e.xp,
      currentBand: e.current_band,
      teacherNotes: e.teacher_notes,
    })),
  };
}

export function mapJoinClassroomResponseDTOToDomain(dto: JoinClassroomResponseDTO): JoinClassroomResult {
  return {
    enrollment: mapEnrollmentDTOToDomain(dto.enrollment),
    classroom: mapClassroomDetailDTOToDomain(dto.classroom),
  };
}

export function mapCheckInviteCodeResponseDTOToDomain(dto: CheckInviteCodeResponseDTO): InviteCodeValidation {
  return {
    isValid: dto.valid,
    classroom: dto.classroom
      ? {
          uuid: dto.classroom.uuid,
          name: dto.classroom.name,
          teacherName: dto.classroom.teacher_name,
          studentCount: dto.classroom.student_count,
        }
      : undefined,
  };
}

export function mapMyClassroomsResponseDTOToDomain(dto: MyClassroomsResponseDTO): MyEnrolledClassroom[] {
  return dto.classrooms.map((item) => ({
    enrollment: mapEnrollmentDTOToDomain(item.enrollment),
    classroom: mapClassroomListItemDTOToDomain(item.classroom),
  }));
}

// ============================================================================
// CONTENT OBJECT MAPPERS
// ============================================================================

export function mapContentObjectDTOToDomain(dto: ContentObjectDTO): ContentObject {
  return {
    id: dto.id,
    uuid: dto.uuid,
    title: dto.title,
    examType: dto.exam_type,
    examTypeDisplay: dto.exam_type_display,
    difficultyLevel: dto.difficulty_level,
    difficulty: dto.difficulty,
    passageNumber: dto.passage_number,
  };
}

// ============================================================================
// ASSIGNMENT MAPPERS
// ============================================================================

export function mapAssignmentItemDTOToDomain(dto: AssignmentItemDTO): AssignmentItem {
  return {
    id: dto.id,
    uuid: dto.uuid,
    itemType: dto.item_type,
    contentType: dto.content_type,
    contentId: dto.content_id,
    contentTitle: dto.content_title,
    contentObject: dto.content_object ? mapContentObjectDTOToDomain(dto.content_object) : undefined,
    itemInstructions: dto.item_instructions || undefined,
    order: dto.order,
    points: dto.points,
    isRequired: dto.is_required,
    createdAt: parseDate(dto.created_at),
  };
}

export function mapAssignmentBundleListItemDTOToDomain(dto: AssignmentBundleListItemDTO): AssignmentBundle {
  return {
    id: dto.id,
    uuid: dto.uuid,
    title: dto.title,
    classroomName: dto.classroom_name,
    assignmentType: dto.assignment_type,
    status: dto.status,
    dueDate: dto.due_date ? parseDate(dto.due_date) : undefined,
    totalItems: dto.total_items,
    isAvailable: dto.is_available,
    isOverdue: dto.is_overdue,
    createdAt: parseDate(dto.created_at),
  };
}

export function mapAssignmentBundleDetailDTOToDomain(dto: AssignmentBundleDetailDTO): AssignmentBundleDetail {
  return {
    id: dto.id,
    uuid: dto.uuid,
    classroom: mapClassroomListItemDTOToDomain(dto.classroom),
    createdBy: mapTeacherSummaryDTOToDomain(dto.created_by),
    title: dto.title,
    description: dto.description || undefined,
    assignmentType: dto.assignment_type,
    teacherInstructions: dto.teacher_instructions || undefined,
    availableFrom: dto.available_from ? parseDate(dto.available_from) : undefined,
    dueDate: dto.due_date ? parseDate(dto.due_date) : undefined,
    allowLateSubmission: dto.allow_late_submission,
    timeLimitMinutes: dto.time_limit_minutes || undefined,
    targetMinBand: dto.target_min_band || undefined,
    targetMaxBand: dto.target_max_band || undefined,
    status: dto.status,
    requireTeacherApproval: dto.require_teacher_approval,
    autoReleaseResults: dto.auto_release_results,
    allowMultipleAttempts: dto.allow_multiple_attempts,
    maxAttempts: dto.max_attempts,
    items: dto.items.map(mapAssignmentItemDTOToDomain),
    totalItems: dto.total_items,
    isAvailable: dto.is_available,
    isOverdue: dto.is_overdue,
    submissionCount: dto.submission_count,
    pendingReviewCount: dto.pending_review_count,
    createdAt: parseDate(dto.created_at),
    updatedAt: parseDate(dto.updated_at),
    publishedAt: dto.published_at ? parseDate(dto.published_at) : undefined,
  };
}

export function mapAssignmentBundleListResponseDTOToDomain(dto: AssignmentBundleListResponseDTO): AssignmentBundleList {
  return {
    count: dto.count,
    totalPages: dto.total_pages,
    page: dto.page,
    pageSize: dto.page_size,
    hasNext: !!dto.next,
    hasPrevious: !!dto.previous,
    bundles: dto.results.map(mapAssignmentBundleListItemDTOToDomain),
  };
}

export function mapCreateAssignmentBundleDataToDTO(data: CreateAssignmentBundleData): CreateAssignmentBundleRequestDTO {
  return {
    classroom_uuid: data.classroomUuid,
    title: data.title,
    description: data.description,
    assignment_type: data.assignmentType,
    teacher_instructions: data.teacherInstructions,
    available_from: data.availableFrom ? formatDateToISO(data.availableFrom) : undefined,
    due_date: data.dueDate ? formatDateToISO(data.dueDate) : undefined,
    allow_late_submission: data.allowLateSubmission,
    time_limit_minutes: data.timeLimitMinutes,
    target_min_band: data.targetMinBand,
    target_max_band: data.targetMaxBand,
    require_teacher_approval: data.requireTeacherApproval,
    auto_release_results: data.autoReleaseResults,
    allow_multiple_attempts: data.allowMultipleAttempts,
    max_attempts: data.maxAttempts,
  };
}

export function mapUpdateAssignmentBundleDataToDTO(data: UpdateAssignmentBundleData): UpdateAssignmentBundleRequestDTO {
  return {
    title: data.title,
    description: data.description,
    assignment_type: data.assignmentType,
    teacher_instructions: data.teacherInstructions,
    available_from: data.availableFrom ? formatDateToISO(data.availableFrom) : undefined,
    due_date: data.dueDate ? formatDateToISO(data.dueDate) : undefined,
    allow_late_submission: data.allowLateSubmission,
    time_limit_minutes: data.timeLimitMinutes,
    target_min_band: data.targetMinBand,
    target_max_band: data.targetMaxBand,
    require_teacher_approval: data.requireTeacherApproval,
    auto_release_results: data.autoReleaseResults,
    allow_multiple_attempts: data.allowMultipleAttempts,
    max_attempts: data.maxAttempts,
  };
}

/** Map AddBundleItemData to DTO - handles item_type specific content ID fields */
export function mapAddBundleItemDataToDTO(data: AddBundleItemData): AddBundleItemRequestDTO {
  const dto: AddBundleItemRequestDTO = {
    item_type: data.itemType,
    item_instructions: data.itemInstructions,
    order: data.order,
    points: data.points,
    is_required: data.isRequired,
  };

  // Set the appropriate content ID field based on item_type
  switch (data.itemType) {
    case 'MOCK_EXAM':
      dto.mock_exam = data.contentId;
      break;
    case 'TEACHER_EXAM':
      dto.teacher_exam = data.contentId;
      break;
    case 'WRITING_TASK':
      dto.writing_task = data.contentId;
      break;
    case 'SPEAKING_TOPIC':
      dto.speaking_topic = data.contentId;
      break;
    case 'READING_PASSAGE':
      dto.reading_passage = data.contentId;
      break;
    case 'LISTENING_PART':
      dto.listening_part = data.contentId;
      break;
  }

  return dto;
}

// ============================================================================
// STUDENT ASSIGNMENT MAPPERS
// ============================================================================

export function mapStudentAssignmentDTOToDomain(dto: StudentAssignmentDTO): StudentAssignment {
  return {
    uuid: dto.uuid,
    bundle: {
      uuid: dto.bundle.uuid,
      title: dto.bundle.title,
      dueDate: dto.bundle.due_date ? parseDate(dto.bundle.due_date) : undefined,
    },
    status: dto.status,
    bandScore: dto.band_score,
    maxScore: dto.max_score,
    startedAt: dto.started_at ? parseDate(dto.started_at) : undefined,
    submittedAt: dto.submitted_at ? parseDate(dto.submitted_at) : undefined,
    gradedAt: dto.graded_at ? parseDate(dto.graded_at) : undefined,
    xpEarned: dto.xp_earned,
  };
}

export function mapStudentAssignmentsListResponseDTOToDomain(dto: StudentAssignmentsListResponseDTO): StudentAssignmentList {
  return {
    count: dto.count,
    totalPages: dto.total_pages,
    page: dto.page,
    pageSize: dto.page_size,
    hasNext: !!dto.next,
    hasPrevious: !!dto.previous,
    assignments: dto.results.map(mapStudentAssignmentDTOToDomain),
  };
}

// ============================================================================
// FEED MAPPERS
// ============================================================================

export function mapFeedClassroomDTOToDomain(dto: FeedClassroomDTO): FeedClassroom {
  return {
    id: dto.id,
    uuid: dto.uuid,
    name: dto.name,
    description: dto.description || undefined,
    status: dto.status,
    inviteCode: dto.invite_code,
    inviteEnabled: dto.invite_enabled,
    targetBand: dto.target_band || undefined,
    studentCount: dto.student_count,
  };
}

export function mapFeedStatsDTOToDomain(dto: FeedStatsDTO): FeedStats {
  return {
    totalStudents: dto.total_students,
    totalAssignments: dto.total_assignments,
    pendingGrading: dto.pending_grading,
    averageCompletionRate: dto.average_completion_rate,
    publishedAssignments: dto.published_assignments,
    draftAssignments: dto.draft_assignments,
    recentSubmissions: dto.recent_submissions,
  };
}

export function mapFeedAssignmentDTOToDomain(dto: FeedAssignmentDTO): FeedAssignment {
  return {
    id: dto.id,
    uuid: dto.uuid,
    type: 'ASSIGNMENT',
    title: dto.title,
    description: dto.description || undefined,
    assignmentType: dto.assignment_type,
    itemCount: dto.item_count,
    dueDate: dto.due_date ? parseDate(dto.due_date) : undefined,
    availableFrom: dto.available_from ? parseDate(dto.available_from) : undefined,
    status: dto.status,
    isAvailable: dto.is_available,
    isOverdue: dto.is_overdue,
    createdAt: parseDate(dto.created_at),
    publishedAt: dto.published_at ? parseDate(dto.published_at) : undefined,
    createdBy: mapAuthorSummaryDTOToDomain(dto.created_by),
    assignedCount: dto.assigned_count,
    completedCount: dto.completed_count,
    pendingReviewCount: dto.pending_review_count,
    submittedCount: dto.submitted_count,
    completionPercentage: dto.completion_percentage,
    averageBand: dto.average_band || undefined,
    topSubmissions: dto.top_submissions.map((s) => ({
      studentId: s.student_id,
      studentName: s.student_name,
      bandScore: s.band_score,
      submittedAt: parseDate(s.submitted_at),
    })),
    totalSubmissions: dto.total_submissions,
    hasMoreSubmissions: dto.has_more_submissions,
    items: dto.items.map((item) => ({
      id: item.id,
      contentType: item.content_type,
      contentTitle: item.content_title,
      points: item.points,
    })),
  };
}

export function mapFeedMessageDTOToDomain(dto: FeedMessageDTO): FeedMessage {
  return {
    id: dto.id,
    uuid: dto.uuid,
    type: 'MESSAGE',
    messageType: dto.message_type,
    content: dto.content,
    isPinned: dto.is_pinned,
    author: mapAuthorSummaryDTOToDomain(dto.author),
    createdAt: parseDate(dto.created_at),
  };
}

export function mapFeedItemDTOToDomain(dto: FeedItemDTO): FeedItem {
  if (dto.type === 'MESSAGE') {
    return mapFeedMessageDTOToDomain(dto);
  }
  return mapFeedAssignmentDTOToDomain(dto);
}

export function mapClassroomMessageDTOToDomain(dto: ClassroomMessageDTO): ClassroomMessage {
  return {
    id: dto.id,
    uuid: dto.uuid,
    classroomId: dto.classroom,
    author: mapTeacherSummaryDTOToDomain(dto.author),
    messageType: dto.message_type,
    content: dto.content,
    isPinned: dto.is_pinned,
    createdAt: parseDate(dto.created_at),
    updatedAt: parseDate(dto.updated_at),
  };
}

export function mapTeacherFeedResponseDTOToDomain(dto: TeacherFeedResponseDTO): TeacherFeed {
  return {
    classroom: mapFeedClassroomDTOToDomain(dto.classroom),
    items: dto.assignments.map(mapFeedItemDTOToDomain),
    stats: mapFeedStatsDTOToDomain(dto.stats),
    totalCount: dto.total_count,
  };
}

export function mapPostMessageDataToDTO(data: PostMessageData): PostMessageRequestDTO {
  return {
    content: data.content,
    message_type: data.messageType,
    is_pinned: data.isPinned,
  };
}

export function mapUpdateMessageDataToDTO(data: UpdateMessageData): UpdateMessageRequestDTO {
  return {
    is_pinned: data.isPinned,
  };
}

// ============================================================================
// GRADING MAPPERS
// ============================================================================

export function mapGradingQueueItemDTOToDomain(dto: GradingQueueItemDTO): GradingQueueItem {
  return {
    uuid: dto.uuid,
    student: mapStudentSummaryDTOToDomain(dto.student),
    bundle: {
      uuid: dto.bundle.uuid,
      title: dto.bundle.title,
    },
    assignmentType: dto.assignment_type,
    submittedAt: parseDate(dto.submitted_at),
    status: dto.status,
    bandScore: dto.band_score,
    aiScore: dto.ai_score,
    itemCount: dto.item_count,
  };
}

export function mapGradingQueueResponseDTOToDomain(dto: GradingQueueResponseDTO): GradingQueue {
  return {
    count: dto.count,
    items: dto.assignments.map(mapGradingQueueItemDTOToDomain),
  };
}

export function mapItemSubmissionDTOToDomain(dto: ItemSubmissionDTO): ItemSubmission {
  return {
    uuid: dto.uuid,
    bundleItem: mapAssignmentItemDTOToDomain(dto.bundle_item),
    status: dto.status,
    score: dto.score,
    maxScore: dto.max_score,
    aiScore: dto.ai_score,
    aiFeedback: dto.ai_feedback,
    answers: dto.answers,
    submittedAt: dto.submitted_at ? parseDate(dto.submitted_at) : undefined,
  };
}

export function mapSubmissionDetailDTOToDomain(dto: SubmissionDetailDTO): SubmissionDetail {
  return {
    uuid: dto.uuid,
    student: mapStudentSummaryDTOToDomain(dto.student),
    bundle: mapAssignmentBundleDetailDTOToDomain(dto.bundle),
    status: dto.status,
    bandScore: dto.band_score,
    aiScore: dto.ai_score,
    aiFeedback: dto.ai_feedback,
    teacherFeedback: dto.teacher_feedback,
    startedAt: dto.started_at ? parseDate(dto.started_at) : undefined,
    submittedAt: dto.submitted_at ? parseDate(dto.submitted_at) : undefined,
    gradedAt: dto.graded_at ? parseDate(dto.graded_at) : undefined,
    timeSpentSeconds: dto.time_spent_seconds,
    itemSubmissions: dto.item_submissions.map(mapItemSubmissionDTOToDomain),
  };
}

export function mapSubmissionReviewDTOToDomain(dto: SubmissionReviewDTO): SubmissionReview {
  return {
    submission: mapSubmissionDetailDTOToDomain(dto.submission),
    analysis: {
      questionTypeAccuracy: Object.fromEntries(
        Object.entries(dto.analysis.question_type_accuracy).map(([key, value]) => [
          key,
          { correct: value.correct, total: value.total, percentage: value.percentage },
        ])
      ),
      strengths: dto.analysis.strengths,
      weaknesses: dto.analysis.weaknesses,
      timePerItem: dto.analysis.time_per_item,
    },
  };
}

export function mapGradeSubmissionDataToDTO(data: GradeSubmissionData): GradeSubmissionRequestDTO {
  return {
    action: data.action,
    score: data.score,
    feedback: data.feedback,
  };
}

export function mapGradingStatsDTOToDomain(dto: GradingStatsDTO): GradingStats {
  return {
    pendingCount: dto.pending_count,
    gradedToday: dto.graded_today,
    avgGradeTimeMinutes: dto.avg_grade_time_minutes,
    overrideRate: dto.override_rate,
    totalGraded: dto.total_graded,
  };
}

// ============================================================================
// ANALYTICS MAPPERS
// ============================================================================

export function mapStudentPerformanceDTOToDomain(dto: StudentPerformanceDTO): StudentPerformance {
  return {
    student: mapStudentSummaryDTOToDomain(dto.student),
    assignmentsCompleted: dto.assignments_completed,
    averageScore: dto.average_score,
    lastActivity: parseDate(dto.last_activity),
    currentBand: dto.current_band,
  };
}

export function mapAssignmentPerformanceDTOToDomain(dto: AssignmentPerformanceDTO): AssignmentPerformance {
  return {
    uuid: dto.uuid,
    title: dto.title,
    completionRate: dto.completion_rate,
    averageScore: dto.average_score,
  };
}

export function mapClassroomAnalyticsDTOToDomain(dto: ClassroomAnalyticsDTO): ClassroomAnalytics {
  return {
    totalStudents: dto.total_students,
    activeStudents: dto.active_students,
    averageBand: dto.average_band,
    assignmentsPublished: dto.assignments_published,
    pendingReviews: dto.pending_reviews,
    completionRate: dto.completion_rate,
    sectionAverages: {
      listening: dto.section_averages.listening,
      reading: dto.section_averages.reading,
      writing: dto.section_averages.writing,
      speaking: dto.section_averages.speaking,
    },
  };
}

export function mapDetailedAnalyticsDTOToDomain(dto: DetailedAnalyticsDTO): DetailedAnalytics {
  return {
    ...mapClassroomAnalyticsDTOToDomain(dto),
    students: dto.students.map(mapStudentPerformanceDTOToDomain),
    assignments: dto.assignments.map(mapAssignmentPerformanceDTOToDomain),
    topPerformers: dto.top_performers?.map(mapStudentPerformanceDTOToDomain) || [],
    strugglingStudents: dto.struggling_students?.map(mapStudentPerformanceDTOToDomain) || [],
  };
}

// ============================================================================
// CONTENT SEARCH MAPPERS
// ============================================================================

export function mapReadingPassageSearchResultToDomain(dto: ReadingPassageSearchResultDTO): ContentSearchResult {
  return {
    id: dto.id,
    title: dto.title,
    contentType: 'READING_PASSAGE',
    difficulty: dto.difficulty,
    passageNumber: dto.passage_number,
  };
}

export function mapListeningPartSearchResultToDomain(dto: ListeningPartSearchResultDTO): ContentSearchResult {
  return {
    id: dto.id,
    title: dto.title,
    contentType: 'LISTENING_PART',
    difficulty: dto.difficulty,
    partNumber: dto.part_number,
  };
}

export function mapWritingTaskSearchResultToDomain(dto: WritingTaskSearchResultDTO): ContentSearchResult {
  // Title priority: title > topic > prompt (truncated)
  const title = dto.title || dto.topic || (dto.prompt ? dto.prompt.substring(0, 100) + (dto.prompt.length > 100 ? '...' : '') : 'Writing Task');
  return {
    id: dto.id,
    uuid: dto.uuid,
    title,
    contentType: 'WRITING_TASK',
    difficulty: dto.difficulty,
    examType: dto.task_type,
    examTypeDisplay: dto.task_type_display,
  };
}

export function mapSpeakingTopicSearchResultToDomain(dto: SpeakingTopicSearchResultDTO): ContentSearchResult {
  // Parse part number from speaking_type (e.g., 'PART_1' -> 1)
  const partNumber = dto.part || (dto.speaking_type ? parseInt(dto.speaking_type.replace('PART_', ''), 10) : undefined);
  return {
    id: dto.id,
    uuid: dto.uuid,
    title: dto.title || dto.topic || 'Speaking Topic',
    contentType: 'SPEAKING_TOPIC',
    difficulty: dto.difficulty,
    partNumber: isNaN(partNumber as number) ? undefined : partNumber,
  };
}

export function mapMockExamSearchResultToDomain(dto: MockExamSearchResultDTO): ContentSearchResult {
  return {
    id: dto.id,
    uuid: dto.uuid,
    title: dto.title,
    contentType: 'MOCK_EXAM',
    difficulty: dto.difficulty_level,
    examType: dto.exam_type,
    examTypeDisplay: dto.exam_type_display,
  };
}

export function mapTeacherExamSearchResultToDomain(dto: TeacherExamSearchResultDTO): ContentSearchResult {
  return {
    id: dto.id,
    uuid: dto.uuid,
    title: dto.title,
    contentType: 'TEACHER_EXAM',
    difficulty: dto.difficulty,
    examType: dto.exam_type,
  };
}
