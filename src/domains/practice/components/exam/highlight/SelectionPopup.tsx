/**
 * Selection Popup Component
 * Shows highlight color options when text is selected
 * User must explicitly click a color button to highlight
 */

'use client';

import { useEffect, useRef } from 'react';
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

const colorOptions: { color: HighlightColor; label: string; bgClass: string; hoverClass: string }[] = [
    {
        color: 'yellow',
        label: 'Yellow',
        bgClass: 'bg-yellow-400',
        hoverClass: 'hover:bg-yellow-500',
    },
    {
        color: 'green',
        label: 'Green',
        bgClass: 'bg-green-400',
        hoverClass: 'hover:bg-green-500',
    },
];

export function SelectionPopup({ position, activeColor, onHighlight, onClose }: SelectionPopupProps) {
    const popupRef = useRef<HTMLDivElement>(null);

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

    return (
        <AnimatePresence>
            {position && (
                <motion.div
                    ref={popupRef}
                    initial={{ opacity: 0, scale: 0.9, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 5 }}
                    transition={{ duration: 0.12 }}
                    className={cn(
                        'fixed z-[100] bg-white dark:bg-slate-800',
                        'rounded-lg shadow-lg border border-gray-200 dark:border-gray-700',
                        'px-2 py-1.5 flex items-center gap-1'
                    )}
                    style={{
                        left: position.x,
                        top: position.y - 80,
                        transform: 'translateX(-50%)',
                    }}
                >
                    {/* Highlight icon */}
                    <div className="flex items-center px-1.5 text-gray-500 dark:text-gray-400">
                        <svg
                            className="w-4 h-4"
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
                    <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />

                    {/* Color buttons */}
                    <div className="flex items-center gap-1 px-1">
                        {colorOptions.map(({ color, label, bgClass, hoverClass }) => (
                            <button
                                key={color}
                                onClick={() => onHighlight(color)}
                                aria-label={`Highlight with ${label}`}
                                title={`Highlight ${label}`}
                                className={cn(
                                    'w-6 h-6 rounded-full transition-all',
                                    bgClass,
                                    hoverClass,
                                    'hover:scale-110 active:scale-95',
                                    'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500',
                                    activeColor === color && 'ring-2 ring-offset-1 ring-gray-400 dark:ring-gray-500'
                                )}
                            />
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        aria-label="Cancel"
                        title="Cancel"
                        className={cn(
                            'p-1.5 rounded-md',
                            'text-gray-400 dark:text-gray-500',
                            'hover:bg-gray-100 dark:hover:bg-gray-700',
                            'hover:text-gray-600 dark:hover:text-gray-300',
                            'transition-colors'
                        )}
                    >
                        <svg
                            className="w-4 h-4"
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
