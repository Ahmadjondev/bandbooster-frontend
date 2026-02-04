/**
 * API client for Manager endpoints
 * Simplified 3-step workflow: Extract → Save → Practice
 * Plus Reading and Listening CRUD management
 */

import type {
  ExtractJsonRequestDTO,
  ExtractTextRequestDTO,
  ExtractResponseDTO,
  SaveRequestDTO,
  SaveResponseDTO,
  CreatePracticeRequestDTO,
  CreatePracticeResponseDTO,
  ListeningContentDTO,
  ReadingContentDTO,
  ReadingListResponseDTO,
  ReadingDetailDTO,
  ListeningListResponseDTO,
  ListeningDetailDTO,
} from './manager.contract';

import {
  mapExtractResponseDTOToDomain,
  mapSaveResponseDTOToDomain,
  mapCreatePracticeResponseDTOToDomain,
  mapContentDomainToDTO,
  mapReadingListResponseDTOToDomain,
  mapReadingDetailDTOToDomain,
  mapCreateReadingInputToDTO,
  mapUpdateReadingInputToDTO,
  mapListeningListResponseDTOToDomain,
  mapListeningDetailDTOToDomain,
  mapCreateListeningInputToDTO,
  mapUpdateListeningInputToDTO,
  mapFilterParamsToDTO,
} from './manager.mapper';

import type {
  ExtractResponse,
  SaveResponse,
  CreatePracticeResponse,
  CreatePracticeInput,
  ListeningContent,
  ReadingContent,
  ContentType,
  ReadingListResponse,
  ReadingDetail,
  CreateReadingInput,
  UpdateReadingInput,
  ListeningListResponse,
  ListeningDetail,
  CreateListeningInput,
  UpdateListeningInput,
  ContentFilterParams,
} from '../models/domain';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
const MANAGER_API_PATH = '/manager/api';

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

function getAccessToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
}

// ============================================================================
// API HELPERS
// ============================================================================

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: 'An unexpected error occurred',
    }));
    throw new Error(
      error.detail || error.error || error.message || `HTTP error! status: ${response.status}`
    );
  }
  return response.json();
}

