/**
 * IELTS Exam Header Component
 * Pixel-perfect header matching official IELTS test interface
 * Includes timer, theme toggle, and fullscreen controls
 */

'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { PracticeTimer } from './PracticeTimer';
import { PracticeThemeToggle } from './PracticeThemeToggle';
import { cn } from '@/lib/utils';

// Icons
const ArrowLeftIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m15 18-6-6 6-6" />
    </svg>
);

const ExpandIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
);

const ShrinkIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
    </svg>
);

const CheckIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const WarningIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
    </svg>
);

const CloseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
    </svg>
);

export interface IELTSHeaderProps {
    testTakerId?: string;
    onBack?: () => void;
    /** Timer duration in minutes */
    timerMinutes?: number;
    /** Callback when timer reaches zero */
    onTimeUp?: () => void;
    /** Callback when timer starts */
    onTimerStart?: (startedAt: Date) => void;
    /** Dark mode state */
    isDarkMode?: boolean;
    /** Dark mode toggle callback */
    onThemeToggle?: (isDark: boolean) => void;
    /** Show timer */
    showTimer?: boolean;
    /** Show theme toggle */
    showThemeToggle?: boolean;
    /** Submit button click handler */
    onSubmit?: () => void;
    /** Show submit button */
    showSubmit?: boolean;
    /** Whether user has any answers - used for submit validation */
    hasAnswers?: boolean;
    /** Additional content to render on the right side (before theme toggle) */
    rightContent?: ReactNode;
}

export function IELTSHeader({
    onBack,
    timerMinutes = 40,
    onTimeUp,
    onTimerStart,
    isDarkMode = false,
    onThemeToggle,
    showTimer = true,
    showThemeToggle = true,
    onSubmit,
    showSubmit = true,
    hasAnswers = false,
    rightContent,
}: IELTSHeaderProps) {
    const router = useRouter();
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showWarning, setShowWarning] = useState(false);

    // Track fullscreen state changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    const toggleFullscreen = useCallback(async () => {
        try {
            if (!document.fullscreenElement) {
                // Enter fullscreen
                const element = document.documentElement;
                if (element.requestFullscreen) {
                    await element.requestFullscreen();
                } else if ((element as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
                    await (element as HTMLElement & { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
                } else if ((element as HTMLElement & { mozRequestFullScreen?: () => Promise<void> }).mozRequestFullScreen) {
                    await (element as HTMLElement & { mozRequestFullScreen: () => Promise<void> }).mozRequestFullScreen();
                } else if ((element as HTMLElement & { msRequestFullscreen?: () => Promise<void> }).msRequestFullscreen) {
                    await (element as HTMLElement & { msRequestFullscreen: () => Promise<void> }).msRequestFullscreen();
                }
            } else {
                // Exit fullscreen
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if ((document as Document & { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen) {
                    await (document as Document & { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen();
                } else if ((document as Document & { mozCancelFullScreen?: () => Promise<void> }).mozCancelFullScreen) {
                    await (document as Document & { mozCancelFullScreen: () => Promise<void> }).mozCancelFullScreen();
                } else if ((document as Document & { msExitFullscreen?: () => Promise<void> }).msExitFullscreen) {
                    await (document as Document & { msExitFullscreen: () => Promise<void> }).msExitFullscreen();
                }
            }
        } catch (error) {
            console.error('Fullscreen error:', error);
        }
    }, []);

    return (
        <header className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 z-[999]">
            {/* Left Section */}
            <div className="flex items-center gap-4">
                {/* Back Button */}
                <button
                    onClick={handleBack}
                    className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeftIcon />
                    <span className="text-sm font-medium hidden sm:inline">Back</span>
                </button>

                {/* IELTS Logo */}
                <div className="bg-red-600 text-white text-xs font-bold px-2.5 py-1.5 rounded">
                    IELTS
                </div>

            </div>

            {/* Center Section - Timer */}
            {showTimer && (
                <div className="flex items-center">
                    <PracticeTimer
                        defaultMinutes={timerMinutes}
                        onTimeUp={onTimeUp}
                        onStart={onTimerStart}
                    />
                </div>
            )}

            {/* Right Section */}
            <div className="flex items-center gap-2">
                {/* Custom Right Content (e.g., Highlight Toolbar) */}
                {rightContent}

                {/* Theme Toggle */}
                {showThemeToggle && onThemeToggle && (
                    <PracticeThemeToggle
                        isDark={isDarkMode}
                        onToggle={onThemeToggle}
                    />
                )}

                {/* Fullscreen Button */}
                <button
                    onClick={toggleFullscreen}
                    aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors hidden sm:flex"
                >
                    {isFullscreen ? <ShrinkIcon /> : <ExpandIcon />}
                </button>

                {/* Submit Button */}
                {showSubmit && onSubmit && (
                    <div className="relative">
                        <button
                            onClick={() => {
                                if (hasAnswers) {
                                    onSubmit();
                                } else {
                                    setShowWarning(true);
                                }
                            }}
                            aria-label="Submit answers"
                            className={cn(
                                "h-9 px-4 flex items-center gap-1.5 rounded-lg text-white text-sm font-medium transition-colors shadow-sm",
                                hasAnswers
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                            )}
                        >
                            <CheckIcon />
                            <span>Submit</span>
                        </button>

                        {/* Warning Tooltip */}
                        {showWarning && !hasAnswers && (
                            <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-amber-200 dark:border-amber-700 z-50 overflow-hidden">
                                <div className="bg-amber-50 dark:bg-amber-900/30 px-4 py-3 border-b border-amber-200 dark:border-amber-700 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                        <WarningIcon />
                                        <span className="font-semibold text-sm">Cannot Submit</span>
                                    </div>
                                    <button
                                        onClick={() => setShowWarning(false)}
                                        className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200"
                                    >
                                        <CloseIcon />
                                    </button>
                                </div>
                                <div className="px-4 py-3">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        Please answer at least one question before submitting your test.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}