/**
 * Highlight Popup Component
 * Shows a popup to remove highlight when clicking on highlighted text
 */

'use client';

import { useEffect, useRef } from 'react';
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
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [position, onClose]);

    const handleRemove = () => {
        if (position) {
            onRemove(position.containerId, position.highlightId);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {position && (
                <motion.div
                    ref={popupRef}
                    initial={{ opacity: 0, scale: 0.9, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                        'fixed z-[100] bg-white dark:bg-slate-800',
                        'rounded-lg shadow-lg border border-gray-200 dark:border-gray-700',
                        'px-2 py-1.5'
                    )}
                    style={{
                        left: position.x,
                        top: position.y,
                        transform: 'translateX(-50%)',
                    }}
                >
                    <button
                        onClick={handleRemove}
                        className={cn(
                            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-md',
                            'text-sm font-medium text-red-600 dark:text-red-400',
                            'hover:bg-red-50 dark:hover:bg-red-900/20',
                            'transition-colors duration-150'
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
                        Remove Highlight
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default HighlightPopup;
