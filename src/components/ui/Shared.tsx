'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DividerProps {
    children?: React.ReactNode;
    className?: string;
    orientation?: 'horizontal' | 'vertical';
}

export function Divider({ children, className, orientation = 'horizontal' }: DividerProps) {
    if (orientation === 'vertical') {
        return (
            <div className={cn('h-full w-px bg-neutral-200 dark:bg-neutral-700', className)} />
        );
    }

    if (children) {
        return (
            <div className={cn('relative flex items-center', className)}>
                <div className="grow border-t border-neutral-200 dark:border-neutral-700" />
                <span className="px-4 text-sm text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-900">
                    {children}
                </span>
                <div className="grow border-t border-neutral-200 dark:border-neutral-700" />
            </div>
        );
    }

    return (
        <div className={cn('w-full border-t border-neutral-200 dark:border-neutral-700', className)} />
    );
}

// Social button with icon
interface SocialButtonProps {
    provider: 'google' | 'telegram' | 'apple';
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    children: React.ReactNode;
}

const socialStyles = {
    google: {
        base: 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700',
        icon: (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
            </svg>
        ),
    },
    telegram: {
        base: 'bg-[#0088cc] hover:bg-[#0077b5] text-white border-transparent',
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
            </svg>
        ),
    },
    apple: {
        base: 'bg-black hover:bg-neutral-900 text-white border-transparent dark:bg-white dark:text-black dark:hover:bg-neutral-100',
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
        ),
    },
};

export function SocialButton({
    provider,
    onClick,
    disabled = false,
    loading = false,
    children,
}: SocialButtonProps) {
    const style = socialStyles[provider];

    return (
        <motion.button
            type="button"
            onClick={onClick}
            disabled={disabled || loading}
            className={cn(
                'w-full flex items-center justify-center gap-3 px-6 py-3',
                'rounded-xl border-2 font-semibold',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                style.base
            )}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
        >
            {loading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
                style.icon
            )}
            <span>{children}</span>
        </motion.button>
    );
}

// Logo component
interface LogoProps {
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
    className?: string;
}

const logoSizes = {
    sm: { icon: 'w-8 h-8', text: 'text-lg' },
    md: { icon: 'w-12 h-12', text: 'text-2xl' },
    lg: { icon: 'w-16 h-16', text: 'text-3xl' },
};

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
    const sizeConfig = logoSizes[size];

    return (
        <div className={cn('flex items-center gap-3', className)}>
            <div className={cn(
                'bg-linear-to-br from-primary-500 to-accent-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25',
                sizeConfig.icon
            )}>
                <span className="text-white font-bold text-xl">B</span>
            </div>
            {showText && (
                <span className={cn(
                    'font-bold bg-linear-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent',
                    sizeConfig.text
                )}>
                    BandBooster
                </span>
            )}
        </div>
    );
}

// Spinner component
interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const spinnerSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
    return (
        <div className={cn('relative', spinnerSizes[size], className)}>
            <div className="absolute inset-0 rounded-full border-2 border-neutral-200 dark:border-neutral-700" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-600 animate-spin" />
        </div>
    );
}

// Loading overlay
interface LoadingOverlayProps {
    message?: string;
}

export function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm"
        >
            <div className="flex flex-col items-center gap-4">
                <Spinner size="lg" />
                <p className="text-neutral-600 dark:text-neutral-400 font-medium">{message}</p>
            </div>
        </motion.div>
    );
}
