/**
 * TanStack Query hooks for Classroom module
 * UPDATED: Aligned with actual API responses - January 2026
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { classroomApi } from '../api/classroom.api';
import { classroomKeys } from '@/store/queryKeys/classroom.keys';
import type {
  ClassroomDetail,
  CreateClassroomData,
  UpdateClassroomData,
  Enrollment,
  JoinClassroomResult,
  AssignmentBundleDetail,
  CreateAssignmentBundleData,
  UpdateAssignmentBundleData,
  AddBundleItemData,
  AssignmentItem,
  PostMessageData,
  ClassroomMessage,
  GradeSubmissionData,
  BundleItemType,
  ContentSearchResult,
} from '../models/domain';
import type {
  ClassroomListParams,
  EnrollmentListParams,
  AssignmentBundleListParams,
  GradingQueueParams,
} from '@/store/queryKeys/classroom.keys';

// ============================================================================
// CLASSROOM MANAGEMENT HOOKS
// ============================================================================

interface UseClassroomsOptions {
  params?: ClassroomListParams;
  enabled?: boolean;
}

/** List teacher's classrooms */
export function useClassrooms(options: UseClassroomsOptions = {}) {
  const { params, enabled = true } = options;

  return useQuery({
    queryKey: classroomKeys.classroomList(params),
    queryFn: () => classroomApi.listClassrooms(params),
    enabled,
    staleTime: 2 * 60 * 1000,
  });
}

interface UseClassroomOptions {
  enabled?: boolean;
}

/** Get classroom details */
export function useClassroom(uuid: string, options: UseClassroomOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: classroomKeys.classroomDetail(uuid),
    queryFn: () => classroomApi.getClassroom(uuid),
    enabled: enabled && !!uuid,
    staleTime: 2 * 60 * 1000,
  });
}

interface UseClassroomAnalyticsOptions {
  enabled?: boolean;
}

/** Get classroom analytics */
export function useClassroomAnalytics(uuid: string, options: UseClassroomAnalyticsOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: classroomKeys.classroomAnalytics(uuid),
    queryFn: () => classroomApi.getClassroomAnalytics(uuid),
    enabled: enabled && !!uuid,
    staleTime: 5 * 60 * 1000,
  });
}

/** Get detailed classroom analytics */
export function useDetailedAnalytics(uuid: string, options: UseClassroomAnalyticsOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: classroomKeys.classroomDetailedAnalytics(uuid),
    queryFn: () => classroomApi.getDetailedAnalytics(uuid),
    enabled: enabled && !!uuid,
    staleTime: 5 * 60 * 1000,
  });
}

interface UseCreateClassroomOptions {
  onSuccess?: (classroom: ClassroomDetail) => void;
  onError?: (error: Error) => void;
}

/** Create a new classroom */
export function useCreateClassroom(options: UseCreateClassroomOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClassroomData) => classroomApi.createClassroom(data),
    onSuccess: (classroom) => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.classrooms() });
      options.onSuccess?.(classroom);
    },
    onError: options.onError,
  });
}

interface UseUpdateClassroomOptions {
  onSuccess?: (classroom: ClassroomDetail) => void;
  onError?: (error: Error) => void;
}

/** Update a classroom */
export function useUpdateClassroom(options: UseUpdateClassroomOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: UpdateClassroomData }) =>
      classroomApi.updateClassroom(uuid, data),
    onSuccess: (classroom) => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.classroomDetail(classroom.uuid) });
      queryClient.invalidateQueries({ queryKey: classroomKeys.classrooms() });
      options.onSuccess?.(classroom);
    },
    onError: options.onError,
  });
}

interface UseDeleteClassroomOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/** Delete a classroom */
export function useDeleteClassroom(options: UseDeleteClassroomOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => classroomApi.deleteClassroom(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.classrooms() });
      options.onSuccess?.();
    },
    onError: options.onError,
  });
}

interface UseRegenerateInviteCodeOptions {
  onSuccess?: (inviteCode: string) => void;
  onError?: (error: Error) => void;
}

/** Regenerate classroom invite code */
export function useRegenerateInviteCode(options: UseRegenerateInviteCodeOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => classroomApi.regenerateInviteCode(uuid),
    onSuccess: (inviteCode, uuid) => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.classroomDetail(uuid) });
      options.onSuccess?.(inviteCode);
    },
    onError: options.onError,
  });
}

// ============================================================================
// ENROLLMENT HOOKS (Teacher)
// ============================================================================

interface UseEnrollmentsOptions {
  params?: EnrollmentListParams;
  enabled?: boolean;
}

