/**
 * Domain models for Classroom module
 * Business-safe, readonly models with camelCase properties
 * ALIGNED WITH ACTUAL API RESPONSES - January 2026
 */

// ============================================================================
// ENUMS & TYPES
// ============================================================================

export type ClassroomStatus = 'ACTIVE' | 'ARCHIVED' | 'INACTIVE';
export type EnrollmentStatus = 'active' | 'inactive' | 'removed';
export type AssignmentBundleStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';
export type AssignmentType = 'HOMEWORK' | 'QUIZ' | 'EXAM' | 'PRACTICE' | 'REMEDIAL';
export type BundleItemType = 'MOCK_EXAM' | 'TEACHER_EXAM' | 'WRITING_TASK' | 'SPEAKING_TOPIC' | 'READING_PASSAGE' | 'LISTENING_PART';
export type GradingStatus = 'pending' | 'graded' | 'reviewed';
export type MessageType = 'MESSAGE' | 'ANNOUNCEMENT' | 'REMINDER' | 'UPDATE';
export type GradeAction = 'approve' | 'override' | 'return';

// ============================================================================
// CORE DOMAIN MODELS
// ============================================================================

/** Student summary within classroom context */
export interface StudentSummary {
  readonly id: number;
  readonly uuid: string;
  readonly username: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly fullName: string;
  readonly email: string;
  readonly avatarUrl?: string;
}

/** Teacher summary */
export interface TeacherSummary {
  readonly id: number;
  readonly username: string;
  readonly fullName: string;
  readonly email?: string;
  readonly avatarUrl?: string;
}

/** Author summary (simplified for feed items) */
export interface AuthorSummary {
  readonly id: number;
  readonly name: string;
}

/** Classroom domain model (from list endpoint) */
export interface Classroom {
  readonly id: number;
  readonly uuid: string;
  readonly name: string;
  readonly description?: string;
  readonly inviteCode: string;
  readonly inviteEnabled: boolean;
  readonly status: ClassroomStatus;
  readonly teacherName: string;
  readonly studentCount: number;
  readonly assignmentCount: number;
  readonly pendingGrading: number;
  readonly targetBand?: number;
  readonly createdAt: Date;
}

