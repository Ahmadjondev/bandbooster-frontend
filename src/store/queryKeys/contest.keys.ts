/**
 * Contest Query Keys
 * Centralized query key factory for TanStack Query
 */

export const contestQueryKeys = {
  all: ['contest'] as const,
  
  // Teacher contest list
  lists: () => [...contestQueryKeys.all, 'list'] as const,
  list: (filters?: { status?: string; contestType?: string; search?: string }) => 
    [...contestQueryKeys.lists(), filters] as const,
  
  // Contest statistics
  statistics: () => [...contestQueryKeys.all, 'statistics'] as const,
  
  // Contest detail
  details: () => [...contestQueryKeys.all, 'detail'] as const,
  detail: (uuid: string) => [...contestQueryKeys.details(), uuid] as const,
  
  // Contest leaderboard
  leaderboards: () => [...contestQueryKeys.all, 'leaderboard'] as const,
  leaderboard: (uuid: string) => [...contestQueryKeys.leaderboards(), uuid] as const,
  
  // Contest attempts (for teacher grading)
  contestAttempts: (contestUuid: string) => 
    [...contestQueryKeys.all, 'contestAttempts', contestUuid] as const,
  
  // Available content for exam creation
  availableContent: () => [...contestQueryKeys.all, 'available'] as const,
  availableReading: (filters?: { passageNumber?: number; search?: string }) => 
    [...contestQueryKeys.availableContent(), 'reading', filters] as const,
  availableListening: (filters?: { partNumber?: number; search?: string }) => 
    [...contestQueryKeys.availableContent(), 'listening', filters] as const,
  availableWriting: (filters?: { taskType?: string; search?: string }) => 
    [...contestQueryKeys.availableContent(), 'writing', filters] as const,
  availableSpeaking: (filters?: { speakingType?: string; search?: string }) => 
    [...contestQueryKeys.availableContent(), 'speaking', filters] as const,
  
  // Student available contests
  studentAvailable: (filters?: { status?: string; contestType?: string }) => 
    [...contestQueryKeys.all, 'studentAvailable', filters] as const,
  
  // Student attempts
  myAttempts: () => [...contestQueryKeys.all, 'myAttempts'] as const,
  
  // Attempt detail
  attempts: () => [...contestQueryKeys.all, 'attempt'] as const,
  attempt: (uuid: string) => [...contestQueryKeys.attempts(), uuid] as const,
  
  // Attempt section data
  sectionData: (attemptUuid: string, section: string) => 
    [...contestQueryKeys.attempt(attemptUuid), 'section', section] as const,
  
  // Attempt result
  results: () => [...contestQueryKeys.all, 'result'] as const,
  result: (attemptUuid: string) => [...contestQueryKeys.results(), attemptUuid] as const,
} as const;

export type ContestQueryKeys = typeof contestQueryKeys;
