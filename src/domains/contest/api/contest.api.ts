/**
 * Contest API Client
 * Handles all API requests for IELTS Mock Exam (Contest) functionality
 */

import type {
  ContestListItemDTO,
  ContestDetailDTO,
  ContestStatisticsDTO,
  LeaderboardResponseDTO,
  ContestAttemptListItemDTO,
  ContestAttemptDetailDTO,
  SectionDataDTO,
  SubmitContestResponseDTO,
  ContestResultDTO,
  AvailableReadingPassageDTO,
  AvailableListeningPartDTO,
  AvailableWritingTaskDTO,
  AvailableSpeakingTopicDTO,
  StartAttemptResponseDTO,
  NextSectionResponseDTO,
  ToggleResultsVisibleResponseDTO,
  SectionName,
} from './contest.contract';

import {
  mapContestListItemDTOToDomain,
  mapContestDetailDTOToDomain,
  mapContestStatisticsDTOToDomain,
  mapLeaderboardResponseDTOToDomain,
  mapContestAttemptListItemDTOToDomain,
  mapContestAttemptDetailDTOToDomain,
  mapSectionDataDTOToDomain,
  mapSubmitContestResponseDTOToDomain,
  mapContestResultDTOToDomain,
  mapAvailableReadingPassageDTOToDomain,
  mapAvailableListeningPartDTOToDomain,
  mapAvailableWritingTaskDTOToDomain,
  mapAvailableSpeakingTopicDTOToDomain,
  mapNextSectionResponseDTOToDomain,
  mapCreateContestRequestToDTO,
  mapUpdateContestRequestToDTO,
  mapSubmitAnswersRequestToDTO,
  mapSubmitWritingRequestToDTO,
} from './contest.mapper';

import type {
  ContestListItem,
  ContestDetail,
  ContestStatistics,
  Leaderboard,
  ContestAttemptListItem,
  ContestAttemptDetail,
  SectionData,
  SubmitContestResponse,
  ContestResult,
  AvailableReadingPassage,
  AvailableListeningPart,
  AvailableWritingTask,
  AvailableSpeakingTopic,
  CreateContestRequest,
  UpdateContestRequest,
  NextSectionResponse,
  WritingFeedback,
} from '../models/domain';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001';
const CONTEST_API = `${API_BASE_URL}/contest/api`;

// ============= API Helpers =============

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

// ============================================================================
// TEACHER ENDPOINTS
// ============================================================================

/**
 * List all contests created by the current teacher
 */
export async function getTeacherContests(params?: {
  status?: string;
  contestType?: string;
  search?: string;
}): Promise<ContestListItem[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append('status', params.status);
  if (params?.contestType) searchParams.append('contest_type', params.contestType);
  if (params?.search) searchParams.append('search', params.search);
  
  const queryString = searchParams.toString();
  const url = `${CONTEST_API}/${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  const data = await handleResponse<ContestListItemDTO[]>(response);
  return data.map(mapContestListItemDTOToDomain);
}

/**
 * Get contest statistics overview
 */
export async function getContestStatistics(): Promise<ContestStatistics> {
  const response = await fetch(`${CONTEST_API}/statistics/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  const data = await handleResponse<ContestStatisticsDTO>(response);
  return mapContestStatisticsDTOToDomain(data);
}

/**
 * Create a new contest
 */
