/**
 * Shared practice components barrel export
 * Centralized exports for reusable practice UI components
 */

export { PracticePageHeader, sectionThemes } from './PracticePageHeader';
export type { StatCard } from './PracticePageHeader';

export { PracticeFilters } from './PracticeFilters';
export type { FilterState, AvailableFilters } from './PracticeFilters';

export { PracticeTestCard, difficultyConfig } from './PracticeTestCard';
export type { PracticeTestCardProps } from './PracticeTestCard';

export {
  PracticeListSkeleton,
  PracticeListError,
  PracticeListEmpty,
} from './PracticeListStates';

export { Pagination, ResultsSummary } from './Pagination';
