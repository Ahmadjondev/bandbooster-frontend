/**
 * Selection Popup Component
 * Shows highlight color options when text is selected
 * User must explicitly click a color button to highlight
 * Optimized for touch and click with larger targets and better positioning
 */

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { HighlightColor } from './types';

export interface SelectionPopupProps {
    /** Position for the popup */
    position: { x: number; y: number } | null;
    /** Currently active highlight color */
    activeColor: HighlightColor;
    /** Callback when user clicks to highlight with a color */
    onHighlight: (color: HighlightColor) => void;
    /** Callback to close the popup */
    onClose: () => void;
}

const colorOptions: { color: HighlightColor; label: string; bgClass: string; ringClass: string }[] = [
    {
        color: 'yellow',
        label: 'Yellow',
        bgClass: 'bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600',
        ringClass: 'ring-yellow-600',
    },
    // {
    //     color: 'green',
    //     label: 'Green',
    //     bgClass: 'bg-green-400 hover:bg-green-500 active:bg-green-600',
    //     ringClass: 'ring-green-600',
    // },
];

export function SelectionPopup({ position, activeColor, onHighlight, onClose }: SelectionPopupProps) {
    const popupRef = useRef<HTMLDivElement>(null);
    const [adjustedPosition, setAdjustedPosition] = useState<{ x: number; y: number } | null>(null);

    // Adjust position to keep popup in viewport
    useEffect(() => {
        if (!position || !popupRef.current) {
            setAdjustedPosition(position);
            return;
        }

        const popup = popupRef.current;
        const rect = popup.getBoundingClientRect();
        const padding = 12;

        let x = position.x;
        let y = position.y;

        // Adjust horizontal position
        const halfWidth = rect.width / 2;
        if (x - halfWidth < padding) {
            x = halfWidth + padding;
        } else if (x + halfWidth > window.innerWidth - padding) {
            x = window.innerWidth - halfWidth - padding;
        }

        // Show above selection if not enough space below
        if (y + rect.height > window.innerHeight - padding) {
            // Position above the selection (accounting for selection height ~20px)
            y = position.y - rect.height - 40;
        }

        // Ensure not above viewport
        if (y < padding) {
            y = padding;
        }

        setAdjustedPosition({ x, y });
    }, [position]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (position) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [position, onClose]);

    // Prevent popup from closing when interacting with it
    const handlePopupMouseDown = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
    }, []);

    const handleHighlightClick = useCallback((color: HighlightColor, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onHighlight(color);
    }, [onHighlight]);

    const handleCloseClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onClose();
    }, [onClose]);

    return (
        <AnimatePresence>
            {position && (
                <motion.div
                    ref={popupRef}
                    initial={{ opacity: 0, scale: 0.9, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 5 }}
                    transition={{ duration: 0.1, ease: 'easeOut' }}
                    onMouseDown={handlePopupMouseDown}
                    className={cn(
                        'fixed z-100 bg-white dark:bg-slate-800',
                        'rounded-xl shadow-xl border border-gray-200 dark:border-gray-600',
                        'px-2 py-2 flex items-center gap-2',
                        'select-none touch-manipulation'
                    )}
                    style={{
                        left: adjustedPosition?.x ?? position.x,
                        top: adjustedPosition?.y ?? position.y,
                        transform: 'translateX(-50%)',
                    }}
                >
                    {/* Highlight icon */}
                    <div className="flex items-center justify-center w-8 h-8 text-gray-500 dark:text-gray-400">
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                        </svg>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-8 bg-gray-200 dark:bg-gray-600" />

                    {/* Color buttons - larger touch targets */}
                    <div className="flex items-center gap-2">
                        {colorOptions.map(({ color, label, bgClass, ringClass }) => (
                            <button
                                key={color}
                                type="button"
                                onClick={(e) => handleHighlightClick(color, e)}
                                onTouchEnd={(e) => {
                                    e.preventDefault();
                                    onHighlight(color);
                                }}
                                aria-label={`Highlight with ${label}`}
                                title={label}
                                className={cn(
                                    'w-9 h-9 rounded-full transition-all duration-100',
                                    bgClass,
                                    'hover:scale-110 active:scale-95',
                                    'focus:outline-none focus:ring-2 focus:ring-offset-2',
                                    activeColor === color
                                        ? `ring-2 ring-offset-2 ${ringClass} dark:ring-offset-slate-800`
                                        : 'focus:ring-blue-500'
                                )}
                            />
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="w-px h-8 bg-gray-200 dark:bg-gray-600" />

                    {/* Close button - larger touch target */}
                    <button
                        type="button"
                        onClick={handleCloseClick}
                        onTouchEnd={(e) => {
                            e.preventDefault();
                            onClose();
                        }}
                        aria-label="Cancel"
                        title="Cancel"
                        className={cn(
                            'w-9 h-9 flex items-center justify-center rounded-lg',
                            'text-gray-400 dark:text-gray-500',
                            'hover:bg-gray-100 dark:hover:bg-gray-700',
                            'hover:text-gray-600 dark:hover:text-gray-300',
                            'active:bg-gray-200 dark:active:bg-gray-600',
                            'transition-colors duration-100'
                        )}
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default SelectionPopup;
