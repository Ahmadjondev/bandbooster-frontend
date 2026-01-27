/**
 * Shared Blank Input Component
 * 
 * A SINGLE reusable input component for ALL IELTS question types.
 * Designed to match authentic IELTS paper-based test appearance.
 * 
 * Key Features:
 * - True inline behavior (sits on text baseline)
 * - Compact default size with auto-expansion
 * - Question number displayed inside the input box
 * - Clean, lightweight appearance matching reference images
 * - Safe to reuse in: NC, FC, TC, SUC, FCC, SC, SA, DL
 */

'use client';

import { memo, forwardRef, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { text } from 'node:stream/consumers';

// ============= Types =============

export interface BlankInputProps {
    /** Current value */
    value: string;
    /** Change handler */
    onChange: (value: string) => void;
    /** Focus handler */
    onFocus?: () => void;
    /** Blur handler */
    onBlur?: () => void;
    /** Whether input is disabled */
    disabled?: boolean;
    /** Font size class */
    fontSize?: string;
    /** Question number to display inside input */
    questionNumber?: number;
    /** Placeholder text */
    placeholder?: string;
    /** Input variant - controls layout context */
    variant?: 'inline' | 'block' | 'compact';
    /** Whether to uppercase input */
    uppercase?: boolean;
    /** Max length */
    maxLength?: number;
    /** Minimum width in characters */
    minChars?: number;
    /** Custom class name */
    className?: string;
    /** Whether to show underline style */
    underlineStyle?: boolean;
}

// ============= Constants =============

const MIN_INPUT_WIDTH = 48; // Minimum width in pixels (compact)
const CHAR_WIDTH_ESTIMATE = 8; // Approximate width per character
const PADDING_BUFFER = 32; // Extra padding for number + spacing

// ============= Component =============

export const BlankInput = memo(forwardRef<HTMLInputElement, BlankInputProps>(
    function BlankInput(
        {
            value,
            onChange,
            onFocus,
            onBlur,
            disabled = false,
            fontSize = 'text-base',
            questionNumber,
            placeholder = '',
            // variant - reserved for future layout variations
            uppercase = false,
            maxLength,
            minChars = 8,
            className,
            // underlineStyle - reserved for future style variations
        },
        forwardedRef
    ) {
        const internalRef = useRef<HTMLInputElement>(null);
        const measureRef = useRef<HTMLSpanElement>(null);
        const inputRef = (forwardedRef as React.RefObject<HTMLInputElement>) || internalRef;

        const hasValue = value.trim() !== '';

        // Calculate dynamic width based on content
        const calculateWidth = useCallback(() => {
            if (!inputRef.current) return;

            if (measureRef.current) {
                const textToMeasure = value || (minChars > 0 ? 'x'.repeat(minChars) : 'xxxxx');
                measureRef.current.textContent = textToMeasure;
                const measuredWidth = measureRef.current.offsetWidth;
                const numberWidth = questionNumber !== undefined ? 24 : 0;
                const minWidth = Math.max(MIN_INPUT_WIDTH, minChars * CHAR_WIDTH_ESTIMATE);
                const newWidth = Math.max(minWidth, measuredWidth + numberWidth);
                inputRef.current.style.width = `${newWidth}px`;
            }
        }, [value, minChars, questionNumber, inputRef]);

        useEffect(() => {
            calculateWidth();
        }, [value, calculateWidth]);

        useEffect(() => {
            const timer = setTimeout(calculateWidth, 0);
            return () => clearTimeout(timer);
        }, [calculateWidth]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = uppercase ? e.target.value.toUpperCase() : e.target.value;
            onChange(newValue);
        };

        const handleInput = () => {
            calculateWidth();
        };

        return (
            <span
                className={cn(
                    // True inline positioning
                    'inline-flex items-center align-baseline',
                    // Maintain text flow
                    'whitespace-nowrap',
                    // Small horizontal margins for spacing
                    'mx-0.5'
                )}
            >
                {/* Hidden span for measuring text width */}
                <span
                    ref={measureRef}
                    aria-hidden="true"
                    className={cn(
                        'absolute invisible whitespace-pre',
                        fontSize
                    )}
                    style={{ position: 'absolute', visibility: 'hidden', height: 0, overflow: 'hidden' }}
                />

                {/* Input container with number inside */}
                <span
                    className={cn(
                        // Inline-flex for horizontal layout
                        'inline-flex items-center gap-1',
                        // Border styling - clean box appearance
                        'border rounded',
                        // Padding - compact
                        'px-1.5 py-0.5',
                        // Background
                        hasValue
                            ? 'border-neutral-400 dark:border-neutral-500 bg-white dark:bg-slate-800'
                            : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-slate-800',
                        // Focus-within for when input is focused
                        'focus-within:border-primary-400 focus-within:ring-1 focus-within:ring-primary-400/30',
                        // Transition
                        'transition-colors duration-100'
                    )}
                >
                    {/* Question Number inside the box */}
                    {questionNumber !== undefined && (
                        <span
                            className={cn(
                                'shrink-0 font-medium text-neutral-500 dark:text-neutral-400',
                                'text-sm select-none'
                            )}
                        >
                            {questionNumber}
                        </span>
                    )}

                    {/* Input Field */}
                    <input
                        ref={inputRef}
                        type="text"
                        value={value}
                        onChange={handleChange}
                        onInput={handleInput}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        disabled={disabled}
                        maxLength={maxLength}
                        className={cn(
                            // Remove default styling
                            'bg-transparent border-0 outline-none',
                            // Typography
                            'text-neutral-900 dark:text-neutral-100',
                            fontSize,
                            // Compact sizing
                            'min-w-10 p-0',
                            // Placeholder
                            'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
                            // Disabled state
                            disabled && 'opacity-60 cursor-not-allowed',
                            // Uppercase if needed
                            // uppercase && 'uppercase',
                            className
                        )}
                        placeholder={placeholder}
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                    />
                </span>
            </span>
        );
    }
));

// ============= Type Exports =============

export type { BlankInputProps as FlexibleInputProps };
export default BlankInput;
