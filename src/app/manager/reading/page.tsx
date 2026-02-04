'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import {
    useReadingList,
    useReadingDetail,
    useDeleteReading,
    usePatchReading,
    DIFFICULTY_LEVEL_LABELS,
    DIFFICULTY_LEVEL_COLORS,
    type ReadingItem,
    type ReadingDetail,
    type ContentFilterParams,
    type DifficultyLevel,
    type UpdateReadingInput,
} from '@/domains/manager';

// ============================================================================
// ICONS
// ============================================================================

const icons = {
    search: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    ),
    plus: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
        </svg>
    ),
    edit: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
    ),
    trash: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
    ),
    eye: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ),
    filter: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
    ),
    chevronLeft: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
        </svg>
    ),
    chevronRight: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
        </svg>
    ),
    x: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    ),
    save: (props: React.SVGProps<SVGSVGElement>) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
        </svg>
    ),
};

// ============================================================================
// VIEW MODAL
// ============================================================================

interface ViewModalProps {
    isOpen: boolean;
    itemId: number | null;
    onClose: () => void;
    onEdit: (item: ReadingDetail) => void;
}

function ViewModal({ isOpen, itemId, onClose, onEdit }: ViewModalProps) {
    const { data: item, isLoading } = useReadingDetail(itemId || 0, {
        enabled: isOpen && !!itemId,
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative z-50 bg-surface rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 className="text-lg font-semibold text-text-primary">
                        {isLoading ? 'Loading...' : item?.title || 'Reading Passage'}
                    </h3>
                    <div className="flex items-center gap-2">
                        {item && (
                            <Button variant="secondary" onClick={() => onEdit(item)} className="flex items-center gap-2">
                                <icons.edit className="w-4 h-4" />
                                Edit
                            </Button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
                        >
                            <icons.x className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            <div className="h-6 w-48 bg-surface-elevated rounded animate-pulse" />
                            <div className="h-4 w-full bg-surface-elevated rounded animate-pulse" />
                            <div className="h-4 w-full bg-surface-elevated rounded animate-pulse" />
                            <div className="h-4 w-3/4 bg-surface-elevated rounded animate-pulse" />
                        </div>
                    ) : item ? (
                        <div className="space-y-6">
                            {/* Meta Info */}
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-text-muted text-sm">Passage #</span>
                                    <span className="font-medium text-text-primary">{item.passageNumber}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-text-muted text-sm">Difficulty</span>
                                    <span className={cn('px-2 py-0.5 text-xs font-medium rounded', DIFFICULTY_LEVEL_COLORS[item.difficulty])}>
                                        {DIFFICULTY_LEVEL_LABELS[item.difficulty]}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-text-muted text-sm">Words</span>
                                    <span className="font-medium text-text-primary">{item.wordCount}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-text-muted text-sm">Questions</span>
                                    <span className="font-medium text-text-primary">{item.questionCount}</span>
                                </div>
                                {item.isAuthentic && (
                                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-500 rounded">Authentic</span>
                                )}
                                {item.isPractice && (
                                    <span className="px-2 py-0.5 text-xs font-medium bg-green-500/10 text-green-500 rounded">Practice</span>
                                )}
                            </div>

                            {/* Summary */}
                            {item.summary && (
                                <div>
                                    <h4 className="text-sm font-medium text-text-secondary mb-2">Summary</h4>
                                    <p className="text-text-primary">{item.summary}</p>
                                </div>
                            )}

                            {/* Content */}
                            <div>
                                <h4 className="text-sm font-medium text-text-secondary mb-2">Content</h4>
                                <div className="bg-surface-elevated p-4 rounded-lg whitespace-pre-wrap text-text-primary text-sm leading-relaxed max-h-96 overflow-y-auto">
                                    {item.content}
                                </div>
                            </div>

                            {/* Timestamps */}
                            <div className="flex gap-4 text-xs text-text-muted">
                                <span>Created: {item.createdAt.toLocaleString()}</span>
                                <span>Updated: {item.updatedAt.toLocaleString()}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-text-muted py-8">Failed to load reading passage.</div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

// ============================================================================
// EDIT MODAL
// ============================================================================

interface EditModalProps {
    isOpen: boolean;
    itemId: number | null;
    onClose: () => void;
    onSuccess: () => void;
}

function EditModal({ isOpen, itemId, onClose, onSuccess }: EditModalProps) {
    const { data: item, isLoading } = useReadingDetail(itemId || 0, {
        enabled: isOpen && !!itemId,
    });
    const patchMutation = usePatchReading();

    const [formData, setFormData] = useState<UpdateReadingInput>({});

    // Initialize form when item loads
    useEffect(() => {
        if (item) {
            setFormData({
                title: item.title,
                passageNumber: item.passageNumber,
                summary: item.summary,
                content: item.content,
                difficulty: item.difficulty,
                isAuthentic: item.isAuthentic,
                isPractice: item.isPractice,
            });
        }
    }, [item]);

    const handleSubmit = async () => {
        if (!itemId) return;
        try {
            await patchMutation.mutateAsync({ id: itemId, input: formData });
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to update:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative z-50 bg-surface rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 className="text-lg font-semibold text-text-primary">Edit Reading Passage</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
                    >
                        <icons.x className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            <div className="h-10 w-full bg-surface-elevated rounded animate-pulse" />
                            <div className="h-10 w-full bg-surface-elevated rounded animate-pulse" />
                            <div className="h-32 w-full bg-surface-elevated rounded animate-pulse" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Title</label>
                                <Input
                                    type="text"
                                    value={formData.title || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Passage title"
                                />
                            </div>

                            {/* Row: Passage Number, Difficulty */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Passage Number</label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="3"
                                        value={formData.passageNumber || 1}
                                        onChange={(e) => setFormData(prev => ({ ...prev, passageNumber: parseInt(e.target.value) || 1 }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Difficulty</label>
                                    <select
                                        value={formData.difficulty || 'INTERMEDIATE'}
                                        onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as DifficultyLevel }))}
                                        className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="EASY">Easy</option>
                                        <option value="INTERMEDIATE">Intermediate</option>
                                        <option value="HARD">Hard</option>
                                    </select>
                                </div>
                            </div>

                            {/* Flags */}
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isAuthentic || false}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isAuthentic: e.target.checked }))}
                                        className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                                    />
                                    <span className="text-sm text-text-primary">Authentic</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isPractice || false}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isPractice: e.target.checked }))}
                                        className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500"
                                    />
                                    <span className="text-sm text-text-primary">Practice</span>
                                </label>
                            </div>

                            {/* Summary */}
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Summary</label>
                                <textarea
                                    value={formData.summary || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                                    placeholder="Brief summary of the passage"
                                    rows={3}
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                />
                            </div>

                            {/* Content */}
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Content</label>
                                <textarea
                                    value={formData.content || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                    placeholder="Full passage content"
                                    rows={10}
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
                    <Button variant="secondary" onClick={onClose} disabled={patchMutation.isPending}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={patchMutation.isPending || isLoading} className="flex items-center gap-2">
                        <icons.save className="w-4 h-4" />
                        {patchMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}

// ============================================================================
// DELETE CONFIRMATION MODAL
// ============================================================================

interface DeleteModalProps {
    isOpen: boolean;
    item: ReadingItem | null;
    onClose: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
}

function DeleteModal({ isOpen, item, onClose, onConfirm, isDeleting }: DeleteModalProps) {
    if (!isOpen || !item) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative z-50 bg-surface rounded-xl shadow-xl p-6 max-w-md w-full mx-4"
            >
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                    Delete Reading Passage
                </h3>
                <p className="text-text-secondary mb-4">
                    Are you sure you want to delete &quot;{item.title}&quot;? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                    <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="bg-red-500 hover:bg-red-600"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}

// ============================================================================
// READING ITEM ROW
// ============================================================================

interface ReadingItemRowProps {
    item: ReadingItem;
    onView: (item: ReadingItem) => void;
    onEdit: (item: ReadingItem) => void;
    onDelete: (item: ReadingItem) => void;
}

function ReadingItemRow({ item, onView, onEdit, onDelete }: ReadingItemRowProps) {
    return (
        <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border-b border-border hover:bg-surface-elevated/50 transition-colors"
        >
            <td className="px-4 py-3">
                <div className="font-medium text-text-primary line-clamp-1">{item.title}</div>
                <div className="text-sm text-text-muted">
                    Passage {item.passageNumber} · {item.wordCount} words
                </div>
            </td>
            <td className="px-4 py-3">
                <span
                    className={cn(
                        'px-2 py-1 text-xs font-medium rounded',
                        DIFFICULTY_LEVEL_COLORS[item.difficulty]
                    )}
                >
                    {DIFFICULTY_LEVEL_LABELS[item.difficulty]}
                </span>
            </td>
            <td className="px-4 py-3 text-text-secondary">
                {item.questionCount}
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                    {item.isAuthentic && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-500 rounded">
                            Authentic
                        </span>
                    )}
                    {item.isPractice && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-500/10 text-green-500 rounded">
                            Practice
                        </span>
                    )}
                </div>
            </td>
            <td className="px-4 py-3 text-text-muted text-sm">
                {item.createdAt.toLocaleDateString()}
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onView(item)}
                        className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
                        title="View"
                    >
                        <icons.eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onEdit(item)}
                        className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
                        title="Edit"
                    >
                        <icons.edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(item)}
                        className="p-2 rounded-lg text-text-secondary hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Delete"
                    >
                        <icons.trash className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </motion.tr>
    );
}

