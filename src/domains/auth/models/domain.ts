/**
 * Domain models for the authentication module
 */

// User roles
export type UserRole = 'STUDENT' | 'TEACHER' | 'MANAGER' | 'SUPERADMIN';

// Subscription tiers
export type SubscriptionTier = 'free' | 'premium' | 'pro';

// User domain model
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  isVerified: boolean;
  subscriptionTier: SubscriptionTier;
  bandScoreGoal?: string;
  examType?: string;
  examDate?: Date;
  mainGoal?: string;
  heardFrom?: string;
  onboardingCompleted: boolean;
  balance: number;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  username: string; // Can be email or username
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface TokenInfo {
  accessToken: string;
  refreshToken: string;
}

// Onboarding types
export type HeardFromOption = 'GOOGLE' | 'SOCIAL_MEDIA' | 'FRIEND' | 'YOUTUBE' | 'TELEGRAM' | 'OTHER';
export type MainGoalOption = 'STUDY_ABROAD' | 'IMMIGRATION' | 'WORK' | 'PERSONAL' | 'OTHER';
export type ExamTypeOption = 'ACADEMIC' | 'GENERAL' | 'UKVI';
export type TargetScoreOption = '5.5' | '6.0' | '6.5' | '7.0' | '7.5' | '8.0' | '8.5' | '9.0';

export interface OnboardingData {
  heardFrom?: HeardFromOption;
  mainGoal?: MainGoalOption;
  examType?: ExamTypeOption;
  targetScore?: TargetScoreOption;
  examDate?: string;
}

export interface OnboardingOptions {
  heardFromChoices: Array<{ value: HeardFromOption; label: string }>;
  mainGoalChoices: Array<{ value: MainGoalOption; label: string }>;
  examTypeChoices: Array<{ value: ExamTypeOption; label: string }>;
  targetScoreChoices: Array<{ value: TargetScoreOption; label: string }>;
}

export interface OnboardingState {
  isCompleted: boolean;
  currentData: OnboardingData;
  options: OnboardingOptions;
}

// Telegram Auth
export interface TelegramBotInfo {
  botUsername: string;
  botUrl: string;
}

export interface TelegramVerificationStatus {
  status: 'pending' | 'verified' | 'expired';
  user?: User;
  accessToken?: string;
  refreshToken?: string;
}

// Verification
export interface VerificationStatus {
  isVerified: boolean;
  email: string;
}
