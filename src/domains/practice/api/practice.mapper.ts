/**
 * Mappers to convert DTOs to domain models
 * DTOs are NEVER used outside mappers
 */

import type {
  SectionOverviewDTO,
  PracticeListItemDTO,
  PracticeSectionResponseDTO,
  QuestionDTO,
  PassageDTO,
  ListeningPartDTO,
  WritingTaskDTO,
  SpeakingPartDTO,
  PracticeDetailDTO,
  AttemptListItemDTO,
  AttemptDetailDTO,
  QuestionResultDTO,
  AttemptResultDTO,
  SubmitAnswersResponseDTO,
  SubmitWritingResponseDTO,
  WritingEvaluationDTO,
  CompleteSpeakingResponseDTO,
  SpeakingEvaluationDTO,
  SectionStatsDTO,
  UserStatsDTO,
  SectionAttemptBalanceDTO,
  AttemptBalanceResponseDTO,
  SectionSpecificStatsDTO,
  SubmitAnswersRequestDTO,
} from './practice.contract';

import type {
  SectionOverview,
  PracticeListItem,
  PracticeSectionResponse,
  Question,
  Passage,
  ListeningPart,
  WritingTask,
  SpeakingPart,
  PracticeDetail,
  AttemptListItem,
  AttemptDetail,
  QuestionResult,
  AttemptResult,
  SubmitAnswersResponse,
  SubmitWritingResponse,
  WritingEvaluation,
  CompleteSpeakingResponse,
  SpeakingEvaluation,
  SectionStats,
  SectionStatsBasic,
  UserStats,
  SectionAttemptBalance,
  AttemptBalanceResponse,
  SectionSpecificStats,
  SubmitAnswersRequest,
  DifficultyLevel,
} from '../models/domain';

// ============= Overview Mappers =============

export function mapSectionOverviewDTOToDomain(dto: SectionOverviewDTO): SectionOverview {
  return {
    sectionType: dto.section_type,
    displayName: dto.display_name,
    icon: dto.icon,
    color: dto.color,
    totalPractices: dto.total_practices,
    freePractices: dto.free_practices,
    completedPractices: dto.completed_practices,
    totalAttempts: dto.total_attempts,
    bestScore: dto.best_score,
    progressPercentage: dto.progress_percentage,
  };
}

// ============= Practice List Mappers =============

export function mapPracticeListItemDTOToDomain(dto: PracticeListItemDTO): PracticeListItem {
  return {
    uuid: dto.uuid,
    title: dto.title,
    description: dto.description,
    sectionType: dto.section_type,
    sectionTypeDisplay: dto.section_type_display,
    testType: dto.test_type,
    difficulty: dto.difficulty,
    difficultyDisplay: dto.difficulty_display,
    durationMinutes: dto.duration,
    totalQuestions: dto.total_questions,
    isPremium: dto.is_premium,
    contentCount: dto.content_count,
    attemptsCount: dto.attempts_count,
    bestScore: dto.best_score,
    lastAttemptDate: dto.last_attempt_date ? new Date(dto.last_attempt_date) : null,
    lastAttempt: dto.last_attempt,
    createdAt: new Date(dto.created_at),
    readingPassageNumber: dto.reading_passage_number,
    listeningPartNumber: dto.listening_part_number,
    writingTaskType: dto.writing_task_type,
    writingChartType: dto.writing_chart_type,
    writingPromptPreview: dto.writing_prompt_preview,
    speakingPart: dto.speaking_part,
    speakingTopicName: dto.speaking_topic_name,
    userHasAccess: dto.user_has_access,
    requiresPayment: dto.requires_payment,
  };
}

