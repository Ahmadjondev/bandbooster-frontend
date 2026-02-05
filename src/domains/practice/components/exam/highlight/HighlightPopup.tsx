/**
 * Highlight Popup Component
 * Shows a popup to remove highlight when clicking on highlighted text
 * Optimized for touch and click with larger targets
 */

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { HighlightPopupPosition } from './types';

export interface HighlightPopupProps {
    /** Position and highlight info */
    position: HighlightPopupPosition | null;
    /** Callback to remove the highlight */
    onRemove: (containerId: string, highlightId: string) => void;
    /** Callback to close the popup */
    onClose: () => void;
}

export function HighlightPopup({ position, onRemove, onClose }: HighlightPopupProps) {
    const popupRef = useRef<HTMLDivElement>(null);
    const [adjustedPosition, setAdjustedPosition] = useState<{ x: number; y: number } | null>(null);

    // Adjust position to keep popup in viewport
    useEffect(() => {
        if (!position || !popupRef.current) {
            setAdjustedPosition(position ? { x: position.x, y: position.y } : null);
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

        // Ensure popup doesn't go below viewport
        if (y + rect.height > window.innerHeight - padding) {
            y = position.y - rect.height - 40;
        }

        // Ensure not above viewport
        if (y < padding) {
            y = padding;
        }

        setAdjustedPosition({ x, y });
    }, [position]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (position) {
            // Delay adding listener to avoid immediate close
            const timeoutId = setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside);
            }, 100);
            document.addEventListener('keydown', handleKeyDown);

            return () => {
                clearTimeout(timeoutId);
                document.removeEventListener('mousedown', handleClickOutside);
                document.removeEventListener('keydown', handleKeyDown);
            };
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [position, onClose]);

    const handleRemove = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (position) {
            onRemove(position.containerId, position.highlightId);
            onClose();
        }
    }, [position, onRemove, onClose]);

    // Prevent popup from closing when interacting with it
    const handlePopupMouseDown = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
    }, []);

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
                        'p-1.5 select-none touch-manipulation'
                    )}
                    style={{
                        left: adjustedPosition?.x ?? position.x,
                        top: adjustedPosition?.y ?? position.y,
                        transform: 'translateX(-50%)',
                    }}
                >
                    <button
                        type="button"
                        onClick={handleRemove}
                        onTouchEnd={(e) => {
                            e.preventDefault();
                            if (position) {
                                onRemove(position.containerId, position.highlightId);
                                onClose();
                            }
                        }}
                        className={cn(
                            'flex items-center gap-2 px-4 py-2.5 rounded-lg min-h-11',
                            'text-sm font-medium text-red-600 dark:text-red-400',
                            'hover:bg-red-50 dark:hover:bg-red-900/20',
                            'active:bg-red-100 dark:active:bg-red-900/30',
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                        Remove
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default HighlightPopup;
