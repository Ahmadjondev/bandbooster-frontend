/**
 * API client for Classroom endpoints
 * Integrates with BandBooster backend
 * UPDATED: Aligned with actual API responses - January 2026
 */

import type {
  ClassroomListResponseDTO,
  ClassroomDetailDTO,
  RegenerateInviteResponseDTO,
  EnrollmentDTO,
  EnrollmentListResponseDTO,
  JoinClassroomResponseDTO,
  CheckInviteCodeResponseDTO,
  MyClassroomsResponseDTO,
  AssignmentBundleListResponseDTO,
  AssignmentBundleDetailDTO,
  AssignmentItemDTO,
  StudentAssignmentsListResponseDTO,
  TeacherFeedResponseDTO,
  ClassroomMessageDTO,
  GradingQueueResponseDTO,
  SubmissionReviewDTO,
  GradingStatsDTO,
  ClassroomAnalyticsDTO,
  DetailedAnalyticsDTO,
  ReadingPassageSearchResultDTO,
  ListeningPartSearchResultDTO,
  WritingTaskSearchResultDTO,
  SpeakingTopicSearchResultDTO,
  MockExamSearchResultDTO,
  TeacherExamSearchResultDTO,
} from './classroom.contract';

import {
  mapClassroomListResponseDTOToDomain,
  mapClassroomDetailDTOToDomain,
  mapCreateClassroomDataToDTO,
  mapUpdateClassroomDataToDTO,
  mapEnrollmentDTOToDomain,
  mapEnrollmentListResponseDTOToDomain,
  mapJoinClassroomResponseDTOToDomain,
  mapCheckInviteCodeResponseDTOToDomain,
  mapStudentRosterArrayToDomain,
  mapMyClassroomsResponseDTOToDomain,
  mapAssignmentBundleListResponseDTOToDomain,
  mapAssignmentBundleDetailDTOToDomain,
  mapCreateAssignmentBundleDataToDTO,
  mapUpdateAssignmentBundleDataToDTO,
  mapAddBundleItemDataToDTO,
  mapAssignmentItemDTOToDomain,
  mapStudentAssignmentsListResponseDTOToDomain,
  mapTeacherFeedResponseDTOToDomain,
  mapPostMessageDataToDTO,
  mapClassroomMessageDTOToDomain,
  mapGradingQueueResponseDTOToDomain,
  mapSubmissionReviewDTOToDomain,
  mapGradeSubmissionDataToDTO,
  mapGradingStatsDTOToDomain,
  mapClassroomAnalyticsDTOToDomain,
  mapDetailedAnalyticsDTOToDomain,
  mapReadingPassageSearchResultToDomain,
  mapListeningPartSearchResultToDomain,
  mapWritingTaskSearchResultToDomain,
  mapSpeakingTopicSearchResultToDomain,
  mapMockExamSearchResultToDomain,
  mapTeacherExamSearchResultToDomain,
} from './classroom.mapper';

import type {
  ClassroomDetail,
  ClassroomList,
  CreateClassroomData,
  UpdateClassroomData,
  Enrollment,
  EnrollmentList,
  JoinClassroomResult,
  InviteCodeValidation,
  StudentRoster,
  MyEnrolledClassroom,
  AssignmentBundleDetail,
  AssignmentBundleList,
  CreateAssignmentBundleData,
  UpdateAssignmentBundleData,
  AddBundleItemData,
  AssignmentItem,
  StudentAssignmentList,
  TeacherFeed,
  ClassroomMessage,
  PostMessageData,
  GradingQueue,
  SubmissionReview,
  GradeSubmissionData,
  GradingStats,
  ClassroomAnalytics,
  DetailedAnalytics,
  ContentSearchResult,
  BundleItemType,
} from '../models/domain';

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// ============================================================================
// HELPERS
// ============================================================================

function getAccessToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
}

