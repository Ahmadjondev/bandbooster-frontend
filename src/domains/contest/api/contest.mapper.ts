/**
 * Contest Mappers
 * Transform DTOs (snake_case) to Domain Models (camelCase)
 */

import type {
  StudentDTO,
  ContestListItemDTO,
  ContestDetailDTO,
  ReadingPassageContentDTO,
  ListeningPartContentDTO,
  WritingTaskContentDTO,
  SpeakingTopicContentDTO,
  ContestStatisticsDTO,
  LeaderboardEntryDTO,
  LeaderboardResponseDTO,
  ContestAttemptListItemDTO,
  ContestAttemptDetailDTO,
  ContestQuestionDTO,
  SectionDataDTO,
  ListeningPartDataDTO,
  ReadingPassageDataDTO,
  WritingTaskDataDTO,
  TestHeadDTO,
  SectionQuestionDTO,
  SubmitContestResponseDTO,
  ContestResultDTO,
  ListeningResultDTO,
  ReadingResultDTO,
  QuestionResultDTO,
  WritingResultDTO,
  WritingFeedbackDTO,
  AvailableReadingPassageDTO,
  AvailableListeningPartDTO,
  AvailableWritingTaskDTO,
  AvailableSpeakingTopicDTO,
  NextSectionResponseDTO,
} from './contest.contract';

import type {
  Student,
  ContestListItem,
  ContestDetail,
  ReadingPassageContent,
  ListeningPartContent,
  WritingTaskContent,
  SpeakingTopicContent,
  ContestStatistics,
  LeaderboardEntry,
  Leaderboard,
  ContestAttemptListItem,
  ContestAttemptDetail,
  ContestQuestion,
  SectionData,
  ListeningPartData,
  ReadingPassageData,
  WritingTaskData,
  TestHead,
  SectionQuestion,
  SubmitContestResponse,
  ContestResult,
  ListeningResult,
  ReadingResult,
  QuestionResult,
  WritingResult,
  WritingFeedback,
  AvailableReadingPassage,
  AvailableListeningPart,
  AvailableWritingTask,
  AvailableSpeakingTopic,
  NextSectionResponse,
} from '../models/domain';

// ============= Helper Functions =============

function parseDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  return new Date(dateString);
}

function parseDateRequired(dateString: string): Date {
  return new Date(dateString);
}

// ============= Student Mapper =============

export function mapStudentDTOToDomain(dto: StudentDTO): Student {
  return {
    id: dto.id,
    username: dto.username,
    firstName: dto.first_name,
    lastName: dto.last_name,
    email: dto.email,
    fullName: dto.full_name || `${dto.first_name} ${dto.last_name}`.trim(),
  };
}

// ============= Contest Mappers =============

export function mapContestListItemDTOToDomain(dto: ContestListItemDTO): ContestListItem {
  return {
    uuid: dto.uuid,
    title: dto.title,
    description: dto.description || '',
    contestType: dto.contest_type,
    difficulty: dto.difficulty,
    status: dto.status,
    startTime: parseDateRequired(dto.start_time),
    endTime: parseDateRequired(dto.end_time),
    durationMinutes: dto.duration_minutes,
    isPublic: dto.is_public,
    hasAccessCode: dto.has_access_code,
    totalQuestions: dto.total_questions,
    participantCount: dto.participant_count,
    createdAt: parseDateRequired(dto.created_at),
    updatedAt: parseDateRequired(dto.updated_at),
    createdBy: dto.created_by ? {
      id: dto.created_by.id,
      username: dto.created_by.username,
      firstName: dto.created_by.first_name,
      lastName: dto.created_by.last_name,
    } : undefined,
    resultsVisible: dto.results_visible,
    autoGradeReading: dto.auto_grade_reading,
    autoGradeListening: dto.auto_grade_listening,
  };
}

export function mapReadingPassageContentDTOToDomain(dto: ReadingPassageContentDTO): ReadingPassageContent {
  return {
    id: dto.id,
    title: dto.title,
    passageNumber: dto.passage_number,
    wordCount: dto.word_count,
    questionCount: dto.question_count,
    difficulty: dto.difficulty,
  };
}

