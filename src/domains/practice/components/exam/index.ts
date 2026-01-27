/**
 * Exam Components Index
 * Export all reusable exam/practice components
 */

export { ExamHeader, type ExamHeaderProps } from './ExamHeader';
export { AudioPlayer, type AudioPlayerProps } from './AudioPlayer';
export { QuestionPalette, type QuestionPaletteProps, type QuestionInfo, type PartInfo } from './QuestionPalette';
export { ListeningSection, type ListeningSectionProps, type ListeningContent } from './ListeningSection';
export { PlayDialog, type PlayDialogProps } from './PlayDialog';

// New IELTS-style components
export { IELTSHeader, type IELTSHeaderProps } from './IELTSHeader';
export { IELTSBottomNav, type IELTSBottomNavProps } from './IELTSBottomNav';
export { IELTSAnswerSheet, type IELTSAnswerSheetProps, type AnswerResult } from './IELTSAnswerSheet';
export { QuestionSection, type QuestionSectionProps } from './QuestionSection';
export { NavigationControls, type NavigationControlsProps } from './NavigationControls';

// Timer and Theme components
export { PracticeTimer, type PracticeTimerProps } from './PracticeTimer';
export { PracticeThemeToggle, type PracticeThemeToggleProps } from './PracticeThemeToggle';
export { PracticeResultPage, type PracticeResultPageProps, type SubmitResponse, type PracticeResult } from './PracticeResultPage';

// Question type components (CD-IELTS authentic)
export * from './question-types';

