'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';

// ============================================================================
// ICONS
// ============================================================================

const icons = {
  upload: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  ),
  file: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  code: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  check: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  x: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  ),
  alertTriangle: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  ),
};

// ============================================================================
// TYPES
// ============================================================================

type InputMode = 'paste' | 'upload';

interface JsonInputFormProps {
  onExtract: (data: { jsonContent?: Record<string, unknown>; file?: File; mode: InputMode }) => void;
  isLoading?: boolean;
  error?: string | null;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function JsonInputForm({
  onExtract,
  isLoading = false,
  error,
}: JsonInputFormProps) {
  const [mode, setMode] = useState<InputMode>('paste');
  const [jsonText, setJsonText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateJson = useCallback((text: string): Record<string, unknown> | null => {
    if (!text.trim()) {
      setParseError(null);
      return null;
    }
    try {
      const parsed = JSON.parse(text);
      setParseError(null);
      return parsed;
    } catch (e) {
      setParseError(e instanceof Error ? e.message : 'Invalid JSON format');
      return null;
    }
  }, []);

  const handleJsonChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setJsonText(text);
    if (text.trim()) {
      validateJson(text);
    } else {
      setParseError(null);
    }
  }, [validateJson]);

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (selectedFile.type !== 'application/json' && !selectedFile.name.endsWith('.json')) {
      setParseError('Please select a JSON file');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setParseError('File size must be less than 10MB');
      return;
    }
    setFile(selectedFile);
    setParseError(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  }, [handleFileSelect]);

  const handleExtract = useCallback(() => {
    if (mode === 'paste') {
      const parsed = validateJson(jsonText);
      if (!parsed) {
        setParseError('Please enter valid JSON');
        return;
      }
      onExtract({ jsonContent: parsed, mode: 'paste' });
    } else if (file) {
      onExtract({ file, mode: 'upload' });
    }
  }, [mode, jsonText, file, validateJson, onExtract]);

  const isValid = mode === 'paste'
    ? jsonText.trim() !== '' && !parseError
    : file !== null;

  return (
    <Card className="p-6">
      {/* Mode Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setMode('paste')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
            mode === 'paste'
              ? 'bg-primary-500 text-white'
              : 'bg-surface-elevated text-text-secondary hover:text-text-primary'
          )}
        >
          <icons.code className="w-4 h-4" />
          Paste JSON
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
            mode === 'upload'
              ? 'bg-primary-500 text-white'
              : 'bg-surface-elevated text-text-secondary hover:text-text-primary'
          )}
        >
          <icons.upload className="w-4 h-4" />
          Upload File
        </button>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'paste' ? (
          <motion.div
            key="paste"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                JSON Content
              </label>
              <textarea
                value={jsonText}
                onChange={handleJsonChange}
                placeholder='Paste your IELTS JSON content here...

Example format:
{
  "parts": [
    {
      "part_number": 1,
      "title": "Hotel Booking",
      "question_groups": [...]
    }
  ]
}'
                className={cn(
                  'w-full h-96 p-4 rounded-lg border bg-surface font-mono text-sm resize-none',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500',
                  parseError ? 'border-red-500' : 'border-border'
                )}
              />
              {parseError && (
                <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  <icons.x className="w-4 h-4" />
                  {parseError}
                </p>
              )}
              {jsonText && !parseError && (
                <p className="mt-2 text-sm text-green-500 flex items-center gap-1">
                  <icons.check className="w-4 h-4" />
                  Valid JSON format
                </p>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all',
                isDragging
                  ? 'border-primary-500 bg-primary-500/10'
                  : file
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-border hover:border-primary-500/50'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
              {file ? (
                <>
                  <icons.file className="w-12 h-12 text-green-500 mb-3" />
                  <p className="text-lg font-medium text-text-primary">{file.name}</p>
                  <p className="text-sm text-text-secondary mt-1">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="mt-3 text-sm text-red-500 hover:underline"
                  >
                    Remove file
                  </button>
                </>
              ) : (
                <>
                  <icons.upload className="w-12 h-12 text-text-muted mb-3" />
                  <p className="text-lg font-medium text-text-primary">
                    Drop your JSON file here
                  </p>
                  <p className="text-sm text-text-secondary mt-1">
                    or click to browse (max 10MB)
                  </p>
                </>
              )}
            </div>
            {parseError && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <icons.x className="w-4 h-4" />
                {parseError}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Alert */}
      {error && (
        <Alert variant="error" className="mt-4">
          <div className="flex items-start gap-2">
            <icons.alertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Extraction Failed</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </Alert>
      )}

      {/* Extract Button */}
      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleExtract}
          disabled={!isValid || isLoading}
          className="min-w-[140px]"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Extracting...
            </span>
          ) : (
            'Extract & Preview'
          )}
        </Button>
      </div>
    </Card>
  );
}
