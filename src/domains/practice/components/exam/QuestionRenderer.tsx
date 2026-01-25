/**
 * Question Renderer Component (Redesigned)
 * Modern, clean question rendering with smooth interactions
 * Supports: MCQ, MCMA, SC, SA, NC, FC, TC, FCC, TFNG, YNNG, MH, MI, MF, ML, DL, SUC
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { QuestionType } from '@/domains/practice/models/domain';

// Types matching the API response
export interface QuestionOption {
    id: number;
    choice_text: string;
    key: string;
}

export interface Question {
    id: number;
    question_text: string;
    order: number;
    question_type: string;
    options: QuestionOption[];
    user_answer: string;
    max_selections?: number | string | null;
}

export interface MatchingOption {
    value: string;
    label: string;
}

export interface TestHead {
    id: number;
    title: string;
    description: string;
    question_type: QuestionType;
    question_range: string;
    instruction: string;
    matching_options: MatchingOption[];
    allow_duplicates: boolean;
    select_count: number | null;
    picture: string | null;
    picture_url: string | null;
    view_type: string;
    answer_format: string | null;
    question_data: Record<string, unknown>;
    example: string | null;
    questions: Question[];
}

export interface QuestionRendererProps {
    /** Test head group containing questions */
    group: TestHead;
    /** User answers - questionId -> answer */
    userAnswers: Record<number, string | string[]>;
    /** Callback when answer changes */
    onAnswer: (questionId: number, answer: string | string[]) => void;
    /** Callback when question is focused */
    onFocus?: (questionId: number) => void;
    /** Font size class */
    fontSize?: string;
}

// Icons
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6" />
    </svg>
);

// Render question text with input placeholders
function renderQuestionWithInputs(
    text: string,
    questionId: number,
    value: string,
    onChange: (value: string) => void,
    onFocus?: () => void,
    fontSize?: string
) {
    if (text.includes('<input>')) {
        const parts = text.split('<input>');
        return (
            <span className="inline">
                {parts.map((part, index) => (
                    <span key={index}>
                        <span dangerouslySetInnerHTML={{ __html: part }} />
                        {index < parts.length - 1 && (
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                                onFocus={onFocus}
                                className={cn(
                                    'inline-block min-w-30 max-w-50 px-3 py-1.5 mx-1',
                                    'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-300 dark:border-primary-700',
                                    'rounded-lg text-primary-700 dark:text-primary-300 font-medium text-center',
                                    'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
                                    'transition-all placeholder:text-primary-400/50',
                                    fontSize
                                )}
                                placeholder="Type answer"
                            />
                        )}
                    </span>
                ))}
            </span>
        );
    }

    return <span dangerouslySetInnerHTML={{ __html: text }} />;
}

