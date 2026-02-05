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

/**
 * Find the text node and offset for a given boundary point
 * Handles cases where the container is an element, not a text node
 */
function resolveRangeBoundary(
  container: Node,
  offset: number
): { node: Node; offset: number } | null {
  // If it's already a text node, return it directly
  if (container.nodeType === Node.TEXT_NODE) {
    return { node: container, offset };
  }
  
  // If it's an element, try to find the text node at the offset
  if (container.nodeType === Node.ELEMENT_NODE) {
    const element = container as Element;
    
    // If offset points to a child node
    if (offset < element.childNodes.length) {
      const child = element.childNodes[offset];
      if (child.nodeType === Node.TEXT_NODE) {
        return { node: child, offset: 0 };
      }
      // If child is an element, get the first text node inside
      const textNodes = getTextNodesIn(child);
      if (textNodes.length > 0) {
        return { node: textNodes[0], offset: 0 };
      }
    }
    
    // Fallback: get all text nodes and find position
    const textNodes = getTextNodesIn(element);
    if (textNodes.length > 0) {
      // Return the last text node if offset is at the end
      const lastNode = textNodes[textNodes.length - 1];
      return { node: lastNode, offset: lastNode.textContent?.length ?? 0 };
    }
  }
  
  return null;
}

function getSelectionOffsets(
  container: Element,
  range: Range
): { startOffset: number; endOffset: number; text: string } | null {
  // Get all text nodes in the container
  const textNodes = getTextNodesIn(container);
  if (textNodes.length === 0) return null;
  
  // Resolve the start and end boundaries
  const startBoundary = resolveRangeBoundary(range.startContainer, range.startOffset);
  const endBoundary = resolveRangeBoundary(range.endContainer, range.endOffset);
  
  if (!startBoundary || !endBoundary) {
    // Try alternative method using text content matching
    return getSelectionOffsetsAlt(container, range);
  }
  
  let totalOffset = 0;
  let startOffset = -1;
  let endOffset = -1;
  
  for (const textNode of textNodes) {
    const nodeLength = textNode.textContent?.length || 0;
    
    // Check if this is the start node
    if (textNode === startBoundary.node || textNode.isSameNode(startBoundary.node)) {
      startOffset = totalOffset + startBoundary.offset;
    }
    
    // Check if this is the end node
    if (textNode === endBoundary.node || textNode.isSameNode(endBoundary.node)) {
      endOffset = totalOffset + endBoundary.offset;
    }
    
    totalOffset += nodeLength;
  }
  
  // If we still couldn't find the offsets, try the alternative method
  if (startOffset < 0 || endOffset < 0 || startOffset >= endOffset) {
    return getSelectionOffsetsAlt(container, range);
  }
  
  return {
    startOffset,
    endOffset,
    text: range.toString(),
  };
}

/**
 * Alternative method to get selection offsets using text content matching
 * More robust for complex DOM structures
 */
function getSelectionOffsetsAlt(
  container: Element,
  range: Range
): { startOffset: number; endOffset: number; text: string } | null {
  const selectedText = range.toString();
  if (!selectedText.trim()) return null;
  
  const containerText = container.textContent || '';
  if (!containerText) return null;
  
  // Create a range that spans from the start of the container to the start of the selection
  const preRange = document.createRange();
  preRange.setStart(container, 0);
  preRange.setEnd(range.startContainer, range.startOffset);
  
  // The length of text before the selection gives us the start offset
  const startOffset = preRange.toString().length;
  const endOffset = startOffset + selectedText.length;
  
  // Validate offsets
  if (startOffset < 0 || endOffset > containerText.length || startOffset >= endOffset) {
    return null;
  }
  
  return {
    startOffset,
    endOffset,
    text: selectedText,
  };
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
