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
                className={cn(
                    'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
                    'w-1 h-8 rounded-full',
                    'bg-gray-400 dark:bg-gray-500',
                    isDragging && 'bg-white dark:bg-gray-200'
                )}
            />
        </div>
    );
});

export default ReadingSplitter;
