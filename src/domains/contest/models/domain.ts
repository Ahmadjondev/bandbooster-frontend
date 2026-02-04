/**
 * Contest Domain Models
 * Clean, immutable domain objects with camelCase naming
 * These models are used throughout the UI layer
 */

// ============= Enums (re-exported for convenience) =============

export type ContestType = 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING' | 'FULL_TEST';
export type ContestDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
export type ContestStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
export type AttemptStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED' | 'ABANDONED';
export type SectionName = 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING';

// ============= Common Models =============

export interface Student {
  readonly id: number;
  readonly username: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly fullName: string;
}

// ============= Contest Models =============

export interface ContestListItem {
  readonly uuid: string;
  readonly title: string;
  readonly description: string;
  readonly contestType: ContestType;
  readonly difficulty: ContestDifficulty;
  readonly status: ContestStatus;
  readonly startTime: Date;
  readonly endTime: Date;
  readonly durationMinutes: number | null;
  readonly isPublic: boolean;
  readonly hasAccessCode: boolean;
  readonly totalQuestions: number;
  readonly participantCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly createdBy?: {
    readonly id: number;
    readonly username: string;
    readonly firstName: string;
    readonly lastName: string;
  };
  // Teacher-specific
  readonly resultsVisible?: boolean;
  readonly autoGradeReading?: boolean;
  readonly autoGradeListening?: boolean;
}

export interface ContestDetail extends ContestListItem {
  readonly readingPassages?: ReadingPassageContent[];
  readonly listeningParts?: ListeningPartContent[];
  readonly writingTasks?: WritingTaskContent[];
  readonly speakingTopics?: SpeakingTopicContent[];
  readonly assignedStudents?: Student[];
}

// ============= Content Selection Models =============

export interface ReadingPassageContent {
  readonly id: number;
  readonly title: string;
  readonly passageNumber: number;
  readonly wordCount: number;
  readonly questionCount: number;
  readonly difficulty: string;
}

export interface ListeningPartContent {
  readonly id: number;
  readonly title: string;
  readonly partNumber: number;
  readonly durationSeconds: number;
  readonly questionCount: number;
}

export interface WritingTaskContent {
  readonly id: number;
  readonly taskType: 'TASK_1' | 'TASK_2';
  readonly taskTypeDisplay: string;
  readonly promptPreview: string;
  readonly chartType?: string;
  readonly minWords: number;
}

export interface SpeakingTopicContent {
  readonly id: number;
  readonly speakingType: string;
  readonly topicName: string;
  readonly partNumber: number;
  readonly questionCount: number;
}

// ============= Statistics Models =============

export interface ContestStatistics {
  readonly totalContests: number;
  readonly activeContests: number;
  readonly scheduledContests: number;
  readonly completedContests: number;
  readonly draftContests: number;
  readonly totalAttempts: number;
  readonly submittedAttempts: number;
}

// ============= Leaderboard Models =============

export interface LeaderboardEntry {
  readonly rank: number;
  readonly student: Student;
  readonly overallScore: number | null;
  readonly listeningScore: number | null;
  readonly readingScore: number | null;
  readonly writingScore: number | null;
  readonly speakingScore: number | null;
  readonly correctAnswers: number;
  readonly totalQuestions: number;
  readonly timeSpentSeconds: number;
  readonly submittedAt: Date | null;
}

export interface Leaderboard {
  readonly contestUuid: string;
  readonly contestTitle: string;
  readonly totalParticipants: number;
  readonly entries: LeaderboardEntry[];
}

// ============= Attempt Models =============

export interface ContestAttemptListItem {
  readonly uuid: string;
  readonly contest: {
    readonly uuid: string;
    readonly title: string;
    readonly contestType: ContestType;
    readonly difficulty: ContestDifficulty;
  };
  readonly status: AttemptStatus;
  readonly currentSection: SectionName | null;
  readonly startedAt: Date | null;
  readonly submittedAt: Date | null;
  readonly timeSpentSeconds: number | null;
  readonly overallScore: number | null;
}

