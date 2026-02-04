/**
 * Contest TanStack Query Hooks
 * Provides data fetching and mutation hooks for contest operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contestQueryKeys } from '@/store/queryKeys/contest.keys';

import {
  getTeacherContests,
  getContestStatistics,
  createContest,
  getContestDetail,
  updateContest,
  updateContestContent,
  publishContest,
  archiveContest,
  assignStudentsToContest,
  getContestLeaderboard,
  toggleResultsVisible,
  deleteContest,
  getContestAttempts,
  getAttemptForGrading,
  gradeWritingTask,
  getAvailableReadingPassages,
  getAvailableListeningParts,
  getAvailableWritingTasks,
  getAvailableSpeakingTopics,
  getAvailableContests,
  getMyContestAttempts,
  joinContest,
  startContestAttempt,
  getAttemptDetail,
  getAttemptSectionData,
  submitContestAnswer,
  submitContestAttempt,
  submitContestWriting,
  nextSection,
  getAttemptResult,
} from '../api/contest.api';

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
  SectionName,
} from '../models/domain';

// ============================================================================
// TEACHER QUERIES
// ============================================================================

/**
 * Hook to fetch teacher's contests
 */
export function useTeacherContests(params?: {
  status?: string;
  contestType?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: contestQueryKeys.list(params),
    queryFn: () => getTeacherContests(params),
  });
}

/**
 * Hook to fetch contest statistics
 */
export function useContestStatistics() {
  return useQuery({
    queryKey: contestQueryKeys.statistics(),
    queryFn: getContestStatistics,
  });
}

/**
 * Hook to fetch contest detail
 */
export function useContestDetail(contestUuid: string, enabled = true) {
  return useQuery({
    queryKey: contestQueryKeys.detail(contestUuid),
    queryFn: () => getContestDetail(contestUuid),
    enabled: enabled && !!contestUuid,
  });
}

/**
 * Hook to fetch contest leaderboard
 */
export function useContestLeaderboard(contestUuid: string, enabled = true) {
  return useQuery({
    queryKey: contestQueryKeys.leaderboard(contestUuid),
    queryFn: () => getContestLeaderboard(contestUuid),
    enabled: enabled && !!contestUuid,
  });
}

/**
 * Hook to fetch contest attempts (for teacher grading)
 */
export function useContestAttempts(contestUuid: string, enabled = true) {
  return useQuery({
    queryKey: contestQueryKeys.contestAttempts(contestUuid),
    queryFn: () => getContestAttempts(contestUuid),
    enabled: enabled && !!contestUuid,
  });
}

/**
 * Hook to fetch attempt for grading
 */
export function useAttemptForGrading(attemptUuid: string, enabled = true) {
  return useQuery({
    queryKey: contestQueryKeys.attempt(attemptUuid),
    queryFn: () => getAttemptForGrading(attemptUuid),
    enabled: enabled && !!attemptUuid,
  });
}

// ============================================================================
// TEACHER MUTATIONS
// ============================================================================

/**
 * Hook to create contest
 */
export function useCreateContest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: CreateContestRequest) => createContest(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contestQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contestQueryKeys.statistics() });
    },
  });
}

/**
 * Hook to update contest
 */
export function useUpdateContest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ contestUuid, request }: { contestUuid: string; request: UpdateContestRequest }) =>
      updateContest(contestUuid, request),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: contestQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contestQueryKeys.detail(variables.contestUuid) });
    },
  });
}

/**
 * Hook to update contest content
 */
export function useUpdateContestContent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      contestUuid,
      request,
    }: {
      contestUuid: string;
      request: {
        readingPassageIds?: number[];
        listeningPartIds?: number[];
        writingTaskIds?: number[];
        speakingTopicIds?: number[];
        action: 'add' | 'remove' | 'replace';
      };
    }) => updateContestContent(contestUuid, request),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: contestQueryKeys.detail(variables.contestUuid) });
    },
  });
}

/**
 * Hook to publish contest
 */
export function usePublishContest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (contestUuid: string) => publishContest(contestUuid),
    onSuccess: (data, contestUuid) => {
      queryClient.invalidateQueries({ queryKey: contestQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contestQueryKeys.detail(contestUuid) });
      queryClient.invalidateQueries({ queryKey: contestQueryKeys.statistics() });
    },
  });
}

/**
 * Hook to archive contest
 */
export function useArchiveContest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (contestUuid: string) => archiveContest(contestUuid),
    onSuccess: (data, contestUuid) => {
      queryClient.invalidateQueries({ queryKey: contestQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contestQueryKeys.detail(contestUuid) });
      queryClient.invalidateQueries({ queryKey: contestQueryKeys.statistics() });
    },
  });
}

/**
 * Hook to assign students to contest
 */
export function useAssignStudents() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      contestUuid,
      studentIds,
      action = 'add',
    }: {
      contestUuid: string;
      studentIds: number[];
      action?: 'add' | 'remove' | 'replace';
    }) => assignStudentsToContest(contestUuid, studentIds, action),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: contestQueryKeys.detail(variables.contestUuid) });
    },
  });
}

/**
 * Hook to toggle results visibility
 */
export function useToggleResultsVisible() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (contestUuid: string) => toggleResultsVisible(contestUuid),
    onSuccess: (data, contestUuid) => {
      queryClient.invalidateQueries({ queryKey: contestQueryKeys.detail(contestUuid) });
      queryClient.invalidateQueries({ queryKey: contestQueryKeys.lists() });
    },
  });
}

/**
 * Hook to delete contest
 */
export function useDeleteContest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (contestUuid: string) => deleteContest(contestUuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contestQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contestQueryKeys.statistics() });
    },
  });
}

