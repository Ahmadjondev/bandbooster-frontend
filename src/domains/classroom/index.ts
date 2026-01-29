/**
 * Classroom domain - public API
 * ALIGNED WITH ACTUAL API - January 2026
 */

// API client
export { classroomApi } from './api/classroom.api';

// DTOs (contracts)
export type {
  // Enums & Types
  ClassroomStatus,
  EnrollmentStatus,
  AssignmentBundleStatus,
  AssignmentType,
  BundleItemType,
  GradingStatus,
  MessageType,
  GradeAction,
  
  // Classroom DTOs
  ClassroomListItemDTO,
  ClassroomDetailDTO,
  ClassroomListResponseDTO,
  CreateClassroomRequestDTO,
  UpdateClassroomRequestDTO,
  
  // Enrollment DTOs
  EnrollmentDTO,
  EnrollmentListResponseDTO,
  JoinClassroomRequestDTO,
  JoinClassroomResponseDTO,
  CheckInviteCodeResponseDTO,
  
  // Assignment DTOs
  AssignmentBundleListItemDTO,
  AssignmentBundleListResponseDTO,
  AssignmentBundleDetailDTO,
  AssignmentItemDTO,
  AddBundleItemRequestDTO,
  
  // Teacher Feed DTOs
  TeacherFeedResponseDTO,
  FeedClassroomDTO,
  FeedStatsDTO,
  FeedAssignmentDTO,
  FeedMessageDTO,
  FeedItemDTO,
  FeedAssignmentItemPreviewDTO,
  TopSubmissionDTO,
  ClassroomMessageDTO,
  PostMessageRequestDTO,
  UpdateMessageRequestDTO,
  
  // Grading DTOs
  GradingQueueItemDTO,
  GradingQueueResponseDTO,
  SubmissionReviewDTO,
  SubmissionDetailDTO,
  ItemSubmissionDTO,
  GradingStatsDTO,
  
  // Analytics DTOs
  ClassroomAnalyticsDTO,
  DetailedAnalyticsDTO,
  
  // Content Search DTOs
  ReadingPassageSearchResultDTO,
  ListeningPartSearchResultDTO,
  WritingTaskSearchResultDTO,
  SpeakingTopicSearchResultDTO,
  MockExamSearchResultDTO,
  TeacherExamSearchResultDTO,
} from './api/classroom.contract';

// Domain models
export type {
  // Core Models
  StudentSummary,
  TeacherSummary,
  AuthorSummary,
  Classroom,
  ClassroomDetail,
  ClassroomList,
  CreateClassroomData,
  UpdateClassroomData,

  // Enrollment Models
  Enrollment,
  EnrollmentList,
  InviteCodeValidation,
  JoinClassroomResult,
  StudentRoster,
  StudentRosterItem,
  MyEnrolledClassroom,

  // Assignment Models
  ContentObject,
  AssignmentItem,
  AssignmentBundle,
  AssignmentBundleDetail,
  AssignmentBundleList,
  CreateAssignmentBundleData,
  UpdateAssignmentBundleData,
  AddBundleItemData,

  // Student Assignment Models
  StudentAssignment,
  StudentAssignmentList,

  // Feed Models
  FeedClassroom,
  FeedStats,
  TopSubmission,
  FeedAssignmentItemPreview,
  FeedAssignment,
  FeedMessage,
  FeedItem,
  TeacherFeed,
  ClassroomMessage,
  PostMessageData,
  UpdateMessageData,

  // Grading Models
  GradingQueueItem,
  GradingQueue,
  ItemSubmission,
  SubmissionDetail,
  SubmissionReview,
  GradeSubmissionData,
  GradingStats,

  // Analytics Models
  ClassroomAnalytics,
  StudentPerformance,
  AssignmentPerformance,
  DetailedAnalytics,

  // Content Search Models
  ContentSearchResult,
  ContentSearchParams,
} from './models/domain';

// Query hooks
export {
  // Classroom hooks
  useClassrooms,
  useClassroom,
  useClassroomAnalytics,
  useDetailedAnalytics,
  useCreateClassroom,
  useUpdateClassroom,
  useDeleteClassroom,
  useRegenerateInviteCode,

  // Enrollment hooks (Teacher)
  useEnrollments,
  useEnrollment,
  useClassroomRoster,
  useRemoveStudent,
  useUpdateTeacherNotes,

  // Enrollment hooks (Student)
  useCheckInviteCode,
  useMyClassrooms,
  useJoinClassroom,
  useLeaveClassroom,

  // Assignment bundle hooks
  useAssignmentBundles,
  useAssignmentBundle,
  useCreateAssignmentBundle,
  useUpdateAssignmentBundle,
  useDeleteAssignmentBundle,
  useAddBundleItem,
  useRemoveBundleItem,
  usePublishBundle,
  useCloseBundle,

  // Student assignment hooks
  useStudentAssignments,

  // Teacher Feed hooks
  useTeacherFeed,
  usePostMessage,
  useDeleteMessage,

  // Grading hooks
  useGradingQueue,
  useSubmissionReview,
  useGradeSubmission,
  useGradingStats,

  // Content search hooks
  useContentSearch,
  useSearchReadingPassages,
  useSearchListeningParts,
  useSearchWritingTasks,
  useSearchSpeakingTopics,
  useSearchMockExams,
  useSearchTeacherExams,
} from './queries/classroom.queries';

// Components (to be added)
// export { ... } from './components';