export function mapListeningPartContentDTOToDomain(dto: ListeningPartContentDTO): ListeningPartContent {
  return {
    id: dto.id,
    title: dto.title,
    partNumber: dto.part_number,
    durationSeconds: dto.duration_seconds,
    questionCount: dto.question_count,
  };
}

export function mapWritingTaskContentDTOToDomain(dto: WritingTaskContentDTO): WritingTaskContent {
  return {
    id: dto.id,
    taskType: dto.task_type,
    taskTypeDisplay: dto.task_type_display,
    promptPreview: dto.prompt_preview,
    chartType: dto.chart_type,
    minWords: dto.min_words,
  };
}

export function mapSpeakingTopicContentDTOToDomain(dto: SpeakingTopicContentDTO): SpeakingTopicContent {
  return {
    id: dto.id,
    speakingType: dto.speaking_type,
    topicName: dto.topic_name,
    partNumber: dto.part_number,
    questionCount: dto.question_count,
  };
}

export function mapContestDetailDTOToDomain(dto: ContestDetailDTO): ContestDetail {
  const baseItem = mapContestListItemDTOToDomain(dto);
  
  return {
    ...baseItem,
    readingPassages: dto.reading_passages?.map(mapReadingPassageContentDTOToDomain),
    listeningParts: dto.listening_parts?.map(mapListeningPartContentDTOToDomain),
    writingTasks: dto.writing_tasks?.map(mapWritingTaskContentDTOToDomain),
    speakingTopics: dto.speaking_topics?.map(mapSpeakingTopicContentDTOToDomain),
    assignedStudents: dto.assigned_students?.map(mapStudentDTOToDomain),
  };
}

// ============= Statistics Mapper =============

export function mapContestStatisticsDTOToDomain(dto: ContestStatisticsDTO): ContestStatistics {
  return {
    totalContests: dto.total_contests,
    activeContests: dto.active_contests,
    scheduledContests: dto.scheduled_contests,
    completedContests: dto.completed_contests,
    draftContests: dto.draft_contests,
    totalAttempts: dto.total_attempts,
    submittedAttempts: dto.submitted_attempts,
  };
}

// ============= Leaderboard Mappers =============

export function mapLeaderboardEntryDTOToDomain(dto: LeaderboardEntryDTO): LeaderboardEntry {
  return {
    rank: dto.rank,
    student: mapStudentDTOToDomain(dto.student),
    overallScore: dto.overall_score,
    listeningScore: dto.listening_score,
    readingScore: dto.reading_score,
    writingScore: dto.writing_score,
    speakingScore: dto.speaking_score,
    correctAnswers: dto.correct_answers,
    totalQuestions: dto.total_questions,
    timeSpentSeconds: dto.time_spent_seconds,
    submittedAt: parseDate(dto.submitted_at),
  };
}

export function mapLeaderboardResponseDTOToDomain(dto: LeaderboardResponseDTO): Leaderboard {
  return {
    contestUuid: dto.contest_uuid,
    contestTitle: dto.contest_title,
    totalParticipants: dto.total_participants,
    entries: dto.leaderboard.map(mapLeaderboardEntryDTOToDomain),
  };
}

// ============= Attempt Mappers =============

export function mapContestAttemptListItemDTOToDomain(dto: ContestAttemptListItemDTO): ContestAttemptListItem {
  return {
    uuid: dto.uuid,
    contest: {
      uuid: dto.contest.uuid,
      title: dto.contest.title,
      contestType: dto.contest.contest_type,
      difficulty: dto.contest.difficulty,
    },
    status: dto.status,
    currentSection: dto.current_section,
    startedAt: parseDate(dto.started_at),
    submittedAt: parseDate(dto.submitted_at),
    timeSpentSeconds: dto.time_spent_seconds,
    overallScore: dto.overall_score,
  };
}

