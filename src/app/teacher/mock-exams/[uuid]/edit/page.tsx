'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

import { MockExamForm } from '@/domains/contest/components';
import { useContestDetail } from '@/domains/contest/queries/contest.queries';

export default function EditContestPage() {
  const params = useParams();
  const router = useRouter();
  const contestUuid = params.uuid as string;

  const { data: contest, isLoading } = useContestDetail(contestUuid);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Contest not found</h2>
          <Link href="/teacher/mock-exams" className="text-primary-600 hover:underline">
            Back to mock exams
          </Link>
        </div>
      </div>
    );
  }

  if (contest.status !== 'DRAFT') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-orange-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Cannot edit published exam</h2>
          <p className="text-text-secondary mb-4">
            Only draft exams can be edited. This exam is currently {contest.status.toLowerCase()}.
          </p>
          <Link href={`/teacher/mock-exams/${contestUuid}`} className="text-primary-600 hover:underline">
            Back to exam details
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-surface-elevated border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href={`/teacher/mock-exams/${contestUuid}`}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-text-secondary" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Edit Exam</h1>
              <p className="text-text-secondary">{contest.title}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MockExamForm
          mode="edit"
          existingContest={contest}
        />
      </div>
    </div>
  );
}
