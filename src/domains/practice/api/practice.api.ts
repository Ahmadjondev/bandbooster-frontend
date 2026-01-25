/**
 * API client for practice-related endpoints
 * Integrates with BandBooster backend practice APIs
 */

import type {
  SectionType,
  DifficultyLevel,
  SectionOverviewDTO,
  PracticeSectionResponseDTO,
  PracticeDetailDTO,
  AttemptListItemDTO,
  AttemptDetailDTO,
  AttemptResultDTO,
  SubmitAnswersRequestDTO,
  SubmitAnswersResponseDTO,
  SubmitWritingRequestDTO,
  SubmitWritingResponseDTO,
  CompleteSpeakingRequestDTO,
  CompleteSpeakingResponseDTO,
  UserStatsDTO,
  AttemptBalanceResponseDTO,
  SectionSpecificStatsDTO,
  ChartType,
  TaskType,
} from './practice.contract';

import {
  mapSectionOverviewDTOToDomain,
  mapPracticeSectionResponseDTOToDomain,
  mapPracticeDetailDTOToDomain,
  mapAttemptListItemDTOToDomain,
  mapAttemptDetailDTOToDomain,
  mapAttemptResultDTOToDomain,
  mapSubmitAnswersResponseDTOToDomain,
  mapSubmitWritingResponseDTOToDomain,
  mapCompleteSpeakingResponseDTOToDomain,
  mapUserStatsDTOToDomain,
  mapAttemptBalanceResponseDTOToDomain,
  mapSectionSpecificStatsDTOToDomain,
} from './practice.mapper';

import type {
  SectionOverview,
  PracticeSectionResponse,
  PracticeDetail,
  AttemptListItem,
  AttemptDetail,
  AttemptResult,
  SubmitAnswersRequest,
  SubmitAnswersResponse,
  SubmitWritingResponse,
  CompleteSpeakingResponse,
  UserStats,
  AttemptBalanceResponse,
  SectionSpecificStats,
} from '../models/domain';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001';

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

// ============= Overview & Stats APIs =============

/**
 * Get overview of all section types with counts and user progress
 */
export async function getOverview(): Promise<SectionOverview[]> {
  const response = await fetch(`${API_BASE_URL}/practice/overview/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await handleResponse<SectionOverviewDTO[]>(response);
  return data.map(mapSectionOverviewDTOToDomain);
}

/**
 * Get user practice statistics
 */
export async function getUserStats(): Promise<UserStats> {
  const response = await fetch(`${API_BASE_URL}/practice/user/stats/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await handleResponse<UserStatsDTO>(response);
  return mapUserStatsDTOToDomain(data);
}

/**
 * Get section attempt balance (remaining free attempts)
 */
export async function getAttemptBalance(): Promise<AttemptBalanceResponse> {
  const response = await fetch(`${API_BASE_URL}/practice/user/attempt-balance/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await handleResponse<AttemptBalanceResponseDTO>(response);
  return mapAttemptBalanceResponseDTOToDomain(data);
}

/**
 * Get section-specific statistics
 */
export async function getSectionStats(sectionType: SectionType): Promise<SectionSpecificStats> {
  const response = await fetch(`${API_BASE_URL}/practice/user/section-stats/${sectionType}/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await handleResponse<SectionSpecificStatsDTO>(response);
  return mapSectionSpecificStatsDTOToDomain(data);
}

// ============= Practice List APIs =============

export interface GetPracticesBySectionParams {
  page?: number;
  pageSize?: number;
  difficulty?: DifficultyLevel;
  isPremium?: boolean;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'difficulty' | 'title';
  // Section specific
  passageNumber?: number;
  partNumber?: number;
  chartType?: ChartType;
  taskType?: TaskType;
  speakingPart?: number;
}

/**
 * Get practices by section type with filters and pagination
 */
export async function getPracticesBySection(
  sectionType: SectionType,
  params: GetPracticesBySectionParams = {}
): Promise<PracticeSectionResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.pageSize) searchParams.set('page_size', params.pageSize.toString());
  if (params.difficulty) searchParams.set('difficulty', params.difficulty);
  if (params.isPremium !== undefined) searchParams.set('is_premium', params.isPremium.toString());
  if (params.search) searchParams.set('search', params.search);
  if (params.sortBy) searchParams.set('sort_by', params.sortBy);
  if (params.passageNumber) searchParams.set('passage_number', params.passageNumber.toString());
  if (params.partNumber) searchParams.set('part_number', params.partNumber.toString());
  if (params.chartType) searchParams.set('chart_type', params.chartType);
  if (params.taskType) searchParams.set('task_type', params.taskType);
  if (params.speakingPart) searchParams.set('speaking_part', params.speakingPart.toString());

  const url = `${API_BASE_URL}/practice/sections/${sectionType}/?${searchParams.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await handleResponse<PracticeSectionResponseDTO>(response);
  return mapPracticeSectionResponseDTOToDomain(data);
}

// ============= Practice Detail APIs =============

/**
 * Get practice detail by UUID
 */
export async function getPracticeDetail(practiceUuid: string): Promise<PracticeDetail> {
  const response = await fetch(`${API_BASE_URL}/practice/${practiceUuid}/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await handleResponse<PracticeDetailDTO>(response);
  return mapPracticeDetailDTOToDomain(data);
}

