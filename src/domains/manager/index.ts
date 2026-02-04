/**
 * Manager domain public API
 * Simplified 3-step workflow: Extract → Save → Practice
 * Plus Reading and Listening CRUD management
 */

// API
export { managerApi } from './api/manager.api';

// Models & Types
export type {
  ContentType,
  PracticeMode,
  QuestionType,
  Difficulty,
  DifficultyLevel,
  ValidationError,
  ExtractStats,
  Choice,
  Question,
  QuestionData,
  QuestionGroup,
  ListeningPart,
  ListeningContent,
  ReadingPassage,
  ReadingContent,
  ExtractResponse,
  SaveResult,
  SaveResponse,
  CreatePracticeInput,
  CreatePracticeResponse,
  // Reading Management
  ReadingItem,
  ReadingDetail,
  ReadingListResponse,
  CreateReadingInput,
  UpdateReadingInput,
  // Listening Management
  ListeningItem,
  ListeningDetail,
  ListeningListResponse,
  CreateListeningInput,
  UpdateListeningInput,
  // Filter params
  ContentFilterParams,
} from './models/domain';

export {
  CONTENT_TYPE_LABELS,
  QUESTION_TYPE_LABELS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  DIFFICULTY_LEVEL_LABELS,
  DIFFICULTY_LEVEL_COLORS,
  isListeningContent,
  isReadingContent,
} from './models/domain';

// Query Hooks
export {
  managerQueryKeys,
  useExtractFromJson,
  useExtractFromText,
  useExtractFromFile,
  useSaveContent,
  useCreatePractice,
  // Reading hooks
  useReadingList,
  useReadingDetail,
  useCreateReading,
  useUpdateReading,
  usePatchReading,
  useDeleteReading,
  // Listening hooks
  useListeningList,
  useListeningDetail,
  useCreateListening,
  useUploadListeningAudio,
  useUpdateListening,
  usePatchListening,
  useDeleteListening,
} from './queries/manager.queries';

// Components
export { JsonInputForm, ContentPreview, WorkflowActions, type CreatePracticeData } from './components';
