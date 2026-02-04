// Legacy exports (kept for backwards compatibility)
export { PracticeCard, PracticeCardSkeleton } from './PracticeCard';
export { 
  PracticeListHeader, 
  Pagination as LegacyPagination, 
  EmptyState,
  sectionConfig,
  type FilterState as LegacyFilterState 
} from './PracticeListLayout';

// New shared components (preferred)
export * from './shared';

// Exam/Practice components
export * from './exam';
