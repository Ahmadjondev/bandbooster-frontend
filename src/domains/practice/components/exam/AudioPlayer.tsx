/**
 * Audio Player Component
 * Custom audio player for listening practices
 * Supports play/pause, seek, volume, and time display
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Icons
const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
);

const PauseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="4" width="4" height="16" />
        <rect x="14" y="4" width="4" height="16" />
    </svg>
);

const VolumeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
);

const VolumeMuteIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
);

export interface AudioPlayerProps {
    /** Audio URL */
    src: string;
    /** Optional part number for identification */
    partNumber?: number;
    /** Callback when audio starts playing */
    onPlay?: () => void;
    /** Callback when audio is paused */
    onPause?: () => void;
    /** Callback when audio ends */
    onEnded?: () => void;
    /** Callback when time updates */
    onTimeUpdate?: (currentTime: number) => void;
    /** Initial start time (for resuming) */
    initialTime?: number;
    /** Whether to auto-play */
    autoPlay?: boolean;
    /** Additional class name */
    className?: string;
}

export function AudioPlayer({
    src,
    partNumber,
    onPlay,
    onPause,
    onEnded,
    onTimeUpdate,
    initialTime = 0,
    autoPlay = false,
    className,
}: AudioPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(100);
    const [isMuted, setIsMuted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Format time as MM:SS
    const formatTime = (seconds: number): string => {
        if (isNaN(seconds) || seconds === 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${String(secs).padStart(2, '0')}`;
    };

    // Play audio
    const play = useCallback(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.play().then(() => {
                setIsPlaying(true);
                onPlay?.();
            }).catch(error => {
                console.error('[AUDIO] Failed to play:', error);
            });
        }
    }, [onPlay]);

    // Pause audio
    const pause = useCallback(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.pause();
            setIsPlaying(false);
            onPause?.();
        }
    }, [onPause]);

    // Toggle play/pause
    const togglePlay = useCallback(() => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    }, [isPlaying, play, pause]);

    // Seek to position
    const seek = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        const audio = audioRef.current;
        if (audio && duration > 0) {
            const rect = event.currentTarget.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const percentage = clickX / rect.width;
            const newTime = percentage * duration;
            audio.currentTime = newTime;
        }
    }, [duration]);

    // Handle volume change
    const handleVolumeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseInt(event.target.value);
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
        if (audioRef.current) {
            audioRef.current.volume = newVolume / 100;
        }
    }, []);

    // Toggle mute
    const toggleMute = useCallback(() => {
        const audio = audioRef.current;
        if (audio) {
            if (isMuted) {
                audio.volume = volume / 100;
                setIsMuted(false);
            } else {
                audio.volume = 0;
                setIsMuted(true);
            }
        }
    }, [isMuted, volume]);

    // Handle audio loaded
    const handleLoadedMetadata = useCallback(() => {
        const audio = audioRef.current;
        if (audio) {
            setDuration(audio.duration);
            setIsLoading(false);

            // Set initial time if provided
            if (initialTime > 0 && initialTime < audio.duration) {
                audio.currentTime = initialTime;
            }
        }
    }, [initialTime]);

    // Handle time update
    const handleTimeUpdate = useCallback(() => {
        const audio = audioRef.current;
        if (audio) {
            setCurrentTime(audio.currentTime);
            onTimeUpdate?.(audio.currentTime);
        }
    }, [onTimeUpdate]);

    // Handle audio ended
    const handleEnded = useCallback(() => {
        setIsPlaying(false);
        onEnded?.();
    }, [onEnded]);

    // Auto-play on mount if enabled
    useEffect(() => {
        if (autoPlay && !isLoading) {
            const timer = setTimeout(() => {
                play();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [autoPlay, isLoading, play]);

    // Calculate progress percentage
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <div className={cn('bg-linear-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700', className)}>
            {/* Hidden Audio Element */}
            <audio
                ref={audioRef}
                src={src}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onCanPlay={() => setIsLoading(false)}
                preload="auto"
            />

            <div className="flex items-center gap-4">
                {/* Play/Pause Button */}
                <button
                    onClick={togglePlay}
                    disabled={isLoading}
                    className={cn(
                        'shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all',
                        isLoading
                            ? 'bg-slate-300 dark:bg-slate-600 cursor-not-allowed'
                            : 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl'
                    )}
                    title={isPlaying ? 'Pause' : 'Play'}
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : isPlaying ? (
                        <PauseIcon className="w-5 h-5" />
                    ) : (
                        <PlayIcon className="w-5 h-5 ml-0.5" />
                    )}
                </button>

                {/* Progress Bar */}
                <div className="flex-1 flex flex-col gap-1">
                    {/* Part Label (if provided) */}
                    {partNumber && (
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Part {partNumber}
                        </span>
                    )}

                    {/* Progress Track */}
                    <div
                        onClick={seek}
                        className="relative h-2 bg-slate-300 dark:bg-slate-700 rounded-full cursor-pointer group shadow-inner"
                    >
                        {/* Progress Fill */}
                        <div
                            className="absolute top-0 left-0 h-full bg-primary-500 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                        />
                        {/* Scrubber */}
                        <div
                            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-primary-500 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ left: `calc(${progress}% - 8px)` }}
                        />
                    </div>

                    {/* Time Display */}
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleMute}
                        className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        title={isMuted ? 'Unmute' : 'Mute'}
                    >
                        {isMuted || volume === 0 ? (
                            <VolumeMuteIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        ) : (
                            <VolumeIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        )}
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-1 bg-slate-300 dark:bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-primary-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md"
                        title="Volume"
                    />
                </div>
            </div>
        </div>
    );
}
