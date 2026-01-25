/**
 * Domain models for the practice module
 * Business-safe, immutable models used throughout the application
 */

// ============= Enums =============

export type SectionType = 'READING' | 'LISTENING' | 'WRITING' | 'SPEAKING';
export type TestType = 'FULL_TEST' | 'SECTION_PRACTICE';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
export type AttemptStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
export type ChartType = 'LINE_GRAPH' | 'BAR_CHART' | 'PIE_CHART' | 'TABLE' | 'MAP' | 'PROCESS' | 'MIXED';
export type TaskType = 'TASK_1' | 'TASK_2';
export type QuestionType = 
  | 'MCQ' | 'MCMA' | 'SA' | 'SC' | 'SUC' | 'NC' 
  | 'FC' | 'TC' | 'FCC' | 'TFNG' | 'YNNG' 
  | 'MH' | 'MI' | 'MF' | 'ML' | 'DL';

// ============= Overview Models =============

export interface SectionOverview {
  readonly sectionType: SectionType;
  readonly displayName: string;
  readonly icon: string;
  readonly color: string;
  readonly totalPractices: number;
  readonly freePractices: number;
  readonly completedPractices: number;
  readonly totalAttempts: number;
  readonly bestScore: number | null;
  readonly progressPercentage: number;
}

// ============= Practice List Models =============

export interface PracticeListItem {
  readonly uuid: string;
  readonly title: string;
  readonly description: string;
  readonly sectionType: SectionType;
  readonly sectionTypeDisplay: string;
  readonly testType: TestType;
  readonly difficulty: DifficultyLevel;
  readonly difficultyDisplay: string;
  readonly durationMinutes: number;
  readonly totalQuestions: number;
  readonly isPremium: boolean;
  readonly contentCount: number;
  readonly attemptsCount: number;
  readonly bestScore: number | null;
  readonly lastAttemptDate: Date | null;
  readonly createdAt: Date;
  // Reading specific
  readonly readingPassageNumber?: number | null;
  // Listening specific
  readonly listeningPartNumber?: number | null;
  // Writing specific
  readonly writingTaskType?: TaskType | null;
  readonly writingChartType?: ChartType | null;
  readonly writingPromptPreview?: string | null;
  // Speaking specific
  readonly speakingPart?: number | null;
  readonly speakingTopicName?: string | null;
  // Access control
  readonly userHasAccess: boolean;
  readonly requiresPayment: boolean;
}

export interface PaginationInfo {
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
  readonly hasNext: boolean;
  readonly hasPrevious: boolean;
}

export interface FilterOption<T = string> {
  readonly value: T;
  readonly label: string;
}

export interface PracticeFilters {
  readonly difficulties: FilterOption<DifficultyLevel>[];
  readonly sortOptions: FilterOption[];
  readonly passageNumbers?: FilterOption<number>[];
  readonly partNumbers?: FilterOption<number>[];
  readonly chartTypes?: FilterOption<ChartType>[];
  readonly taskTypes?: FilterOption<TaskType>[];
  readonly speakingParts?: FilterOption<number>[];
}

export interface SectionStats {
  readonly totalAttempts: number;
  readonly averageScore: number | null;
  readonly bestScore: number | null;
  readonly totalTimeMinutes: number;
}

export interface PracticeSectionResponse {
  readonly sectionType: SectionType;
  readonly practices: PracticeListItem[];
  readonly pagination: PaginationInfo;
  readonly stats: SectionStats;
  readonly availableFilters: PracticeFilters;
}

// ============= Practice Detail Models =============

export interface Question {
  readonly id: number;
  readonly questionKey: string;
  readonly questionText: string;
  readonly questionType: QuestionType;
  readonly options?: string[];
  readonly correctAnswer?: string | string[];
  readonly points: number;
  readonly audioUrl?: string;
  readonly imageUrl?: string;
  readonly orderIndex: number;
}

export interface Passage {
  readonly id: number;
  readonly title: string;
  readonly content: string;
  readonly passageNumber: number;
  readonly wordCount: number;
  readonly questions: Question[];
}

export interface ListeningPart {
  readonly id: number;
  readonly partNumber: number;
  readonly title: string;
  readonly description?: string;
  readonly audioUrl: string;
  readonly transcript?: string;
  readonly questions: Question[];
}

export interface WritingTask {
  readonly id: number;
  readonly taskType: TaskType;
  readonly prompt: string;
  readonly chartImageUrl?: string;
  readonly chartDescription?: string;
  readonly sampleAnswer?: string;
  readonly wordLimit: number;
}

export interface SpeakingPart {
  readonly id: number;
  readonly partNumber: number;
  readonly title: string;
  readonly description: string;
  readonly cueCard?: string;
  readonly followUpQuestions?: string[];
  readonly preparationTimeSeconds: number;
  readonly speakingTimeSeconds: number;
  readonly questions: Question[];
}

export interface PracticeDetail {
  readonly uuid: string;
  readonly title: string;
  readonly description: string;
  readonly sectionType: SectionType;
  readonly testType: TestType;
  readonly difficulty: DifficultyLevel;
  readonly durationMinutes: number;
  readonly totalQuestions: number;
  readonly isPremium: boolean;
  readonly isFree: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly passages?: Passage[];
  readonly listeningParts?: ListeningPart[];
  readonly writingTasks?: WritingTask[];
  readonly speakingParts?: SpeakingPart[];
  readonly userAttemptsCount?: number;
  readonly userBestScore?: number | null;
  readonly userLastAttemptAt?: Date | null;
}

