'use client';

import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    error?: string;
    success?: string;
    hint?: string;
    size?: 'sm' | 'md' | 'lg';
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    showPasswordToggle?: boolean;
}

const inputSizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-4 text-base',
    lg: 'h-13 px-5 text-lg',
};

const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            type = 'text',
            label,
            error,
            success,
            hint,
            size = 'md',
            leftIcon,
            rightIcon,
            showPasswordToggle,
            disabled,
            ...props
        },
        ref
    ) => {
        const [showPassword, setShowPassword] = useState(false);
        const [isFocused, setIsFocused] = useState(false);

        const inputType = showPasswordToggle && type === 'password'
            ? (showPassword ? 'text' : 'password')
            : type;

        const hasError = !!error;
        const hasSuccess = !!success;

        return (
            <div className="w-full space-y-1.5">
                {label && (
                    <motion.label
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            'block text-sm font-medium transition-colors duration-200',
                            hasError
                                ? 'text-error-600 dark:text-error-400'
                                : hasSuccess
                                    ? 'text-success-600 dark:text-success-400'
                                    : isFocused
                                        ? 'text-primary-600 dark:text-primary-400'
                                        : 'text-neutral-700 dark:text-neutral-300'
                        )}
                    >
                        {label}
                    </motion.label>
                )}

                <div className="relative">
                    {/* Left icon */}
                    {leftIcon && (
                        <div className={cn(
                            'absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 flex items-center justify-center pointer-events-none z-10',
                            hasError
                                ? 'text-error-500'
                                : hasSuccess
                                    ? 'text-success-500'
                                    : isFocused
                                        ? 'text-primary-500'
                                        : 'text-neutral-400'
                        )}>
                            <div className={cn('flex items-center justify-center', iconSizes[size])}>
                                {leftIcon}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <motion.input
                        ref={ref}
                        type={inputType}
                        disabled={disabled}
                        onFocus={(e) => {
                            setIsFocused(true);
                            props.onFocus?.(e);
                        }}
                        onBlur={(e) => {
                            setIsFocused(false);
                            props.onBlur?.(e);
                        }}
                        className={cn(
                            // Base styles
                            'w-full rounded-xl border-2 bg-white dark:bg-neutral-900',
                            'outline-none transition-all duration-200',
                            'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
                            inputSizes[size],
                            // Icon padding
                            leftIcon && 'pl-10',
                            (rightIcon || showPasswordToggle) && 'pr-10',
                            // States
                            hasError
                                ? 'border-error-500 focus:border-error-500 focus:ring-4 focus:ring-error-500/20'
                                : hasSuccess
                                    ? 'border-success-500 focus:border-success-500 focus:ring-4 focus:ring-success-500/20'
                                    : 'border-neutral-200 dark:border-neutral-700 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20',
                            // Text color
                            'text-neutral-900 dark:text-white',
                            // Disabled
                            disabled && 'cursor-not-allowed opacity-50 bg-neutral-100 dark:bg-neutral-800',
                            className
                        )}
                        whileFocus={{ scale: 1.005 }}
                        // Spread only non-conflicting props
                        name={props.name}
                        id={props.id}
                        value={props.value}
                        defaultValue={props.defaultValue}
                        onChange={props.onChange}
                        onKeyDown={props.onKeyDown}
                        onKeyUp={props.onKeyUp}
                        placeholder={props.placeholder}
                        autoComplete={props.autoComplete}
                        autoFocus={props.autoFocus}
                        required={props.required}
                        readOnly={props.readOnly}
                        maxLength={props.maxLength}
                        minLength={props.minLength}
                        min={props.min}
                        max={props.max}
                        step={props.step}
                        pattern={props.pattern}
                        inputMode={props.inputMode}
                        aria-label={props['aria-label']}
                        aria-describedby={props['aria-describedby']}
                    />

                    {/* Right icon / Password toggle */}
                    {(rightIcon || showPasswordToggle) && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center z-10">
                            {showPasswordToggle && type === 'password' ? (
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={cn(
                                        'flex items-center justify-center transition-colors duration-200 hover:text-primary-500',
                                        hasError
                                            ? 'text-error-500'
                                            : 'text-neutral-400'
                                    )}
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className={iconSizes[size]} />
                                    ) : (
                                        <Eye className={iconSizes[size]} />
                                    )}
                                </button>
                            ) : rightIcon ? (
                                <div className={cn(
                                    'flex items-center justify-center',
                                    iconSizes[size],
                                    'text-neutral-400',
                                    hasError && 'text-error-500',
                                    hasSuccess && 'text-success-500'
                                )}>
                                    {rightIcon}
                                </div>
                            ) : null}
                        </div>
                    )}

                    {/* Status icons */}
                    {hasError && !rightIcon && !showPasswordToggle && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-error-500"
                        >
                            <AlertCircle className={iconSizes[size]} />
                        </motion.div>
                    )}
                    {hasSuccess && !rightIcon && !showPasswordToggle && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-success-500"
                        >
                            <CheckCircle2 className={iconSizes[size]} />
                        </motion.div>
                    )}
                </div>

                {/* Error / Success / Hint messages */}
                <AnimatePresence mode="wait">
                    {error && (
                        <motion.p
                            key="error"
                            initial={{ opacity: 0, y: -5, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -5, height: 0 }}
                            className="text-sm text-error-600 dark:text-error-400 flex items-center gap-1"
                        >
                            <AlertCircle className="w-3.5 h-3.5" />
                            {error}
                        </motion.p>
                    )}
                    {success && !error && (
                        <motion.p
                            key="success"
                            initial={{ opacity: 0, y: -5, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -5, height: 0 }}
                            className="text-sm text-success-600 dark:text-success-400 flex items-center gap-1"
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {success}
                        </motion.p>
                    )}
                    {hint && !error && !success && (
                        <motion.p
                            key="hint"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-sm text-neutral-500 dark:text-neutral-400"
                        >
                            {hint}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        );
    }
);

Input.displayName = 'Input';
