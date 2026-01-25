/**
 * Play Dialog Component
 * Modal dialog shown before starting the listening practice
 * Shows test info and allows user to start when ready
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Icons
const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
);

const HeadphonesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
);

const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const QuestionIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
    </svg>
);

const VolumeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
);

const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

export interface PlayDialogProps {
    /** Whether the dialog is visible */
    isOpen: boolean;
    /** Practice title */
    title: string;
    /** Number of parts */
    partsCount: number;
    /** Total questions */
    totalQuestions: number;
    /** Duration in minutes */
    duration: number;
    /** Callback when user clicks start */
    onStart: () => void;
    /** Callback when user clicks back */
    onBack?: () => void;
}

export function PlayDialog({
    isOpen,
    title,
    partsCount,
    totalQuestions,
    duration,
    onStart,
    onBack,
}: PlayDialogProps) {
    const [checkedItems, setCheckedItems] = useState({
        headphones: false,
        quiet: false,
        ready: false,
    });

    const allChecked = checkedItems.headphones && checkedItems.quiet && checkedItems.ready;

    // Animate checkboxes sequentially
    useEffect(() => {
        if (isOpen) {
            setCheckedItems({ headphones: false, quiet: false, ready: false });
        }
    }, [isOpen]);

    const toggleCheck = (key: keyof typeof checkedItems) => {
        setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl overflow-hidden"
                    >
                        {/* Header with gradient */}
                        <div className="relative bg-linear-to-br from-primary-500 via-primary-600 to-accent-600 p-8 pb-12">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDIwIDAgTCAwIDAgMCAyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50" />

                            {/* Floating headphones icon */}
                            <motion.div
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="relative flex justify-center mb-4"
                            >
                                <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                                    <HeadphonesIcon className="w-10 h-10 text-white" />
                                </div>
                            </motion.div>

                            <motion.h2
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="relative text-2xl font-bold text-white text-center"
                            >
                                {title}
                            </motion.h2>
                            <motion.p
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="relative text-white/80 text-center mt-2"
                            >
                                IELTS Listening Practice
                            </motion.p>
                        </div>

                        {/* Stats Cards */}
                        <div className="relative -mt-6 px-6">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="grid grid-cols-3 gap-3"
                            >
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 text-center shadow-lg border border-slate-100 dark:border-slate-700">
                                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
                                        <VolumeIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{partsCount}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">Parts</div>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 text-center shadow-lg border border-slate-100 dark:border-slate-700">
                                    <div className="w-10 h-10 bg-accent-100 dark:bg-accent-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
                                        <QuestionIcon className="w-5 h-5 text-accent-600 dark:text-accent-400" />
                                    </div>
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalQuestions}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">Questions</div>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 text-center shadow-lg border border-slate-100 dark:border-slate-700">
                                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mx-auto mb-2">
                                        <ClockIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{duration}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">Minutes</div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Checklist */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="p-6 pt-5"
                        >
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                Before you start:
                            </p>
                            <div className="space-y-2">
                                {[
                                    { key: 'headphones', label: 'I have headphones connected' },
                                    { key: 'quiet', label: 'I\'m in a quiet environment' },
                                    { key: 'ready', label: 'I\'m ready to begin' },
                                ].map((item) => (
                                    <button
                                        key={item.key}
                                        onClick={() => toggleCheck(item.key as keyof typeof checkedItems)}
                                        className={cn(
                                            'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all',
                                            checkedItems[item.key as keyof typeof checkedItems]
                                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'w-6 h-6 rounded-lg flex items-center justify-center transition-all',
                                                checkedItems[item.key as keyof typeof checkedItems]
                                                    ? 'bg-primary-500 text-white'
                                                    : 'bg-slate-100 dark:bg-slate-700'
                                            )}
                                        >
                                            {checkedItems[item.key as keyof typeof checkedItems] && (
                                                <CheckIcon className="w-4 h-4" />
                                            )}
                                        </div>
                                        <span className={cn(
                                            'text-sm font-medium',
                                            checkedItems[item.key as keyof typeof checkedItems]
                                                ? 'text-primary-700 dark:text-primary-300'
                                                : 'text-slate-600 dark:text-slate-400'
                                        )}>
                                            {item.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Actions */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="p-6 pt-0 flex gap-3"
                        >
                            {onBack && (
                                <button
                                    onClick={onBack}
                                    className="flex-1 px-6 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Go Back
                                </button>
                            )}
                            <button
                                onClick={onStart}
                                disabled={!allChecked}
                                className={cn(
                                    'flex-1 flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-xl transition-all',
                                    allChecked
                                        ? 'bg-linear-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg shadow-primary-500/25'
                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                                )}
                            >
                                <PlayIcon className="w-5 h-5" />
                                Start Practice
                            </button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
