/**
 * TanStack Query hooks for practice module
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { practiceApi, type GetPracticesBySectionParams, type GetAttemptsParams } from '../api/practice.api';
import { practiceKeys } from '@/store/queryKeys/practice.keys';
import type { SectionType, SubmitAnswersRequest } from '../models/domain';

// ============= Overview & Stats Queries =============

/**
 * Hook to fetch overview of all section types with counts and progress
 */
export function useOverview(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: practiceKeys.overview(),
    queryFn: () => practiceApi.getOverview(),
    enabled: options.enabled ?? true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch user practice statistics
 */
export function useUserStats(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: practiceKeys.userStats(),
    queryFn: () => practiceApi.getUserStats(),
    enabled: options.enabled ?? true,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch section attempt balance (remaining free attempts)
 */
export function useAttemptBalance(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: practiceKeys.attemptBalance(),
    queryFn: () => practiceApi.getAttemptBalance(),
    enabled: options.enabled ?? true,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch section-specific statistics
 */
export function useSectionStats(sectionType: SectionType, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: practiceKeys.sectionStats(sectionType),
    queryFn: () => practiceApi.getSectionStats(sectionType),
    enabled: (options.enabled ?? true) && !!sectionType,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ============= Practice List Queries =============

/**
 * Hook to fetch practices by section with filters and pagination
 */
export function usePracticesBySection(
  sectionType: SectionType,
  params: GetPracticesBySectionParams = {},
  options: { enabled?: boolean } = {}
) {
  return useQuery({
    queryKey: practiceKeys.sectionListFiltered(sectionType, params),
    queryFn: () => practiceApi.getPracticesBySection(sectionType, params),
    enabled: (options.enabled ?? true) && !!sectionType,
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (previousData) => previousData, // Keep previous data while loading new
  });
}

// ============= Practice Detail Queries =============

/**
 * Hook to fetch practice detail by UUID
 */
export function usePracticeDetail(practiceUuid: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: practiceKeys.detail(practiceUuid),
    queryFn: () => practiceApi.getPracticeDetail(practiceUuid),
    enabled: (options.enabled ?? true) && !!practiceUuid,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to prefetch practice detail (useful for hover prefetching)
 */
export function usePrefetchPracticeDetail() {
  const queryClient = useQueryClient();

  return (practiceUuid: string) => {
    queryClient.prefetchQuery({
      queryKey: practiceKeys.detail(practiceUuid),
      queryFn: () => practiceApi.getPracticeDetail(practiceUuid),
      staleTime: 10 * 60 * 1000,
    });
  };
}

// ============= Attempt Queries =============

/**
 * Hook to fetch user's practice attempts
 */
export function useAttempts(params: GetAttemptsParams = {}, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: practiceKeys.attemptList(params),
    queryFn: () => practiceApi.getAttempts(params),
    enabled: options.enabled ?? true,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch attempt details
 */
export function useAttemptDetail(attemptUuid: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: practiceKeys.attemptDetail(attemptUuid),
    queryFn: () => practiceApi.getAttemptDetail(attemptUuid),
    enabled: (options.enabled ?? true) && !!attemptUuid,
    staleTime: Infinity, // Attempt details don't change
  });
}

/**
 * Hook to fetch attempt result with scoring
 */
export function useAttemptResult(attemptUuid: string, options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: practiceKeys.attemptResult(attemptUuid),
    queryFn: () => practiceApi.getAttemptResult(attemptUuid),
    enabled: (options.enabled ?? true) && !!attemptUuid,
    staleTime: Infinity, // Results don't change
  });
}

// ============= Submission Mutations =============

interface SubmitPracticeVariables {
  practiceUuid: string;
  request: SubmitAnswersRequest;
}

/**
 * Hook to submit practice answers (Reading/Listening)
 */
export function useSubmitPractice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ practiceUuid, request }: SubmitPracticeVariables) =>
      practiceApi.submitPracticeAnswers(practiceUuid, request),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: practiceKeys.attempts() });
      queryClient.invalidateQueries({ queryKey: practiceKeys.stats() });
      queryClient.invalidateQueries({ queryKey: practiceKeys.overview() });
    },
  });
}

interface SubmitWritingVariables {
  practiceUuid: string;
  response: string;
  startedAt: Date;
  timeSpentSeconds: number;
}

/**
 * Hook to submit writing practice for AI evaluation
 */
export function useSubmitWriting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ practiceUuid, response, startedAt, timeSpentSeconds }: SubmitWritingVariables) =>
      practiceApi.submitWritingPractice(practiceUuid, response, startedAt, timeSpentSeconds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: practiceKeys.attempts() });
      queryClient.invalidateQueries({ queryKey: practiceKeys.stats() });
      queryClient.invalidateQueries({ queryKey: practiceKeys.overview() });
    },
  });
}

interface SubmitSpeakingAnswerVariables {
  practiceUuid: string;
  questionKey: string;
  audioFile: File;
  sessionId: string;
}

/**
 * Hook to submit a single speaking recording
 */
export function useSubmitSpeakingAnswer() {
  return useMutation({
    mutationFn: ({ practiceUuid, questionKey, audioFile, sessionId }: SubmitSpeakingAnswerVariables) =>
      practiceApi.submitSpeakingAnswer(practiceUuid, questionKey, audioFile, sessionId),
  });
}

interface CompleteSpeakingVariables {
  practiceUuid: string;
  sessionId: string;
  startedAt: Date;
  timeSpentSeconds: number;
}

/**
 * Hook to complete speaking practice and trigger AI evaluation
 */
export function useCompleteSpeaking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ practiceUuid, sessionId, startedAt, timeSpentSeconds }: CompleteSpeakingVariables) =>
      practiceApi.completeSpeakingPractice(practiceUuid, sessionId, startedAt, timeSpentSeconds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: practiceKeys.attempts() });
      queryClient.invalidateQueries({ queryKey: practiceKeys.stats() });
      queryClient.invalidateQueries({ queryKey: practiceKeys.overview() });
    },
  });
}
