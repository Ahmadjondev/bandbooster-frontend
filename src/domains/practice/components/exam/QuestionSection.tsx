/**
 * IELTS Question Section Renderer
 * Renders questions matching official IELTS test interface
 * Supports 12+ question types with consistent visual language
 * 
 * @deprecated Use QuestionTypeFactory from './question-types' instead.
 * This component is kept for backwards compatibility but will be removed in a future version.
 */

'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { QuestionType } from '@/domains/practice/models/domain';

// Types
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

export interface QuestionSectionProps {
    group: TestHead;
    userAnswers: Record<number, string | string[]>;
    onAnswer: (questionId: number, answer: string | string[]) => void;
}

// Inline input renderer for fill-in-the-blank questions
function renderTextWithInputs(
    text: string,
    questionId: number,
    value: string,
    onChange: (value: string) => void
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
                                className="inline-block w-24 h-7 px-2 mx-1 text-sm text-center border border-gray-300 rounded bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                placeholder=""
                            />
                        )}
                    </span>
                ))}
            </span>
        );
    }
    return <span dangerouslySetInnerHTML={{ __html: text }} />;
}

export function QuestionSection({ group, userAnswers, onAnswer }: QuestionSectionProps) {
    const questionType = group.question_type;

    // Parse question range for display
    const questionRange = useMemo(() => {
        if (group.question_range) {
            return group.question_range;
        }
        if (group.questions.length > 0) {
            const orders = group.questions.map(q => q.order);
            const min = Math.min(...orders);
            const max = Math.max(...orders);
            return min === max ? `${min}` : `${min}-${max}`;
        }
        return '';
    }, [group]);

    // Render MCQ (Multiple Choice Question - single answer)
    const renderMCQ = (question: Question) => {
        const selectedAnswer = userAnswers[question.id] as string || '';

        return (
            <div key={question.id} className="mb-4 last:mb-0">
                <div className="flex items-start gap-2 mb-2 text-sm text-gray-900">
                    <span className="font-medium">{question.order}</span>
                    <span dangerouslySetInnerHTML={{ __html: question.question_text }} />
                </div>
                <div className="ml-5 space-y-1">
                    {question.options.map((option) => {
                        const isSelected = selectedAnswer === option.key;
                        return (
                            <label
                                key={option.id}
                                className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 py-0.5"
                            >
                                <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    value={option.key}
                                    checked={isSelected}
                                    onChange={() => onAnswer(question.id, option.key)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <span>
                                    <span className="font-medium">{option.key}</span> {option.choice_text}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>
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

        const handleToggle = (key: string) => {
            let newAnswers: string[];
            if (selectedAnswers.includes(key)) {
                newAnswers = selectedAnswers.filter(a => a !== key);
            } else if (selectedAnswers.length < maxSelections) {
                newAnswers = [...selectedAnswers, key];
            } else {
                return;
            }
            onAnswer(question.id, newAnswers);
        };

        return (
            <div key={question.id} className="mb-4 last:mb-0">
                <div className="flex items-start gap-2 mb-2 text-sm text-gray-900">
                    <span className="font-medium">{question.order}</span>
                    <span dangerouslySetInnerHTML={{ __html: question.question_text }} />
                </div>
                <div className="ml-5 space-y-1">
                    {question.options.map((option) => {
                        const isSelected = selectedAnswers.includes(option.key);
                        return (
                            <label
                                key={option.id}
                                className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 py-0.5"
                            >
                                <input
                                    type="checkbox"
                                    value={option.key}
                                    checked={isSelected}
                                    onChange={() => handleToggle(option.key)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span>
                                    <span className="font-medium">{option.key}</span> {option.choice_text}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Render Fill Blank (SC, SA, NC, FC, TC, FCC, SUC) - inline input style
    const renderFillBlank = (question: Question) => {
        const answer = (userAnswers[question.id] as string) || '';

        return (
            <div key={question.id} className="flex items-start gap-2 mb-2 text-sm text-gray-900">
                <span className="shrink-0">•</span>
                <div className="flex-1">
                    {renderTextWithInputs(
                        question.question_text,
                        question.id,
                        answer,
                        (value) => onAnswer(question.id, value)
                    )}
                </div>
            </div>
        );
    };

    // Render Fill Blank with number prefix (for note completion style)
    const renderFillBlankNumbered = (question: Question) => {
        const answer = (userAnswers[question.id] as string) || '';
        const text = question.question_text;

        // Check if text already contains input placeholder
        if (text.includes('<input>')) {
            return (
                <div key={question.id} className="flex items-start gap-2 mb-2 text-sm text-gray-900">
                    <span className="shrink-0">•</span>
                    <div className="flex-1">
                        {renderTextWithInputs(text, question.id, answer, (value) => onAnswer(question.id, value))}
                    </div>
                </div>
            );
        }

        // Default: text followed by input
        return (
            <div key={question.id} className="flex items-start gap-2 mb-2 text-sm text-gray-900">
                <span className="shrink-0">•</span>
                <div className="flex-1 flex items-center gap-1 flex-wrap">
                    <span dangerouslySetInnerHTML={{ __html: text }} />
                    <input
                        type="text"
                        value={answer}
                        onChange={(e) => onAnswer(question.id, e.target.value)}
                        className="inline-block w-24 h-7 px-2 text-sm text-center border border-gray-300 rounded bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder={String(question.order)}
                    />
                </div>
            </div>
        );
    };

    // Render TFNG (True/False/Not Given)
    const renderTFNG = (question: Question) => {
        const selectedAnswer = (userAnswers[question.id] as string) || '';
        const options = [
            { key: 'TRUE', label: 'True' },
            { key: 'FALSE', label: 'False' },
            { key: 'NOT GIVEN', label: 'Not Given' },
        ];

        return (
            <div key={question.id} className="mb-4 last:mb-0">
                <div className="flex items-start gap-2 mb-2 text-sm text-gray-900">
                    <span className="font-medium">{question.order}</span>
                    <span dangerouslySetInnerHTML={{ __html: question.question_text }} />
                </div>
                <div className="ml-5 flex gap-4">
                    {options.map((option) => {
                        const isSelected = selectedAnswer === option.key;
                        return (
                            <label key={option.key} className="flex items-center gap-2 cursor-pointer text-sm">
                                <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    value={option.key}
                                    checked={isSelected}
                                    onChange={() => onAnswer(question.id, option.key)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <span className={isSelected ? 'font-medium text-gray-900' : 'text-gray-700'}>
                                    {option.label}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Render YNNG (Yes/No/Not Given)
    const renderYNNG = (question: Question) => {
        const selectedAnswer = (userAnswers[question.id] as string) || '';
        const options = [
            { key: 'YES', label: 'Yes' },
            { key: 'NO', label: 'No' },
            { key: 'NOT GIVEN', label: 'Not Given' },
        ];

        return (
            <div key={question.id} className="mb-4 last:mb-0">
                <div className="flex items-start gap-2 mb-2 text-sm text-gray-900">
                    <span className="font-medium">{question.order}</span>
                    <span dangerouslySetInnerHTML={{ __html: question.question_text }} />
                </div>
                <div className="ml-5 flex gap-4">
                    {options.map((option) => {
                        const isSelected = selectedAnswer === option.key;
                        return (
                            <label key={option.key} className="flex items-center gap-2 cursor-pointer text-sm">
                                <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    value={option.key}
                                    checked={isSelected}
                                    onChange={() => onAnswer(question.id, option.key)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                />
                                <span className={isSelected ? 'font-medium text-gray-900' : 'text-gray-700'}>
                                    {option.label}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>
        );
    };

    // Render Matching (MH, MI, MF, ML) with dropdown
    const renderMatching = (question: Question) => {
        const selectedAnswer = (userAnswers[question.id] as string) || '';
        const options = group.matching_options;

        return (
            <div key={question.id} className="flex items-start gap-2 mb-3 text-sm text-gray-900">
                <span className="font-medium shrink-0">{question.order}</span>
                <span className="flex-1" dangerouslySetInnerHTML={{ __html: question.question_text }} />
                <select
                    value={selectedAnswer}
                    onChange={(e) => onAnswer(question.id, e.target.value)}
                    className="w-20 h-7 px-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                    <option value=""></option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.value}
                        </option>
                    ))}
                </select>
            </div>
        );
    };

    // Render question based on type
    const renderQuestion = (question: Question) => {
        switch (questionType) {
            case 'MCQ':
                return renderMCQ(question);
            case 'MCMA':
                return renderMCMA(question);
            case 'TFNG':
                return renderTFNG(question);
            case 'YNNG':
                return renderYNNG(question);
            case 'MH':
            case 'MI':
            case 'MF':
            case 'ML':
                return renderMatching(question);
            case 'SC':
            case 'SA':
            case 'NC':
            case 'FC':
            case 'TC':
            case 'FCC':
            case 'SUC':
            case 'DL':
            default:
                return renderFillBlankNumbered(question);
        }
    };

    return (
        <div className="mb-6">
            {/* Section Title */}
            <h3 className="text-base font-bold text-gray-900 mb-2">
                Questions {questionRange}
            </h3>

            {/* Instruction */}
            {group.instruction && (
                <p className="text-sm text-gray-700 mb-4">
                    {group.instruction.split('**').map((part, i) =>
                        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                    )}
                </p>
            )}

            {/* Matching Options Reference */}
            {['MH', 'MI', 'MF', 'ML'].includes(questionType) && group.matching_options.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded text-sm">
                    <div className="font-medium text-gray-700 mb-2">Options:</div>
                    <div className="grid grid-cols-1 gap-1">
                        {group.matching_options.map((option) => (
                            <div key={option.value} className="text-gray-600">
                                <span className="font-medium">{option.value}.</span> {option.label}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Picture if present */}
            {group.picture_url && (
                <div className="mb-4">
                    <img
                        src={group.picture_url}
                        alt="Question reference"
                        className="max-w-full h-auto border border-gray-200 rounded"
                    />
                </div>
            )}

            {/* Questions */}
            <div>
                {group.questions.map((question) => renderQuestion(question))}
            </div>
        </div>
    );
}
