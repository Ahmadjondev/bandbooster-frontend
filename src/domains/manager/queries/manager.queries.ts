/**
 * TanStack Query hooks for Manager API
 * Simplified 3-step workflow: Extract → Save → Practice
 * Plus Reading and Listening CRUD management
 */

import { useMutation, useQuery, useQueryClient, type UseMutationOptions, type UseQueryOptions } from '@tanstack/react-query';
import { managerApi } from '../api/manager.api';
import type {
  ExtractResponse,
  SaveResponse,
  CreatePracticeInput,
  CreatePracticeResponse,
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

// ============================================================================
// QUERY KEYS
// ============================================================================

export const managerQueryKeys = {
  all: ['manager'] as const,
  extract: () => [...managerQueryKeys.all, 'extract'] as const,
  save: () => [...managerQueryKeys.all, 'save'] as const,
  practice: () => [...managerQueryKeys.all, 'practice'] as const,
  
  // Reading keys
  reading: {
    all: () => [...managerQueryKeys.all, 'reading'] as const,
    list: (params?: ContentFilterParams) => [...managerQueryKeys.reading.all(), 'list', params] as const,
    detail: (id: number) => [...managerQueryKeys.reading.all(), 'detail', id] as const,
  },
  
  // Listening keys
  listening: {
    all: () => [...managerQueryKeys.all, 'listening'] as const,
    list: (params?: ContentFilterParams) => [...managerQueryKeys.listening.all(), 'list', params] as const,
    detail: (id: number) => [...managerQueryKeys.listening.all(), 'detail', id] as const,
  },
};

// ============================================================================
// EXTRACT MUTATIONS (STEP 1)
// ============================================================================

/**
 * Extract from JSON object (recommended)
 */
export function useExtractFromJson(
  options?: Omit<UseMutationOptions<ExtractResponse, Error, Record<string, unknown>>, 'mutationFn'>
) {
  return useMutation({
    mutationFn: (jsonContent: Record<string, unknown>) => managerApi.extractFromJson(jsonContent),
    ...options,
  });
}

/**
 * Extract from JSON text string
 */
export function useExtractFromText(
  options?: Omit<UseMutationOptions<ExtractResponse, Error, string>, 'mutationFn'>
) {
  return useMutation({
    mutationFn: (jsonText: string) => managerApi.extractFromText(jsonText),
    ...options,
  });
}

/**
 * Extract from file upload
 */
export function useExtractFromFile(
  options?: Omit<UseMutationOptions<ExtractResponse, Error, File>, 'mutationFn'>
) {
  return useMutation({
    mutationFn: (file: File) => managerApi.extractFromFile(file),
    ...options,
  });
}

// ============================================================================
// SAVE MUTATION (STEP 2)
// ============================================================================

interface SaveContentParams {
  content: ListeningContent | ReadingContent;
  contentType: ContentType;
}

/**
 * Save validated content to database
 */
export function useSaveContent(
  options?: Omit<UseMutationOptions<SaveResponse, Error, SaveContentParams>, 'mutationFn'>
) {
  return useMutation({
    mutationFn: ({ content, contentType }: SaveContentParams) => 
      managerApi.saveContent(content, contentType),
    ...options,
  });
}

// ============================================================================
// CREATE PRACTICE MUTATION (STEP 3)
// ============================================================================

/**
 * Create practice from saved content IDs
 */
export function useCreatePractice(
  options?: Omit<UseMutationOptions<CreatePracticeResponse, Error, CreatePracticeInput>, 'mutationFn'>
) {
  return useMutation({
    mutationFn: (input: CreatePracticeInput) => managerApi.createPractice(input),
    ...options,
  });
}

// ============================================================================
// READING QUERIES
// ============================================================================

/**
 * List reading passages with optional filters
 */
export function useReadingList(
  params?: ContentFilterParams,
  options?: Omit<UseQueryOptions<ReadingListResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: managerQueryKeys.reading.list(params),
    queryFn: () => managerApi.listReading(params),
    ...options,
  });
}

