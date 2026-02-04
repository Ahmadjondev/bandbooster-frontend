/**
 * Mappers for converting between DTOs and Domain models
 */

import type {
  ContentType,
  QuestionType,
  ValidationErrorDTO,
  ExtractStatsDTO,
  ChoiceDTO,
  QuestionDTO,
  QuestionDataDTO,
  QuestionGroupDTO,
  ListeningPartDTO,
  ListeningContentDTO,
  ReadingPassageDTO,
  ReadingContentDTO,
  ExtractResponseDTO,
  SaveResultDTO,
  SaveResponseDTO,
  CreatePracticeResponseDTO,
  LabelDTO,
  StepDTO,
  ExampleDTO,
} from './manager.contract';

import type {
  ValidationError,
  ExtractStats,
  Choice,
  Question,
  QuestionData,
  QuestionGroup,
  ListeningPart,
  ListeningContent,
  ReadingPassage,
  ReadingContent,
  ExtractResponse,
  SaveResult,
  SaveResponse,
  CreatePracticeResponse,
  Label,
  Step,
  Example,
} from '../models/domain';

// ============================================================================
// VALIDATION ERROR MAPPERS
// ============================================================================

export function mapValidationErrorDTOToDomain(dto: ValidationErrorDTO): ValidationError {
  return {
    code: dto.code,
    message: dto.message,
    path: dto.path,
    severity: dto.severity,
  };
}

// ============================================================================
// STATS MAPPERS
// ============================================================================

export function mapExtractStatsDTOToDomain(dto: ExtractStatsDTO | null): ExtractStats | null {
  if (!dto) return null;
  return {
    parts: dto.parts,
    passages: dto.passages,
    questions: dto.questions,
    questionTypes: dto.question_types as QuestionType[],
  };
}

// ============================================================================
// QUESTION STRUCTURE MAPPERS
// ============================================================================

export function mapChoiceDTOToDomain(dto: ChoiceDTO): Choice {
  return {
    key: dto.key,
    text: dto.text,
  };
}

export function mapChoiceDomainToDTO(domain: Choice): ChoiceDTO {
  return {
    key: domain.key,
    text: domain.text,
  };
}

export function mapQuestionDTOToDomain(dto: QuestionDTO): Question {
  return {
    order: dto.order,
    text: dto.text,
    correctAnswer: dto.correct_answer,
    choices: dto.choices?.map(mapChoiceDTOToDomain),
  };
}

export function mapQuestionDomainToDTO(domain: Question): QuestionDTO {
  return {
    order: domain.order,
    text: domain.text,
    correct_answer: domain.correctAnswer,
    choices: domain.choices?.map(mapChoiceDomainToDTO),
  };
}

export function mapQuestionDataDTOToDomain(dto: QuestionDataDTO): QuestionData {
  return {
    title: dto.title,
    text: dto.text,
    items: dto.items,
    blankCount: dto.blankCount,
    note: dto.note,
    wordList: dto.word_list?.map(mapChoiceDTOToDomain),
    options: dto.options?.map(mapChoiceDTOToDomain),
    rows: dto.rows,
    headers: dto.headers,
    labels: dto.labels?.map(mapLabelDTOToDomain),
    labelCount: dto.labelCount,
    description: dto.description,
    visualDescription: dto.visual_description,
    steps: dto.steps?.map(mapStepDTOToDomain),
    flowDescription: dto.flow_description,
  };
}

export function mapQuestionDataDomainToDTO(domain: QuestionData): QuestionDataDTO {
  return {
    title: domain.title,
    text: domain.text,
    items: domain.items,
    blankCount: domain.blankCount,
    note: domain.note,
    word_list: domain.wordList?.map(mapChoiceDomainToDTO),
    options: domain.options?.map(mapChoiceDomainToDTO),
    rows: domain.rows,
    headers: domain.headers,
    labels: domain.labels?.map(mapLabelDomainToDTO),
    labelCount: domain.labelCount,
    description: domain.description,
    visual_description: domain.visualDescription,
    steps: domain.steps?.map(mapStepDomainToDTO),
    flow_description: domain.flowDescription,
  };
}

// Label mappers
export function mapLabelDTOToDomain(dto: LabelDTO): Label {
  return {
    name: dto.name,
    correctAnswer: dto.correctAnswer,
  };
}

