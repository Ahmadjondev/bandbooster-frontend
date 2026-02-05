/**
 * Highlightable Questions Wrapper
 * Wraps question content areas to enable text highlighting
 * Used for both reading and listening question sections
 * 
 * Uses a different approach than HighlightableContent:
 * - Renders children as React nodes (not innerHTML)
 * - Manages highlights via DOM manipulation on mounted elements
 * - Stores highlights in context for persistence
 */

'use client';

import {
    useRef,
    useEffect,
    useCallback,
    useState,
    useMemo,
    type MouseEvent as ReactMouseEvent,
} from 'react';
import { cn } from '@/lib/utils';
import { useHighlightContext } from './HighlightProvider';
import { SelectionPopup } from './SelectionPopup';
import { HighlightPopup } from './HighlightPopup';
import type { HighlightColor, HighlightRange, HighlightPopupPosition } from './types';

/** Position for the selection popup */
interface SelectionPopupPosition {
    x: number;
    y: number;
    range: Range;
}

export interface HighlightableQuestionsProps {
    /** Unique identifier for this question group (e.g., 'questions-{passageNumber}') */
    groupId: string;
    /** Children to render (the actual question content) */
    children: React.ReactNode;
    /** Additional class name */
    className?: string;
    /** Whether highlighting is enabled (default: true) */
    enabled?: boolean;
}

/**
 * Apply stored highlights to the DOM
 * This re-applies highlights after React re-renders
 */
function applyHighlightsToDOM(container: HTMLElement, highlights: HighlightRange[]): void {
    if (!highlights.length) return;

    // Remove existing highlights first
    const existingHighlights = container.querySelectorAll('.note-highlight');
    existingHighlights.forEach(el => {
        const text = el.textContent || '';
        const textNode = document.createTextNode(text);
        el.parentNode?.replaceChild(textNode, el);
    });

    // Normalize to merge adjacent text nodes
    container.normalize();

    // Get full text content for offset mapping
    const fullText = container.textContent || '';

    // Sort highlights by start offset (descending) to apply from end to start
    const sortedHighlights = [...highlights].sort((a, b) => b.startOffset - a.startOffset);

    for (const highlight of sortedHighlights) {
        applyHighlightToElement(container, highlight, fullText);
    }
}

function applyHighlightToElement(
    container: Element,
    highlight: HighlightRange,
    fullText: string
): void {
    const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        null
    );

    let currentOffset = 0;
    const nodesToHighlight: { node: Text; start: number; end: number }[] = [];

    let node: Node | null;
    while ((node = walker.nextNode())) {
        const textNode = node as Text;
        const nodeLength = textNode.textContent?.length || 0;
        const nodeStart = currentOffset;
        const nodeEnd = currentOffset + nodeLength;

        // Check if this node overlaps with the highlight
        if (nodeEnd > highlight.startOffset && nodeStart < highlight.endOffset) {
            const highlightStart = Math.max(0, highlight.startOffset - nodeStart);
            const highlightEnd = Math.min(nodeLength, highlight.endOffset - nodeStart);

            nodesToHighlight.push({
                node: textNode,
                start: highlightStart,
                end: highlightEnd,
            });
        }

        currentOffset += nodeLength;
    }

    // Apply highlights in reverse order to preserve offsets
    for (let i = nodesToHighlight.length - 1; i >= 0; i--) {
        const { node: textNode, start, end } = nodesToHighlight[i];
        const text = textNode.textContent || '';

        const before = text.substring(0, start);
        const highlighted = text.substring(start, end);
        const after = text.substring(end);

        const span = document.createElement('span');
        span.className = `note-highlight note-highlight-${highlight.color}`;
        span.setAttribute('data-highlight-id', highlight.id);
        span.textContent = highlighted;

        const fragment = document.createDocumentFragment();
        if (before) fragment.appendChild(document.createTextNode(before));
        fragment.appendChild(span);
        if (after) fragment.appendChild(document.createTextNode(after));

        textNode.parentNode?.replaceChild(fragment, textNode);
    }
}

/**
 * Wrapper component that enables text highlighting on question content
 * Works with the HighlightProvider context
 */
