/**
 * Shared Components Index
 * Export reusable components for IELTS question types
 * 
 * BlankInput is the SINGLE reusable input component for ALL question types:
 * - Fully flexible, content-driven sizing
 * - Auto-wrapping text (no overflow)
 * - Dynamic width and height based on content
 * - Safe to reuse in: NC, FC, TC, SUC, FCC, SC, SA, DL
 * 
 * WordListDropdown is used for SUC questions with word_list:
 * - Dropdown selector (no free-text)
 * - Only allows selection from word_list items
 */

export { BlankInput, type BlankInputProps, type FlexibleInputProps } from './BlankInput';
export { WordListDropdown, type WordListDropdownProps } from './WordListDropdown';
