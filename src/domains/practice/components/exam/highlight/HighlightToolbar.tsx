/**
 * Highlight Toolbar Component
 * Floating toolbar to select highlight colors
 * Positioned near the reading/listening content
 */

'use client';

import { cn } from '@/lib/utils';
import type { HighlightColor } from './types';

export interface HighlightToolbarProps {
    /** Currently active highlight color */
    activeColor: HighlightColor;
    /** Callback when color is selected */
    onColorChange: (color: HighlightColor) => void;
    /** Callback to clear all highlights */
    onClearAll?: () => void;
    /** Additional className */
    className?: string;
    /** Whether the toolbar is compact (icon only) */
    compact?: boolean;
}

const colorOptions: { color: HighlightColor; label: string; bgClass: string; activeClass: string }[] = [
    {
        color: 'yellow',
        label: 'Yellow',
        bgClass: 'bg-yellow-400',
        activeClass: 'ring-2 ring-yellow-500 ring-offset-1'
    },
    {
        color: 'green',
        label: 'Green',
        bgClass: 'bg-green-400',
        activeClass: 'ring-2 ring-green-500 ring-offset-1'
    },
];

export function HighlightToolbar({
    activeColor,
    onColorChange,
    onClearAll,
    className,
    compact = false,
}: HighlightToolbarProps) {
    return (
        <div
            className={cn(
                'flex items-center gap-2 px-3 py-2',
                'bg-white dark:bg-slate-800',
                'border border-gray-200 dark:border-gray-700',
                'rounded-lg shadow-sm',
                className
            )}
        >
            {/* Highlight icon */}
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
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
                {!compact && (
                    <span className="text-xs font-medium">Highlight</span>
                )}
            </div>

            {/* Color selector */}
            <div className="flex items-center gap-1.5 ml-1">
                {colorOptions.map(({ color, label, bgClass, activeClass }) => (
                    <button
                        key={color}
                        onClick={() => onColorChange(color)}
                        aria-label={`Select ${label} highlight`}
                        title={label}
                        className={cn(
                            'w-5 h-5 rounded-full transition-all',
                            bgClass,
                            activeColor === color && activeClass,
                            'hover:scale-110',
                            'focus:outline-none focus:ring-2 focus:ring-offset-1',
                            activeColor !== color && 'opacity-60 hover:opacity-100'
                        )}
                    />
                ))}
            </div>

            {/* Clear all button */}
            {onClearAll && (
                <>
                    <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
                    <button
                        onClick={onClearAll}
                        className={cn(
                            'flex items-center gap-1 px-2 py-1 rounded',
                            'text-xs text-gray-500 dark:text-gray-400',
                            'hover:bg-gray-100 dark:hover:bg-gray-700',
                            'hover:text-gray-700 dark:hover:text-gray-200',
                            'transition-colors'
                        )}
                        title="Clear all highlights"
                    >
                        <svg
                            className="w-3.5 h-3.5"
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
                        {!compact && <span>Clear</span>}
                    </button>
                </>
            )}
        </div>
    );
}

export default HighlightToolbar;