export function mapPracticeSectionResponseDTOToDomain(dto: PracticeSectionResponseDTO): PracticeSectionResponse {
  return {
    sectionType: dto.section_type,
    practices: dto.practices.map(mapPracticeListItemDTOToDomain),
    pagination: {
      page: dto.pagination.page,
      pageSize: dto.pagination.page_size,
      totalCount: dto.pagination.total_count,
      totalPages: dto.pagination.total_pages,
      hasNext: dto.pagination.has_next,
      hasPrevious: dto.pagination.has_previous,
    },
    stats: {
      totalAttempts: dto.stats.total_attempts,
      averageScore: dto.stats.average_score,
      bestScore: dto.stats.best_score,
      totalTimeMinutes: dto.stats.total_time_minutes,
    },
    availableFilters: {
      difficulties: dto.available_filters.difficulties,
      sortOptions: dto.available_filters.sort_options,
      passageNumbers: dto.available_filters.passage_numbers,
      partNumbers: dto.available_filters.part_numbers,
      chartTypes: dto.available_filters.chart_types,
      taskTypes: dto.available_filters.task_types,
      speakingParts: dto.available_filters.speaking_parts,
    },
  };
}

// ============= Practice Detail Mappers =============

export function mapQuestionDTOToDomain(dto: QuestionDTO): Question {
  return {
    id: dto.id,
    questionKey: dto.question_key,
    questionText: dto.question_text,
    questionType: dto.question_type,
    options: dto.options,
    correctAnswer: dto.correct_answer,
    points: dto.points,
    audioUrl: dto.audio_url,
    imageUrl: dto.image_url,
    orderIndex: dto.order_index,
  };
}

export function mapPassageDTOToDomain(dto: PassageDTO): Passage {
  return {
    id: dto.id,
    title: dto.title,
    content: dto.content,
    passageNumber: dto.passage_number,
    wordCount: dto.word_count,
    questions: dto.questions.map(mapQuestionDTOToDomain),
  };
}

export function mapListeningPartDTOToDomain(dto: ListeningPartDTO): ListeningPart {
  return {
    id: dto.id,
    partNumber: dto.part_number,
    title: dto.title,
    description: dto.description,
    audioUrl: dto.audio_url,
    transcript: dto.transcript,
    questions: dto.questions.map(mapQuestionDTOToDomain),
  };
}

export function mapWritingTaskDTOToDomain(dto: WritingTaskDTO): WritingTask {
  return {
    id: dto.id,
    taskType: dto.task_type,
    prompt: dto.prompt,
    chartImageUrl: dto.chart_image_url,
    chartDescription: dto.chart_description,
    sampleAnswer: dto.sample_answer,
    wordLimit: dto.word_limit,
  };
}

export function mapSpeakingPartDTOToDomain(dto: SpeakingPartDTO): SpeakingPart {
  return {
    id: dto.id,
    partNumber: dto.part_number,
    title: dto.title,
    description: dto.description,
    cueCard: dto.cue_card,
    followUpQuestions: dto.follow_up_questions,
    preparationTimeSeconds: dto.preparation_time_seconds,
    speakingTimeSeconds: dto.speaking_time_seconds,
    questions: dto.questions.map(mapQuestionDTOToDomain),
  };
}

export function mapPracticeDetailDTOToDomain(dto: PracticeDetailDTO): PracticeDetail {
  return {
    uuid: dto.uuid,
    title: dto.title,
    description: dto.description,
    sectionType: dto.section_type,
    testType: dto.test_type,
    difficulty: dto.difficulty,
    durationMinutes: dto.duration_minutes,
    totalQuestions: dto.total_questions,
    isPremium: dto.is_premium,
    isFree: dto.is_free,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
    passages: dto.passages?.map(mapPassageDTOToDomain),
    listeningParts: dto.listening_parts?.map(mapListeningPartDTOToDomain),
    writingTasks: dto.writing_tasks?.map(mapWritingTaskDTOToDomain),
    speakingParts: dto.speaking_parts?.map(mapSpeakingPartDTOToDomain),
    userAttemptsCount: dto.user_attempts_count,
    userBestScore: dto.user_best_score,
    userLastAttemptAt: dto.user_last_attempt_at ? new Date(dto.user_last_attempt_at) : null,
  };
}

// ============= Attempt Mappers =============