export function QuestionRenderer({
    group,
    userAnswers,
    onAnswer,
    onFocus,
    fontSize = 'text-base',
}: QuestionRendererProps) {
    const questionType = group.question_type;

    // Question Number Badge
    const QuestionBadge = ({ order }: { order: number }) => (
        <span className="inline-flex items-center justify-center w-8 h-8 mr-3 text-sm font-bold bg-linear-to-br from-primary-500 to-primary-600 text-white rounded-xl shadow-lg shadow-primary-500/25">
            {order}
        </span>
    );

    // Render MCQ (Multiple Choice Question)
    const renderMCQ = (question: Question) => {
        const selectedAnswer = userAnswers[question.id] as string || '';

        return (
            <motion.div
                key={question.id}
                data-question-order={question.order}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 last:mb-0"
            >
                <div className={cn('flex items-start mb-4 text-slate-900 dark:text-white', fontSize)}>
                    <QuestionBadge order={question.order} />
                    <span className="font-medium leading-relaxed pt-1" dangerouslySetInnerHTML={{ __html: question.question_text }} />
                </div>
                <div className="space-y-3 ml-11">
                    {question.options.map((option, idx) => {
                        const isSelected = selectedAnswer === option.key;
                        return (
                            <motion.label
                                key={option.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={cn(
                                    'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all group',
                                    isSelected
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg shadow-primary-500/10'
                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                                )}
                            >
                                <div className={cn(
                                    'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0',
                                    isSelected
                                        ? 'border-primary-500 bg-primary-500'
                                        : 'border-slate-300 dark:border-slate-600 group-hover:border-slate-400 dark:group-hover:border-slate-500'
                                )}>
                                    {isSelected && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-2.5 h-2.5 bg-white rounded-full"
                                        />
                                    )}
                                </div>
                                <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    value={option.key}
                                    checked={isSelected}
                                    onChange={() => {
                                        onAnswer(question.id, option.key);
                                        onFocus?.(question.id);
                                    }}
                                    className="sr-only"
                                />
                                <span className={cn(
                                    'flex-1 font-medium transition-colors',
                                    isSelected
                                        ? 'text-primary-700 dark:text-primary-300'
                                        : 'text-slate-700 dark:text-slate-300'
                                )}>
                                    <span className="font-bold mr-2">{option.key}.</span>
                                    {option.choice_text}
                                </span>
                            </motion.label>
                        );
                    })}
                </div>
            </motion.div>
        );
    };

    // Render MCMA (Multiple Choice Multiple Answer)
    const renderMCMA = (question: Question) => {
        const selectedAnswers = (userAnswers[question.id] as string[]) || [];
        const maxSelections = question.max_selections
            ? typeof question.max_selections === 'string'
                ? parseInt(question.max_selections)
                : question.max_selections
            : question.options.length;

        const handleOptionToggle = (key: string) => {
            let newAnswers: string[];
            if (selectedAnswers.includes(key)) {
                newAnswers = selectedAnswers.filter(a => a !== key);
            } else if (selectedAnswers.length < maxSelections) {
                newAnswers = [...selectedAnswers, key];
            } else {
                return;
            }
            onAnswer(question.id, newAnswers);
            onFocus?.(question.id);
        };

        return (
            <motion.div
                key={question.id}
                data-question-order={question.order}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 last:mb-0"
            >
                <div className={cn('flex items-start mb-4 text-slate-900 dark:text-white', fontSize)}>
                    <QuestionBadge order={question.order} />
                    <div className="flex-1">
                        <span className="font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: question.question_text }} />
                        <span className="ml-2 text-sm text-primary-600 dark:text-primary-400 font-medium bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-lg">
                            Select {maxSelections}
                        </span>
                    </div>
                </div>
                <div className="space-y-3 ml-11">
                    {question.options.map((option, idx) => {
                        const isSelected = selectedAnswers.includes(option.key);
                        return (
                            <motion.label
                                key={option.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={cn(
                                    'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all group',
                                    isSelected
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg shadow-primary-500/10'
                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                                )}
                            >
                                <div className={cn(
                                    'w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0',
                                    isSelected
                                        ? 'border-primary-500 bg-primary-500'
                                        : 'border-slate-300 dark:border-slate-600 group-hover:border-slate-400 dark:group-hover:border-slate-500'
                                )}>
                                    {isSelected && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                            <CheckIcon className="w-4 h-4 text-white" />
                                        </motion.div>
                                    )}
                                </div>
                                <input
                                    type="checkbox"
                                    value={option.key}
                                    checked={isSelected}
                                    onChange={() => handleOptionToggle(option.key)}
                                    className="sr-only"
                                />
                                <span className={cn(
                                    'flex-1 font-medium transition-colors',
                                    isSelected
                                        ? 'text-primary-700 dark:text-primary-300'
                                        : 'text-slate-700 dark:text-slate-300'
                                )}>
                                    <span className="font-bold mr-2">{option.key}.</span>
                                    {option.choice_text}
                                </span>
                            </motion.label>
                        );
                    })}
                </div>
            </motion.div>
        );
    };

    // Render SC/SA/NC/FC/TC/FCC (Fill in the blank types)
    const renderFillBlank = (question: Question) => {
        const answer = (userAnswers[question.id] as string) || '';

        return (
            <motion.div
                key={question.id}
                data-question-order={question.order}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 last:mb-0"
            >
                <div className={cn('flex items-start text-slate-900 dark:text-white leading-relaxed', fontSize)}>
                    <QuestionBadge order={question.order} />
                    <div className="flex-1 pt-1">
                        {renderQuestionWithInputs(
                            question.question_text,
                            question.id,
                            answer,
                            (value) => onAnswer(question.id, value),
                            () => onFocus?.(question.id),
                            fontSize
                        )}
                    </div>
                </div>
            </motion.div>
        );
    };

    // Render TFNG/YNNG (True/False/Not Given, Yes/No/Not Given)
    const renderTFNG = (question: Question, isYNNG = false) => {
        const selectedAnswer = (userAnswers[question.id] as string) || '';
        const options = isYNNG
            ? [
                { key: 'YES', label: 'Yes', color: 'emerald' },
                { key: 'NO', label: 'No', color: 'red' },
                { key: 'NOT GIVEN', label: 'Not Given', color: 'slate' },
            ]
            : [
                { key: 'TRUE', label: 'True', color: 'emerald' },
                { key: 'FALSE', label: 'False', color: 'red' },
                { key: 'NOT GIVEN', label: 'Not Given', color: 'slate' },
            ];

        return (
            <motion.div
                key={question.id}
                data-question-order={question.order}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 last:mb-0"
            >
                <div className={cn('flex items-start mb-4 text-slate-900 dark:text-white', fontSize)}>
                    <QuestionBadge order={question.order} />
                    <span className="font-medium leading-relaxed pt-1" dangerouslySetInnerHTML={{ __html: question.question_text }} />
                </div>
                <div className="flex flex-wrap gap-3 ml-11">
                    {options.map((option, idx) => {
                        const isSelected = selectedAnswer === option.key;
                        return (
                            <motion.button
                                key={option.key}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => {
                                    onAnswer(question.id, option.key);
                                    onFocus?.(question.id);
                                }}
                                className={cn(
                                    'px-5 py-2.5 rounded-xl border-2 font-semibold transition-all',
                                    isSelected
                                        ? option.color === 'emerald'
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 shadow-lg shadow-emerald-500/10'
                                            : option.color === 'red'
                                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 shadow-lg shadow-red-500/10'
                                                : 'border-slate-500 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shadow-lg'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                                )}
                            >
                                {option.label}
                            </motion.button>
                        );
                    })}
                </div>
            </motion.div>
        );
    };

    // Render MH/MI/MF/ML (Matching types)
    const renderMatching = (question: Question) => {
        const selectedAnswer = (userAnswers[question.id] as string) || '';
        const options = group.matching_options;

        return (
            <motion.div
                key={question.id}
                data-question-order={question.order}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 last:mb-0"
            >
                <div className={cn('flex items-start mb-4 text-slate-900 dark:text-white', fontSize)}>
                    <QuestionBadge order={question.order} />
                    <span className="font-medium leading-relaxed pt-1" dangerouslySetInnerHTML={{ __html: question.question_text }} />
                </div>
                <div className="ml-11">
                    <div className="relative">
                        <select
                            value={selectedAnswer}
                            onChange={(e) => {
                                onAnswer(question.id, e.target.value);
                                onFocus?.(question.id);
                            }}
                            className={cn(
                                'w-full max-w-md appearance-none px-4 py-3 pr-10 rounded-xl border-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer',
                                selectedAnswer
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                            )}
                        >
                            <option value="" className="text-slate-400">Select an answer...</option>
                            {options.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.value}. {option.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </motion.div>
        );
    };

    // Render questions based on type
    const renderQuestion = (question: Question) => {
        switch (questionType) {
            case 'MCQ':
                return renderMCQ(question);
            case 'MCMA':
                return renderMCMA(question);
            case 'SC':
            case 'SA':
            case 'NC':
            case 'FC':
            case 'TC':
            case 'FCC':
            case 'SUC':
                return renderFillBlank(question);
            case 'TFNG':
                return renderTFNG(question, false);
            case 'YNNG':
                return renderTFNG(question, true);
            case 'MH':
            case 'MI':
            case 'MF':
            case 'ML':
                return renderMatching(question);
            case 'DL':
                return renderFillBlank(question);
            default:
                return renderFillBlank(question);
        }
    };

    return (
        <div>
            {/* Group Header */}
            <div className="mb-8">
                <h3 className={cn('font-bold text-slate-900 dark:text-white mb-3 text-lg', fontSize)}>
                    {group.title}
                </h3>
                {group.instruction && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                        <p className={cn('text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed', fontSize)}>
                            {group.instruction}
                        </p>
                    </div>
                )}
            </div>

            {/* Matching Options Reference */}
            {['MH', 'MI', 'MF', 'ML'].includes(questionType) && group.matching_options.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-5 bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200/50 dark:border-amber-700/30"
                >
                    <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                        Options
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {group.matching_options.map((option) => (
                            <div key={option.value} className={cn('flex items-start gap-2 text-slate-700 dark:text-slate-300', fontSize)}>
                                <span className="font-bold text-amber-600 dark:text-amber-400 shrink-0">
                                    {option.value}.
                                </span>
                                <span>{option.label}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Picture */}
            {group.picture_url && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-8"
                >
                    <img
                        src={group.picture_url}
                        alt="Question image"
                        className="max-w-full h-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg"
                    />
                </motion.div>
            )}

            {/* Questions */}
            <div>
                {group.questions.map((question) => renderQuestion(question))}
            </div>
        </div>
    );
}
