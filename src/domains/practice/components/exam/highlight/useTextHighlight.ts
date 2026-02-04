/**
 * Text Highlight Hook
 * Manages text highlighting state with localStorage persistence
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import type { HighlightState, HighlightColor, HighlightRange, HighlightContextValue } from './types';

const STORAGE_KEY = 'ielts-text-highlights';

function generateId(): string {
  return `hl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getTextNodesIn(node: Node): Text[] {
  const textNodes: Text[] = [];
  
  const walk = document.createTreeWalker(
    node,
    NodeFilter.SHOW_TEXT,
    null
  );
  
  let currentNode: Node | null;
  while ((currentNode = walk.nextNode())) {
    textNodes.push(currentNode as Text);
  }
  
  return textNodes;
}

function getSelectionOffsets(
  container: Element,
  range: Range
): { startOffset: number; endOffset: number; text: string } | null {
  const textNodes = getTextNodesIn(container);
  let totalOffset = 0;
  let startOffset = -1;
  let endOffset = -1;
  
  for (const textNode of textNodes) {
    const nodeLength = textNode.textContent?.length || 0;
    
    if (textNode === range.startContainer) {
      startOffset = totalOffset + range.startOffset;
    }
    
    if (textNode === range.endContainer) {
      endOffset = totalOffset + range.endOffset;
      break;
    }
    
    totalOffset += nodeLength;
  }
  
  if (startOffset >= 0 && endOffset >= 0 && startOffset < endOffset) {
    return {
      startOffset,
      endOffset,
      text: range.toString(),
    };
  }
  
  return null;
}

function loadFromStorage(sessionKey?: string): HighlightState {
  if (typeof window === 'undefined') {
    return { highlights: {}, activeColor: 'yellow' };
  }
  
  try {
    const key = sessionKey ? `${STORAGE_KEY}-${sessionKey}` : STORAGE_KEY;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('Failed to load highlights from storage:', e);
  }
  
  return { highlights: {}, activeColor: 'yellow' };
}

function saveToStorage(state: HighlightState, sessionKey?: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const key = sessionKey ? `${STORAGE_KEY}-${sessionKey}` : STORAGE_KEY;
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save highlights to storage:', e);
  }
}

export interface UseTextHighlightOptions {
  /** Unique session key for storage (e.g., attempt UUID) */
  sessionKey?: string;
  /** Initial active color */
  initialColor?: HighlightColor;
}

export function useTextHighlight(options: UseTextHighlightOptions = {}): HighlightContextValue {
  const { sessionKey, initialColor = 'yellow' } = options;
  
  const [state, setState] = useState<HighlightState>(() => {
    const loaded = loadFromStorage(sessionKey);
    return {
      ...loaded,
      activeColor: initialColor,
    };
  });

  // Save to storage whenever state changes
  useEffect(() => {
    saveToStorage(state, sessionKey);
  }, [state, sessionKey]);

  const setActiveColor = useCallback((color: HighlightColor) => {
    setState(prev => ({ ...prev, activeColor: color }));
  }, []);

  const addHighlight = useCallback((containerId: string, range: Range, color?: HighlightColor) => {
    const container = document.querySelector(`[data-highlight-container="${containerId}"]`);
    if (!container) {
      console.warn(`Container not found: ${containerId}`);
      return;
    }
    
    const offsets = getSelectionOffsets(container, range);
    if (!offsets) {
      console.warn('Could not get selection offsets');
      return;
    }
    
    // Use provided color or fall back to active color from state
    const highlightColor = color || state.activeColor;
    
    const newHighlight: HighlightRange = {
      id: generateId(),
      startOffset: offsets.startOffset,
      endOffset: offsets.endOffset,
      color: highlightColor,
      text: offsets.text,
      containerId,
    };
    
    setState(prev => {
      const containerHighlights = prev.highlights[containerId] || [];
      
      // Merge overlapping highlights of the same color
      const merged = mergeHighlights([...containerHighlights, newHighlight]);
      
      return {
        ...prev,
        // Also update active color to the one just used
        activeColor: highlightColor,
        highlights: {
          ...prev.highlights,
          [containerId]: merged,
        },
      };
    });
    
    // Clear selection after highlighting
    window.getSelection()?.removeAllRanges();
  }, [state.activeColor]);

  const removeHighlight = useCallback((containerId: string, highlightId: string) => {
    setState(prev => {
      const containerHighlights = prev.highlights[containerId] || [];
      return {
        ...prev,
        highlights: {
          ...prev.highlights,
          [containerId]: containerHighlights.filter(h => h.id !== highlightId),
        },
      };
    });
  }, []);

  const clearHighlights = useCallback((containerId: string) => {
    setState(prev => {
      const newHighlights = { ...prev.highlights };
      delete newHighlights[containerId];
      return {
        ...prev,
        highlights: newHighlights,
      };
    });
  }, []);

  const clearAllHighlights = useCallback(() => {
    setState(prev => ({
      ...prev,
      highlights: {},
    }));
  }, []);

  const getHighlights = useCallback((containerId: string): HighlightRange[] => {
    return state.highlights[containerId] || [];
  }, [state.highlights]);

  return {
    state,
    setActiveColor,
    addHighlight,
    removeHighlight,
    clearHighlights,
    clearAllHighlights,
    getHighlights,
  };
}

// Helper function to merge overlapping highlights
function mergeHighlights(highlights: HighlightRange[]): HighlightRange[] {
  if (highlights.length <= 1) return highlights;
  
  // Group by color
  const byColor: Record<string, HighlightRange[]> = {};
  highlights.forEach(h => {
    if (!byColor[h.color]) byColor[h.color] = [];
    byColor[h.color].push(h);
  });
  
  const merged: HighlightRange[] = [];
  
  Object.entries(byColor).forEach(([color, colorHighlights]) => {
    // Sort by start offset
    const sorted = [...colorHighlights].sort((a, b) => a.startOffset - b.startOffset);
    
    let current = sorted[0];
    
    for (let i = 1; i < sorted.length; i++) {
      const next = sorted[i];
      
      // Check if overlapping or adjacent
      if (next.startOffset <= current.endOffset) {
        // Merge
        current = {
          ...current,
          endOffset: Math.max(current.endOffset, next.endOffset),
          text: current.text, // Keep original text (we'll re-render anyway)
        };
      } else {
        merged.push(current);
        current = next;
      }
    }
    
    merged.push(current);
  });
  
  // Sort all merged highlights by start offset
  return merged.sort((a, b) => a.startOffset - b.startOffset);
}

export default useTextHighlight;