/**
 * Get a single reading passage by ID
 */
export function useReadingDetail(
  id: number,
  options?: Omit<UseQueryOptions<ReadingDetail, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: managerQueryKeys.reading.detail(id),
    queryFn: () => managerApi.getReading(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Create a new reading passage
 */
export function useCreateReading(
  options?: Omit<UseMutationOptions<ReadingDetail, Error, CreateReadingInput>, 'mutationFn'>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReadingInput) => managerApi.createReading(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: managerQueryKeys.reading.all() });
    },
    ...options,
  });
}

/**
 * Update a reading passage
 */
export function useUpdateReading(
  options?: Omit<UseMutationOptions<ReadingDetail, Error, { id: number; input: UpdateReadingInput }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }) => managerApi.updateReading(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: managerQueryKeys.reading.all() });
      queryClient.setQueryData(managerQueryKeys.reading.detail(data.id), data);
    },
    ...options,
  });
}

/**
 * Partial update a reading passage
 */
export function usePatchReading(
  options?: Omit<UseMutationOptions<ReadingDetail, Error, { id: number; input: UpdateReadingInput }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }) => managerApi.patchReading(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: managerQueryKeys.reading.all() });
      queryClient.setQueryData(managerQueryKeys.reading.detail(data.id), data);
    },
    ...options,
  });
}

/**
 * Delete a reading passage
 */
export function useDeleteReading(
  options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => managerApi.deleteReading(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: managerQueryKeys.reading.all() });
    },
    ...options,
  });
}

// ============================================================================
// LISTENING QUERIES
// ============================================================================

/**
 * List listening parts with optional filters
 */
export function useListeningList(
  params?: ContentFilterParams,
  options?: Omit<UseQueryOptions<ListeningListResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: managerQueryKeys.listening.list(params),
    queryFn: () => managerApi.listListening(params),
    ...options,
  });
}

/**
 * Get a single listening part by ID
 */
export function useListeningDetail(
  id: number,
  options?: Omit<UseQueryOptions<ListeningDetail, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: managerQueryKeys.listening.detail(id),
    queryFn: () => managerApi.getListening(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Create a new listening part
 */
export function useCreateListening(
  options?: Omit<UseMutationOptions<ListeningDetail, Error, CreateListeningInput>, 'mutationFn'>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateListeningInput) => managerApi.createListening(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: managerQueryKeys.listening.all() });
    },
    ...options,
  });
}

/**
 * Upload audio for a listening part
 * Note: Duration is set automatically based on audio length
 */
export function useUploadListeningAudio(
  options?: Omit<UseMutationOptions<ListeningDetail, Error, { id: number; audioFile: File }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, audioFile }) => managerApi.uploadListeningAudio(id, audioFile),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: managerQueryKeys.listening.all() });
      queryClient.setQueryData(managerQueryKeys.listening.detail(data.id), data);
    },
    ...options,
  });
}

/**
 * Update a listening part
 */
export function useUpdateListening(
  options?: Omit<UseMutationOptions<ListeningDetail, Error, { id: number; input: UpdateListeningInput }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }) => managerApi.updateListening(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: managerQueryKeys.listening.all() });
      queryClient.setQueryData(managerQueryKeys.listening.detail(data.id), data);
    },
    ...options,
  });
}

/**
 * Partial update a listening part
 */
export function usePatchListening(
  options?: Omit<UseMutationOptions<ListeningDetail, Error, { id: number; input: UpdateListeningInput }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }) => managerApi.patchListening(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: managerQueryKeys.listening.all() });
      queryClient.setQueryData(managerQueryKeys.listening.detail(data.id), data);
    },
    ...options,
  });
}

/**
 * Delete a listening part
 */
export function useDeleteListening(
  options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => managerApi.deleteListening(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: managerQueryKeys.listening.all() });
    },
    ...options,
  });
}
