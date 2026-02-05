/**
 * Highlightable Content Component
 * Wraps content and enables text highlighting with explicit user action
 * Renders stored highlights and handles click-to-remove
 * 
 * IMPORTANT: Highlighting only occurs after explicit user action (clicking highlight button)
 * Text selection is passive and does not automatically create highlights
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
import { HighlightPopup } from './HighlightPopup';
import { SelectionPopup } from './SelectionPopup';
import type { HighlightRange, HighlightColor, HighlightPopupPosition } from './types';

/** Position for the selection popup */
interface SelectionPopupPosition {
    x: number;
    y: number;
    range: Range;
}

export interface HighlightableContentProps {
    /** Unique container ID for this content area */
    containerId: string;
    /** Content to render (HTML string) */
    content: string;
    /** Stored highlights for this container */
    highlights: HighlightRange[];
    /** Current active highlight color */
    activeColor: HighlightColor;
    /** Callback when text is selected and should be highlighted (with optional color) */
    onHighlight: (containerId: string, range: Range, color?: HighlightColor) => void;
    /** Callback to remove a highlight */
    onRemoveHighlight: (containerId: string, highlightId: string) => void;
    /** Callback to set active color (optional, used for syncing toolbar) */
    onColorChange?: (color: HighlightColor) => void;
    /** Additional className */
    className?: string;
    /** Whether highlighting is enabled */
    enabled?: boolean;
    /** Whether to allow highlighting (e.g., during review, disable it) */
    allowHighlighting?: boolean;
}

// Apply highlights to HTML content
function applyHighlightsToHtml(
    html: string,
    highlights: HighlightRange[]
): string {
    if (!highlights.length) return html;

    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Get all text content as a single string to map offsets
    const textContent = tempDiv.textContent || '';

    // Sort highlights by start offset (descending) to apply from end to start
    const sortedHighlights = [...highlights].sort((a, b) => b.startOffset - a.startOffset);

    // Apply each highlight
    for (const highlight of sortedHighlights) {
        applyHighlightToElement(tempDiv, highlight, textContent);
    }

    return tempDiv.innerHTML;
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

export function HighlightableContent({
    containerId,
    content,
    highlights,
    activeColor,
    onHighlight,
    onRemoveHighlight,
    onColorChange,
    className,
    enabled = true,
    allowHighlighting = true,
}: HighlightableContentProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [removePopupPosition, setRemovePopupPosition] = useState<HighlightPopupPosition | null>(null);
    const [selectionPopupPosition, setSelectionPopupPosition] = useState<SelectionPopupPosition | null>(null);

    // Apply highlights to content
    const highlightedContent = useMemo(() => {
        if (typeof window === 'undefined') return content;
        return applyHighlightsToHtml(content, highlights);
    }, [content, highlights]);

    // Handle text selection - show popup for explicit highlight action
    const handleMouseUp = useCallback((e: ReactMouseEvent) => {
        // Close any existing remove popup first
        setRemovePopupPosition(null);

        if (!enabled || !allowHighlighting) {
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
    }, [enabled, allowHighlighting]);

    // Handle explicit highlight action from selection popup
    const handleHighlightSelection = useCallback((color: HighlightColor) => {
        if (!selectionPopupPosition) return;

        // Create the highlight with the explicitly selected color
        // Pass the color directly to ensure it's used (not dependent on state update timing)
        onHighlight(containerId, selectionPopupPosition.range, color);

        // Clear selection and close popup
        window.getSelection()?.removeAllRanges();
        setSelectionPopupPosition(null);
    }, [selectionPopupPosition, containerId, onHighlight]);

    // Handle click on highlighted text to show remove popup
    const handleClick = useCallback((e: ReactMouseEvent) => {
        const target = e.target as HTMLElement;

        // Close selection popup when clicking elsewhere
        if (!target.classList.contains('note-highlight')) {
            // Don't close if we just finished selecting (mouseup handles that)
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
        onRemoveHighlight(cId, highlightId);
        setRemovePopupPosition(null);
    }, [onRemoveHighlight]);

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

    return (
        <>
            <div
                ref={containerRef}
                data-highlight-container={containerId}
                className={cn(
                    'highlightable-content',
                    enabled && allowHighlighting && 'cursor-text',
                    className
                )}
                onMouseUp={handleMouseUp}
                onClick={handleClick}
                dangerouslySetInnerHTML={{ __html: highlightedContent }}
            />

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


export default HighlightableContent;