/** List enrollments */
export function useEnrollments(options: UseEnrollmentsOptions = {}) {
  const { params, enabled = true } = options;

  return useQuery({
    queryKey: classroomKeys.enrollmentList(params),
    queryFn: () => classroomApi.listEnrollments(params),
    enabled,
    staleTime: 2 * 60 * 1000,
  });
}

/** Get enrollment details */
export function useEnrollment(uuid: string, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: classroomKeys.enrollmentDetail(uuid),
    queryFn: () => classroomApi.getEnrollment(uuid),
    enabled: enabled && !!uuid,
    staleTime: 2 * 60 * 1000,
  });
}

/** Get classroom roster */
export function useClassroomRoster(classroomUuid: string, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: classroomKeys.classroomRoster(classroomUuid),
    queryFn: () => classroomApi.getClassroomRoster(classroomUuid),
    enabled: enabled && !!classroomUuid,
    staleTime: 2 * 60 * 1000,
  });
}

interface UseRemoveStudentOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/** Remove student from classroom */
export function useRemoveStudent(options: UseRemoveStudentOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ classroomUuid, studentUuid }: { classroomUuid: string; studentUuid: string }) =>
      classroomApi.removeStudent(classroomUuid, studentUuid),
    onSuccess: (_, { classroomUuid }) => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.classroomRoster(classroomUuid) });
      queryClient.invalidateQueries({ queryKey: classroomKeys.classroomDetail(classroomUuid) });
      options.onSuccess?.();
    },
    onError: options.onError,
  });
}

interface UseUpdateTeacherNotesOptions {
  onSuccess?: (enrollment: Enrollment) => void;
  onError?: (error: Error) => void;
}

/** Update teacher notes for a student */
export function useUpdateTeacherNotes(options: UseUpdateTeacherNotesOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ enrollmentUuid, notes }: { enrollmentUuid: string; notes: string }) =>
      classroomApi.updateTeacherNotes(enrollmentUuid, notes),
    onSuccess: (enrollment) => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.enrollmentDetail(enrollment.uuid) });
      options.onSuccess?.(enrollment);
    },
    onError: options.onError,
  });
}

// ============================================================================
// ENROLLMENT HOOKS (Student)
// ============================================================================

/** Check invite code validity */
export function useCheckInviteCode(inviteCode: string, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: classroomKeys.inviteCode(inviteCode),
    queryFn: () => classroomApi.checkInviteCode(inviteCode),
    enabled: enabled && !!inviteCode,
    staleTime: 30 * 1000,
  });
}

/** Get student's enrolled classrooms */
export function useMyClassrooms(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: classroomKeys.myClassrooms(),
    queryFn: () => classroomApi.getMyClassrooms(),
    enabled,
    staleTime: 2 * 60 * 1000,
  });
}

interface UseJoinClassroomOptions {
  onSuccess?: (result: JoinClassroomResult) => void;
  onError?: (error: Error) => void;
}

/** Join a classroom via invite code */
export function useJoinClassroom(options: UseJoinClassroomOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteCode: string) => classroomApi.joinClassroom(inviteCode),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.myClassrooms() });
      options.onSuccess?.(result);
    },
    onError: options.onError,
  });
}

interface UseLeaveClassroomOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/** Leave a classroom */
export function useLeaveClassroom(options: UseLeaveClassroomOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enrollmentUuid: string) => classroomApi.leaveClassroom(enrollmentUuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.myClassrooms() });
      options.onSuccess?.();
    },
    onError: options.onError,
  });
}

// ============================================================================
// ASSIGNMENT BUNDLE HOOKS
// ============================================================================

interface UseAssignmentBundlesOptions {
  params?: AssignmentBundleListParams;
  enabled?: boolean;
}

/** List assignment bundles */
export function useAssignmentBundles(options: UseAssignmentBundlesOptions = {}) {
  const { params, enabled = true } = options;

  return useQuery({
    queryKey: classroomKeys.bundleList(params),
    queryFn: () => classroomApi.listAssignmentBundles(params),
    enabled,
    staleTime: 2 * 60 * 1000,
  });
}

/** Get assignment bundle details */
export function useAssignmentBundle(uuid: string, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: classroomKeys.bundleDetail(uuid),
    queryFn: () => classroomApi.getAssignmentBundle(uuid),
    enabled: enabled && !!uuid,
    staleTime: 2 * 60 * 1000,
  });
}

interface UseCreateAssignmentBundleOptions {
  onSuccess?: (bundle: AssignmentBundleDetail) => void;
  onError?: (error: Error) => void;
}