// ============= Attempt APIs =============

export interface GetAttemptsParams {
  sectionType?: SectionType;
  testType?: 'FULL_TEST' | 'SECTION_PRACTICE';
  limit?: number;
}

/**
 * Get user's practice attempts
 */
export async function getAttempts(params: GetAttemptsParams = {}): Promise<AttemptListItem[]> {
  const searchParams = new URLSearchParams();
  
  if (params.sectionType) searchParams.set('section_type', params.sectionType);
  if (params.testType) searchParams.set('test_type', params.testType);
  if (params.limit) searchParams.set('limit', params.limit.toString());

  const url = `${API_BASE_URL}/practice/attempts/?${searchParams.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await handleResponse<AttemptListItemDTO[]>(response);
  return data.map(mapAttemptListItemDTOToDomain);
}

/**
 * Get attempt details
 */
export async function getAttemptDetail(attemptUuid: string): Promise<AttemptDetail> {
  const response = await fetch(`${API_BASE_URL}/practice/attempts/${attemptUuid}/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await handleResponse<AttemptDetailDTO>(response);
  return mapAttemptDetailDTOToDomain(data);
}

/**
 * Get attempt result with scoring
 */
export async function getAttemptResult(attemptUuid: string): Promise<AttemptResult> {
  const response = await fetch(`${API_BASE_URL}/practice/attempts/${attemptUuid}/result/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  const data = await handleResponse<AttemptResultDTO>(response);
  return mapAttemptResultDTOToDomain(data);
}

// ============= Submission APIs =============

/**
 * Submit practice answers (Reading/Listening)
 */
export async function submitPracticeAnswers(
  practiceUuid: string,
  request: SubmitAnswersRequest
): Promise<SubmitAnswersResponse> {
  const requestBody: SubmitAnswersRequestDTO = {
    answers: request.answers,
    started_at: request.startedAt.toISOString(),
    time_spent_seconds: request.timeSpentSeconds,
  };

  const response = await fetch(`${API_BASE_URL}/practice/${practiceUuid}/submit/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(requestBody),
  });
  const data = await handleResponse<SubmitAnswersResponseDTO>(response);
  return mapSubmitAnswersResponseDTOToDomain(data);
}

/**
 * Submit writing response for AI evaluation
 */
export async function submitWritingPractice(
  practiceUuid: string,
  response_text: string,
  startedAt: Date,
  timeSpentSeconds: number
): Promise<SubmitWritingResponse> {
  const requestBody: SubmitWritingRequestDTO = {
    response: response_text,
    started_at: startedAt.toISOString(),
    time_spent_seconds: timeSpentSeconds,
  };

  const response = await fetch(`${API_BASE_URL}/practice/${practiceUuid}/submit-writing/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(requestBody),
  });
  const data = await handleResponse<SubmitWritingResponseDTO>(response);
  return mapSubmitWritingResponseDTOToDomain(data);
}

/**
 * Submit speaking answer (single recording)
 */
export async function submitSpeakingAnswer(
  practiceUuid: string,
  questionKey: string,
  audioFile: File,
  sessionId: string
): Promise<{ success: boolean; recordingUuid: string }> {
  const formData = new FormData();
  formData.append('question_key', questionKey);
  formData.append('audio_file', audioFile);
  formData.append('session_id', sessionId);

  const token = getAccessToken();
  const response = await fetch(`${API_BASE_URL}/practice/${practiceUuid}/submit-speaking-answer/`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  const data = await handleResponse<{ success: boolean; recording_uuid: string }>(response);
  return {
    success: data.success,
    recordingUuid: data.recording_uuid,
  };
}

/**
 * Complete speaking practice and trigger AI evaluation
 */
export async function completeSpeakingPractice(
  practiceUuid: string,
  sessionId: string,
  startedAt: Date,
  timeSpentSeconds: number
): Promise<CompleteSpeakingResponse> {
  const requestBody: CompleteSpeakingRequestDTO = {
    session_id: sessionId,
    started_at: startedAt.toISOString(),
    time_spent_seconds: timeSpentSeconds,
  };

  const response = await fetch(`${API_BASE_URL}/practice/${practiceUuid}/submit-speaking-complete/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(requestBody),
  });
  const data = await handleResponse<CompleteSpeakingResponseDTO>(response);
  return mapCompleteSpeakingResponseDTOToDomain(data);
}

// ============= Export API Object =============

export const practiceApi = {
  // Overview & Stats
  getOverview,
  getUserStats,
  getAttemptBalance,
  getSectionStats,
  // Practice List
  getPracticesBySection,
  // Practice Detail
  getPracticeDetail,
  // Attempts
  getAttempts,
  getAttemptDetail,
  getAttemptResult,
  // Submissions
  submitPracticeAnswers,
  submitWritingPractice,
  submitSpeakingAnswer,
  completeSpeakingPractice,
};
