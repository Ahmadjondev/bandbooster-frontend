/**
 * API client for authentication endpoints
 * Integrates with BandBooster backend
 */

import type {
  LoginResponseDTO,
  RegisterResponseDTO,
  RefreshTokenResponseDTO,
  UserDTO,
  GoogleAuthResponseDTO,
  TelegramBotInfoDTO,
  TelegramVerifyResponseDTO,
  TelegramCheckStatusResponseDTO,
  SendVerificationCodeResponseDTO,
  VerifyCodeResponseDTO,
  VerificationStatusResponseDTO,
  OnboardingGetResponseDTO,
  OnboardingSubmitResponseDTO,
} from './auth.contract';

import {
  mapLoginCredentialsToDTO,
  mapLoginResponseDTOToDomain,
  mapRefreshTokenResponseToDomain,
  mapRegisterDataToDTO,
  mapRegisterResponseDTOToDomain,
  mapUserDTOToDomain,
  mapGoogleAuthResponseDTOToDomain,
  mapTelegramBotInfoDTOToDomain,
  mapTelegramVerifyResponseDTOToDomain,
  mapTelegramCheckStatusResponseDTOToDomain,
  mapOnboardingGetResponseDTOToDomain,
  mapOnboardingSubmitResponseDTOToDomain,
  mapOnboardingDataToDTO,
  mapVerificationStatusDTOToDomain,
} from './auth.mapper';

import type {
  AuthSession,
  LoginCredentials,
  RegisterData,
  User,
  TokenInfo,
  TelegramBotInfo,
  TelegramVerificationStatus,
  OnboardingState,
  OnboardingData,
  VerificationStatus,
} from '../models/domain';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// Token management
function getAccessToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
}

function getRefreshToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
}

function setTokens(accessToken: string, refreshToken: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }
}

function clearTokens(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
}

function setUserData(user: User): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
}

// API helpers
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: 'An unexpected error occurred',
    }));
    throw new Error(error.detail || error.error || error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

function getAuthHeaders(): HeadersInit {
  const token = getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// ============================================
// Authentication Endpoints
// ============================================

/**
 * Login with username/email and password
 */
export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  const response = await fetch(`${API_BASE_URL}/accounts/api/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mapLoginCredentialsToDTO(credentials)),
  });

  const dto = await handleResponse<LoginResponseDTO>(response);
  const session = mapLoginResponseDTOToDomain(dto);

  setTokens(session.accessToken, session.refreshToken);
  setUserData(session.user);

  return session;
}

/**
 * Register a new user
 */
export async function register(data: RegisterData): Promise<AuthSession> {
  const response = await fetch(`${API_BASE_URL}/accounts/api/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mapRegisterDataToDTO(data)),
  });

  const dto = await handleResponse<RegisterResponseDTO>(response);
  const session = mapRegisterResponseDTOToDomain(dto);

  setTokens(session.accessToken, session.refreshToken);
  setUserData(session.user);

  return session;
}

/**
 * Logout the current user
 */
