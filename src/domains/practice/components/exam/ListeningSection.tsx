/**
 * Listening Section Component
 * Main component for listening practice with audio player, questions, and navigation
 * Matches the IELTS CD test interface design
 */

'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { AudioPlayer } from './AudioPlayer';
import { QuestionRenderer, type TestHead } from './QuestionRenderer';
import { QuestionPalette, type PartInfo } from './QuestionPalette';
import { cn } from '@/lib/utils';

// Types matching API response
export interface ListeningContent {
    id: number;
    section_number: number;
    part_number: number;
    title: string;
    description: string;
    audio_url: string;
    test_heads: TestHead[];
    total_questions: number;
}

export interface ListeningSectionProps {
    /** Array of listening content parts */
    contents: ListeningContent[];
    /** User answers - questionId -> answer */
    userAnswers: Record<number, string | string[]>;
    /** Callback when answer changes */
    onAnswer: (questionId: number, answer: string | string[]) => void;
    /** Callback when finish is clicked */
    onFinish?: () => void;
    /** Duration in minutes (for display) */
    duration?: number;
    /** Practice title */
    title?: string;
    /** Whether to auto-play first audio */
    autoPlayFirst?: boolean;
}

// Icons
const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m15 18-6-6 6-6" />
    </svg>
);

const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 18 6-6-6-6" />
    </svg>
);

