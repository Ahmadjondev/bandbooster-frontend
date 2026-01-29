'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
    useClassroom,
    useClassrooms,
    useClassroomRoster,
    useTeacherFeed,
    usePostMessage,
    useAssignmentBundles,
    useAssignmentBundle,
    useCreateAssignmentBundle,
    useUpdateAssignmentBundle,
    usePublishBundle,
    useCloseBundle,
    useRemoveStudent,
    useRegenerateInviteCode,
    useDeleteClassroom,
    useCreateClassroom,
    useAddBundleItem,
    useRemoveBundleItem,
    useContentSearch,
} from '@/domains/classroom';
import type {
    Classroom,
    ClassroomDetail,
    FeedAssignment,
    FeedMessage,
    FeedItem,
    AssignmentBundle,
    AssignmentBundleDetail,
    StudentRosterItem,
    AssignmentBundleStatus,
    MessageType,
    BundleItemType,
    AssignmentType,
    ContentSearchResult,
    AssignmentItem,
} from '@/domains/classroom';

// ============================================================================
// ICONS
// ============================================================================

const Icons = {
    search: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
    ),
    plus: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14" /><path d="M5 12h14" />
        </svg>
    ),
    send: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
        </svg>
    ),
    x: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
        </svg>
    ),
    check: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    chevronRight: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
        </svg>
    ),
    edit: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    ),
    megaphone: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 11 18-5v12L3 13v-2Z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
        </svg>
    ),
    clipboardList: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" />
        </svg>
    ),
    fileText: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />
        </svg>
    ),
    users: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    userX: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="17" x2="22" y1="8" y2="13" /><line x1="22" x2="17" y1="8" y2="13" />
        </svg>
    ),
    settings: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ),
    headphones: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
    ),
    bookOpen: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
    ),
    pencil: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        </svg>
    ),
    mic: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="22" />
        </svg>
    ),
    graduationCap: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
        </svg>
    ),
    pin: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" x2="12" y1="17" y2="22" /><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
        </svg>
    ),
    copy: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>
    ),
    refresh: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
        </svg>
    ),
    trash: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
    ),
    calendar: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    ),
    clock: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
    ),
    arrowLeft: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
        </svg>
    ),
    alertCircle: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    ),
    book: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
    ),
    hash: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" />
        </svg>
    ),
    sidebar: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" />
        </svg>
    ),
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatFullDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

function formatDateForInput(date: Date): string {
    return date.toISOString().slice(0, 16);
}

const statusColors: Record<string, string> = {
    ACTIVE: 'bg-emerald-500',
    ARCHIVED: 'bg-neutral-400',
    INACTIVE: 'bg-amber-500',
};

const ASSIGNMENT_TYPES: { value: AssignmentType; label: string }[] = [
    { value: 'HOMEWORK', label: 'Homework' },
    { value: 'PRACTICE', label: 'Practice' },
    { value: 'QUIZ', label: 'Quiz' },
    { value: 'EXAM', label: 'Exam' },
    { value: 'REMEDIAL', label: 'Remedial' },
];

const CONTENT_TYPES: { value: BundleItemType; label: string; icon: keyof typeof Icons }[] = [
    { value: 'READING_PASSAGE', label: 'Reading', icon: 'bookOpen' },
    { value: 'LISTENING_PART', label: 'Listening', icon: 'headphones' },
    { value: 'WRITING_TASK', label: 'Writing', icon: 'pencil' },
    { value: 'SPEAKING_TOPIC', label: 'Speaking', icon: 'mic' },
    { value: 'MOCK_EXAM', label: 'Mock Exam', icon: 'graduationCap' },
];

// ============================================================================
// CLASSROOM LIST SIDEBAR
// ============================================================================

