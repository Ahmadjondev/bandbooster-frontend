/**
 * Mappers for transforming between DTOs and Domain models
 */

import type {
  UserDTO,
  LoginResponseDTO,
  RegisterResponseDTO,
  RefreshTokenResponseDTO,
  LoginRequestDTO,
  RegisterRequestDTO,
  GoogleAuthResponseDTO,
  TelegramBotInfoDTO,
  TelegramVerifyResponseDTO,
  TelegramCheckStatusResponseDTO,
  OnboardingGetResponseDTO,
  OnboardingSubmitResponseDTO,
  OnboardingDataDTO,
  OnboardingSubmitRequestDTO,
  VerificationStatusResponseDTO,
} from './auth.contract';

import type {
  User,
  AuthSession,
  LoginCredentials,
  RegisterData,
  TokenInfo,
  TelegramBotInfo,
  TelegramVerificationStatus,
  OnboardingState,
  OnboardingData,
  VerificationStatus,
} from '../models/domain';

// User mappers
export function mapUserDTOToDomain(dto: UserDTO): User {
  return {
    id: dto.id,
    username: dto.username,
    email: dto.email,
    firstName: dto.first_name,
    lastName: dto.last_name,
    fullName: `${dto.first_name} ${dto.last_name}`.trim(),
    phone: dto.phone,
    role: dto.role,
    isVerified: dto.is_verified,
    subscriptionTier: dto.subscription_tier,
    bandScoreGoal: dto.band_score_goal,
    examType: dto.exam_type,
    examDate: dto.exam_date ? new Date(dto.exam_date) : undefined,
    mainGoal: dto.main_goal,
    heardFrom: dto.heard_from,
    onboardingCompleted: dto.onboarding_completed,
    balance: dto.balance,
    avatarUrl: dto.avatar_url,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
  };
}

// Auth response mappers
export function mapLoginResponseDTOToDomain(dto: LoginResponseDTO): AuthSession {
  return {
    user: mapUserDTOToDomain(dto.user),
    accessToken: dto.access,
    refreshToken: dto.refresh,
  };
}

export function mapRegisterResponseDTOToDomain(dto: RegisterResponseDTO): AuthSession {
  return {
    user: mapUserDTOToDomain(dto.user),
    accessToken: dto.access,
    refreshToken: dto.refresh,
  };
}

export function mapGoogleAuthResponseDTOToDomain(dto: GoogleAuthResponseDTO): AuthSession & { isNewUser: boolean } {
  return {
    user: mapUserDTOToDomain(dto.user),
    accessToken: dto.access,
    refreshToken: dto.refresh,
    isNewUser: dto.created,
  };
}

export function mapRefreshTokenResponseToDomain(dto: RefreshTokenResponseDTO): TokenInfo {
  return {
    accessToken: dto.access,
    refreshToken: dto.refresh || '',
  };
}

// Request mappers
export function mapLoginCredentialsToDTO(credentials: LoginCredentials): LoginRequestDTO {
  return {
    username: credentials.username,
    password: credentials.password,
  };
}

export function mapRegisterDataToDTO(data: RegisterData): RegisterRequestDTO {
  // Generate username from email
  const username = data.email.split('@')[0];
  
  return {
    email: data.email,
    username,
    password: data.password,
    confirm_password: data.password,
    first_name: data.firstName,
    last_name: data.lastName,
  };
}

// Telegram mappers
export function mapTelegramBotInfoDTOToDomain(dto: TelegramBotInfoDTO): TelegramBotInfo {
  return {
    botUsername: dto.bot_username,
    botUrl: dto.bot_url,
  };
}

export function mapTelegramVerifyResponseDTOToDomain(dto: TelegramVerifyResponseDTO): AuthSession & { isNewUser: boolean } {
  return {
    user: mapUserDTOToDomain(dto.user),
    accessToken: dto.access,
    refreshToken: dto.refresh,
    isNewUser: dto.created,
  };
}

export function mapTelegramCheckStatusResponseDTOToDomain(dto: TelegramCheckStatusResponseDTO): TelegramVerificationStatus {
  return {
    status: dto.status,
    user: dto.user ? mapUserDTOToDomain(dto.user) : undefined,
    accessToken: dto.access,
    refreshToken: dto.refresh,
  };
}

// Onboarding mappers
export function mapOnboardingDataDTOToDomain(dto: OnboardingDataDTO): OnboardingData {
  return {
    heardFrom: dto.heard_from,
    mainGoal: dto.main_goal,
    examType: dto.exam_type,
    targetScore: dto.target_score,
    examDate: dto.exam_date,
  };
}

export function mapOnboardingDataToDTO(data: OnboardingData): OnboardingSubmitRequestDTO {
  return {
    heard_from: data.heardFrom,
    main_goal: data.mainGoal,
    exam_type: data.examType,
    target_score: data.targetScore,
    exam_date: data.examDate,
  };
}

export function mapOnboardingGetResponseDTOToDomain(dto: OnboardingGetResponseDTO): OnboardingState {
  return {
    isCompleted: dto.onboarding_completed,
    currentData: mapOnboardingDataDTOToDomain(dto.current_data),
    options: {
      heardFromChoices: dto.options.heard_from_choices,
      mainGoalChoices: dto.options.main_goal_choices,
      examTypeChoices: dto.options.exam_type_choices,
      targetScoreChoices: dto.options.target_score_choices,
    },
  };
}

export function mapOnboardingSubmitResponseDTOToDomain(dto: OnboardingSubmitResponseDTO): { message: string; user: User } {
  return {
    message: dto.message,
    user: mapUserDTOToDomain(dto.user),
  };
}

// Verification mappers
export function mapVerificationStatusDTOToDomain(dto: VerificationStatusResponseDTO): VerificationStatus {
  return {
    isVerified: dto.is_verified,
    email: dto.email,
  };
}

