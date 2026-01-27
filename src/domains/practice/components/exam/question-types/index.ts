/**
 * Question Types Components Index
 * Export all IELTS question type components and utilities
 * 
 * Usage:
 * import { QuestionTypeFactory, MCQQuestion, ... } from './question-types';
 */

// Main factory component - use this for automatic type detection
export { QuestionTypeFactory, type QuestionTypeFactoryProps, type APITestHead, type APIQuestion } from './QuestionTypeFactory';

// Shared components
export { BlankInput, type BlankInputProps } from './shared';

// Individual question type components
export { MCQQuestion, type MCQProps, type MCQQuestionData } from './MCQQuestion';
export { MCMAQuestion, type MCMAProps, type MCMAQuestionData } from './MCMAQuestion';
export { TFNGQuestion, YNNGQuestion, type TFNGProps, type TFNGQuestionData, type StatementType } from './TFNGQuestion';
export { SCQuestion, type SCProps, type SCQuestionData } from './SCQuestion';
export { SUCQuestion, type SUCProps, type SUCQuestionData, type SUCSummaryData } from './SUCQuestion';
export { SAQuestion, type SAProps, type SAQuestionData } from './SAQuestion';
export { NCQuestion, type NCProps, type NCQuestionData, type NCNoteData, type NCNoteItem } from './NCQuestion';
export { TCQuestion, type TCProps, type TCQuestionData, type TCTableData } from './TCQuestion';
export { FCQuestion, type FCProps, type FCQuestionData, type FCFormData } from './FCQuestion';
export { FCCQuestion, type FCCProps, type FCCQuestionData, type FCCFlowData } from './FCCQuestion';
export { 
  MatchingQuestion, 
  MHQuestion, 
  MIQuestion, 
  MFQuestion, 
  MLQuestion,
  type MatchingProps,
  type MatchingQuestionData,
  type MatchingExample,
  type MatchingType,
} from './MatchingQuestion';
export { DLQuestion, type DLProps, type DLQuestionData, type DLDiagramData } from './DLQuestion';

// Styling utilities
export {
  ieltsColors,
  ieltsTypography,
  ieltsSpacing,
  ieltsBorderRadius,
  ieltsShadows,
  ieltsComponentStyles,
  getQuestionBadgeClass,
  getOptionContainerClass,
  getTFNGButtonClass,
} from './styles';
