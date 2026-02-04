'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { ContentType, PracticeMode, SaveResponse } from '../models/domain';

// ============================================================================
// ICONS
// ============================================================================

const icons = {
  save: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  ),
  plus: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  ),
  check: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  layers: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  fileText: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
};

// ============================================================================
// TYPES
// ============================================================================

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface CreatePracticeData {
  title: string;
  practiceMode: PracticeMode;
  difficulty: Difficulty;
  isPremium: boolean;
  selectedContentIds?: number[];
}

interface WorkflowActionsProps {
  isValid: boolean;
  contentType: ContentType | null;
  onSave: () => void;
  isSaving: boolean;
  saveResponse?: SaveResponse | null;
  onCreatePractice: (data: CreatePracticeData) => void;
  isCreatingPractice: boolean;
}

// ============================================================================
// PRACTICE MODE SELECTOR
// ============================================================================

interface PracticeModeSelectorProps {
  mode: PracticeMode;
  onChange: (mode: PracticeMode) => void;
  contentType: ContentType;
  partCount: number;
}

function PracticeModeSelector({ mode, onChange, contentType, partCount }: PracticeModeSelectorProps) {
  const itemLabel = contentType === 'LISTENING' ? 'part' : 'passage';
  const itemLabelPlural = contentType === 'LISTENING' ? 'parts' : 'passages';

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange('SECTION_PRACTICE')}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all',
          mode === 'SECTION_PRACTICE'
            ? 'bg-primary-500 text-white border-primary-500'
            : 'bg-surface border-border text-text-secondary hover:bg-surface-elevated'
        )}
      >
        <icons.layers className="w-4 h-4" />
        <span>Section Practice</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('FULL_TEST')}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all',
          mode === 'FULL_TEST'
            ? 'bg-primary-500 text-white border-primary-500'
            : 'bg-surface border-border text-text-secondary hover:bg-surface-elevated'
        )}
      >
        <icons.fileText className="w-4 h-4" />
        <span>Full Test</span>
        <span className="text-xs opacity-70">({partCount} {partCount === 1 ? itemLabel : itemLabelPlural})</span>
      </button>
    </div>
  );
}

// ============================================================================
// CONTENT SELECTOR (for Section Practice)
// ============================================================================

