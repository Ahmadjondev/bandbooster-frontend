/**
 * Data Transfer Objects (DTOs) for authentication API
 * Matches the BandBooster backend API schema
 */

// User roles
export type UserRole = 'STUDENT' | 'TEACHER' | 'MANAGER' | 'SUPERADMIN';

// Subscription tiers
export type SubscriptionTier = 'free' | 'premium' | 'pro';

// User DTO from backend
export interface UserDTO {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
  is_verified: boolean;
  subscription_tier: SubscriptionTier;
  band_score_goal?: string;
  exam_type?: string;
  exam_date?: string;
  main_goal?: string;
  heard_from?: string;
  onboarding_completed: boolean;
  balance: number;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Token DTO
export interface TokenDTO {
  access: string;
  refresh: string;
}

// Login
export interface LoginRequestDTO {
  username: string; // Can be email or username
  password: string;
}

export interface LoginResponseDTO {
  access: string;
  refresh: string;
  user: UserDTO;
}

// Register
export interface RegisterRequestDTO {
  email: string;
  username: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
}

export interface RegisterResponseDTO {
  access: string;
  refresh: string;
  user: UserDTO;
}

// Refresh Token
export interface RefreshTokenRequestDTO {
  refresh: string;
}

export interface RefreshTokenResponseDTO {
  access: string;
  refresh?: string;
}

// Logout
export interface LogoutRequestDTO {
  refresh: string;
}

export interface LogoutResponseDTO {
  detail: string;
}

// Google Auth
export interface GoogleAuthRequestDTO {
  token: string;
}

export interface GoogleAuthResponseDTO {
  access: string;
  refresh: string;
  user: UserDTO;
  created: boolean;
}

// Telegram Auth
export interface TelegramBotInfoDTO {
  bot_username: string;
  bot_url: string;
}

export interface TelegramCreateVerificationRequestDTO {
  telegram_id: string;
  phone: string;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface TelegramCreateVerificationResponseDTO {
  code: string;
  expires_at: string;
}

export interface TelegramVerifyRequestDTO {
  code: string;
}

export interface TelegramVerifyResponseDTO {
  access: string;
  refresh: string;
  user: UserDTO;
  created: boolean;
}

export interface TelegramCheckStatusRequestDTO {
  code: string;
}

export interface TelegramCheckStatusResponseDTO {
  status: 'pending' | 'verified' | 'expired';
  user?: UserDTO;
  access?: string;
  refresh?: string;
}

// Email Verification
export interface SendVerificationCodeResponseDTO {
  message: string;
  expires_in_seconds: number;
}

export interface VerifyCodeRequestDTO {
  code: string;
}

export interface VerifyCodeResponseDTO {
  message: string;
}

export interface VerificationStatusResponseDTO {
  is_verified: boolean;
  email: string;
}

// Profile Update
export interface ProfileUpdateRequestDTO {
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
}

export interface ProfileUpdateResponseDTO {
  user: UserDTO;
  message: string;
}

// Onboarding
export type HeardFromOption = 'GOOGLE' | 'SOCIAL_MEDIA' | 'FRIEND' | 'YOUTUBE' | 'TELEGRAM' | 'OTHER';
export type MainGoalOption = 'STUDY_ABROAD' | 'IMMIGRATION' | 'WORK' | 'PERSONAL' | 'OTHER';
export type ExamTypeOption = 'ACADEMIC' | 'GENERAL' | 'UKVI';
export type TargetScoreOption = '5.5' | '6.0' | '6.5' | '7.0' | '7.5' | '8.0' | '8.5' | '9.0';

export interface OnboardingOptionsDTO {
  heard_from_choices: Array<{ value: HeardFromOption; label: string }>;
  main_goal_choices: Array<{ value: MainGoalOption; label: string }>;
  exam_type_choices: Array<{ value: ExamTypeOption; label: string }>;
  target_score_choices: Array<{ value: TargetScoreOption; label: string }>;
}

export interface OnboardingDataDTO {
  heard_from?: HeardFromOption;
  main_goal?: MainGoalOption;
  exam_type?: ExamTypeOption;
  target_score?: TargetScoreOption;
  exam_date?: string;
}

export interface OnboardingGetResponseDTO {
  onboarding_completed: boolean;
  current_data: OnboardingDataDTO;
  options: OnboardingOptionsDTO;
}

export interface OnboardingSubmitRequestDTO {
  heard_from?: HeardFromOption;
  main_goal?: MainGoalOption;
  exam_type?: ExamTypeOption;
  target_score?: TargetScoreOption;
  exam_date?: string;
}

export interface OnboardingSubmitResponseDTO {
  message: string;
  user: UserDTO;
}