export function mapAttemptListItemDTOToDomain(dto: AttemptListItemDTO): AttemptListItem {
  return {
    uuid: dto.uuid,
    practiceUuid: dto.practice_uuid,
    practiceTitle: dto.practice_title,
    sectionType: dto.section_type,
    testType: dto.test_type,
    difficulty: dto.difficulty,
    status: dto.status,
    score: dto.score,
    correctAnswers: dto.correct_answers,
    totalQuestions: dto.total_questions,
    accuracyPercentage: dto.accuracy_percentage,
    timeSpentSeconds: dto.time_spent_seconds,
    startedAt: new Date(dto.started_at),
    completedAt: dto.completed_at ? new Date(dto.completed_at) : null,
  };
}

export function mapAttemptDetailDTOToDomain(dto: AttemptDetailDTO): AttemptDetail {
  return {
    ...mapAttemptListItemDTOToDomain(dto),
    practice: mapPracticeDetailDTOToDomain(dto.practice),
    answers: dto.answers,
  };
}

export function mapQuestionResultDTOToDomain(dto: QuestionResultDTO): QuestionResult {
  return {
    questionId: dto.question_id,
    questionKey: dto.question_key,
    userAnswer: dto.user_answer,
    correctAnswer: dto.correct_answer,
    isCorrect: dto.is_correct,
    pointsEarned: dto.points_earned,
    maxPoints: dto.max_points,
  };
}

export function mapAttemptResultDTOToDomain(dto: AttemptResultDTO): AttemptResult {
  return {
    attemptUuid: dto.attempt_uuid,
    practiceUuid: dto.practice_uuid,
    practiceTitle: dto.practice_title,
    sectionType: dto.section_type,
    testType: dto.test_type,
    score: dto.score,
    bandScore: dto.band_score,
    correctAnswers: dto.correct_answers,
    totalQuestions: dto.total_questions,
    accuracyPercentage: dto.accuracy_percentage,
    timeSpentSeconds: dto.time_spent_seconds,
    startedAt: new Date(dto.started_at),
    completedAt: new Date(dto.completed_at),
    questionResults: dto.question_results.map(mapQuestionResultDTOToDomain),
    sectionScores: dto.section_scores,
  };
}

// ============= Submission Mappers =============

export function mapSubmitAnswersRequestToDTO(request: SubmitAnswersRequest): SubmitAnswersRequestDTO {
  return {
    answers: request.answers,
    started_at: request.startedAt.toISOString(),
    time_spent_seconds: request.timeSpentSeconds,
  };
}

export function mapSubmitAnswersResponseDTOToDomain(dto: SubmitAnswersResponseDTO): SubmitAnswersResponse {
  return {
    success: dto.success,
    attemptUuid: dto.attempt_uuid,
    score: dto.score,
    bandScore: dto.band_score,
    correctAnswers: dto.correct_answers,
    totalQuestions: dto.total_questions,
    accuracyPercentage: dto.accuracy_percentage,
    timeSpentSeconds: dto.time_spent_seconds,
    message: dto.message,
  };
}

// ============= Writing Mappers =============

export function mapWritingEvaluationDTOToDomain(dto: WritingEvaluationDTO): WritingEvaluation {
  return {
    overallBandScore: dto.overall_band_score,
    criteria: {
      taskAchievement: dto.criteria.task_achievement,
      coherenceCohesion: dto.criteria.coherence_cohesion,
      lexicalResource: dto.criteria.lexical_resource,
      grammaticalRange: dto.criteria.grammatical_range,
    },
    feedbackSummary: dto.feedback_summary,
    inlineCorrections: dto.inline_corrections,
    correctedEssay: dto.corrected_essay,
    sentenceFeedback: dto.sentence_feedback.map((sf) => ({
      original: sf.original,
      corrected: sf.corrected,
      feedback: sf.feedback,
    })),
  };
}

export function mapSubmitWritingResponseDTOToDomain(dto: SubmitWritingResponseDTO): SubmitWritingResponse {
  return {
    success: dto.success,
    attemptUuid: dto.attempt_uuid,
    score: dto.score,
    bandScore: dto.band_score,
    evaluation: mapWritingEvaluationDTOToDomain(dto.evaluation),
    message: dto.message,
  };
}

// ============= Speaking Mappers =============

