/**
 * Theme Toggle Component
 * Dark/Light mode switch for practice page
 */

'use client';

import { memo, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Icons
const SunIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
);

const MoonIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);

export interface PracticeThemeToggleProps {
    isDark: boolean;
    onToggle: (isDark: boolean) => void;
}

export const PracticeThemeToggle = memo(function PracticeThemeToggle({
    isDark,
    onToggle,
}: PracticeThemeToggleProps) {
    const handleToggle = useCallback(() => {
        onToggle(!isDark);
    }, [isDark, onToggle]);

    return (
        <button
            onClick={handleToggle}
            className={cn(
                'relative flex items-center w-14 h-7 rounded-full transition-colors duration-300',
                'border',
                isDark
                    ? 'bg-slate-700 border-slate-600'
                    : 'bg-gray-200 border-gray-300'
            )}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {/* Slider */}
            <span
                className={cn(
                    'absolute w-5 h-5 rounded-full transition-all duration-300 flex items-center justify-center',
                    isDark
                        ? 'translate-x-7 bg-slate-900 text-amber-400'
                        : 'translate-x-1 bg-white text-amber-500 shadow-sm'
                )}
            >
                {isDark ? <MoonIcon /> : <SunIcon />}
            </span>
        </button>
    );
});

export default PracticeThemeToggle;