export function mapContestQuestionDTOToDomain(dto: ContestQuestionDTO): ContestQuestion {
  return {
    id: dto.id,
    questionKey: dto.question_key,
    questionText: dto.question_text,
    questionType: dto.question_type,
    options: dto.options,
    points: dto.points,
    section: dto.section,
    orderIndex: dto.order_index,
    userAnswer: dto.user_answer,
    isCorrect: dto.is_correct,
    correctAnswer: dto.correct_answer,
  };
}

export function mapContestAttemptDetailDTOToDomain(dto: ContestAttemptDetailDTO): ContestAttemptDetail {
  const baseItem = mapContestAttemptListItemDTOToDomain(dto);
  
  return {
    ...baseItem,
    contest: mapContestDetailDTOToDomain(dto.contest),
    questions: dto.questions?.map(mapContestQuestionDTOToDomain),
    timeRemainingSeconds: dto.time_remaining_seconds,
    sectionsCompleted: dto.sections_completed,
  };
}

// ============= Section Data Mappers =============

export function mapSectionQuestionDTOToDomain(dto: SectionQuestionDTO): SectionQuestion {
  return {
    id: dto.id,
    questionKey: dto.question_key,
    questionText: dto.question_text,
    questionType: dto.question_type,
    options: dto.options,
    points: dto.points,
    orderIndex: dto.order_index,
    userAnswer: dto.user_answer,
  };
}

export function mapTestHeadDTOToDomain(dto: TestHeadDTO): TestHead {
  return {
    id: dto.id,
    title: dto.title,
    instructions: dto.instructions,
    questionType: dto.question_type,
    options: dto.options,
    questions: dto.questions?.map(mapSectionQuestionDTOToDomain),
  };
}

export function mapListeningPartDataDTOToDomain(dto: ListeningPartDataDTO): ListeningPartData {
  return {
    id: dto.id,
    partNumber: dto.part_number,
    title: dto.title,
    description: dto.description,
    audioUrl: dto.audio_url,
    testHeads: dto.test_heads?.map(mapTestHeadDTOToDomain),
  };
}

export function mapReadingPassageDataDTOToDomain(dto: ReadingPassageDataDTO): ReadingPassageData {
  return {
    id: dto.id,
    passageNumber: dto.passage_number,
    title: dto.title,
    content: dto.content,
    wordCount: dto.word_count,
    testHeads: dto.test_heads?.map(mapTestHeadDTOToDomain),
  };
}

export function mapWritingTaskDataDTOToDomain(dto: WritingTaskDataDTO): WritingTaskData {
  return {
    id: dto.id,
    taskType: dto.task_type,
    taskTypeDisplay: dto.task_type_display,
    prompt: dto.prompt,
    picture: dto.picture,
    data: dto.data,
    minWords: dto.min_words,
    userAnswer: dto.user_answer,
    wordCount: dto.word_count,
  };
}

export function mapSectionDataDTOToDomain(dto: SectionDataDTO): SectionData {
  return {
    sectionName: dto.section_name,
    timeRemaining: dto.time_remaining,
    nextSectionName: dto.next_section_name,
    isLastSection: dto.is_last_section,
    parts: dto.parts?.map(mapListeningPartDataDTOToDomain),
    passages: dto.passages?.map(mapReadingPassageDataDTOToDomain),
    tasks: dto.tasks?.map(mapWritingTaskDataDTOToDomain),
  };
}

// ============= Submit Response Mapper =============

export function mapSubmitContestResponseDTOToDomain(dto: SubmitContestResponseDTO): SubmitContestResponse {
  return {
    uuid: dto.uuid,
    status: dto.status,
    submittedAt: parseDateRequired(dto.submitted_at),
    timeSpentSeconds: dto.time_spent_seconds,
    listeningScore: dto.listening_score,
    readingScore: dto.reading_score,
    writingScore: dto.writing_score,
    speakingScore: dto.speaking_score,
    overallScore: dto.overall_score,
    correctAnswers: dto.correct_answers,
    totalQuestions: dto.total_questions,
  };
}

// ============= Result Mappers =============

