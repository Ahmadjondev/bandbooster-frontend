/**
 * Unified Bottom Navigation Component
 * Reusable footer navigation for both Reading and Listening practice modes
 * Shows sections (Parts/Passages) with question progress
 * Supports auto-selection of first item when needed
 */

'use client';

import { useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';

// ============= Types =============

export interface QuestionInfo {
    id: number;
    order: number;
    isAnswered: boolean;
}

export interface SectionInfo {
    sectionNumber: number;
    title?: string;
    questions: QuestionInfo[];
}

export type BottomNavMode = 'reading' | 'listening';

export interface BottomNavProps {
    /** Array of sections (passages for reading, parts for listening) */
    sections: SectionInfo[];
    /** Currently active section number */
    activeSection: number;
    /** Currently active question ID (optional) */
    activeQuestionId?: number | null;
    /** Callback when section changes */
    onSectionChange: (sectionNumber: number) => void;
    /** Callback when a question is clicked */
    onQuestionClick: (questionId: number) => void;
    /** Display mode - determines label text (Part vs Passage) */
    mode?: BottomNavMode;
}

// ============= Component =============

export function BottomNav({
    sections,
    activeSection,
    activeQuestionId,
    onSectionChange,
    onQuestionClick,
    mode = 'listening',
}: BottomNavProps) {
    // Label based on mode
    const sectionLabel = mode === 'reading' ? 'Passage' : 'Part';
    console.log("Started Time:", new Date().toISOString());

    // Auto-select first section if:
    // 1. Only one section exists, or
    // 2. No section is currently selected (activeSection is invalid)
    useEffect(() => {
        if (sections.length === 0) return;
        const validSectionNumbers = sections.map(s => s.sectionNumber);
        const isCurrentSelectionValid = validSectionNumbers.includes(activeSection);

        // If only one section or current selection is invalid, select first
        if (sections.length === 1 || !isCurrentSelectionValid) {
            const firstSection = sections[0];
            if (firstSection && firstSection.sectionNumber !== activeSection) {
                onSectionChange(firstSection.sectionNumber);
            }
        }
    }, [sections, activeSection, onSectionChange]);

    // Get stats per section
    const sectionStats = useMemo(() => {
        return sections.reduce((acc, section) => {
            acc[section.sectionNumber] = {
                answered: section.questions.filter(q => q.isAnswered).length,
                total: section.questions.length,
            };
            return acc;
        }, {} as Record<number, { answered: number; total: number }>);
    }, [sections]);

    // Get questions for active section
    const activeSectionQuestions = useMemo(() => {
        return sections.find(s => s.sectionNumber === activeSection)?.questions ?? [];
    }, [sections, activeSection]);
    console.log("Ended Time:", new Date().toISOString());

    return (
        <nav className="fixed bottom-0 left-0 right-0 w-screen h-14 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-700 flex items-stretch z-40">
            {/* Sections - Full width, evenly distributed */}
            <div className="flex items-stretch h-full flex-1 min-w-0">
                {sections.map((section, index) => {
                    const isActive = activeSection === section.sectionNumber;
                    const stats = sectionStats[section.sectionNumber];
                    const isLast = index === sections.length - 1;

                    return (
                        <div
                            key={section.sectionNumber}
                            className={cn(
                                'h-full flex items-center justify-center flex-1 transition-colors',
                                !isLast && 'border-r border-gray-200 dark:border-gray-700',
                                isActive
                                    ? 'bg-gray-100 dark:bg-slate-800'
                                    : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'
                            )}
                        >
                            {/* Section Label Button */}
                            <button
                                onClick={() => onSectionChange(section.sectionNumber)}
                                className={cn(
                                    'h-full px-2 sm:px-3 flex items-center gap-1 sm:gap-2 text-sm font-medium transition-colors',
                                    isActive
                                        ? 'text-gray-900 dark:text-white'
                                        : 'text-gray-600 dark:text-gray-400'
                                )}
                            >
                                <span className="whitespace-nowrap">
                                    {sectionLabel} {section.sectionNumber}
                                </span>
                                {!isActive && stats && (
                                    <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">
                                        {stats.answered}/{stats.total}
                                    </span>
                                )}
                            </button>

                            {/* Question Numbers (only for active section) */}
                            {isActive && activeSectionQuestions.length > 0 && (
                                <div className="flex items-center gap-0.5 pr-2 sm:pr-3 overflow-x-auto">
                                    {activeSectionQuestions.map((q) => (
                                        <button
                                            key={`${q.id}-${q.order}`}
                                            onClick={() => onQuestionClick(q.id)}
                                            className={cn(
                                                'w-6 h-6 sm:w-7 sm:h-7 text-xs font-medium rounded transition-all shrink-0',
                                                q.isAnswered
                                                    ? 'bg-gray-700 dark:bg-gray-600 text-white'
                                                    : 'bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600',
                                                activeQuestionId === q.id && 'border-2 border-gray-900 dark:ring-offset-slate-900'
                                            )}
                                        >
                                            {q.order}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </nav>
    );
}

// ============= Legacy Compatibility Exports =============

// Types for backward compatibility
export type { QuestionInfo as PartQuestionInfo };
export type { SectionInfo as PartInfo };
export type { QuestionInfo as ReadingQuestionInfo };

export interface ReadingPassageInfo {
    passageNumber: number;
    title: string;
    questions: QuestionInfo[];
}

// Legacy parts interface with partNumber support
export interface LegacyPartInfo {
    partNumber: number;
    sectionNumber?: number;
    questions: QuestionInfo[];
}

// Props types for backward compatibility
export interface IELTSBottomNavProps {
    parts: LegacyPartInfo[];
    activePart: number;
    activeQuestionId?: number | null;
    onPartChange: (partNumber: number) => void;
    onQuestionClick: (questionId: number) => void;
}

export interface ReadingBottomNavProps {
    passages: ReadingPassageInfo[];
    activePassage: number;
    activeQuestionId?: number | null;
    onPassageChange: (passageNumber: number) => void;
    onQuestionClick: (questionId: number) => void;
}

/**
 * @deprecated Use BottomNav with mode="listening" instead
 */
export function IELTSBottomNav({
    parts,
    activePart,
    activeQuestionId,
    onPartChange,
    onQuestionClick,
}: IELTSBottomNavProps) {
    // Convert parts to sections format
    const sections: SectionInfo[] = parts.map(part => ({
        sectionNumber: part.sectionNumber ?? part.partNumber,
        questions: part.questions,
    }));

    return (
        <BottomNav
            sections={sections}
            activeSection={activePart}
            activeQuestionId={activeQuestionId}
            onSectionChange={onPartChange}
            onQuestionClick={onQuestionClick}
            mode="listening"
        />
    );
}

/**
 * @deprecated Use BottomNav with mode="reading" instead
 */
export function ReadingBottomNav({
    passages,
    activePassage,
    activeQuestionId,
    onPassageChange,
    onQuestionClick,
}: ReadingBottomNavProps) {
    // Convert passages to sections format
    const sections: SectionInfo[] = passages.map(passage => ({
        sectionNumber: passage.passageNumber,
        title: passage.title,
        questions: passage.questions,
    }));

    return (
        <BottomNav
            sections={sections}
            activeSection={activePassage}
            activeQuestionId={activeQuestionId}
            onSectionChange={onPassageChange}
            onQuestionClick={onQuestionClick}
            mode="reading"
        />
    );
}

export default BottomNav;