/** Create an assignment bundle */
export function useCreateAssignmentBundle(options: UseCreateAssignmentBundleOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAssignmentBundleData) => classroomApi.createAssignmentBundle(data),
    onSuccess: (bundle) => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.bundles() });
      queryClient.invalidateQueries({ queryKey: classroomKeys.feed() });
      options.onSuccess?.(bundle);
    },
    onError: options.onError,
  });
}

interface UseUpdateAssignmentBundleOptions {
  onSuccess?: (bundle: AssignmentBundleDetail) => void;
  onError?: (error: Error) => void;
}

/** Update an assignment bundle */
export function useUpdateAssignmentBundle(options: UseUpdateAssignmentBundleOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: UpdateAssignmentBundleData }) =>
      classroomApi.updateAssignmentBundle(uuid, data),
    onSuccess: (bundle) => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.bundleDetail(bundle.uuid) });
      queryClient.invalidateQueries({ queryKey: classroomKeys.bundles() });
      queryClient.invalidateQueries({ queryKey: classroomKeys.feed() });
      options.onSuccess?.(bundle);
    },
    onError: options.onError,
  });
}

interface UseDeleteAssignmentBundleOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/** Delete an assignment bundle */
export function useDeleteAssignmentBundle(options: UseDeleteAssignmentBundleOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => classroomApi.deleteAssignmentBundle(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.bundles() });
      queryClient.invalidateQueries({ queryKey: classroomKeys.feed() });
      options.onSuccess?.();
    },
    onError: options.onError,
  });
}

interface UseAddBundleItemOptions {
  onSuccess?: (item: AssignmentItem) => void;
  onError?: (error: Error) => void;
}

/** Add item to assignment bundle */
export function useAddBundleItem(options: UseAddBundleItemOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bundleUuid, data }: { bundleUuid: string; data: AddBundleItemData }) =>
      classroomApi.addItemToBundle(bundleUuid, data),
    onSuccess: (item, { bundleUuid }) => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.bundleDetail(bundleUuid) });
      options.onSuccess?.(item);
    },
    onError: options.onError,
  });
}

interface UseRemoveBundleItemOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/** Remove item from assignment bundle */
export function useRemoveBundleItem(options: UseRemoveBundleItemOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bundleUuid, itemId }: { bundleUuid: string; itemId: string }) =>
      classroomApi.removeItemFromBundle(bundleUuid, itemId),
    onSuccess: (_, { bundleUuid }) => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.bundleDetail(bundleUuid) });
      options.onSuccess?.();
    },
    onError: options.onError,
  });
}

interface UsePublishBundleOptions {
  onSuccess?: (bundle: AssignmentBundleDetail) => void;
  onError?: (error: Error) => void;
}

/** Publish an assignment bundle */
export function usePublishBundle(options: UsePublishBundleOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => classroomApi.publishBundle(uuid),
    onSuccess: (bundle) => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.bundleDetail(bundle.uuid) });
      queryClient.invalidateQueries({ queryKey: classroomKeys.bundles() });
      queryClient.invalidateQueries({ queryKey: classroomKeys.feed() });
      options.onSuccess?.(bundle);
    },
    onError: options.onError,
  });
}

interface UseCloseBundleOptions {
  onSuccess?: (bundle: AssignmentBundleDetail) => void;
  onError?: (error: Error) => void;
}

/** Close an assignment bundle */
export function useCloseBundle(options: UseCloseBundleOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => classroomApi.closeBundle(uuid),
    onSuccess: (bundle) => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.bundleDetail(bundle.uuid) });
      queryClient.invalidateQueries({ queryKey: classroomKeys.bundles() });
      queryClient.invalidateQueries({ queryKey: classroomKeys.feed() });
      options.onSuccess?.(bundle);
    },
    onError: options.onError,
  });
}

// ============================================================================
// STUDENT ASSIGNMENT HOOKS
// ============================================================================

/** Get student's assignments */
export function useStudentAssignments(params?: { page?: number; pageSize?: number }, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: classroomKeys.studentAssignmentList(params),
    queryFn: () => classroomApi.getStudentAssignments(params),
    enabled,
    staleTime: 2 * 60 * 1000,
  });
}

// ============================================================================
// TEACHER FEED HOOKS
// ============================================================================

/** Get teacher's classroom feed */
export function useTeacherFeed(classroomUuid: string, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: classroomKeys.teacherFeed(classroomUuid),
    queryFn: () => classroomApi.getTeacherFeed(classroomUuid),
    enabled: enabled && !!classroomUuid,
    staleTime: 30 * 1000, // 30 seconds - feed should be fresh
  });
}

