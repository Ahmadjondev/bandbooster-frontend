/**
 * Exam Header Component
 * Top navigation bar with timer, controls, and exit button
 * Reusable across all exam/practice sections
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

// Icons
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const SunIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
);

const MoonIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);

const FullscreenIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
);

const ExitFullscreenIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
    </svg>
);

const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18M6 6l12 12" />
    </svg>
);

const FontSizeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 0 1 6.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
    </svg>
);

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6" />
    </svg>
);

export interface ExamHeaderProps {
    /** Time remaining in seconds */
    timeRemaining: number;
    /** Callback when time changes (for parent sync) */
    onTimeChange?: (time: number) => void;
    /** Callback when exit is clicked */
    onExit?: () => void;
    /** Callback when next section is clicked */
    onNextSection?: () => void;
    /** Next section button label */
    nextSectionLabel?: string;
    /** Whether to show the next section button */
    showNextSection?: boolean;
    /** Practice/Exam title */
    title?: string;
    /** Current section name (e.g., "LISTENING", "READING") */
    sectionName?: string;
}

const FONT_SIZES = [
    { class: 'text-xs', label: 'Extra Small' },
    { class: 'text-sm', label: 'Small' },
    { class: 'text-base', label: 'Medium' },
    { class: 'text-lg', label: 'Large' },
    { class: 'text-xl', label: 'Extra Large' },
    { class: 'text-2xl', label: '2X Large' },
];

export function ExamHeader({
    timeRemaining,
    onTimeChange,
    onExit,
    onNextSection,
    nextSectionLabel = 'Finish',
    showNextSection = true,
    title,
    sectionName,
}: ExamHeaderProps) {
    const router = useRouter();
    const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
    const [fontSizeIndex, setFontSizeIndex] = useState(2); // Medium (text-base)
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const showWarning = timeRemaining < 300; // 5 minutes

    // Format time as MM:SS
    const formatTime = (seconds: number): string => {
        if (seconds < 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${String(secs).padStart(2, '0')}`;
    };

    // Font size controls
    const selectFontSize = (index: number) => {
        setFontSizeIndex(index);
        setShowFontSizeDropdown(false);
        localStorage.setItem('exam-font-size', index.toString());
        window.dispatchEvent(new CustomEvent('fontSizeChange', {
            detail: { fontSize: FONT_SIZES[index].class }
        }));
    };

    // Theme toggle
    const toggleTheme = () => {
        const newTheme = !isDarkTheme;
        setIsDarkTheme(newTheme);
        document.documentElement.classList.toggle('dark', newTheme);
        localStorage.setItem('exam-theme', newTheme ? 'dark' : 'light');
    };

    // Fullscreen controls
    const requestFullscreen = () => {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        }
    };

    const exitFullscreen = () => {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    };

    const checkFullscreenState = () => {
        const isCurrentlyFullscreen = !!(
            document.fullscreenElement ||
            (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement ||
            (document as unknown as { mozFullScreenElement?: Element }).mozFullScreenElement
        );
        setIsFullscreen(isCurrentlyFullscreen);
    };

    // Handle exit
    const handleExit = () => {
        if (onExit) {
            onExit();
        } else {
            router.back();
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        if (!showFontSizeDropdown) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowFontSizeDropdown(false);
            }
        };

        const timeoutId = setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 0);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [showFontSizeDropdown]);

    // Initialize font size and theme from localStorage
    useEffect(() => {
        const savedFontSize = localStorage.getItem('exam-font-size');
        if (savedFontSize) {
            const index = parseInt(savedFontSize);
            if (index >= 0 && index < FONT_SIZES.length) {
                setFontSizeIndex(index);
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('fontSizeChange', {
                        detail: { fontSize: FONT_SIZES[index].class }
                    }));
                }, 0);
            }
        }

        // Initialize theme
        const savedTheme = localStorage.getItem('exam-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
        setIsDarkTheme(shouldBeDark);
        document.documentElement.classList.toggle('dark', shouldBeDark);
    }, []);

    // Monitor fullscreen state
    useEffect(() => {
        checkFullscreenState();

        const handleFullscreenChange = () => checkFullscreenState();

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        };
    }, []);

    return (
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 transition-colors duration-300">
            <div className="flex items-center justify-between">
                {/* Left: Title/Section */}
                <div className="flex items-center gap-4">
                    {title && (
                        <h1 className="text-lg font-semibold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-[300px]">
                            {title}
                        </h1>
                    )}
                    {sectionName && (
                        <span className="px-3 py-1 text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                            {sectionName}
                        </span>
                    )}
                </div>

                {/* Right: Controls */}
                <div className="flex items-center gap-2">
                    {/* Font Size Dropdown */}
                    <div ref={dropdownRef} className="relative">
                        <button
                            onClick={() => setShowFontSizeDropdown(!showFontSizeDropdown)}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                            title="Change font size"
                        >
                            <FontSizeIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">{FONT_SIZES[fontSizeIndex].label}</span>
                            <ChevronDownIcon className="w-4 h-4" />
                        </button>

                        {showFontSizeDropdown && (
                            <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-50">
                                {FONT_SIZES.map((size, index) => (
                                    <button
                                        key={index}
                                        onClick={() => selectFontSize(index)}
                                        className={cn(
                                            'w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors first:rounded-t-lg last:rounded-b-lg',
                                            fontSizeIndex === index
                                                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold'
                                                : 'text-slate-700 dark:text-slate-300'
                                        )}
                                    >
                                        {size.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        title={isDarkTheme ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {isDarkTheme ? (
                            <SunIcon className="w-5 h-5 text-yellow-500" />
                        ) : (
                            <MoonIcon className="w-5 h-5 text-slate-700" />
                        )}
                    </button>

                    {/* Fullscreen Button */}
                    <button
                        onClick={isFullscreen ? exitFullscreen : requestFullscreen}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                    >
                        {isFullscreen ? (
                            <ExitFullscreenIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        ) : (
                            <FullscreenIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        )}
                    </button>

                    {/* Timer */}
                    <div
                        className={cn(
                            'flex items-center gap-2 px-4 py-1.5 rounded-lg transition-colors',
                            showWarning
                                ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                        )}
                    >
                        <ClockIcon className="w-4 h-4" />
                        <span className="font-mono font-semibold tabular-nums">
                            {formatTime(timeRemaining)}
                        </span>
                    </div>

                    {/* Next Section Button */}
                    {showNextSection && (
                        <button
                            onClick={onNextSection}
                            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                        >
                            {nextSectionLabel}
                        </button>
                    )}

                    {/* Exit Button */}
                    <button
                        onClick={handleExit}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        title="Exit"
                    >
                        <CloseIcon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </button>
                </div>
            </div>
        </header>
    );
}