export function ListeningSection({
    contents,
    userAnswers,
    onAnswer,
    onFinish,
    duration,
    title,
    autoPlayFirst = true,
}: ListeningSectionProps) {
    const [activePart, setActivePart] = useState(1);
    const [fontSize, setFontSize] = useState('text-base');
    const [focusedQuestionId, setFocusedQuestionId] = useState<number | null>(null);
    const questionsContainerRef = useRef<HTMLDivElement>(null);
    const audioStatesRef = useRef<Record<number, number>>({});

    // Sort contents by part number
    const sortedContents = useMemo(() => {
        return [...contents].sort((a, b) => a.part_number - b.part_number);
    }, [contents]);

    // Get active content
    const activeContent = useMemo(() => {
        return sortedContents.find(c => c.part_number === activePart) || sortedContents[0];
    }, [sortedContents, activePart]);

    // Build parts info for palette
    const partsInfo: PartInfo[] = useMemo(() => {
        return sortedContents.map(content => {
            const questions: { id: number; order: number; isAnswered: boolean }[] = [];
            content.test_heads.forEach(head => {
                head.questions.forEach(q => {
                    const answer = userAnswers[q.id];
                    const isAnswered = answer !== undefined &&
                        (Array.isArray(answer) ? answer.length > 0 : String(answer).trim() !== '');
                    questions.push({
                        id: q.id,
                        order: q.order,
                        isAnswered,
                    });
                });
            });
            return {
                partNumber: content.part_number,
                questions,
            };
        });
    }, [sortedContents, userAnswers]);

    // Listen for font size changes
    useEffect(() => {
        const handleFontSizeChange = (event: CustomEvent) => {
            setFontSize(event.detail.fontSize);
        };

        window.addEventListener('fontSizeChange', handleFontSizeChange as EventListener);
        return () => {
            window.removeEventListener('fontSizeChange', handleFontSizeChange as EventListener);
        };
    }, []);

    // Auto-scroll to top when part changes
    useEffect(() => {
        if (questionsContainerRef.current) {
            questionsContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [activePart]);

    // Scroll to question
    const scrollToQuestion = useCallback((questionId: number) => {
        // Find question order
        let targetOrder: number | null = null;
        let targetPart: number | null = null;

        sortedContents.forEach(content => {
            content.test_heads.forEach(head => {
                head.questions.forEach(q => {
                    if (q.id === questionId) {
                        targetOrder = q.order;
                        targetPart = content.part_number;
                    }
                });
            });
        });

        if (targetPart && targetPart !== activePart) {
            setActivePart(targetPart);
            // Wait for part change then scroll
            setTimeout(() => {
                const element = questionsContainerRef.current?.querySelector(`[data-question-order="${targetOrder}"]`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setFocusedQuestionId(questionId);
                    setTimeout(() => setFocusedQuestionId(null), 2000);
                }
            }, 100);
        } else if (targetOrder) {
            const element = questionsContainerRef.current?.querySelector(`[data-question-order="${targetOrder}"]`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setFocusedQuestionId(questionId);
                setTimeout(() => setFocusedQuestionId(null), 2000);
            }
        }
    }, [sortedContents, activePart]);

    // Handle audio ended - auto-play next part
    const handleAudioEnded = useCallback((partNumber: number) => {
        const nextPart = sortedContents.find(c => c.part_number === partNumber + 1);
        if (nextPart) {
            console.log(`[LISTENING] Part ${partNumber} audio ended, switching to Part ${nextPart.part_number}`);
            setTimeout(() => {
                setActivePart(nextPart.part_number);
            }, 1000);
        }
    }, [sortedContents]);

    // Handle audio time update - save progress
    const handleTimeUpdate = useCallback((partNumber: number, currentTime: number) => {
        audioStatesRef.current[partNumber] = currentTime;
    }, []);

    if (!activeContent) {
        return (
            <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <p className="text-slate-600 dark:text-slate-400">No listening content available</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
            {/* Audio Player - Fixed at top */}
            <div className="shrink-0 p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <div className="max-w-5xl mx-auto">
                    <AudioPlayer
                        src={activeContent.audio_url}
                        partNumber={activeContent.part_number}
                        onEnded={() => handleAudioEnded(activeContent.part_number)}
                        onTimeUpdate={(time) => handleTimeUpdate(activeContent.part_number, time)}
                        initialTime={audioStatesRef.current[activeContent.part_number] || 0}
                        autoPlay={autoPlayFirst && activeContent.part_number === sortedContents[0]?.part_number}
                    />
                </div>
            </div>

            {/* Questions Content */}
            <div ref={questionsContainerRef} className="flex-1 overflow-y-auto pb-24 custom-scrollbar">
                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="max-w-5xl mx-auto">
                        {/* Part Title */}
                        <div className="mb-6">
                            <h2 className={cn('text-xl font-bold text-slate-900 dark:text-white', fontSize)}>
                                Part {activeContent.part_number}: {activeContent.title}
                            </h2>
                            {activeContent.description && (
                                <p className={cn('mt-2 text-slate-600 dark:text-slate-400', fontSize)}>
                                    {activeContent.description}
                                </p>
                            )}
                        </div>

                        {/* Question Groups */}
                        {activeContent.test_heads.map((group) => (
                            <div key={group.id} className="mb-8">
                                <div className={cn(
                                    'bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm',
                                    fontSize
                                )}>
                                    <QuestionRenderer
                                        group={group}
                                        userAnswers={userAnswers}
                                        onAnswer={onAnswer}
                                        onFocus={(questionId) => {
                                            setFocusedQuestionId(questionId);
                                            setTimeout(() => setFocusedQuestionId(null), 2000);
                                        }}
                                        fontSize={fontSize}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Navigation Buttons - Above Palette */}
            <div className="fixed bottom-16 right-4 z-50 flex items-center gap-2">
                <button
                    onClick={() => {
                        if (activePart > 1) {
                            setActivePart(activePart - 1);
                        }
                    }}
                    disabled={activePart <= 1}
                    className="flex items-center gap-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeftIcon className="w-4 h-4" />
                    Prev
                </button>
                <button
                    onClick={() => {
                        const maxPart = Math.max(...sortedContents.map(c => c.part_number));
                        if (activePart < maxPart) {
                            setActivePart(activePart + 1);
                        }
                    }}
                    disabled={activePart >= Math.max(...sortedContents.map(c => c.part_number))}
                    className="flex items-center gap-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                    <ChevronRightIcon className="w-4 h-4" />
                </button>
            </div>

            {/* Question Palette */}
            <QuestionPalette
                parts={partsInfo}
                activePart={activePart}
                onPartChange={setActivePart}
                onQuestionClick={scrollToQuestion}
                focusedQuestionId={focusedQuestionId}
                onFinish={onFinish}
                finishLabel="Submit"
                showFinish={true}
            />
        </div>
    );
}
