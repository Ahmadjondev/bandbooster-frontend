/**
 * Text Highlighting Types
 * CD-IELTS style highlighting with yellow and green colors
 */

export type HighlightColor = 'yellow' | 'green';

export interface HighlightRange {
  /** Unique identifier for the highlight */
  id: string;
  /** Start offset within the container */
  startOffset: number;
  /** End offset within the container */
  endOffset: number;
  /** Highlight color */
  color: HighlightColor;
  /** Text content that was highlighted */
  text: string;
  /** XPath or identifier for the container element */
  containerId: string;
}

export interface HighlightState {
  /** All highlights organized by container ID */
  highlights: Record<string, HighlightRange[]>;
  /** Currently selected color for new highlights */
  activeColor: HighlightColor;
}

export interface HighlightContextValue {
  /** Current highlight state */
  state: HighlightState;
  /** Set the active highlight color */
  setActiveColor: (color: HighlightColor) => void;
  /** Add a new highlight (uses provided color or falls back to activeColor) */
  addHighlight: (containerId: string, range: Range, color?: HighlightColor) => void;
  /** Remove a highlight by ID */
  removeHighlight: (containerId: string, highlightId: string) => void;
  /** Clear all highlights for a container */
  clearHighlights: (containerId: string) => void;
  /** Clear all highlights */
  clearAllHighlights: () => void;
  /** Get highlights for a specific container */
  getHighlights: (containerId: string) => HighlightRange[];
}

export interface HighlightPopupPosition {
  x: number;
  y: number;
  highlightId: string;
  containerId: string;
}
