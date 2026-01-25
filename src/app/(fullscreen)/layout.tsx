'use client';

/**
 * Fullscreen Layout - Layout without sidebar/navbar for exam/practice pages
 * Uses route group (fullscreen) to bypass dashboard layout
 */

import { useAuth } from '@/domains/auth/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface FullscreenLayoutProps {
    children: React.ReactNode;
}

export default function FullscreenLayout({ children }: FullscreenLayoutProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-900">
            {children}
        </div>
    );
}
