'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '../models/domain';
import { authApi } from '../api/auth.api';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    refreshUser: () => Promise<User | null>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check auth status on mount
    useEffect(() => {
        const initAuth = async () => {
            try {
                // First check localStorage for cached user
                const storedUser = authApi.getStoredUser();
                if (storedUser) {
                    setUser(storedUser);
                }

                // Then verify with backend if we have a token
                if (authApi.isAuthenticated()) {
                    const freshUser = await authApi.getCurrentUser();
                    setUser(freshUser);
                }
            } catch (error) {
                // If token is invalid, clear everything
                console.error('Auth initialization error:', error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const refreshUser = useCallback(async (): Promise<User | null> => {
        try {
            if (!authApi.isAuthenticated()) {
                setUser(null);
                return null;
            }

            const freshUser = await authApi.getCurrentUser();
            setUser(freshUser);
            return freshUser;
        } catch (error) {
            console.error('Failed to refresh user:', error);
            setUser(null);
            return null;
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } finally {
            setUser(null);
            router.push('/login');
        }
    }, [router]);

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        refreshUser,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Higher-order component for protected routes
interface ProtectedRouteProps {
    children: ReactNode;
    requireVerified?: boolean;
    requireOnboarding?: boolean;
    allowedRoles?: User['role'][];
}

export function ProtectedRoute({
    children,
    requireVerified = false,
    requireOnboarding = false,
    allowedRoles,
}: ProtectedRouteProps) {
    const router = useRouter();
    const { user, isLoading, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        if (requireVerified && user && !user.isVerified) {
            router.push('/verify-email');
            return;
        }

        if (requireOnboarding && user && !user.onboardingCompleted) {
            router.push('/onboarding');
            return;
        }

        if (allowedRoles && user && !allowedRoles.includes(user.role)) {

                router.push('/dashboard');

        }
    }, [isLoading, isAuthenticated, user, router, requireVerified, requireOnboarding, allowedRoles]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-12 h-12">
                        <div className="absolute inset-0 rounded-full border-4 border-primary-200 dark:border-primary-900" />
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 animate-spin" />
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    if (requireVerified && user && !user.isVerified) {
        return null;
    }

    if (requireOnboarding && user && !user.onboardingCompleted) {
        return null;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return null;
    }

    return <>{children}</>;
}
