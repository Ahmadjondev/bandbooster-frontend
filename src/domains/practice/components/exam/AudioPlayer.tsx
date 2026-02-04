/**
 * Audio Player Component
 * Custom audio player for listening practices
 * Supports play/pause, seek, volume, and time display
 * Can work with internal audio element or external ref (controlled mode)
 */

'use client';

import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
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

export interface AudioPlayerHandle {
    play: () => Promise<void>;
    pause: () => void;
    seek: (time: number) => void;
    isPlaying: boolean;
}

export interface AudioPlayerProps {
    /** Audio URL */
    src: string;
    /** Optional part number for identification */
    partNumber?: number;
    /** Total number of parts (for display) */
    totalParts?: number;
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
    /** Whether the player is in compact mode */
    compact?: boolean;
}

export const AudioPlayer = forwardRef<AudioPlayerHandle, AudioPlayerProps>(function AudioPlayer({
    src,
    partNumber,
    totalParts,
    onPlay,
    onPause,
    onEnded,
    onTimeUpdate,
    initialTime = 0,
    autoPlay = false,
    className,
    compact = false,
}, ref) {
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
    const play = useCallback(async () => {
        const audio = audioRef.current;
        if (audio) {
            try {
                await audio.play();
                setIsPlaying(true);
                onPlay?.();
            } catch (error) {
                console.error('[AUDIO] Failed to play:', error);
            }
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

    // Seek to specific time
    const seekTo = useCallback((time: number) => {
        const audio = audioRef.current;
        if (audio) {
            audio.currentTime = time;
        }
    }, []);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        play,
        pause,
        seek: seekTo,
        isPlaying,
    }), [play, pause, seekTo, isPlaying]);

    // Toggle play/pause
    const togglePlay = useCallback(() => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    }, [isPlaying, play, pause]);

    // Seek to position via click
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

    // Reset state when src changes
    useEffect(() => {
        setCurrentTime(0);
        setIsPlaying(false);
        setIsLoading(true);
    }, [src]);

    return (
        <div className={cn(
            'bg-linear-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-750',
            'rounded-xl border border-slate-200 dark:border-slate-700',
            compact ? 'p-3' : 'p-4',
            className
        )}>
            {/* Hidden Audio Element */}
            <audio
                ref={audioRef}
                src={src}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onCanPlay={() => setIsLoading(false)}
                preload="auto"
                className='w-full'
                controls={true}
            />

        </div>
    );
});