export function mapSpeakingEvaluationDTOToDomain(dto: SpeakingEvaluationDTO): SpeakingEvaluation {
  return {
    overallBandScore: dto.overall_band_score,
    criteria: {
      fluencyCoherence: dto.criteria.fluency_coherence,
      lexicalResource: dto.criteria.lexical_resource,
      grammaticalRange: dto.criteria.grammatical_range,
      pronunciation: dto.criteria.pronunciation,
    },
    overallFeedback: dto.overall_feedback,
    azureScores: {
      pronunciationScore: dto.azure_scores.pronunciation_score,
      fluencyScore: dto.azure_scores.fluency_score,
      accuracyScore: dto.azure_scores.accuracy_score,
    },
    transcripts: dto.transcripts.map((t) => ({
      questionKey: t.question_key,
      transcript: t.transcript,
      feedback: t.feedback,
    })),
  };
}

export function mapCompleteSpeakingResponseDTOToDomain(dto: CompleteSpeakingResponseDTO): CompleteSpeakingResponse {
  return {
    success: dto.success,
    attemptUuid: dto.attempt_uuid,
    score: dto.score,
    bandScore: dto.band_score,
    evaluation: mapSpeakingEvaluationDTOToDomain(dto.evaluation),
    message: dto.message,
  };
}

// ============= Stats Mappers =============

export function mapSectionStatsDTOToDomain(dto: SectionStatsDTO): SectionStatsBasic {
  return {
    sectionType: dto.section_type,
    totalAttempts: dto.total_attempts,
    completedAttempts: dto.completed_attempts,
    averageScore: dto.average_score,
    bestScore: dto.best_score,
    totalTimeSpentSeconds: dto.total_time_spent_seconds,
    accuracyPercentage: dto.accuracy_percentage,
    lastAttemptAt: dto.last_attempt_at ? new Date(dto.last_attempt_at) : null,
  };
}

export function mapUserStatsDTOToDomain(dto: UserStatsDTO): UserStats {
  return {
    totalAttempts: dto.total_attempts,
    totalCompleted: dto.total_completed,
    overallAverageScore: dto.overall_average_score,
    totalTimeSpentSeconds: dto.total_time_spent_seconds,
    sectionStats: dto.section_stats.map(mapSectionStatsDTOToDomain),
    recentActivity: dto.recent_activity.map(mapAttemptListItemDTOToDomain),
  };
}

export function mapSectionAttemptBalanceDTOToDomain(dto: SectionAttemptBalanceDTO): SectionAttemptBalance {
  return {
    sectionType: dto.section_type,
    remainingAttempts: dto.remaining_attempts,
    isUnlimited: dto.is_unlimited,
  };
}

export function mapAttemptBalanceResponseDTOToDomain(dto: AttemptBalanceResponseDTO): AttemptBalanceResponse {
  return {
    isPremium: dto.is_premium,
    balances: dto.balances.map(mapSectionAttemptBalanceDTOToDomain),
  };
}

export function mapSectionSpecificStatsDTOToDomain(dto: SectionSpecificStatsDTO): SectionSpecificStats {
  // Transform difficultyBreakdown from snake_case to camelCase
  const difficultyBreakdown = Object.entries(dto.difficulty_breakdown).reduce((acc, [key, value]) => {
    acc[key as DifficultyLevel] = {
      completed: value.completed,
      total: value.total,
      averageScore: value.average_score,
    };
    return acc;
  }, {} as Record<DifficultyLevel, { completed: number; total: number; averageScore: number | null }>);

  return {
    sectionType: dto.section_type,
    displayName: dto.display_name,
    totalPractices: dto.total_practices,
    completedPractices: dto.completed_practices,
    totalAttempts: dto.total_attempts,
    averageScore: dto.average_score,
    bestScore: dto.best_score,
    totalTimeSpentSeconds: dto.total_time_spent_seconds,
    accuracyPercentage: dto.accuracy_percentage,
    scoreHistory: dto.score_history.map((sh) => ({
      date: new Date(sh.date),
      score: sh.score,
    })),
    difficultyBreakdown,
  };
}