function getAuthHeaders(): HeadersInit {
  const token = getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: 'An unexpected error occurred',
    }));
    throw new Error(error.detail || error.error || error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

interface PaginationParams {
  page?: number;
  pageSize?: number;
}

function buildQueryString<T extends object>(params: T): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      searchParams.append(snakeKey, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// ============================================================================
// CLASSROOM MANAGEMENT API
// ============================================================================

async function listClassrooms(params?: PaginationParams): Promise<ClassroomList> {
  const query = buildQueryString(params || {});
  const response = await fetch(`${API_BASE_URL}/classroom/api/classrooms/${query}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await handleResponse<ClassroomListResponseDTO>(response);
  return mapClassroomListResponseDTOToDomain(data);
}

async function getClassroom(uuid: string): Promise<ClassroomDetail> {
  const response = await fetch(`${API_BASE_URL}/classroom/api/classrooms/${uuid}/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await handleResponse<ClassroomDetailDTO>(response);
  return mapClassroomDetailDTOToDomain(data);
}

async function createClassroom(data: CreateClassroomData): Promise<ClassroomDetail> {
  const response = await fetch(`${API_BASE_URL}/classroom/api/classrooms/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(mapCreateClassroomDataToDTO(data)),
  });
  const dto = await handleResponse<ClassroomDetailDTO>(response);
  return mapClassroomDetailDTOToDomain(dto);
}

async function updateClassroom(uuid: string, data: UpdateClassroomData): Promise<ClassroomDetail> {
  const response = await fetch(`${API_BASE_URL}/classroom/api/classrooms/${uuid}/`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(mapUpdateClassroomDataToDTO(data)),
  });
  const dto = await handleResponse<ClassroomDetailDTO>(response);
  return mapClassroomDetailDTOToDomain(dto);
}

async function partialUpdateClassroom(uuid: string, data: Partial<UpdateClassroomData>): Promise<ClassroomDetail> {
  const response = await fetch(`${API_BASE_URL}/classroom/api/classrooms/${uuid}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(mapUpdateClassroomDataToDTO(data as UpdateClassroomData)),
  });
  const dto = await handleResponse<ClassroomDetailDTO>(response);
  return mapClassroomDetailDTOToDomain(dto);
}

async function deleteClassroom(uuid: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/classroom/api/classrooms/${uuid}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to delete classroom' }));
    throw new Error(error.detail || 'Failed to delete classroom');
  }
}

async function regenerateInviteCode(uuid: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/classroom/api/classrooms/${uuid}/regenerate_invite/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  const data = await handleResponse<RegenerateInviteResponseDTO>(response);
  return data.invite_code;
}

async function getClassroomAnalytics(uuid: string): Promise<ClassroomAnalytics> {
  const response = await fetch(`${API_BASE_URL}/classroom/api/classrooms/${uuid}/analytics/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await handleResponse<ClassroomAnalyticsDTO>(response);
  return mapClassroomAnalyticsDTOToDomain(data);
}

async function getDetailedAnalytics(uuid: string): Promise<DetailedAnalytics> {
  const response = await fetch(`${API_BASE_URL}/classroom/api/classrooms/${uuid}/detailed_analytics/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await handleResponse<DetailedAnalyticsDTO>(response);
  return mapDetailedAnalyticsDTOToDomain(data);
}

// ============================================================================
// ENROLLMENT API (Teacher)
// ============================================================================

async function listEnrollments(params?: PaginationParams & { classroomUuid?: string }): Promise<EnrollmentList> {
  const query = buildQueryString(params || {});
  const response = await fetch(`${API_BASE_URL}/classroom/api/enrollments/${query}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await handleResponse<EnrollmentListResponseDTO>(response);
  return mapEnrollmentListResponseDTOToDomain(data);
}

async function getEnrollment(uuid: string): Promise<Enrollment> {
  const response = await fetch(`${API_BASE_URL}/classroom/api/enrollments/${uuid}/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await handleResponse<EnrollmentDTO>(response);
  return mapEnrollmentDTOToDomain(data);
}

/** Get classroom roster - API returns simple array */
async function getClassroomRoster(classroomUuid: string): Promise<StudentRoster> {
  const response = await fetch(`${API_BASE_URL}/classroom/api/classrooms/${classroomUuid}/roster/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await handleResponse<EnrollmentDTO[]>(response);
  return mapStudentRosterArrayToDomain(data);
}

async function removeStudent(classroomUuid: string, studentUuid: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/classroom/api/classrooms/${classroomUuid}/remove_student/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ student_uuid: studentUuid }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to remove student' }));
    throw new Error(error.detail || 'Failed to remove student');
  }
}

async function updateTeacherNotes(enrollmentUuid: string, notes: string): Promise<Enrollment> {
  const response = await fetch(`${API_BASE_URL}/classroom/api/enrollments/${enrollmentUuid}/update_notes/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ notes }),
  });
  const data = await handleResponse<EnrollmentDTO>(response);
  return mapEnrollmentDTOToDomain(data);
}