export function mapLabelDomainToDTO(domain: Label): LabelDTO {
  return {
    name: domain.name,
    correctAnswer: domain.correctAnswer,
  };
}

// Step mappers
export function mapStepDTOToDomain(dto: StepDTO): Step {
  return {
    stepNumber: dto.step_number,
    text: dto.text,
  };
}

export function mapStepDomainToDTO(domain: Step): StepDTO {
  return {
    step_number: domain.stepNumber,
    text: domain.text,
  };
}

// Example mappers
export function mapExampleDTOToDomain(dto: ExampleDTO): Example {
  return {
    question: dto.question,
    answer: dto.answer,
    explanation: dto.explanation,
  };
}

export function mapExampleDomainToDTO(domain: Example): ExampleDTO {
  return {
    question: domain.question,
    answer: domain.answer,
    explanation: domain.explanation,
  };
}

export function mapQuestionGroupDTOToDomain(dto: QuestionGroupDTO): QuestionGroup {
  return {
    title: dto.title,
    questionType: dto.question_type,
    description: dto.description,
    questionStart: dto.question_start,
    questionEnd: dto.question_end,
    questionData: mapQuestionDataDTOToDomain(dto.question_data),
    questions: dto.questions.map(mapQuestionDTOToDomain),
    example: dto.example ? mapExampleDTOToDomain(dto.example) : undefined,
    hasVisual: dto.has_visual,
  };
}

export function mapQuestionGroupDomainToDTO(domain: QuestionGroup): QuestionGroupDTO {
  return {
    title: domain.title,
    question_type: domain.questionType,
    description: domain.description,
    question_start: domain.questionStart,
    question_end: domain.questionEnd,
    question_data: mapQuestionDataDomainToDTO(domain.questionData),
    questions: domain.questions.map(mapQuestionDomainToDTO),
    example: domain.example ? mapExampleDomainToDTO(domain.example) : undefined,
    has_visual: domain.hasVisual,
  };
}

// ============================================================================
// LISTENING MAPPERS
// ============================================================================

export function mapListeningPartDTOToDomain(dto: ListeningPartDTO): ListeningPart {
  return {
    partNumber: dto.part_number,
    title: dto.title,
    description: dto.description,
    scenario: dto.scenario,
    difficulty: dto.difficulty,
    speakerCount: dto.speaker_count,
    transcript: dto.transcript,
    questionGroups: dto.question_groups.map(mapQuestionGroupDTOToDomain),
  };
}

export function mapListeningPartDomainToDTO(domain: ListeningPart): ListeningPartDTO {
  return {
    part_number: domain.partNumber,
    title: domain.title,
    description: domain.description,
    scenario: domain.scenario,
    difficulty: domain.difficulty,
    speaker_count: domain.speakerCount,
    transcript: domain.transcript,
    question_groups: domain.questionGroups.map(mapQuestionGroupDomainToDTO),
  };
}

export function mapListeningContentDTOToDomain(dto: ListeningContentDTO): ListeningContent {
  return {
    parts: dto.parts.map(mapListeningPartDTOToDomain),
  };
}

export function mapListeningContentDomainToDTO(domain: ListeningContent): ListeningContentDTO {
  return {
    parts: domain.parts.map(mapListeningPartDomainToDTO),
  };
}

// ============================================================================
// READING MAPPERS
// ============================================================================

export function mapReadingPassageDTOToDomain(dto: ReadingPassageDTO): ReadingPassage {
  return {
    passageNumber: dto.passage_number,
    title: dto.title,
    content: dto.content,
    summary: dto.summary,
    difficulty: dto.difficulty,
    paragraphCount: dto.paragraph_count,
    testHeads: dto.test_heads.map(mapQuestionGroupDTOToDomain),
  };
}

export function mapReadingPassageDomainToDTO(domain: ReadingPassage): ReadingPassageDTO {
  return {
    passage_number: domain.passageNumber,
    title: domain.title,
    content: domain.content,
    summary: domain.summary,
    difficulty: domain.difficulty,
    paragraph_count: domain.paragraphCount,
    test_heads: domain.testHeads.map(mapQuestionGroupDomainToDTO),
  };
}

export function mapReadingContentDTOToDomain(dto: ReadingContentDTO): ReadingContent {
  return {
    passages: dto.passages.map(mapReadingPassageDTOToDomain),
  };
}

