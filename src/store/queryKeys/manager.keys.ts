/**
 * Query keys for Manager module
 * Simplified 3-step workflow: Extract → Save → Practice
 * Plus Reading and Listening CRUD management
 */

export const managerKeys = {
  all: ['manager'] as const,
  extract: () => [...managerKeys.all, 'extract'] as const,
  save: () => [...managerKeys.all, 'save'] as const,
  practice: () => [...managerKeys.all, 'practice'] as const,
  
  // Reading keys
  reading: {
    all: () => [...managerKeys.all, 'reading'] as const,
    list: (params?: Record<string, unknown>) => [...managerKeys.reading.all(), 'list', params] as const,
    detail: (id: number) => [...managerKeys.reading.all(), 'detail', id] as const,
  },
  
  // Listening keys
  listening: {
    all: () => [...managerKeys.all, 'listening'] as const,
    list: (params?: Record<string, unknown>) => [...managerKeys.listening.all(), 'list', params] as const,
    detail: (id: number) => [...managerKeys.listening.all(), 'detail', id] as const,
  },
};
