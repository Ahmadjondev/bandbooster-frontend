'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useReadingList, useListeningList } from '@/domains/manager';

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
  arrowRight: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  ),
  headphones: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
    </svg>
  ),
  bookOpen: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  fileJson: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1" />
      <path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1" />
    </svg>
  ),
  database: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  ),
};

// ============================================================================
// STAT CARD
// ============================================================================

interface StatCardProps {
  title: string;
  count: number | undefined;
  isLoading: boolean;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  color: string;
  href: string;
}

function StatCard({ title, count, isLoading, icon: Icon, color, href }: StatCardProps) {
  return (
    <Link href={href}>
      <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
          </div>
          <icons.arrowRight className="w-4 h-4 text-text-muted group-hover:text-text-primary transition-colors" />
        </div>
        <div className="text-3xl font-bold text-text-primary mb-1">
          {isLoading ? (
            <div className="h-9 w-16 bg-surface-elevated rounded animate-pulse" />
          ) : (
            count ?? 0
          )}
        </div>
        <div className="text-sm text-text-secondary">{title}</div>
      </Card>
    </Link>
  );
}

// ============================================================================
// WORKFLOW STEPS
// ============================================================================

const workflowSteps = [
  {
    step: 1,
    title: 'Upload JSON',
    description: 'Paste or upload AI-generated IELTS content in JSON format',
    icon: icons.upload,
  },
  {
    step: 2,
    title: 'Preview & Validate',
    description: 'Review extracted content and check for validation errors',
    icon: icons.fileJson,
  },
  {
    step: 3,
    title: 'Save to Database',
    description: 'Save validated content to the IELTS database',
    icon: icons.database,
  },
  {
    step: 4,
    title: 'Manage Content',
    description: 'Edit, delete, or upload audio for saved content',
    icon: icons.bookOpen,
  },
];

// ============================================================================
// PAGE
// ============================================================================

export default function ManagerDashboard() {
  const { data: readingData, isLoading: readingLoading } = useReadingList({ pageSize: 1 });
  const { data: listeningData, isLoading: listeningLoading } = useListeningList({ pageSize: 1 });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-text-primary"
        >
          Content Manager
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-text-secondary mt-2"
        >
          Import and manage AI-generated IELTS content
        </motion.p>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <StatCard
          title="Reading Passages"
          count={readingData?.count}
          isLoading={readingLoading}
          icon={icons.bookOpen}
          color="bg-emerald-500/20 text-emerald-500"
          href="/manager/reading"
        />
        <StatCard
          title="Listening Parts"
          count={listeningData?.count}
          isLoading={listeningLoading}
          icon={icons.headphones}
          color="bg-blue-500/20 text-blue-500"
          href="/manager/listening"
        />
        <Link href="/manager/extract">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer group bg-linear-to-br from-primary-500/10 to-accent-500/10 border-primary-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary-500/20 text-primary-500 flex items-center justify-center">
                <icons.upload className="w-6 h-6" />
              </div>
              <icons.arrowRight className="w-4 h-4 text-text-muted group-hover:text-primary-500 transition-colors" />
            </div>
            <div className="text-lg font-bold text-text-primary mb-1">Extract Content</div>
            <div className="text-sm text-text-secondary">Upload JSON to import new content</div>
          </Card>
        </Link>
      </motion.div>

      {/* Workflow Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-semibold text-text-primary">Workflow</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {workflowSteps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card className="p-6 h-full">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-500 flex items-center justify-center text-sm font-bold">
                    {item.step}
                  </span>
                  <item.icon className="w-5 h-5 text-text-muted" />
                </div>
                <h3 className="font-medium text-text-primary mb-1">{item.title}</h3>
                <p className="text-sm text-text-secondary">{item.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Supported Content Types */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-semibold text-text-primary">Supported Content</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <icons.headphones className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="font-semibold text-text-primary">Listening</h3>
            </div>
            <p className="text-sm text-text-secondary mb-4">
              Import listening tests with parts, question groups, and various question types.
            </p>
            <div className="flex flex-wrap gap-1">
              {['NCQ', 'MCQ', 'MCMA', 'MF', 'FC', 'NC'].map((type) => (
                <span key={type} className="px-2 py-0.5 text-xs bg-blue-500/10 text-blue-500 rounded">
                  {type}
                </span>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <icons.bookOpen className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="font-semibold text-text-primary">Reading</h3>
            </div>
            <p className="text-sm text-text-secondary mb-4">
              Import reading passages with test heads, questions, and various question types.
            </p>
            <div className="flex flex-wrap gap-1">
              {['MI', 'TFNG', 'YNNG', 'SUC', 'MH', 'SA'].map((type) => (
                <span key={type} className="px-2 py-0.5 text-xs bg-green-500/10 text-green-500 rounded">
                  {type}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
