/**
 * Reading Passage Component
 * Displays the reading passage text in a scrollable panel
 * IELTS-authentic styling with proper typography for academic reading
 */

'use client';

import { forwardRef, useMemo } from 'react';
import { cn } from '@/lib/utils';

export interface ReadingPassageProps {
    /** Passage title */
    title: string;
    /** Passage content (HTML or plain text) */
    content: string;
    /** Passage number (e.g., Passage 1) */
    passageNumber?: number;
    /** Optional word count display */
    wordCount?: number;
    /** Additional className */
    className?: string;
}

export const ReadingPassage = forwardRef<HTMLDivElement, ReadingPassageProps>(
    function ReadingPassage({ title, content, passageNumber, wordCount, className }, ref) {
        // Parse content - handle HTML or plain text
        // CRITICAL: Preserve all line breaks exactly as provided from backend
        const formattedContent = useMemo(() => {
            // If content already has <p> tags, return as-is
            if (content.includes('<p>') || content.includes('<p ')) {
                return content;
            }

            // Split by double newlines (\n\n) to create paragraph breaks
            // This handles both plain text and HTML content (like <strong> tags)
            const paragraphs = content.split(/\n\n+/);

            return paragraphs
                .filter(para => para.trim() !== '') // Remove empty paragraphs
                .map(para => {
                    // Preserve single line breaks within paragraphs as <br/>
                    const formattedPara = para.replace(/\n/g, '<br/>');
                    return `<p class="mb-3 leading-relaxed">${formattedPara}</p>`;
                })
                .join('');
        }, [content]);

        return (
            <div
                ref={ref}
                className={cn(
                    'h-full overflow-y-auto bg-white dark:bg-slate-900',
                    className
                )}
            >
                {/* Passage Header */}
                <div className="sticky top-0 bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3 z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            {passageNumber && (
                                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    Passage {passageNumber}
                                </span>
                            )}
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                                {title}
                            </h2>
                        </div>
                        {wordCount && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {wordCount.toLocaleString()} words
                            </span>
                        )}
                    </div>
                </div>

                {/* Passage Content */}
                <article
                    className="px-6 py-6 prose prose-gray dark:prose-invert max-w-none
                        prose-p:text-gray-700 dark:prose-p:text-gray-300
                        prose-p:leading-relaxed prose-p:text-[15px] prose-p:mb-4
                        prose-headings:text-gray-900 dark:prose-headings:text-white
                        prose-headings:font-semibold
                        prose-h3:text-base prose-h3:mt-6 prose-h3:mb-3
                        prose-strong:text-gray-900 dark:prose-strong:text-white
                        prose-em:text-gray-700 dark:prose-em:text-gray-300
                        selection:bg-blue-100 dark:selection:bg-blue-900/30"
                    dangerouslySetInnerHTML={{ __html: formattedContent }}
                />
            </div>
        );
    }
);

export default ReadingPassage;
