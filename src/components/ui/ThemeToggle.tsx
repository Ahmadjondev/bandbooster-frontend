'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTheme, useMounted } from './ThemeProvider';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
};

const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
};

// Icons
const SunIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
    </svg>
);

const MoonIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
);

const SystemIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" x2="16" y1="21" y2="21" />
        <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
);

export function ThemeToggle({ className, size = 'md', showLabel = false }: ThemeToggleProps) {
    const { resolvedTheme, toggleTheme } = useTheme();
    const mounted = useMounted();

    // Avoid hydration mismatch by not rendering until mounted
    if (!mounted) {
        return (
            <div
                className={cn(
                    sizes[size],
                    'rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse',
                    className
                )}
            />
        );
    }

    const isDark = resolvedTheme === 'dark';

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className={cn(
                sizes[size],
                'relative rounded-xl flex items-center justify-center',
                'bg-neutral-100 dark:bg-neutral-800',
                'hover:bg-neutral-200 dark:hover:bg-neutral-700',
                'text-neutral-600 dark:text-neutral-400',
                'transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                'dark:focus:ring-offset-neutral-900',
                className
            )}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            <AnimatePresence mode="wait">
                {isDark ? (
                    <motion.div
                        key="sun"
                        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                    >
                        <SunIcon className={cn(iconSizes[size], 'text-amber-500')} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="moon"
                        initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                    >
                        <MoonIcon className={cn(iconSizes[size], 'text-primary-500')} />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
}

// Extended theme selector with all three options
interface ThemeSelectorProps {
    className?: string;
}

export function ThemeSelector({ className }: ThemeSelectorProps) {
    const { theme, setTheme } = useTheme();
    const mounted = useMounted();

    if (!mounted) {
        return (
            <div className={cn('flex gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl', className)}>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-lg bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
                ))}
            </div>
        );
    }

    const options: { value: 'light' | 'dark' | 'system'; icon: typeof SunIcon; label: string }[] = [
        { value: 'light', icon: SunIcon, label: 'Light' },
        { value: 'dark', icon: MoonIcon, label: 'Dark' },
        { value: 'system', icon: SystemIcon, label: 'System' },
    ];

    return (
        <div
            className={cn(
                'flex gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl',
                className
            )}
        >
            {options.map(({ value, icon: Icon, label }) => {
                const isActive = theme === value;
                return (
                    <motion.button
                        key={value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setTheme(value)}
                        className={cn(
                            'relative flex items-center justify-center gap-2 px-3 py-2 rounded-lg',
                            'text-sm font-medium transition-colors duration-200',
                            isActive
                                ? 'text-primary-600 dark:text-primary-400'
                                : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                        )}
                        aria-label={`Use ${label} theme`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeTheme"
                                className="absolute inset-0 bg-white dark:bg-neutral-700 rounded-lg "
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                        )}
                        <Icon className="relative w-4 h-4" />
                        <span className="relative hidden sm:inline">{label}</span>
                    </motion.button>
                );
            })}
        </div>
    );
}