export async function createContest(request: CreateContestRequest): Promise<ContestDetail> {
  const response = await fetch(`${CONTEST_API}/create/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(mapCreateContestRequestToDTO(request)),
  });
  
  const data = await handleResponse<ContestDetailDTO>(response);
  return mapContestDetailDTOToDomain(data);
}

/**
 * Get contest detail
 */
export async function getContestDetail(contestUuid: string): Promise<ContestDetail> {
  const response = await fetch(`${CONTEST_API}/${contestUuid}/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  const data = await handleResponse<ContestDetailDTO>(response);
  return mapContestDetailDTOToDomain(data);
}

/**
 * Update contest details
 */
export async function updateContest(
  contestUuid: string,
  request: UpdateContestRequest
): Promise<ContestDetail> {
  const response = await fetch(`${CONTEST_API}/${contestUuid}/update/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(mapUpdateContestRequestToDTO(request)),
  });
  
  const data = await handleResponse<ContestDetailDTO>(response);
  return mapContestDetailDTOToDomain(data);
}

/**
 * Update contest content (passages, parts, tasks, topics)
 */
export async function updateContestContent(
  contestUuid: string,
  request: {
    readingPassageIds?: number[];
    listeningPartIds?: number[];
    writingTaskIds?: number[];
    speakingTopicIds?: number[];
    action: 'add' | 'remove' | 'replace';
  }
): Promise<ContestDetail> {
  const response = await fetch(`${CONTEST_API}/${contestUuid}/update-content/`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      reading_passage_ids: request.readingPassageIds,
      listening_part_ids: request.listeningPartIds,
      writing_task_ids: request.writingTaskIds,
      speaking_topic_ids: request.speakingTopicIds,
      action: request.action,
    }),
  });
  
  const data = await handleResponse<ContestDetailDTO>(response);
  return mapContestDetailDTOToDomain(data);
}

/**
 * Publish contest (DRAFT -> SCHEDULED)
 */
export async function publishContest(contestUuid: string): Promise<{ message: string }> {
  const response = await fetch(`${CONTEST_API}/${contestUuid}/publish/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  
  return handleResponse<{ message: string }>(response);
}

/**
 * Archive contest
 */
export async function archiveContest(contestUuid: string): Promise<{ message: string }> {
  const response = await fetch(`${CONTEST_API}/${contestUuid}/archive/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  
  return handleResponse<{ message: string }>(response);
}

/**
 * Assign students to contest
 */
export async function assignStudentsToContest(
  contestUuid: string,
  studentIds: number[],
  action: 'add' | 'remove' | 'replace' = 'add'
): Promise<{ message: string }> {
  const response = await fetch(`${CONTEST_API}/${contestUuid}/assign-students/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      student_ids: studentIds,
      action,
    }),
  });
  
  return handleResponse<{ message: string }>(response);
}

/**
 * Get contest leaderboard
 */
export async function getContestLeaderboard(contestUuid: string): Promise<Leaderboard> {
  const response = await fetch(`${CONTEST_API}/${contestUuid}/leaderboard/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  const data = await handleResponse<LeaderboardResponseDTO>(response);
  return mapLeaderboardResponseDTOToDomain(data);
}

/**
 * Toggle results visibility for students
 */
export async function toggleResultsVisible(
  contestUuid: string
): Promise<{ message: string; resultsVisible: boolean }> {
  const response = await fetch(`${CONTEST_API}/${contestUuid}/toggle-results-visible/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  
  const data = await handleResponse<ToggleResultsVisibleResponseDTO>(response);
  return {
    message: data.message,
    resultsVisible: data.results_visible,
  };
}

/**
 * Delete contest
 */
export async function deleteContest(contestUuid: string): Promise<void> {
  const response = await fetch(`${CONTEST_API}/${contestUuid}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to delete contest' }));
    throw new Error(error.detail || error.error || 'Failed to delete contest');
  }
}

// ============================================================================
// TEACHER GRADING ENDPOINTS
// ============================================================================

/**
 * Get all attempts for a specific contest (for teacher grading)
 */
export async function getContestAttempts(contestUuid: string): Promise<ContestAttemptListItem[]> {
  const response = await fetch(`${CONTEST_API}/${contestUuid}/attempts/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  const data = await handleResponse<ContestAttemptListItemDTO[]>(response);
  return data.map(mapContestAttemptListItemDTOToDomain);
}

/**
 * Get attempt detail for grading
 */
export async function getAttemptForGrading(attemptUuid: string): Promise<ContestAttemptDetail> {
  const response = await fetch(`${CONTEST_API}/attempts/${attemptUuid}/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  const data = await handleResponse<ContestAttemptDetailDTO>(response);
  return mapContestAttemptDetailDTOToDomain(data);
}

/**
 * Grade writing task
 */
export async function gradeWritingTask(
  attemptUuid: string,
  taskId: number,
  score: number,
  feedback?: WritingFeedback
): Promise<{ message: string }> {
  const response = await fetch(`${CONTEST_API}/attempts/${attemptUuid}/grade-writing/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      task_id: taskId,
      score,
      feedback: feedback ? {
        task_response_or_achievement: feedback.taskResponseOrAchievement,
        coherence_and_cohesion: feedback.coherenceAndCohesion,
        lexical_resource: feedback.lexicalResource,
        grammatical_range_and_accuracy: feedback.grammaticalRangeAndAccuracy,
        overall: feedback.overall,
      } : undefined,
    }),
  });
  
  return handleResponse<{ message: string }>(response);
}