export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();

  try {
    if (refreshToken) {
      await fetch(`${API_BASE_URL}/accounts/api/logout/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ refresh: refreshToken }),
      });
    }
  } finally {
    clearTokens();
  }
}

/**
 * Refresh the access token
 */
export async function refreshToken(): Promise<TokenInfo> {
  const currentRefreshToken = getRefreshToken();

  if (!currentRefreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${API_BASE_URL}/accounts/api/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: currentRefreshToken }),
  });

  const dto = await handleResponse<RefreshTokenResponseDTO>(response);
  const tokens = mapRefreshTokenResponseToDomain(dto);

  setTokens(tokens.accessToken, tokens.refreshToken || currentRefreshToken);

  return tokens;
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/accounts/api/me/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const dto = await handleResponse<UserDTO>(response);
  const user = mapUserDTOToDomain(dto);
  
  setUserData(user);
  
  return user;
}

/**
 * Check if user is authenticated (has valid tokens)
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

/**
 * Get stored user data from localStorage
 */
export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

// ============================================
// Google Authentication
// ============================================

/**
 * Authenticate with Google OAuth token
 */
export async function googleAuth(token: string): Promise<AuthSession & { isNewUser: boolean }> {
  const response = await fetch(`${API_BASE_URL}/accounts/api/google-auth/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  const dto = await handleResponse<GoogleAuthResponseDTO>(response);
  const session = mapGoogleAuthResponseDTOToDomain(dto);

  setTokens(session.accessToken, session.refreshToken);
  setUserData(session.user);

  return session;
}

// ============================================
// Telegram Authentication
// ============================================

/**
 * Get Telegram bot info
 */
export async function getTelegramBotInfo(): Promise<TelegramBotInfo> {
  const response = await fetch(`${API_BASE_URL}/accounts/api/telegram/bot-info/`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const dto = await handleResponse<TelegramBotInfoDTO>(response);
  return mapTelegramBotInfoDTOToDomain(dto);
}

/**
 * Verify Telegram code and authenticate
 */
export async function verifyTelegramCode(code: string): Promise<AuthSession & { isNewUser: boolean }> {
  const response = await fetch(`${API_BASE_URL}/accounts/api/telegram/verify/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });

  const dto = await handleResponse<TelegramVerifyResponseDTO>(response);
  const session = mapTelegramVerifyResponseDTOToDomain(dto);

  setTokens(session.accessToken, session.refreshToken);
  setUserData(session.user);

  return session;
}

/**
 * Check Telegram verification status
 */
export async function checkTelegramStatus(code: string): Promise<TelegramVerificationStatus> {
  const response = await fetch(`${API_BASE_URL}/accounts/api/telegram/check-status/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });

  const dto = await handleResponse<TelegramCheckStatusResponseDTO>(response);
  const status = mapTelegramCheckStatusResponseDTOToDomain(dto);

  if (status.status === 'verified' && status.accessToken && status.refreshToken) {
    setTokens(status.accessToken, status.refreshToken);
    if (status.user) {
      setUserData(status.user);
    }
  }

  return status;
}

// ============================================
// Email Verification
// ============================================

/**
 * Send verification code to user's email
 */
export async function sendVerificationCode(): Promise<{ message: string; expiresInSeconds: number }> {
  const response = await fetch(`${API_BASE_URL}/accounts/api/send-verification-code/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  const dto = await handleResponse<SendVerificationCodeResponseDTO>(response);
  return {
    message: dto.message,
    expiresInSeconds: dto.expires_in_seconds,
  };
}

/**
 * Verify email with 4-digit code
 */
export async function verifyEmailCode(code: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/accounts/api/verify-code/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ code }),
  });

  const dto = await handleResponse<VerifyCodeResponseDTO>(response);
  
  // Refresh user data after verification
  await getCurrentUser();
  
  return { message: dto.message };
}

/**
 * Check email verification status
 */
export async function getVerificationStatus(): Promise<VerificationStatus> {
  const response = await fetch(`${API_BASE_URL}/accounts/api/verification-status/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const dto = await handleResponse<VerificationStatusResponseDTO>(response);
  return mapVerificationStatusDTOToDomain(dto);
}

// ============================================
// Onboarding
// ============================================

/**
 * Get onboarding data and options
 */
export async function getOnboardingData(): Promise<OnboardingState> {
  const response = await fetch(`${API_BASE_URL}/accounts/api/onboarding/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const dto = await handleResponse<OnboardingGetResponseDTO>(response);
  return mapOnboardingGetResponseDTOToDomain(dto);
}

/**
 * Submit onboarding data
 */
export async function submitOnboarding(data: OnboardingData): Promise<{ message: string; user: User }> {
  const response = await fetch(`${API_BASE_URL}/accounts/api/onboarding/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(mapOnboardingDataToDTO(data)),
  });

  const dto = await handleResponse<OnboardingSubmitResponseDTO>(response);
  const result = mapOnboardingSubmitResponseDTOToDomain(dto);
  
  setUserData(result.user);
  
  return result;
}

// Export API client object for compatibility
export const authApi = {
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
};