function getAuthHeaders(): HeadersInit {
  const token = getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// ============================================================================
// API CLIENT
// ============================================================================

export const managerApi = {
  // --------------------------------------------------------------------------
  // STEP 1: EXTRACT (PREVIEW)
  // --------------------------------------------------------------------------

  /**
   * Extract & validate JSON object (recommended)
   * Returns preview data without saving to database
   */
  async extractFromJson(jsonContent: Record<string, unknown>): Promise<ExtractResponse> {
    const body: ExtractJsonRequestDTO = { json_content: jsonContent as unknown as ListeningContentDTO | ReadingContentDTO };
    
    const response = await fetch(
      `${API_BASE_URL}${MANAGER_API_PATH}/extract/json/`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      }
    );
    
    const data = await handleResponse<ExtractResponseDTO>(response);
    return mapExtractResponseDTOToDomain(data);
  },

  /**
   * Extract & validate JSON text string
   */
  async extractFromText(jsonText: string): Promise<ExtractResponse> {
    const body: ExtractTextRequestDTO = { json_text: jsonText };
    
    const response = await fetch(
      `${API_BASE_URL}${MANAGER_API_PATH}/extract/text/`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      }
    );
    
    const data = await handleResponse<ExtractResponseDTO>(response);
    return mapExtractResponseDTOToDomain(data);
  },

  /**
   * Extract & validate from uploaded file
   */
  async extractFromFile(file: File): Promise<ExtractResponse> {
    const token = getAccessToken();
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(
      `${API_BASE_URL}${MANAGER_API_PATH}/extract/file/`,
      {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      }
    );
    
    const data = await handleResponse<ExtractResponseDTO>(response);
    return mapExtractResponseDTOToDomain(data);
  },

  // --------------------------------------------------------------------------
  // STEP 2: SAVE
  // --------------------------------------------------------------------------

  /**
   * Save validated content to database
   * Can be modified content from preview
   */
  async saveContent(
    content: ListeningContent | ReadingContent,
    contentType: ContentType
  ): Promise<SaveResponse> {
    const dtoContent = mapContentDomainToDTO(content, contentType);
    const body: SaveRequestDTO = { content: dtoContent };
    
    const response = await fetch(
      `${API_BASE_URL}${MANAGER_API_PATH}/save/`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      }
    );
    
    const data = await handleResponse<SaveResponseDTO>(response);
    return mapSaveResponseDTOToDomain(data);
  },

  // --------------------------------------------------------------------------
  // STEP 3: CREATE PRACTICE (OPTIONAL)
  // --------------------------------------------------------------------------

  /**
   * Create SectionPractice from saved content IDs
   */
  async createPractice(input: CreatePracticeInput): Promise<CreatePracticeResponse> {
    const body: CreatePracticeRequestDTO = {
      content_type: input.contentType,
      content_ids: input.contentIds,
      practice_mode: input.practiceMode,
      title: input.title,
      difficulty: input.difficulty,
      description: input.description,
      is_premium: input.isPremium,
    };
    
    const response = await fetch(
      `${API_BASE_URL}${MANAGER_API_PATH}/practice/`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      }
    );
    
    const data = await handleResponse<CreatePracticeResponseDTO>(response);
    return mapCreatePracticeResponseDTOToDomain(data);
  },

  // --------------------------------------------------------------------------
  // READING CRUD
  // --------------------------------------------------------------------------

  /**
   * List all reading passages with filters
   */
  async listReading(params?: ContentFilterParams): Promise<ReadingListResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      const dtoParams = mapFilterParamsToDTO(params);
      Object.entries(dtoParams).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    
    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}${MANAGER_API_PATH}/reading/${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse<ReadingListResponseDTO>(response);
    return mapReadingListResponseDTOToDomain(data);
  },

  /**
   * Get a single reading passage by ID
   */
  async getReading(id: number): Promise<ReadingDetail> {
    const response = await fetch(
      `${API_BASE_URL}${MANAGER_API_PATH}/reading/${id}/`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );
    
    const data = await handleResponse<ReadingDetailDTO>(response);
    return mapReadingDetailDTOToDomain(data);
  },

  /**
   * Create a new reading passage
   */
  async createReading(input: CreateReadingInput): Promise<ReadingDetail> {
    const body = mapCreateReadingInputToDTO(input);
    
    const response = await fetch(
      `${API_BASE_URL}${MANAGER_API_PATH}/reading/create/`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      }
    );
    
    const data = await handleResponse<ReadingDetailDTO>(response);
    return mapReadingDetailDTOToDomain(data);
  },

  /**
   * Update a reading passage (full update)
   */
  async updateReading(id: number, input: UpdateReadingInput): Promise<ReadingDetail> {
    const body = mapUpdateReadingInputToDTO(input);
    
    const response = await fetch(
      `${API_BASE_URL}${MANAGER_API_PATH}/reading/${id}/update/`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      }
    );
    
    const data = await handleResponse<ReadingDetailDTO>(response);
    return mapReadingDetailDTOToDomain(data);
  },

  /**
   * Partial update a reading passage
   */
  async patchReading(id: number, input: UpdateReadingInput): Promise<ReadingDetail> {
    const body = mapUpdateReadingInputToDTO(input);
    
    const response = await fetch(
      `${API_BASE_URL}${MANAGER_API_PATH}/reading/${id}/partial-update/`,
      {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      }
    );
    
    const data = await handleResponse<ReadingDetailDTO>(response);
    return mapReadingDetailDTOToDomain(data);
  },

  /**
   * Delete a reading passage
   */
  async deleteReading(id: number): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}${MANAGER_API_PATH}/reading/${id}/delete/`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }
    );
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: 'Failed to delete reading passage',
      }));
      throw new Error(error.detail || 'Failed to delete reading passage');
    }
  },

  // --------------------------------------------------------------------------
  // LISTENING CRUD
  // --------------------------------------------------------------------------

  /**
   * List all listening parts with filters
   */
  async listListening(params?: ContentFilterParams): Promise<ListeningListResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      const dtoParams = mapFilterParamsToDTO(params);
      Object.entries(dtoParams).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value));
        }
      });
    }
    
    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}${MANAGER_API_PATH}/listening/${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse<ListeningListResponseDTO>(response);
    return mapListeningListResponseDTOToDomain(data);
  },

  /**
   * Get a single listening part by ID
   */
  async getListening(id: number): Promise<ListeningDetail> {
    const response = await fetch(
      `${API_BASE_URL}${MANAGER_API_PATH}/listening/${id}/`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );
    
    const data = await handleResponse<ListeningDetailDTO>(response);
    return mapListeningDetailDTOToDomain(data);
  },

  /**
   * Create a new listening part
   */
  async createListening(input: CreateListeningInput): Promise<ListeningDetail> {
    const body = mapCreateListeningInputToDTO(input);
    
    const response = await fetch(
      `${API_BASE_URL}${MANAGER_API_PATH}/listening/create/`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      }
    );
    
    const data = await handleResponse<ListeningDetailDTO>(response);
    return mapListeningDetailDTOToDomain(data);
  },

  /**
   * Get audio duration from a File
   */
  async getAudioDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const objectUrl = URL.createObjectURL(file);
      
      audio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(objectUrl);
        const duration = Math.round(audio.duration);
        resolve(duration);
      });
      
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Failed to load audio file'));
      });
      
      audio.src = objectUrl;
    });
  },

  /**
   * Upload audio for a listening part
   * Duration is calculated automatically from the audio file
   */
  async uploadListeningAudio(id: number, audioFile: File): Promise<ListeningDetail> {
    const token = getAccessToken();
    
    // Calculate audio duration
    const duration = await this.getAudioDuration(audioFile);
    
    const formData = new FormData();
    formData.append('audio_file', audioFile);
    formData.append('duration_seconds', String(duration));
    
    const response = await fetch(
      `${API_BASE_URL}${MANAGER_API_PATH}/listening/${id}/partial-update/`,
      {
        method: 'PATCH',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      }
    );
    
    const data = await handleResponse<ListeningDetailDTO>(response);
    return mapListeningDetailDTOToDomain(data);
  },

  /**
   * Update a listening part (full update)
   */
  async updateListening(id: number, input: UpdateListeningInput): Promise<ListeningDetail> {
    const body = mapUpdateListeningInputToDTO(input);
    
    const response = await fetch(
      `${API_BASE_URL}${MANAGER_API_PATH}/listening/${id}/update/`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      }
    );
    
    const data = await handleResponse<ListeningDetailDTO>(response);
    return mapListeningDetailDTOToDomain(data);
  },

  /**
   * Partial update a listening part
   */
  async patchListening(id: number, input: UpdateListeningInput): Promise<ListeningDetail> {
    const body = mapUpdateListeningInputToDTO(input);
    
    const response = await fetch(
      `${API_BASE_URL}${MANAGER_API_PATH}/listening/${id}/partial-update/`,
      {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      }
    );
    
    const data = await handleResponse<ListeningDetailDTO>(response);
    return mapListeningDetailDTOToDomain(data);
  },

  /**
   * Delete a listening part
   */
  async deleteListening(id: number): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}${MANAGER_API_PATH}/listening/${id}/delete/`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
      }
    );
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: 'Failed to delete listening part',
      }));
      throw new Error(error.detail || 'Failed to delete listening part');
    }
  },
};

export type ManagerApi = typeof managerApi;
