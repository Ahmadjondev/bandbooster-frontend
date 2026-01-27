/**
 * Word List Dropdown Component
 * 
 * Dropdown selector for SUC questions with word_list.
 * Replaces text input with a selectable dropdown list.
 * Features:
 * - Dropdown with word list items only
 * - No free-text input allowed
 * - Drag-down / selectable list behavior
 */

'use client';

import { memo, forwardRef, useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { WordListItem } from '@/domains/practice/models/question-types';

// ============= Types =============

export interface WordListDropdownProps {
    /** Current selected value (key from word list) */
    value: string;
    /** Available word list items */
    wordList: WordListItem[];
    /** Change handler - receives the key */
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
    /** Custom class name */
    className?: string;
}

// ============= Component =============

export const WordListDropdown = memo(forwardRef<HTMLSelectElement, WordListDropdownProps>(
    function WordListDropdown(
        {
            value,
            wordList,
            onChange,
            onFocus,
            onBlur,
            disabled = false,
            fontSize = 'text-base',
            questionNumber,
            className,
        },
        forwardedRef
    ) {
        const internalRef = useRef<HTMLSelectElement>(null);
        const selectRef = (forwardedRef as React.RefObject<HTMLSelectElement>) || internalRef;
        const [isOpen, setIsOpen] = useState(false);

        const hasValue = value.trim() !== '';

        // Find selected word text for display
        const selectedWord = wordList.find(w => w.key === value);

        const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
            onChange(e.target.value);
        }, [onChange]);

        const handleFocus = useCallback(() => {
            setIsOpen(true);
            onFocus?.();
        }, [onFocus]);

        const handleBlur = useCallback(() => {
            setIsOpen(false);
            onBlur?.();
        }, [onBlur]);

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
                {/* Dropdown container with number inside */}
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
                            ? 'border-primary-400 dark:border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-slate-800',
                        // Focus-within for when select is focused
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

                    {/* Dropdown Select Field */}
                    <select
                        ref={selectRef}
                        value={value}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        disabled={disabled}
                        className={cn(
                            // Remove default styling
                            'bg-transparent border-0 outline-none appearance-none',
                            // Typography
                            'text-neutral-900 dark:text-neutral-100',
                            fontSize,
                            // Sizing
                            'min-w-20 p-0 pr-5',
                            // Cursor
                            'cursor-pointer',
                            // Placeholder style for empty
                            !hasValue && 'text-neutral-400 dark:text-neutral-500',
                            // Disabled state
                            disabled && 'opacity-60 cursor-not-allowed',
                            className
                        )}
                    >
                        {/* Placeholder option */}
                        <option value="" disabled>
                            Select...
                        </option>
                        {/* Word list options */}
                        {wordList.map((item) => (
                            <option key={item.key} value={item.key}>
                                {item.key}. {item.text}
                            </option>
                        ))}
                    </select>

                    {/* Dropdown arrow */}
                    <span className="absolute right-2 pointer-events-none text-neutral-400 dark:text-neutral-500">
                        <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </span>
                </span>
            </span>
        );
    }
));

export default WordListDropdown;
