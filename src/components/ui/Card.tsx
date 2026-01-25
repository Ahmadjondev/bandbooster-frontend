'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'glass' | 'gradient';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    animated?: boolean;
}

const cardVariants = {
    default: 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800',
    elevated: 'bg-white dark:bg-neutral-900 shadow-xl shadow-neutral-900/5 dark:shadow-neutral-950/50',
    glass: 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-white/20 dark:border-neutral-800/50',
    gradient: 'bg-gradient-to-br from-white via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800 border border-neutral-200/50 dark:border-neutral-700/50',
};

const cardPaddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', padding = 'md', animated = false, children, ...props }, ref) => {
        const baseClasses = cn(
            'rounded-2xl',
            cardVariants[variant],
            cardPaddings[padding],
            className
        );

        if (animated) {
            return (
                <motion.div
                    ref={ref}
                    className={baseClasses}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    {...(props as HTMLMotionProps<'div'>)}
                >
                    {children}
                </motion.div>
            );
        }

        return (
            <div ref={ref} className={baseClasses} {...props}>
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

// Card Header
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> { }

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('flex flex-col space-y-1.5', className)}
            {...props}
        />
    )
);

CardHeader.displayName = 'CardHeader';

// Card Title
export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> { }

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
    ({ className, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn('text-2xl font-bold text-neutral-900 dark:text-white', className)}
            {...props}
        />
    )
);

CardTitle.displayName = 'CardTitle';

// Card Description
export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> { }

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
    ({ className, ...props }, ref) => (
        <p
            ref={ref}
            className={cn('text-neutral-600 dark:text-neutral-400', className)}
            {...props}
        />
    )
);

CardDescription.displayName = 'CardDescription';

// Card Content
export interface CardContentProps extends HTMLAttributes<HTMLDivElement> { }

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('', className)} {...props} />
    )
);

CardContent.displayName = 'CardContent';

// Card Footer
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> { }

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('flex items-center pt-4', className)}
            {...props}
        />
    )
);

CardFooter.displayName = 'CardFooter';