// ============================================================================
// SKELETON ROW
// ============================================================================

function SkeletonRow() {
    return (
        <tr className="border-b border-border">
            <td className="px-4 py-3">
                <div className="h-5 w-48 bg-surface-elevated rounded animate-pulse" />
                <div className="h-4 w-32 bg-surface-elevated rounded animate-pulse mt-1" />
            </td>
            <td className="px-4 py-3">
                <div className="h-6 w-20 bg-surface-elevated rounded animate-pulse" />
            </td>
            <td className="px-4 py-3">
                <div className="h-5 w-8 bg-surface-elevated rounded animate-pulse" />
            </td>
            <td className="px-4 py-3">
                <div className="h-5 w-16 bg-surface-elevated rounded animate-pulse" />
            </td>
            <td className="px-4 py-3">
                <div className="h-5 w-24 bg-surface-elevated rounded animate-pulse" />
            </td>
            <td className="px-4 py-3">
                <div className="h-8 w-24 bg-surface-elevated rounded animate-pulse" />
            </td>
        </tr>
    );
}

// ============================================================================
// PAGE
// ============================================================================

export default function ReadingManagementPage() {
    const [search, setSearch] = useState('');
    const [difficulty, setDifficulty] = useState<DifficultyLevel | ''>('');
    const [page, setPage] = useState(1);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; item: ReadingItem | null }>({
        isOpen: false,
        item: null,
    });
    const [viewModal, setViewModal] = useState<{ isOpen: boolean; itemId: number | null }>({
        isOpen: false,
        itemId: null,
    });
    const [editModal, setEditModal] = useState<{ isOpen: boolean; itemId: number | null }>({
        isOpen: false,
        itemId: null,
    });

    const pageSize = 20;

    const filters = useMemo<ContentFilterParams>(() => ({
        search: search || undefined,
        difficulty: difficulty || undefined,
        page,
        pageSize,
    }), [search, difficulty, page]);

    const { data, isLoading, error, refetch } = useReadingList(filters);
    const deleteMutation = useDeleteReading();

    const totalPages = data ? Math.ceil(data.count / pageSize) : 0;

    const handleView = (item: ReadingItem) => {
        setViewModal({ isOpen: true, itemId: item.id });
    };

    const handleEdit = (item: ReadingItem) => {
        setEditModal({ isOpen: true, itemId: item.id });
    };

    const handleEditFromView = (item: ReadingDetail) => {
        setViewModal({ isOpen: false, itemId: null });
        setEditModal({ isOpen: true, itemId: item.id });
    };

    const handleDelete = (item: ReadingItem) => {
        setDeleteModal({ isOpen: true, item });
    };

    const confirmDelete = async () => {
        if (!deleteModal.item) return;

        try {
            await deleteMutation.mutateAsync(deleteModal.item.id);
            setDeleteModal({ isOpen: false, item: null });
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    const handleCreate = () => {
        // TODO: Navigate to create page or open create modal
        console.log('Create new reading passage');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Reading Passages</h1>
                    <p className="text-text-secondary mt-1">
                        Manage IELTS reading passages and their questions
                    </p>
                </div>
                <Button onClick={handleCreate} className="flex items-center gap-2">
                    <icons.plus className="w-4 h-4" />
                    Add Passage
                </Button>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <Input
                            type="text"
                            placeholder="Search passages..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={difficulty}
                            onChange={(e) => {
                                setDifficulty(e.target.value as DifficultyLevel | '');
                                setPage(1);
                            }}
                            className="px-3 py-2 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">All Difficulties</option>
                            <option value="EASY">Easy</option>
                            <option value="INTERMEDIATE">Intermediate</option>
                            <option value="HARD">Hard</option>
                        </select>
                        {(search || difficulty) && (
                            <button
                                onClick={() => {
                                    setSearch('');
                                    setDifficulty('');
                                    setPage(1);
                                }}
                                className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors"
                                title="Clear filters"
                            >
                                <icons.x className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </Card>

            {/* Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-surface-elevated/50">
                                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Title</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Difficulty</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Questions</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Tags</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Created</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-text-secondary">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                            ) : error ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-red-500">
                                        Failed to load reading passages. Please try again.
                                    </td>
                                </tr>
                            ) : data?.results.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-text-muted">
                                        No reading passages found.
                                    </td>
                                </tr>
                            ) : (
                                <AnimatePresence>
                                    {data?.results.map((item) => (
                                        <ReadingItemRow
                                            key={item.id}
                                            item={item}
                                            onView={handleView}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </AnimatePresence>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {data && totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                        <div className="text-sm text-text-muted">
                            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, data.count)} of {data.count} passages
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                                className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <icons.chevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm text-text-secondary">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page === totalPages}
                                className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <icons.chevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Delete Modal */}
            <AnimatePresence>
                <DeleteModal
                    isOpen={deleteModal.isOpen}
                    item={deleteModal.item}
                    onClose={() => setDeleteModal({ isOpen: false, item: null })}
                    onConfirm={confirmDelete}
                    isDeleting={deleteMutation.isPending}
                />
            </AnimatePresence>

            {/* View Modal */}
            <AnimatePresence>
                <ViewModal
                    isOpen={viewModal.isOpen}
                    itemId={viewModal.itemId}
                    onClose={() => setViewModal({ isOpen: false, itemId: null })}
                    onEdit={handleEditFromView}
                />
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
                <EditModal
                    isOpen={editModal.isOpen}
                    itemId={editModal.itemId}
                    onClose={() => setEditModal({ isOpen: false, itemId: null })}
                    onSuccess={() => refetch()}
                />
            </AnimatePresence>
        </div>
    );
}
