/**
 * Practice Domain - Public API
 *
 * This module exports all public interfaces for the IELTS practice feature.
 */

// API client
export { practiceApi } from './api/practice.api';

// DTOs (contracts)
export type {
  SectionType,
  TestType,
  DifficultyLevel,
  AttemptStatus,
  ChartType,
  TaskType,
  QuestionType,
  SectionOverviewDTO,
  PracticeListItemDTO,
  PracticeSectionResponseDTO,
  QuestionDTO,
  PassageDTO,
  ListeningPartDTO,
  WritingTaskDTO,
  SpeakingPartDTO,
  PracticeDetailDTO,
  AttemptListItemDTO,
  AttemptDetailDTO,
  QuestionResultDTO,
  AttemptResultDTO,
  SubmitAnswersRequestDTO,
  SubmitAnswersResponseDTO,
  SubmitWritingRequestDTO,
  SubmitWritingResponseDTO,
} from './api/practice.contract';

// Domain models
export type {
  SectionOverview,
  PracticeListItem,
  PracticeSectionResponse,
  Question,
  Passage,
  ListeningPart,
  WritingTask,
  SpeakingPart,
  PracticeDetail,
  AttemptListItem,
  AttemptDetail,
  QuestionResult,
  AttemptResult,
  SubmitAnswersRequest,
  SubmitAnswersResponse,
} from './models/domain';

// UI models
export type {
  PracticeCardProps,
  QuestionViewProps,
  ProgressState,
  TestSessionState,
  DifficultyFilterOption,
  SectionFilterOption,
  StatusFilterOption,
  SortOption,
} from './models/ui';

// Mappers
export {
  mapSectionOverviewDTOToDomain,
  mapPracticeListItemDTOToDomain,
  mapPracticeSectionResponseDTOToDomain,
  mapQuestionDTOToDomain,
  mapPracticeDetailDTOToDomain,
  mapAttemptListItemDTOToDomain,
  mapAttemptDetailDTOToDomain,
  mapAttemptResultDTOToDomain,
  mapSubmitAnswersResponseDTOToDomain,
} from './api/practice.mapper';

// Query hooks
export {
  useOverview,
  useUserStats,
  useAttemptBalance,
  useSectionStats,
  usePracticesBySection,
  usePracticeDetail,
  usePrefetchPracticeDetail,
  useAttempts,
  useAttemptDetail,
  useAttemptResult,
  useSubmitPractice,
  useSubmitWriting,
} from './queries/practice.queries';

// Components
export * from './components';
