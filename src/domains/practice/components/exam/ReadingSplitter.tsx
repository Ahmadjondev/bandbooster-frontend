/**
 * Reading Splitter Component
 * Vertical draggable splitter between passage and questions panels
 * Features:
 * - Drag-based resizing
 * - Real-time width changes
 * - Minimum and maximum width constraints
 */

'use client';

import { memo, useCallback, useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// ============= Constants =============

/** Minimum width for left panel (passage) in pixels */
const MIN_LEFT_WIDTH = 300;
/** Maximum width for left panel (passage) as percentage of container */
const MAX_LEFT_WIDTH_PERCENT = 70;
/** Minimum width for right panel (questions) in pixels */
const MIN_RIGHT_WIDTH = 300;

// ============= Types =============

export interface ReadingSplitterProps {
    /** Current left panel width percentage (0-100) */
    leftWidthPercent: number;
    /** Callback when width changes */
    onWidthChange: (leftWidthPercent: number) => void;
    /** Container reference for calculating bounds */
    containerRef: React.RefObject<HTMLDivElement | null>;
    /** Additional className */
    className?: string;
}

// ============= Component =============

export const ReadingSplitter = memo(function ReadingSplitter({
    leftWidthPercent,
    onWidthChange,
    containerRef,
    className,
}: ReadingSplitterProps) {
    const splitterRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Handle mouse down on splitter
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    // Handle mouse move while dragging
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !containerRef.current) return;

        const container = containerRef.current;
        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width;

        // Calculate new left panel width
        const mouseX = e.clientX - containerRect.left;
        let newLeftWidthPercent = (mouseX / containerWidth) * 100;

        // Apply constraints
        const minLeftPercent = (MIN_LEFT_WIDTH / containerWidth) * 100;
        const maxLeftPercent = Math.min(
            MAX_LEFT_WIDTH_PERCENT,
            100 - (MIN_RIGHT_WIDTH / containerWidth) * 100
        );

        newLeftWidthPercent = Math.max(minLeftPercent, Math.min(maxLeftPercent, newLeftWidthPercent));

        onWidthChange(newLeftWidthPercent);
    }, [isDragging, containerRef, onWidthChange]);

    // Handle mouse up to stop dragging
    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Add and remove event listeners for drag
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            // Prevent text selection while dragging
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'col-resize';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <div
            ref={splitterRef}
            onMouseDown={handleMouseDown}
            className={cn(
                // Positioning and size
                'w-1.5 shrink-0',
                'relative z-20',
                // Cursor
                'cursor-col-resize',
                // Visual appearance
                'bg-gray-200 dark:bg-gray-700',
                'hover:bg-primary-400 dark:hover:bg-primary-500',
                'transition-colors duration-150',
                // Active state
                isDragging && 'bg-primary-500 dark:bg-primary-400',
                className
            )}
            role="separator"
            aria-orientation="vertical"
            aria-valuenow={Math.round(leftWidthPercent)}
            aria-valuemin={0}
            aria-valuemax={100}
            tabIndex={0}
        >
            {/* Visual indicator / grip */}
            <div
                className="
    absolute left-1/2 top-1/2 
    -translate-x-1/2 -translate-y-1/2
    w-6 h-6 rounded-full
    bg-white border-2 border-gray-400
    shadow-md
    flex items-center justify-center
    cursor-col-resize
    hover:border-gray-600 hover:shadow-lg
    transition-all
  "
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-3 h-3 text-gray-600"
                >
                    <path d="m9 7-5 5 5 5" />
                    <path d="m15 7 5 5-5 5" />
                </svg>
            </div>

        </div>
    );
});

export default ReadingSplitter;
