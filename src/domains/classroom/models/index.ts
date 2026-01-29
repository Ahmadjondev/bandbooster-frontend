/**
 * Classroom domain models - barrel export
 * ALIGNED WITH ACTUAL API - January 2026
 */

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
} from './domain';
