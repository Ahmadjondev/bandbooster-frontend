'use client';

/**
 * PracticePageHeader - Reusable header component for practice list pages
 * Displays section icon, title, description, and stats
 */

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { SectionType } from '@/domains/practice/models/domain';
import { HeadphonesIcon, BookIcon, PenIcon, MicIcon } from '@/components/ui/icons';

// Section configuration for consistent theming
export const sectionThemes = {
    LISTENING: {
        icon: HeadphonesIcon,
        title: 'IELTS Listening Practice',
        description: 'Practice with real Cambridge IELTS-style listening tests',
        accentColor: 'blue',
        iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        iconText: 'text-blue-600 dark:text-blue-400',
        statHighlight: 'text-blue-600 dark:text-blue-400',
    },
    READING: {
        icon: BookIcon,
        title: 'IELTS Reading Practice',
        description: 'Practice with real Cambridge IELTS-style reading passages',
        accentColor: 'emerald',
        iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
        iconText: 'text-emerald-600 dark:text-emerald-400',
        statHighlight: 'text-emerald-600 dark:text-emerald-400',
    },
    WRITING: {
        icon: PenIcon,
        title: 'IELTS Writing Practice',
        description: 'Practice with real Cambridge IELTS-style writing tasks',
        accentColor: 'purple',
        iconBg: 'bg-purple-100 dark:bg-purple-900/30',
        iconText: 'text-purple-600 dark:text-purple-400',
        statHighlight: 'text-purple-600 dark:text-purple-400',
    },
    SPEAKING: {
        icon: MicIcon,
        title: 'IELTS Speaking Practice',
        description: 'Practice with real Cambridge IELTS-style speaking topics',
        accentColor: 'orange',
        iconBg: 'bg-orange-100 dark:bg-orange-900/30',
        iconText: 'text-orange-600 dark:text-orange-400',
        statHighlight: 'text-orange-600 dark:text-orange-400',
    },
} as const;

export interface StatCard {
    readonly value: string | number;
    readonly label: string;
    readonly highlight?: boolean;
    readonly color?: string;
}

interface PracticePageHeaderProps {
    readonly sectionType: SectionType;
    readonly stats: readonly StatCard[];
    readonly customTitle?: string;
    readonly customDescription?: string;
    readonly children?: ReactNode;
}

export function PracticePageHeader({
    sectionType,
    stats,
    customTitle,
    customDescription,
    children,
}: PracticePageHeaderProps) {
    const theme = sectionThemes[sectionType];
    const Icon = theme.icon;
    console.log(stats);
    return (
        <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Title Section */}
                <div className="flex items-center gap-3 sm:gap-4 mb-6">
                    <div className={cn(
                        'w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0',
                        theme.iconBg
                    )}>
                        <Icon className={cn('w-6 h-6 sm:w-7 sm:h-7', theme.iconText)} />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white truncate">
                            {customTitle ?? theme.title}
                        </h1>
                        <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 mt-0.5 sm:mt-1 line-clamp-1">
                            {customDescription ?? theme.description}
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    {stats.map((stat, index) => (
                        <div
                            key={stat.label}
                            className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3 sm:p-4"
                        >
                            <div className={cn(
                                'text-xl sm:text-2xl font-bold',
                                stat.color ?? (stat.highlight ? theme.statHighlight : 'text-neutral-900 dark:text-white')
                            )}>
                                {stat.value}
                            </div>
                            <div className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Optional children slot for additional content */}
                {children}
            </div>
        </div>
    );
}
