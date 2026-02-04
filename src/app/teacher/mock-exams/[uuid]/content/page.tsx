'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ContentSelector } from '@/domains/contest/components';

export default function ContestContentPage() {
  const params = useParams();
  const contestUuid = params.uuid as string;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-surface-elevated border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link
              href={`/teacher/mock-exams/${contestUuid}`}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-text-secondary" />
            </Link>
            <h1 className="text-xl font-semibold text-text-primary">Add Exam Content</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ContentSelector contestUuid={contestUuid} />
      </div>
    </div>
  );
}