export function HighlightableQuestions({
    groupId,
    children,
    className,
    enabled = true,
}: HighlightableQuestionsProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [removePopupPosition, setRemovePopupPosition] = useState<HighlightPopupPosition | null>(null);
    const [selectionPopupPosition, setSelectionPopupPosition] = useState<SelectionPopupPosition | null>(null);

    const highlightContext = useHighlightContext();

    // Generate a unique container ID
    const containerId = useMemo(() => `questions-${groupId}`, [groupId]);
    const highlights = highlightContext.getHighlights(containerId);
    const activeColor = highlightContext.state.activeColor;

    // Apply highlights to DOM after render
    useEffect(() => {
        if (!containerRef.current || !enabled) return;

        // Use requestAnimationFrame to ensure DOM is ready
        const rafId = requestAnimationFrame(() => {
            if (containerRef.current) {
                applyHighlightsToDOM(containerRef.current, highlights);
            }
        });

        return () => cancelAnimationFrame(rafId);
    }, [highlights, enabled, children]);

    // Handle text selection - show popup for explicit highlight action
    const handleMouseUp = useCallback((e: ReactMouseEvent) => {
        // Close any existing remove popup first
        setRemovePopupPosition(null);

        if (!enabled) {
            setSelectionPopupPosition(null);
            return;
        }

        // Small delay to let the selection finalize
        requestAnimationFrame(() => {
            const selection = window.getSelection();
            if (!selection || selection.isCollapsed) {
                setSelectionPopupPosition(null);
                return;
            }

            const range = selection.getRangeAt(0);
            const selectedText = range.toString().trim();

            if (!selectedText || selectedText.length < 1) {
                setSelectionPopupPosition(null);
                return;
            }

            // Check if selection is within our container
            const container = containerRef.current;
            if (!container) {
                setSelectionPopupPosition(null);
                return;
            }

            if (!container.contains(range.commonAncestorContainer)) {
                setSelectionPopupPosition(null);
                return;
            }

            // Don't show selection popup if clicking on already highlighted text
            const target = e.target as HTMLElement;
            if (target.classList.contains('note-highlight')) {
                setSelectionPopupPosition(null);
                return;
            }

            // Get selection bounds to position the popup
            const selectionRect = range.getBoundingClientRect();

            // Validate that the rect is valid
            if (selectionRect.width === 0 && selectionRect.height === 0) {
                setSelectionPopupPosition(null);
                return;
            }

            // Show selection popup with highlight options
            setSelectionPopupPosition({
                x: selectionRect.left + selectionRect.width / 2,
                y: selectionRect.bottom + 8,
                range: range.cloneRange(), // Clone range to preserve it
            });
        });
    }, [enabled]);

    // Handle explicit highlight action from selection popup
    const handleHighlightSelection = useCallback((color: HighlightColor) => {
        if (!selectionPopupPosition) return;

        // Create the highlight with the explicitly selected color
        highlightContext.addHighlight(containerId, selectionPopupPosition.range, color);

        // Clear selection and close popup
        window.getSelection()?.removeAllRanges();
        setSelectionPopupPosition(null);
    }, [selectionPopupPosition, containerId, highlightContext]);

    // Handle click on highlighted text to show remove popup
    const handleClick = useCallback((e: ReactMouseEvent) => {
        const target = e.target as HTMLElement;

        // Close selection popup when clicking elsewhere
        if (!target.classList.contains('note-highlight')) {
            return;
        }

        // Show remove popup for highlighted text
        const highlightId = target.getAttribute('data-highlight-id');
        if (highlightId) {
            const rect = target.getBoundingClientRect();
            setRemovePopupPosition({
                x: rect.left + rect.width / 2,
                y: rect.bottom + 8,
                highlightId,
                containerId,
            });
            setSelectionPopupPosition(null); // Close selection popup
            e.stopPropagation();
        }
    }, [containerId]);

    // Close selection popup
    const handleCloseSelectionPopup = useCallback(() => {
        setSelectionPopupPosition(null);
        window.getSelection()?.removeAllRanges();
    }, []);

    // Close remove popup
    const handleCloseRemovePopup = useCallback(() => {
        setRemovePopupPosition(null);
    }, []);

    // Handle remove highlight from popup
    const handleRemoveHighlight = useCallback((cId: string, highlightId: string) => {
        highlightContext.removeHighlight(cId, highlightId);
        setRemovePopupPosition(null);
    }, [highlightContext]);

    // Close popups on scroll
    useEffect(() => {
        const handleScroll = () => {
            setRemovePopupPosition(null);
            setSelectionPopupPosition(null);
        };

        window.addEventListener('scroll', handleScroll, true);
        return () => {
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, []);

    // Close selection popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // If clicking outside the container and popups, close selection popup
            if (containerRef.current && !containerRef.current.contains(target)) {
                setSelectionPopupPosition(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // If highlighting is disabled, render children directly
    if (!enabled) {
        return <div className={className}>{children}</div>;
    }

    return (
        <>
            <div
                ref={containerRef}
                data-highlight-container={containerId}
                className={cn(
                    'highlightable-questions',
                    enabled && 'cursor-text select-text',
                    className
                )}
                onMouseUp={handleMouseUp}
                onClick={handleClick}
            >
                {children}
            </div>

            {/* Selection popup - shows highlight color options */}
            <SelectionPopup
                position={selectionPopupPosition ? { x: selectionPopupPosition.x, y: selectionPopupPosition.y } : null}
                activeColor={activeColor}
                onHighlight={handleHighlightSelection}
                onClose={handleCloseSelectionPopup}
            />

            {/* Remove highlight popup */}
            <HighlightPopup
                position={removePopupPosition}
                onRemove={handleRemoveHighlight}
                onClose={handleCloseRemovePopup}
            />
        </>
    );
}