export function mapReadingContentDomainToDTO(domain: ReadingContent): ReadingContentDTO {
  return {
    passages: domain.passages.map(mapReadingPassageDomainToDTO),
  };
}

// ============================================================================
// EXTRACT RESPONSE MAPPER
// ============================================================================

export function mapExtractResponseDTOToDomain(dto: ExtractResponseDTO): ExtractResponse {
  let preview: ListeningContent | ReadingContent | null = null;
  
  if (dto.preview) {
    if ('parts' in dto.preview) {
      preview = mapListeningContentDTOToDomain(dto.preview as ListeningContentDTO);
    } else if ('passages' in dto.preview) {
      preview = mapReadingContentDTOToDomain(dto.preview as ReadingContentDTO);
    }
  }
  
  return {
    isValid: dto.is_valid,
    contentType: dto.content_type,
    errors: dto.errors.map(mapValidationErrorDTOToDomain),
    warnings: dto.warnings.map(mapValidationErrorDTOToDomain),
    stats: mapExtractStatsDTOToDomain(dto.stats),
    preview,
  };
}

// ============================================================================
// SAVE RESPONSE MAPPER
// ============================================================================

export function mapSaveResultDTOToDomain(dto: SaveResultDTO): SaveResult {
  return {
    contentType: dto.content_type,
    partsCreated: dto.parts_created,
    passagesCreated: dto.passages_created,
    testHeadsCreated: dto.test_heads_created,
    questionsCreated: dto.questions_created,
    choicesCreated: dto.choices_created,
    partIds: dto.part_ids,
    passageIds: dto.passage_ids,
  };
}

export function mapSaveResponseDTOToDomain(dto: SaveResponseDTO): SaveResponse {
  return {
    message: dto.message,
    result: mapSaveResultDTOToDomain(dto.result),
  };
}

// ============================================================================
// PRACTICE RESPONSE MAPPER
// ============================================================================

export function mapCreatePracticeResponseDTOToDomain(dto: CreatePracticeResponseDTO): CreatePracticeResponse {
  return {
    message: dto.message,
    practiceId: dto.practice_id,
    title: dto.title,
    practiceType: dto.practice_type,
  };
}

// ============================================================================
// DOMAIN TO DTO CONTENT MAPPER (for save endpoint)
// ============================================================================

export function mapContentDomainToDTO(
  content: ListeningContent | ReadingContent,
  contentType: ContentType
): ListeningContentDTO | ReadingContentDTO {
  if (contentType === 'LISTENING') {
    return mapListeningContentDomainToDTO(content as ListeningContent);
  }
  return mapReadingContentDomainToDTO(content as ReadingContent);
}

// ============================================================================
// READING MANAGEMENT MAPPERS
// ============================================================================

import type {
  ReadingItemDTO,
  ReadingDetailDTO,
  ReadingListResponseDTO,
  CreateReadingRequestDTO,
  UpdateReadingRequestDTO,
  ListeningItemDTO,
  ListeningDetailDTO,
  ListeningListResponseDTO,
  CreateListeningRequestDTO,
  UpdateListeningRequestDTO,
  ContentFilterParamsDTO,
} from './manager.contract';

import type {
  ReadingItem,
  ReadingDetail,
  ReadingListResponse,
  CreateReadingInput,
  UpdateReadingInput,
  ListeningItem,
  ListeningDetail,
  ListeningListResponse,
  CreateListeningInput,
  UpdateListeningInput,
  ContentFilterParams,
} from '../models/domain';

export function mapReadingItemDTOToDomain(dto: ReadingItemDTO): ReadingItem {
  return {
    id: dto.id,
    passageNumber: dto.passage_number,
    isAuthentic: dto.is_authentic,
    isPractice: dto.is_practice,
    title: dto.title,
    difficulty: dto.difficulty,
    wordCount: dto.word_count,
    questionCount: dto.question_count,
    createdAt: new Date(dto.created_at),
  };
}

export function mapReadingDetailDTOToDomain(dto: ReadingDetailDTO): ReadingDetail {
  return {
    id: dto.id,
    passageNumber: dto.passage_number,
    isAuthentic: dto.is_authentic,
    isPractice: dto.is_practice,
    title: dto.title,
    summary: dto.summary,
    content: dto.content,
    difficulty: dto.difficulty,
    wordCount: dto.word_count,
    questionCount: dto.question_count,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
  };
}

