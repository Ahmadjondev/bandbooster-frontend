/**
 * Auth Domain - Public API
 *
 * This module exports all public interfaces for the authentication feature.
 */

// API client
export { authApi } from './api/auth.api';
export {
  login,
  register,
  logout,
  refreshToken,
  getCurrentUser,
  isAuthenticated,
  getStoredUser,
  googleAuth,
  getTelegramBotInfo,
  verifyTelegramCode,
  checkTelegramStatus,
  sendVerificationCode,
  verifyEmailCode,
  getVerificationStatus,
  getOnboardingData,
  submitOnboarding,
} from './api/auth.api';

// DTOs (contracts)
export type {
  UserRole,
  SubscriptionTier as SubscriptionTierDTO,
  UserDTO,
  TokenDTO,
  LoginRequestDTO,
  LoginResponseDTO,
  RegisterRequestDTO,
  RegisterResponseDTO,
  RefreshTokenRequestDTO,
  RefreshTokenResponseDTO,
  LogoutRequestDTO,
  LogoutResponseDTO,
  GoogleAuthRequestDTO,
  GoogleAuthResponseDTO,
  TelegramBotInfoDTO,
  TelegramVerifyRequestDTO,
  TelegramVerifyResponseDTO,
  TelegramCheckStatusRequestDTO,
  TelegramCheckStatusResponseDTO,
  SendVerificationCodeResponseDTO,
  VerifyCodeRequestDTO,
  VerifyCodeResponseDTO,
  VerificationStatusResponseDTO,
  OnboardingOptionsDTO,
  OnboardingDataDTO,
  OnboardingGetResponseDTO,
  OnboardingSubmitRequestDTO,
  OnboardingSubmitResponseDTO,
  HeardFromOption,
  MainGoalOption,
  ExamTypeOption,
  TargetScoreOption,
} from './api/auth.contract';

// Domain models
export type {
  User,
  AuthSession,
  LoginCredentials,
  RegisterData,
  TokenInfo,
  SubscriptionTier,
  OnboardingData,
  OnboardingOptions,
  OnboardingState,
  TelegramBotInfo,
  TelegramVerificationStatus,
  VerificationStatus,
} from './models/domain';

// Mappers
export {
  mapUserDTOToDomain,
  mapLoginResponseDTOToDomain,
  mapRegisterResponseDTOToDomain,
  mapRefreshTokenResponseToDomain,
  mapLoginCredentialsToDTO,
  mapRegisterDataToDTO,
  mapGoogleAuthResponseDTOToDomain,
  mapTelegramBotInfoDTOToDomain,
  mapTelegramVerifyResponseDTOToDomain,
  mapTelegramCheckStatusResponseDTOToDomain,
  mapOnboardingDataDTOToDomain,
  mapOnboardingDataToDTO,
  mapOnboardingGetResponseDTOToDomain,
  mapOnboardingSubmitResponseDTOToDomain,
  mapVerificationStatusDTOToDomain,
} from './api/auth.mapper';

// Query hooks
export {
  authQueryKeys,
  useLogin,
  useRegister,
  useCurrentUser,
  useLogout,
  useRefreshToken,
  useGoogleAuth,
  useTelegramBotInfo,
  useTelegramVerify,
  useTelegramCheckStatus,
  useSendVerificationCode,
  useVerifyEmailCode,
  useVerificationStatus,
  useOnboardingData,
  useSubmitOnboarding,
} from './queries/auth.queries';
