/**
 * Practice Timer Component
 * User-controlled countdown timer with auto-submit capability
 */

'use client';

import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { cn } from '@/lib/utils';

// Icons
const PlayIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
);

const PauseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="4" width="4" height="16" />
        <rect x="14" y="4" width="4" height="16" />
    </svg>
);

const ClockIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const SettingsIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

export interface PracticeTimerProps {
    /** Default duration in minutes */
    defaultMinutes?: number;
    /** Callback when timer reaches zero */
    onTimeUp?: () => void;
    /** Callback when timer starts (returns start timestamp) */
    onStart?: (startedAt: Date) => void;
    /** Get elapsed time in seconds */
    getElapsedSeconds?: () => number;
}

// Preset durations in minutes
const PRESET_DURATIONS = [10, 20, 30, 40, 60];

export const PracticeTimer = memo(function PracticeTimer({
    defaultMinutes = 40,
    onTimeUp,
    onStart,
}: PracticeTimerProps) {
    const [duration, setDuration] = useState(defaultMinutes * 60); // in seconds
    const [timeLeft, setTimeLeft] = useState(defaultMinutes * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [customMinutes, setCustomMinutes] = useState(defaultMinutes.toString());
    const startTimeRef = useRef<Date | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Format time as MM:SS
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Start timer
    const handleStart = useCallback(() => {
        if (!isRunning && timeLeft > 0) {
            setIsRunning(true);
            startTimeRef.current = new Date();
            onStart?.(startTimeRef.current);
        }
    }, [isRunning, timeLeft, onStart]);

    // Pause timer
    const handlePause = useCallback(() => {
        setIsRunning(false);
    }, []);

    // Toggle timer
    const handleToggle = useCallback(() => {
        if (isRunning) {
            handlePause();
        } else {
            handleStart();
        }
    }, [isRunning, handleStart, handlePause]);

    // Set duration from preset
    const handlePresetClick = useCallback((minutes: number) => {
        if (!isRunning) {
            setDuration(minutes * 60);
            setTimeLeft(minutes * 60);
            setCustomMinutes(minutes.toString());
        }
    }, [isRunning]);

    // Set custom duration
    const handleCustomDuration = useCallback(() => {
        const minutes = parseInt(customMinutes, 10);
        if (!isNaN(minutes) && minutes > 0 && minutes <= 180) {
            setDuration(minutes * 60);
            setTimeLeft(minutes * 60);
            setShowSettings(false);
        }
    }, [customMinutes]);

    // Timer countdown effect
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        onTimeUp?.();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, timeLeft, onTimeUp]);

    // Calculate elapsed time
    const getElapsedSeconds = useCallback(() => {
        return duration - timeLeft;
    }, [duration, timeLeft]);

    // Expose getElapsedSeconds via ref pattern (parent can access via callback)
    useEffect(() => {
        // This exposes the function through a global-like pattern if needed
        (window as unknown as Record<string, unknown>).__practiceTimerGetElapsed = getElapsedSeconds;
        return () => {
            delete (window as unknown as Record<string, unknown>).__practiceTimerGetElapsed;
        };
    }, [getElapsedSeconds]);

    // Calculate progress percentage
    const progress = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;
    const isLowTime = timeLeft <= 60 && timeLeft > 0;
    const isCritical = timeLeft <= 30 && timeLeft > 0;

    return (
        <div className="relative flex items-center gap-2">
            {/* Timer Display */}
            <div
                className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300',
                    isRunning
                        ? isCritical
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                            : isLowTime
                                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700'
                                : 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                        : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-gray-700'
                )}
            >
                <ClockIcon />
                <span
                    className={cn(
                        'font-mono text-base font-semibold tabular-nums transition-colors',
                        isCritical
                            ? 'text-red-600 dark:text-red-400 animate-pulse'
                            : isLowTime
                                ? 'text-amber-600 dark:text-amber-400'
                                : isRunning
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-gray-700 dark:text-gray-300'
                    )}
                >
                    {formatTime(timeLeft)}
                </span>
            </div>

            {/* Start/Pause Button */}
            <button
                onClick={handleToggle}
                disabled={timeLeft === 0}
                className={cn(
                    'p-2 rounded-lg border transition-all duration-200',
                    'hover:scale-105 active:scale-95',
                    isRunning
                        ? 'bg-amber-500 hover:bg-amber-600 border-amber-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 border-green-600 text-white',
                    timeLeft === 0 && 'opacity-50 cursor-not-allowed'
                )}
                title={isRunning ? 'Pause timer' : 'Start timer'}
            >
                {isRunning ? <PauseIcon /> : <PlayIcon />}
            </button>

            {/* Settings Button */}
            <button
                onClick={() => setShowSettings(!showSettings)}
                disabled={isRunning}
                className={cn(
                    'p-2 rounded-lg border transition-all duration-200',
                    'bg-gray-100 dark:bg-slate-700 border-gray-200 dark:border-gray-600',
                    'text-gray-600 dark:text-gray-400',
                    'hover:bg-gray-200 dark:hover:bg-slate-600',
                    isRunning && 'opacity-50 cursor-not-allowed'
                )}
                title="Timer settings"
            >
                <SettingsIcon />
            </button>

            {/* Settings Dropdown */}
            {showSettings && !isRunning && (
                <div className="absolute top-full right-0 mt-2 p-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-48">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Set Duration (minutes)</p>

                    {/* Preset buttons */}
                    <div className="flex flex-wrap gap-1 mb-3">
                        {PRESET_DURATIONS.map(mins => (
                            <button
                                key={mins}
                                onClick={() => handlePresetClick(mins)}
                                className={cn(
                                    'px-2 py-1 text-xs rounded border transition-colors',
                                    duration === mins * 60
                                        ? 'bg-primary-500 text-white border-primary-500'
                                        : 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-slate-600'
                                )}
                            >
                                {mins}m
                            </button>
                        ))}
                    </div>

                    {/* Custom input */}
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={customMinutes}
                            onChange={(e) => setCustomMinutes(e.target.value)}
                            min="1"
                            max="180"
                            className="flex-1 px-2 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                            placeholder="Minutes"
                        />
                        <button
                            onClick={handleCustomDuration}
                            className="px-3 py-1 text-xs bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
                        >
                            Set
                        </button>
                    </div>
                </div>
            )}

            {/* Progress bar (subtle) */}
            {isRunning && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className={cn(
                            'h-full transition-all duration-1000',
                            isCritical ? 'bg-red-500' : isLowTime ? 'bg-amber-500' : 'bg-green-500'
                        )}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    );
});

export default PracticeTimer;
