/**
 * Exam Components Index
 * Export all reusable exam/practice components
 */

export { ExamHeader, type ExamHeaderProps } from './ExamHeader';
export { AudioPlayer, type AudioPlayerProps } from './AudioPlayer';
export { QuestionPalette, type QuestionPaletteProps, type QuestionInfo as PaletteQuestionInfo, type PartInfo as PalettePartInfo } from './QuestionPalette';
export { ListeningSection, type ListeningSectionProps, type ListeningContent } from './ListeningSection';
export { PlayDialog, type PlayDialogProps } from './PlayDialog';

// New IELTS-style components
export { IELTSHeader, type IELTSHeaderProps } from './IELTSHeader';
export { IELTSAnswerSheet, type IELTSAnswerSheetProps, type AnswerResult } from './IELTSAnswerSheet';
export { QuestionSection, type QuestionSectionProps } from './QuestionSection';
export { NavigationControls, type NavigationControlsProps } from './NavigationControls';

// Unified Bottom Navigation
export {
    BottomNav,
    type BottomNavProps,
    type SectionInfo,
    type QuestionInfo,
    type BottomNavMode,
    // Legacy compatibility exports
    IELTSBottomNav,
    ReadingBottomNav,
    type IELTSBottomNavProps,
    type ReadingBottomNavProps,
    type ReadingPassageInfo,
    type ReadingQuestionInfo,
    type PartInfo,
} from './BottomNav';

// Reading-specific components
export { ReadingPassage, type ReadingPassageProps } from './ReadingPassage';
export { ReadingSplitter, type ReadingSplitterProps } from './ReadingSplitter';

// Timer and Theme components
export { PracticeTimer, type PracticeTimerProps } from './PracticeTimer';
export { PracticeThemeToggle, type PracticeThemeToggleProps } from './PracticeThemeToggle';
export { PracticeResultPage, type PracticeResultPageProps, type SubmitResponse, type PracticeResult } from './PracticeResultPage';

// Question type components (CD-IELTS authentic)
export * from './question-types';