// ============================================================================
// ENROLLMENT API (Student)
// ============================================================================

async function joinClassroom(inviteCode: string): Promise<JoinClassroomResult> {
  const response = await fetch(`${API_BASE_URL}/classroom/api/enrollments/join/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ invite_code: inviteCode }),
  });
  const data = await handleResponse<JoinClassroomResponseDTO>(response);
  return mapJoinClassroomResponseDTOToDomain(data);
}

async function leaveClassroom(enrollmentUuid: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/classroom/api/enrollments/${enrollmentUuid}/leave/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to leave classroom' }));
    throw new Error(error.detail || 'Failed to leave classroom');
  }
}

async function checkInviteCode(inviteCode: string): Promise<InviteCodeValidation> {
  const response = await fetch(`${API_BASE_URL}/classroom/api/join/${inviteCode}/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await handleResponse<CheckInviteCodeResponseDTO>(response);
  return mapCheckInviteCodeResponseDTOToDomain(data);
}

async function getMyClassrooms(): Promise<MyEnrolledClassroom[]> {
  const response = await fetch(`${API_BASE_URL}/classroom/api/enrollments/my_classrooms/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await handleResponse<MyClassroomsResponseDTO>(response);
  return mapMyClassroomsResponseDTOToDomain(data);
}

// ============================================================================
// ASSIGNMENT BUNDLE API (Teacher)
// ============================================================================

async function listAssignmentBundles(params?: PaginationParams & { classroomUuid?: string }): Promise<AssignmentBundleList> {
  const query = buildQueryString(params || {});
  const response = await fetch(`${API_BASE_URL}/classroom/api/bundles/${query}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await handleResponse<AssignmentBundleListResponseDTO>(response);
  return mapAssignmentBundleListResponseDTOToDomain(data);
}

async function getAssignmentBundle(uuid: string): Promise<AssignmentBundleDetail> {
  const response = await fetch(`${API_BASE_URL}/classroom/api/bundles/${uuid}/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await handleResponse<AssignmentBundleDetailDTO>(response);
  return mapAssignmentBundleDetailDTOToDomain(data);
}

async function createAssignmentBundle(data: CreateAssignmentBundleData): Promise<AssignmentBundleDetail> {
  const response = await fetch(`${API_BASE_URL}/classroom/api/bundles/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(mapCreateAssignmentBundleDataToDTO(data)),
  });
  const dto = await handleResponse<AssignmentBundleDetailDTO>(response);
  return mapAssignmentBundleDetailDTOToDomain(dto);
}

async function updateAssignmentBundle(uuid: string, data: UpdateAssignmentBundleData): Promise<AssignmentBundleDetail> {
  const response = await fetch(`${API_BASE_URL}/classroom/api/bundles/${uuid}/`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(mapUpdateAssignmentBundleDataToDTO(data)),
  });
  const dto = await handleResponse<AssignmentBundleDetailDTO>(response);
  return mapAssignmentBundleDetailDTOToDomain(dto);
}

async function partialUpdateAssignmentBundle(uuid: string, data: Partial<UpdateAssignmentBundleData>): Promise<AssignmentBundleDetail> {
  const response = await fetch(`${API_BASE_URL}/classroom/api/bundles/${uuid}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(mapUpdateAssignmentBundleDataToDTO(data as UpdateAssignmentBundleData)),
  });
  const dto = await handleResponse<AssignmentBundleDetailDTO>(response);
  return mapAssignmentBundleDetailDTOToDomain(dto);
}

async function deleteAssignmentBundle(uuid: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/classroom/api/bundles/${uuid}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to delete bundle' }));
    throw new Error(error.detail || 'Failed to delete bundle');
  }
}

async function addItemToBundle(bundleUuid: string, data: AddBundleItemData): Promise<AssignmentItem> {
  const response = await fetch(`${API_BASE_URL}/classroom/api/bundles/${bundleUuid}/add_item/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(mapAddBundleItemDataToDTO(data)),
  });
  const dto = await handleResponse<AssignmentItemDTO>(response);
  return mapAssignmentItemDTOToDomain(dto);
}

async function removeItemFromBundle(bundleUuid: string, itemId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/classroom/api/bundles/${bundleUuid}/remove_item/${itemId}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to remove item' }));
    throw new Error(error.detail || 'Failed to remove item');
  }
}

