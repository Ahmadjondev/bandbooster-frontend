// IELTS Module Types
export type IELTSModule = 'listening' | 'reading' | 'writing' | 'speaking';

export const IELTS_MODULES: readonly IELTSModule[] = [
  'listening',
  'reading',
  'writing',
  'speaking',
] as const;

// IELTS module metadata for UI
export const IELTS_MODULE_INFO: Record<
  IELTSModule,
  {
    label: string;
    description: string;
    icon: string;
    duration: string;
  }
> = {
  listening: {
    label: 'Listening',
    description: 'Audio comprehension and note-taking',
    icon: '🎧',
    duration: '30 minutes',
  },
  reading: {
    label: 'Reading',
    description: 'Text comprehension and analysis',
    icon: '📖',
    duration: '60 minutes',
  },
  writing: {
    label: 'Writing',
    description: 'Task 1 & Task 2 essays',
    icon: '✍️',
    duration: '60 minutes',
  },
  speaking: {
    label: 'Speaking',
    description: 'Interview and discussion',
    icon: '🎤',
    duration: '11-14 minutes',
  },
} as const;

// Band Score Types (0-9 with 0.5 steps)
export type BandScore =
  | 0
  | 0.5
  | 1
  | 1.5
  | 2
  | 2.5
  | 3
  | 3.5
  | 4
  | 4.5
  | 5
  | 5.5
  | 6
  | 6.5
  | 7
  | 7.5
  | 8
  | 8.5
  | 9;

export const BAND_SCORES: readonly BandScore[] = [
  0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9,
] as const;

// Band score level descriptions
export const BAND_SCORE_LEVELS: Record<
  number,
  { level: string; description: string }
> = {
  0: { level: 'Did not attempt', description: 'No assessable information' },
  1: { level: 'Non-user', description: 'No real ability to use the language' },
  2: { level: 'Intermittent user', description: 'Great difficulty understanding spoken and written English' },
  3: { level: 'Extremely limited user', description: 'Conveys and understands only general meaning' },
  4: { level: 'Limited user', description: 'Basic competence limited to familiar situations' },
  5: { level: 'Modest user', description: 'Partial command with many mistakes' },
  6: { level: 'Competent user', description: 'Generally effective command despite inaccuracies' },
  7: { level: 'Good user', description: 'Operational command with occasional inaccuracies' },
  8: { level: 'Very good user', description: 'Fully operational command with rare inaccuracies' },
  9: { level: 'Expert user', description: 'Fully operational command with complete understanding' },
} as const;

// Utility function to get band level
export const getBandLevel = (score: BandScore): { level: string; description: string } => {
  const roundedScore = Math.floor(score);
  return BAND_SCORE_LEVELS[roundedScore] || BAND_SCORE_LEVELS[0];
};

// Utility function to validate band score
export const isValidBandScore = (score: number): score is BandScore => {
  return BAND_SCORES.includes(score as BandScore);
};

// Practice session types
export interface PracticeScore {
  module: IELTSModule;
  score: BandScore;
  date: string;
  duration: number; // in seconds
}

export interface ModuleScores {
  listening: BandScore | null;
  reading: BandScore | null;
  writing: BandScore | null;
  speaking: BandScore | null;
}

// Calculate overall band score (average of 4 modules, rounded to nearest 0.5)
export const calculateOverallBand = (scores: ModuleScores): BandScore | null => {
  const validScores = Object.values(scores).filter(
    (score): score is BandScore => score !== null
  );

  if (validScores.length !== 4) return null;

  const average = validScores.reduce<number>((sum, score) => sum + score, 0) / 4;
  const rounded = Math.round(average * 2) / 2;

  return isValidBandScore(rounded) ? rounded : null;
};

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Common component prop types
export interface WithClassName {
  className?: string;
}

export interface WithChildren {
  children: React.ReactNode;
}

export interface WithOptionalChildren {
  children?: React.ReactNode;
}

// Form state types
export type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export interface FormState<T> {
  data: T;
  status: FormStatus;
  error: string | null;
}

// User progress tracking
export interface UserProgress {
  userId: string;
  targetBand: BandScore;
  currentScores: ModuleScores;
  practiceHistory: PracticeScore[];
  totalPracticeTime: number; // in seconds
  streak: number; // consecutive days
  lastPracticeDate: string | null;
}

// Date utility types
export type DateString = string; // ISO 8601 format
export type Timestamp = number; // Unix timestamp in milliseconds