interface ContentSelectorProps {
  contentIds: number[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  contentType: ContentType;
}

function ContentSelector({ contentIds, selectedIds, onChange, contentType }: ContentSelectorProps) {
  const itemLabel = contentType === 'LISTENING' ? 'Part' : 'Passage';

  const toggleId = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const selectAll = () => onChange([...contentIds]);
  const selectNone = () => onChange([]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted">Select {contentType === 'LISTENING' ? 'parts' : 'passages'} to include:</span>
        <div className="flex gap-2">
          <button type="button" onClick={selectAll} className="text-xs text-primary-500 hover:underline">
            All
          </button>
          <button type="button" onClick={selectNone} className="text-xs text-text-muted hover:underline">
            None
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {contentIds.map((id, idx) => (
          <button
            key={id}
            type="button"
            onClick={() => toggleId(id)}
            className={cn(
              'px-3 py-1.5 rounded-lg border text-sm font-medium transition-all',
              selectedIds.includes(id)
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-surface border-border text-text-secondary hover:bg-surface-elevated'
            )}
          >
            {itemLabel} {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// CREATE PRACTICE FORM
// ============================================================================

interface CreatePracticeFormProps {
  contentType: ContentType;
  contentIds: number[];
  onCreatePractice: (data: CreatePracticeData) => void;
  isCreating: boolean;
  onCancel: () => void;
}

function CreatePracticeForm({ contentType, contentIds, onCreatePractice, isCreating, onCancel }: CreatePracticeFormProps) {
  const [title, setTitle] = useState('');
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('FULL_TEST');
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [isPremium, setIsPremium] = useState(false);
  const [selectedContentIds, setSelectedContentIds] = useState<number[]>([...contentIds]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (practiceMode === 'SECTION_PRACTICE' && selectedContentIds.length === 0) return;

    onCreatePractice({
      title: title.trim(),
      practiceMode,
      difficulty,
      isPremium,
      selectedContentIds: practiceMode === 'SECTION_PRACTICE' ? selectedContentIds : undefined,
    });
  };

  const isSubmitDisabled = !title.trim() || isCreating ||
    (practiceMode === 'SECTION_PRACTICE' && selectedContentIds.length === 0);

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="w-full space-y-4 overflow-hidden pt-4 border-t border-border"
    >
      {/* Practice Mode */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-primary">Practice Type</label>
        <PracticeModeSelector
          mode={practiceMode}
          onChange={setPracticeMode}
          contentType={contentType}
          partCount={contentIds.length}
        />
        <p className="text-xs text-text-muted">
          {practiceMode === 'SECTION_PRACTICE'
            ? `Create separate practice sessions for individual ${contentType === 'LISTENING' ? 'parts' : 'passages'}`
            : `Create a full ${contentType.toLowerCase()} test with all ${contentType === 'LISTENING' ? 'parts' : 'passages'}`}
        </p>
      </div>

      {/* Content Selection (only for Section Practice) */}
      {practiceMode === 'SECTION_PRACTICE' && (
        <ContentSelector
          contentIds={contentIds}
          selectedIds={selectedContentIds}
          onChange={setSelectedContentIds}
          contentType={contentType}
        />
      )}

      {/* Title & Settings Row */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-48 space-y-1">
          <label className="text-sm font-medium text-text-primary">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`e.g. Cambridge 18 ${contentType} ${practiceMode === 'FULL_TEST' ? 'Test' : ''}`}
            required
          />
        </div>

        {/* Difficulty */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-text-primary">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="h-10 px-3 rounded-lg border border-border bg-surface text-text-primary text-sm"
          >
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>

        {/* Premium Toggle */}
        <label className="flex items-center gap-2 h-10 text-sm text-text-muted cursor-pointer">
          <input
            type="checkbox"
            checked={isPremium}
            onChange={(e) => setIsPremium(e.target.checked)}
            className="w-4 h-4 rounded border-border"
          />
          Premium
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={isSubmitDisabled}>
          {isCreating ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Creating...
            </>
          ) : (
            <>
              <icons.plus className="w-4 h-4 mr-2" />
              Create {practiceMode === 'FULL_TEST' ? 'Full Test' : 'Practice'}
            </>
          )}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        {practiceMode === 'SECTION_PRACTICE' && selectedContentIds.length === 0 && (
          <span className="text-xs text-red-500">Select at least one {contentType === 'LISTENING' ? 'part' : 'passage'}</span>
        )}
      </div>
    </motion.form>
  );
}

// ============================================================================
// MAIN COMPONENT - Minimal Action Bar
// ============================================================================

export function WorkflowActions({
  isValid,
  contentType,
  onSave,
  isSaving,
  saveResponse,
  onCreatePractice,
  isCreatingPractice,
}: WorkflowActionsProps) {
  const [showPracticeForm, setShowPracticeForm] = useState(false);

  const isSaved = !!saveResponse;
  const contentIds = saveResponse?.result.partIds || saveResponse?.result.passageIds || [];

  return (
    <div className="p-4 bg-surface border border-border rounded-lg space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Save Button / Status */}
        {!isSaved ? (
          <Button onClick={onSave} disabled={!isValid || isSaving} className="gap-2">
            {isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <icons.save className="w-4 h-4" />
                Save to Database
              </>
            )}
          </Button>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg">
            <icons.check className="w-4 h-4" />
            <span className="text-sm font-medium">Saved</span>
            <span className="text-xs opacity-70">({saveResponse.result.questionsCreated} questions)</span>
          </div>
        )}

        {/* Create Practice Button */}
        {isSaved && contentType && !showPracticeForm && (
          <Button variant="secondary" onClick={() => setShowPracticeForm(true)} className="gap-2">
            <icons.plus className="w-4 h-4" />
            Create Practice
          </Button>
        )}

        {/* Content IDs (minimal display) */}
        {isSaved && contentIds.length > 0 && (
          <span className="ml-auto text-xs text-text-muted">
            {contentType === 'LISTENING' ? 'Part' : 'Passage'} IDs:{' '}
            <code className="px-1.5 py-0.5 bg-surface-elevated rounded">{contentIds.join(', ')}</code>
          </span>
        )}
      </div>

      {/* Practice Form */}
      <AnimatePresence>
        {showPracticeForm && contentType && (
          <CreatePracticeForm
            contentType={contentType}
            contentIds={contentIds}
            onCreatePractice={onCreatePractice}
            isCreating={isCreatingPractice}
            onCancel={() => setShowPracticeForm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