export function mapWritingFeedbackDTOToDomain(dto: WritingFeedbackDTO): WritingFeedback {
  return {
    taskResponseOrAchievement: dto.task_response_or_achievement,
    coherenceAndCohesion: dto.coherence_and_cohesion,
    lexicalResource: dto.lexical_resource,
    grammaticalRangeAndAccuracy: dto.grammatical_range_and_accuracy,
    overall: dto.overall,
  };
}

export function mapQuestionResultDTOToDomain(dto: QuestionResultDTO): QuestionResult {
  return {
    questionKey: dto.question_key,
    questionText: dto.question_text,
    userAnswer: dto.user_answer,
    correctAnswer: dto.correct_answer,
    isCorrect: dto.is_correct,
    points: dto.points,
  };
}

export function mapListeningResultDTOToDomain(dto: ListeningResultDTO): ListeningResult {
  return {
    partNumber: dto.part_number,
    title: dto.title,
    questions: dto.questions.map(mapQuestionResultDTOToDomain),
  };
}

export function mapReadingResultDTOToDomain(dto: ReadingResultDTO): ReadingResult {
  return {
    passageNumber: dto.passage_number,
    title: dto.title,
    questions: dto.questions.map(mapQuestionResultDTOToDomain),
  };
}

export function mapWritingResultDTOToDomain(dto: WritingResultDTO): WritingResult {
  return {
    taskType: dto.task_type,
    taskTypeDisplay: dto.task_type_display,
    prompt: dto.prompt,
    userAnswer: dto.user_answer,
    wordCount: dto.word_count,
    score: dto.score,
    feedback: dto.feedback ? mapWritingFeedbackDTOToDomain(dto.feedback) : undefined,
  };
}

export function mapContestResultDTOToDomain(dto: ContestResultDTO): ContestResult {
  return {
    uuid: dto.uuid,
    contest: {
      uuid: dto.contest.uuid,
      title: dto.contest.title,
      contestType: dto.contest.contest_type,
      difficulty: dto.contest.difficulty,
      resultsVisible: dto.contest.results_visible,
    },
    status: dto.status,
    scores: {
      listeningScore: dto.scores.listening_score,
      readingScore: dto.scores.reading_score,
      writingScore: dto.scores.writing_score,
      speakingScore: dto.scores.speaking_score,
      overallScore: dto.scores.overall_score,
    },
    statistics: {
      correctAnswers: dto.statistics.correct_answers,
      totalQuestions: dto.statistics.total_questions,
      percentage: dto.statistics.percentage,
      timeSpentSeconds: dto.statistics.time_spent_seconds,
    },
    detailedResults: dto.detailed_results ? {
      listening: dto.detailed_results.listening?.map(mapListeningResultDTOToDomain),
      reading: dto.detailed_results.reading?.map(mapReadingResultDTOToDomain),
      writing: dto.detailed_results.writing?.map(mapWritingResultDTOToDomain),
    } : undefined,
    submittedAt: parseDate(dto.submitted_at),
  };
}

// ============= Available Content Mappers =============

export function mapAvailableReadingPassageDTOToDomain(dto: AvailableReadingPassageDTO): AvailableReadingPassage {
  return {
    id: dto.id,
    title: dto.title,
    passageNumber: dto.passage_number,
    wordCount: dto.word_count,
    questionCount: dto.question_count,
    difficulty: dto.difficulty,
    isPremium: dto.is_premium,
  };
}

export function mapAvailableListeningPartDTOToDomain(dto: AvailableListeningPartDTO): AvailableListeningPart {
  return {
    id: dto.id,
    title: dto.title,
    partNumber: dto.part_number,
    durationSeconds: dto.duration_seconds,
    questionCount: dto.question_count,
    isPremium: dto.is_premium,
  };
}

export function mapAvailableWritingTaskDTOToDomain(dto: AvailableWritingTaskDTO): AvailableWritingTask {
  return {
    id: dto.id,
    taskType: dto.task_type,
    taskTypeDisplay: dto.task_type_display,
    promptPreview: dto.prompt_preview,
    chartType: dto.chart_type,
    isPremium: dto.is_premium,
  };
}

