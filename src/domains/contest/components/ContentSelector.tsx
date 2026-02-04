'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  Search,
  Check,
  X,
  Loader2,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Save,
} from 'lucide-react';

import {
  useAvailableReadingPassages,
  useAvailableListeningParts,
  useAvailableWritingTasks,
  useAvailableSpeakingTopics,
  useContestDetail,
  useUpdateContestContent,
  usePublishContest,
} from '../queries/contest.queries';
import type {
  ContestDetail,
  ContestType,
  AvailableReadingPassage,
  AvailableListeningPart,
  AvailableWritingTask,
  AvailableSpeakingTopic,
} from '../models/domain';

interface ContentSelectorProps {
  contestUuid: string;
}

type TabType = 'reading' | 'listening' | 'writing' | 'speaking';

const SECTIONS_BY_TYPE: Record<ContestType, TabType[]> = {
  FULL_TEST: ['listening', 'reading', 'writing', 'speaking'],
  LISTENING: ['listening'],
  READING: ['reading'],
  WRITING: ['writing'],
  SPEAKING: ['speaking'],
};

export default function ContentSelector({ contestUuid }: ContentSelectorProps) {
  const router = useRouter();

  const { data: contest, isLoading: loadingContest } = useContestDetail(contestUuid);
  const updateContentMutation = useUpdateContestContent();
  const publishMutation = usePublishContest();

  const [activeTab, setActiveTab] = useState<TabType>('listening');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Selected IDs
  const [selectedReading, setSelectedReading] = useState<number[]>([]);
  const [selectedListening, setSelectedListening] = useState<number[]>([]);
  const [selectedWriting, setSelectedWriting] = useState<number[]>([]);
  const [selectedSpeaking, setSelectedSpeaking] = useState<number[]>([]);

  // Load available content
  const { data: readingPassages = [], isLoading: loadingReading } = useAvailableReadingPassages({ search });
  const { data: listeningParts = [], isLoading: loadingListening } = useAvailableListeningParts({ search });
  const { data: writingTasks = [], isLoading: loadingWriting } = useAvailableWritingTasks({ search });
  const { data: speakingTopics = [], isLoading: loadingSpeaking } = useAvailableSpeakingTopics({ search });

  // Initialize selected items from contest data
  useEffect(() => {
    if (contest) {
      setSelectedReading(contest.readingPassages?.map(p => p.id) || []);
      setSelectedListening(contest.listeningParts?.map(p => p.id) || []);
      setSelectedWriting(contest.writingTasks?.map(t => t.id) || []);
      setSelectedSpeaking(contest.speakingTopics?.map(t => t.id) || []);

      // Set initial tab based on contest type
      const tabs = SECTIONS_BY_TYPE[contest.contestType];
      if (tabs.length > 0) {
        setActiveTab(tabs[0]);
      }
    }
  }, [contest]);

  const availableTabs = useMemo(() => {
    if (!contest) return [];
    return SECTIONS_BY_TYPE[contest.contestType];
  }, [contest]);

  const toggleSelection = (id: number, type: TabType) => {
    switch (type) {
      case 'reading':
        setSelectedReading(prev =>
          prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
        break;
      case 'listening':
        setSelectedListening(prev =>
          prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
        break;
      case 'writing':
        setSelectedWriting(prev =>
          prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
        break;
      case 'speaking':
        setSelectedSpeaking(prev =>
          prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
        break;
    }
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    try {
      await updateContentMutation.mutateAsync({
        contestUuid,
        request: {
          readingPassageIds: selectedReading,
          listeningPartIds: selectedListening,
          writingTaskIds: selectedWriting,
          speakingTopicIds: selectedSpeaking,
          action: 'replace',
        },
      });
      setSuccess('Content saved successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save content');
    }
  };

  const handlePublish = async () => {
    setError(null);
    setSuccess(null);

    // First save content
    try {
      await updateContentMutation.mutateAsync({
        contestUuid,
        request: {
          readingPassageIds: selectedReading,
          listeningPartIds: selectedListening,
          writingTaskIds: selectedWriting,
          speakingTopicIds: selectedSpeaking,
          action: 'replace',
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save content');
      return;
    }

    // Then publish
    try {
      await publishMutation.mutateAsync(contestUuid);
      setSuccess('Exam published successfully!');
      setTimeout(() => router.push(`/teacher/mock-exams/${contestUuid}`), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish exam');
    }
  };

  const getTotalQuestions = () => {
    let total = 0;

    if (availableTabs.includes('reading')) {
      readingPassages
        .filter(p => selectedReading.includes(p.id))
        .forEach(p => total += p.questionCount);
    }
    if (availableTabs.includes('listening')) {
      listeningParts
        .filter(p => selectedListening.includes(p.id))
        .forEach(p => total += p.questionCount);
    }
    if (availableTabs.includes('writing')) {
      total += selectedWriting.length; // Each writing task is 1 question
    }
    if (availableTabs.includes('speaking')) {
      speakingTopics
        .filter(t => selectedSpeaking.includes(t.id))
        .forEach(t => total += 1);
    }

    return total;
  };

  if (loadingContest) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="text-center py-12">
        <p className="text-text-secondary">Contest not found</p>
      </div>
    );
  }

  const isSaving = updateContentMutation.isPending || publishMutation.isPending;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Add Content to: {contest.title}
        </h1>
        <p className="text-text-secondary">
          Select passages, parts, and tasks for your mock exam
        </p>
      </div>

      {/* Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
          <Check className="h-5 w-5 text-green-600" />
          <p className="text-green-800 dark:text-green-200 font-medium">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
          <X className="h-5 w-5 text-red-600" />
          <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
        </div>
      )}

      {/* Summary Card */}
      <div className="bg-surface-elevated rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm text-text-muted">Total Questions</p>
              <p className="text-2xl font-bold text-text-primary">{getTotalQuestions()}</p>
            </div>
            {availableTabs.includes('reading') && (
              <div>
                <p className="text-sm text-text-muted">Reading Passages</p>
                <p className="text-lg font-semibold text-text-primary">{selectedReading.length}</p>
              </div>
            )}
            {availableTabs.includes('listening') && (
              <div>
                <p className="text-sm text-text-muted">Listening Parts</p>
                <p className="text-lg font-semibold text-text-primary">{selectedListening.length}</p>
              </div>
            )}
            {availableTabs.includes('writing') && (
              <div>
                <p className="text-sm text-text-muted">Writing Tasks</p>
                <p className="text-lg font-semibold text-text-primary">{selectedWriting.length}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Draft
            </button>
            <button
              onClick={handlePublish}
              disabled={isSaving || getTotalQuestions() === 0}
              className="px-4 py-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:from-primary-700 hover:to-accent-700 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              Publish Exam
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex gap-4">
          {availableTabs.includes('listening') && (
            <button
              onClick={() => setActiveTab('listening')}
              className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'listening'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
            >
              <Headphones className="h-4 w-4" />
              Listening
              {selectedListening.length > 0 && (
                <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 px-2 py-0.5 rounded-full text-xs">
                  {selectedListening.length}
                </span>
              )}
            </button>
          )}
          {availableTabs.includes('reading') && (
            <button
              onClick={() => setActiveTab('reading')}
              className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'reading'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
            >
              <BookOpen className="h-4 w-4" />
              Reading
              {selectedReading.length > 0 && (
                <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 px-2 py-0.5 rounded-full text-xs">
                  {selectedReading.length}
                </span>
              )}
            </button>
          )}
          {availableTabs.includes('writing') && (
            <button
              onClick={() => setActiveTab('writing')}
              className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'writing'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
            >
              <PenTool className="h-4 w-4" />
              Writing
              {selectedWriting.length > 0 && (
                <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 px-2 py-0.5 rounded-full text-xs">
                  {selectedWriting.length}
                </span>
              )}
            </button>
          )}
          {availableTabs.includes('speaking') && (
            <button
              onClick={() => setActiveTab('speaking')}
              className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'speaking'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
            >
              <Mic className="h-4 w-4" />
              Speaking
              {selectedSpeaking.length > 0 && (
                <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 px-2 py-0.5 rounded-full text-xs">
                  {selectedSpeaking.length}
                </span>
              )}
            </button>
          )}
        </nav>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search content..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-surface dark:bg-gray-800 text-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Content Lists */}
      <div className="space-y-3">
        {activeTab === 'listening' && (
          loadingListening ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
            </div>
          ) : (
            listeningParts.map((part) => (
              <ContentCard
                key={part.id}
                title={`Part ${part.partNumber}: ${part.title}`}
                subtitle={`${Math.floor(part.durationSeconds / 60)} min • ${part.questionCount} questions`}
                selected={selectedListening.includes(part.id)}
                onToggle={() => toggleSelection(part.id, 'listening')}
                icon={<Headphones className="h-5 w-5" />}
              />
            ))
          )
        )}

        {activeTab === 'reading' && (
          loadingReading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
            </div>
          ) : (
            readingPassages.map((passage) => (
              <ContentCard
                key={passage.id}
                title={`Passage ${passage.passageNumber}: ${passage.title}`}
                subtitle={`${passage.wordCount} words • ${passage.questionCount} questions • ${passage.difficulty}`}
                selected={selectedReading.includes(passage.id)}
                onToggle={() => toggleSelection(passage.id, 'reading')}
                icon={<BookOpen className="h-5 w-5" />}
              />
            ))
          )
        )}

        {activeTab === 'writing' && (
          loadingWriting ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
            </div>
          ) : (
            writingTasks.map((task) => (
              <ContentCard
                key={task.id}
                title={task.taskTypeDisplay}
                subtitle={task.promptPreview}
                selected={selectedWriting.includes(task.id)}
                onToggle={() => toggleSelection(task.id, 'writing')}
                icon={<PenTool className="h-5 w-5" />}
              />
            ))
          )
        )}

        {activeTab === 'speaking' && (
          loadingSpeaking ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
            </div>
          ) : (
            speakingTopics.map((topic) => (
              <ContentCard
                key={topic.id}
                title={topic.topicName}
                subtitle={`Part ${topic.partNumber} • ${topic.speakingType}`}
                selected={selectedSpeaking.includes(topic.id)}
                onToggle={() => toggleSelection(topic.id, 'speaking')}
                icon={<Mic className="h-5 w-5" />}
              />
            ))
          )
        )}
      </div>
    </div>
  );
}

interface ContentCardProps {
  title: string;
  subtitle: string;
  selected: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
}

function ContentCard({ title, subtitle, selected, onToggle, icon }: ContentCardProps) {
  return (
    <button
      onClick={onToggle}
      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selected
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg ${selected
            ? 'bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-400'
            : 'bg-gray-100 dark:bg-gray-800 text-text-secondary'
          }`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-text-primary truncate">{title}</h3>
          <p className="text-sm text-text-muted truncate">{subtitle}</p>
        </div>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selected
            ? 'border-primary-500 bg-primary-500'
            : 'border-gray-300 dark:border-gray-600'
          }`}>
          {selected && <Check className="h-4 w-4 text-white" />}
        </div>
      </div>
    </button>
  );
}
