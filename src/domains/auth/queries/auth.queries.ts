/**
 * TanStack Query hooks for authentication module
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import type {
  AuthSession,
  LoginCredentials,
  RegisterData,
  User,
  OnboardingData,
  OnboardingState,
  TelegramBotInfo,
  TelegramVerificationStatus,
  VerificationStatus,
} from '../models/domain';

// Query keys for cache management
export const authQueryKeys = {
  all: ['auth'] as const,
  user: () => [...authQueryKeys.all, 'user'] as const,
  session: () => [...authQueryKeys.all, 'session'] as const,
  onboarding: () => [...authQueryKeys.all, 'onboarding'] as const,
  verificationStatus: () => [...authQueryKeys.all, 'verification-status'] as const,
  telegramBotInfo: () => [...authQueryKeys.all, 'telegram-bot-info'] as const,
};

// ============================================
// Authentication Hooks
// ============================================

interface UseLoginOptions {
  onSuccess?: (session: AuthSession) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to login with username/email and password
 */
export function useLogin(options: UseLoginOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (session) => {
      queryClient.setQueryData(authQueryKeys.user(), session.user);
      queryClient.setQueryData(authQueryKeys.session(), session);
      options.onSuccess?.(session);
    },
    onError: options.onError,
  });
}

interface UseRegisterOptions {
  onSuccess?: (session: AuthSession) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to register a new user
 */
export function useRegister(options: UseRegisterOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: (session) => {
      queryClient.setQueryData(authQueryKeys.user(), session.user);
      queryClient.setQueryData(authQueryKeys.session(), session);
      options.onSuccess?.(session);
    },
    onError: options.onError,
  });
}

interface UseCurrentUserOptions {
  enabled?: boolean;
}

/**
 * Hook to get the current authenticated user
 */
export function useCurrentUser(options: UseCurrentUserOptions = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: authQueryKeys.user(),
    queryFn: () => authApi.getCurrentUser(),
    enabled: enabled && authApi.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('401')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

interface UseLogoutOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to logout the current user
 */
export function useLogout(options: UseLogoutOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.clear();
      options.onSuccess?.();
    },
    onError: options.onError,
  });
}

/**
 * Hook to refresh the access token
 */
export function useRefreshToken() {
  return useMutation({
    mutationFn: () => authApi.refreshToken(),
  });
}

// ============================================
// Google Authentication Hooks
// ============================================

interface UseGoogleAuthOptions {
  onSuccess?: (session: AuthSession & { isNewUser: boolean }) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to authenticate with Google
 */
export function useGoogleAuth(options: UseGoogleAuthOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => authApi.googleAuth(token),
    onSuccess: (session) => {
      queryClient.setQueryData(authQueryKeys.user(), session.user);
      queryClient.setQueryData(authQueryKeys.session(), session);
      options.onSuccess?.(session);
    },
    onError: options.onError,
  });
}

// ============================================
// Telegram Authentication Hooks
// ============================================

/**
 * Hook to get Telegram bot info
 */
export function useTelegramBotInfo() {
  return useQuery({
    queryKey: authQueryKeys.telegramBotInfo(),
    queryFn: () => authApi.getTelegramBotInfo(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

interface UseTelegramVerifyOptions {
  onSuccess?: (session: AuthSession & { isNewUser: boolean }) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to verify Telegram code
 */
export function useTelegramVerify(options: UseTelegramVerifyOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => authApi.verifyTelegramCode(code),
    onSuccess: (session) => {
      queryClient.setQueryData(authQueryKeys.user(), session.user);
      queryClient.setQueryData(authQueryKeys.session(), session);
      options.onSuccess?.(session);
    },
    onError: options.onError,
  });
}

interface UseTelegramCheckStatusOptions {
  onSuccess?: (status: TelegramVerificationStatus) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to check Telegram verification status
 */
export function useTelegramCheckStatus(options: UseTelegramCheckStatusOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => authApi.checkTelegramStatus(code),
    onSuccess: (status) => {
      if (status.status === 'verified' && status.user) {
        queryClient.setQueryData(authQueryKeys.user(), status.user);
      }
      options.onSuccess?.(status);
    },
    onError: options.onError,
  });
}

// ============================================
// Email Verification Hooks
// ============================================

interface UseSendVerificationCodeOptions {
  onSuccess?: (result: { message: string; expiresInSeconds: number }) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to send verification code
 */
export function useSendVerificationCode(options: UseSendVerificationCodeOptions = {}) {
  return useMutation({
    mutationFn: () => authApi.sendVerificationCode(),
    onSuccess: options.onSuccess,
    onError: options.onError,
  });
}

interface UseVerifyEmailCodeOptions {
  onSuccess?: (result: { message: string }) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to verify email code
 */
export function useVerifyEmailCode(options: UseVerifyEmailCodeOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => authApi.verifyEmailCode(code),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.user() });
      queryClient.invalidateQueries({ queryKey: authQueryKeys.verificationStatus() });
      options.onSuccess?.(result);
    },
    onError: options.onError,
  });
}

/**
 * Hook to get verification status
 */
export function useVerificationStatus() {
  return useQuery({
    queryKey: authQueryKeys.verificationStatus(),
    queryFn: () => authApi.getVerificationStatus(),
    enabled: authApi.isAuthenticated(),
  });
}

// ============================================
// Onboarding Hooks
// ============================================

/**
 * Hook to get onboarding data and options
 */
export function useOnboardingData() {
  return useQuery({
    queryKey: authQueryKeys.onboarding(),
    queryFn: () => authApi.getOnboardingData(),
    enabled: authApi.isAuthenticated(),
    staleTime: 5 * 60 * 1000,
  });
}

interface UseSubmitOnboardingOptions {
  onSuccess?: (result: { message: string; user: User }) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to submit onboarding data
 */
export function useSubmitOnboarding(options: UseSubmitOnboardingOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OnboardingData) => authApi.submitOnboarding(data),
    onSuccess: (result) => {
      queryClient.setQueryData(authQueryKeys.user(), result.user);
      queryClient.invalidateQueries({ queryKey: authQueryKeys.onboarding() });
      options.onSuccess?.(result);
    },
    onError: options.onError,
  });
}