/**
 * Hook to grade writing task
 */
export function useGradeWritingTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      attemptUuid,
      taskId,
      score,
      feedback,
    }: {
      attemptUuid: string;
      taskId: number;
      score: number;
      feedback?: WritingFeedback;
    }) => gradeWritingTask(attemptUuid, taskId, score, feedback),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: contestQueryKeys.attempt(variables.attemptUuid) });
    },
  });
}

// ============================================================================
// AVAILABLE CONTENT QUERIES
// ============================================================================

/**
 * Hook to fetch available reading passages
 */
export function useAvailableReadingPassages(params?: {
  passageNumber?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: contestQueryKeys.availableReading(params),
    queryFn: () => getAvailableReadingPassages(params),
  });
}

/**
 * Hook to fetch available listening parts
 */
export function useAvailableListeningParts(params?: {
  partNumber?: number;
  search?: string;
}) {
  return useQuery({
    queryKey: contestQueryKeys.availableListening(params),
    queryFn: () => getAvailableListeningParts(params),
  });
}

/**
 * Hook to fetch available writing tasks
 */
export function useAvailableWritingTasks(params?: {
  taskType?: 'TASK_1' | 'TASK_2';
  search?: string;
}) {
  return useQuery({
    queryKey: contestQueryKeys.availableWriting(params),
    queryFn: () => getAvailableWritingTasks(params),
  });
}

/**
 * Hook to fetch available speaking topics
 */
export function useAvailableSpeakingTopics(params?: {
  speakingType?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: contestQueryKeys.availableSpeaking(params),
    queryFn: () => getAvailableSpeakingTopics(params),
  });
}

// ============================================================================
// STUDENT QUERIES
// ============================================================================

/**
 * Hook to fetch available contests for student
 */
export function useAvailableContests(params?: {
  status?: 'active' | 'upcoming' | 'completed';
  contestType?: string;
}) {
  return useQuery({
    queryKey: contestQueryKeys.studentAvailable(params),
    queryFn: () => getAvailableContests(params),
  });
}

/**
 * Hook to fetch student's contest attempts
 */
export function useMyContestAttempts() {
  return useQuery({
    queryKey: contestQueryKeys.myAttempts(),
    queryFn: getMyContestAttempts,
  });
}

/**
 * Hook to fetch attempt detail
 */
export function useAttemptDetail(attemptUuid: string, enabled = true) {
  return useQuery({
    queryKey: contestQueryKeys.attempt(attemptUuid),
    queryFn: () => getAttemptDetail(attemptUuid),
    enabled: enabled && !!attemptUuid,
  });
}

/**
 * Hook to fetch section data for attempt
 */
export function useAttemptSectionData(
  attemptUuid: string,
  section: SectionName,
  enabled = true
) {
  return useQuery({
    queryKey: contestQueryKeys.sectionData(attemptUuid, section),
    queryFn: () => getAttemptSectionData(attemptUuid, section),
    enabled: enabled && !!attemptUuid && !!section,
  });
}

/**
 * Hook to fetch attempt result
 */
export function useAttemptResult(attemptUuid: string, enabled = true) {
  return useQuery({
    queryKey: contestQueryKeys.result(attemptUuid),
    queryFn: () => getAttemptResult(attemptUuid),
    enabled: enabled && !!attemptUuid,
  });
}

// ============================================================================
// STUDENT MUTATIONS
// ============================================================================

/**
 * Hook to join contest
 */
export function useJoinContest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      contestUuid,
      accessCode,
    }: {
      contestUuid: string;
      accessCode?: string;
    }) => joinContest(contestUuid, accessCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contestQueryKeys.studentAvailable() });
    },
  });
}

/**
 * Hook to start contest attempt
 */
export function useStartContestAttempt() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (contestUuid: string) => startContestAttempt(contestUuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contestQueryKeys.myAttempts() });
    },
  });
}

/**
 * Hook to submit answer (auto-save)
 */
export function useSubmitContestAnswer() {
  return useMutation({
    mutationFn: ({
      attemptUuid,
      questionId,
      answer,
    }: {
      attemptUuid: string;
      questionId: number;
      answer: string;
    }) => submitContestAnswer(attemptUuid, questionId, answer),
  });
}

/**
 * Hook to submit contest attempt (final submission)
 */
export function useSubmitContestAttempt() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      attemptUuid,
      request,
    }: {
      attemptUuid: string;
      request: {
        answers: Record<string, string>;
        startedAt: Date;
        timeSpentSeconds: number;
      };
    }) => submitContestAttempt(attemptUuid, request),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: contestQueryKeys.attempt(variables.attemptUuid) });
      queryClient.invalidateQueries({ queryKey: contestQueryKeys.myAttempts() });
    },
  });
}

/**
 * Hook to submit writing
 */
export function useSubmitContestWriting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      attemptUuid,
      request,
    }: {
      attemptUuid: string;
      request: {
        writingAnswers: Array<{ taskId: number; answerText: string }>;
        startedAt: Date;
        timeSpentSeconds: number;
      };
    }) => submitContestWriting(attemptUuid, request),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: contestQueryKeys.attempt(variables.attemptUuid) });
      queryClient.invalidateQueries({ queryKey: contestQueryKeys.myAttempts() });
    },
  });
}

/**
 * Hook to move to next section
 */
export function useNextSection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (attemptUuid: string) => nextSection(attemptUuid),
    onSuccess: (data, attemptUuid) => {
      queryClient.invalidateQueries({ queryKey: contestQueryKeys.attempt(attemptUuid) });
    },
  });
}
