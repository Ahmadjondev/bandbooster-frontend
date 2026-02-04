/**
 * Text Highlighting Feature
 * CD-IELTS style highlighting with yellow and green colors
 * 
 * Usage:
 * 1. Wrap your exam component with HighlightProvider
 * 2. Use HighlightableContent for passages and questions
 * 3. Add HighlightToolbar for color selection
 * 
 * @example
 * ```tsx
 * import { 
 *   HighlightProvider, 
 *   HighlightableContent, 
 *   HighlightToolbar,
 *   useHighlightContext 
 * } from './highlight';
 * 
 * function ReadingExam({ attemptUuid }) {
 *   return (
 *     <HighlightProvider options={{ sessionKey: attemptUuid }}>
 *       <HighlightToolbar />
 *       <PassageWithHighlighting />
 *     </HighlightProvider>
 *   );
 * }
 * 
 * function PassageWithHighlighting() {
 *   const { state, addHighlight, removeHighlight, getHighlights } = useHighlightContext();
 *   
 *   return (
 *     <HighlightableContent
 *       containerId="passage-1"
 *       content={passageHtml}
 *       highlights={getHighlights('passage-1')}
 *       activeColor={state.activeColor}
 *       onHighlight={addHighlight}
 *       onRemoveHighlight={removeHighlight}
 *     />
 *   );
 * }
 * ```
 */

// Types
export type { 
  HighlightColor, 
  HighlightRange, 
  HighlightState, 
  HighlightContextValue,
  HighlightPopupPosition,
} from './types';

// Hook
export { useTextHighlight, type UseTextHighlightOptions } from './useTextHighlight';

// Context
export { 
  HighlightProvider, 
  useHighlightContext, 
  useOptionalHighlightContext,
  type HighlightProviderProps,
} from './HighlightProvider';

// Components
export { HighlightableContent, type HighlightableContentProps } from './HighlightableContent';
export { HighlightableQuestions, type HighlightableQuestionsProps } from './HighlightableQuestions';
export { HighlightPopup, type HighlightPopupProps } from './HighlightPopup';
export { SelectionPopup, type SelectionPopupProps } from './SelectionPopup';
export { HighlightToolbar, type HighlightToolbarProps } from './HighlightToolbar';