export function mapAvailableSpeakingTopicDTOToDomain(dto: AvailableSpeakingTopicDTO): AvailableSpeakingTopic {
  return {
    id: dto.id,
    speakingType: dto.speaking_type,
    topicName: dto.topic_name,
    partNumber: dto.part_number,
    isPremium: dto.is_premium,
  };
}

// ============= Next Section Mapper =============

export function mapNextSectionResponseDTOToDomain(dto: NextSectionResponseDTO): NextSectionResponse {
  return {
    success: dto.success,
    currentSection: dto.current_section,
    status: dto.status,
    message: dto.message,
  };
}

// ============= Domain to DTO Mappers (for API requests) =============

export function mapCreateContestRequestToDTO(request: {
  title: string;
  description?: string;
  contestType: string;
  difficulty?: string;
  startTime: Date;
  endTime: Date;
  durationMinutes?: number;
  isPublic?: boolean;
  accessCode?: string;
  autoGradeReading?: boolean;
  autoGradeListening?: boolean;
  readingPassageIds?: number[];
  listeningPartIds?: number[];
  writingTaskIds?: number[];
  speakingTopicIds?: number[];
  assignedStudentIds?: number[];
}): Record<string, unknown> {
  return {
    title: request.title,
    description: request.description,
    contest_type: request.contestType,
    difficulty: request.difficulty,
    start_time: request.startTime.toISOString(),
    end_time: request.endTime.toISOString(),
    duration_minutes: request.durationMinutes,
    is_public: request.isPublic,
    access_code: request.accessCode,
    auto_grade_reading: request.autoGradeReading,
    auto_grade_listening: request.autoGradeListening,
    reading_passage_ids: request.readingPassageIds,
    listening_part_ids: request.listeningPartIds,
    writing_task_ids: request.writingTaskIds,
    speaking_topic_ids: request.speakingTopicIds,
    assigned_student_ids: request.assignedStudentIds,
  };
}

export function mapUpdateContestRequestToDTO(request: {
  title?: string;
  description?: string;
  difficulty?: string;
  startTime?: Date;
  endTime?: Date;
  durationMinutes?: number;
  isPublic?: boolean;
  accessCode?: string;
  autoGradeReading?: boolean;
  autoGradeListening?: boolean;
  resultsVisible?: boolean;
}): Record<string, unknown> {
  const dto: Record<string, unknown> = {};
  
  if (request.title !== undefined) dto.title = request.title;
  if (request.description !== undefined) dto.description = request.description;
  if (request.difficulty !== undefined) dto.difficulty = request.difficulty;
  if (request.startTime !== undefined) dto.start_time = request.startTime.toISOString();
  if (request.endTime !== undefined) dto.end_time = request.endTime.toISOString();
  if (request.durationMinutes !== undefined) dto.duration_minutes = request.durationMinutes;
  if (request.isPublic !== undefined) dto.is_public = request.isPublic;
  if (request.accessCode !== undefined) dto.access_code = request.accessCode;
  if (request.autoGradeReading !== undefined) dto.auto_grade_reading = request.autoGradeReading;
  if (request.autoGradeListening !== undefined) dto.auto_grade_listening = request.autoGradeListening;
  if (request.resultsVisible !== undefined) dto.results_visible = request.resultsVisible;
  
  return dto;
}

export function mapSubmitAnswersRequestToDTO(request: {
  answers: Record<string, string>;
  startedAt: Date;
  timeSpentSeconds: number;
}): Record<string, unknown> {
  return {
    answers: request.answers,
    started_at: request.startedAt.toISOString(),
    time_spent_seconds: request.timeSpentSeconds,
  };
}

export function mapSubmitWritingRequestToDTO(request: {
  writingAnswers: Array<{ taskId: number; answerText: string }>;
  startedAt: Date;
  timeSpentSeconds: number;
}): Record<string, unknown> {
  return {
    writing_answers: request.writingAnswers.map(a => ({
      task_id: a.taskId,
      answer_text: a.answerText,
    })),
    started_at: request.startedAt.toISOString(),
    time_spent_seconds: request.timeSpentSeconds,
  };
}