// ============= Attempt Models =============

export interface AttemptListItem {
  readonly uuid: string;
  readonly practiceUuid: string;
  readonly practiceTitle: string;
  readonly sectionType: SectionType;
  readonly testType: TestType;
  readonly difficulty: DifficultyLevel;
  readonly status: AttemptStatus;
  readonly score: number | null;
  readonly correctAnswers: number;
  readonly totalQuestions: number;
  readonly accuracyPercentage: number | null;
  readonly timeSpentSeconds: number;
  readonly startedAt: Date;
  readonly completedAt: Date | null;
}

export interface AttemptDetail extends AttemptListItem {
  readonly practice: PracticeDetail;
  readonly answers: Record<string, string | string[]>;
}

export interface QuestionResult {
  readonly questionId: number;
  readonly questionKey: string;
  readonly userAnswer: string | string[] | null;
  readonly correctAnswer: string | string[];
  readonly isCorrect: boolean;
  readonly pointsEarned: number;
  readonly maxPoints: number;
}

export interface AttemptResult {
  readonly attemptUuid: string;
  readonly practiceUuid: string;
  readonly practiceTitle: string;
  readonly sectionType: SectionType;
  readonly testType: TestType;
  readonly score: number;
  readonly bandScore?: number;
  readonly correctAnswers: number;
  readonly totalQuestions: number;
  readonly accuracyPercentage: number;
  readonly timeSpentSeconds: number;
  readonly startedAt: Date;
  readonly completedAt: Date;
  readonly questionResults: QuestionResult[];
  readonly sectionScores?: Record<SectionType, number>;
}

// ============= Submission Models =============

export interface SubmitAnswersRequest {
  readonly answers: Record<string, string | string[]>;
  readonly startedAt: Date;
  readonly timeSpentSeconds: number;
}

export interface SubmitAnswersResponse {
  readonly success: boolean;
  readonly attemptUuid: string;
  readonly score: number;
  readonly bandScore?: number;
  readonly correctAnswers: number;
  readonly totalQuestions: number;
  readonly accuracyPercentage: number;
  readonly timeSpentSeconds: number;
  readonly message: string;
}

// ============= Writing Models =============

export interface WritingEvaluation {
  readonly overallBandScore: number;
  readonly criteria: {
    readonly taskAchievement: number;
    readonly coherenceCohesion: number;
    readonly lexicalResource: number;
    readonly grammaticalRange: number;
  };
  readonly feedbackSummary: string;
  readonly inlineCorrections: string;
  readonly correctedEssay: string;
  readonly sentenceFeedback: Array<{
    readonly original: string;
    readonly corrected: string;
    readonly feedback: string;
  }>;
}

export interface SubmitWritingResponse {
  readonly success: boolean;
  readonly attemptUuid: string;
  readonly score: number;
  readonly bandScore: number;
  readonly evaluation: WritingEvaluation;
  readonly message: string;
}

// ============= Speaking Models =============

export interface SpeakingEvaluation {
  readonly overallBandScore: number;
  readonly criteria: {
    readonly fluencyCoherence: number;
    readonly lexicalResource: number;
    readonly grammaticalRange: number;
    readonly pronunciation: number;
  };
  readonly overallFeedback: string;
  readonly azureScores: {
    readonly pronunciationScore: number;
    readonly fluencyScore: number;
    readonly accuracyScore: number;
  };
  readonly transcripts: Array<{
    readonly questionKey: string;
    readonly transcript: string;
    readonly feedback: string;
  }>;
}

export interface CompleteSpeakingResponse {
  readonly success: boolean;
  readonly attemptUuid: string;
  readonly score: number;
  readonly bandScore: number;
  readonly evaluation: SpeakingEvaluation;
  readonly message: string;
}

// ============= Stats Models =============

export interface SectionStats {
  readonly sectionType: SectionType;
  readonly totalAttempts: number;
  readonly completedAttempts: number;
  readonly averageScore: number | null;
  readonly bestScore: number | null;
  readonly totalTimeSpentSeconds: number;
  readonly accuracyPercentage: number | null;
  readonly lastAttemptAt: Date | null;
}

export interface UserStats {
  readonly totalAttempts: number;
  readonly totalCompleted: number;
  readonly overallAverageScore: number | null;
  readonly totalTimeSpentSeconds: number;
  readonly sectionStats: SectionStats[];
  readonly recentActivity: AttemptListItem[];
}

export interface SectionAttemptBalance {
  readonly sectionType: SectionType;
  readonly remainingAttempts: number;
  readonly isUnlimited: boolean;
}

export interface AttemptBalanceResponse {
  readonly isPremium: boolean;
  readonly balances: SectionAttemptBalance[];
}

export interface DifficultyBreakdown {
  readonly completed: number;
  readonly total: number;
  readonly averageScore: number | null;
}

export interface SectionSpecificStats {
  readonly sectionType: SectionType;
  readonly displayName: string;
  readonly totalPractices: number;
  readonly completedPractices: number;
  readonly totalAttempts: number;
  readonly averageScore: number | null;
  readonly bestScore: number | null;
  readonly totalTimeSpentSeconds: number;
  readonly accuracyPercentage: number | null;
  readonly scoreHistory: Array<{
    readonly date: Date;
    readonly score: number;
  }>;
  readonly difficultyBreakdown: Record<DifficultyLevel, DifficultyBreakdown>;
}
