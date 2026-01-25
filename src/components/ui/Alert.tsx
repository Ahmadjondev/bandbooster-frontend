'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
    variant?: AlertVariant;
    title?: string;
    children: React.ReactNode;
    dismissible?: boolean;
    onDismiss?: () => void;
    className?: string;
    icon?: React.ReactNode;
}

const alertVariants = {
    info: {
        container: 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800',
        icon: 'text-primary-600 dark:text-primary-400',
        title: 'text-primary-900 dark:text-primary-200',
        text: 'text-primary-800 dark:text-primary-300',
        defaultIcon: Info,
    },
    success: {
        container: 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800',
        icon: 'text-success-600 dark:text-success-400',
        title: 'text-success-900 dark:text-success-200',
        text: 'text-success-800 dark:text-success-300',
        defaultIcon: CheckCircle2,
    },
    warning: {
        container: 'bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800',
        icon: 'text-warning-600 dark:text-warning-400',
        title: 'text-warning-900 dark:text-warning-200',
        text: 'text-warning-800 dark:text-warning-300',
        defaultIcon: AlertTriangle,
    },
    error: {
        container: 'bg-error-50 dark:bg-error-900/20 border-error-200 dark:border-error-800',
        icon: 'text-error-600 dark:text-error-400',
        title: 'text-error-900 dark:text-error-200',
        text: 'text-error-800 dark:text-error-300',
        defaultIcon: AlertCircle,
    },
};

export function Alert({
    variant = 'info',
    title,
    children,
    dismissible = false,
    onDismiss,
    className,
    icon,
}: AlertProps) {
    const config = alertVariants[variant];
    const IconComponent = config.defaultIcon;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className={cn(
                'rounded-xl border p-4',
                config.container,
                className
            )}
        >
            <div className="flex items-start gap-3">
                <div className={cn('shrink-0 mt-0.5', config.icon)}>
                    {icon || <IconComponent className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                    {title && (
                        <h4 className={cn('font-semibold mb-1', config.title)}>
                            {title}
                        </h4>
                    )}
                    <div className={cn('text-sm', config.text)}>{children}</div>
                </div>
                {dismissible && onDismiss && (
                    <button
                        onClick={onDismiss}
                        className={cn(
                            'shrink-0 p-1 rounded-lg transition-colors',
                            'hover:bg-black/5 dark:hover:bg-white/5',
                            config.icon
                        )}
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </motion.div>
    );
}

// Animated alert wrapper for showing/hiding
export function AnimatedAlert(props: AlertProps & { show: boolean }) {
    const { show, ...alertProps } = props;

    return (
        <AnimatePresence>
            {show && <Alert {...alertProps} />}
        </AnimatePresence>
    );
}
