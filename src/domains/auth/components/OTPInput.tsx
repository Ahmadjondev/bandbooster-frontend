'use client';

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OTPInputProps {
    length?: number;
    value: string[];
    onChange: (value: string[]) => void;
    onComplete?: (code: string) => void;
    disabled?: boolean;
    error?: boolean;
    autoFocus?: boolean;
}

export function OTPInput({
    length = 4,
    value,
    onChange,
    onComplete,
    disabled = false,
    error = false,
    autoFocus = true,
}: OTPInputProps) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (autoFocus && inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [autoFocus]);

    const handleChange = (index: number, inputValue: string) => {
        // Only allow digits
        if (inputValue && !/^\d$/.test(inputValue)) return;

        const newValue = [...value];
        newValue[index] = inputValue;
        onChange(newValue);

        // Auto-focus next input
        if (inputValue && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Check if complete
        if (inputValue && index === length - 1 && newValue.every((v) => v !== '')) {
            onComplete?.(newValue.join(''));
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            if (!value[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        const digits = pastedData.replace(/\D/g, '').slice(0, length);

        if (digits) {
            const newValue = [...value];
            digits.split('').forEach((digit, i) => {
                newValue[i] = digit;
            });
            onChange(newValue);

            // Focus last filled input or the next empty one
            const lastFilledIndex = Math.min(digits.length - 1, length - 1);
            inputRefs.current[lastFilledIndex]?.focus();

            if (newValue.every((v) => v !== '')) {
                onComplete?.(newValue.join(''));
            }
        }
    };

    return (
        <div className="flex justify-center gap-3">
            {Array.from({ length }, (_, index) => (
                <motion.input
                    key={index}
                    ref={(el) => {
                        inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value[index] || ''}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={disabled}
                    className={cn(
                        'w-14 h-16 sm:w-16 sm:h-18',
                        'text-center text-2xl font-bold',
                        'border-2 rounded-xl',
                        'bg-white dark:bg-neutral-900',
                        'text-neutral-900 dark:text-white',
                        'outline-none transition-all duration-200',
                        error
                            ? 'border-error-500 focus:border-error-500 focus:ring-4 focus:ring-error-500/20'
                            : 'border-neutral-200 dark:border-neutral-700 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20',
                        disabled && 'opacity-50 cursor-not-allowed'
                    )}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{
                        scale: 1,
                        opacity: 1,
                        borderColor: error ? undefined : (value[index] ? 'var(--color-primary-500)' : undefined)
                    }}
                    transition={{ delay: index * 0.05 }}
                    whileFocus={{ scale: 1.05 }}
                />
            ))}
        </div>
    );
}

// Countdown timer component
interface CountdownTimerProps {
    seconds: number;
    onComplete?: () => void;
    className?: string;
}

export function CountdownTimer({ seconds, onComplete, className }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState(seconds);

    useEffect(() => {
        setTimeLeft(seconds);
    }, [seconds]);

    useEffect(() => {
        if (timeLeft <= 0) {
            onComplete?.();
            return;
        }

        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft, onComplete]);

    const minutes = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;

    return (
        <span className={cn('font-mono font-bold text-primary-600 dark:text-primary-400', className)}>
            {minutes}:{secs.toString().padStart(2, '0')}
        </span>
    );
}