export interface ContestAttemptDetail extends ContestAttemptListItem {
  readonly contest: ContestDetail;
  readonly questions?: ContestQuestion[];
  readonly timeRemainingSeconds: number;
  readonly sectionsCompleted: SectionName[];
}

// ============= Question Models =============

export interface ContestQuestion {
  readonly id: number;
  readonly questionKey: string;
  readonly questionText: string;
  readonly questionType: string;
  readonly options?: string[];
  readonly points: number;
  readonly section: SectionName;
  readonly orderIndex: number;
  readonly userAnswer?: string;
  readonly isCorrect?: boolean;
  readonly correctAnswer?: string;
}

// ============= Section Data Models =============

export interface TestHead {
  readonly id: number;
  readonly title: string;
  readonly instructions: string;
  readonly questionType: string;
  readonly options?: string[];
  readonly questions?: SectionQuestion[];
}

export interface SectionQuestion {
  readonly id: number;
  readonly questionKey: string;
  readonly questionText: string;
  readonly questionType: string;
  readonly options?: string[];
  readonly points: number;
  readonly orderIndex: number;
  readonly userAnswer?: string;
}

export interface ListeningPartData {
  readonly id: number;
  readonly partNumber: number;
  readonly title: string;
  readonly description?: string;
  readonly audioUrl: string;
  readonly testHeads?: TestHead[];
}

export interface ReadingPassageData {
  readonly id: number;
  readonly passageNumber: number;
  readonly title: string;
  readonly content: string;
  readonly wordCount: number;
  readonly testHeads?: TestHead[];
}

export interface WritingTaskData {
  readonly id: number;
  readonly taskType: 'TASK_1' | 'TASK_2';
  readonly taskTypeDisplay: string;
  readonly prompt: string;
  readonly picture?: string;
  readonly data?: Record<string, unknown>;
  readonly minWords: number;
  readonly userAnswer?: string;
  readonly wordCount?: number;
}

export interface SectionData {
  readonly sectionName: SectionName;
  readonly timeRemaining: number;
  readonly nextSectionName: SectionName | null;
  readonly isLastSection: boolean;
  readonly parts?: ListeningPartData[];
  readonly passages?: ReadingPassageData[];
  readonly tasks?: WritingTaskData[];
}

// ============= Result Models =============

export interface QuestionResult {
  readonly questionKey: string;
  readonly questionText: string;
  readonly userAnswer: string | null;
  readonly correctAnswer: string;
  readonly isCorrect: boolean;
  readonly points: number;
}

export interface ListeningResult {
  readonly partNumber: number;
  readonly title: string;
  readonly questions: QuestionResult[];
}

export interface ReadingResult {
  readonly passageNumber: number;
  readonly title: string;
  readonly questions: QuestionResult[];
}

export interface WritingFeedback {
  readonly taskResponseOrAchievement?: string;
  readonly coherenceAndCohesion?: string;
  readonly lexicalResource?: string;
  readonly grammaticalRangeAndAccuracy?: string;
  readonly overall?: string[];
}

export interface WritingResult {
  readonly taskType: 'TASK_1' | 'TASK_2';
  readonly taskTypeDisplay: string;
  readonly prompt: string;
  readonly userAnswer: string;
  readonly wordCount: number;
  readonly score: number | null;
  readonly feedback?: WritingFeedback;
}