interface ClassroomSidebarProps {
    classrooms: Classroom[];
    selectedUuid: string;
    onSelect: (uuid: string) => void;
    onCreateNew: () => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

function ClassroomSidebar({ classrooms, selectedUuid, onSelect, onCreateNew, isCollapsed, onToggleCollapse }: ClassroomSidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const filteredClassrooms = classrooms.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (isCollapsed) {
        return (
            <motion.aside initial={false} animate={{ width: 72 }} className="hidden lg:flex flex-col h-full bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-center h-14 border-b border-neutral-200 dark:border-neutral-800">
                    <button onClick={onToggleCollapse} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                        <Icons.sidebar className="w-5 h-5 text-neutral-500" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto py-2">
                    {filteredClassrooms.map((classroom) => (
                        <button key={classroom.uuid} onClick={() => onSelect(classroom.uuid)} className={cn('w-full p-3 flex justify-center transition-colors', selectedUuid === classroom.uuid ? 'bg-indigo-50 dark:bg-indigo-950/50' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50')}>
                            <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm', selectedUuid === classroom.uuid ? 'bg-indigo-600' : 'bg-linear-to-br from-indigo-500 to-purple-600')}>
                                {classroom.name[0].toUpperCase()}
                            </div>
                        </button>
                    ))}
                </div>
                <div className="p-3 border-t border-neutral-200 dark:border-neutral-800">
                    <button onClick={onCreateNew} className="w-full p-2 flex justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                        <Icons.plus className="w-5 h-5" />
                    </button>
                </div>
            </motion.aside>
        );
    }

    return (
        <motion.aside initial={false} animate={{ width: 320 }} className="hidden lg:flex flex-col h-full bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between px-4 h-14 border-b border-neutral-200 dark:border-neutral-800">
                <h2 className="font-semibold text-neutral-900 dark:text-white">Classrooms</h2>
                <div className="flex items-center gap-1">
                    <button onClick={onCreateNew} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                        <Icons.plus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </button>
                    <button onClick={onToggleCollapse} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                        <Icons.sidebar className="w-5 h-5 text-neutral-500" />
                    </button>
                </div>
            </div>
            <div className="p-3 border-b border-neutral-100 dark:border-neutral-800">
                <div className="relative">
                    <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search classrooms..." className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 border-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {filteredClassrooms.length === 0 ? (
                    <div className="p-6 text-center">
                        <Icons.book className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{searchQuery ? 'No classrooms found' : 'No classrooms yet'}</p>
                    </div>
                ) : (
                    <div className="py-1">
                        {filteredClassrooms.map((classroom) => {
                            const isSelected = selectedUuid === classroom.uuid;
                            return (
                                <button key={classroom.uuid} onClick={() => onSelect(classroom.uuid)} className={cn('w-full px-3 py-3 flex items-center gap-3 transition-colors', isSelected ? 'bg-indigo-50 dark:bg-indigo-950/50' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50')}>
                                    <div className={cn('w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold shrink-0', isSelected ? 'bg-indigo-600' : 'bg-linear-to-br from-indigo-500 to-purple-600')}>
                                        {classroom.name[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="flex items-center gap-2">
                                            <span className={cn('font-medium truncate', isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-neutral-900 dark:text-white')}>{classroom.name}</span>
                                            <span className={cn('w-2 h-2 rounded-full shrink-0', statusColors[classroom.status])} />
                                        </div>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <span className="text-xs text-neutral-500 dark:text-neutral-400">{classroom.studentCount} students</span>
                                            {classroom.assignmentCount > 0 && <span className="text-xs text-neutral-400 dark:text-neutral-500">{classroom.assignmentCount} assignments</span>}
                                        </div>
                                    </div>
                                    {classroom.pendingGrading > 0 && <div className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs font-medium flex items-center justify-center shrink-0">{classroom.pendingGrading > 9 ? '9+' : classroom.pendingGrading}</div>}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </motion.aside>
    );
}

// ============================================================================
// MENU SIDEBAR
// ============================================================================

type MenuTab = 'feed' | 'students' | 'assignments' | 'settings';

function MenuSidebar({ activeTab, onTabChange, studentCount, assignmentCount }: { activeTab: MenuTab; onTabChange: (tab: MenuTab) => void; studentCount: number; assignmentCount: number }) {
    const menuItems: { id: MenuTab; label: string; icon: keyof typeof Icons; badge?: number }[] = [
        { id: 'feed', label: 'Feed', icon: 'megaphone' },
        { id: 'students', label: 'Students', icon: 'users', badge: studentCount },
        { id: 'assignments', label: 'Assignments', icon: 'clipboardList', badge: assignmentCount },
        { id: 'settings', label: 'Settings', icon: 'settings' },
    ];

    return (
        <div className="w-56 shrink-0 border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 hidden md:block">
            <div className="p-3 space-y-1">
                {menuItems.map((item) => {
                    const Icon = Icons[item.icon];
                    const isActive = activeTab === item.id;
                    return (
                        <button key={item.id} onClick={() => onTabChange(item.id)} className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all', isActive ? 'bg-white dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-neutral-600 dark:text-neutral-400 hover:bg-white/50 dark:hover:bg-neutral-800/50')}>
                            <Icon className="w-5 h-5" />
                            <span className="flex-1 text-left">{item.label}</span>
                            {item.badge !== undefined && item.badge > 0 && <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', isActive ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'bg-neutral-200 dark:bg-neutral-700')}>{item.badge}</span>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ============================================================================
// MOBILE TAB BAR
// ============================================================================

function MobileTabBar({ activeTab, onTabChange }: { activeTab: MenuTab; onTabChange: (tab: MenuTab) => void }) {
    const tabs: { id: MenuTab; icon: keyof typeof Icons }[] = [
        { id: 'feed', icon: 'megaphone' },
        { id: 'students', icon: 'users' },
        { id: 'assignments', icon: 'clipboardList' },
        { id: 'settings', icon: 'settings' },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 z-30">
            <div className="flex items-center justify-around py-2">
                {tabs.map((tab) => {
                    const Icon = Icons[tab.icon];
                    return (
                        <button key={tab.id} onClick={() => onTabChange(tab.id)} className={cn('flex flex-col items-center gap-1 p-2 rounded-lg transition-colors', activeTab === tab.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-500')}>
                            <Icon className="w-5 h-5" />
                            <span className="text-xs capitalize">{tab.id}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ============================================================================
// FEED ASSIGNMENT ITEM
// ============================================================================

function FeedAssignmentItem({ assignment, onEdit }: { assignment: FeedAssignment; onEdit?: () => void }) {
    const statusStyles: Record<string, { bg: string; text: string }> = {
        DRAFT: { bg: 'bg-neutral-100 dark:bg-neutral-800', text: 'text-neutral-600 dark:text-neutral-400' },
        PUBLISHED: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
        CLOSED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
    };
    const typeStyles: Record<string, { bg: string; border: string; iconColor: string }> = {
        HOMEWORK: { bg: 'bg-indigo-50 dark:bg-indigo-950/30', border: 'border-indigo-200 dark:border-indigo-800', iconColor: 'text-indigo-600 dark:text-indigo-400' },
        QUIZ: { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', iconColor: 'text-amber-600 dark:text-amber-400' },
        EXAM: { bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-800', iconColor: 'text-red-600 dark:text-red-400' },
        PRACTICE: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800', iconColor: 'text-emerald-600 dark:text-emerald-400' },
        REMEDIAL: { bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-800', iconColor: 'text-purple-600 dark:text-purple-400' },
    };
    const style = typeStyles[assignment.assignmentType] || typeStyles.HOMEWORK;
    const status = statusStyles[assignment.status] || statusStyles.DRAFT;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="group">
            <div className={cn('rounded-2xl border p-4', style.bg, style.border)}>
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className={cn('w-9 h-9 rounded-full bg-white dark:bg-neutral-800 flex items-center justify-center shadow-sm', style.iconColor)}>
                            <Icons.clipboardList className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-neutral-900 dark:text-white">{assignment.title}</span>
                                <span className={cn('px-2 py-0.5 text-xs font-medium rounded-full', status.bg, status.text)}>{assignment.status}</span>
                                {assignment.isOverdue && <span className="px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 rounded-full">Overdue</span>}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 flex-wrap mt-1">
                                <span>{assignment.assignmentType}</span>
                                <span>•</span>
                                <span>by {assignment.createdBy.name}</span>
                                <span>•</span>
                                <span>{formatFullDate(assignment.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                    {onEdit && assignment.status === 'DRAFT' && (
                        <button onClick={onEdit} className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-neutral-800/50 text-neutral-500 transition-colors">
                            <Icons.edit className="w-4 h-4" />
                        </button>
                    )}
                </div>
                {assignment.description && <p className="text-neutral-700 dark:text-neutral-300 text-sm mb-3">{assignment.description}</p>}
                <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 mb-3 flex-wrap">
                    <span className="flex items-center gap-1"><Icons.fileText className="w-3.5 h-3.5" />{assignment.itemCount} items</span>
                    <span className="flex items-center gap-1"><Icons.users className="w-3.5 h-3.5" />{assignment.completedCount}/{assignment.assignedCount} completed</span>
                    {assignment.dueDate && <span className="flex items-center gap-1"><Icons.calendar className="w-3.5 h-3.5" />Due {formatTime(assignment.dueDate)}</span>}
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mb-3">
                    <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${assignment.completionPercentage}%` }} />
                </div>
                {assignment.topSubmissions.length > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">Recent:</span>
                        <div className="flex -space-x-2">
                            {assignment.topSubmissions.slice(0, 3).map((sub: { studentName: string; bandScore?: number }, idx: number) => (
                                <div key={idx} className="w-6 h-6 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-neutral-800" title={`${sub.studentName}${sub.bandScore ? ` - Band ${sub.bandScore}` : ''}`}>
                                    {sub.studentName.charAt(0)}
                                </div>
                            ))}
                        </div>
                        {assignment.hasMoreSubmissions && <span className="text-xs text-neutral-500 dark:text-neutral-400">+{assignment.totalSubmissions - 3} more</span>}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// ============================================================================
// FEED MESSAGE ITEM
// ============================================================================

function FeedMessageItem({ message }: { message: FeedMessage }) {
    const isPinned = message.isPinned;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="group">
            <div className={cn('rounded-2xl border p-4', isPinned ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800' : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800')}>
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className={cn('w-9 h-9 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm')}>
                            {message.author.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-neutral-900 dark:text-white">{message.author.name}</span>
                                {isPinned && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-full">
                                        <Icons.pin className="w-3 h-3" />Pinned
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">{formatTime(message.createdAt)}</span>
                        </div>
                    </div>
                </div>
                <p className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">{message.content}</p>
            </div>
        </motion.div>
    );
}

// ============================================================================
// FEED TAB CONTENT
// ============================================================================

function FeedTabContent({ classroomUuid, onOpenAssignment }: { classroomUuid: string; onOpenAssignment?: (uuid: string) => void }) {
    const [messageContent, setMessageContent] = useState('');
    const [isPinned, setIsPinned] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { data: feed, isLoading } = useTeacherFeed(classroomUuid);
    const postMessage = usePostMessage();

    const handleSubmit = () => {
        if (!messageContent.trim()) return;
        postMessage.mutate({ classroomUuid, data: { content: messageContent.trim(), messageType: 'ANNOUNCEMENT' as MessageType, isPinned } }, { onSuccess: () => { setMessageContent(''); setIsPinned(false); } });
    };

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) { textarea.style.height = 'auto'; textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`; }
    }, [messageContent]);

    // Separate pinned items and sort by date
    const items: FeedItem[] = feed?.items || [];
    const pinnedItems = items.filter((item: FeedItem): item is FeedMessage => item.type === 'MESSAGE' && item.isPinned);
    const regularItems = items.filter((item: FeedItem) => !(item.type === 'MESSAGE' && item.isPinned));

    return (
        <div className="flex-1 flex flex-col bg-neutral-50 dark:bg-neutral-950">
            {feed?.stats && (
                <div className="shrink-0 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
                    <div className="max-w-3xl mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center"><div className="text-2xl font-bold text-neutral-900 dark:text-white">{feed.stats.totalStudents}</div><div className="text-xs text-neutral-500 dark:text-neutral-400">Students</div></div>
                            <div className="text-center"><div className="text-2xl font-bold text-neutral-900 dark:text-white">{feed.stats.totalAssignments}</div><div className="text-xs text-neutral-500 dark:text-neutral-400">Assignments</div></div>
                            <div className="text-center"><div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{feed.stats.pendingGrading}</div><div className="text-xs text-neutral-500 dark:text-neutral-400">Pending Grading</div></div>
                            <div className="text-center"><div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{Math.round(feed.stats.averageCompletionRate)}%</div><div className="text-xs text-neutral-500 dark:text-neutral-400">Completion Rate</div></div>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
                {isLoading ? (
                    <div className="space-y-4 max-w-3xl mx-auto">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-neutral-100 dark:bg-neutral-800 rounded-2xl animate-pulse" />)}</div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <Icons.clipboardList className="w-16 h-16 text-neutral-200 dark:text-neutral-700 mb-4" />
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">No activity yet</h3>
                        <p className="text-neutral-500 dark:text-neutral-400 max-w-sm">Create assignments or post announcements to get started.</p>
                    </div>
                ) : (
                    <div className="space-y-4 max-w-3xl mx-auto">
                        {/* Pinned messages first */}
                        {pinnedItems.length > 0 && (
                            <AnimatePresence>
                                {pinnedItems.map((item: FeedMessage) => (
                                    <FeedMessageItem key={item.uuid} message={item} />
                                ))}
                            </AnimatePresence>
                        )}
                        {/* Regular items (assignments + unpinned messages) */}
                        <AnimatePresence>
                            {regularItems.map((item: FeedItem) => {
                                if (item.type === 'MESSAGE') {
                                    return <FeedMessageItem key={item.uuid} message={item} />;
                                }
                                return (
                                    <FeedAssignmentItem
                                        key={item.uuid}
                                        assignment={item}
                                        onEdit={onOpenAssignment ? () => onOpenAssignment(item.uuid) : undefined}
                                    />
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
            <div className="shrink-0 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 md:p-4">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-end gap-2 md:gap-3">
                        <button onClick={() => setIsPinned(!isPinned)} className={cn('p-2.5 rounded-xl border transition-colors', isPinned ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400' : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-400')} title={isPinned ? 'Pinned announcement' : 'Pin announcement'}>
                            <Icons.pin className="w-4 h-4" />
                        </button>
                        <div className="flex-1 relative">
                            <textarea ref={textareaRef} value={messageContent} onChange={(e) => setMessageContent(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }} placeholder="Write an announcement..." rows={1} className="w-full px-4 py-3 rounded-2xl resize-none bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500" />
                        </div>
                        <button onClick={handleSubmit} disabled={!messageContent.trim() || postMessage.isPending} className={cn('p-3 rounded-xl transition-all shrink-0', messageContent.trim() ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400')}>
                            <Icons.send className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="hidden md:block mt-2 text-xs text-neutral-400 dark:text-neutral-500">Press Enter to send, Shift+Enter for new line</p>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// STUDENTS TAB CONTENT
// ============================================================================

function StudentsTabContent({ classroomUuid }: { classroomUuid: string }) {
    const { data: roster, isLoading } = useClassroomRoster(classroomUuid);
    const removeStudent = useRemoveStudent();

    if (isLoading) return <div className="flex-1 p-4 md:p-6 pb-20 md:pb-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-neutral-100 dark:bg-neutral-800 rounded-xl animate-pulse" />)}</div>;
    if (!roster?.students.length) return <div className="flex-1 flex flex-col items-center justify-center text-center p-6 pb-20 md:pb-6"><Icons.users className="w-16 h-16 text-neutral-200 dark:text-neutral-700 mb-4" /><h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">No students yet</h3><p className="text-neutral-500 dark:text-neutral-400 max-w-sm">Share your classroom invite code with students to let them join.</p></div>;

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
            <div className="max-w-2xl mx-auto space-y-2">
                {roster.students.map((rosterItem: StudentRosterItem) => (
                    <motion.div key={rosterItem.uuid} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="group flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shrink-0 text-sm md:text-base">{rosterItem.student.firstName[0]}{rosterItem.student.lastName[0]}</div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-neutral-900 dark:text-white text-sm md:text-base truncate">{rosterItem.student.fullName}</p>
                            <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400 truncate">{rosterItem.student.email}</p>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3 shrink-0">
                            <span className="hidden sm:block text-xs text-neutral-400 dark:text-neutral-500">{formatTime(rosterItem.enrolledAt)}</span>
                            <button onClick={() => { if (confirm(`Remove ${rosterItem.student.fullName} from this classroom?`)) removeStudent.mutate({ classroomUuid, studentUuid: rosterItem.student.uuid }); }} disabled={removeStudent.isPending} className="p-2 rounded-lg md:opacity-0 md:group-hover:opacity-100 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50">
                                <Icons.userX className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

// ============================================================================
// CONTENT SEARCH MODAL
// ============================================================================

function ContentSearchModal({ isOpen, onClose, onSelect, selectedItems }: { isOpen: boolean; onClose: () => void; onSelect: (item: ContentSearchResult) => void; selectedItems: number[] }) {
    const [activeType, setActiveType] = useState<BundleItemType>('READING_PASSAGE');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    useEffect(() => { const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300); return () => clearTimeout(timer); }, [searchQuery]);

    const { data: results, isLoading } = useContentSearch({ contentType: activeType, query: debouncedQuery || undefined }, { enabled: isOpen });

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60" />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-60 w-full max-w-2xl max-h-[80vh] mx-4">
                        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[80vh]">
                            <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
                                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Add Content</h2>
                                <button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"><Icons.x className="w-5 h-5 text-neutral-500" /></button>
                            </div>
                            <div className="flex gap-1 p-3 border-b border-neutral-100 dark:border-neutral-800 overflow-x-auto shrink-0">
                                {CONTENT_TYPES.map((type) => {
                                    const Icon = Icons[type.icon];
                                    return (
                                        <button key={type.value} onClick={() => setActiveType(type.value)} className={cn('flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors', activeType === type.value ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800')}>
                                            <Icon className="w-4 h-4" />{type.label}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="p-3 shrink-0">
                                <div className="relative">
                                    <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={`Search ${CONTENT_TYPES.find(t => t.value === activeType)?.label.toLowerCase()}...`} className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 border-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-3 pt-0">
                                {isLoading ? (
                                    <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-neutral-100 dark:bg-neutral-800 rounded-xl animate-pulse" />)}</div>
                                ) : !results?.length ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center"><Icons.search className="w-12 h-12 text-neutral-200 dark:text-neutral-700 mb-3" /><p className="text-neutral-500 dark:text-neutral-400">{searchQuery ? 'No results found' : 'Start typing to search'}</p></div>
                                ) : (
                                    <div className="space-y-2">
                                        {results.map((item: ContentSearchResult) => {
                                            const isSelected = selectedItems.includes(item.id);
                                            return (
                                                <button key={item.id} onClick={() => !isSelected && onSelect(item)} disabled={isSelected} className={cn('w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors', isSelected ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800' : 'bg-neutral-50 dark:bg-neutral-800 border border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-700')}>
                                                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', isSelected ? 'bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400')}>
                                                        {isSelected ? <Icons.check className="w-5 h-5" /> : <Icons.fileText className="w-5 h-5" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-neutral-900 dark:text-white truncate">{item.title}</p>
                                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{item.difficulty && <span className="capitalize">{item.difficulty}</span>}{item.partNumber && <span> • Part {item.partNumber}</span>}{item.passageNumber && <span> • Passage {item.passageNumber}</span>}</p>
                                                    </div>
                                                    {!isSelected && <Icons.plus className="w-5 h-5 text-neutral-400" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// ============================================================================
// ASSIGNMENT MODAL
// ============================================================================

function AssignmentModal({ isOpen, onClose, classroomUuid, editBundleUuid }: { isOpen: boolean; onClose: () => void; classroomUuid: string; editBundleUuid?: string }) {
    const [step, setStep] = useState<'details' | 'content'>('details');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignmentType, setAssignmentType] = useState<AssignmentType>('HOMEWORK');
    const [dueDate, setDueDate] = useState('');
    const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | undefined>();
    const [allowLateSubmission, setAllowLateSubmission] = useState(true);
    const [isContentSearchOpen, setIsContentSearchOpen] = useState(false);
    const [pendingItems, setPendingItems] = useState<ContentSearchResult[]>([]);

    const { data: existingBundle } = useAssignmentBundle(editBundleUuid || '', { enabled: !!editBundleUuid });

    useEffect(() => {
        if (existingBundle) {
            setTitle(existingBundle.title);
            setDescription(existingBundle.description || '');
            setAssignmentType(existingBundle.assignmentType);
            setDueDate(existingBundle.dueDate ? formatDateForInput(existingBundle.dueDate) : '');
            setTimeLimitMinutes(existingBundle.timeLimitMinutes);
            setAllowLateSubmission(existingBundle.allowLateSubmission);
        }
    }, [existingBundle]);

    const createAssignment = useCreateAssignmentBundle({ onSuccess: (bundle: AssignmentBundleDetail) => { if (pendingItems.length > 0) addItemsSequentially(bundle.uuid, pendingItems); else resetAndClose(); } });
    const updateAssignment = useUpdateAssignmentBundle();
    const addBundleItem = useAddBundleItem();
    const removeBundleItem = useRemoveBundleItem();
    const publishBundle = usePublishBundle();

    const addItemsSequentially = async (bundleUuid: string, items: ContentSearchResult[]) => {
        for (const item of items) await addBundleItem.mutateAsync({ bundleUuid, data: { itemType: item.contentType, contentId: item.id } });
        resetAndClose();
    };

    const resetAndClose = () => { setStep('details'); setTitle(''); setDescription(''); setAssignmentType('HOMEWORK'); setDueDate(''); setTimeLimitMinutes(undefined); setAllowLateSubmission(true); setPendingItems([]); onClose(); };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        if (editBundleUuid) updateAssignment.mutate({ uuid: editBundleUuid, data: { title: title.trim(), description: description.trim() || undefined, assignmentType, dueDate: dueDate ? new Date(dueDate) : undefined, timeLimitMinutes, allowLateSubmission } }, { onSuccess: resetAndClose });
        else createAssignment.mutate({ classroomUuid, title: title.trim(), description: description.trim() || undefined, assignmentType, dueDate: dueDate ? new Date(dueDate) : undefined, timeLimitMinutes, allowLateSubmission });
    };

    const handleAddContent = (item: ContentSearchResult) => {
        if (editBundleUuid) addBundleItem.mutate({ bundleUuid: editBundleUuid, data: { itemType: item.contentType, contentId: item.id } });
        else setPendingItems((prev) => [...prev, item]);
        // setIsContentSearchOpen(false);
    };

    const handleRemoveItem = (item: ContentSearchResult | AssignmentItem) => {
        if ('uuid' in item && editBundleUuid) removeBundleItem.mutate({ bundleUuid: editBundleUuid, itemId: (item as AssignmentItem).uuid });
        else setPendingItems((prev) => prev.filter((i) => i.id !== (item as ContentSearchResult).id));
    };

    const isPending = createAssignment.isPending || updateAssignment.isPending || addBundleItem.isPending;
    const selectedItemIds = [...pendingItems.map((i: ContentSearchResult) => i.id), ...(existingBundle?.items.map((i: AssignmentItem) => i.contentId) || [])];
    const allItems = [...pendingItems.map((item: ContentSearchResult) => ({ ...item, isPending: true })), ...(existingBundle?.items || []).map((item: AssignmentItem) => ({ ...item, isPending: false }))];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={resetAndClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[90vh] mx-4">
                        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[90vh]">
                            <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
                                <div><h2 className="text-lg font-semibold text-neutral-900 dark:text-white">{editBundleUuid ? 'Edit Assignment' : 'New Assignment'}</h2>{step === 'content' && <p className="text-sm text-neutral-500">Add content items</p>}</div>
                                <button onClick={resetAndClose} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"><Icons.x className="w-5 h-5 text-neutral-500" /></button>
                            </div>
                            <div className="flex border-b border-neutral-200 dark:border-neutral-800 shrink-0">
                                <button onClick={() => setStep('details')} className={cn('flex-1 px-4 py-3 text-sm font-medium transition-colors', step === 'details' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300')}>1. Details</button>
                                <button onClick={() => title.trim() && setStep('content')} disabled={!title.trim()} className={cn('flex-1 px-4 py-3 text-sm font-medium transition-colors', step === 'content' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed')}>2. Content</button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-5">
                                {step === 'details' ? (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div><label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Title *</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Reading Practice Week 1" className="w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" required /></div>
                                        <div><label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional instructions for students..." rows={2} className="w-full px-4 py-2.5 rounded-xl border resize-none bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                                        <div><label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Type</label><div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{ASSIGNMENT_TYPES.map((type) => <button key={type.value} type="button" onClick={() => setAssignmentType(type.value)} className={cn('px-3 py-2 rounded-xl text-sm font-medium transition-colors text-left', assignmentType === type.value ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-2 border-indigo-500' : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300')}>{type.label}</button>)}</div></div>
                                        <div><label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Due Date</label><input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                                        <div><label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Time Limit (minutes)</label><input type="number" value={timeLimitMinutes || ''} onChange={(e) => setTimeLimitMinutes(e.target.value ? parseInt(e.target.value) : undefined)} placeholder="No limit" min={1} className="w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                                        <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={allowLateSubmission} onChange={(e) => setAllowLateSubmission(e.target.checked)} className="w-5 h-5 rounded border-neutral-300 dark:border-neutral-600 text-indigo-600 focus:ring-indigo-500" /><span className="text-sm text-neutral-700 dark:text-neutral-300">Allow late submissions</span></label>
                                    </form>
                                ) : (
                                    <div className="space-y-4">
                                        <button onClick={() => setIsContentSearchOpen(true)} className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"><Icons.plus className="w-5 h-5" />Add Content Items</button>
                                        {allItems.length > 0 ? (
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{allItems.length} item{allItems.length !== 1 ? 's' : ''} added</p>
                                                {allItems.map((item, idx) => {
                                                    const contentType = 'contentType' in item ? item.contentType : (item as AssignmentItem).itemType;
                                                    const typeInfo = CONTENT_TYPES.find(t => t.value === contentType);
                                                    const Icon = typeInfo ? Icons[typeInfo.icon] : Icons.fileText;
                                                    const itemTitle = 'title' in item ? item.title : (item as AssignmentItem).contentTitle;
                                                    return (
                                                        <div key={idx} className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                                                            <div className="w-9 h-9 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-400"><Icon className="w-4 h-4" /></div>
                                                            <div className="flex-1 min-w-0"><p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{itemTitle}</p><p className="text-xs text-neutral-500">{typeInfo?.label || contentType}</p></div>
                                                            <button onClick={() => handleRemoveItem(item as ContentSearchResult | AssignmentItem)} disabled={removeBundleItem.isPending} className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Icons.x className="w-4 h-4" /></button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8"><Icons.clipboardList className="w-12 h-12 text-neutral-200 dark:text-neutral-700 mx-auto mb-3" /><p className="text-neutral-500 dark:text-neutral-400">No content added yet</p></div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center justify-between gap-3 p-5 border-t border-neutral-200 dark:border-neutral-800 shrink-0">
                                {step === 'details' ? (
                                    <><button type="button" onClick={resetAndClose} className="px-4 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl">Cancel</button><button onClick={() => title.trim() && setStep('content')} disabled={!title.trim()} className="px-4 py-2.5 text-sm font-medium rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">Next<Icons.chevronRight className="w-4 h-4" /></button></>
                                ) : (
                                    <><button type="button" onClick={() => setStep('details')} className="px-4 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl flex items-center gap-2"><Icons.arrowLeft className="w-4 h-4" />Back</button>
                                        <div className="flex gap-2">
                                            <button onClick={handleSubmit} disabled={isPending || !title.trim()} className="px-4 py-2.5 text-sm font-medium rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50">{isPending ? 'Saving...' : 'Save Draft'}</button>
                                            {editBundleUuid && existingBundle?.status === 'DRAFT' && <button onClick={() => { if (confirm('Publish this assignment? Students will be able to see and complete it.')) publishBundle.mutate(editBundleUuid, { onSuccess: resetAndClose }); }} disabled={publishBundle.isPending || allItems.length === 0} className="px-4 py-2.5 text-sm font-medium rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"><Icons.send className="w-4 h-4" />Publish</button>}
                                        </div></>
                                )}
                            </div>
                        </div>
                    </motion.div>
                    <ContentSearchModal isOpen={isContentSearchOpen} onClose={() => setIsContentSearchOpen(false)} onSelect={handleAddContent} selectedItems={selectedItemIds} />
                </>
            )}
        </AnimatePresence>
    );
}

// ============================================================================
// ASSIGNMENTS TAB CONTENT
// ============================================================================

function AssignmentsTabContent({ classroomUuid }: { classroomUuid: string }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editBundleUuid, setEditBundleUuid] = useState<string | undefined>();
    const { data: bundleList, isLoading } = useAssignmentBundles({ params: { classroomUuid } });
    const publishBundle = usePublishBundle();
    const closeBundle = useCloseBundle();

    const statusStyles: Record<AssignmentBundleStatus, { bg: string; text: string }> = { DRAFT: { bg: 'bg-neutral-100 dark:bg-neutral-800', text: 'text-neutral-600 dark:text-neutral-400' }, PUBLISHED: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' }, CLOSED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' } };

    const handleEdit = (uuid: string) => { setEditBundleUuid(uuid); setIsCreateOpen(true); };
    const handleCloseModal = () => { setIsCreateOpen(false); setEditBundleUuid(undefined); };

    if (isLoading) return <div className="flex-1 p-4 md:p-6 pb-20 md:pb-6 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-neutral-100 dark:bg-neutral-800 rounded-xl animate-pulse" />)}</div>;

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="shrink-0 flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
                <h3 className="font-semibold text-neutral-900 dark:text-white">Assignments</h3>
                <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"><Icons.plus className="w-4 h-4" /><span className="hidden sm:inline">New Assignment</span></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
                {!bundleList?.bundles.length ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <Icons.clipboardList className="w-16 h-16 text-neutral-200 dark:text-neutral-700 mb-4" /><h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">No assignments yet</h3><p className="text-neutral-500 dark:text-neutral-400 max-w-sm mb-4">Create an assignment to give your students practice work.</p>
                        <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"><Icons.plus className="w-4 h-4" />Create Assignment</button>
                    </div>
                ) : (
                    <div className="max-w-2xl mx-auto space-y-3">
                        {bundleList.bundles.map((bundle: AssignmentBundle) => {
                            const style = statusStyles[bundle.status as AssignmentBundleStatus];
                            return (
                                <motion.div key={bundle.uuid} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="group p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
                                    <div className="flex items-start justify-between mb-2 gap-2">
                                        <div className="min-w-0"><h4 className="font-medium text-neutral-900 dark:text-white truncate">{bundle.title}</h4><p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{bundle.assignmentType} • {bundle.totalItems} items</p></div>
                                        <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full capitalize shrink-0', style.bg, style.text)}>{bundle.status}</span>
                                    </div>
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div className="flex items-center gap-3 md:gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                                            {bundle.dueDate && <span className="flex items-center gap-1"><Icons.calendar className="w-3.5 h-3.5" />Due {formatTime(bundle.dueDate)}</span>}
                                            <span className="flex items-center gap-1"><Icons.clock className="w-3.5 h-3.5" />Created {formatTime(bundle.createdAt)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {bundle.status === 'DRAFT' && (
                                                <><button onClick={() => handleEdit(bundle.uuid)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"><Icons.edit className="w-3.5 h-3.5" />Edit</button><button onClick={() => publishBundle.mutate(bundle.uuid)} disabled={publishBundle.isPending || bundle.totalItems === 0} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors disabled:opacity-50"><Icons.send className="w-3.5 h-3.5" />Publish</button></>
                                            )}
                                            {bundle.status === 'PUBLISHED' && <button onClick={() => closeBundle.mutate(bundle.uuid)} disabled={closeBundle.isPending} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"><Icons.x className="w-3.5 h-3.5" />Close</button>}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
            <AssignmentModal isOpen={isCreateOpen} onClose={handleCloseModal} classroomUuid={classroomUuid} editBundleUuid={editBundleUuid} />
        </div>
    );
}

// ============================================================================
// SETTINGS TAB CONTENT
// ============================================================================

function SettingsTabContent({ classroomUuid, inviteCode }: { classroomUuid: string; inviteCode: string }) {
    const router = useRouter();
    const [copied, setCopied] = useState(false);
    const regenerateInvite = useRegenerateInviteCode();
    const deleteClassroom = useDeleteClassroom({ onSuccess: () => router.push('/teacher/classroom') });

    const handleCopy = async () => { await navigator.clipboard.writeText(regenerateInvite.data || inviteCode); setCopied(true); setTimeout(() => setCopied(false), 2000); };

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
            <div className="max-w-xl mx-auto space-y-6">
                <div className="p-4 md:p-5 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-3 md:mb-4">Invite Code</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3 md:mb-4">Share this code with students to let them join your classroom.</p>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden"><Icons.hash className="w-4 h-4 text-neutral-400 shrink-0" /><code className="font-mono text-neutral-700 dark:text-neutral-300 truncate">{regenerateInvite.data || inviteCode}</code></div>
                        <button onClick={handleCopy} className={cn('p-3 rounded-xl transition-colors shrink-0', copied ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300')}>{copied ? <Icons.check className="w-5 h-5" /> : <Icons.copy className="w-5 h-5" />}</button>
                        <button onClick={() => { if (confirm('Regenerate invite code? Old links will stop working.')) regenerateInvite.mutate(classroomUuid); }} disabled={regenerateInvite.isPending} className="p-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors disabled:opacity-50 shrink-0"><Icons.refresh className={cn('w-5 h-5', regenerateInvite.isPending && 'animate-spin')} /></button>
                    </div>
                </div>
                <div className="p-4 md:p-5 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900/30">
                    <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2">Danger Zone</h3>
                    <p className="text-sm text-red-600 dark:text-red-400/80 mb-4">Permanently delete this classroom and all associated data.</p>
                    <button onClick={() => { if (confirm('Delete this classroom? This cannot be undone.')) deleteClassroom.mutate(classroomUuid); }} disabled={deleteClassroom.isPending} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"><Icons.trash className="w-4 h-4" />{deleteClassroom.isPending ? 'Deleting...' : 'Delete Classroom'}</button>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// CREATE CLASSROOM MODAL
// ============================================================================

function CreateClassroomModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: (uuid: string) => void }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const createClassroom = useCreateClassroom({ onSuccess: (classroom: ClassroomDetail) => { onClose(); setName(''); setDescription(''); onSuccess(classroom.uuid); } });

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4">
                        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800"><h2 className="text-lg font-semibold text-neutral-900 dark:text-white">New Classroom</h2><button onClick={onClose} className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"><Icons.x className="w-5 h-5 text-neutral-500" /></button></div>
                            <form onSubmit={(e) => { e.preventDefault(); if (name.trim()) createClassroom.mutate({ name: name.trim(), description: description.trim() || undefined }); }} className="p-5 space-y-4">
                                <div><label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Name *</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., IELTS Band 7 - Morning Class" className="w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" required /></div>
                                <div><label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description..." rows={3} className="w-full px-4 py-2.5 rounded-xl border resize-none bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" /></div>
                                {createClassroom.error && <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400 text-sm"><Icons.alertCircle className="w-4 h-4 shrink-0" /><span>{createClassroom.error.message}</span></div>}
                                <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl">Cancel</button><button type="submit" disabled={!name.trim() || createClassroom.isPending} className="px-4 py-2.5 text-sm font-medium rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">{createClassroom.isPending ? 'Creating...' : 'Create Classroom'}</button></div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// ============================================================================
// MAIN CLASSROOM PAGE
// ============================================================================

export default function ClassroomDetailPage() {
    const params = useParams();
    const router = useRouter();
    const classroomUuid = params.classroomId as string;

    const [activeTab, setActiveTab] = useState<MenuTab>('feed');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isCreateClassroomOpen, setIsCreateClassroomOpen] = useState(false);

    const { data: classroomList, isLoading: isListLoading } = useClassrooms();
    const { data: classroom, isLoading: isDetailLoading, error } = useClassroom(classroomUuid);
    const { data: roster } = useClassroomRoster(classroomUuid, { enabled: !!classroom });
    const { data: bundleList } = useAssignmentBundles({ params: { classroomUuid }, enabled: !!classroom });

    const handleSelectClassroom = useCallback((uuid: string) => { if (uuid !== classroomUuid) router.push(`/teacher/classroom/${uuid}`); }, [classroomUuid, router]);
    const handleCreateSuccess = useCallback((uuid: string) => { router.push(`/teacher/classroom/${uuid}`); }, [router]);
    const handleOpenAssignment = useCallback((uuid: string) => { setActiveTab('assignments'); }, []);

    if (isListLoading || isDetailLoading) return <div className="h-[calc(100vh-4rem)] flex"><div className="hidden lg:block w-80 border-r border-neutral-200 dark:border-neutral-800 animate-pulse bg-neutral-50 dark:bg-neutral-900" /><div className="flex-1 animate-pulse bg-neutral-100 dark:bg-neutral-950" /></div>;

    if (error || !classroom) return (
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center p-4">
            <div className="text-center"><Icons.alertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" /><h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Classroom not found</h3><p className="text-neutral-500 dark:text-neutral-400 mb-4">{error?.message || 'Unable to load classroom'}</p><button onClick={() => router.push('/teacher/classroom')} className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">Back to Classrooms</button></div>
        </div>
    );

    const classrooms = classroomList?.classrooms || [];

    return (
        <div className="h-[calc(100vh-4rem)] flex overflow-hidden">
            <ClassroomSidebar classrooms={classrooms} selectedUuid={classroomUuid} onSelect={handleSelectClassroom} onCreateNew={() => setIsCreateClassroomOpen(true)} isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
            <div className="flex-1 flex flex-col min-w-0">
                <div className="shrink-0 flex items-center justify-between px-4 md:px-6 h-14 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shrink-0 text-sm md:text-base">{classroom.name[0].toUpperCase()}</div>
                        <div className="min-w-0"><div className="flex items-center gap-2"><h1 className="font-semibold text-neutral-900 dark:text-white truncate text-sm md:text-base">{classroom.name}</h1><span className={cn('w-2 h-2 rounded-full shrink-0', statusColors[classroom.status])} /></div><p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400 truncate">{classroom.studentCount} students • {classroom.assignmentCount} assignments</p></div>
                    </div>
                    <Link href="/teacher/classroom" className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0"><Icons.arrowLeft className="w-4 h-4" />All Classrooms</Link>
                </div>
                <div className="flex-1 flex overflow-hidden">
                    <MenuSidebar activeTab={activeTab} onTabChange={setActiveTab} studentCount={roster?.count || 0} assignmentCount={bundleList?.count || 0} />
                    {activeTab === 'feed' && <FeedTabContent classroomUuid={classroomUuid} onOpenAssignment={handleOpenAssignment} />}
                    {activeTab === 'students' && <StudentsTabContent classroomUuid={classroomUuid} />}
                    {activeTab === 'assignments' && <AssignmentsTabContent classroomUuid={classroomUuid} />}
                    {activeTab === 'settings' && <SettingsTabContent classroomUuid={classroomUuid} inviteCode={classroom.inviteCode} />}
                </div>
            </div>
            <MobileTabBar activeTab={activeTab} onTabChange={setActiveTab} />
            <CreateClassroomModal isOpen={isCreateClassroomOpen} onClose={() => setIsCreateClassroomOpen(false)} onSuccess={handleCreateSuccess} />
        </div>
    );
}
