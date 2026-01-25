import type { SectionType, DifficultyLevel, ChartType, TaskType } from '@/domains/practice/models/domain';

export interface PracticeListParams {
  page?: number;
  pageSize?: number;
  difficulty?: DifficultyLevel;
  isPremium?: boolean;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'difficulty' | 'title';
  passageNumber?: number;
  partNumber?: number;
  chartType?: ChartType;
  taskType?: TaskType;
  speakingPart?: number;
}

export interface AttemptListParams {
  sectionType?: SectionType;
  testType?: 'FULL_TEST' | 'SECTION_PRACTICE';
  limit?: number;
}

export const practiceKeys = {
  // Root
  all: ['practice'] as const,
  
  // Overview
  overview: () => [...practiceKeys.all, 'overview'] as const,
  
  // Stats
  stats: () => [...practiceKeys.all, 'stats'] as const,
  userStats: () => [...practiceKeys.stats(), 'user'] as const,
  attemptBalance: () => [...practiceKeys.stats(), 'balance'] as const,
  sectionStats: (sectionType: SectionType) => [...practiceKeys.stats(), 'section', sectionType] as const,
  
  // Practice lists
  sections: () => [...practiceKeys.all, 'sections'] as const,
  sectionList: (sectionType: SectionType) => [...practiceKeys.sections(), sectionType] as const,
  sectionListFiltered: (sectionType: SectionType, params: PracticeListParams) => 
    [...practiceKeys.sectionList(sectionType), params] as const,
  
  // Practice detail
  details: () => [...practiceKeys.all, 'details'] as const,
  detail: (practiceUuid: string) => [...practiceKeys.details(), practiceUuid] as const,
  
  // Attempts
  attempts: () => [...practiceKeys.all, 'attempts'] as const,
  attemptList: (params?: AttemptListParams) => [...practiceKeys.attempts(), 'list', params] as const,
  attemptDetail: (attemptUuid: string) => [...practiceKeys.attempts(), 'detail', attemptUuid] as const,
  attemptResult: (attemptUuid: string) => [...practiceKeys.attempts(), 'result', attemptUuid] as const,
} as const;