// ============================================================================
// AVAILABLE CONTENT ENDPOINTS (for exam creation)
// ============================================================================

/**
 * Get available reading passages for selection
 */
export async function getAvailableReadingPassages(params?: {
  passageNumber?: number;
  search?: string;
}): Promise<AvailableReadingPassage[]> {
  const searchParams = new URLSearchParams();
  if (params?.passageNumber) searchParams.append('passage_number', params.passageNumber.toString());
  if (params?.search) searchParams.append('search', params.search);
  
  const queryString = searchParams.toString();
  const url = `${CONTEST_API}/available/reading/${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  const data = await handleResponse<AvailableReadingPassageDTO[]>(response);
  return data.map(mapAvailableReadingPassageDTOToDomain);
}

/**
 * Get available listening parts for selection
 */
export async function getAvailableListeningParts(params?: {
  partNumber?: number;
  search?: string;
}): Promise<AvailableListeningPart[]> {
  const searchParams = new URLSearchParams();
  if (params?.partNumber) searchParams.append('part_number', params.partNumber.toString());
  if (params?.search) searchParams.append('search', params.search);
  
  const queryString = searchParams.toString();
  const url = `${CONTEST_API}/available/listening/${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  const data = await handleResponse<AvailableListeningPartDTO[]>(response);
  return data.map(mapAvailableListeningPartDTOToDomain);
}

/**
 * Get available writing tasks for selection
 */
export async function getAvailableWritingTasks(params?: {
  taskType?: 'TASK_1' | 'TASK_2';
  search?: string;
}): Promise<AvailableWritingTask[]> {
  const searchParams = new URLSearchParams();
  if (params?.taskType) searchParams.append('task_type', params.taskType);
  if (params?.search) searchParams.append('search', params.search);
  
  const queryString = searchParams.toString();
  const url = `${CONTEST_API}/available/writing/${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  const data = await handleResponse<AvailableWritingTaskDTO[]>(response);
  return data.map(mapAvailableWritingTaskDTOToDomain);
}

/**
 * Get available speaking topics for selection
 */
export async function getAvailableSpeakingTopics(params?: {
  speakingType?: string;
  search?: string;
}): Promise<AvailableSpeakingTopic[]> {
  const searchParams = new URLSearchParams();
  if (params?.speakingType) searchParams.append('speaking_type', params.speakingType);
  if (params?.search) searchParams.append('search', params.search);
  
  const queryString = searchParams.toString();
  const url = `${CONTEST_API}/available/speaking/${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  const data = await handleResponse<AvailableSpeakingTopicDTO[]>(response);
  return data.map(mapAvailableSpeakingTopicDTOToDomain);
}

// ============================================================================
// STUDENT ENDPOINTS
// ============================================================================

/**
 * List contests available for the current student
 */
export async function getAvailableContests(params?: {
  status?: 'active' | 'upcoming' | 'completed';
  contestType?: string;
}): Promise<ContestListItem[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append('status', params.status);
  if (params?.contestType) searchParams.append('contest_type', params.contestType);
  
  const queryString = searchParams.toString();
  const url = `${CONTEST_API}/available/${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  const data = await handleResponse<ContestListItemDTO[]>(response);
  return data.map(mapContestListItemDTOToDomain);
}

/**
 * Get student's contest attempts
 */
export async function getMyContestAttempts(): Promise<ContestAttemptListItem[]> {
  const response = await fetch(`${CONTEST_API}/my-attempts/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  const data = await handleResponse<ContestAttemptListItemDTO[]>(response);
  return data.map(mapContestAttemptListItemDTOToDomain);
}

/**
 * Join a contest (with optional access code)
 */
export async function joinContest(
  contestUuid: string,
  accessCode?: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${CONTEST_API}/${contestUuid}/join/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ access_code: accessCode }),
  });
  
  return handleResponse<{ success: boolean; message: string }>(response);
}