async function publishBundle(uuid: string): Promise<AssignmentBundleDetail> {
  const response = await fetch(`${API_BASE_URL}/classroom/api/bundles/${uuid}/publish/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  const dto = await handleResponse<AssignmentBundleDetailDTO>(response);
  return mapAssignmentBundleDetailDTOToDomain(dto);
}

async function closeBundle(uuid: string): Promise<AssignmentBundleDetail> {
  const response = await fetch(`${API_BASE_URL}/classroom/api/bundles/${uuid}/close/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  const dto = await handleResponse<AssignmentBundleDetailDTO>(response);
  return mapAssignmentBundleDetailDTOToDomain(dto);
}

// ============================================================================
// STUDENT ASSIGNMENTS API
// ============================================================================

async function getStudentAssignments(params?: PaginationParams): Promise<StudentAssignmentList> {
  const query = buildQueryString(params || {});
  const response = await fetch(`${API_BASE_URL}/classroom/api/student/assignments/${query}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await handleResponse<StudentAssignmentsListResponseDTO>(response);
  return mapStudentAssignmentsListResponseDTOToDomain(data);
}

// ============================================================================
// TEACHER FEED API
// ============================================================================

/** Get teacher's classroom feed - contains assignments and stats */
async function getTeacherFeed(classroomUuid: string): Promise<TeacherFeed> {
  const response = await fetch(`${API_BASE_URL}/classroom/api/teacher/classroom/${classroomUuid}/feed/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await handleResponse<TeacherFeedResponseDTO>(response);
  return mapTeacherFeedResponseDTOToDomain(data);
}

/** Post message to classroom feed */
async function postMessage(classroomUuid: string, data: PostMessageData): Promise<ClassroomMessage> {
  const response = await fetch(`${API_BASE_URL}/classroom/api/teacher/classroom/${classroomUuid}/feed/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(mapPostMessageDataToDTO(data)),
  });
  const dto = await handleResponse<ClassroomMessageDTO>(response);
  return mapClassroomMessageDTOToDomain(dto);
}

/** Delete message from classroom */
async function deleteMessage(classroomUuid: string, messageUuid: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/classroom/api/teacher/classroom/${classroomUuid}/feed/${messageUuid}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to delete message' }));
    throw new Error(error.detail || 'Failed to delete message');
  }
}

// ============================================================================
// GRADING API
// ============================================================================

async function getGradingQueue(params?: PaginationParams): Promise<GradingQueue> {
  const query = buildQueryString(params || {});
  const response = await fetch(`${API_BASE_URL}/classroom/api/grading/queue/${query}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await handleResponse<GradingQueueResponseDTO>(response);
  return mapGradingQueueResponseDTOToDomain(data);
}

async function getSubmissionReview(submissionUuid: string): Promise<SubmissionReview> {
  const response = await fetch(`${API_BASE_URL}/classroom/api/grading/${submissionUuid}/review/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await handleResponse<SubmissionReviewDTO>(response);
  return mapSubmissionReviewDTOToDomain(data);
}

async function gradeSubmission(submissionUuid: string, data: GradeSubmissionData): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/classroom/api/grading/${submissionUuid}/grade/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(mapGradeSubmissionDataToDTO(data)),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to grade submission' }));
    throw new Error(error.detail || 'Failed to grade submission');
  }
}

async function getGradingStats(): Promise<GradingStats> {
  const response = await fetch(`${API_BASE_URL}/classroom/api/grading/stats/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await handleResponse<GradingStatsDTO>(response);
  return mapGradingStatsDTOToDomain(data);
}

// ============================================================================
// CONTENT SEARCH API
// ============================================================================

interface ContentSearchParams {
  query?: string;
  type?: BundleItemType;
  difficulty?: string;
}

/** Search for reading passages */
async function searchReadingPassages(query?: string, difficulty?: string): Promise<ContentSearchResult[]> {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (difficulty) params.append('difficulty', difficulty);
  const queryString = params.toString() ? `?${params.toString()}` : '';
  
  const response = await fetch(`${API_BASE_URL}/classroom/api/content/reading_passages/${queryString}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const dto = await handleResponse<ReadingPassageSearchResultDTO[]>(response);
  return dto.map(mapReadingPassageSearchResultToDomain);
}

/** Search for listening parts */
async function searchListeningParts(query?: string, difficulty?: string, part?: number): Promise<ContentSearchResult[]> {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (difficulty) params.append('difficulty', difficulty);
  if (part) params.append('part', part.toString());
  const queryString = params.toString() ? `?${params.toString()}` : '';
  
  const response = await fetch(`${API_BASE_URL}/classroom/api/content/listening_parts/${queryString}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const dto = await handleResponse<ListeningPartSearchResultDTO[]>(response);
  return dto.map(mapListeningPartSearchResultToDomain);
}

/** Search for writing tasks */
async function searchWritingTasks(query?: string, taskType?: string): Promise<ContentSearchResult[]> {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (taskType) params.append('type', taskType);
  const queryString = params.toString() ? `?${params.toString()}` : '';
  
  const response = await fetch(`${API_BASE_URL}/classroom/api/content/writing_tasks/${queryString}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const dto = await handleResponse<WritingTaskSearchResultDTO[]>(response);
  return dto.map(mapWritingTaskSearchResultToDomain);
}

/** Search for speaking topics */
async function searchSpeakingTopics(query?: string, part?: number): Promise<ContentSearchResult[]> {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (part) params.append('part', part.toString());
  const queryString = params.toString() ? `?${params.toString()}` : '';
  
  const response = await fetch(`${API_BASE_URL}/classroom/api/content/speaking_topics/${queryString}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const dto = await handleResponse<SpeakingTopicSearchResultDTO[]>(response);
  return dto.map(mapSpeakingTopicSearchResultToDomain);
}

/** Search for mock exams */
async function searchMockExams(query?: string, difficulty?: string, examType?: string): Promise<ContentSearchResult[]> {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (difficulty) params.append('difficulty', difficulty);
  if (examType) params.append('type', examType);
  const queryString = params.toString() ? `?${params.toString()}` : '';
  
  const response = await fetch(`${API_BASE_URL}/classroom/api/content/mock_exams/${queryString}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const dto = await handleResponse<MockExamSearchResultDTO[]>(response);
  return dto.map(mapMockExamSearchResultToDomain);
}

/** Search for teacher exams */
async function searchTeacherExams(query?: string): Promise<ContentSearchResult[]> {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  const queryString = params.toString() ? `?${params.toString()}` : '';
  
  const response = await fetch(`${API_BASE_URL}/classroom/api/content/teacher_exams/${queryString}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const dto = await handleResponse<TeacherExamSearchResultDTO[]>(response);
  return dto.map(mapTeacherExamSearchResultToDomain);
}

/** Unified content search based on content type */
async function searchContent(contentType: BundleItemType, query?: string, difficulty?: string): Promise<ContentSearchResult[]> {
  switch (contentType) {
    case 'READING_PASSAGE':
      return searchReadingPassages(query, difficulty);
    case 'LISTENING_PART':
      return searchListeningParts(query, difficulty);
    case 'WRITING_TASK':
      return searchWritingTasks(query);
    case 'SPEAKING_TOPIC':
      return searchSpeakingTopics(query);
    case 'MOCK_EXAM':
      return searchMockExams(query, difficulty);
    case 'TEACHER_EXAM':
      return searchTeacherExams(query);
    default:
      throw new Error(`Unknown content type: ${contentType}`);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const classroomApi = {
  // Classroom Management
  listClassrooms,
  getClassroom,
  createClassroom,
  updateClassroom,
  partialUpdateClassroom,
  deleteClassroom,
  regenerateInviteCode,
  getClassroomAnalytics,
  getDetailedAnalytics,

  // Enrollment (Teacher)
  listEnrollments,
  getEnrollment,
  getClassroomRoster,
  removeStudent,
  updateTeacherNotes,

  // Enrollment (Student)
  joinClassroom,
  leaveClassroom,
  checkInviteCode,
  getMyClassrooms,

  // Assignment Bundles
  listAssignmentBundles,
  getAssignmentBundle,
  createAssignmentBundle,
  updateAssignmentBundle,
  partialUpdateAssignmentBundle,
  deleteAssignmentBundle,
  addItemToBundle,
  removeItemFromBundle,
  publishBundle,
  closeBundle,

  // Student Assignments
  getStudentAssignments,

  // Teacher Feed
  getTeacherFeed,
  postMessage,
  deleteMessage,

  // Grading
  getGradingQueue,
  getSubmissionReview,
  gradeSubmission,
  getGradingStats,

  // Content Search
  searchContent,
  searchReadingPassages,
  searchListeningParts,
  searchWritingTasks,
  searchSpeakingTopics,
  searchMockExams,
  searchTeacherExams,
};