interface UsePostMessageOptions {
  onSuccess?: (message: ClassroomMessage) => void;
  onError?: (error: Error) => void;
}

/** Post message to classroom feed */
export function usePostMessage(options: UsePostMessageOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ classroomUuid, data }: { classroomUuid: string; data: PostMessageData }) =>
      classroomApi.postMessage(classroomUuid, data),
    onSuccess: (message, { classroomUuid }) => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.teacherFeed(classroomUuid) });
      options.onSuccess?.(message);
    },
    onError: options.onError,
  });
}

interface UseDeleteMessageOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/** Delete message from classroom */
export function useDeleteMessage(options: UseDeleteMessageOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ classroomUuid, messageUuid }: { classroomUuid: string; messageUuid: string }) =>
      classroomApi.deleteMessage(classroomUuid, messageUuid),
    onSuccess: (_, { classroomUuid }) => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.teacherFeed(classroomUuid) });
      options.onSuccess?.();
    },
    onError: options.onError,
  });
}

// ============================================================================
// GRADING HOOKS
// ============================================================================

interface UseGradingQueueOptions {
  params?: GradingQueueParams;
  enabled?: boolean;
}

/** Get grading queue */
export function useGradingQueue(options: UseGradingQueueOptions = {}) {
  const { params, enabled = true } = options;

  return useQuery({
    queryKey: classroomKeys.gradingQueue(params),
    queryFn: () => classroomApi.getGradingQueue(params),
    enabled,
    staleTime: 60 * 1000,
  });
}

/** Get submission for review */
export function useSubmissionReview(submissionUuid: string, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: classroomKeys.submissionReview(submissionUuid),
    queryFn: () => classroomApi.getSubmissionReview(submissionUuid),
    enabled: enabled && !!submissionUuid,
    staleTime: 2 * 60 * 1000,
  });
}

interface UseGradeSubmissionOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/** Grade a submission */
export function useGradeSubmission(options: UseGradeSubmissionOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ submissionUuid, data }: { submissionUuid: string; data: GradeSubmissionData }) =>
      classroomApi.gradeSubmission(submissionUuid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.grading() });
      options.onSuccess?.();
    },
    onError: options.onError,
  });
}

/** Get grading statistics */
export function useGradingStats(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: classroomKeys.gradingStats(),
    queryFn: () => classroomApi.getGradingStats(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// CONTENT SEARCH HOOKS
// ============================================================================

interface ContentSearchParams {
  contentType: BundleItemType;
  query?: string;
  difficulty?: string;
}

interface UseContentSearchOptions {
  enabled?: boolean;
}

/** Search for content to add to assignments */
export function useContentSearch(params: ContentSearchParams, options: UseContentSearchOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: classroomKeys.contentSearch(params),
    queryFn: () => classroomApi.searchContent(params.contentType, params.query, params.difficulty),
    enabled: enabled && !!params.contentType,
    staleTime: 5 * 60 * 1000,
  });
}

/** Search for reading passages */
export function useSearchReadingPassages(query?: string, difficulty?: string, options: UseContentSearchOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: classroomKeys.contentSearch({ type: 'READING_PASSAGE', query, difficulty }),
    queryFn: () => classroomApi.searchReadingPassages(query, difficulty),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

/** Search for listening parts */
export function useSearchListeningParts(query?: string, part?: number, options: UseContentSearchOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: classroomKeys.contentSearch({ type: 'LISTENING_PART', query, part }),
    queryFn: () => classroomApi.searchListeningParts(query, undefined, part),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

/** Search for writing tasks */
export function useSearchWritingTasks(query?: string, taskType?: string, options: UseContentSearchOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: classroomKeys.contentSearch({ type: 'WRITING_TASK', query, taskType }),
    queryFn: () => classroomApi.searchWritingTasks(query, taskType),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

/** Search for speaking topics */
export function useSearchSpeakingTopics(query?: string, part?: number, options: UseContentSearchOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: classroomKeys.contentSearch({ type: 'SPEAKING_TOPIC', query, part }),
    queryFn: () => classroomApi.searchSpeakingTopics(query, part),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

/** Search for mock exams */
export function useSearchMockExams(query?: string, difficulty?: string, options: UseContentSearchOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: classroomKeys.contentSearch({ type: 'MOCK_EXAM', query, difficulty }),
    queryFn: () => classroomApi.searchMockExams(query, difficulty),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

/** Search for teacher exams */
export function useSearchTeacherExams(query?: string, options: UseContentSearchOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: classroomKeys.contentSearch({ type: 'TEACHER_EXAM', query }),
    queryFn: () => classroomApi.searchTeacherExams(query),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