// ============================================================================
// ATTEMPT ENDPOINTS (Student taking exam)
// ============================================================================

/**
 * Start a new contest attempt
 */
export async function startContestAttempt(contestUuid: string): Promise<ContestAttemptDetail> {
  const response = await fetch(`${CONTEST_API}/${contestUuid}/start/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  
  const data = await handleResponse<StartAttemptResponseDTO>(response);
  return mapContestAttemptDetailDTOToDomain(data as unknown as ContestAttemptDetailDTO);
}

/**
 * Get current attempt details
 */
export async function getAttemptDetail(attemptUuid: string): Promise<ContestAttemptDetail> {
  const response = await fetch(`${CONTEST_API}/attempts/${attemptUuid}/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  const data = await handleResponse<ContestAttemptDetailDTO>(response);
  return mapContestAttemptDetailDTOToDomain(data);
}

/**
 * Get section data for current attempt
 */
export async function getAttemptSectionData(
  attemptUuid: string,
  section: SectionName
): Promise<SectionData> {
  const response = await fetch(`${CONTEST_API}/attempts/${attemptUuid}/section/${section.toLowerCase()}/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  const data = await handleResponse<SectionDataDTO>(response);
  return mapSectionDataDTOToDomain(data);
}

/**
 * Submit answer for a question (auto-save)
 */
export async function submitContestAnswer(
  attemptUuid: string,
  questionId: number,
  answer: string
): Promise<{ success: boolean; message?: string }> {
  const response = await fetch(`${CONTEST_API}/attempts/${attemptUuid}/submit-answer/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      question_id: questionId,
      answer,
    }),
  });
  
  return handleResponse<{ success: boolean; message?: string }>(response);
}

/**
 * Submit all answers at once (final submission for reading/listening)
 */
export async function submitContestAttempt(
  attemptUuid: string,
  request: {
    answers: Record<string, string>;
    startedAt: Date;
    timeSpentSeconds: number;
  }
): Promise<SubmitContestResponse> {
  const response = await fetch(`${CONTEST_API}/attempts/${attemptUuid}/submit/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(mapSubmitAnswersRequestToDTO(request)),
  });
  
  const data = await handleResponse<SubmitContestResponseDTO>(response);
  return mapSubmitContestResponseDTOToDomain(data);
}

/**
 * Submit writing answers
 */
export async function submitContestWriting(
  attemptUuid: string,
  request: {
    writingAnswers: Array<{ taskId: number; answerText: string }>;
    startedAt: Date;
    timeSpentSeconds: number;
  }
): Promise<SubmitContestResponse> {
  const response = await fetch(`${CONTEST_API}/attempts/${attemptUuid}/submit-writing/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(mapSubmitWritingRequestToDTO(request)),
  });
  
  const data = await handleResponse<SubmitContestResponseDTO>(response);
  return mapSubmitContestResponseDTOToDomain(data);
}

/**
 * Move to next section
 */
export async function nextSection(attemptUuid: string): Promise<NextSectionResponse> {
  const response = await fetch(`${CONTEST_API}/attempts/${attemptUuid}/next-section/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  
  const data = await handleResponse<NextSectionResponseDTO>(response);
  return mapNextSectionResponseDTOToDomain(data);
}

/**
 * Get attempt result (after submission)
 */
export async function getAttemptResult(attemptUuid: string): Promise<ContestResult> {
  const response = await fetch(`${CONTEST_API}/attempts/${attemptUuid}/result/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  const data = await handleResponse<ContestResultDTO>(response);
  return mapContestResultDTOToDomain(data);
}
