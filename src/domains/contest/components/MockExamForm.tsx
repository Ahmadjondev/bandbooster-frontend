'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Clock,
  Sparkles,
  AlertCircle,
  Check,
  X,
  Loader2,
  Calendar,
} from 'lucide-react';

import { useCreateContest, useUpdateContest } from '../queries/contest.queries';
import type { ContestType, ContestDifficulty, ContestDetail, CreateContestRequest } from '../models/domain';

interface MockExamFormProps {
  mode: 'create' | 'edit';
  existingContest?: ContestDetail;
}

const EXAM_TYPE_OPTIONS: Array<{
  value: ContestType;
  label: string;
  icon: string;
  description: string;
}> = [
    { value: 'FULL_TEST', label: 'Full Test', icon: '🎯', description: 'Complete IELTS exam (L+R+W+S)' },
    { value: 'READING', label: 'Reading Only', icon: '📖', description: 'Reading section only' },
    { value: 'LISTENING', label: 'Listening Only', icon: '🎧', description: 'Listening section only' },
    { value: 'WRITING', label: 'Writing Only', icon: '✍️', description: 'Writing section only' },
    { value: 'SPEAKING', label: 'Speaking Only', icon: '🎤', description: 'Speaking section only' },
  ];

const DIFFICULTY_OPTIONS: Array<{
  value: ContestDifficulty;
  label: string;
  color: string;
  band: string;
}> = [
    { value: 'EASY', label: 'Easy', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', band: 'Band 4-5' },
    { value: 'MEDIUM', label: 'Medium', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', band: 'Band 5.5-6.5' },
    { value: 'HARD', label: 'Hard', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', band: 'Band 7-8' },
    { value: 'EXPERT', label: 'Expert', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300', band: 'Band 8.5-9' },
  ];

const DEFAULT_DURATIONS: Record<ContestType, number> = {
  FULL_TEST: 170, // L:40 + R:60 + W:60 + S:10
  LISTENING: 40,
  READING: 60,
  WRITING: 60,
  SPEAKING: 15,
};

export default function MockExamForm({ mode, existingContest }: MockExamFormProps) {
  const router = useRouter();
  const createContestMutation = useCreateContest();
  const updateContestMutation = useUpdateContest();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: existingContest?.title || '',
    description: existingContest?.description || '',
    contestType: existingContest?.contestType || ('FULL_TEST' as ContestType),
    difficulty: existingContest?.difficulty || ('MEDIUM' as ContestDifficulty),
    durationMinutes: existingContest?.durationMinutes || DEFAULT_DURATIONS.FULL_TEST,
    startTime: existingContest?.startTime
      ? formatDateTimeLocal(existingContest.startTime)
      : getDefaultStartTime(),
    endTime: existingContest?.endTime
      ? formatDateTimeLocal(existingContest.endTime)
      : getDefaultEndTime(),
    isPublic: existingContest?.isPublic ?? true,
    accessCode: '',
    autoGradeReading: existingContest?.autoGradeReading ?? true,
    autoGradeListening: existingContest?.autoGradeListening ?? true,
  });

  const isSaving = createContestMutation.isPending || updateContestMutation.isPending;

  function formatDateTimeLocal(date: Date): string {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  }

  function getDefaultStartTime(): string {
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    return formatDateTimeLocal(now);
  }

  function getDefaultEndTime(): string {
    const end = new Date();
    end.setDate(end.getDate() + 7);
    end.setHours(23, 59, 0, 0);
    return formatDateTimeLocal(end);
  }

  function handleExamTypeChange(type: ContestType) {
    setFormData({
      ...formData,
      contestType: type,
      durationMinutes: DEFAULT_DURATIONS[type],
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate
    if (!formData.title.trim()) {
      setError('Please enter an exam title');
      return;
    }

    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      setError('End time must be after start time');
      return;
    }

    try {
      const request: CreateContestRequest = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        contestType: formData.contestType,
        difficulty: formData.difficulty,
        durationMinutes: formData.durationMinutes,
        startTime: new Date(formData.startTime),
        endTime: new Date(formData.endTime),
        isPublic: formData.isPublic,
        accessCode: formData.accessCode || undefined,
        autoGradeReading: formData.autoGradeReading,
        autoGradeListening: formData.autoGradeListening,
      };

      if (mode === 'edit' && existingContest) {
        await updateContestMutation.mutateAsync({
          contestUuid: existingContest.uuid,
          request: {
            title: request.title,
            description: request.description,
            difficulty: request.difficulty,
            durationMinutes: request.durationMinutes,
            startTime: request.startTime,
            endTime: request.endTime,
            isPublic: request.isPublic,
            accessCode: request.accessCode,
            autoGradeReading: request.autoGradeReading,
            autoGradeListening: request.autoGradeListening,
          },
        });
        setSuccess('Mock exam updated successfully!');
        setTimeout(() => router.push(`/teacher/mock-exams/${existingContest.uuid}`), 1500);
      } else {
        const created = await createContestMutation.mutateAsync(request);
        setSuccess('Mock exam created! Now add content to your exam.');
        setTimeout(() => router.push(`/teacher/mock-exams/${created.uuid}/content`), 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save mock exam');
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl mb-4">
          <BookOpen className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          {mode === 'edit' ? 'Edit Mock Exam' : 'Create New Mock Exam'}
        </h1>
        <p className="text-text-secondary">
          {mode === 'edit' ? 'Update your mock exam details' : 'Design a new IELTS mock exam for your students'}
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
          <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
          <p className="text-green-900 dark:text-green-100 font-medium">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
          <X className="h-5 w-5 text-red-600 dark:text-red-400" />
          <p className="text-red-900 dark:text-red-100 font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-surface-elevated rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary">Basic Information</h2>
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-text-secondary mb-2">
                Exam Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., IELTS Academic Full Test - January 2026"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-surface dark:bg-gray-700 text-text-primary transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Provide a brief description of this mock exam..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-surface dark:bg-gray-700 text-text-primary transition-all resize-none"
              />
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-text-secondary mb-2">
                Duration (minutes) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted" />
                <input
                  type="number"
                  id="duration"
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 0 })}
                  required
                  min="1"
                  max="240"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-surface dark:bg-gray-700 text-text-primary transition-all"
                />
              </div>
              <p className="mt-1 text-xs text-text-muted">
                Standard: Listening (40), Reading (60), Writing (60), Speaking (15)
              </p>
            </div>
          </div>
        </div>

        {/* Schedule Card */}
        <div className="bg-surface-elevated rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-accent-100 dark:bg-accent-900/30 rounded-lg">
              <Calendar className="h-5 w-5 text-accent-600 dark:text-accent-400" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary">Schedule</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-text-secondary mb-2">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="startTime"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-surface dark:bg-gray-700 text-text-primary transition-all"
              />
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-text-secondary mb-2">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="endTime"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-surface dark:bg-gray-700 text-text-primary transition-all"
              />
            </div>
          </div>
        </div>

        {/* Exam Type Selection */}
        <div className="bg-surface-elevated rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Exam Type <span className="text-red-500">*</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {EXAM_TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleExamTypeChange(option.value)}
                className={`relative p-4 rounded-xl border-2 text-left transition-all ${formData.contestType === option.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                  }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-text-primary mb-1">{option.label}</div>
                    <div className="text-xs text-text-muted">{option.description}</div>
                  </div>
                  {formData.contestType === option.value && (
                    <Check className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Level */}
        <div className="bg-surface-elevated rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Difficulty Level <span className="text-red-500">*</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {DIFFICULTY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, difficulty: option.value })}
                className={`relative p-4 rounded-xl border-2 text-center transition-all ${formData.difficulty === option.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-sm scale-105'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                  }`}
              >
                <div className="space-y-2">
                  <div className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${option.color}`}>
                    {option.label}
                  </div>
                  <div className="text-xs text-text-muted">{option.band}</div>
                  {formData.difficulty === option.value && (
                    <Check className="h-5 w-5 text-primary-600 dark:text-primary-400 mx-auto" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Settings Card */}
        <div className="bg-surface-elevated rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <AlertCircle className="h-5 w-5 text-text-secondary" />
            </div>
            <h2 className="text-xl font-semibold text-text-primary">Settings</h2>
          </div>

          <div className="space-y-4">
            {/* Public Toggle */}
            <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl cursor-pointer">
              <div>
                <div className="font-medium text-text-primary">Public Exam</div>
                <div className="text-sm text-text-muted">Allow any student to see and join this exam</div>
              </div>
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
            </label>

            {/* Access Code */}
            {!formData.isPublic && (
              <div>
                <label htmlFor="accessCode" className="block text-sm font-medium text-text-secondary mb-2">
                  Access Code (optional)
                </label>
                <input
                  type="text"
                  id="accessCode"
                  value={formData.accessCode}
                  onChange={(e) => setFormData({ ...formData, accessCode: e.target.value })}
                  placeholder="Enter a code students need to join"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-surface dark:bg-gray-700 text-text-primary transition-all"
                />
              </div>
            )}

            {/* Auto-grade toggles */}
            <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl cursor-pointer">
              <div>
                <div className="font-medium text-text-primary">Auto-grade Reading</div>
                <div className="text-sm text-text-muted">Automatically grade reading answers</div>
              </div>
              <input
                type="checkbox"
                checked={formData.autoGradeReading}
                onChange={(e) => setFormData({ ...formData, autoGradeReading: e.target.checked })}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl cursor-pointer">
              <div>
                <div className="font-medium text-text-primary">Auto-grade Listening</div>
                <div className="text-sm text-text-muted">Automatically grade listening answers</div>
              </div>
              <input
                type="checkbox"
                checked={formData.autoGradeListening}
                onChange={(e) => setFormData({ ...formData, autoGradeListening: e.target.checked })}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isSaving}
            className="px-6 py-3 text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl hover:from-primary-700 hover:to-accent-700 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {mode === 'edit' ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Check className="h-5 w-5" />
                {mode === 'edit' ? 'Update Exam' : 'Create & Add Content'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
