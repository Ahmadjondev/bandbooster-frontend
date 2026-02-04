'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import {
  JsonInputForm,
  ContentPreview,
  WorkflowActions,
  useExtractFromJson,
  useExtractFromFile,
  useSaveContent,
  useCreatePractice,
  isListeningContent,
  isReadingContent,
  type ExtractResponse,
  type ListeningContent,
  type ReadingContent,
  type ContentType,
  type PracticeMode,
  type SaveResponse,
  type CreatePracticeResponse,
  type CreatePracticeData,
} from '@/domains/manager';

// ============================================================================
// ICONS
// ============================================================================

const icons = {
  arrowLeft: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  ),
  check: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  upload: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  ),
  eye: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  save: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
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
};

// ============================================================================
// STEP INDICATOR
// ============================================================================

type Step = 'input' | 'preview' | 'complete';

const steps = [
  { id: 'input' as const, label: 'Upload', icon: icons.upload },
  { id: 'preview' as const, label: 'Preview & Save', icon: icons.eye },
  { id: 'complete' as const, label: 'Complete', icon: icons.check },
];

interface StepIndicatorProps {
  currentStep: Step;
}

function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = index < currentIndex;

        return (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${isActive
                  ? 'bg-primary-500 text-white'
                  : isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-surface-elevated text-text-muted'
                }`}
            >
              {isCompleted ? (
                <icons.check className="w-4 h-4" />
              ) : (
                <step.icon className="w-4 h-4" />
              )}
              <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 mx-2 ${isCompleted ? 'bg-green-500' : 'bg-border'
                  }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export default function ExtractPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('input');
  const [extractResponse, setExtractResponse] = useState<ExtractResponse | null>(null);
  const [content, setContent] = useState<ListeningContent | ReadingContent | null>(null);
  const [contentType, setContentType] = useState<ContentType | null>(null);
  const [saveResponse, setSaveResponse] = useState<SaveResponse | null>(null);
  const [practiceResponse, setPracticeResponse] = useState<CreatePracticeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Extract mutations
  const extractFromJsonMutation = useExtractFromJson({
    onSuccess: (response) => {
      setExtractResponse(response);
      setContentType(response.contentType);
      if (response.preview) {
        setContent(response.preview);
      }
      setStep('preview');
      setError(null);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const extractFromFileMutation = useExtractFromFile({
    onSuccess: (response) => {
      setExtractResponse(response);
      setContentType(response.contentType);
      if (response.preview) {
        setContent(response.preview);
      }
      setStep('preview');
      setError(null);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  // Save mutation
  const saveContentMutation = useSaveContent({
    onSuccess: (response) => {
      setSaveResponse(response);
      setError(null);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  // Create practice mutation
  const createPracticeMutation = useCreatePractice({
    onSuccess: (response) => {
      setPracticeResponse(response);
      setStep('complete');
      setError(null);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  // Handlers
  const handleExtract = useCallback((data: {
    jsonContent?: Record<string, unknown>;
    file?: File;
    mode: 'paste' | 'upload';
  }) => {
    setError(null);
    if (data.mode === 'paste' && data.jsonContent) {
      extractFromJsonMutation.mutate(data.jsonContent);
    } else if (data.mode === 'upload' && data.file) {
      extractFromFileMutation.mutate(data.file);
    }
  }, [extractFromJsonMutation, extractFromFileMutation]);

  const handleContentChange = useCallback((newContent: ListeningContent | ReadingContent) => {
    setContent(newContent);
  }, []);

  const handleSave = useCallback(() => {
    if (!content || !contentType) return;
    saveContentMutation.mutate({ content, contentType });
  }, [content, contentType, saveContentMutation]);

  const handleCreatePractice = useCallback((data: CreatePracticeData) => {
    if (!contentType || !saveResponse) return;
    const allContentIds = saveResponse.result.partIds || saveResponse.result.passageIds || [];

    // Use selected IDs for SECTION_PRACTICE, all IDs for FULL_TEST
    const contentIds = data.practiceMode === 'SECTION_PRACTICE' && data.selectedContentIds
      ? data.selectedContentIds
      : allContentIds;

    createPracticeMutation.mutate({
      contentType,
      contentIds,
      practiceMode: data.practiceMode,
      title: data.title,
      difficulty: data.difficulty,
      isPremium: data.isPremium,
    });
  }, [contentType, saveResponse, createPracticeMutation]);

  const handleReset = useCallback(() => {
    setStep('input');
    setExtractResponse(null);
    setContent(null);
    setContentType(null);
    setSaveResponse(null);
    setPracticeResponse(null);
    setError(null);
  }, []);

  const isExtracting = extractFromJsonMutation.isPending || extractFromFileMutation.isPending;
  const isSaving = saveContentMutation.isPending;
  const isCreatingPractice = createPracticeMutation.isPending;

  return (
    <div className=" mx-auto">{/* Full width container */}
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {step !== 'input' && (
            <button
              onClick={handleReset}
              className="p-2 rounded-lg hover:bg-surface-elevated transition-colors text-text-secondary hover:text-text-primary"
            >
              <icons.arrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Extract Content</h1>
            <p className="text-text-secondary">
              {step === 'input' && 'Upload or paste your AI-generated IELTS JSON'}
              {step === 'preview' && 'Review and save the extracted content'}
              {step === 'complete' && 'Content has been saved successfully'}
            </p>
          </div>
        </div>
        {step !== 'input' && (
          <Button variant="secondary" onClick={handleReset} className="gap-2">
            <icons.refresh className="w-4 h-4" />
            Start Over
          </Button>
        )}
      </div>

      {/* Step Indicator */}
      <StepIndicator currentStep={step} />

      {/* Error Alert */}
      {error && step !== 'input' && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {step === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <JsonInputForm
              onExtract={handleExtract}
              isLoading={isExtracting}
              error={error}
            />
          </motion.div>
        )}

        {step === 'preview' && extractResponse && content && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Workflow Actions - Sticky Top Bar */}
            <div className="sticky top-4 z-10">
              <WorkflowActions
                isValid={extractResponse.isValid}
                contentType={contentType}
                onSave={handleSave}
                isSaving={isSaving}
                saveResponse={saveResponse}
                onCreatePractice={handleCreatePractice}
                isCreatingPractice={isCreatingPractice}
              />
            </div>

            {/* Content Preview - Full Width */}
            <ContentPreview
              extractResponse={extractResponse}
              content={content}
              onContentChange={handleContentChange}
            />
          </motion.div>
        )}

        {step === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <icons.check className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Content Saved Successfully!
            </h2>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">
              Your IELTS content has been extracted and saved to the database.
              {practiceResponse && ' A practice session has also been created.'}
            </p>

            {/* Summary */}
            {saveResponse && (
              <Card className="p-6 max-w-md mx-auto mb-8 text-left">
                <h3 className="font-semibold text-text-primary mb-4">Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Content Type:</span>
                    <span className="font-medium text-text-primary">{saveResponse.result.contentType}</span>
                  </div>
                  {saveResponse.result.partsCreated !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-text-muted">Parts Created:</span>
                      <span className="font-medium text-text-primary">{saveResponse.result.partsCreated}</span>
                    </div>
                  )}
                  {saveResponse.result.passagesCreated !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-text-muted">Passages Created:</span>
                      <span className="font-medium text-text-primary">{saveResponse.result.passagesCreated}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-text-muted">Questions Created:</span>
                    <span className="font-medium text-text-primary">{saveResponse.result.questionsCreated}</span>
                  </div>
                  {practiceResponse && (
                    <div className="flex justify-between pt-2 border-t border-border mt-2">
                      <span className="text-text-muted">Practice ID:</span>
                      <span className="font-medium text-primary-500">{practiceResponse.practiceId}</span>
                    </div>
                  )}
                </div>
              </Card>
            )}

            <div className="flex gap-4 justify-center">
              <Button variant="secondary" onClick={handleReset}>
                Extract More Content
              </Button>
              <Button onClick={() => router.push('/manager')}>
                Back to Dashboard
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