/** Classroom with full details (from detail endpoint) */
export interface ClassroomDetail {
  readonly id: number;
  readonly uuid: string;
  readonly name: string;
  readonly description?: string;
  readonly inviteCode: string;
  readonly inviteEnabled: boolean;
  readonly status: ClassroomStatus;
  readonly teacher: TeacherSummary;
  readonly studentCount: number;
  readonly maxStudents?: number;
  readonly isFull: boolean;
  readonly magicLink: string;
  readonly assignmentCount: number;
  readonly activeAssignments: number;
  readonly targetBand?: number;
  readonly enrollments: Enrollment[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/** Paginated classroom list */
export interface ClassroomList {
  readonly count: number;
  readonly totalPages: number;
  readonly page: number;
  readonly pageSize: number;
  readonly hasNext: boolean;
  readonly hasPrevious: boolean;
  readonly classrooms: Classroom[];
}

/** Create classroom data */
export interface CreateClassroomData {
  name: string;
  description?: string;
  maxStudents?: number;
  targetBand?: number;
  inviteEnabled?: boolean;
}

/** Update classroom data */
export interface UpdateClassroomData {
  name?: string;
  description?: string;
  status?: ClassroomStatus;
  maxStudents?: number;
  targetBand?: number;
  inviteEnabled?: boolean;
}

// ============================================================================
// ENROLLMENT MODELS
// ============================================================================

/** Enrollment domain model */
export interface Enrollment {
  readonly uuid: string;
  readonly student: StudentSummary;
  readonly classroom: {
    readonly uuid: string;
    readonly name: string;
  };
  readonly status: EnrollmentStatus;
  readonly teacherNotes?: string;
  readonly enrolledAt: Date;
  readonly lastActivityAt?: Date;
  readonly xp?: number;
  readonly currentBand?: number;
}

/** Student roster item with performance data */
export interface StudentRosterItem {
  readonly uuid: string;
  readonly student: StudentSummary;
  readonly status: EnrollmentStatus;
  readonly enrolledAt: Date;
  readonly lastActivityAt?: Date;
  readonly xp?: number;
  readonly currentBand?: number;
  readonly assignmentsCompleted?: number;
  readonly teacherNotes?: string;
}

/** Student roster (paginated) */
export interface StudentRoster {
  readonly count: number;
  readonly totalPages?: number;
  readonly page?: number;
  readonly pageSize?: number;
  readonly hasNext: boolean;
  readonly hasPrevious: boolean;
  readonly students: StudentRosterItem[];
}

/** Paginated enrollment list */
export interface EnrollmentList {
  readonly count: number;
  readonly hasNext: boolean;
  readonly hasPrevious: boolean;
  readonly enrollments: Enrollment[];
}

/** Invite code validation result */
export interface InviteCodeValidation {
  readonly isValid: boolean;
  readonly classroom?: {
    readonly uuid: string;
    readonly name: string;
    readonly teacherName: string;
    readonly studentCount: number;
  };
}

/** Join classroom result */
export interface JoinClassroomResult {
  readonly enrollment: Enrollment;
  readonly classroom: ClassroomDetail;
}

/** My enrolled classroom (for students) */
export interface MyEnrolledClassroom {
  readonly enrollment: Enrollment;
  readonly classroom: Classroom;
}

// ============================================================================
// CONTENT MODELS
// ============================================================================

/** Content object in assignment item */
export interface ContentObject {
  readonly id: number;
  readonly uuid?: string;
  readonly title: string;
  readonly examType?: string;
  readonly examTypeDisplay?: string;
  readonly difficultyLevel?: string;
  readonly difficulty?: string;
  readonly passageNumber?: number;
}

// ============================================================================
// ASSIGNMENT MODELS
// ============================================================================

/** Assignment item */
export interface AssignmentItem {
  readonly id: number;
  readonly uuid: string;
  readonly itemType: BundleItemType;
  readonly contentType: BundleItemType;
  readonly contentId: number;
  readonly contentTitle: string;
  readonly contentObject?: ContentObject;
  readonly itemInstructions?: string;
  readonly order: number;
  readonly points: number;
  readonly isRequired: boolean;
  readonly createdAt: Date;
}

/** Assignment bundle (from list endpoint) */
export interface AssignmentBundle {
  readonly id: number;
  readonly uuid: string;
  readonly title: string;
  readonly classroomName: string;
  readonly assignmentType: AssignmentType;
  readonly status: AssignmentBundleStatus;
  readonly dueDate?: Date;
  readonly totalItems: number;
  readonly isAvailable: boolean;
  readonly isOverdue: boolean;
  readonly createdAt: Date;
}

/** Assignment bundle with full details */
export interface AssignmentBundleDetail {
  readonly id: number;
  readonly uuid: string;
  readonly classroom: Classroom;
  readonly createdBy: TeacherSummary;
  readonly title: string;
  readonly description?: string;
  readonly assignmentType: AssignmentType;
  readonly teacherInstructions?: string;
  readonly availableFrom?: Date;
  readonly dueDate?: Date;
  readonly allowLateSubmission: boolean;
  readonly timeLimitMinutes?: number;
  readonly targetMinBand?: number;
  readonly targetMaxBand?: number;
  readonly status: AssignmentBundleStatus;
  readonly requireTeacherApproval: boolean;
  readonly autoReleaseResults: boolean;
  readonly allowMultipleAttempts: boolean;
  readonly maxAttempts: number;
  readonly items: AssignmentItem[];
  readonly totalItems: number;
  readonly isAvailable: boolean;
  readonly isOverdue: boolean;
  readonly submissionCount: number;
  readonly pendingReviewCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly publishedAt?: Date;
}

/** Paginated assignment bundle list */
export interface AssignmentBundleList {
  readonly count: number;
  readonly totalPages: number;
  readonly page: number;
  readonly pageSize: number;
  readonly hasNext: boolean;
  readonly hasPrevious: boolean;
  readonly bundles: AssignmentBundle[];
}

/** Create assignment bundle data */
export interface CreateAssignmentBundleData {
  classroomUuid: string;
  title: string;
  description?: string;
  assignmentType?: AssignmentType;
  teacherInstructions?: string;
  availableFrom?: Date;
  dueDate?: Date;
  allowLateSubmission?: boolean;
  timeLimitMinutes?: number;
  targetMinBand?: number;
  targetMaxBand?: number;
  requireTeacherApproval?: boolean;
  autoReleaseResults?: boolean;
  allowMultipleAttempts?: boolean;
  maxAttempts?: number;
}

/** Update assignment bundle data */
export interface UpdateAssignmentBundleData {
  title?: string;
  description?: string;
  assignmentType?: AssignmentType;
  teacherInstructions?: string;
  availableFrom?: Date;
  dueDate?: Date;
  allowLateSubmission?: boolean;
  timeLimitMinutes?: number;
  targetMinBand?: number;
  targetMaxBand?: number;
  requireTeacherApproval?: boolean;
  autoReleaseResults?: boolean;
  allowMultipleAttempts?: boolean;
  maxAttempts?: number;
}

/** Add item to bundle data */
export interface AddBundleItemData {
  itemType: BundleItemType;
  contentId: number;
  itemInstructions?: string;
  order?: number;
  points?: number;
  isRequired?: boolean;
}

// ============================================================================
// STUDENT ASSIGNMENT MODELS
// ============================================================================

export type StudentAssignmentStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'COMPLETED';

/** Student's assignment submission view */
export interface StudentAssignment {
  readonly uuid: string;
  readonly bundle: {
    readonly uuid: string;
    readonly title: string;
    readonly dueDate?: Date;
  };
  readonly status: StudentAssignmentStatus;
  readonly bandScore?: number;
  readonly maxScore?: number;
  readonly startedAt?: Date;
  readonly submittedAt?: Date;
  readonly gradedAt?: Date;
  readonly xpEarned?: number;
}

/** Student assignments list */
export interface StudentAssignmentList {
  readonly count: number;
  readonly totalPages?: number;
  readonly page?: number;
  readonly pageSize?: number;
  readonly hasNext: boolean;
  readonly hasPrevious: boolean;
  readonly assignments: StudentAssignment[];
}

// ============================================================================
// FEED MODELS
// ============================================================================

/** Feed classroom summary */
export interface FeedClassroom {
  readonly id: number;
  readonly uuid: string;
  readonly name: string;
  readonly description?: string;
  readonly status: ClassroomStatus;
  readonly inviteCode: string;
  readonly inviteEnabled: boolean;
  readonly targetBand?: number;
  readonly studentCount: number;
}

/** Feed stats */
export interface FeedStats {
  readonly totalStudents: number;
  readonly totalAssignments: number;
  readonly pendingGrading: number;
  readonly averageCompletionRate: number;
  readonly publishedAssignments: number;
  readonly draftAssignments: number;
  readonly recentSubmissions: number;
}

/** Top submission in feed */
export interface TopSubmission {
  readonly studentId: number;
  readonly studentName: string;
  readonly bandScore?: number;
  readonly submittedAt: Date;
}

/** Feed assignment item preview */
export interface FeedAssignmentItemPreview {
  readonly id: number;
  readonly contentType: BundleItemType;
  readonly contentTitle: string;
  readonly points: number;
}

/** Feed assignment - the main feed item type */
export interface FeedAssignment {
  readonly id: number;
  readonly uuid: string;
  readonly type: 'ASSIGNMENT';
  readonly title: string;
  readonly description?: string;
  readonly assignmentType: AssignmentType;
  readonly itemCount: number;
  readonly dueDate?: Date;
  readonly availableFrom?: Date;
  readonly status: AssignmentBundleStatus;
  readonly isAvailable: boolean;
  readonly isOverdue: boolean;
  readonly createdAt: Date;
  readonly publishedAt?: Date;
  readonly createdBy: AuthorSummary;
  // Progress stats
  readonly assignedCount: number;
  readonly completedCount: number;
  readonly pendingReviewCount: number;
  readonly submittedCount: number;
  readonly completionPercentage: number;
  readonly averageBand?: number;
  // Submissions preview
  readonly topSubmissions: TopSubmission[];
  readonly totalSubmissions: number;
  readonly hasMoreSubmissions: boolean;
  // Items preview
  readonly items: FeedAssignmentItemPreview[];
}

/** Feed message - messages/announcements posted in classroom feed */
export interface FeedMessage {
  readonly id: number;
  readonly uuid: string;
  readonly type: 'MESSAGE';
  readonly messageType: MessageType;
  readonly content: string;
  readonly isPinned: boolean;
  readonly author: AuthorSummary;
  readonly createdAt: Date;
}

/** Union type for feed items */
export type FeedItem = FeedAssignment | FeedMessage;

/** Classroom message */
export interface ClassroomMessage {
  readonly id: number;
  readonly uuid: string;
  readonly classroomId: number;
  readonly author: TeacherSummary;
  readonly messageType: MessageType;
  readonly content: string;
  readonly isPinned: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/** Teacher feed response */
export interface TeacherFeed {
  readonly classroom: FeedClassroom;
  readonly items: FeedItem[];
  readonly stats: FeedStats;
  readonly totalCount: number;
}

/** Post message data */
export interface PostMessageData {
  content: string;
  messageType?: MessageType;
  isPinned?: boolean;
}

/** Update message data */
export interface UpdateMessageData {
  isPinned?: boolean;
}

// ============================================================================
// GRADING MODELS
// ============================================================================

/** Grading queue item */
export interface GradingQueueItem {
  readonly uuid: string;
  readonly student: StudentSummary;
  readonly bundle: {
    readonly uuid: string;
    readonly title: string;
  };
  readonly assignmentType: AssignmentType;
  readonly submittedAt: Date;
  readonly status: string;
  readonly bandScore?: number;
  readonly aiScore?: number;
  readonly itemCount: number;
}

/** Grading queue */
export interface GradingQueue {
  readonly count: number;
  readonly items: GradingQueueItem[];
}

/** Item submission */
export interface ItemSubmission {
  readonly uuid: string;
  readonly bundleItem: AssignmentItem;
  readonly status: string;
  readonly score?: number;
  readonly maxScore: number;
  readonly aiScore?: number;
  readonly aiFeedback?: string;
  readonly answers?: Record<string, unknown>;
  readonly submittedAt?: Date;
}

/** Submission detail for grading */
export interface SubmissionDetail {
  readonly uuid: string;
  readonly student: StudentSummary;
  readonly bundle: AssignmentBundleDetail;
  readonly status: string;
  readonly bandScore?: number;
  readonly aiScore?: number;
  readonly aiFeedback?: string;
  readonly teacherFeedback?: string;
  readonly startedAt?: Date;
  readonly submittedAt?: Date;
  readonly gradedAt?: Date;
  readonly timeSpentSeconds?: number;
  readonly itemSubmissions: ItemSubmission[];
}

/** Question type accuracy */
export interface QuestionTypeAccuracy {
  readonly correct: number;
  readonly total: number;
  readonly percentage: number;
}

/** Submission review with analysis */
export interface SubmissionReview {
  readonly submission: SubmissionDetail;
  readonly analysis: {
    readonly questionTypeAccuracy: Record<string, QuestionTypeAccuracy>;
    readonly strengths: string[];
    readonly weaknesses: string[];
    readonly timePerItem: Record<string, number>;
  };
}

/** Grade submission data */
export interface GradeSubmissionData {
  action: GradeAction;
  score?: number;
  feedback?: string;
}

/** Grading statistics */
export interface GradingStats {
  readonly pendingCount: number;
  readonly gradedToday: number;
  readonly avgGradeTimeMinutes: number;
  readonly overrideRate: number;
  readonly totalGraded: number;
}

// ============================================================================
// ANALYTICS MODELS
// ============================================================================

/** Classroom analytics */
export interface ClassroomAnalytics {
  readonly totalStudents: number;
  readonly activeStudents: number;
  readonly averageBand: number | null;
  readonly assignmentsPublished: number;
  readonly pendingReviews: number;
  readonly completionRate: number;
  readonly sectionAverages: {
    readonly listening: number;
    readonly reading: number;
    readonly writing: number;
    readonly speaking: number;
  };
}

/** Student performance in analytics */
export interface StudentPerformance {
  readonly student: StudentSummary;
  readonly assignmentsCompleted: number;
  readonly averageScore: number;
  readonly lastActivity: Date;
  readonly currentBand?: number;
}

/** Assignment performance in analytics */
export interface AssignmentPerformance {
  readonly uuid: string;
  readonly title: string;
  readonly completionRate: number;
  readonly averageScore: number;
}

/** Detailed classroom analytics */
export interface DetailedAnalytics extends ClassroomAnalytics {
  readonly students: StudentPerformance[];
  readonly assignments: AssignmentPerformance[];
  readonly topPerformers: StudentPerformance[];
  readonly strugglingStudents: StudentPerformance[];
}

// ============================================================================
// CONTENT SEARCH MODELS
// ============================================================================

/** Content search result */
export interface ContentSearchResult {
  readonly id: number;
  readonly uuid?: string;
  readonly title: string;
  readonly contentType: BundleItemType;
  readonly difficulty?: string;
  readonly partNumber?: number;
  readonly passageNumber?: number;
  readonly examType?: string;
  readonly examTypeDisplay?: string;
}

/** Content search params */
export interface ContentSearchParams {
  query?: string;
  type?: string;
  difficulty?: string;
  part?: number;
}