export function mapReadingListResponseDTOToDomain(dto: ReadingListResponseDTO): ReadingListResponse {
  return {
    count: dto.count,
    results: dto.results.map(mapReadingItemDTOToDomain),
  };
}

export function mapCreateReadingInputToDTO(input: CreateReadingInput): CreateReadingRequestDTO {
  return {
    passage_number: input.passageNumber,
    title: input.title,
    content: input.content,
    summary: input.summary,
    difficulty: input.difficulty,
    is_authentic: input.isAuthentic,
    is_practice: input.isPractice,
  };
}

export function mapUpdateReadingInputToDTO(input: UpdateReadingInput): UpdateReadingRequestDTO {
  const dto: UpdateReadingRequestDTO = {};
  if (input.passageNumber !== undefined) dto.passage_number = input.passageNumber;
  if (input.title !== undefined) dto.title = input.title;
  if (input.content !== undefined) dto.content = input.content;
  if (input.summary !== undefined) dto.summary = input.summary;
  if (input.difficulty !== undefined) dto.difficulty = input.difficulty;
  if (input.isAuthentic !== undefined) dto.is_authentic = input.isAuthentic;
  if (input.isPractice !== undefined) dto.is_practice = input.isPractice;
  return dto;
}

// ============================================================================
// LISTENING MANAGEMENT MAPPERS
// ============================================================================

export function mapListeningItemDTOToDomain(dto: ListeningItemDTO): ListeningItem {
  return {
    id: dto.id,
    partNumber: dto.part_number,
    isAuthentic: dto.is_authentic,
    isPractice: dto.is_practice,
    title: dto.title,
    difficulty: dto.difficulty,
    durationSeconds: dto.duration_seconds,
    hasAudio: dto.has_audio,
    questionCount: dto.question_count,
    createdAt: new Date(dto.created_at),
  };
}

export function mapListeningDetailDTOToDomain(dto: ListeningDetailDTO): ListeningDetail {
  return {
    id: dto.id,
    partNumber: dto.part_number,
    isAuthentic: dto.is_authentic,
    isPractice: dto.is_practice,
    title: dto.title,
    description: dto.description,
    audioFile: dto.audio_file,
    audioUrl: dto.audio_url,
    difficulty: dto.difficulty,
    durationSeconds: dto.duration_seconds,
    transcript: dto.transcript,
    questionCount: dto.question_count,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
  };
}

export function mapListeningListResponseDTOToDomain(dto: ListeningListResponseDTO): ListeningListResponse {
  return {
    count: dto.count,
    results: dto.results.map(mapListeningItemDTOToDomain),
  };
}

export function mapCreateListeningInputToDTO(input: CreateListeningInput): CreateListeningRequestDTO {
  return {
    part_number: input.partNumber,
    title: input.title,
    description: input.description,
    transcript: input.transcript,
    difficulty: input.difficulty,
    is_authentic: input.isAuthentic,
    is_practice: input.isPractice,
  };
}

export function mapUpdateListeningInputToDTO(input: UpdateListeningInput): UpdateListeningRequestDTO {
  const dto: UpdateListeningRequestDTO = {};
  if (input.partNumber !== undefined) dto.part_number = input.partNumber;
  if (input.title !== undefined) dto.title = input.title;
  if (input.description !== undefined) dto.description = input.description;
  if (input.transcript !== undefined) dto.transcript = input.transcript;
  if (input.difficulty !== undefined) dto.difficulty = input.difficulty;
  if (input.isAuthentic !== undefined) dto.is_authentic = input.isAuthentic;
  if (input.isPractice !== undefined) dto.is_practice = input.isPractice;
  return dto;
}

// ============================================================================
// FILTER PARAMS MAPPER
// ============================================================================

export function mapFilterParamsToDTO(params: ContentFilterParams): ContentFilterParamsDTO {
  const dto: ContentFilterParamsDTO = {};
  if (params.difficulty !== undefined) dto.difficulty = params.difficulty;
  if (params.isAuthentic !== undefined) dto.is_authentic = params.isAuthentic;
  if (params.isPractice !== undefined) dto.is_practice = params.isPractice;
  if (params.search !== undefined) dto.search = params.search;
  if (params.ordering !== undefined) dto.ordering = params.ordering;
  if (params.page !== undefined) dto.page = params.page;
  if (params.pageSize !== undefined) dto.page_size = params.pageSize;
  return dto;
}

