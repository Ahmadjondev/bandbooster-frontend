/**
 * UI models for the practice module
 * Presentation-only models for components and views
 */

import type { 
  DifficultyLevel, 
  SectionType, 
  Question, 
  QuestionType,
  ChartType,
  TaskType,
  AttemptStatus 
} from './domain';

// ============= Practice Card Props =============

export interface PracticeCardProps {
  uuid: string;
  title: string;
  description: string;
  sectionType: SectionType;
  difficulty: DifficultyLevel;
  durationMinutes: number;
  questionCount: number;
  isPremium: boolean;
  isFree: boolean;
  isCompleted?: boolean;
  bestScore?: number | null;
  attemptsCount?: number;
  passageNumber?: number;
  partNumber?: number;
  onStart?: (uuid: string) => void;
  onPreview?: (uuid: string) => void;
  isLoading?: boolean;
}

// ============= Question View Props =============

export interface QuestionViewProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer?: string | string[];
  onAnswerChange: (answer: string | string[]) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onSubmit?: () => void;
  isFirst: boolean;
  isLast: boolean;
  isSubmitting?: boolean;
  showFeedback?: boolean;
  isCorrect?: boolean;
}

// ============= Progress States =============

export interface ProgressState {
  currentQuestionIndex: number;
  totalQuestions: number;
  answeredQuestions: number;
  timeRemaining: number;
  timeElapsed: number;
  isTimerRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
}

export interface TestSessionState {
  practiceUuid: string;
  progress: ProgressState;
  answers: Map<string, string | string[]>;
  startTime: Date;
  lastActivityTime: Date;
}

// ============= Filter Options =============

export interface SectionFilterOption {
  value: SectionType | 'all';
  label: string;
  icon?: string;
  count?: number;
  color?: string;
}

export interface DifficultyFilterOption {
  value: DifficultyLevel | 'all';
  label: string;
  color?: string;
}

export interface StatusFilterOption {
  value: 'all' | 'completed' | 'uncompleted';
  label: string;
}

export interface SortOption {
  value: 'newest' | 'oldest' | 'difficulty' | 'title';
  label: string;
}

// ============= Question Type Info =============

export interface QuestionTypeInfo {
  type: QuestionType;
  label: string;
  description: string;
  icon?: string;
}

// ============= Result Display Props =============

export interface ResultSummaryProps {
  attemptUuid: string;
  practiceTitle: string;
  sectionType: SectionType;
  score: number;
  bandScore?: number;
  accuracyPercentage: number;
  timeSpentSeconds: number;
  correctAnswers: number;
  totalQuestions: number;
  onReview?: () => void;
  onRetake?: () => void;
  onBackToList?: () => void;
}

export interface ScoreDisplayProps {
  score: number;
  maxScore?: number;
  bandScore?: number;
  percentage?: number;
  size?: 'sm' | 'md' | 'lg';
  showBand?: boolean;
  animate?: boolean;
}

// ============= Dashboard Stats Display =============

export interface SectionStatsDisplayProps {
  sectionType: SectionType;
  displayName: string;
  icon: string;
  color: string;
  totalPractices: number;
  completedPractices: number;
  bestScore: number | null;
  progressPercentage: number;
  onClick?: () => void;
}

export interface AttemptHistoryItemProps {
  uuid: string;
  practiceTitle: string;
  sectionType: SectionType;
  difficulty: DifficultyLevel;
  status: AttemptStatus;
  score: number | null;
  accuracyPercentage: number | null;
  timeSpentSeconds: number;
  completedAt: Date | null;
  onClick?: () => void;
}

// ============= Practice List Filter State =============

export interface PracticeListFilters {
  difficulty?: DifficultyLevel;
  isPremium?: boolean;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'difficulty' | 'title';
  status?: 'all' | 'completed' | 'uncompleted';
  // Reading specific
  passageNumber?: number;
  // Listening specific
  partNumber?: number;
  // Writing specific
  chartType?: ChartType;
  taskType?: TaskType;
  // Speaking specific
  speakingPart?: number;
}

// ============= Navigation Items =============

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  isActive?: boolean;
  children?: NavigationItem[];
}

export interface SidebarSection {
  title?: string;
  items: NavigationItem[];
}

// ============= Dashboard Quick Actions =============

export interface QuickActionItem {
  id: string;
  label: string;
  description?: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}