export interface ContestResult {
  readonly uuid: string;
  readonly contest: {
    readonly uuid: string;
    readonly title: string;
    readonly contestType: ContestType;
    readonly difficulty: ContestDifficulty;
    readonly resultsVisible: boolean;
  };
  readonly status: AttemptStatus;
  readonly scores: {
    readonly listeningScore: number | null;
    readonly readingScore: number | null;
    readonly writingScore: number | null;
    readonly speakingScore: number | null;
    readonly overallScore: number | null;
  };
  readonly statistics: {
    readonly correctAnswers: number;
    readonly totalQuestions: number;
    readonly percentage: number;
    readonly timeSpentSeconds: number;
  };
  readonly detailedResults?: {
    readonly listening?: ListeningResult[];
    readonly reading?: ReadingResult[];
    readonly writing?: WritingResult[];
  };
  readonly submittedAt: Date | null;
}

// ============= Submit Models =============

export interface SubmitContestAnswersRequest {
  readonly answers: Record<string, string>;
  readonly startedAt: Date;
  readonly timeSpentSeconds: number;
}

export interface WritingAnswer {
  readonly taskId: number;
  readonly answerText: string;
}

export interface SubmitWritingRequest {
  readonly writingAnswers: WritingAnswer[];
  readonly startedAt: Date;
  readonly timeSpentSeconds: number;
}

export interface SubmitContestResponse {
  readonly uuid: string;
  readonly status: AttemptStatus;
  readonly submittedAt: Date;
  readonly timeSpentSeconds: number;
  readonly listeningScore: number | null;
  readonly readingScore: number | null;
  readonly writingScore: number | null;
  readonly speakingScore: number | null;
  readonly overallScore: number | null;
  readonly correctAnswers: number;
  readonly totalQuestions: number;
}

// ============= Available Content Models =============

export interface AvailableReadingPassage {
  readonly id: number;
  readonly title: string;
  readonly passageNumber: number;
  readonly wordCount: number;
  readonly questionCount: number;
  readonly difficulty: string;
  readonly isPremium: boolean;
}

export interface AvailableListeningPart {
  readonly id: number;
  readonly title: string;
  readonly partNumber: number;
  readonly durationSeconds: number;
  readonly questionCount: number;
  readonly isPremium: boolean;
}

export interface AvailableWritingTask {
  readonly id: number;
  readonly taskType: 'TASK_1' | 'TASK_2';
  readonly taskTypeDisplay: string;
  readonly promptPreview: string;
  readonly chartType?: string;
  readonly isPremium: boolean;
}

export interface AvailableSpeakingTopic {
  readonly id: number;
  readonly speakingType: string;
  readonly topicName: string;
  readonly partNumber: number;
  readonly isPremium: boolean;
}

// ============= Form Data Types (for creating/updating) =============

export interface CreateContestRequest {
  readonly title: string;
  readonly description?: string;
  readonly contestType: ContestType;
  readonly difficulty?: ContestDifficulty;
  readonly startTime: Date;
  readonly endTime: Date;
  readonly durationMinutes?: number;
  readonly isPublic?: boolean;
  readonly accessCode?: string;
  readonly autoGradeReading?: boolean;
  readonly autoGradeListening?: boolean;
  readonly readingPassageIds?: number[];
  readonly listeningPartIds?: number[];
  readonly writingTaskIds?: number[];
  readonly speakingTopicIds?: number[];
  readonly assignedStudentIds?: number[];
}

export interface UpdateContestRequest {
  readonly title?: string;
  readonly description?: string;
  readonly difficulty?: ContestDifficulty;
  readonly startTime?: Date;
  readonly endTime?: Date;
  readonly durationMinutes?: number;
  readonly isPublic?: boolean;
  readonly accessCode?: string;
  readonly autoGradeReading?: boolean;
  readonly autoGradeListening?: boolean;
  readonly resultsVisible?: boolean;
}

export interface NextSectionResponse {
  readonly success: boolean;
  readonly currentSection: SectionName | 'COMPLETED';
  readonly status?: AttemptStatus;
  readonly message?: string;
}

// ============= Teacher Grading Models =============

export interface GradeWritingRequest {
  readonly attemptUuid: string;
  readonly taskId: number;
  readonly score: number;
  readonly feedback?: WritingFeedback;
}
