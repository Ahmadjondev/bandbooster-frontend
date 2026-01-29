'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useClassrooms, useCreateClassroom } from '@/domains/classroom';

// ============================================================================
// ICONS
// ============================================================================

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14" /><path d="M5 12h14" />
    </svg>
);

const BookOpenIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
);

const AlertCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="8" y2="12" />
        <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
);

const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const MegaphoneIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 11 18-5v12L3 13v-2Z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
);

const ClipboardListIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" />
    </svg>
);

// ============================================================================
// CREATE CLASSROOM MODAL
// ============================================================================

interface CreateClassroomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (uuid: string) => void;
}

function CreateClassroomModal({ isOpen, onClose, onSuccess }: CreateClassroomModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [maxStudents, setMaxStudents] = useState<number | undefined>(undefined);

    const createClassroom = useCreateClassroom({
        onSuccess: (classroom) => {
            onClose();
            setName('');
            setDescription('');
            setMaxStudents(undefined);
            onSuccess(classroom.uuid);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        createClassroom.mutate({
            name: name.trim(),
            description: description.trim() || undefined,
            maxStudents: maxStudents,
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
                    >
                        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
                                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
                                    Create Classroom
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                >
                                    <XIcon className="w-5 h-5 text-neutral-500" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {/* Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                        Classroom Name *
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g., IELTS Band 7 - Morning Class"
                                        className={cn(
                                            'w-full px-4 py-2.5 rounded-xl border transition-colors',
                                            'bg-white dark:bg-neutral-800',
                                            'border-neutral-200 dark:border-neutral-700',
                                            'focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
                                            'text-neutral-900 dark:text-white placeholder-neutral-400'
                                        )}
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                        Description (optional)
                                    </label>
                                    <textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Add a brief description for your students..."
                                        rows={3}
                                        className={cn(
                                            'w-full px-4 py-2.5 rounded-xl border transition-colors resize-none',
                                            'bg-white dark:bg-neutral-800',
                                            'border-neutral-200 dark:border-neutral-700',
                                            'focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
                                            'text-neutral-900 dark:text-white placeholder-neutral-400'
                                        )}
                                    />
                                </div>

                                {/* Max Students */}
                                <div>
                                    <label htmlFor="maxStudents" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                        Maximum Students (optional)
                                    </label>
                                    <input
                                        id="maxStudents"
                                        type="number"
                                        min={1}
                                        value={maxStudents ?? ''}
                                        onChange={(e) => setMaxStudents(e.target.value ? parseInt(e.target.value) : undefined)}
                                        placeholder="No limit"
                                        className={cn(
                                            'w-full px-4 py-2.5 rounded-xl border transition-colors',
                                            'bg-white dark:bg-neutral-800',
                                            'border-neutral-200 dark:border-neutral-700',
                                            'focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
                                            'text-neutral-900 dark:text-white placeholder-neutral-400'
                                        )}
                                    />
                                </div>

                                {/* Error */}
                                {createClassroom.error && (
                                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
                                        <AlertCircleIcon className="w-4 h-4 shrink-0" />
                                        <span>{createClassroom.error.message}</span>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!name.trim() || createClassroom.isPending}
                                        className={cn(
                                            'px-4 py-2.5 text-sm font-medium rounded-xl transition-all',
                                            'bg-indigo-600 text-white hover:bg-indigo-700',
                                            'disabled:opacity-50 disabled:cursor-not-allowed'
                                        )}
                                    >
                                        {createClassroom.isPending ? 'Creating...' : 'Create Classroom'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// ============================================================================
// EMPTY STATE - WELCOME SCREEN
// ============================================================================

function WelcomeScreen({ onCreateClick }: { onCreateClick: () => void }) {
    return (
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-lg text-center"
            >
                {/* Hero Icon */}
                <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/25">
                    <BookOpenIcon className="w-12 h-12 text-white" />
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                    Welcome to Teacher Room
                </h1>
                <p className="text-lg text-neutral-500 dark:text-neutral-400 mb-8">
                    Create your first classroom to start managing students, share announcements, and assign practice tests.
                </p>

                {/* Features Preview */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                        <UsersIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Manage Students</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                        <MegaphoneIcon className="w-6 h-6 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Post Announcements</p>
                    </div>
                    <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                        <ClipboardListIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Assign Practice</p>
                    </div>
                </div>

                {/* CTA Button */}
                <button
                    onClick={onCreateClick}
                    className={cn(
                        'inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all',
                        'bg-indigo-600 text-white hover:bg-indigo-700',
                        'shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30',
                        'hover:scale-105 active:scale-100'
                    )}
                >
                    <PlusIcon className="w-5 h-5" />
                    Create Your First Classroom
                </button>
            </motion.div>
        </div>
    );
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function LoadingSkeleton() {
    return (
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" />
                <p className="text-neutral-500 dark:text-neutral-400">Loading classrooms...</p>
            </div>
        </div>
    );
}

// ============================================================================
// ERROR STATE
// ============================================================================

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center p-6">
            <div className="text-center">
                <AlertCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                    Something went wrong
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400 mb-4">{message}</p>
                <button
                    onClick={onRetry}
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function TeacherClassroomPage() {
    const router = useRouter();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { data: classroomList, isLoading, error, refetch } = useClassrooms();

    // Auto-redirect to first classroom if exists
    useEffect(() => {
        if (!isLoading && classroomList?.classrooms.length) {
            router.replace(`/teacher/classroom/${classroomList.classrooms[0].uuid}`);
        }
    }, [isLoading, classroomList, router]);

    const handleCreateSuccess = (uuid: string) => {
        router.push(`/teacher/classroom/${uuid}`);
    };

    // Loading state
    if (isLoading) {
        return <LoadingSkeleton />;
    }

    // Error state
    if (error) {
        return <ErrorState message={error.message} onRetry={() => refetch()} />;
    }

    // If classrooms exist, show loading while redirecting
    if (classroomList?.classrooms.length) {
        return <LoadingSkeleton />;
    }

    // Empty state - show welcome screen
    return (
        <>
            <WelcomeScreen onCreateClick={() => setIsCreateModalOpen(true)} />
            <CreateClassroomModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />
        </>
    );
}
